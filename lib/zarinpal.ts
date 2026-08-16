import { env } from "cloudflare:workers";

const REQUEST_URL = "https://payment.zarinpal.com/pg/v4/payment/request.json";
const VERIFY_URL = "https://payment.zarinpal.com/pg/v4/payment/verify.json";
const START_PAY_URL = "https://payment.zarinpal.com/pg/StartPay/";

type GatewayPayload = {
  data?: {
    code?: number;
    authority?: string;
    ref_id?: number | string;
    card_pan?: string;
    message?: string;
  };
  errors?: { code?: number; message?: string } | Array<{ code?: number; message?: string }>;
};

export class PaymentGatewayError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "PaymentGatewayError";
    this.code = code;
  }
}

function runtimeConfig() {
  const runtimeEnv = env as typeof env & { ZARINPAL_MERCHANT_ID?: string; PUBLIC_SITE_URL?: string };
  const merchantId = runtimeEnv.ZARINPAL_MERCHANT_ID?.trim() || "";
  const configuredSiteUrl = runtimeEnv.PUBLIC_SITE_URL?.trim() || "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(merchantId)) {
    throw new PaymentGatewayError("تنظیمات درگاه پرداخت کامل نیست.");
  }
  let parsedSiteUrl: URL;
  try {
    parsedSiteUrl = new URL(configuredSiteUrl);
  } catch {
    throw new PaymentGatewayError("آدرس امن بازگشت درگاه تنظیم نشده است.");
  }
  const isLocal = parsedSiteUrl.hostname === "localhost" || parsedSiteUrl.hostname === "127.0.0.1" || parsedSiteUrl.hostname === "::1";
  if (parsedSiteUrl.protocol !== "https:" && !isLocal) throw new PaymentGatewayError("آدرس بازگشت درگاه باید HTTPS باشد.");
  return { merchantId, siteUrl: parsedSiteUrl.origin };
}

function errorDetails(payload: GatewayPayload) {
  const error = Array.isArray(payload.errors) ? payload.errors[0] : payload.errors;
  return { code: error?.code, message: error?.message };
}

async function postGateway(url: string, body: object) {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new PaymentGatewayError("ارتباط با درگاه پرداخت برقرار نشد. لطفاً دوباره تلاش کنید.");
  }

  const payload = await response.json().catch(() => ({})) as GatewayPayload;
  if (!response.ok) {
    const details = errorDetails(payload);
    throw new PaymentGatewayError("درگاه پرداخت درخواست را نپذیرفت. لطفاً دوباره تلاش کنید.", details.code);
  }
  return payload;
}

export async function requestZarinpalPayment(input: {
  amountToman: number;
  orderId: string;
  orderNumber: string;
  mobile: string;
}) {
  const { merchantId, siteUrl } = runtimeConfig();
  const amountRial = input.amountToman * 10;
  const callbackUrl = `${siteUrl}/payment/callback?order=${encodeURIComponent(input.orderId)}`;
  const payload = await postGateway(REQUEST_URL, {
    merchant_id: merchantId,
    amount: amountRial,
    currency: "IRR",
    callback_url: callbackUrl,
    description: `پرداخت سفارش ${input.orderNumber} سبزینو`,
    metadata: { mobile: input.mobile, order_id: input.orderNumber },
  });
  if (payload.data?.code !== 100 || !payload.data.authority) {
    const details = errorDetails(payload);
    throw new PaymentGatewayError("امکان ایجاد پرداخت وجود ندارد. لطفاً دوباره تلاش کنید.", details.code ?? payload.data?.code);
  }
  return {
    authority: payload.data.authority,
    paymentUrl: `${START_PAY_URL}${encodeURIComponent(payload.data.authority)}`,
  };
}

export async function verifyZarinpalPayment(input: { amountToman: number; authority: string }) {
  const { merchantId } = runtimeConfig();
  const payload = await postGateway(VERIFY_URL, {
    merchant_id: merchantId,
    amount: input.amountToman * 10,
    authority: input.authority,
  });
  const code = payload.data?.code;
  if (code !== 100 && code !== 101) {
    const details = errorDetails(payload);
    throw new PaymentGatewayError("تأیید تراکنش از سمت درگاه انجام نشد.", details.code ?? code);
  }
  return {
    code,
    refId: payload.data?.ref_id ? String(payload.data.ref_id) : "",
    cardPan: payload.data?.card_pan || "",
  };
}
