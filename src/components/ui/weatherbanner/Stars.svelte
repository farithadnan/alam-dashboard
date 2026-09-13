  <!-- Generic twinkling stars spread across the banner. `count` controls density. -->
  <script>
    let { count = 18 } = $props();
    const stars = Array.from({ length: count }, (_, i) => ({
      left: (i * 43) % 94 + 2,
      top: (i * 31) % 74,
      delay: (i % 5) * 0.7,
      size: 2 + (i % 3),
    }));
  </script>

  {#each stars as s, i (i)}
    <span class="star" style="left:{s.left}%;top:{s.top}%;animation-delay:{s.delay}s;width:{s.size}px;height:{s.size}px" aria-hidden="true"></span>
  {/each}

  <style>
    .star { position: absolute; z-index: 0; border-radius: 50%; background: #fff; opacity: .9; animation: twinkle 2.4s ease-in-out infinite; }
    @keyframes twinkle { 0%,100% { opacity:.25 } 50% { opacity:1 } }
  </style>
