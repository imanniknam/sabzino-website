import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { orderItems, orders, products } from "../../../db/schema";
import { catalog } from "../../../lib/catalog";
import { apiError, cleanText } from "../../../lib/api";
import { getCustomerIdentity } from "../../../lib/customer-auth";
import { ensureCustomer } from "../../../lib/customers";
import { PaymentGatewayError, requestZarinpalPayment } from "../../../lib/zarinpal";

type OrderPayload = {
  customer?: { fullName?: string; phone?: string; province?: string; city?: string; address?: string; postalCode?: string; unit?: string; note?: string };
  shippingMethod?: "standard" | "express";
  items?: Array<{ productId?: string; quantity?: number }>;
};

function orderNumber() {
  return `SBZ-${new Date().getFullYear()}${String(Date.now()).slice(-7)}`;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as OrderPayload;
    const customer = payload.customer || {};
    const fullName = cleanText(customer.fullName, 120);
    const phone = cleanText(customer.phone, 20).replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    const province = cleanText(customer.province, 60);
    const city = cleanText(customer.city, 60);
    const address = cleanText(customer.address, 500);
    const postalCode = cleanText(customer.postalCode, 20).replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    if (!fullName || !/^09\d{9}$/.test(phone) || !province || !city || !address || !/^\d{10}$/.test(postalCode)) return Response.json({ error: "اطلاعات گیرنده کامل یا معتبر نیست." }, { status: 400 });
    const normalized = (payload.items || []).filter(item => item.productId && Number.isInteger(item.quantity) && Number(item.quantity) > 0 && Number(item.quantity) <= 20).map(item => ({ productId: item.productId!, quantity: Number(item.quantity) }));
    if (!normalized.length) return Response.json({ error: "سبد خرید خالی است." }, { status: 400 });

    const db = getDb();
    // A single insert for the full catalogue can exceed D1's bound-variable
    // limit. Chunking also keeps checkout working when more products are added.
    for (let offset = 0; offset < catalog.length; offset += 8) {
      await db.insert(products).values(catalog.slice(offset, offset + 8).map(item => ({ ...item, isActive: true }))).onConflictDoNothing();
    }
    const productRows = await db.select().from(products).where(and(inArray(products.id, normalized.map(i => i.productId)), eq(products.isActive, true), eq(products.isDeleted, false)));
    if (productRows.length !== new Set(normalized.map(i => i.productId)).size) return Response.json({ error: "یکی از محصولات دیگر قابل سفارش نیست." }, { status: 409 });
    const lines = normalized.map(item => {
      const product = productRows.find(row => row.id === item.productId)!;
      if (product.stock < item.quantity) throw new Error(`موجودی «${product.name}» کافی نیست.`);
      return { product, quantity: item.quantity, lineTotal: product.price * item.quantity };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const shippingMethod = payload.shippingMethod === "express" ? "express" : "standard";
    const shippingCost = shippingMethod === "express" ? 99000 : 69000;
    const id = crypto.randomUUID();
    const number = orderNumber();
    const total = subtotal + shippingCost;
    const identity = await getCustomerIdentity();
    if (identity) await ensureCustomer(identity);
    const payment = await requestZarinpalPayment({ amountToman: total, orderId: id, orderNumber: number, mobile: phone });
    await db.batch([
      db.insert(orders).values({ id, customerId: identity?.userId ?? null, orderNumber: number, fullName, phone, province, city, address, postalCode, unit: cleanText(customer.unit, 80), note: cleanText(customer.note, 500), shippingMethod, subtotal, shippingCost, total, paymentAuthority: payment.authority }),
      ...lines.map(line => db.insert(orderItems).values({ orderId: id, productId: line.product.id, productName: line.product.name, unitPrice: line.product.price, quantity: line.quantity, lineTotal: line.lineTotal })),
      ...lines.map(line => db.update(products).set({ stock: sql`${products.stock} - ${line.quantity}`, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(products.id, line.product.id))),
    ]);
    return Response.json({ order: { id, orderNumber: number, subtotal, shippingCost, total, paymentStatus: "pending", status: "pending_payment" }, paymentUrl: payment.paymentUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("موجودی")) return Response.json({ error: error.message }, { status: 409 });
    if (error instanceof PaymentGatewayError) {
      console.error("Zarinpal payment request failed", { code: error.code, message: error.message });
      return Response.json({ error: error.message }, { status: 502 });
    }
    return apiError(error);
  }
}
