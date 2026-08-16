import InquiryForm from "../components/InquiryForm";
import PublicFooter from "../components/PublicFooter";
import PublicHeader from "../components/PublicHeader";
import "../content-pages.css";

export default function CooperatePage() {
  return <main className="content-page" dir="rtl"><PublicHeader/><section className="content-hero"><div><small>همکاری با سبزینو</small><h1>هر همکاری، آغاز یک مسیر مشترک است.</h1><p>اگر در تولید، تأمین، توزیع، کافه و رستوران یا توسعه اجتماعی فعالیت می‌کنید، دوست داریم ایده شما را بشنویم.</p></div><aside className="hero-quote"><b>رشد متقابل، شفافیت و ارزش مشترک</b><span>سه اصل برای ساختن همکاری‌هایی بلندمدت و حرفه‌ای.</span></aside></section>
    <section className="content-section"><div className="content-heading"><span>مسیرهای همکاری</span><h2>جایی برای توان و ایده شما</h2></div><div className="cooperate-types"><article><h3>تأمین و تولید</h3><p>همکاری با تولیدکنندگان مواد اولیه و کارگاه‌های هم‌راستا با استاندارد سبزینو.</p></article><article><h3>فروش و توزیع</h3><p>نمایندگی، فروش سازمانی و توسعه دسترسی در شهرهای مختلف.</p></article><article><h3>کافه و رستوران</h3><p>تأمین محصول، ساخت منوی مشترک و تجربه‌های ویژه طعم.</p></article><article><h3>همکاری اجتماعی</h3><p>طرح‌هایی برای آموزش، اشتغال، توانمندسازی و کاهش هدررفت.</p></article></div></section>
    <section className="content-section alt"><div className="inquiry-layout"><aside className="inquiry-aside"><span className="content-kicker">فرم همکاری</span><h2>از ایده تا گفت‌وگوی واقعی</h2><p>اطلاعات را کوتاه و شفاف بنویسید. درخواست شما ثبت می‌شود و تیم سبزینو پس از بررسی تماس می‌گیرد.</p><ul><li>بررسی تناسب و ظرفیت همکاری</li><li>تماس برای شناخت جزئیات</li><li>تعریف مسیر و گام بعدی مشترک</li></ul></aside><InquiryForm type="cooperation"/></div></section><PublicFooter/></main>;
}
