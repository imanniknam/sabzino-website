"use client";

import { FormEvent, useState } from "react";
import BrandLogo from "../components/BrandLogo";

function UserIcon(){return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 3.5-8 8-8s8 3 8 8"/></svg>}

export default function CustomerAuth({ mode }: { mode:"login"|"register" }) {
  const register = mode === "register";
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); setLoading(true); setError("");
    const form=Object.fromEntries(new FormData(event.currentTarget));
    if(register&&form.password!==form.confirmPassword){setError("تکرار رمز عبور یکسان نیست.");setLoading(false);return;}
    try{
      const response=await fetch("/api/customer-auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:register?"register":"login",identifier:form.identifier,email:form.email,password:form.password,fullName:form.fullName,phone:form.phone})});
      const result=await response.json(); if(!response.ok)throw new Error(result.error||"عملیات انجام نشد."); window.location.href="/account";
    }catch(e){setError(e instanceof Error?e.message:"عملیات انجام نشد.");}finally{setLoading(false)}
  }
  return <main className="customer-auth-page" dir="rtl">
    <section className="customer-auth-brand"><div><a href="/" aria-label="صفحه اصلی سبزینو"><BrandLogo priority className="brand-logo--light"/></a><span>باشگاه مشتریان سبزینو</span></div><div><small>چشیدن طعم‌های جهان</small><h1>{register?<>به جمع<br/>سبزینویی‌ها بپیوندید.</>:<>طعم‌های تازه،<br/>منتظر شماست.</>}</h1><p>{register?"حساب خود را بسازید تا سفارش‌ها، آدرس‌ها و تجربه خریدتان همیشه در دسترس باشد.":"وارد حساب خود شوید و ادامه مسیر خوش‌طعم‌تان را از همان‌جایی که رها کردید آغاز کنید."}</p></div><footer>تازه · طبیعی · مسئولانه</footer></section>
    <section className="customer-auth-form"><div className="customer-auth-card"><div className="customer-auth-icon"><UserIcon/></div><small>{register?"ثبت‌نام مشتری":"ورود مشتری"}</small><h2>{register?"ساخت حساب سبزینو":"دوباره خوش آمدید"}</h2><p>{register?"اطلاعات زیر را وارد کنید؛ ایمیل اختیاری است.":"با شماره همراه یا ایمیل و رمز عبور وارد شوید."}</p>
      <form onSubmit={submit}>{register?<><label><span>نام و نام خانوادگی</span><input name="fullName" required autoComplete="name" placeholder="مثلاً سارا احمدی"/></label><label><span>شماره همراه</span><input name="phone" required autoComplete="tel" inputMode="tel" pattern="09[0-9۰-۹]{9}" placeholder="۰۹۱۲۱۲۳۴۵۶۷"/></label><label><span>ایمیل <small className="optional-field">اختیاری</small></span><input name="email" type="email" autoComplete="email" dir="ltr" placeholder="name@example.com"/></label></>:<label><span>شماره همراه یا ایمیل</span><input name="identifier" required autoComplete="username" dir="ltr" placeholder="09121234567 یا name@example.com"/></label>}<label><span>رمز عبور</span><input name="password" type="password" required minLength={8} autoComplete={register?"new-password":"current-password"} dir="ltr" placeholder="حداقل ۸ نویسه، شامل حرف و عدد"/></label>{register&&<label><span>تکرار رمز عبور</span><input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" dir="ltr"/></label>}{error&&<div className="customer-auth-error" role="alert">{error}</div>}<button disabled={loading}>{loading?"کمی صبر کنید…":register?"ساخت حساب کاربری":"ورود به حساب"}</button></form>
      <div className="auth-switch">{register?<>قبلاً حساب ساخته‌اید؟ <a href="/login">وارد شوید</a></>:<>هنوز حساب ندارید؟ <a href="/register">ثبت‌نام کنید</a></>}</div><div className="customer-security"><UserIcon/><span><b>حساب شخصی و امن</b><small>اطلاعات شما فقط برای مدیریت سفارش‌های خودتان استفاده می‌شود.</small></span></div>
    </div></section>
  </main>;
}
