<script>
  import { app } from "../../lib/store.svelte.js";
  import { tr, trFmt } from "../../lib/i18n.svelte.js";
  import { getFlood } from "../../lib/api.js";

    /** Live InfoBanjir river-level + heavy-rain alerts for the saved state. */
    let data = $state({ river: [], rain: [] });
    let loading = $state(false);
    let seq = 0;

    const sevColor = (s) =>
      ({ Danger: "var(--color-vunhealthy)", Warning: "var(--color-unhealthy)", Alert: "var(--color-moderate)", Heavy: "var(--color-unhealthy)", Moderate: "var(--color-moderate)" })[s] ?? "var(--color-muted)";

    // Latest-wins: a slower earlier response cannot overwrite a newer one.
    $effect(() => {
      const st = app.state;
      if (!st) return;
      const id = ++seq;
      loading = true;
      getFlood(st)
        .then((r) => { if (id === seq) data = r ?? { river: [], rain: [] }; })
        .catch(() => { if (id === seq) data = { river: [], rain: [] }; })
        .finally(() => { if (id === seq) loading = false; });
    });
  </script>

  {#if data.river.length || data.rain.length}
    {#if data.river.length}
      <div class="caption mb-0.5 mt-1 text-[12.5px]">{tr("floodRiver")}</div>
      <ul class="list-none m-0 border-t border-line p-0">
        {#each data.river as a (a.station)}
          <li class="flex items-center gap-3 border-b border-line px-2.5 py-2 text-[13px]">
            <span class="w-1.5 shrink-0 self-stretch rounded" style="background:{sevColor(a.severity)}" aria-hidden="true"></span>
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium">{a.stationName}</div>
              <div class="text-[12px] text-muted">{a.district}, {a.state}</div>
            </div>
            <div class="shrink-0 text-right">
              <div class="font-mono text-[13px] font-semibold">{a.level} m</div>
              <div class="text-[11px]" style="color:{sevColor(a.severity)}">{a.severity}{#if a.trend} · {a.trend}{/if}</div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
    {#if data.rain.length}
      <div class="caption mb-0.5 mt-2 text-[12.5px]">{tr("floodRain")}</div>
      <ul class="list-none m-0 border-t border-line p-0">
        {#each data.rain as a (a.station)}
          <li class="flex items-center gap-3 border-b border-line px-2.5 py-2 text-[13px]">
            <span class="w-1.5 shrink-0 self-stretch rounded" style="background:{sevColor(a.severity)}" aria-hidden="true"></span>
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium">{a.stationName}</div>
              <div class="text-[12px] text-muted">{a.district}, {a.state}</div>
            </div>
            <div class="shrink-0 text-right">
              <div class="font-mono text-[13px] font-semibold">{a.mmHour} mm/hr</div>
              <div class="text-[11px]" style="color:{sevColor(a.severity)}">{a.severity}</div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  {:else}
    <p class="caption">{trFmt("floodNone", { state: app.state || "Malaysia" })}</p>
  {/if}
