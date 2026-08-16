"use client";

import { FormEvent, useState } from "react";
import BrandLogo from "../../components/BrandLogo";

function LockIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>; }

export default function AdminLogin({ mode, unavailable }: { mode: "setup" | "login"; unavailable: boolean }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, username: form.get("username"), password: form.get("password") }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "ورود انجام نشد.");
      window.location.href = "/admin";
    } catch (error) { setError(error instanceof Error ? error.message : "ورود انجام نشد."); }
    finally { setLoading(false); }
  }
  return <main className="admin-login-page" dir="rtl">
    <section className="login-brand"><div><BrandLogo priority className="brand-logo--light"/><span>مرکز کنترل فروشگاه</span></div><div><small>مدیریت امن و یکپارچه</small><h1>تمام فروشگاه،<br/>در یک نگاه.</h1><p>محصولات، قیمت‌ها، موجودی و سفارش‌ها را از یک فضای اختصاصی مدیریت کنید.</p></div><footer>سبزینو · چشیدن طعم‌های جهان</footer></section>
    <section className="login-form-side"><div className="login-card"><div className="login-lock"><LockIcon/></div><small>{mode === "setup" ? "راه‌اندازی اولیه" : "ورود مدیر"}</small><h2>{mode === "setup" ? "حساب مدیر را بسازید" : "خوش آمدید"}</h2><p>{mode === "setup" ? "یک نام کاربری و رمز قوی تعیین کنید. هیچ رمز پیش‌فرضی وجود ندارد." : "برای ورود به پنل، اطلاعات مدیریت را وارد کنید."}</p>
      {unavailable ? <div className="login-error">راه‌اندازی اولیه فقط برای مالک سایت مجاز است.</div> : <form onSubmit={submit}><label><span>نام کاربری</span><input name="username" required minLength={3} autoComplete="username" dir="ltr" placeholder="admin"/></label><label><span>{mode === "setup" ? "رمز عبور جدید" : "رمز عبور"}</span><input name="password" type="password" required minLength={10} autoComplete={mode === "setup" ? "new-password" : "current-password"} dir="ltr" placeholder="حداقل ۱۰ نویسه، شامل حرف و عدد"/></label>{error && <div className="login-error" role="alert">{error}</div>}<button disabled={loading}>{loading ? "در حال بررسی…" : mode === "setup" ? "ساخت حساب و ورود" : "ورود به پنل"}</button></form>}
      <div className="login-security"><LockIcon/><span><b>ورود محافظت‌شده</b><small>نشست امن، محدودیت تلاش ناموفق و رمزنگاری رمز عبور</small></span></div>
    </div></section>
  </main>;
}
