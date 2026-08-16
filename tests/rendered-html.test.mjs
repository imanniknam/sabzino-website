import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the branded Sabzino storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>سبزینو \| چشیدن طعم‌های جهان<\/title>/);
  assert.match(html, /استارتاپ کارآفرینی اجتماعی/);
  assert.match(html, /سه دنیای سبزینو/);
  assert.match(html, /گوجه خشک/);
  assert.match(html, /شنبلیله خشک/);
  assert.match(html, /<details class="mobile-menu-shell">/);
  assert.match(html, /trustseal\.enamad\.ir\/\?id=774806/);
  assert.match(html, /3KBPAZZpPuIcNtTCD9Xb0TRzzSoTlHEB/);
  assert.doesNotMatch(html, /ارسال رایگان برای سفارش/);
});

test("keeps customer, cooperation and checkout forms implemented", async () => {
  const [auth, inquiry, checkout, ordersApi, storefront, payment, callback, api, adminAuth] = await Promise.all([
    readFile(new URL("../app/customer-auth/CustomerAuth.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/InquiryForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/checkout/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/orders/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/zarinpal.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/payment/callback/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/api.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/admin-auth.ts", import.meta.url), "utf8"),
  ]);
  assert.match(auth, /ایمیل اختیاری است/);
  assert.match(auth, /name="password"/);
  assert.match(inquiry, /api\/inquiries/);
  assert.match(inquiry, /ثبت درخواست همکاری/);
  assert.match(checkout, /اطلاعات گیرنده/);
  assert.match(checkout, /۶۹٬۰۰۰ تومان/);
  assert.doesNotMatch(checkout, /subtotal >= 800000/);
  assert.match(ordersApi, /shippingMethod === "express" \? 99000 : 69000/);
  assert.match(storefront, /هزینه ارسال رایگان نیست/);
  assert.doesNotMatch(storefront, /setMenuOpen/);
  assert.match(checkout, /window\.location\.assign\(data\.paymentUrl\)/);
  assert.doesNotMatch(checkout, /localStorage\.removeItem\("sabzino-cart"\)/);
  assert.match(ordersApi, /requestZarinpalPayment/);
  assert.match(ordersApi, /offset \+= 8/);
  assert.match(payment, /payment\.zarinpal\.com\/pg\/v4\/payment\/request\.json/);
  assert.match(payment, /amountToman \* 10/);
  assert.match(callback, /verifyZarinpalPayment/);
  assert.match(callback, /paymentStatus: "paid"/);
  assert.doesNotMatch(api, /error\.message/);
  assert.match(adminAuth, /hasProxyOrigin/);
  assert.doesNotMatch(adminAuth, /getChatGPTUser/);
  assert.doesNotMatch(payment, /https:\/\/sabzinow\.ir/);
});

test("server-renders public pages and keeps essential navigation independent of hydration", async () => {
  const [homeResponse, aboutResponse, cooperateResponse, contactResponse] = await Promise.all([
    render("/"), render("/about"), render("/cooperate"), render("/contact"),
  ]);
  for (const response of [homeResponse, aboutResponse, cooperateResponse, contactResponse]) {
    assert.equal(response.status, 200);
  }
  const [home, about, cooperate, contact] = await Promise.all([
    homeResponse.text(), aboutResponse.text(), cooperateResponse.text(), contactResponse.text(),
  ]);
  assert.match(home, /<a[^>]+href="\/about"[^>]*>/);
  assert.match(home, /<a[^>]+href="\/cooperate"[^>]*>/);
  assert.match(home, /<a[^>]+href="\/contact"[^>]*>/);
  assert.match(home, /class="brand-logo/);
  assert.match(home, /href="\/?\?category=dried#product-dried-pepper"/);
  assert.match(home, /id="product-dried-pepper"/);
  assert.match(home, /href="\/#spice-IN"/);
  assert.match(home, /id="spice-IN"/);
  assert.match(about, /از دنیای سبزیجات تا چشیدن طعم‌های جهان/);
  assert.match(about, /trustseal\.enamad\.ir\/logo\.aspx\?id=774806/);
  assert.match(cooperate, /فرم همکاری/);
  assert.match(contact, /ارتباط با ما/);
});
