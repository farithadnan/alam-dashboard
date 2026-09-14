// Cloudflare Pages Function: proxies /api/* to the udara-api origin.
// Set the UDARA_API_ORIGIN environment variable (Pages → Settings → Environment variables)
// to a stable public origin, e.g. https://udara-api.farithadnan.net
function proxyError(message) {
  return new Response(JSON.stringify({ error: `api origin unavailable: ${message}` }), {
    status: 502,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function onRequest(context) {
  const origin = context.env.UDARA_API_ORIGIN || "";
  if (!origin) return proxyError("set the UDARA_API_ORIGIN environment variable (Pages → Settings → Environment variables)");
  const url = new URL(context.request.url);
  const target = origin + url.pathname + url.search;
  try {
    const up = await fetch(target, { headers: { accept: "application/json" } });
    return new Response(up.body, {
      status: up.status,
      headers: { "content-type": up.headers.get("content-type") ?? "application/json; charset=utf-8" },
    });
  } catch (err) {
    return proxyError(err && err.message ? err.message : String(err));
  }
}
