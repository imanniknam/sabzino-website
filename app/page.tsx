"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { catalog } from "../lib/catalog";
import BrandLogo from "./components/BrandLogo";
import EnamadSeal from "./components/EnamadSeal";

type StoreProduct = { id: string; name: string; category: string; price: number; image: string; note: string; stock?: number };

const initialProducts: StoreProduct[] = catalog.map(product => ({ ...product, note: product.description }));

const spices = [
  { country: "هند", spice: "گرام ماسالا", code: "IN", flag: "🇮🇳", note: "گرم و چندلایه" },
  { country: "لبنان", spice: "زعتر و سبع بهارات", code: "LB", flag: "🇱🇧", note: "گیاهی و معطر" },
  { country: "ترکیه", spice: "پول بیبر", code: "TR", flag: "🇹🇷", note: "تند و میوه‌ای" },
  { country: "فرانسه", spice: "Herbes de Provence", code: "FR", flag: "🇫🇷", note: "عطر باغ‌های جنوب" },
  { country: "ایتالیا", spice: "اورگانو", code: "IT", flag: "🇮🇹", note: "سبز و مدیترانه‌ای" },
  { country: "چین", spice: "Five Spice", code: "CN", flag: "🇨🇳", note: "تعادل پنج عطر" },
  { country: "اسپانیا", spice: "پاپریکا دودی", code: "ES", flag: "🇪🇸", note: "دودی و شیرین" },
  { country: "مراکش", spice: "Ras el Hanout", code: "MA", flag: "🇲🇦", note: "پیچیده و باشکوه" },
];

function ArrowIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>; }
function BagIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>; }
function LeafIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z"/><path d="M4 21c3-5 7-8 12-11"/></svg>; }
function CloseIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>; }
function TrashIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>; }
function ChevronIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg>; }
function SproutIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21v-9M12 14C7 14 4 11 4 6c5 0 8 3 8 8ZM12 11c0-5 3-8 8-8 0 5-3 8-8 8Z"/></svg>; }

const money = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const categoryFromQuery: Record<string, string> = {
  dried: "سبزی‌های خشک",
  ready: "سبزیجات آماده",
  seasonings: "چاشنی‌ها و سس‌ها",
};

function PrimaryNavigation() {
  return <>
    <details className="nav-group"><summary>درباره سبزینو <ChevronIcon/></summary><div className="mega-menu compact"><a href="/about"><b>داستان سبزینو</b><span>از یک ایده سبز تا طعم‌های جهان</span></a><a href="/social-impact"><b>کارآفرینی اجتماعی</b><span>کسب‌وکاری برای ساختن ارزش مشترک</span></a><a href="/cooperate"><b>همکاری با سبزینو</b><span>آغاز یک مسیر مشترک</span></a></div></details>
    <details className="nav-group products-menu"><summary>محصولات <ChevronIcon/></summary><div className="mega-menu products-mega"><div><b>سبزیجات</b><a href="/?category=dried#product-dried-pepper">سبزی‌های خشک</a><a href="/?category=ready#product-fried-onion-sliced">سبزیجات آماده</a><a href="/?category=ready#product-fried-onion-majlesi">سبزی‌های سرخ‌شده</a></div><div><b>چاشنی‌ها و سس‌ها</b><a href="/?category=seasonings#product-red-pepper">سس‌های سبزیجات</a><a href="/?category=seasonings#product-green-pepper">ترشی‌ها</a><a href="/?category=seasonings#product-seed-seasoning">چاشنی‌های خلاقانه</a></div><div><b>ادویه‌های بین‌المللی</b><a href="/#spice-IN">آسیایی و هندی</a><a href="/#spice-LB">عربی و مدیترانه‌ای</a><a href="/#spice-FR">اروپایی و آمریکای لاتین</a></div><div><b>نوشیدنی‌های طبیعی</b><a href="/#drinks">شربت‌ها</a><a href="/#drinks">موکتل‌ها</a><a href="/#drinks">امضای سبزینو</a></div></div></details>
    <a href="#journal">دستور پخت و مجله</a><a href="/cooperate">همکاری با سبزینو</a><a href="/contact">تماس با ما</a>
  </>;
}

