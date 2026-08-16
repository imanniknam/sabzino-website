import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { orders } from "../../../../db/schema";
import { adminUnauthorized, authorizeAdminApi } from "../../../../lib/admin-auth";
import { apiError, cleanText } from "../../../../lib/api";

const statuses = ["pending_payment", "processing", "packed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];

export async function PATCH(request: Request) {
  if (!(await authorizeAdminApi())) return adminUnauthorized();
  try {
    const body = await request.json() as { id?: string; status?: string; paymentStatus?: string };
    const id = cleanText(body.id, 80);
    const changes: { status?: string; paymentStatus?: string; updatedAt: ReturnType<typeof sql> } = { updatedAt: sql`CURRENT_TIMESTAMP` };
    if (body.status && statuses.includes(body.status)) changes.status = body.status;
    if (body.paymentStatus && paymentStatuses.includes(body.paymentStatus)) changes.paymentStatus = body.paymentStatus;
    if (!id || (!changes.status && !changes.paymentStatus)) return Response.json({ error: "تغییر معتبر نیست." }, { status: 400 });
    const db = getDb();
    const [order] = await db.update(orders).set(changes).where(eq(orders.id, id)).returning();
    if (!order) return Response.json({ error: "سفارش پیدا نشد." }, { status: 404 });
    return Response.json({ order });
  } catch (error) { return apiError(error); }
}
