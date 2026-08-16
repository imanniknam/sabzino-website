import { getDb } from "../../../db";
import { newsletterSubscribers } from "../../../db/schema";
import { apiError, cleanText } from "../../../lib/api";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { email?: string };
    const email = cleanText(payload.email, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "ایمیل معتبر وارد کنید." }, { status: 400 });
    const db = getDb();
    await db.insert(newsletterSubscribers).values({ email }).onConflictDoUpdate({ target: newsletterSubscribers.email, set: { status: "active" } });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
