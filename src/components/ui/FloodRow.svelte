  <script>
    let { a, isRain = false } = $props();
    const sevColor = (s) =>
      ({ Danger: "var(--color-vunhealthy)", Warning: "var(--color-unhealthy)", Alert: "var(--color-moderate)", Heavy: "var(--color-unhealthy)", Moderate: "var(--color-moderate)" })[s] ?? "var(--color-muted)";
  </script>

  <li class="flex items-center gap-3 border-b border-line px-2.5 py-2 text-[13px]">
    <span class="w-1.5 shrink-0 self-stretch rounded" style="background:{sevColor(a.severity)}" aria-hidden="true"></span>
    <div class="min-w-0 flex-1">
      <div class="truncate font-medium">{a.stationName}</div>
      <div class="text-[12px] text-muted">{a.district}, {a.state}</div>
    </div>
    <div class="shrink-0 text-right">
      {#if isRain}
        <div class="font-mono text-[13px] font-semibold">{a.mmHour} mm/hr</div>
        <div class="text-[11px]" style="color:{sevColor(a.severity)}">{a.severity}</div>
      {:else}
        <div class="font-mono text-[13px] font-semibold">{a.level} m</div>
        <div class="text-[11px]" style="color:{sevColor(a.severity)}">{a.severity}{#if a.trend} · {a.trend}{/if}</div>
      {/if}
    </div>
  </li>
