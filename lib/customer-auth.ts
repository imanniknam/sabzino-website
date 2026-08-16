import { and, eq, gt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { customers, customerSessions } from "../db/schema";

export const CUSTOMER_COOKIE = "sabzino_customer_session";
const SESSION_DAYS = 30;

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(bytes));
}
function cookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader?.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

export type CustomerIdentity = { userId: string; email: string | null; displayName: string; fullName: string | null; sessionId: string };

export async function getCustomerIdentity(): Promise<CustomerIdentity | null> {
  const requestHeaders = await headers();
  const token = cookieValue(requestHeaders.get("cookie"), CUSTOMER_COOKIE);
  if (!token) return null;
  const db = getDb();
  const now = new Date().toISOString();
  const [session] = await db.select().from(customerSessions).where(and(eq(customerSessions.tokenHash, await digest(token)), gt(customerSessions.expiresAt, now))).limit(1);
  if (!session) return null;
  const [customer] = await db.select().from(customers).where(eq(customers.id, session.customerId)).limit(1);
  if (!customer) return null;
  return { userId: customer.id, email: customer.email, fullName: customer.fullName || null, displayName: customer.fullName || customer.phone || customer.email || "مشتری سبزینو", sessionId: session.id };
}

export async function requireCustomerPage(returnTo = "/account") {
  const identity = await getCustomerIdentity();
  if (!identity) redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
  return identity;
}

export async function createCustomerSession(customerId: string) {
  const db = getDb();
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await db.delete(customerSessions).where(sql`${customerSessions.expiresAt} <= ${new Date().toISOString()}`);
  await db.insert(customerSessions).values({ id: crypto.randomUUID(), customerId, tokenHash: await digest(token), expiresAt });
  return { token, expiresAt };
}

export function customerSessionCookie(token: string, expiresAt: string) {
  const secure = process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false";
  return `${CUSTOMER_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}${secure ? "; Secure" : ""}`;
}
export function clearCustomerCookie() {
  const secure = process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false";
  return `${CUSTOMER_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
}
export function customerUnauthorized() {
  return Response.json({ error: "برای مشاهده حساب کاربری ابتدا وارد شوید." }, { status: 401 });
}
