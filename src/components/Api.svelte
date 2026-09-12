  <script>
    import { SITE } from "../lib/config.js";
    import { tr } from "../lib/i18n.svelte.js";

    const base = SITE.url;
    const ENDPOINTS = [
      { m: "GET", p: "/api", d: "Self-describing index: name, version, endpoints, rate limit. /v1 is an alias." },
      { m: "GET", p: "/api/summary?state=Johor&town=johor-bahru", d: "Everything this app shows in one call: weather, AQI, forecast, hourly, warnings, earthquakes. Scope to a town to keep it small." },
      { m: "GET", p: "/api/official?state=Johor&town=johor-bahru", d: "MET Malaysia's official district forecast and the district it resolved." },
      { m: "GET", p: "/api/stations", d: "List of known monitoring stations." },
      { m: "GET", p: "/api/current?source=doe-eqms", d: "Latest observation per station for a source." },
      { m: "GET", p: "/api/history?source=doe-eqms&station=<slug>&hours=24", d: "Observation history for a station." },
      { m: "GET", p: "/api/forecast?source=open-meteo", d: "Daily forecast rows." },
      { m: "GET", p: "/api/hazards", d: "Weather warnings, recent earthquakes and climate phase." },
      { m: "GET", p: "/api/flood", d: "InfoBanjir river levels and heavy-rain alerts (optionally ?state=)." },
      { m: "GET", p: "/api/news", d: "Latest Malaysia weather/hazard news items." },
      { m: "GET", p: "/health", d: "Liveness check (not rate-limited)." },
    ];
    const CURL = `# whole Malaysia bundle
curl ${base}/api/summary

# one town, small payload
curl "${base}/api/summary?state=Johor&town=johor-bahru"

# live flood alerts for a state
curl "${base}/api/flood?state=Johor"`;
  </script>

  <section class="mx-auto max-w-[72ch] py-6">
    <h2 class="text-[22px] font-bold">{tr("apiTitle")}</h2>
    <p class="mt-2 leading-relaxed">{tr("apiIntro")}</p>
    <p class="caption mt-2">{tr("apiNote")}</p>
    <p class="caption mt-1">{tr("apiLimit")}</p>

    <h3 class="mt-6 text-[15px] font-bold">{tr("apiTry")}</h3>
    <pre class="mt-2 overflow-auto rounded-xl border border-line bg-panel p-3 text-[12px] leading-relaxed">{CURL}</pre>

    <ul class="mt-6 list-none space-y-3 p-0">
      {#each ENDPOINTS as e (e.p)}
        <li class="border-b border-line pb-3">
          <div class="flex items-baseline gap-2">
            <span class="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent">{e.m}</span>
            <code class="font-mono text-[13px] break-all">{e.p}</code>
          </div>
          <p class="mt-1 text-[13px] text-muted">{e.d}</p>
        </li>
      {/each}
    </ul>
  </section>
