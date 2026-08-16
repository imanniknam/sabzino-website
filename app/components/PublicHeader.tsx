"use client";

import { useState } from "react";
import BrandLogo from "./BrandLogo";

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  return <header className="public-header" dir="rtl"><a href="/" aria-label="صفحه اصلی سبزینو"><BrandLogo priority/></a><nav className={open ? "open" : ""}><a href="/about">درباره سبزینو</a><a href="/social-impact">کارآفرینی اجتماعی</a><a href="/cooperate">همکاری با سبزینو</a><a href="/#shop">محصولات</a><a href="/contact">تماس با ما</a></nav><div><a href="/login">ورود و ثبت‌نام</a><button onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label="نمایش منو"><span></span><span></span></button></div></header>;
}
