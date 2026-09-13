  <!-- Repeating lightning flash overlay. -->
  <div class="thunder-flash" aria-hidden="true"></div>

  <style>
    .thunder-flash { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: 0; background: rgba(255,255,255,.85); animation: flash 5s ease-in-out infinite; }
    @keyframes flash { 0%,89%,100% { opacity:0 } 90% { opacity:.55 } 93% { opacity:0 } 95% { opacity:.3 } 97% { opacity:0 } }
  </style>
