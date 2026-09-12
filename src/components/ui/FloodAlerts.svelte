  <script>
    import { app } from "../../lib/store.svelte.js";
    import { tr, trFmt } from "../../lib/i18n.svelte.js";

    /** Presentational: parent fetches and passes {river, rain, loading, state}.
     * state "" = all Malaysia (grouped by state); otherwise a single state. */
    let { river = [], rain = [], loading = false, state = "" } = $props();

    const sevColor = (s) =>
      ({ Danger: "var(--color-vunhealthy)", Warning: "var(--color-unhealthy)", Alert: "var(--color-moderate)", Heavy: "var(--color-unhealthy)", Moderate: "var(--color-moderate)" })[s] ?? "var(--color-muted)";

    const displayState = $derived(state || app.state || "Malaysia");
    const grouped = $derived(!state);

    // Flatten both alert lists into one renderable sequence (real headers, state
    // group labels, and rows) so a single each renders everything, snippet-free.
    const rows = $derived.by(() => {
      const out = [];
      const add = (list, isRain) => {
        if (!list.length) return;
        out.push({ kind: "head", isRain, title: isRain ? tr("floodRain") : tr("floodRiver") });
        if (grouped) {
          for (const st of [...new Set(list.map((a) => a.state).filter(Boolean))].sort()) {
            out.push({ kind: "sub", isRain, title: st });
            for (const a of list.filter((x) => x.state === st)) out.push({ kind: "row", isRain, a });
          }
        } else {
          for (const a of list) out.push({ kind: "row", isRain, a });
        }
      };
      add(river, false);
      add(rain, true);
      return out;
    });
  </script>

  {#if loading && !river.length && !rain.length}
    <p class="caption">{tr("updating")}</p>
  {:else if rows.length}
    <ul class="list-none m-0 border-t border-line p-0">
      {#each rows as it, i (i)}
        {#if it.kind === "head"}
          <li class="caption mb-0.5 mt-2 list-none pl-2.5 pr-2.5 text-[12.5px] first:mt-1">{it.title}</li>
        {:else if it.kind === "sub"}
          <li class="caption mb-0.5 mt-1.5 list-none pl-2.5 pr-2.5 text-[12px] font-semibold">{it.title}</li>
        {:else}
          <li class="flex items-center gap-3 border-b border-line px-2.5 py-2 text-[13px]">
            <span class="w-1.5 shrink-0 self-stretch rounded" style="background:{sevColor(it.a.severity)}" aria-hidden="true"></span>
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium">{it.a.stationName}</div>
              <div class="text-[12px] text-muted">{it.a.district}, {it.a.state}</div>
            </div>
            <div class="shrink-0 text-right">
              {#if it.isRain}
                <div class="font-mono text-[13px] font-semibold">{it.a.mmHour} mm/hr</div>
                <div class="text-[11px]" style="color:{sevColor(it.a.severity)}">{it.a.severity}</div>
              {:else}
                <div class="font-mono text-[13px] font-semibold">{it.a.level} m</div>
                <div class="text-[11px]" style="color:{sevColor(it.a.severity)}">{it.a.severity}{#if it.a.trend} · {it.a.trend}{/if}</div>
              {/if}
            </div>
          </li>
        {/if}
      {/each}
    </ul>
  {:else}
    <p class="caption">{trFmt("floodNone", { state: displayState })}</p>
    <p class="caption mt-0.5">{tr("floodMonitor")}</p>
  {/if}
