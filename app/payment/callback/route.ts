import { and, eq, ne, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { orders } from "../../../db/schema";
import { PaymentGatewayError, verifyZarinpalPayment } from "../../../lib/zarinpal";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

function resultPage(input: { success: boolean; title: string; message: string; orderNumber?: string; refId?: string }) {
  const order = input.orderNumber ? `<div class="receipt"><span>شماره سفارش</span><b>${escapeHtml(input.orderNumber)}</b>${input.refId ? `<span>شماره پیگیری بانکی</span><b>${escapeHtml(input.refId)}</b>` : ""}</div>` : "";
  const clearCart = input.success ? `<script>try{localStorage.removeItem("sabzino-cart")}catch(e){}</script>` : "";
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(input.title)} | سبزینو</title><style>@font-face{font-family:Vazir;src:url('/_next/static/media/vazirmatn-arabic-wght-normal.woff2')}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#f3e6cc;color:#0f1f17;font-family:Vazir,Tahoma,sans-serif}.card{width:min(100%,620px);background:#fffdf7;border:1px solid #d8cbb1;border-radius:28px;padding:clamp(28px,7vw,56px);text-align:center;box-shadow:0 28px 80px #0f1f1720}.mark{width:78px;height:78px;margin:auto;display:grid;place-items:center;border-radius:50%;font-size:38px;font-weight:900;background:${input.success ? "#dfeccc;color:#1a5a38" : "#f4d9d8;color:#9a3445"}}h1{font-size:clamp(28px,6vw,42px);margin:22px 0 10px}p{font-size:17px;line-height:2;color:#53665b;margin:0 auto 24px}.receipt{display:grid;grid-template-columns:1fr auto;gap:12px 18px;align-items:center;text-align:right;background:#f7f3e8;border-radius:18px;padding:20px;margin:24px 0}.receipt b{text-align:left;direction:ltr;color:#173d2b}a{min-height:54px;padding:0 28px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#0f1f17;color:white;text-decoration:none;font-weight:850}@media(max-width:480px){body{padding:14px}.card{padding:28px 18px;border-radius:22px}.receipt{grid-template-columns:1fr}}</style></head><body><main class="card"><div class="mark">${input.success ? "✓" : "×"}</div><h1>${escapeHtml(input.title)}</h1><p>${escapeHtml(input.message)}</p>${order}<a href="/">بازگشت به فروشگاه سبزینو</a></main>${clearCart}</body></html>`;
}

function htmlResponse(html: string) {
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order")?.trim() || "";
  const authority = url.searchParams.get("Authority")?.trim() || "";
  const status = url.searchParams.get("Status")?.trim().toUpperCase() || "";
  if (!orderId || !authority) return htmlResponse(resultPage({ success: false, title: "اطلاعات پرداخت ناقص است", message: "شناسه سفارش یا تراکنش در پاسخ درگاه موجود نیست." }));

  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || !order.paymentAuthority || order.paymentAuthority !== authority) return htmlResponse(resultPage({ success: false, title: "تراکنش معتبر نیست", message: "این تراکنش با سفارش ثبت‌شده در سبزینو تطابق ندارد." }));

  if (order.paymentStatus === "paid") return htmlResponse(resultPage({ success: true, title: "پرداخت قبلاً تأیید شده است", message: "سفارش شما با موفقیت ثبت و پرداخت شده است.", orderNumber: order.orderNumber, refId: order.paymentRefId || undefined }));

  if (status !== "OK") {
    await db.update(orders).set({ paymentStatus: "failed", updatedAt: sql`CURRENT_TIMESTAMP` }).where(and(eq(orders.id, order.id), ne(orders.paymentStatus, "paid")));
    return htmlResponse(resultPage({ success: false, title: "پرداخت انجام نشد", message: "پرداخت لغو شد یا از سمت بانک ناموفق بود. سبد خرید شما حفظ شده و می‌توانید دوباره تلاش کنید.", orderNumber: order.orderNumber }));
  }

  try {
    const verified = await verifyZarinpalPayment({ amountToman: order.total, authority });
    await db.update(orders).set({ paymentStatus: "paid", status: "processing", paymentRefId: verified.refId || order.paymentRefId, paymentCardPan: verified.cardPan || order.paymentCardPan, paidAt: sql`CURRENT_TIMESTAMP`, updatedAt: sql`CURRENT_TIMESTAMP` }).where(and(eq(orders.id, order.id), ne(orders.paymentStatus, "paid")));
    return htmlResponse(resultPage({ success: true, title: "پرداخت با موفقیت انجام شد", message: "سفارش شما تأیید شد و برای آماده‌سازی در اختیار تیم سبزینو قرار گرفت.", orderNumber: order.orderNumber, refId: verified.refId || order.paymentRefId || undefined }));
  } catch (error) {
    const code = error instanceof PaymentGatewayError ? error.code : undefined;
    console.error("Zarinpal payment verification failed", { orderId: order.id, code });
    await db.update(orders).set({ paymentStatus: "failed", updatedAt: sql`CURRENT_TIMESTAMP` }).where(and(eq(orders.id, order.id), ne(orders.paymentStatus, "paid")));
    return htmlResponse(resultPage({ success: false, title: "تأیید پرداخت انجام نشد", message: "اگر مبلغ از حساب شما کسر شده است، شماره سفارش را نگه دارید و با پشتیبانی سبزینو تماس بگیرید.", orderNumber: order.orderNumber }));
  }
}
