import { and, eq, gt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../db";
import { adminCredentials, adminSessions } from "../db/schema";
import { hashPassword, verifyPassword } from "./password";

export const ADMIN_COOKIE = "sabzino_admin_session";
const SESSION_DAYS = 7;

const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64(new Uint8Array(bytes));
}

export { hashPassword, verifyPassword };

export async function isLocalAdminRequest() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host")?.split(":")[0] ?? "";
  const hasProxyOrigin = Boolean(requestHeaders.get("x-forwarded-for") || requestHeaders.get("x-real-ip") || requestHeaders.get("cf-connecting-ip"));
  return !hasProxyOrigin && (host === "localhost" || host === "127.0.0.1" || host === "::1");
}

function cookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader?.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

export async function getAdminSession() {
  const requestHeaders = await headers();
  const token = cookieValue(requestHeaders.get("cookie"), ADMIN_COOKIE);
  if (!token) return null;
  const db = getDb();
  const tokenHash = await digest(token);
  const now = new Date().toISOString();
  const [session] = await db.select().from(adminSessions).where(and(eq(adminSessions.tokenHash, tokenHash), gt(adminSessions.expiresAt, now))).limit(1);
  if (!session) return null;
  const [admin] = await db.select().from(adminCredentials).where(eq(adminCredentials.id, "primary")).limit(1);
  return admin ? { id: admin.id, username: admin.username, sessionId: session.id } : null;
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return { displayName: session.username, username: session.username };
}

export async function authorizeAdminApi() {
  return getAdminSession();
}

export async function canInitializeAdmin() {
  const db = getDb();
  const [credential] = await db.select({ id: adminCredentials.id }).from(adminCredentials).limit(1);
  if (credential) return false;
  // Initial setup is intentionally restricted to a direct loopback request.
  // The VPS installer performs this request before exposing the admin panel.
  return isLocalAdminRequest();
}

export async function adminExists() {
  const db = getDb();
  const [credential] = await db.select({ id: adminCredentials.id }).from(adminCredentials).limit(1);
  return Boolean(credential);
}

export async function createAdminSession() {
  const db = getDb();
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await db.delete(adminSessions).where(sql`${adminSessions.expiresAt} <= ${new Date().toISOString()}`);
  await db.insert(adminSessions).values({ id: crypto.randomUUID(), tokenHash: await digest(token), expiresAt });
  return { token, expiresAt };
}

export function sessionCookie(token: string, expiresAt: string) {
  const secure = process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Expires=${new Date(expiresAt).toUTCString()}${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false";
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
}

export function validateCredentials(username: string, password: string) {
  if (username.length < 3 || username.length > 50) return "نام کاربری باید بین ۳ تا ۵۰ نویسه باشد.";
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return "رمز عبور باید حداقل ۱۰ نویسه و شامل حرف و عدد باشد.";
  return null;
}

export function adminUnauthorized() {
  return Response.json({ error: "نشست مدیریت معتبر نیست. دوباره وارد شوید." }, { status: 401 });
}
