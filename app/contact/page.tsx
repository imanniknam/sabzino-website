import InquiryForm from "../components/InquiryForm";
import PublicFooter from "../components/PublicFooter";
import PublicHeader from "../components/PublicHeader";
import "../content-pages.css";

export default function ContactPage() {
  return <main className="content-page" dir="rtl"><PublicHeader/><section className="content-hero"><div><small>تماس با سبزینو</small><h1>شنیدن صدای شما بخشی از مسیر ماست.</h1><p>برای پرسش درباره محصولات، سفارش‌ها یا پیشنهادهای خود از فرم زیر استفاده کنید.</p></div><aside className="hero-quote"><b>پیام شما مستقیم ثبت می‌شود.</b><span>اطلاعات تماس را دقیق وارد کنید تا بتوانیم پاسخ را پیگیری کنیم.</span></aside></section><section className="content-section alt"><div className="inquiry-layout"><aside className="inquiry-aside"><span className="content-kicker">ارتباط با ما</span><h2>کنار شما هستیم.</h2><p>موضوع مناسب را انتخاب کنید تا پیام شما سریع‌تر به بخش مربوط برسد.</p><ul><li>پشتیبانی سفارش و ارسال</li><li>پرسش درباره محصولات</li><li>پیشنهاد، انتقاد و تجربه خرید</li></ul></aside><InquiryForm type="contact"/></div></section><PublicFooter/></main>;
}
