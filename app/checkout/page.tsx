"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { catalog } from "../../lib/catalog";
import BrandLogo from "../components/BrandLogo";
import "./checkout.css";

const initialProducts = catalog.map(product => ({ id: product.id, name: product.name, price: product.price, image: product.image }));

const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);

function ArrowIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>; }
function LockIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>; }
function CheckIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>; }
function TruckIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>; }

export default function CheckoutPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Array<{ id: string; name: string; price: number; image: string }>>(initialProducts);
  const [loaded, setLoaded] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("sabzino-cart") || "{}")); } catch { setCart({}); }
    fetch("/api/products", { cache: "no-store" }).then(response => response.ok ? response.json() : Promise.reject()).then((data: { products?: Array<{ id: string; name: string; price: number; image: string }> }) => { if (Array.isArray(data.products)) setProducts(data.products); }).catch(() => undefined).finally(() => setLoaded(true));
  }, []);

  const items = useMemo(() => products.filter(p => cart[p.id]).map(p => ({ ...p, quantity: cart[p.id] })), [cart, products]);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingMethod === "express" ? 99000 : 69000;
  const total = subtotal + shipping;

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    setSubmitting(true);
    setSubmitError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: { fullName: form.get("fullName"), phone: form.get("phone"), province: form.get("province"), city: form.get("city"), address: form.get("address"), postalCode: form.get("postalCode"), unit: form.get("unit"), note: form.get("note") }, shippingMethod, items: items.map(item => ({ productId: item.id, quantity: item.quantity })) }) });
      const data = await response.json() as { order?: { orderNumber: string; total: number }; paymentUrl?: string; error?: string };
      if (!response.ok || !data.order || !data.paymentUrl) throw new Error(data.error || "اتصال به درگاه پرداخت انجام نشد.");
      window.location.assign(data.paymentUrl);
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "ثبت سفارش انجام نشد."); }
    finally { setSubmitting(false); }
  }

  if (!loaded) return <main className="checkout-loading" dir="rtl">در حال آماده‌سازی سفارش…</main>;

  if (!items.length) return <main className="empty-checkout" dir="rtl"><BrandLogo priority/><h1>سبد خرید شما خالی است</h1><p>برای ادامه ثبت سفارش، ابتدا یک طعم خوشمزه انتخاب کنید.</p><a href="/#shop">مشاهده محصولات</a></main>;

  return <main className="checkout-page" dir="rtl">
    <header className="checkout-header"><a href="/" aria-label="بازگشت به سبزینو"><BrandLogo priority/></a><div className="checkout-steps"><span className="done"><b><CheckIcon/></b>سبد خرید</span><i></i><span className="active"><b>۲</b>اطلاعات و پرداخت</span><i></i><span><b>۳</b>تأیید سفارش</span></div><div className="secure"><LockIcon/> پرداخت امن</div></header>

    <div className="checkout-intro"><a href="/" className="back-link"><ArrowIcon/> بازگشت به فروشگاه</a><span>تکمیل خرید</span><h1>سفارش‌تان را نهایی کنید</h1><p>اطلاعات تحویل را وارد کنید؛ یک قدم تا چشیدن طعم‌های تازه باقی مانده است.</p></div>

    <form className="checkout-layout" onSubmit={submitOrder}>
      <div className="checkout-form">
        <section className="form-card"><div className="form-title"><b>۱</b><div><h2>اطلاعات گیرنده</h2><p>اطلاعات فردی که سفارش را تحویل می‌گیرد.</p></div></div><div className="field-grid"><label><span>نام و نام خانوادگی *</span><input name="fullName" required autoComplete="name" placeholder="مثلاً سارا احمدی"/></label><label><span>شماره همراه *</span><input name="phone" required inputMode="tel" autoComplete="tel" pattern="09[0-9]{9}" placeholder="۰۹۱۲۱۲۳۴۵۶۷" dir="rtl"/></label><label><span>استان *</span><select name="province" required defaultValue=""><option value="" disabled>انتخاب استان</option><option>تهران</option><option>البرز</option><option>اصفهان</option><option>فارس</option><option>گیلان</option><option>مازندران</option><option>سایر استان‌ها</option></select></label><label><span>شهر *</span><input name="city" required autoComplete="address-level2" placeholder="نام شهر"/></label><label className="full"><span>نشانی کامل *</span><textarea name="address" required autoComplete="street-address" rows={3} placeholder="خیابان، کوچه، پلاک و واحد"></textarea></label><label><span>کد پستی *</span><input name="postalCode" required inputMode="numeric" pattern="[0-9۰-۹]{10}" placeholder="کد پستی ۱۰ رقمی"/></label><label><span>پلاک / واحد</span><input name="unit" placeholder="مثلاً پلاک ۱۲، واحد ۳"/></label></div></section>

        <section className="form-card"><div className="form-title"><b>۲</b><div><h2>شیوه ارسال</h2><p>زمان مناسب تحویل سفارش را انتخاب کنید.</p></div></div><div className="option-list"><label className={shippingMethod === "standard" ? "selected" : ""}><input type="radio" name="shipping" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")}/><span className="option-icon"><TruckIcon/></span><span><b>ارسال استاندارد</b><small>تحویل بین ۲ تا ۴ روز کاری</small></span><strong>۶۹٬۰۰۰ تومان</strong></label><label className={shippingMethod === "express" ? "selected" : ""}><input type="radio" name="shipping" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")}/><span className="option-icon"><TruckIcon/></span><span><b>ارسال سریع</b><small>تحویل در اولین بازه ممکن</small></span><strong>۹۹٬۰۰۰ تومان</strong></label></div></section>

        <section className="form-card"><div className="form-title"><b>۳</b><div><h2>روش پرداخت</h2><p>تراکنش شما در محیط امن انجام می‌شود.</p></div></div><div className="online-payment"><span className="option-icon"><LockIcon/></span><span><b>پرداخت آنلاین امن</b><small>پس از ثبت سفارش به درگاه بانکی منتقل می‌شوید.</small></span><i><CheckIcon/> فعال</i></div><label className="order-note"><span>یادداشت سفارش (اختیاری)</span><textarea name="note" rows={2} placeholder="اگر توضیحی برای تحویل سفارش دارید بنویسید."></textarea></label></section>
      </div>

      <aside className="order-summary"><div className="summary-head"><div><h2>خلاصه سفارش</h2><span>{money(items.reduce((s,i) => s + i.quantity,0))} کالا</span></div><a href="/">ویرایش سبد</a></div><div className="summary-items">{items.map(item => <article key={item.id}><div><Image src={item.image} alt={item.name} fill sizes="76px"/><b>{money(item.quantity)}</b></div><span><strong>{item.name}</strong><small>تعداد {money(item.quantity)}</small></span><em>{money(item.price * item.quantity)} تومان</em></article>)}</div><div className="summary-cost"><p><span>جمع محصولات</span><b>{money(subtotal)} تومان</b></p><p><span>هزینه ارسال</span><b>{money(shipping)} تومان</b></p><p className="grand-total"><span>مبلغ قابل پرداخت</span><strong>{money(total)} <small>تومان</small></strong></p></div>{submitError && <p className="submit-error" role="alert">{submitError}</p>}<button type="submit" disabled={submitting}>{submitting ? "در حال اتصال به درگاه…" : "ثبت و پرداخت سفارش"} <LockIcon/></button><div className="summary-trust"><span><CheckIcon/> پرداخت امن</span><span><CheckIcon/> تضمین کیفیت</span><span><CheckIcon/> پشتیبانی سفارش</span></div></aside>
    </form>
  </main>;
}
