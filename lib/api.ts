export function apiError(error: unknown, fallback = "خطایی رخ داد. دوباره تلاش کنید.") {
  console.error(error);
  // Never expose database queries, stack traces, provider responses or other
  // internal error details to public clients.
  return Response.json({ error: fallback }, { status: 500 });
}

export function cleanText(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
