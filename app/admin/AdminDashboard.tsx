"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import BrandLogo from "../components/BrandLogo";

type Product = { id: string; name: string; category: string; description: string; image: string; price: number; stock: number; isActive: boolean };
type Order = { id: string; orderNumber: string; fullName: string; phone: string; city: string; total: number; status: string; paymentStatus: string; createdAt: string };
type Subscriber = { id: number; email: string; status: string; createdAt: string };
type DashboardData = { orders: Order[]; products: Product[]; subscribers: Subscriber[]; stats: { orders: number; revenue: number; lowStock: number; subscribers: number } };
type Tab = "overview" | "orders" | "products" | "subscribers" | "settings";

const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const orderStatuses: Record<string, string> = { pending_payment: "در انتظار پرداخت", processing: "در حال پردازش", packed: "بسته‌بندی‌شده", shipped: "ارسال‌شده", delivered: "تحویل‌شده", cancelled: "لغوشده" };
const paymentStatuses: Record<string, string> = { pending: "پرداخت‌نشده", paid: "پرداخت‌شده", failed: "ناموفق", refunded: "بازگشت وجه" };
const images = Array.from({ length: 13 }, (_, index) => `/images/product-${index + 1}.webp`);

function Icon({ name }: { name: "home" | "orders" | "products" | "users" | "refresh" | "settings" | "plus" | "logout" }) {
  const paths = { home: <><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>, orders: <><path d="M6 3h12l2 18H4L6 3Z"/><path d="M9 7h6M8 12h8M8 16h5"/></>, products: <><path d="m4 8 8-4 8 4-8 4-8-4Z"/><path d="m4 8 8 4 8-4v8l-8 4-8-4V8Z"/></>, users: <><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M16 4a4 4 0 0 1 0 8M18 15c3 .8 4 3 4 6"/></>, refresh: <><path d="M20 7V3h-4M4 17v4h4"/><path d="M19 11a7 7 0 0 0-12-5L4 9M5 13a7 7 0 0 0 12 5l3-3"/></>, settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-3.6v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 0-1.8-1.2H3v-3.6h.2A2 2 0 0 0 5 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6a2 2 0 0 0 1.2-1.8V3h3.6v.2A2 2 0 0 0 15 5a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1A2 2 0 0 0 19.4 9a2 2 0 0 0 1.8 1.2h.2v3.6h-.2A2 2 0 0 0 19.4 15Z"/></>, plus: <path d="M12 5v14M5 12h14"/>, logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h7v18h-7"/></> };
  return <svg aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

export default function AdminDashboard({ adminName }: { adminName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await fetch("/api/admin/dashboard", { cache: "no-store" }); if (response.status === 401) { window.location.href = "/admin/login"; return; } const result = await response.json(); if (!response.ok) throw new Error(result.error); setData(result); } catch (e) { setError(e instanceof Error ? e.message : "دریافت اطلاعات ناموفق بود."); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const filteredOrders = useMemo(() => data?.orders.filter(order => `${order.orderNumber} ${order.fullName} ${order.phone}`.includes(search)) || [], [data, search]);

  async function mutate(url: string, method: string, body: object, key: string, success: string) { setSaving(key); setError(""); setNotice(""); try { const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (response.status === 401) { window.location.href = "/admin/login"; return false; } const result = await response.json(); if (!response.ok) throw new Error(result.error); await load(); setNotice(success); return true; } catch (e) { setError(e instanceof Error ? e.message : "ذخیره تغییرات ناموفق بود."); return false; } finally { setSaving(""); } }
  async function logout() { await fetch("/api/admin/auth", { method: "DELETE" }); window.location.href = "/admin/login"; }
  const title = { overview: "نمای کلی", orders: "مدیریت سفارش‌ها", products: "محصولات و موجودی", subscribers: "اعضای خبرنامه", settings: "امنیت و حساب مدیر" }[tab];

  return <main className="admin-shell" dir="rtl">
    <aside className="admin-sidebar"><div className="admin-logo"><BrandLogo className="brand-logo--light"/><span>پنل مدیریت</span></div><nav><NavButton tab="overview" current={tab} setTab={setTab} icon="home" label="نمای کلی"/><NavButton tab="orders" current={tab} setTab={setTab} icon="orders" label="سفارش‌ها" count={data?.orders.length}/><NavButton tab="products" current={tab} setTab={setTab} icon="products" label="محصولات"/><NavButton tab="subscribers" current={tab} setTab={setTab} icon="users" label="خبرنامه"/><NavButton tab="settings" current={tab} setTab={setTab} icon="settings" label="تنظیمات ورود"/></nav><div className="admin-user"><span>{adminName.slice(0,1)}</span><div><b>{adminName}</b><small>مدیر سبزینو</small></div><button onClick={logout} aria-label="خروج از پنل"><Icon name="logout"/></button></div></aside>
    <section className="admin-content"><header><div><small>مدیریت فروشگاه</small><h1>{title}</h1></div><div className="header-actions">{tab === "products" && <button className="add-product-button" onClick={() => setAddOpen(true)}><Icon name="plus"/> افزودن محصول</button>}<button onClick={load} disabled={loading}><Icon name="refresh"/> تازه‌سازی</button></div></header>{error && <div className="admin-error" role="alert">{error}</div>}{notice && <div className="admin-notice" role="status">{notice}</div>}{loading && !data ? <div className="admin-loading">در حال دریافت اطلاعات…</div> : data && <>
      {tab === "overview" && <><div className="stat-grid"><Stat label="کل سفارش‌ها" value={money(data.stats.orders)} note="سفارش ثبت‌شده"/><Stat label="ارزش سفارش‌ها" value={money(data.stats.revenue)} note="تومان"/><Stat label="کمبود موجودی" value={money(data.stats.lowStock)} note="محصول با موجودی ۵ یا کمتر" attention={Boolean(data.stats.lowStock)}/><Stat label="اعضای خبرنامه" value={money(data.stats.subscribers)} note="عضو فعال"/></div><section className="panel full-panel"><div className="panel-head"><h2>آخرین سفارش‌ها</h2><button onClick={() => setTab("orders")}>مشاهده همه</button></div><OrderTable orders={data.orders.slice(0,8)} mutate={mutate} saving={saving}/></section></>}
      {tab === "orders" && <section className="panel full-panel"><div className="panel-toolbar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="جست‌وجوی شماره سفارش، نام یا موبایل"/><span>{money(filteredOrders.length)} سفارش</span></div><OrderTable orders={filteredOrders} mutate={mutate} saving={saving}/></section>}
      {tab === "products" && <section className="product-admin-grid">{data.products.map(product => <ProductCard key={product.id} product={product} mutate={mutate} saving={saving}/>)}</section>}
      {tab === "subscribers" && <section className="panel full-panel"><table className="admin-table"><thead><tr><th>ایمیل</th><th>تاریخ عضویت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{data.subscribers.map(item => <tr key={item.id}><td dir="ltr">{item.email}</td><td>{new Date(item.createdAt).toLocaleDateString("fa-IR")}</td><td><span className={`status ${item.status}`}>{item.status === "active" ? "فعال" : "لغوشده"}</span></td><td><button className="table-action" onClick={() => mutate("/api/admin/newsletter", "PATCH", { id: item.id, status: item.status === "active" ? "unsubscribed" : "active" }, `sub-${item.id}`, "وضعیت عضویت تغییر کرد.")}>{item.status === "active" ? "لغو عضویت" : "فعال‌سازی"}</button></td></tr>)}</tbody></table></section>}
      {tab === "settings" && <SettingsForm adminName={adminName}/>}</>}
    </section>
    {addOpen && <ProductModal saving={saving} close={() => setAddOpen(false)} submit={mutate}/>}
  </main>;
}

function NavButton({ tab, current, setTab, icon, label, count }: { tab: Tab; current: Tab; setTab:(tab:Tab)=>void; icon:"home"|"orders"|"products"|"users"|"settings"; label:string; count?:number }) { return <button className={current === tab ? "active" : ""} onClick={() => setTab(tab)}><Icon name={icon}/>{label}{count !== undefined && <b>{count}</b>}</button>; }
function Stat({ label, value, note, attention }: { label:string; value:string; note:string; attention?:boolean }) { return <article className={attention ? "attention" : ""}><small>{label}</small><strong>{value}</strong><span>{note}</span></article>; }

function OrderTable({ orders, mutate, saving }: { orders:Order[]; mutate:(u:string,m:string,b:object,k:string,s:string)=>Promise<boolean>; saving:string }) { return <div className="table-wrap"><table className="admin-table"><thead><tr><th>سفارش</th><th>مشتری</th><th>مبلغ</th><th>پرداخت</th><th>وضعیت</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><b>{order.orderNumber}</b><small>{new Date(order.createdAt).toLocaleDateString("fa-IR")}</small></td><td><b>{order.fullName}</b><small>{order.phone} · {order.city}</small></td><td>{money(order.total)} تومان</td><td><select value={order.paymentStatus} disabled={saving === order.id} onChange={e => void mutate("/api/admin/orders", "PATCH", { id: order.id, paymentStatus: e.target.value }, order.id, "وضعیت پرداخت تغییر کرد.")}>{Object.entries(paymentStatuses).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></td><td><select value={order.status} disabled={saving === order.id} onChange={e => void mutate("/api/admin/orders", "PATCH", { id: order.id, status: e.target.value }, order.id, "وضعیت سفارش تغییر کرد.")}>{Object.entries(orderStatuses).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></td></tr>)}</tbody></table>{!orders.length && <p className="all-good">سفارشی پیدا نشد.</p>}</div>; }

function ProductCard({ product, mutate, saving }: { product:Product; mutate:(u:string,m:string,b:object,k:string,s:string)=>Promise<boolean>; saving:string }) {
  const [draft, setDraft] = useState(product);
  function field<K extends keyof Product>(key: K, value: Product[K]) { setDraft(current => ({ ...current, [key]: value })); }
  async function remove() { if (!window.confirm(`محصول «${product.name}» از فروشگاه حذف شود؟`)) return; await mutate("/api/admin/products", "DELETE", { id: product.id }, product.id, "محصول از فروشگاه حذف شد."); }
  return <article className="admin-product"><div className="admin-product-image"><Image src={draft.image} alt={draft.name} fill sizes="240px"/><span className={draft.isActive ? "live" : "off"}>{draft.isActive ? "فعال" : "غیرفعال"}</span></div><div><label>نام محصول<input value={draft.name} onChange={e => field("name",e.target.value)}/></label><label>دسته‌بندی<select value={draft.category} onChange={e => field("category",e.target.value)}><option>سبزی‌های خشک</option><option>سبزیجات آماده</option><option>چاشنی‌ها و سس‌ها</option><option>ادویه‌های جهان</option><option>نوشیدنی‌های طبیعی</option></select></label><label>توضیح کوتاه<textarea rows={2} value={draft.description} onChange={e => field("description",e.target.value)}/></label><div className="split-fields"><label>قیمت (تومان)<input type="number" min="0" value={draft.price} onChange={e => field("price",Number(e.target.value))}/></label><label>موجودی<input type="number" min="0" value={draft.stock} onChange={e => field("stock",Number(e.target.value))}/></label></div><label className="switch"><input type="checkbox" checked={draft.isActive} onChange={e => field("isActive",e.target.checked)}/><span/> نمایش در فروشگاه</label><div className="product-actions"><button onClick={() => void mutate("/api/admin/products", "PATCH", draft, product.id, "تغییرات محصول روی فروشگاه اعمال شد.")} disabled={saving===product.id}>{saving===product.id?"در حال ذخیره…":"ذخیره"}</button><button className="delete-product" onClick={remove} disabled={saving===product.id}>حذف</button></div></div></article>;
}

function ProductModal({ close, submit, saving }: { close:()=>void; submit:(u:string,m:string,b:object,k:string,s:string)=>Promise<boolean>; saving:string }) {
  const [image, setImage] = useState(images[0]);
  const [form, setForm] = useState({ name: "", category: "سبزی‌های خشک", description: "", price: "", stock: "" });
  const [formError, setFormError] = useState("");
  const isSaving = saving === "new-product";
  const isComplete = Boolean(form.name.trim() && form.description.trim() && form.price !== "" && form.stock !== "");
  const setField = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape" && !isSaving) close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, isSaving]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!isComplete) { setFormError("لطفاً همه فیلدهای ضروری را کامل کنید."); return; }
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) { setFormError("قیمت و موجودی باید عدد صحیح و مثبت باشند."); return; }
    const ok = await submit("/api/admin/products", "POST", { ...form, image, price, stock }, "new-product", "محصول جدید بلافاصله به فروشگاه اضافه شد.");
    if (ok) close();
  }

  return <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="new-product-title">
    <form className="product-create-modal" onSubmit={create} noValidate>
      <header><div><small>محصول تازه</small><h2 id="new-product-title">افزودن محصول به فروشگاه</h2><p>اطلاعات اصلی را وارد کنید؛ محصول بعد از ثبت، مستقیماً در فروشگاه نمایش داده می‌شود.</p></div><button type="button" onClick={close} aria-label="بستن فرم" disabled={isSaving}>×</button></header>
      <div className="product-create-body">
        <div className="product-form-sections">
          {formError && <div className="product-form-error" role="alert">{formError}</div>}
          <section className="product-form-section" aria-labelledby="product-info-heading">
            <div className="form-section-heading"><span>۱</span><div><h3 id="product-info-heading">معرفی محصول</h3><p>نام واضح و توضیح کوتاه، انتخاب محصول را برای مشتری آسان می‌کند.</p></div></div>
            <div className="product-fields-grid">
              <label><span>نام محصول <b>*</b></span><input name="name" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="مثلاً سس ریحان تازه" maxLength={120} required/><small>{money(form.name.length)} از ۱۲۰ حرف</small></label>
              <label><span>دسته‌بندی <b>*</b></span><select name="category" value={form.category} onChange={e => setField("category", e.target.value)} required><option>سبزی‌های خشک</option><option>سبزیجات آماده</option><option>چاشنی‌ها و سس‌ها</option><option>ادویه‌های جهان</option><option>نوشیدنی‌های طبیعی</option></select><small>محصول در همین بخش فروشگاه دیده می‌شود.</small></label>
              <label className="wide"><span>توضیح کوتاه <b>*</b></span><textarea name="description" value={form.description} onChange={e => setField("description", e.target.value)} placeholder="طعم، عطر و کاربرد اصلی محصول را در یک یا دو جمله بنویسید…" maxLength={500} rows={4} required/><small>{money(form.description.length)} از ۵۰۰ حرف</small></label>
            </div>
          </section>
          <section className="product-form-section" aria-labelledby="product-sale-heading">
            <div className="form-section-heading"><span>۲</span><div><h3 id="product-sale-heading">قیمت و موجودی</h3><p>اعداد را بدون جداکننده وارد کنید.</p></div></div>
            <div className="product-fields-grid">
              <label><span>قیمت فروش <b>*</b></span><div className="input-with-unit"><input name="price" type="number" inputMode="numeric" min="0" step="1000" value={form.price} onChange={e => setField("price", e.target.value)} placeholder="۱۸۵۰۰۰" required/><i>تومان</i></div><small>{form.price ? `${money(Number(form.price))} تومان` : "قیمت نهایی برای مشتری"}</small></label>
              <label><span>موجودی اولیه <b>*</b></span><div className="input-with-unit"><input name="stock" type="number" inputMode="numeric" min="0" step="1" value={form.stock} onChange={e => setField("stock", e.target.value)} placeholder="۲۵" required/><i>عدد</i></div><small>برای محصول ناموجود، صفر وارد کنید.</small></label>
            </div>
          </section>
          <section className="product-form-section" aria-labelledby="product-image-heading">
            <div className="form-section-heading"><span>۳</span><div><h3 id="product-image-heading">تصویر محصول</h3><p>یکی از تصاویر آماده و هماهنگ با ظاهر فروشگاه را انتخاب کنید.</p></div></div>
            <div className="image-picker" role="group" aria-label="انتخاب تصویر محصول">{images.map((path, index) => <button type="button" className={image === path ? "selected" : ""} aria-pressed={image === path} aria-label={`تصویر شماره ${money(index + 1)}`} onClick={() => setImage(path)} key={path}><Image src={path} alt="" fill sizes="96px"/>{image === path && <span aria-hidden="true">✓</span>}</button>)}</div>
          </section>
        </div>
        <aside className="product-live-preview" aria-label="پیش‌نمایش محصول">
          <div className="preview-sticky"><div className="preview-heading"><span>پیش‌نمایش زنده</span><small>نمای تقریبی در فروشگاه</small></div><article><div className="preview-image"><Image src={image} alt={form.name || "پیش‌نمایش تصویر محصول"} fill sizes="280px"/></div><div className="preview-copy"><small>{form.category}</small><h3>{form.name || "نام محصول شما"}</h3><p>{form.description || "توضیح کوتاه محصول در این قسمت نمایش داده می‌شود."}</p><strong>{form.price ? money(Number(form.price)) : "—"} <span>تومان</span></strong><div className={Number(form.stock) > 0 ? "stock-ok" : "stock-empty"}>{Number(form.stock) > 0 ? `${money(Number(form.stock))} عدد موجود` : "ناموجود"}</div></div></article><div className="publish-note"><span aria-hidden="true">✓</span><p><b>نمایش خودکار در فروشگاه</b><small>پس از ثبت موفق، محصول فعال خواهد بود.</small></p></div></div>
        </aside>
      </div>
      <footer><div className={`completion-status ${isComplete ? "complete" : ""}`}><span aria-hidden="true">{isComplete ? "✓" : "!"}</span>{isComplete ? "اطلاعات ضروری کامل است" : "فیلدهای ستاره‌دار را کامل کنید"}</div><div className="footer-buttons"><button type="button" onClick={close} disabled={isSaving}>انصراف</button><button className="primary" disabled={isSaving || !isComplete}>{isSaving ? "در حال افزودن…" : "ثبت و نمایش در فروشگاه"}</button></div></footer>
    </form>
  </div>;
}

function SettingsForm({ adminName }: { adminName:string }) {
  const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setError("");setMessage("");const form=new FormData(event.currentTarget);if(form.get("newPassword")!==form.get("confirmPassword")){setError("تکرار رمز عبور با رمز جدید یکسان نیست.");setLoading(false);return;}try{const response=await fetch("/api/admin/auth",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:form.get("username"),currentPassword:form.get("currentPassword"),newPassword:form.get("newPassword")})});const result=await response.json();if(!response.ok)throw new Error(result.error);setMessage("نام کاربری و رمز عبور با موفقیت تغییر کرد.");(event.currentTarget as HTMLFormElement).reset();}catch(e){setError(e instanceof Error?e.message:"تغییر اطلاعات انجام نشد.");}finally{setLoading(false)}}
  return <section className="settings-card"><div><small>امنیت حساب</small><h2>تغییر اطلاعات ورود</h2><p>پس از ذخیره، تمام نشست‌های قبلی خارج می‌شوند و فقط همین دستگاه وارد می‌ماند.</p></div><form onSubmit={submit}><label><span>نام کاربری جدید</span><input name="username" defaultValue={adminName} minLength={3} required dir="ltr" autoComplete="username"/></label><label><span>رمز عبور فعلی</span><input name="currentPassword" type="password" required autoComplete="current-password" dir="ltr"/></label><label><span>رمز عبور جدید</span><input name="newPassword" type="password" minLength={10} required autoComplete="new-password" dir="ltr"/></label><label><span>تکرار رمز عبور جدید</span><input name="confirmPassword" type="password" minLength={10} required autoComplete="new-password" dir="ltr"/></label>{error&&<div className="admin-error" role="alert">{error}</div>}{message&&<div className="admin-notice" role="status">{message}</div>}<button disabled={loading}>{loading?"در حال ذخیره…":"تغییر نام کاربری و رمز"}</button></form></section>;
}
