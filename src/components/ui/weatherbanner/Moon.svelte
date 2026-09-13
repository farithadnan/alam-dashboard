  <script>
    let { style = "right:12%;top:12%" } = $props();
  </script>

  <span class="moon" style={style} aria-hidden="true">🌙</span>

  <style>
    .moon { position: absolute; z-index: 0; font-size: 50px; line-height: 1; filter: drop-shadow(0 0 12px rgba(255,240,180,.9)); animation: pulse 5s ease-in-out infinite; }
    @keyframes pulse { 0%,100% { transform: scale(1); opacity:.85 } 50% { transform: scale(1.12); opacity:1 } }
  </style>
