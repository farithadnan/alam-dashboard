  <!-- Generic falling-rain. `heavy` adds more, faster drops (thunderstorm). -->
  <script>
    let { heavy = false } = $props();
    const drops = Array.from({ length: heavy ? 48 : 30 }, (_, i) =>
      heavy
        ? { left: (i * 27) % 100, delay: (i * 0.32) % 1.7, dur: 0.5 + ((i * 11) % 7) / 10 }
        : { left: (i * 41) % 100, delay: (i * 0.7) % 2.4, dur: 0.9 + ((i * 13) % 10) / 10 });
  </script>

  {#each drops as d, i (i)}
    <span class="drop" style="left:{d.left}%;animation-delay:{d.delay}s;animation-duration:{d.dur}s" aria-hidden="true"></span>
  {/each}

  <style>
    .drop { position: absolute; top: -10px; z-index: 0; width: 2px; height: 14px; background: rgba(255,255,255,.55); border-radius: 999px; animation-name: fall; animation-timing-function: linear; animation-iteration-count: infinite; }
    @keyframes fall { to { transform: translateY(240px); opacity:.2 } }
  </style>
