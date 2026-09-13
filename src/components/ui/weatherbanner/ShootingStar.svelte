  <!-- A shooting star streaking across the sky every ~8s. -->
  <span class="shooting" aria-hidden="true"></span>

  <style>
    .shooting {
      position: absolute; top: 15%; right: -90px; width: 80px; height: 2px; z-index: 0;
      background: linear-gradient(90deg, #fff, transparent); border-radius: 999px;
      transform: rotate(-28deg); opacity: 0; animation: shoot 8s ease-in infinite;
    }
    @keyframes shoot { 0%,93%,100% { opacity:0; transform: translate(0,0) rotate(-28deg) } 95% { opacity:.95 } 98.5% { opacity:0; transform: translate(-150px, 70px) rotate(-28deg) } }
  </style>
