  <!--
    Homepage hero: a cartoon weather character (inline SVG) whose mood, accessory and
    surroundings change with the current condition — sunny, partly, cloudy, rain,
    thunder, night, mist. Temperature, AQI and the alert actions float over it.
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

    // --- cartoon humanoid: pose, clothes and props change with the condition ---
    const SKIN = "#f6c89a", INK = "#3a3129";
    function characterSVG(scene) {
      const shirt = scene === "rain" ? "#3f5f8a" : scene === "thunder" ? "#6d5a64" : scene === "night" ? "#4a5570" : scene === "mist" ? "#7a8f86" : "#f2f2f2";
      let s = `<svg viewBox="0 0 150 170" width="118" height="134">`;
      // scene props
      if (scene === "sunny") {
        s += `<circle cx="120" cy="30" r="16" fill="#ffca3a"/><circle cx="104" cy="150" r="16" fill="#eef4ff"/><path d="M120 12 a16 16 0 0 1 8 28" fill="#fff0c0"/>`;
        s += `<rect x="118" y="40" width="22" height="4" rx="2" fill="#d34f2f"/><rect x="122" y="38" width="14" height="26" rx="6" fill="#f05b3a"/>`;
      }
      if (scene === "thunder") {
        s += `<rect x="14" y="26" width="42" height="48" rx="4" fill="#22304d" stroke="#dbe4ee" stroke-width="3"/>`;
        s += `<line x1="20" y1="60" x2="20" y2="46" stroke="#fff" stroke-width="2"/><line x1="34" y1="60" x2="34" y2="32" stroke="#fff" stroke-width="2"/>`;
      }
      if (scene === "night") s += `<path d="M110 24 a13 13 0 1 0 12 22 a13 13 0 0 1 -12 -22" fill="#ffe9b0"/>`;
      // legs
      s += `<rect x="60" y="128" width="13" height="26" rx="6" fill="${INK}" opacity=".85"/><rect x="79" y="128" width="13" height="26" rx="6" fill="${INK}" opacity=".85"/>`;
      // torso
      s += `<rect x="57" y="86" width="38" height="48" rx="16" fill="${shirt}" stroke="${INK}" stroke-width="2"/>`;
      if (scene === "thunder") s += `<rect x="88" y="100" width="14" height="3" rx="1.5" fill="${SKIN}"/>`;
      // head
      s += `<circle cx="76" cy="42" r="20" fill="${SKIN}" stroke="${INK}" stroke-width="2"/>`;
      s += `<path d="M56 36 a20 20 0 0 1 40 0 l4 -6 a24 24 0 0 0 -48 0z" fill="#4a3b2f"/>`;
      // eyes
      if (scene === "sunny") {
        s += `<rect x="64" y="37" width="9" height="7" rx="2" fill="#263238"/><rect x="81" y="37" width="9" height="7" rx="2" fill="#263238"/><path d="M73 40 h7" stroke="#263238" stroke-width="2"/>`;
      } else if (scene === "night") {
        s += `<path d="M65 42 q5 -7 10 0 M80 42 q5 -7 10 0" stroke="${INK}" stroke-width="2.5" fill="none"/>`;
      } else {
        s += `<circle cx="69" cy="43" r="3.4" fill="${INK}"/><circle cx="85" cy="43" r="3.4" fill="${INK}"/>`;
      }
      // mouth
      s += scene === "rain" || scene === "thunder"
        ? `<path d="M69 55 q7 6 14 0" stroke="${INK}" stroke-width="2.5" fill="none"/>`
        : `<path d="M67 54 q9 9 18 0" stroke="${INK}" stroke-width="2.5" fill="none"/>`;
      // rain: umbrella above
      if (scene === "rain") {
        s += `<path d="M46 42 q30 -30 60 0" fill="#e05d2b" stroke="#b8491a" stroke-width="2"/><line x1="76" y1="42" x2="76" y2="20" stroke="#7a6a58" stroke-width="3"/>`;
      }
      // thunder: coffee mug in hand
      if (scene === "thunder") {
        s += `<rect x="87" y="97" width="18" height="20" rx="4" fill="#8d5a3c"/><path d="M105 102 h5 a4 4 0 0 1 0 9 h-5" fill="none" stroke="#8d5a3c" stroke-width="3"/>`;
      }
      // mist: scarf
      if (scene === "mist") s += `<rect x="58" y="58" width="37" height="9" rx="4" fill="#5c8a6a"/>`;
      s += `</svg>`;
      return s;
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

    <!-- top: condition tag + the alert actions -->
    <div class="relative z-10 flex items-start justify-between gap-2 px-4 pt-3 sm:px-5">
      <span class="mt-1 rounded-full bg-black/35 px-2.5 py-0.5 text-[12px] font-medium text-white backdrop-blur">{label}</span>
      <div class="flex items-center gap-2 rounded-full bg-white/90 p-1 text-neutral-800 shadow backdrop-blur">
        <slot name="actions" />
      </div>
    </div>

    <!-- bottom: details float over the character -->
    <div class="relative z-10 flex items-end justify-between gap-3 px-4 pb-3 sm:px-5">
      <div class="min-w-0">
        <div class="truncate text-[15px] font-semibold drop-shadow">{townName}{#if appState}<span class="opacity-80">, {appState}</span>{/if}</div>
        <div class="mt-0.5 flex items-end gap-2">
          <span class="font-mono text-[40px] font-extrabold leading-none tracking-tighter drop-shadow sm:text-[52px]">{Math.round(temp)}°</span>
          <span class="pb-1 text-[13px] opacity-90">feels {Math.round(feels)}°</span>
        </div>
      </div>
      {#if aqi}
        <div class="shrink-0 rounded-xl bg-black/45 px-3 py-1.5 text-center backdrop-blur">
          <div class="text-[11px] font-medium text-white">Air now</div>
          <div class="font-mono text-[22px] font-bold leading-none" style="color:{aqi.color}">{aqi.value}</div>
          <div class="text-[11px] font-semibold" style="color:{aqi.color}">{aqi.band}</div>
        </div>
      {/if}
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
      background:
        repeating-conic-gradient(from 0deg, rgba(255,255,255,.35) 0deg 6deg, transparent 6deg 22deg);
      -webkit-mask: radial-gradient(circle, transparent 52%, #000 53%, #000 62%, transparent 63%);
      mask: radial-gradient(circle, transparent 52%, #000 53%, #000 62%, transparent 63%);
      animation: spin 16s linear infinite;
    }
    @keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg) } }

    .star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #fff; opacity:.9; animation: twinkle 2.4s ease-in-out infinite; }
    @keyframes twinkle { 0%,100% { opacity:.25 } 50% { opacity:1 } }

    .drop {
      position: absolute; top: -10px; width: 2px; height: 14px;
      background: rgba(255,255,255,.55); border-radius: 999px;
      animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite;
    }
    @keyframes fall { to { transform: translateY(240px); opacity:.2 } }

    .thunder-flash { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0; background: rgba(255,255,255,.85); }
    .scene-thunder .thunder-flash { animation: flash 5s ease-in-out infinite; }
    @keyframes flash { 0%,89%,100%{opacity:0} 90%{opacity:.55} 93%{opacity:0} 95%{opacity:.3} 97%{opacity:0} }
  </style>
