  <script>
    let { style = "right:14%;top:10%" } = $props();
  </script>

  <span class="sun" style={style} aria-hidden="true">☀️</span>

  <style>
    .sun { position: absolute; z-index: 0; font-size: 54px; line-height: 1; filter: drop-shadow(0 0 14px rgba(255,220,120,.9)); animation: pulse 7s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1); opacity:.9 } 50% { transform: scale(1.06); opacity:1 } }
  </style>
