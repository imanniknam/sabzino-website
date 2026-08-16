import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { customers } from "../db/schema";
import type { CustomerIdentity } from "./customer-auth";

export async function ensureCustomer(user: CustomerIdentity) {
  const [customer] = await getDb().select().from(customers).where(eq(customers.id, user.userId)).limit(1);
  if (!customer) throw new Error("حساب مشتری پیدا نشد.");
  return customer;
}
