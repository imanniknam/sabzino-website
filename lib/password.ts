const ITERATIONS = 210_000;
const bytesToBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0));

export async function hashPassword(password: string, salt?: string) {
  const saltBytes = salt ? base64ToBytes(salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: ITERATIONS }, key, 256);
  return { hash: bytesToBase64(new Uint8Array(bits)), salt: bytesToBase64(saltBytes) };
}

export async function verifyPassword(password: string, salt: string, expected: string) {
  const result = await hashPassword(password, salt);
  if (result.hash.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < result.hash.length; index++) mismatch |= result.hash.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0;
}

export function validatePassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}
