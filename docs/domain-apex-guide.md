# oh-alam.my apex + redirect — Cloudflare guide

Goal: make **oh-alam.my** the product URL (the app at the apex), and make the old
**app.oh-alam.my** a 301 redirect to it.

> ⚠️ **Read this first — sequencing matters.**
> Right now `app.oh-alam.my` is served by the **VPS** (SQLite, working) because the
> Cloudflare **D1 free-tier daily row-*read* cap** blew out during the Sep 2026 cutover
> attempt (D1 reads 500 until 00:00 UTC reset). The Worker serves `oh-alam.my` and
> `app.oh-alam.my` only when the cutover is healthy. **Do NOT flip the apex to the
> Worker before the D1 read usage is reduced** (edge-cache `/api/summary`, cut
> notify/ingest read volume), or the apex will show data 500s.
>
> So: do steps 1–4 only after the read-budget fix lands and you re-verify a fresh
> `curl https://<worker>/api/summary` returns 200. Steps under each are what to click.

You have two Cloudflare control surfaces for this:
- **Dashboard** (easiest, ~2 min) — recommended.
- **Wrangler/API** (automated) — optional, if you want it scripted.

---

## Step 1 — Attach the apex `oh-alam.my` to the Worker

**Dashboard:**
1. Cloudflare dashboard → **Workers & Pages** → the **`alam`** Worker.
2. **Settings → Domains & Routes → Custom Domains → Add custom domain**.
3. Type **`oh-alam.my`** → **Add domain** → **Activate domain**.
   (Cloudflare creates the zone/CDN route for the apex automatically.)

**Scripted (optional):**
```
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCT/workers/domains" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"hostname":"oh-alam.my","zone_id":"'$ZONE'","zone_name":"oh-alam.my","service":"alam","environment":"production"}'
```
(Zone id `b46071f6d3d591e4b28963b88644bc38`, account `4fc9eb59c85b0fb8f4ac40636521b53d`.)

> The app uses hash routing (`/#/weather`), so the apex works with no code change.

---

## Step 2 — 301-redirect `app.oh-alam.my` → `oh-alam.my`

Keep the product URL canonical; the old one should forward (keeping the path + query).

**Dashboard → Rules → Redirect Rules → Create rule:**
- **When incoming requests match**: `Hostname equals app.oh-alam.my`
- **Then**: `Dynamic → 301 Permanent Redirect`
- **Expression (type it)**: `https://oh-alam.my${http.request.uri.path}${?http.request.uri.search}`
  - i.e. expression `concat("https://oh-alam.my", http.request.uri.path, http.request.uri.search)`
- **Save.**

The redirect runs at the edge BEFORE any origin, so `app.oh-alam.my` never reaches the
VPS/Worker — every old link, Telegram share URL, or QR now lands on the apex.

**Scripted (optional)** — add a redirect rule to the `http_request_redirect` phase:
```
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE/rulesets/phases/http_request_redirect/entrypoint" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d @redirect-rule.json
```

> Note: the wrangler token (`cfut_…`) is Workers-scoped and may lack *Rules/Redirect*
> permissions — you may need a token with **Zone → Rules → Edit** (or use the dashboard).

---

## Step 3 (optional) — tidy DNS

After the redirect is live, the old `app.oh-alam.my` tunnel CNAME
(`27591de8-…cfargotunnel.com`) is only a fallback that the redirect now short-circuits.
You can leave it (harmless) or delete it for cleanliness:
Dashboard → **oh-alam.my** zone → **DNS** → delete `app.oh-alam.my`.

---

## Step 4 — verify

```
curl -sI https://oh-alam.my/            # 200, cache-control: no-cache
curl -sI https://oh-alam.my/api/summary # 200 (real D1 data — confirms read cap ok)
curl -sI https://app.oh-alam.my/x       # 301 -> https://oh-alam.my/x
curl -sI "https://app.oh-alam.my/#/air" # must 301 (hash preserved over the redirect)
```
Also hard-refresh the app after enabling (index.html is `no-cache`, so it self-heals).

---

## Reminder of the real blocker

The apex going live on the Worker is exactly the **cutover** that the D1 **row-read
cap** previously reversed. Until the reads are trimmed (cache `/api/summary` at the
edge, drop redundant per-station history reads, and tame the notify cron's read
volume), the apex will serve HTML fine but 500 on all data after the cap is spent.
Do the read-budget pass first, re-cutover, then this apex/redirect on top.
