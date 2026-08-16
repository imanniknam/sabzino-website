"use client";

import { FormEvent, useState } from "react";

export default function InquiryForm({ type }: { type: "cooperation" | "contact" }) {
  const [status, setStatus] = useState<"" | "loading" | "success" | "error">("");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("loading"); setMessage("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, type }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "ارسال فرم انجام نشد.");
      setStatus("success"); setMessage("پیام شما با موفقیت ثبت شد. تیم سبزینو برای ادامه مسیر با شما تماس می‌گیرد.");
      event.currentTarget.reset();
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "ارسال فرم انجام نشد."); }
  }
  return <form className="inquiry-form" onSubmit={submit}>
    <label><span>نام و نام خانوادگی *</span><input name="fullName" required autoComplete="name"/></label>
    {type === "cooperation" && <label><span>نام مجموعه <small>(اختیاری)</small></span><input name="company" autoComplete="organization"/></label>}
    <label><span>شماره همراه *</span><input name="phone" required inputMode="tel" pattern="09[0-9۰-۹]{9}" placeholder="۰۹۱۲۱۲۳۴۵۶۷"/></label>
    <label><span>ایمیل <small>(اختیاری)</small></span><input name="email" type="email" dir="ltr"/></label>
    <label><span>شهر *</span><input name="city" required/></label>
    <label><span>{type === "cooperation" ? "موضوع همکاری *" : "موضوع پیام *"}</span><select name="subject" required defaultValue=""><option value="" disabled>انتخاب کنید</option>{type === "cooperation" ? <><option>تأمین مواد اولیه</option><option>فروش و توزیع</option><option>رستوران و کافه</option><option>همکاری سازمانی</option><option>پیشنهاد دیگر</option></> : <><option>پشتیبانی سفارش</option><option>محصولات</option><option>پیشنهاد و انتقاد</option><option>سایر</option></>}</select></label>
    <label className="full"><span>{type === "cooperation" ? "معرفی کوتاه و جزئیات همکاری *" : "متن پیام *"}</span><textarea name="details" rows={6} required></textarea></label>
    {message && <div className={`form-message ${status === "error" ? "error" : ""}`} role="status">{message}</div>}
    <button disabled={status === "loading"}>{status === "loading" ? "در حال ارسال…" : type === "cooperation" ? "ثبت درخواست همکاری" : "ارسال پیام"}</button>
  </form>;
}
