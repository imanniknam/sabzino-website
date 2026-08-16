import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../db";
import { orderItems, orders } from "../../db/schema";
import { requireCustomerPage } from "../../lib/customer-auth";
import { ensureCustomer } from "../../lib/customers";
import AccountDashboard from "./AccountDashboard";
import "./account.css";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const identity = await requireCustomerPage("/account");
  const profile = await ensureCustomer(identity);
  const db = getDb();
  const customerOrders = await db.select().from(orders)
    .where(eq(orders.customerId, identity.userId))
    .orderBy(desc(orders.createdAt));
  const items = customerOrders.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, customerOrders.map(order => order.id)))
    : [];
  const orderHistory = customerOrders.map(order => ({ ...order, items: items.filter(item => item.orderId === order.id) }));
  return <AccountDashboard profile={profile} orders={orderHistory} />;
}
