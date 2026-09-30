<script>
    import { severityColor } from "../../domain/flags.js";
    import { tr, severityWord } from "../../core/i18n.svelte.js";
    import Icon from "../../ui/Icon.svelte";

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
    <div class="mt-3 space-y-2" role="region" aria-label={tr("activeAlerts")}>
      <div class="flex items-center gap-2 text-[13px] font-bold" style="color:{maxC}">
        <Icon name="alert" size={15} /> {top.length} {tr("activeAlerts")}
      </div>
      {#each top as w (w.station + w.measuredAt)}
        {@const c = severityColor(w.severity)}
        {@const sevN = sev(w)}
        <div class="overflow-hidden rounded-2xl border p-3.5" style="border-color:color-mix(in srgb,{c} 45%, var(--color-line));background:color-mix(in srgb, {c} {sevN >= 3 ? 9 : 5}%, var(--color-panel))">
          <div class="flex items-start gap-3">
            <span class="grid size-9 shrink-0 place-items-center rounded-xl" style="background:color-mix(in srgb,{c} 16%, transparent);color:{c}"><Icon name="alert" size={17} /></span>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div class="text-[14.5px] font-bold leading-snug" style="color:{c}">{w.title}</div>
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold" style="color:{c};background:color-mix(in srgb, {c} 15%, transparent)">{severityWord(w.severity)}</span>
              </div>
              {#if w.meta?.validTo}
                <div class="mt-1 text-[12px] text-muted">{tr("validUntil")} {date(w.meta.validTo)}</div>
              {/if}
              {#if onRead}
                <button class="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold" style="color:{c}" onclick={() => onRead(w)}>{tr("readFull")} <Icon name="arrowRight" size={13} /></button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
      {#if warnings.length > 2 && onAll}
        <button class="w-full py-1 text-[12.5px] font-semibold text-muted underline" onclick={() => onAll()}>{tr("seeAllWarnings")}</button>
      {/if}
    </div>
  {:else if extraCalm}
    <div class="mt-3 flex items-center gap-3 rounded-2xl border p-3.5" style="border-color:color-mix(in srgb,#16a34a 40%, var(--color-line));background:color-mix(in srgb,#16a34a 7%, var(--color-panel))">
      <span class="grid size-9 shrink-0 place-items-center rounded-xl" style="background:color-mix(in srgb,#16a34a 15%,transparent);color:#16a34a"><Icon name="check" size={18} /></span>
      <span class="text-[13px]"><span class="font-bold text-fg">{tr("allClearTitle")}</span><span class="text-muted"> — {tr("allClearBody")}</span></span>
    </div>
  {:else}
    <div class="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-panel p-3.5 text-[13px] text-muted">
      <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-panel-2 text-faint"><Icon name="shield" size={17} /></span>{tr("noActiveWarnings")}
    </div>
  {/if}