  <!-- Generic overlay widget floated over the scene: condition tag (top-left),
       place + temperature + feels (bottom-left), Air-now AQI box (bottom-right). -->
  <script>
    let { label = "", townName = "", appState = "", temp = 0, feels = 0, aqi = null } = $props();
  </script>

  <div class="relative z-10 flex items-start justify-between gap-2 px-4 pt-3 sm:px-5">
    <span class="rounded-full bg-black/35 px-2.5 py-0.5 text-[12px] font-medium text-white backdrop-blur">{label}</span>
  </div>

  <div class="relative z-10 flex items-end justify-between gap-3 px-4 pb-3 sm:px-5">
    <div class="min-w-0">
      <div class="truncate text-[15px] font-semibold drop-shadow">{townName}{#if appState}<span class="opacity-80">, {appState}</span>{/if}</div>
      <div class="mt-0.5 flex items-end gap-2">
        <span class="font-mono text-[40px] font-extrabold leading-none tracking-tighter drop-shadow sm:text-[52px]">{Math.round(temp)}°</span>
        <span class="pb-1 text-[13px] opacity-90">feels {Math.round(feels)}°</span>
      </div>
    </div>
    {#if aqi}
      <div class="shrink-0 rounded-xl bg-black/50 px-3 py-1.5 text-center">
        <div class="text-[10.5px] font-medium text-white/70">Air now</div>
        <div class="font-mono text-[22px] font-bold leading-none text-white">{aqi.value}</div>
        <div class="text-[11px] font-semibold text-white">{aqi.band}</div>
      </div>
    {/if}
  </div>
