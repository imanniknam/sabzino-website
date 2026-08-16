import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { products } from "../../../db/schema";
import { catalog } from "../../../lib/catalog";

async function seedCatalog() {
  const db = getDb();
  // D1 limits the number of bound variables in one statement. Keep each
  // catalogue upsert comfortably below that limit as the catalogue grows.
  for (let offset = 0; offset < catalog.length; offset += 8) {
    await db.insert(products).values(catalog.slice(offset, offset + 8).map(item => ({ ...item, isActive: true }))).onConflictDoNothing();
  }
  return db;
}

export async function GET() {
  try {
    const db = await seedCatalog();
    const rows = await db.select().from(products).where(and(eq(products.isActive, true), eq(products.isDeleted, false))).orderBy(asc(products.name));
    return Response.json({ products: rows }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ products: catalog, source: "fallback" });
  }
}
