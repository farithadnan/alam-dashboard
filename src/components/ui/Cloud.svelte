  <!-- Reusable realistic cloud: white puffs displaced by feTurbulence fractal noise.
       Each instance randomizes seed, puff layout, displacement scale, opacity and tone:
       kind="single" (one puff pair)  ·  kind="cloudy" (a few)  ·  kind="packed" (dense,
       heavy overcast).  tone 0..60 = how far from pure white toward grey. -->
  <script module>
    let cloudCounter = 0;
  </script>

  <script>
    let { kind = "single", tone = 0, style = "" } = $props();
    const seedNum = Math.floor(Math.random() * 1000);
    const id = "cloudf" + ++cloudCounter;
    const n = kind === "packed" ? 6 : kind === "cloudy" ? 4 : 2;
    const puffs = Array.from({ length: n }, (_, i) => ({
      cx: Math.round(16 + (i / (n - 1 || 1)) * 68 + (Math.random() * 12 - 6)),
      cy: Math.round(18 + Math.random() * 16),
      rx: Math.round(18 + Math.random() * 18),
      ry: Math.round(10 + Math.random() * 7),
    }));
    const scale = Math.round(20 + Math.random() * 16);
    const opacity = +(0.78 + Math.random() * 0.2).toFixed(2);
    const lightness = Math.round(97 - Number(tone) * 0.55);
    const fill = `hsl(210 ${Math.floor(10 + Math.random() * 10)}% ${lightness}%)`;
  </script>

  <svg {style} viewBox="0 0 100 56" aria-hidden="true" focusable="false">
    <filter id={id} x="-30%" y="-80%" width="160%" height="260%">
      <feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="6" seed={seedNum} />
      <feDisplacementMap in="SourceGraphic" scale={scale} />
    </filter>
    <g filter={`url(#${id})`} opacity={opacity}>
      {#each puffs as p, i (i)}
        <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={fill} />
      {/each}
    </g>
  </svg>
