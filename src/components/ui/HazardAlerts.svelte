  <script>
    import { severityColor } from "../../lib/flags.js";
    import { tr, severityWord } from "../../lib/i18n.svelte.js";

    /** Active warnings, already run through activeWarnings() and sorted by severity. */
    let { warnings = [], onRead = null, onAll = null, extraCalm = false } = $props();

    // Hierarchy: 0-2 highest-severity items as banners; anything more is one "see all".
    const top = $derived(warnings.slice().sort(
      (a, b) => (sev(b) - sev(a)) || String(b.measuredAt).localeCompare(String(a.measuredAt)),
    ).slice(0, 2));

    function sev(w) {
      switch (w?.severity) {
        case "Danger": case "Warning": return 4;
        case "High": case "Severe": return 3;
        case "Moderate": return 2;
        default: return 1;
      }
    }
    const date = (iso) => new Date(iso).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" });
  </script>

  {#if top.length}
    {@const maxC = severityColor(top[0]?.severity)}
    {@const critical = top.some((w) => sev(w) >= 3)}
    <div class="mt-3 space-y-2" role="region" aria-label={tr("activeAlerts")}>
      <div class="flex items-center gap-2 rounded-xl px-3 py-2" style="background:color-mix(in srgb, {maxC} 12%, transparent);border:1px solid {maxC}">
        <span aria-hidden="true" class="text-[15px] leading-none" style="color:{maxC}">⚠️</span>
        <span class="text-[13px] font-bold" style="color:{maxC}">{top.length} {tr("activeAlerts")}</span>
      </div>
      {#each top as w (w.station + w.measuredAt)}
        {@const c = severityColor(w.severity)}
        {@const sevN = sev(w)}
        <div class="rounded-xl border px-3 {sevN >= 3 ? 'py-4' : 'py-3'}" style="border-color:{c};border-width:{sevN >= 3 ? '2px' : '1px'};background:color-mix(in srgb, {c} {sevN >= 3 ? 14 : 8}%, transparent)">
          <div class="flex items-start gap-2.5">
            {#if sevN >= 3}
              <span aria-hidden="true" class="mt-0.5 text-[18px] leading-none" style="color:{c}">⚠️</span>
            {:else}
              <span class="mt-1.5 size-3 shrink-0 rounded-full" style="background:{c}"></span>
            {/if}
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="text-[{sevN >= 3 ? 16 : 14}px] font-bold leading-tight" style="color:{c}">{w.title}</div>
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold" style="color:{c};background:color-mix(in srgb, {c} 14%, transparent)">{severityWord(w.severity)}</span>
              </div>
              {#if w.meta?.validTo}
                <div class="mt-0.5 text-[12px] text-muted">{tr("validUntil")} {date(w.meta.validTo)}</div>
              {/if}
              {#if onRead}
                <button class="mt-1.5 text-[12.5px] font-semibold underline" style="color:{c}" onclick={() => onRead(w)}>{tr("readFull")} →</button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
      {#if warnings.length > 2 && onAll}
        <button class="w-full py-1 text-[12.5px] text-muted underline" onclick={() => onAll()}>{tr("seeAllWarnings")}</button>
      {/if}
    </div>
  {:else if extraCalm}
    <p class="mt-3 flex items-center gap-2 rounded-xl border px-3 py-3" style="border-color:#2e7d32;background:color-mix(in srgb,#2e7d32 8%,transparent)">
      <span aria-hidden="true">🟢</span>
      <span class="text-[13px]">
        <span class="font-bold" style="color:#2e7d32">{tr("allClearTitle")}</span>
        <span class="text-muted"> — {tr("allClearBody")}</span>
      </span>
    </p>
  {:else}
    <p class="mt-3 flex items-center gap-2 rounded-xl border border-line px-3 py-3 text-[13px] text-muted">
      <span aria-hidden="true">🛡️</span>{tr("noActiveWarnings")}
    </p>
  {/if}
