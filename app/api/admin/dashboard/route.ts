import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { newsletterSubscribers, orderItems, orders, products } from "../../../../db/schema";
import { adminUnauthorized, authorizeAdminApi } from "../../../../lib/admin-auth";
import { apiError } from "../../../../lib/api";

export async function GET() {
  if (!(await authorizeAdminApi())) return adminUnauthorized();
  try {
    const db = getDb();
    const [orderRows, productRows, subscriberRows, revenueRows, lowStockRows] = await Promise.all([
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100),
      db.select().from(products).where(eq(products.isDeleted, false)).orderBy(products.name),
      db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)).limit(200),
      db.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)`, count: sql<number>`count(*)` }).from(orders),
      db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.stock} <= 5 and ${products.isDeleted} = 0`),
    ]);
    const ids = orderRows.map(order => order.id);
    const itemRows = ids.length ? await db.select().from(orderItems).where(sql`${orderItems.orderId} in (${sql.join(ids.map(id => sql`${id}`), sql`,`)})`) : [];
    return Response.json({
      orders: orderRows.map(order => ({ ...order, items: itemRows.filter(item => item.orderId === order.id) })),
      products: productRows,
      subscribers: subscriberRows,
      stats: { orders: Number(revenueRows[0]?.count || 0), revenue: Number(revenueRows[0]?.total || 0), lowStock: Number(lowStockRows[0]?.count || 0), subscribers: subscriberRows.filter(item => item.status === "active").length },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
