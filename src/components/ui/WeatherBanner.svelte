  <!--
    Homepage hero: an animated weather character whose face, mood and surroundings
    change with the condition (sun, partly, cloudy, rain, thunder, night, mist).
    Temperature, AQI and the alert actions float over the scene.
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

    // --- cartoon character: faces that differ per condition ---
    const THEME = {
      sunny:    { body: "#ffca3a", edge: "#f2a900" },
      partly:   { body: "#ffca3a", edge: "#f2a900" },
      cloudy:   { body: "#d3dde6", edge: "#aab9c9" },
      overcast: { body: "#cdd8e2", edge: "#aab9c9" },
      rain:     { body: "#9fb6cd", edge: "#7d95ad" },
      thunder:  { body: "#7d8aa0", edge: "#59677f" },
      night:    { body: "#ffe9b0", edge: "#f2c94c" },
      mist:     { body: "#d9dde3", edge: "#b0b6c0" },
    };
    const eyes = (k) => {
      if (k === "sleepy") return `<path d="M42 44 q7 -8 14 0 M64 44 q7 -8 14 0" stroke="#3a332b" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      if (k === "shades") return `<rect x="40" y="42" width="14" height="10" rx="3.5" fill="#263238"/><rect x="66" y="42" width="14" height="10" rx="3.5" fill="#263238"/><path d="M54 47 h12" stroke="#263238" stroke-width="2"/>`;
      return `<circle cx="47" cy="49" r="6.5" fill="#fff"/><circle cx="73" cy="49" r="6.5" fill="#fff"/><circle cx="47" cy="49" r="3.2" fill="#3a332b"/><circle cx="73" cy="49" r="3.2" fill="#3a332b"/>`;
    };
    const mouth = (k) => {
      if (k === "frown") return `<path d="M46 82 Q60 70 74 82" stroke="#3a332b" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      return `<path d="M44 74 Q60 88 76 74" stroke="#3a332b" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    };
    const cloudBody = (t) =>
      `<g fill="${t.body}" stroke="${t.edge}" stroke-width="3" stroke-linejoin="round"><circle cx="38" cy="66" r="17"/><circle cx="57" cy="56" r="23"/><circle cx="77" cy="66" r="16"/><rect x="34" y="62" width="52" height="21" rx="10.5"/></g>`;
    function characterSVG(scene) {
      const t = THEME[scene];
      if (scene === "sunny" || scene === "partly") {
        return `<svg viewBox="0 0 120 120" width="104" height="104"><circle cx="60" cy="58" r="30" fill="${t.body}" stroke="${t.edge}" stroke-width="3"/>${eyes(scene === "sunny" ? "shades" : "open")}${mouth("smile")}</svg>`;
      }
      if (scene === "night") {
        return `<svg viewBox="0 0 120 120" width="104" height="104"><circle cx="60" cy="58" r="30" fill="${t.body}" stroke="${t.edge}" stroke-width="3"/>${eyes("sleepy")}${mouth("smile")}</svg>`;
      }
      const m = scene === "thunder" || scene === "rain" ? "frown" : "flat";
      return `<svg viewBox="0 0 120 120" width="104" height="104">${cloudBody(t)}${eyes("open")}${mouth(m)}</svg>`;
    }

    let { icon = "☀️", label = "", temp = 0, feels = 0, townName = "", appState = "", aqi = null } = $props();
    const scene = $derived(sceneOf(icon));
    const drops = $derived(Array.from({ length: 30 }, (_, i) => ({ left: (i * 41) % 100, delay: (i * 0.7) % 2.4, dur: 0.9 + ((i * 13) % 10) / 10 })));
    const stars = $derived(Array.from({ length: 10 }, (_, i) => ({ left: (i * 37) % 96 + 2, top: (i * 29) % 50, delay: (i % 4) * 0.8 })));
  </script>

  <div class="banner scene-{scene} relative flex flex-col justify-between overflow-hidden rounded-2xl text-white" role="img" aria-label={label}>
    <div class="sun-glow" aria-hidden="true"></div>
    {#if scene === "sunny" || scene === "partly"}
      <div class="rays" aria-hidden="true"></div>
    {/if}
    {#if scene === "night"}
      {#each stars as s, i (i)}
        <span class="star" style="left:{s.left}%;top:{s.top}%;animation-delay:{s.delay}s" aria-hidden="true"></span>
      {/each}
    {/if}
    {#if scene === "rain"}
      {#each drops as d, i (i)}
        <span class="drop" style="left:{d.left}%;animation-delay:{d.delay}s;animation-duration:{d.dur}s" aria-hidden="true"></span>
      {/each}
    {/if}
    <div class="thunder-flash" aria-hidden="true"></div>

    <div class="scene-icon" aria-hidden="true">{@html characterSVG(scene)}</div>

    <!-- top: condition tag -->
    <div class="relative z-10 flex items-start justify-between gap-2 px-4 pt-3 sm:px-5">
      <span class="rounded-full bg-black/35 px-2.5 py-0.5 text-[12px] font-medium text-white backdrop-blur">{label}</span>
    </div>

    <!-- bottom: details float over the character; actions sit bottom-right -->
    <div class="relative z-10 flex flex-col gap-1.5 px-4 pb-3 sm:px-5">
      <div class="flex items-end justify-between gap-3">
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
      <div class="flex justify-end">
        <div class="flex items-center gap-1 rounded-full bg-black/40 p-1 backdrop-blur">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>

  <style>
    .banner { min-height: 240px; box-sizing: border-box; position: relative; overflow: hidden; }
    .scene-icon {
      position: absolute; left: 50%; top: 43%; z-index: 1;
      transform: translate(-50%, -50%); filter: drop-shadow(0 8px 16px rgba(0,0,0,.35));
      animation: floaty 4.5s ease-in-out infinite;
    }
    .scene-icon :global(svg) { display: block; }
    @keyframes floaty { 0%,100% { transform: translate(-50%, -50%) } 50% { transform: translate(-50%, -59%) } }

    .scene-sunny  { background: linear-gradient(180deg,#3aa0ff 0%, #7fccff 55%, #ffe6b0 100%); }
    .scene-partly { background: linear-gradient(180deg,#4aa3e8 0%, #9cc8ee 60%, #dfe9ee 100%); }
    .scene-cloudy, .scene-overcast { background: linear-gradient(180deg,#5c7290 0%, #93a4bb 60%, #c3ccd6 100%); }
    .scene-rain   { background: linear-gradient(180deg,#41627f 0%, #6d8aa6 60%, #97abbd 100%); }
    .scene-thunder{ background: linear-gradient(180deg,#2b3345 0%, #4a5570 55%, #6f7a92 100%); }
    .scene-mist   { background: linear-gradient(180deg,#7a828c 0%, #a4abb4 60%, #ccd1d6 100%); }
    .scene-night  { background: linear-gradient(180deg,#0d1b3d 0%, #243a63 60%, #3c4f72 100%); }

    .sun-glow {
      position: absolute; left: -40px; top: -60px; width: 230px; height: 230px; z-index: 0;
      background: radial-gradient(circle, rgba(255,255,255,.5), transparent 65%);
      animation: pulse 5s ease-in-out infinite;
    }
    .scene-thunder .sun-glow, .scene-night .sun-glow {
      background: radial-gradient(circle, rgba(255,255,220,.28), transparent 65%);
    }
    @keyframes pulse { 0%,100% { transform: scale(1); opacity:.85 } 50% { transform: scale(1.12); opacity:1 } }

    .rays {
      position: absolute; left: 50%; top: 43%; width: 150px; height: 150px; z-index: 0;
      transform: translate(-50%, -50%);
      background: repeating-conic-gradient(from 0deg, rgba(255,255,255,.35) 0deg 6deg, transparent 6deg 22deg);
      -webkit-mask: radial-gradient(circle, transparent 52%, #000 53%, #000 62%, transparent 63%);
      mask: radial-gradient(circle, transparent 52%, #000 53%, #000 62%, transparent 63%);
      animation: spin 16s linear infinite;
    }
    @keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg) } }

    .star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #fff; opacity:.9; animation: twinkle 2.4s ease-in-out infinite; }
    @keyframes twinkle { 0%,100% { opacity:.25 } 50% { opacity:1 } }

    .drop { position: absolute; top: -10px; width: 2px; height: 14px; background: rgba(255,255,255,.55); border-radius: 999px; animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
    @keyframes fall { to { transform: translateY(240px); opacity:.2 } }

    .thunder-flash { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0; background: rgba(255,255,255,.85); }
    .scene-thunder .thunder-flash { animation: flash 5s ease-in-out infinite; }
    @keyframes flash { 0%,89%,100%{opacity:0} 90%{opacity:.55} 93%{opacity:0} 95%{opacity:.3} 97%{opacity:0} }
  </style>
