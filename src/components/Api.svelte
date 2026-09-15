  <script>
    import { SITE } from "../lib/config.js";
    import { tr } from "../lib/i18n.svelte.js";
    import SearchInput from "./ui/SearchInput.svelte";
    import Section from "./ui/Section.svelte";

    const base = SITE.url;
    const CATS = ["Weather", "Air", "Hazards", "System"];
    const ENDPOINTS = [
      { m: "GET", cat: "System", p: "/api", d: "Self-describing index: name, version, endpoints, rate limit. /v1 is an alias." },
      { m: "GET", cat: "Weather", p: "/api/summary?state=Johor&town=johor-bahru", d: "Everything this app shows in one call: weather, AQI, forecast, warnings, earthquakes. Scope to a town to keep it small." },
      { m: "GET", cat: "Weather", p: "/api/official?state=Johor&town=johor-bahru", d: "MET Malaysia's official district forecast and the district it resolved." },
      { m: "GET", cat: "Weather", p: "/api/forecast?source=open-meteo", d: "Daily forecast rows." },
      { m: "GET", cat: "Air", p: "/api/stations", d: "List of known monitoring stations." },
      { m: "GET", cat: "Air", p: "/api/current?source=doe-eqms", d: "Latest observation per station for a source." },
      { m: "GET", cat: "Air", p: "/api/history?source=doe-eqms&station=<slug>&hours=24", d: "Observation history for a station." },
      { m: "GET", cat: "Hazards", p: "/api/hazards", d: "Weather warnings, recent earthquakes and climate phase." },
      { m: "GET", cat: "Hazards", p: "/api/flood?state=Johor", d: "InfoBanjir river levels and heavy-rain alerts (state optional)." },
      { m: "GET", cat: "Hazards", p: "/api/news", d: "Latest Malaysia weather/hazard news items." },
      { m: "GET", cat: "System", p: "/health", d: "Liveness check (not rate-limited)." },
    ];

    let q = $state("");
    let open = $state(null);
    let copied = $state("");
    const copy = async (text) => { try { await navigator.clipboard?.writeText(text); copied = text; setTimeout(() => (copied = ""), 1300); } catch { /* noop */ } };
    const filtered = $derived(ENDPOINTS.filter((e) => `${e.m} ${e.p} ${e.cat} ${e.d}`.toLowerCase().includes(q.trim().toLowerCase())));
    const curlOf = (p) => `curl "${base}${p.replace(/<[^>]+>/g, "{value}")}"`;
    const urlOf = (e) => (e.p.includes("<") ? "" : `${base}${e.p}`); // openable live sample (no placeholders)
    const QS = `# whole Malaysia bundle\ncurl ${base}/api/summary\n\n# a state's water and rain alerts\ncurl "${base}/api/flood?state=Johor"`;
  </script>

  <section class="mx-auto max-w-[72ch] py-6">
    <h2 class="text-[22px] font-bold">{tr("apiTitle")}</h2>
    <p class="mt-2 leading-relaxed">{tr("apiIntro")}</p>

    <div class="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
      <code class="rounded-lg border border-line bg-panel px-2 py-1 font-mono text-[12.5px]">{base}</code>
      <button class="pillfilter" onclick={() => copy(base)}>{copied === base ? "Copied ✓" : "Copy base URL"}</button>
    </div>
    <p class="caption mt-2">{tr("apiNote")}<br class="sm:hidden" /> {tr("apiConventions")}</p>

    <h3 class="mt-6 text-[15px] font-bold">{tr("apiTry")}</h3>
    <pre class="mt-2 overflow-auto rounded-xl border border-line bg-panel p-3 text-[12px] leading-relaxed">{QS}</pre>
    <button class="pillfilter mt-2" onclick={() => copy(QS)}>{copied === QS ? "Copied ✓" : "Copy quickstart"}</button>

    <div class="mt-6 mb-2 flex flex-wrap items-center justify-between gap-2">
      <h3 class="qh mb-0">Endpoints</h3>
      <SearchInput bind:value={q} placeholder={tr("searchEndpoints")} ariaLabel={tr("searchEndpoints")} class="max-w-[240px]" />
    </div>

    {#if filtered.length}
      {#each CATS as cat (cat)}
        {@const items = filtered.filter((e) => e.cat === cat)}
        {#if items.length}
          <Section title={cat} startOpen={!q}>
            <ul class="list-none m-0 p-0">
              {#each items as e (e.p)}
                <li class="border-b border-line">
                  <button class="flex w-full items-center gap-2 px-2.5 py-2.5 text-left" onclick={() => (open = open === e.p ? null : e.p)} aria-expanded={open === e.p}>
                    <span class="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent">{e.m}</span>
                    <code class="min-w-0 flex-1 break-all font-mono text-[13px]">{e.p}</code>
                    <span class="font-mono text-muted">{open === e.p ? "−" : "+"}</span>
                  </button>
                  <p class="px-2.5 pb-1 text-[13px] text-muted">{e.d}</p>
                  {#if open === e.p}
                    <pre class="mx-2.5 mb-1.5 overflow-auto rounded-lg border border-line bg-panel p-2 text-[12px]">{curlOf(e.p)}</pre>
                    <div class="mx-2.5 mb-2.5 flex gap-2">
                      <button class="pillfilter" onclick={() => copy(curlOf(e.p))}>{copied === curlOf(e.p) ? "Copied ✓" : "Copy"}</button>
                      {#if urlOf(e)}
                        <a class="pillfilter" href={urlOf(e)} target="_blank" rel="noopener">Open in browser ↗</a>
                      {/if}
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          </Section>
        {/if}
      {/each}
    {:else}
      <p class="caption">No endpoints match “{q}”.</p>
    {/if}
  </section>
