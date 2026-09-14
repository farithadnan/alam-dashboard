  <script>
    import { app } from "../lib/store.svelte.js";
    import { numColor, atTown } from "../lib/flags.js";
    import { wmo, isNightNow } from "../lib/weather-codes.js";
    import { bandLabel } from "../lib/i18n.svelte.js";
    import { sharePayload, shareOutlook, telegramAlertsUrl } from "../lib/share.js";
    import { tr, trFmt } from "../lib/i18n.svelte.js";

    const weather = $derived(app.data?.weather ?? []);
    const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
    const townName = $derived(weather.find((r) => r.station === app.town)?.stationName ?? app.data?.allTowns?.find((t) => t.station === app.town)?.name ?? app.town ?? "");
    const now = $derived(weather.find((r) => r.station === app.town && r.kind === "weather"));
    const air = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
    const townAir = $derived(stations.find((s) => atTown(s, townName, app.town)) ?? null);
    const payload = $derived(sharePayload({ town: townName, state: app.state, now, townAir, air }));
    const rows = $derived(shareOutlook(payload));
    const botUrl = $derived(telegramAlertsUrl(app.town, app.state));
  </script>

  <h1 class="qh">{tr("sharePreviewTitle")}</h1>
  <p class="caption -mt-1 mb-2">{trFmt("sharePreviewFor", { place: [townName, app.state].filter(Boolean).join(", ") || "Malaysia" })}</p>

  <div class="overflow-hidden rounded-xl border border-line">
    <table class="w-full border-collapse text-[13px]">
      <thead>
        <tr class="border-b border-line text-left text-[11.5px] uppercase tracking-wide text-muted">
          <th class="px-3 py-2">{tr("chan")}</th>
          <th class="px-3 py-2">{tr("whatSent")}</th>
          <th class="px-3 py-2">{tr("action")}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as r (r.channel)}
          <tr class="border-b border-line align-top last:border-0">
            <td class="whitespace-nowrap px-3 py-2 font-medium"><span class="mr-1.5">{r.icon}</span>{r.channel}</td>
            <td class="px-3 py-2"><div class="whitespace-pre-wrap break-words text-[12.5px]">{r.message}</div></td>
            <td class="whitespace-nowrap px-3 py-2">
              {#if r.link}
                <a class="ghostbtn !min-h-0 !px-2.5 !py-1 text-[12px]" href={r.link} target="_blank" rel="noopener">{tr("open")}</a>
              {:else}{tr("nAutomatic")}{/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if botUrl}
    <p class="caption mt-2 text-[12.5px]">
      {tr("sharePreviewBot")}
      <a class="underline hover:text-accent" href={botUrl} target="_blank" rel="noopener">alamalerts_bot</a> — {trFmt("sharePreviewBotHint", { place: townName })}
    </p>
  {/if}

  <p class="caption mt-3 text-[11.5px] text-muted">{tr("sharePreviewNote")}</p>
