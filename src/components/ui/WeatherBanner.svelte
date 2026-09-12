  <!--
    Homepage hero: a lightweight CSS "scene" that reacts to the current condition
    (sun, rain, thunder, overcast, night, mist). Pure CSS + emoji, no assets/libs.
    The condition animation sits in the middle; temperature, AQI and the alert
    actions float over it.
  -->
  <script>
    const sceneOf = (icon) => {
      const i = icon || "";
      if (i.includes("⛈")) return "thunder";
      if (i.includes("🌧") || i.includes("🌦")) return "rain";
      if (i.includes("☁")) return "overcast";
      if (i.includes("🌤") || i.includes("⛅") || i.includes("🌥")) return "partly";
      if (i.includes("🌫")) return "mist";
      if (i.includes("🌙") || i.includes("🌑")) return "night";
      return "sunny";
    };

    let { icon = "☀️", label = "", temp = 0, feels = 0, townName = "", appState = "", aqi = null } = $props();
    const scene = $derived(sceneOf(icon));
    const drops = $derived(
      Array.from({ length: 32 }, (_, i) => ({
        left: (i * 43) % 100,
        delay: (i * 0.7) % 2.4,
        dur: 0.9 + ((i * 13) % 10) / 10,
      })),
    );
  </script>

  <div class="banner scene-{scene} relative flex flex-col justify-between overflow-hidden rounded-2xl text-white" role="img" aria-label={label}>
    <div class="sun-glow" aria-hidden="true"></div>
    {#if scene === "rain"}
      {#each drops as d, i (i)}
        <span class="drop" style="left:{d.left}%;animation-delay:{d.delay}s;animation-duration:{d.dur}s" aria-hidden="true"></span>
      {/each}
    {/if}
    <div class="thunder-flash" aria-hidden="true"></div>
    <div class="scene-icon" aria-hidden="true">{icon}</div>

    <!-- top: condition tag + the alert actions -->
    <div class="relative z-10 flex items-start justify-between gap-2 px-4 pt-3 sm:px-5">
      <span class="mt-1 rounded-full bg-black/30 px-2.5 py-0.5 text-[12px] font-medium backdrop-blur">{label}</span>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- bottom: details float over the animation -->
    <div class="relative z-10 flex items-end justify-between gap-3 px-4 pb-3 sm:px-5">
      <div class="min-w-0">
        <div class="truncate text-[15px] font-semibold drop-shadow">{townName}{#if appState}<span class="opacity-80">, {appState}</span>{/if}</div>
        <div class="mt-0.5 flex items-end gap-2">
          <span class="font-mono text-[40px] font-extrabold leading-none tracking-tighter drop-shadow sm:text-[52px]">{Math.round(temp)}°</span>
          <span class="pb-1 text-[13px] opacity-90">feels {Math.round(feels)}°</span>
        </div>
      </div>
      {#if aqi}
        <div class="shrink-0 rounded-xl bg-black/40 px-3 py-1.5 text-center backdrop-blur">
          <div class="text-[11px] opacity-90">Air now</div>
          <div class="font-mono text-[22px] font-bold leading-none" style="color:{aqi.color}">{aqi.value}</div>
          <div class="text-[11px] font-semibold" style="color:{aqi.color}">{aqi.band}</div>
        </div>
      {/if}
    </div>
  </div>

  <style>
    .banner { min-height: 190px; box-sizing: border-box; position: relative; overflow: hidden; }
    .scene-icon {
      position: absolute; left: 50%; top: 45%; z-index: 1;
      transform: translate(-50%, -50%); font-size: 82px; line-height: 1;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,.35));
      animation: floaty 4.5s ease-in-out infinite;
    }
    @keyframes floaty { 0%,100% { transform: translate(-50%, -50%) } 50% { transform: translate(-50%, -58%) } }

    .scene-sunny  { background: linear-gradient(180deg,#3aa0ff 0%, #7fccff 55%, #ffe6b0 100%); }
    .scene-partly { background: linear-gradient(180deg,#4aa3e8 0%, #9cc8ee 60%, #dfe9ee 100%); }
    .scene-overcast { background: linear-gradient(180deg,#5c7290 0%, #93a4bb 60%, #c3ccd6 100%); }
    .scene-rain   { background: linear-gradient(180deg,#41627f 0%, #6d8aa6 60%, #97abbd 100%); }
    .scene-thunder{ background: linear-gradient(180deg,#2b3345 0%, #4a5570 55%, #6f7a92 100%); }
    .scene-mist   { background: linear-gradient(180deg,#7a828c 0%, #a4abb4 60%, #ccd1d6 100%); }
    .scene-night  { background: linear-gradient(180deg,#0d1b3d 0%, #243a63 60%, #3c4f72 100%); }

    .sun-glow {
      position: absolute; left: -40px; top: -60px; width: 220px; height: 220px; z-index: 0;
      background: radial-gradient(circle, rgba(255,255,255,.5), transparent 65%);
      animation: pulse 5s ease-in-out infinite;
    }
    .scene-thunder .sun-glow, .scene-night .sun-glow {
      background: radial-gradient(circle, rgba(255,255,220,.28), transparent 65%);
    }
    @keyframes pulse { 0%,100% { transform: scale(1); opacity:.85 } 50% { transform: scale(1.12); opacity:1 } }

    .drop {
      position: absolute; top: -10px; width: 2px; height: 14px;
      background: rgba(255,255,255,.55); border-radius: 999px;
      animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite;
    }
    @keyframes fall { to { transform: translateY(230px); opacity:.2 } }

    .thunder-flash { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0; background: rgba(255,255,255,.85); }
    .scene-thunder .thunder-flash { animation: flash 5s ease-in-out infinite; }
    @keyframes flash { 0%,89%,100%{opacity:0} 90%{opacity:.55} 93%{opacity:0} 95%{opacity:.3} 97%{opacity:0} }
  </style>
