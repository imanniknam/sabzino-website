import BrandLogo from "./BrandLogo";
import EnamadSeal from "./EnamadSeal";

export default function PublicFooter() {
  return <footer className="public-footer" dir="rtl"><div><BrandLogo className="brand-logo--footer"/><p>چشیدن طعم‌های جهان؛ طبیعی، سالم و خاص.</p></div><div><b>سبزینو</b><a href="/about">درباره ما</a><a href="/social-impact">کارآفرینی اجتماعی</a><a href="/cooperate">همکاری با ما</a></div><div><b>دسترسی سریع</b><a href="/#shop">فروشگاه</a><a href="/contact">تماس با ما</a><a href="/login">حساب کاربری</a></div><EnamadSeal/><small>© ۱۴۰۵ سبزینو؛ تمامی حقوق محفوظ است.</small></footer>;
}
