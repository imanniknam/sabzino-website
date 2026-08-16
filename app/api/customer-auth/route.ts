import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { customers, customerSessions } from "../../../db/schema";
import { apiError, cleanText } from "../../../lib/api";
import { clearCustomerCookie, createCustomerSession, customerSessionCookie, getCustomerIdentity } from "../../../lib/customer-auth";
import { hashPassword, validatePassword, verifyPassword } from "../../../lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { mode?: "register" | "login"; identifier?: string; email?: string; password?: string; fullName?: string; phone?: string };
    const email = cleanText(body.email, 150).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const db = getDb();
    if (body.mode === "register") {
      const fullName = cleanText(body.fullName, 120);
      const phone = cleanText(body.phone, 20).replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
      if (!fullName) return Response.json({ error: "نام و نام خانوادگی را وارد کنید." }, { status: 400 });
      if (!/^09\d{9}$/.test(phone)) return Response.json({ error: "شماره همراه معتبر وارد کنید." }, { status: 400 });
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "ایمیل واردشده معتبر نیست." }, { status: 400 });
      if (!validatePassword(password)) return Response.json({ error: "رمز عبور باید حداقل ۸ نویسه و شامل حرف و عدد باشد." }, { status: 400 });
      const [existingPhone] = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
      const [existingEmail] = email ? await db.select().from(customers).where(eq(customers.email, email)).limit(1) : [];
      const existing = existingPhone ?? existingEmail;
      if (existing?.passwordHash) return Response.json({ error: "قبلاً با این شماره همراه یا ایمیل ثبت‌نام شده است." }, { status: 409 });
      const secured = await hashPassword(password);
      const id = existing?.id ?? crypto.randomUUID();
      if (existing) await db.update(customers).set({ fullName, phone, email, passwordHash: secured.hash, passwordSalt: secured.salt, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(customers.id, existing.id));
      else await db.insert(customers).values({ id, email, fullName, phone, passwordHash: secured.hash, passwordSalt: secured.salt });
      const session = await createCustomerSession(id);
      return Response.json({ ok: true }, { status: 201, headers: { "Set-Cookie": customerSessionCookie(session.token, session.expiresAt) } });
    }
    const identifier = cleanText(body.identifier, 150).toLowerCase().replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
    if (!identifier) return Response.json({ error: "شماره همراه یا ایمیل را وارد کنید." }, { status: 400 });
    const [customer] = identifier.includes("@")
      ? await db.select().from(customers).where(eq(customers.email, identifier)).limit(1)
      : await db.select().from(customers).where(eq(customers.phone, identifier)).limit(1);
    if (!customer?.passwordHash || !customer.passwordSalt) return Response.json({ error: "ایمیل یا رمز عبور نادرست است." }, { status: 401 });
    if (customer.lockedUntil && customer.lockedUntil > new Date().toISOString()) return Response.json({ error: "ورود به‌دلیل تلاش‌های ناموفق، ۱۵ دقیقه قفل شده است." }, { status: 429 });
    if (!(await verifyPassword(password, customer.passwordSalt, customer.passwordHash))) {
      const attempts = customer.failedAttempts + 1;
      await db.update(customers).set({ failedAttempts: attempts >= 5 ? 0 : attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : null }).where(eq(customers.id, customer.id));
      return Response.json({ error: "ایمیل یا رمز عبور نادرست است." }, { status: 401 });
    }
    await db.update(customers).set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: sql`CURRENT_TIMESTAMP` }).where(eq(customers.id, customer.id));
    const session = await createCustomerSession(customer.id);
    return Response.json({ ok: true }, { headers: { "Set-Cookie": customerSessionCookie(session.token, session.expiresAt) } });
  } catch (error) { return apiError(error); }
}

export async function DELETE() {
  const identity = await getCustomerIdentity();
  if (identity) await getDb().delete(customerSessions).where(eq(customerSessions.id, identity.sessionId));
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearCustomerCookie() } });
}