export default function Home() {
  const [category, setCategory] = useState("همه");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);

  const categories = useMemo(() => ["همه", ...Array.from(new Set(products.map(product => product.category)))], [products]);
  const filtered = useMemo(() => category === "همه" ? products : products.filter(product => product.category === category), [category, products]);
  const cartItems = products.filter(product => cart[product.id]).map(product => ({ ...product, quantity: cart[product.id] }));
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get("category");
    if (requestedCategory && categoryFromQuery[requestedCategory]) setCategory(categoryFromQuery[requestedCategory]);
  }, []);

  useEffect(() => {
    const targetId = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!targetId) return;
    const frame = requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ block: "center" }));
    return () => cancelAnimationFrame(frame);
  }, [category, products]);

  useEffect(() => {
    try { const saved = localStorage.getItem("sabzino-cart"); if (saved) setCart(JSON.parse(saved)); } catch { /* unavailable storage */ }
    setCartReady(true);
  }, []);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((data: { products?: Array<{ id: string; name: string; category: string; price: number; image: string; description?: string; stock?: number }> }) => {
        if (Array.isArray(data.products)) setProducts(data.products.map(product => ({ ...product, note: product.description || "محصول طبیعی سبزینو" })));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => { if (cartReady) localStorage.setItem("sabzino-cart", JSON.stringify(cart)); }, [cart, cartReady]);
  useEffect(() => { document.body.style.overflow = cartOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [cartOpen]);

  const changeQuantity = (id: string, change: number) => setCart(current => {
    const next = Math.max(0, (current[id] || 0) + change);
    const updated = { ...current, [id]: next };
    if (!next) delete updated[id];
    return updated;
  });

  function addToCart(id: string) { changeQuantity(id, 1); setCartOpen(true); }

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNewsletterError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email") }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "عضویت انجام نشد.");
      setSubscribed(true);
    } catch (error) { setNewsletterError(error instanceof Error ? error.message : "عضویت انجام نشد."); }
  }

  return <main dir="rtl">
    <div className="announcement"><span>تازه، طبیعی و مسئولانه</span><i></i><span>بسته‌بندی مطمئن و ارسال به سراسر ایران</span></div>

    <header className="nav-shell">
      <a className="brand" href="/" aria-label="سبزینو، صفحه اصلی"><BrandLogo priority/></a>
      <nav className="nav-links" aria-label="منوی اصلی"><PrimaryNavigation/></nav>
      <div className="nav-actions"><a className="account-link" href="/login"><span className="account-label-full">ورود و ثبت‌نام</span><span className="account-label-short">ورود</span></a><button className="icon-button cart-button" onClick={() => setCartOpen(true)} aria-label={`سبد خرید، ${cartCount} کالا`}><BagIcon/><b>{cartCount}</b></button><details className="mobile-menu-shell"><summary className="menu-button" aria-label="نمایش منوی اصلی"><i></i><i></i></summary><nav className="mobile-nav-links" aria-label="منوی موبایل"><PrimaryNavigation/></nav></details></div>
    </header>

    <section id="top" className="hero">
      <div className="hero-copy"><div className="eyebrow"><span></span> استارتاپ کارآفرینی اجتماعی</div><h1>چشیدن<br/><em>طعم‌های جهان</em></h1><p>سبزینو، تجربه‌ای تازه از محصولات سبزی‌محور، ادویه‌های اصیل بین‌المللی و نوشیدنی‌های طبیعی است؛ طعم‌هایی با ریشه در طبیعت و نگاهی مسئولانه به جامعه.</p><div className="hero-buttons"><a className="button primary" href="#shop">ورود به فروشگاه <ArrowIcon/></a><a className="text-link" href="#world">کشف طعم‌های جهان <ArrowIcon/></a></div><div className="trust-row"><span><i>✓</i> مواد اولیه باکیفیت</span><span><i>✓</i> بدون افزودنی غیرضروری</span><span><i>✓</i> تولید مسئولانه</span></div></div>
      <div className="hero-visual"><div className="hero-brand-line">طبیعی، سالم، خاص</div><div className="hero-photo main-photo"><Image src="/images/product-13.webp" alt="سس فلفل قرمز سبزینو" fill sizes="(max-width: 800px) 75vw, 34vw" priority /></div><div className="hero-photo side-photo"><Image src="/images/product-5.webp" alt="ریحان خشک سبزینو" fill sizes="(max-width: 700px) 30vw, 20vw" /></div><div className="hero-photo mini-photo"><Image src="/images/product-10.webp" alt="ترشی فلفل سبز سبزینو" fill sizes="(max-width: 700px) 24vw, 16vw" /></div><div className="hero-stamp"><LeafIcon/><b>تازه و خوش‌طعم</b></div></div>
    </section>

    <section className="premium-benefits" aria-label="ارزش‌های سبزینو"><div><LeafIcon/><span><b>مواد اولیه سالم</b><small>انتخاب دقیق، عطر و طعم واقعی</small></span></div><div><BagIcon/><span><b>بسته‌بندی مطمئن</b><small>آماده برای رسیدن به آشپزخانه شما</small></span></div><div><SproutIcon/><span><b>خرید اثرگذار</b><small>حمایت از یک کسب‌وکار اجتماعی</small></span></div><div><LeafIcon/><span><b>الهام از جهان</b><small>ترکیب‌های اصیل از فرهنگ‌های گوناگون</small></span></div></section>

    <section className="worlds section-pad"><div className="section-heading"><div><span className="kicker">سه دنیای سبزینو</span><h2>سه مسیر برای کشف یک طعم تازه</h2></div><p>هر دنیای سبزینو شخصیت خودش را دارد؛ از تازگی سبزی‌ها تا عطر سرزمین‌های دور و طراوتی که می‌توان نوشید.</p></div><div className="world-grid">
      <article className="world-card world-herbs"><span>۰۱</span><div className="world-art"><Image src="/images/product-5.webp" alt="سبزی‌های خشک سبزینو" fill sizes="33vw" /></div><div><small>تازگی که هر روز جان می‌گیرد</small><h3>محصولات بر پایه سبزی</h3><p>سبزی‌های خشک و آماده، فرآورده‌های خلاقانه و ترکیب‌هایی مثل سس ریحان برای آشپزی آسان‌تر و خوش‌عطرتر.</p><a href="#shop">مشاهده محصولات <ArrowIcon/></a></div></article>
      <article className="world-card world-spices"><span>۰۲</span><div className="spice-orbs"><i></i><i></i><i></i></div><div><small>عطر سرزمین‌های دور</small><h3>ادویه‌های بین‌المللی</h3><p>ترکیب‌های اصیل و معطر از هند و لبنان تا مکزیک، چین، فرانسه و مراکش؛ هر قاشق، یک سفر تازه.</p><a href="#world">دیدن اطلس ادویه <ArrowIcon/></a></div></article>
      <article id="drinks" className="world-card world-drinks"><span>۰۳</span><div className="drink-bottle"><i></i></div><div><small>طراوتی که می‌توان نوشید</small><h3>نوشیدنی‌های طبیعی</h3><p>شربت‌ها، موکتل‌ها و ترکیب‌های فصلی جذاب و طبیعی که در خود سبزینو تولید می‌شوند.</p><a href="#newsletter">باخبرم کنید <ArrowIcon/></a></div></article>
    </div></section>

    <section className="why section-pad"><div className="why-intro"><span className="kicker light">چرا سبزینو؟</span><h2>کیفیت، فقط یک ادعا نیست؛ مسیر ساخت هر محصول است.</h2></div><div className="why-grid"><article><b>۰۱</b><h3>مواد اولیه باکیفیت</h3><p>انتخاب مواد اولیه با توجه به تازگی، عطر و سلامت.</p></article><article><b>۰۲</b><h3>طعم‌های اصیل جهان</h3><p>ترکیب‌هایی الهام‌گرفته از فرهنگ واقعی آشپزی کشورها.</p></article><article><b>۰۳</b><h3>نوآوری کاربردی</h3><p>محصولاتی خلاقانه که آشپزی روزمره را لذت‌بخش‌تر می‌کنند.</p></article><article><b>۰۴</b><h3>دقت در جزئیات</h3><p>از آماده‌سازی و بسته‌بندی تا تجربه خرید و پشتیبانی.</p></article></div></section>

    <section id="shop" className="shop section-pad"><div className="section-heading shop-heading"><div><span className="kicker">فروشگاه سبزینو</span><h2>محصول واقعی، تصویر واقعی</h2><p>نام و دسته‌بندی محصولات براساس تصویر روی بسته‌بندی اصلاح شده است.</p></div><div className="filters" role="group" aria-label="فیلتر محصولات">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div className="product-grid">{filtered.map((product, index) => <article id={`product-${product.id}`} className="product-card" key={product.id}><div className="product-image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 700px) 88vw, 30vw" />{index < 3 && <span className="badge">پیشنهاد سبزینو</span>}</div><div className="product-info"><small>{product.category}</small><h3>{product.name}</h3><p>{product.note}</p><div><strong>{money(product.price)} <small>تومان</small></strong><button disabled={product.stock === 0} onClick={() => addToCart(product.id)}><span>{product.stock === 0 ? "ناموجود" : "افزودن"}</span><BagIcon/></button></div></div></article>)}</div></section>

    <section id="world" className="spice-journey section-pad"><div className="journey-copy"><span className="kicker light">اطلس ادویه سبزینو</span><h2>جهان را<br/>با عطرها کشف کنید.</h2><p>هر ادویه یک نقطه روی نقشه نیست؛ حافظه یک فرهنگ است. مجموعه سبزینو این عطرها را در یک تجربه منظم، اصیل و قابل استفاده کنار هم می‌آورد.</p><div className="spice-legend"><span><i></i> گرم و عمیق</span><span><i></i> سبز و معطر</span><span><i></i> تند و دودی</span></div><a className="button cream" href="#newsletter">خبر عرضه ادویه‌ها <ArrowIcon/></a></div><div className="spice-atlas"><div className="atlas-globe"><span>۸</span><small>مقصد خوش‌عطر</small><i></i></div><div className="spice-list">{spices.map((item, index) => <article id={`spice-${item.code}`} key={item.code} style={{ "--delay": `${index * 30}ms` } as React.CSSProperties}><b>{item.flag}</b><div><small>{item.country} · {item.code}</small><h3>{item.spice}</h3><p>{item.note}</p></div></article>)}</div></div></section>

    <section id="impact" className="impact section-pad"><div className="impact-visual"><div className="impact-title"><SproutIcon/><span><small>زنجیره ارزش سبزینو</small><b>از زمین تا اثری که می‌ماند</b></span></div><div className="impact-chain">{[["۰۱","تولیدکننده","مواد اولیه"],["۰۲","آماده‌سازی","کنترل کیفیت"],["۰۳","بسته‌بندی","کار مسئولانه"],["۰۴","توزیع","دسترسی بهتر"],["۰۵","انتخاب شما","ارزش برای جامعه"]].map(([n,title,sub]) => <article key={n}><b>{n}</b><span><strong>{title}</strong><small>{sub}</small></span></article>)}</div><div className="impact-collage"><div><Image src="/images/product-2.webp" alt="شنبلیله خشک؛ محصول سبزینو" fill sizes="28vw" /></div><div><Image src="/images/product-7.webp" alt="پیاز سرخ‌شده؛ محصول آماده سبزینو" fill sizes="28vw" /></div></div></div><div className="impact-copy"><span className="kicker">کارآفرینی اجتماعی در سبزینو</span><h2>رشد کسب‌وکار، وقتی ارزشمند است که زندگی انسان‌ها را هم بهتر کند.</h2><p>سبزینو فقط فروشنده محصول نیست. ما می‌خواهیم میان تولید داخلی، اشتغال، کاهش هدررفت مواد غذایی و یک سبک زندگی سالم‌تر پیوندی پایدار بسازیم.</p><div className="impact-cards"><article><b>تولید داخلی</b><span>تقویت زنجیره تأمین و ارزش‌آفرینی محلی</span></article><article><b>فرصت شغلی</b><span>فضایی برای مشارکت، یادگیری و توانمندسازی</span></article><article><b>کاهش هدررفت</b><span>استفاده مسئولانه‌تر از ظرفیت محصولات کشاورزی</span></article><article><b>انتخاب سالم‌تر</b><span>دسترسی به طعم‌های طبیعی و کاربردی</span></article></div><a className="text-link dark" href="/social-impact">مسیر اثرگذاری سبزینو <ArrowIcon/></a></div></section>

    <section id="story" className="about-preview section-pad"><div><span className="kicker light">درباره سبزینو</span><h2>هر طعم، آغاز یک داستان است.</h2><p>سبزینو از دنیای سبزیجات آغاز شد؛ از تازگی، عطر و احترام به ماده اولیه. با گذر زمان این مسیر گسترده‌تر شد و امروز ادویه‌های بین‌المللی و نوشیدنی‌های طبیعی هم بخشی از جهان سبزینو هستند.</p><p>ماموریت ما ساخت تجربه‌ای سالم، خوش‌طعم و متفاوت است؛ تجربه‌ای که هم آشپزخانه شما را غنی‌تر کند و هم در جامعه ارزش بسازد.</p><a className="button cream" href="/about">داستان کامل سبزینو <ArrowIcon/></a></div><blockquote><span>«</span>طبیعت نقطه شروع ماست؛ جهان، منبع الهام ما؛ و انسان، دلیل ادامه مسیر.</blockquote></section>

    <section id="journal" className="journal section-pad"><div className="section-heading"><div><span className="kicker">الهام برای آشپزی</span><h2>بپزید، کشف کنید، لذت ببرید</h2></div><p>دستورها و دانستنی‌هایی درباره ادویه‌ها، سبزیجات، نوشیدنی‌ها و فرهنگ غذایی جهان.</p></div><div className="journal-grid"><article><div className="article-art herb"><span>ریحان</span></div><small>شناخت مواد اولیه · ۶ دقیقه</small><h3>چطور عطر ریحان را در غذا زنده نگه داریم؟</h3></article><article><div className="article-art spice"><span>ماسالا</span></div><small>طعم‌های جهان · ۸ دقیقه</small><h3>گرام ماسالا؛ قلب گرم آشپزی هندی</h3></article><article><div className="article-art drink"><span>خنک</span></div><small>نوشیدنی طبیعی · ۵ دقیقه</small><h3>سه ترکیب تازه برای عصرهای گرم</h3></article></div></section>

    <section id="newsletter" className="newsletter section-pad"><div><span className="kicker light">نامه‌ای از دنیای طعم‌ها</span><h2>چیزهای خوش‌طعم را از دست ندهید.</h2><p>از محصولات تازه، ادویه‌های جدید و داستان‌های سبزینو باخبر شوید.</p></div>{subscribed ? <div className="success"><LeafIcon/><b>خوش آمدید!</b><span>خبرهای خوش‌طعم به ایمیل شما می‌رسند.</span></div> : <form onSubmit={subscribe}><label htmlFor="email">ایمیل شما</label><div><input id="email" name="email" type="email" required placeholder="name@example.com" dir="ltr"/><button type="submit">عضویت <ArrowIcon/></button></div>{newsletterError && <span className="newsletter-error" role="alert">{newsletterError}</span>}<small>فقط خبرهای مفید؛ بدون پیام‌های اضافی.</small></form>}</section>

    <footer className="footer section-pad"><div className="footer-brand"><BrandLogo className="brand-logo--footer"/><p>چشیدن طعم‌های جهان، با ریشه‌ای در طبیعت و نگاهی به جامعه.</p></div><div><b>سبزینو</b><a href="/about">درباره ما</a><a href="/social-impact">کارآفرینی اجتماعی</a><a href="/cooperate">همکاری با ما</a></div><div><b>محصولات</b><a href="#shop">سبزیجات</a><a href="#world">ادویه‌های جهان</a><a href="#drinks">نوشیدنی‌ها</a></div><div><b>راهنما</b><a href="#journal">دستور پخت و مجله</a><a href="/contact">تماس با ما</a><a href="/login">ورود و ثبت‌نام</a></div><EnamadSeal/><div className="footer-bottom"><span>© ۱۴۰۵ سبزینو؛ تمامی حقوق محفوظ است.</span><span>ساخته‌شده با احترام به طبیعت و انسان</span></div></footer>

    <div className={cartOpen ? "cart-overlay open" : "cart-overlay"} onClick={() => setCartOpen(false)} aria-hidden={!cartOpen}></div>
    <aside className={cartOpen ? "cart-drawer open" : "cart-drawer"} aria-label="سبد خرید" aria-hidden={!cartOpen}><div className="cart-head"><div><span>سبد خرید شما</span><small>{cartCount ? `${money(cartCount)} کالا` : "هنوز خالی است"}</small></div><button onClick={() => setCartOpen(false)} aria-label="بستن سبد خرید"><CloseIcon/></button></div>{cartItems.length === 0 ? <div className="cart-empty"><div><BagIcon/></div><h2>سبد خریدتان خالی است</h2><p>از میان طعم‌های سبزینو چیزی برای خودتان انتخاب کنید.</p><button onClick={() => { setCartOpen(false); document.querySelector("#shop")?.scrollIntoView({ behavior: "smooth" }); }}>رفتن به فروشگاه</button></div> : <><div className="shipping-note"><BagIcon/><span><b>هزینه ارسال رایگان نیست.</b><small>شیوه و هزینه ارسال در مرحله بعد انتخاب می‌شود.</small></span></div><div className="cart-items">{cartItems.map(item => <article key={item.id}><div className="cart-thumb"><Image src={item.image} alt={item.name} fill sizes="90px"/></div><div className="cart-item-copy"><small>{item.category}</small><h3>{item.name}</h3><strong>{money(item.price * item.quantity)} <small>تومان</small></strong><div className="quantity"><button onClick={() => changeQuantity(item.id, 1)}>+</button><span>{money(item.quantity)}</span><button onClick={() => changeQuantity(item.id, -1)}>−</button></div></div><button className="remove-item" onClick={() => setCart(current => { const next = { ...current }; delete next[item.id]; return next; })} aria-label={`حذف ${item.name}`}><TrashIcon/></button></article>)}</div><div className="cart-summary"><div className="cart-total"><span>جمع محصولات</span><strong>{money(subtotal)} <small>تومان</small></strong></div><a className="checkout-button" href="/checkout">ادامه و ثبت سفارش <ArrowIcon/></a><small className="checkout-note">در مرحله بعد نشانی، روش ارسال و پرداخت آنلاین را تکمیل می‌کنید.</small></div></>}</aside>
  </main>;
}
