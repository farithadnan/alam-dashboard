  <!-- Realistic cloud made of THREE fractal-displaced depth layers (back/mid/front
       at different feDisplacementMap scales), each its own circle-cluster. Layering
       the puffs gives soft, receding far edges and a crisp near edge — reads as a
       real cloud instead of a flat blob. `kind`: single | cloudy | packed.
       Each instance randomizes its layout and gets unique filter ids. -->
  <script>
    let { kind = "single", style = "" } = $props();
    const uid = Math.random().toString(36).slice(2, 8);
    const n = kind === "packed" ? 6 : kind === "cloudy" ? 4 : 2;
    const cluster = (shift, jitter) =>
      Array.from({ length: n }, (_, i) => ({
        cx: 18 + (i / (n - 1 || 1)) * 68 + (Math.random() * jitter - jitter / 2),
        cy: 20 + shift + Math.random() * 12,
        r: 11 + Math.random() * 15,
      }));
    const back = cluster(-3, 16);
    const mid = cluster(1, 10);
    const front = cluster(5, 6);
  </script>

  <svg {style} viewBox="0 0 100 62" aria-hidden="true" focusable="false">
    <defs>
      <filter id={`cback-${uid}`} x="-40%" y="-80%" width="180%" height="280%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" />
        <feDisplacementMap in="SourceGraphic" scale="170" />
      </filter>
      <filter id={`cmid-${uid}`} x="-40%" y="-80%" width="180%" height="280%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" />
        <feDisplacementMap in="SourceGraphic" scale="150" />
      </filter>
      <filter id={`cfront-${uid}`} x="-40%" y="-80%" width="180%" height="280%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" />
        <feDisplacementMap in="SourceGraphic" scale="100" />
      </filter>
    </defs>
    <g filter={`url(#cback-${uid})`} opacity="0.5">
      {#each back as p, i (i)}<circle cx={p.cx} cy={p.cy} r={p.r} fill="hsl(214 26% 80%)" />{/each}
    </g>
    <g filter={`url(#cmid-${uid})`} opacity="0.75">
      {#each mid as p, i (i)}<circle cx={p.cx} cy={p.cy} r={p.r} fill="hsl(214 22% 91%)" />{/each}
    </g>
    <g filter={`url(#cfront-${uid})`} opacity="0.95">
      {#each front as p, i (i)}<circle cx={p.cx} cy={p.cy} r={p.r} fill="#fff" />{/each}
    </g>
  </svg>
