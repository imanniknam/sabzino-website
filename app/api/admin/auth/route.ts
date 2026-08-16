import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { adminCredentials, adminSessions } from "../../../../db/schema";
import { apiError, cleanText } from "../../../../lib/api";
import { adminExists, adminUnauthorized, authorizeAdminApi, canInitializeAdmin, clearSessionCookie, createAdminSession, hashPassword, sessionCookie, validateCredentials, verifyPassword } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { mode?: "setup" | "login"; username?: string; password?: string };
    const username = cleanText(body.username, 50).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const db = getDb();

    if (body.mode === "setup") {
      if (await adminExists()) return Response.json({ error: "حساب مدیر قبلاً ساخته شده است." }, { status: 409 });
      if (!(await canInitializeAdmin())) return Response.json({ error: "اجازه راه‌اندازی پنل را ندارید." }, { status: 403 });
      const validation = validateCredentials(username, password);
      if (validation) return Response.json({ error: validation }, { status: 400 });
      const secured = await hashPassword(password);
      await db.insert(adminCredentials).values({ id: "primary", username, passwordHash: secured.hash, passwordSalt: secured.salt });
    } else {
      const [admin] = await db.select().from(adminCredentials).where(eq(adminCredentials.username, username)).limit(1);
      if (!admin) return Response.json({ error: "نام کاربری یا رمز عبور نادرست است." }, { status: 401 });
      if (admin.lockedUntil && admin.lockedUntil > new Date().toISOString()) return Response.json({ error: "به‌دلیل تلاش‌های ناموفق، ورود تا ۱۵ دقیقه موقتاً قفل است." }, { status: 429 });
      if (!(await verifyPassword(password, admin.passwordSalt, admin.passwordHash))) {
        const attempts = admin.failedAttempts + 1;
        await db.update(adminCredentials).set({ failedAttempts: attempts >= 5 ? 0 : attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60000).toISOString() : null }).where(eq(adminCredentials.id, admin.id));
        return Response.json({ error: "نام کاربری یا رمز عبور نادرست است." }, { status: 401 });
      }
      await db.update(adminCredentials).set({ failedAttempts: 0, lockedUntil: null, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(adminCredentials.id, admin.id));
    }
    const session = await createAdminSession();
    return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(session.token, session.expiresAt) } });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  const session = await authorizeAdminApi();
  if (!session) return adminUnauthorized();
  try {
    const body = await request.json() as { currentPassword?: string; username?: string; newPassword?: string };
    const username = cleanText(body.username, 50).toLowerCase();
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    const validation = validateCredentials(username, newPassword);
    if (validation) return Response.json({ error: validation }, { status: 400 });
    const db = getDb();
    const [admin] = await db.select().from(adminCredentials).where(eq(adminCredentials.id, "primary")).limit(1);
    if (!admin || !(await verifyPassword(currentPassword, admin.passwordSalt, admin.passwordHash))) return Response.json({ error: "رمز عبور فعلی صحیح نیست." }, { status: 401 });
    const secured = await hashPassword(newPassword);
    await db.batch([
      db.update(adminCredentials).set({ username, passwordHash: secured.hash, passwordSalt: secured.salt, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(adminCredentials.id, "primary")),
      db.delete(adminSessions),
    ]);
    const nextSession = await createAdminSession();
    return Response.json({ ok: true, username }, { headers: { "Set-Cookie": sessionCookie(nextSession.token, nextSession.expiresAt) } });
  } catch (error) { return apiError(error); }
}

export async function DELETE() {
  const session = await authorizeAdminApi();
  if (session) await getDb().delete(adminSessions).where(eq(adminSessions.id, session.sessionId));
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
