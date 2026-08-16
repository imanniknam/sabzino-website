"use client";

import { FormEvent, useState } from "react";
import BrandLogo from "../components/BrandLogo";

type Profile = {
  id: string; email: string | null; fullName: string; phone: string; province: string;
  city: string; address: string; postalCode: string; unit: string;
};
type Order = {
  id: string; orderNumber: string; status: string; paymentStatus: string; total: number;
  createdAt: string; shippingMethod: string;
  items: Array<{ id: number; productName: string; quantity: number; lineTotal: number }>;
};

const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const statusLabel: Record<string, string> = {
  pending_payment: "در انتظار پرداخت", paid: "پرداخت‌شده", processing: "در حال آماده‌سازی",
  shipped: "ارسال‌شده", delivered: "تحویل‌شده", cancelled: "لغوشده",
};

export default function AccountDashboard({ profile: initialProfile, orders }: { profile: Profile; orders: Order[] }) {
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json() as { profile?: Profile; error?: string };
      if (!response.ok || !result.profile) throw new Error(result.error || "ذخیره اطلاعات انجام نشد.");
      setProfile(result.profile);
      setMessage("اطلاعات حساب با موفقیت ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره اطلاعات انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await fetch("/api/customer-auth", { method: "DELETE" });
    window.location.href = "/";
  }

  return <main className="account-page" dir="rtl">
    <header className="account-header">
      <a href="/" aria-label="فروشگاه سبزینو"><BrandLogo priority/></a>
      <nav><a href="/#shop">فروشگاه</a><a href="/checkout">سبد و ثبت سفارش</a><button className="account-signout" onClick={signOut}>خروج از حساب</button></nav>
    </header>
    <section className="account-hero">
      <div><span>باشگاه مشتریان سبزینو</span><h1>سلام، {profile.fullName || profile.phone || profile.email?.split("@")[0]}</h1><p>اینجا می‌توانید آدرس پیش‌فرض را نگه دارید و وضعیت سفارش‌هایتان را دنبال کنید.</p></div>
      <div className="account-avatar">{(profile.fullName || profile.phone || profile.email || "س").slice(0, 1).toUpperCase()}</div>
    </section>
    <div className="account-shell">
      <aside className="account-sidebar">
        <div><small>حساب متصل</small><strong>{profile.email || profile.phone}</strong></div>
        <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}><span>۱</span> پروفایل و آدرس</button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}><span>{money(orders.length)}</span> سفارش‌های من</button>
      </aside>
      <section className="account-content">
        {activeTab === "profile" ? <>
          <div className="account-title"><div><small>اطلاعات شخصی</small><h2>پروفایل و آدرس پیش‌فرض</h2></div><p>اطلاعات تماس و نشانی پیش‌فرض خود را امن و یک‌جا نگه دارید.</p></div>
          <form className="profile-form" onSubmit={saveProfile}>
            <label><span>نام و نام خانوادگی</span><input name="fullName" defaultValue={profile.fullName} autoComplete="name" placeholder="نام کامل"/></label>
            <label><span>شماره همراه</span><input name="phone" defaultValue={profile.phone} inputMode="tel" autoComplete="tel" placeholder="۰۹۱۲۱۲۳۴۵۶۷"/></label>
            <label><span>استان</span><input name="province" defaultValue={profile.province} autoComplete="address-level1" placeholder="مثلاً تهران"/></label>
            <label><span>شهر</span><input name="city" defaultValue={profile.city} autoComplete="address-level2" placeholder="نام شهر"/></label>
            <label className="wide"><span>نشانی کامل</span><textarea name="address" defaultValue={profile.address} autoComplete="street-address" rows={4} placeholder="خیابان، کوچه و پلاک"/></label>
            <label><span>کد پستی</span><input name="postalCode" defaultValue={profile.postalCode} inputMode="numeric" placeholder="کد پستی ۱۰ رقمی"/></label>
            <label><span>پلاک / واحد</span><input name="unit" defaultValue={profile.unit} placeholder="مثلاً پلاک ۱۲، واحد ۳"/></label>
            <div className="profile-actions"><button disabled={saving}>{saving ? "در حال ذخیره…" : "ذخیره تغییرات"}</button>{message && <p role="status">{message}</p>}</div>
          </form>
        </> : <>
          <div className="account-title"><div><small>تاریخچه خرید</small><h2>سفارش‌های من</h2></div><p>وضعیت سفارش‌های ثبت‌شده با همین حساب را اینجا می‌بینید.</p></div>
          <div className="orders-list">{orders.length ? orders.map(order => <article key={order.id}>
            <header><div><small>شماره سفارش</small><strong>{order.orderNumber}</strong></div><span className={`order-status status-${order.status}`}>{statusLabel[order.status] || order.status}</span></header>
            <div className="order-meta"><span>تاریخ ثبت <b>{new Date(order.createdAt).toLocaleDateString("fa-IR")}</b></span><span>مبلغ <b>{money(order.total)} تومان</b></span><span>ارسال <b>{order.shippingMethod === "express" ? "سریع" : "استاندارد"}</b></span></div>
            <ul>{order.items.map(item => <li key={item.id}><span>{item.productName} <small>× {money(item.quantity)}</small></span><b>{money(item.lineTotal)} تومان</b></li>)}</ul>
          </article>) : <div className="empty-orders"><span>۰</span><h3>هنوز سفارشی ندارید</h3><p>اولین طعم تازه‌تان را از فروشگاه سبزینو انتخاب کنید.</p><a href="/#shop">مشاهده محصولات</a></div>}</div>
        </>}
      </section>
    </div>
  </main>;
}
