import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { newsletterSubscribers } from "../../../../db/schema";
import { adminUnauthorized, authorizeAdminApi } from "../../../../lib/admin-auth";
import { apiError } from "../../../../lib/api";

export async function PATCH(request: Request) {
  if (!(await authorizeAdminApi())) return adminUnauthorized();
  try {
    const body = await request.json() as { id?: number; status?: string };
    if (!Number.isInteger(body.id) || !["active", "unsubscribed"].includes(body.status || "")) return Response.json({ error: "درخواست معتبر نیست." }, { status: 400 });
    const db = getDb();
    const [subscriber] = await db.update(newsletterSubscribers).set({ status: body.status! }).where(eq(newsletterSubscribers.id, body.id!)).returning();
    return Response.json({ subscriber });
  } catch (error) { return apiError(error); }
}
