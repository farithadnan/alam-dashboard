  <!--
    Homepage hero: an animated weather scene that reacts to the current condition
    (sun, partly, cloudy, rain, thunder, night, mist). Temperature, AQI and a
    condition tag float over it. No mascot.
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
    const drops = $derived(scene === "thunder"
      ? Array.from({ length: 48 }, (_, i) => ({ left: (i * 27) % 100, delay: (i * 0.32) % 1.7, dur: 0.5 + ((i * 11) % 7) / 10 }))
      : Array.from({ length: 30 }, (_, i) => ({ left: (i * 41) % 100, delay: (i * 0.7) % 2.4, dur: 0.9 + ((i * 13) % 10) / 10 })));
    const stars = $derived(Array.from({ length: 16 }, (_, i) => ({ left: (i * 43) % 94 + 2, top: (i * 29) % 72, delay: (i % 5) * 0.7 })));
  </script>

  <div class="banner scene-{scene} relative flex flex-col justify-between overflow-hidden rounded-2xl text-white" role="img" aria-label={label}>
    <div class="sun-glow" aria-hidden="true"></div>
    {#if scene === "night"}
      <span class="moon" aria-hidden="true">🌙</span>
      {#each stars as s, i (i)}
        <span class="star" style="left:{s.left}%;top:{s.top}%;animation-delay:{s.delay}s" aria-hidden="true"></span>
      {/each}
      <span class="shooting" aria-hidden="true"></span>
    {/if}
    {#if scene === "rain" || scene === "thunder"}
      {#each drops as d, i (i)}
        <span class="drop" style="left:{d.left}%;animation-delay:{d.delay}s;animation-duration:{d.dur}s" aria-hidden="true"></span>
      {/each}
    {/if}
    <div class="thunder-flash" aria-hidden="true"></div>

    <!-- top: condition tag -->
    <div class="relative z-10 flex items-start justify-between gap-2 px-4 pt-3 sm:px-5">
      <span class="rounded-full bg-black/35 px-2.5 py-0.5 text-[12px] font-medium text-white backdrop-blur">{label}</span>
    </div>

    <!-- bottom: details float over the scene -->
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
  </div>

  <style>
    .banner { min-height: 240px; box-sizing: border-box; position: relative; overflow: hidden; }

    .scene-sunny  { background: linear-gradient(180deg,#3aa0ff 0%, #7fccff 55%, #ffe6b0 100%); }
    .scene-partly { background: linear-gradient(180deg,#4aa3e8 0%, #9cc8ee 60%, #dfe9ee 100%); }
    .scene-cloudy, .scene-overcast { background: linear-gradient(180deg,#5c7290 0%, #93a4bb 60%, #c3ccd6 100%); }
    .scene-rain   { background: linear-gradient(180deg,#41627f 0%, #6d8aa6 60%, #97abbd 100%); }
    .scene-thunder{ background: linear-gradient(180deg,#2b3345 0%, #4a5570 55%, #6f7a92 100%); }
    .scene-mist   { background: linear-gradient(180deg,#7a828c 0%, #a4abb4 60%, #ccd1d6 100%); }
    .scene-night  { background: linear-gradient(180deg,#0d1b3d 0%, #243a63 60%, #3c4f72 100%); }

    .sun-glow {
      position: absolute; left: -40px; top: -60px; width: 230px; height: 230px;
      background: radial-gradient(circle, rgba(255,255,255,.5), transparent 65%);
      animation: pulse 5s ease-in-out infinite;
    }
    .scene-thunder .sun-glow, .scene-night .sun-glow {
      background: radial-gradient(circle, rgba(255,255,220,.28), transparent 65%);
    }
    @keyframes pulse { 0%,100% { transform: scale(1); opacity:.85 } 50% { transform: scale(1.12); opacity:1 } }

    .moon { position: absolute; right: 12%; top: 12%; z-index: 0; font-size: 50px; filter: drop-shadow(0 0 12px rgba(255,240,180,.9)); animation: pulse 5s ease-in-out infinite; }

    .shooting {
      position: absolute; top: 15%; right: -90px; width: 80px; height: 2px; z-index: 0;
      background: linear-gradient(90deg, #fff, transparent); border-radius: 999px;
      transform: rotate(-28deg); opacity: 0; animation: shoot 8s ease-in infinite;
    }
    @keyframes shoot { 0%,93%,100% { opacity:0; transform: translate(0,0) rotate(-28deg) } 95% { opacity:.95 } 98.5% { opacity:0; transform: translate(-150px, 70px) rotate(-28deg) } }

    .star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #fff; opacity:.9; animation: twinkle 2.4s ease-in-out infinite; }
    @keyframes twinkle { 0%,100% { opacity:.25 } 50% { opacity:1 } }

    .drop { position: absolute; top: -10px; width: 2px; height: 14px; background: rgba(255,255,255,.55); border-radius: 999px; animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
    @keyframes fall { to { transform: translateY(240px); opacity:.2 } }

    .thunder-flash { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: rgba(255,255,255,.85); }
    .scene-thunder .thunder-flash { animation: flash 5s ease-in-out infinite; }
    @keyframes flash { 0%,89%,100%{opacity:0} 90%{opacity:.55} 93%{opacity:0} 95%{opacity:.3} 97%{opacity:0} }
  </style>
