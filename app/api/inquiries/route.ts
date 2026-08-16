import { getDb } from "../../../db";
import { inquiries } from "../../../db/schema";
import { apiError, cleanText } from "../../../lib/api";

type InquiryPayload = { type?: string; fullName?: string; company?: string; phone?: string; email?: string; city?: string; subject?: string; details?: string };

export async function POST(request: Request) {
  try {
    const payload = await request.json() as InquiryPayload;
    const type = payload.type === "cooperation" ? "cooperation" : payload.type === "contact" ? "contact" : "";
    const fullName = cleanText(payload.fullName, 120);
    const phone = cleanText(payload.phone, 20).replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
    const email = cleanText(payload.email, 180).toLowerCase();
    const city = cleanText(payload.city, 80);
    const subject = cleanText(payload.subject, 120);
    const details = cleanText(payload.details, 2000);
    if (!type || !fullName || !/^09\d{9}$/.test(phone) || !city || !subject || details.length < 10) return Response.json({ error: "لطفاً اطلاعات ضروری را کامل و معتبر وارد کنید." }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "نشانی ایمیل معتبر نیست." }, { status: 400 });
    await getDb().insert(inquiries).values({ id: crypto.randomUUID(), type, fullName, company: cleanText(payload.company, 160), phone, email, city, subject, details });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
