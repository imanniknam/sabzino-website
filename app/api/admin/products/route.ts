import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { products } from "../../../../db/schema";
import { adminUnauthorized, authorizeAdminApi } from "../../../../lib/admin-auth";
import { apiError, cleanText } from "../../../../lib/api";

export async function PATCH(request: Request) {
  if (!(await authorizeAdminApi())) return adminUnauthorized();
  try {
    const body = await request.json() as { id?: string; name?: string; category?: string; description?: string; image?: string; price?: number; stock?: number; isActive?: boolean };
    const id = cleanText(body.id, 80);
    const price = Number(body.price);
    const stock = Number(body.stock);
    if (!id || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return Response.json({ error: "قیمت یا موجودی معتبر نیست." }, { status: 400 });
    const db = getDb();
    const changes = {
      price, stock, isActive: body.isActive !== false,
      ...(body.name !== undefined ? { name: cleanText(body.name, 120) } : {}),
      ...(body.category !== undefined ? { category: cleanText(body.category, 80) } : {}),
      ...(body.description !== undefined ? { description: cleanText(body.description, 500) } : {}),
      ...(body.image !== undefined ? { image: cleanText(body.image, 300) } : {}),
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };
    if (("name" in changes && !changes.name) || ("category" in changes && !changes.category) || ("image" in changes && !changes.image.startsWith("/images/"))) return Response.json({ error: "مشخصات محصول معتبر نیست." }, { status: 400 });
    const [product] = await db.update(products).set(changes).where(eq(products.id, id)).returning();
    if (!product) return Response.json({ error: "محصول پیدا نشد." }, { status: 404 });
    return Response.json({ product });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  if (!(await authorizeAdminApi())) return adminUnauthorized();
  try {
    const body = await request.json() as { name?: string; category?: string; description?: string; image?: string; price?: number; stock?: number };
    const name = cleanText(body.name, 120);
    const category = cleanText(body.category, 80);
    const description = cleanText(body.description, 500);
    const image = cleanText(body.image, 300);
    const price = Number(body.price);
    const stock = Number(body.stock);
    if (!name || !category || !description || !image.startsWith("/images/") || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return Response.json({ error: "اطلاعات محصول کامل یا معتبر نیست." }, { status: 400 });
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product"}-${crypto.randomUUID().slice(0, 8)}`;
    const db = getDb();
    const [product] = await db.insert(products).values({ id, name, category, description, image, price, stock, isActive: true, isDeleted: false }).returning();
    return Response.json({ product }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request) {
  if (!(await authorizeAdminApi())) return adminUnauthorized();
  try {
    const body = await request.json() as { id?: string };
    const id = cleanText(body.id, 80);
    if (!id) return Response.json({ error: "شناسه محصول معتبر نیست." }, { status: 400 });
    const db = getDb();
    const [product] = await db.update(products).set({ isActive: false, isDeleted: true, deletedAt: sql`CURRENT_TIMESTAMP`, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(products.id, id)).returning();
    if (!product) return Response.json({ error: "محصول پیدا نشد." }, { status: 404 });
    return Response.json({ deleted: true });
  } catch (error) { return apiError(error); }
}
