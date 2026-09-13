  <!-- Easy, classic CSS cloud: an oval base + two rounded bumps, soft box-shadow.
       `scale` scales it, `tone` 0..100 greys it toward overcast. -->
  <script>
    let { style = "", scale = 1, tone = 0 } = $props();
    const l = Math.round(94 - Number(tone) * 0.35);
    const s = Math.round(16 - Number(tone) * 0.06);
    const bg = `hsl(210 ${s}% ${l}%)`;
  </script>

  <div class="cloudwrap" style="{style};transform:scale({scale});--bg:{bg}" aria-hidden="true"><span class="cloud"></span></div>

  <style>
    .cloudwrap { position: absolute; z-index: 0; transform-origin: center; width: 350px; height: 120px; }
    .cloud { position: relative; display: block; width: 350px; height: 120px; background: var(--bg,#ECEFF1); box-shadow: 10px 10px rgba(0,0,0,.2); border-radius: 100px; }
    .cloud::after, .cloud::before { content: ""; position: absolute; background: var(--bg,#ECEFF1); border-radius: 100px; }
    .cloud::after  { width: 100px; height: 100px; top: -90px; left: 50px; }
    .cloud::before { width: 180px; height: 180px; top: -60px; left: 130px; }
  </style>
