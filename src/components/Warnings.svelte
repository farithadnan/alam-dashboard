<script>
import { app } from "../lib/store.svelte.js";
import { timeAgo, severityColor } from "../lib/flags.js";
import { tr, severityWord } from "../lib/i18n.svelte.js";
import { activeWarnings } from "../lib/warnings.js";
import ShareButton from "./ui/ShareButton.svelte";
import { warningSharePayload } from "../lib/share.js";

const warnings = $derived(activeWarnings(app.data?.hazards?.warnings ?? []));
let openW = $state({});
function toggle(w) {
  openW[w.station + w.measuredAt] = !openW[w.station + w.measuredAt];
}
/** Short "where" line: affected places, capped. */
function where(t) {
  const c = (t || "").replace(/\s+/g, " ").trim();
  const m = c.match(/over the (?:states|waters) of ([\s\S]{3,180}?)(?: until| from|\.|$)/i);
  if (!m) return "";
  const places = m[1].split("•").map((s) => s.trim()).filter(Boolean);
  return places.length > 3 ? places.slice(0, 3).join(", ") + "…" : places.join(", ");
}
</script>

{#if warnings.length}
  <ul class="list-none m-0 border-t border-line p-0">
    {#each warnings as w (w.station + w.measuredAt)}
      <li class="border-b border-line px-2.5 py-3 pl-2">
        <div class="flex items-start gap-2">
          <span class="mt-1.5 size-2.5 shrink-0 rounded-full" style="background:{severityColor(w.severity)}"></span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <div class="text-[14.5px] font-semibold leading-tight">{w.title}</div>
              <ShareButton textOnly payload={warningSharePayload({ title: w.title, text: w.meta?.textEn ?? w.meta?.textBm ?? "", when: timeAgo(w.measuredAt) })} />
            </div>
            <div class="text-[12.5px] text-muted">{w.meta?.titleBm || ""}{#if w.meta?.titleBm} ·{/if} {timeAgo(w.measuredAt)}</div>
            {#if w.meta?.validTo}
              <div class="text-[12px] text-muted">{tr("validUntil")} {new Date(w.meta.validTo).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })}</div>
            {/if}
            {#if w.meta?.textEn}
              {#if where(w.meta.textEn)}<p class="mt-1 text-[12.5px] text-muted">{where(w.meta.textEn)}</p>{/if}
              <button class="ghostbtn mt-2 text-[12px]" onclick={() => toggle(w)} aria-expanded={openW[w.station + w.measuredAt]}>
                {openW[w.station + w.measuredAt] ? tr("hideFull") : tr("readFull")}
              </button>
              {#if openW[w.station + w.measuredAt]}
                <p class="mt-2 text-[12.5px] leading-relaxed text-muted">{w.meta.textEn}</p>
              {/if}
            {/if}
          </div>
          <span class="shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-bold" style="color:{severityColor(w.severity)};background:color-mix(in srgb, {severityColor(w.severity)} 14%, transparent)">{severityWord(w.severity)}</span>
        </div>
      </li>
    {/each}
  </ul>
{/if}
