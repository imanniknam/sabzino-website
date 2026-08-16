import { desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { customers, orderItems, orders } from "../../../db/schema";
import { apiError, cleanText } from "../../../lib/api";
import { customerUnauthorized, getCustomerIdentity } from "../../../lib/customer-auth";
import { ensureCustomer } from "../../../lib/customers";

type ProfilePayload = {
  fullName?: string;
  phone?: string;
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  unit?: string;
};

const normalizeDigits = (value: string) => value
  .replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
  .replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

export async function GET() {
  try {
    const identity = await getCustomerIdentity();
    if (!identity) return customerUnauthorized();
    const customer = await ensureCustomer(identity);
    const db = getDb();
    const customerOrders = await db.select().from(orders)
      .where(eq(orders.customerId, identity.userId))
      .orderBy(desc(orders.createdAt));
    const items = customerOrders.length
      ? await db.select().from(orderItems).where(inArray(orderItems.orderId, customerOrders.map(order => order.id)))
      : [];
    return Response.json({
      profile: customer,
      orders: customerOrders.map(order => ({ ...order, items: items.filter(item => item.orderId === order.id) })),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const identity = await getCustomerIdentity();
    if (!identity) return customerUnauthorized();
    await ensureCustomer(identity);
    const payload = await request.json() as ProfilePayload;
    const phone = normalizeDigits(cleanText(payload.phone, 20));
    const postalCode = normalizeDigits(cleanText(payload.postalCode, 20));
    if (phone && !/^09\d{9}$/.test(phone)) {
      return Response.json({ error: "شماره همراه باید با ۰۹ شروع شود و ۱۱ رقم باشد." }, { status: 400 });
    }
    if (postalCode && !/^\d{10}$/.test(postalCode)) {
      return Response.json({ error: "کد پستی باید ۱۰ رقم باشد." }, { status: 400 });
    }
    const db = getDb();
    await db.update(customers).set({
      fullName: cleanText(payload.fullName, 120),
      phone,
      province: cleanText(payload.province, 60),
      city: cleanText(payload.city, 60),
      address: cleanText(payload.address, 500),
      postalCode,
      unit: cleanText(payload.unit, 80),
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(eq(customers.id, identity.userId));
    const [profile] = await db.select().from(customers).where(eq(customers.id, identity.userId)).limit(1);
    return Response.json({ profile });
  } catch (error) {
    return apiError(error);
  }
}
