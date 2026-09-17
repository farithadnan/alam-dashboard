  <!--
    Homepage hero: assembles an animated weather scene from generic widgets under
    ./weatherbanner/. The scene is chosen by condition; each widget (sun, moon,
    stars, shooting star, rain, thunder flash, layered cloud) is reusable and
    self-contained. The overlay widget floats place/temp/AQI over it. No mascot.
  -->
  <script>
    import Sun from "./weatherbanner/Sun.svelte";
    import Moon from "./weatherbanner/Moon.svelte";
    import Stars from "./weatherbanner/Stars.svelte";
    import ShootingStar from "./weatherbanner/ShootingStar.svelte";
    import Rain from "./weatherbanner/Rain.svelte";
    import ThunderFlash from "./weatherbanner/ThunderFlash.svelte";
    import Overlay from "./weatherbanner/Overlay.svelte";
    import Actions from "./weatherbanner/Actions.svelte";
    import { sceneOf } from "./weatherbanner/scene.js";

    let { icon = "☀️", label = "", temp = 0, feels = 0, townName = "", appState = "", aqi = null, town = "", state = "", share = null, showTelegram = true, showShare = true } = $props();
    const scene = $derived(sceneOf(icon));
  </script>

  <div class="banner scene-{scene} relative flex flex-col justify-between overflow-hidden rounded-2xl text-white" role="img" aria-label={label}>
    <div class="sun-glow" aria-hidden="true"></div>

    {#if scene === "sunny" || scene === "partly"}<Sun />{/if}
    {#if scene === "night"}<Moon /><Stars count={18} /><ShootingStar />{/if}
    {#if scene === "rain" || scene === "thunder"}<Rain heavy={scene === "thunder"} />{/if}
    {#if scene === "thunder"}<ThunderFlash />{/if}

    <Overlay {label} {townName} {appState} {temp} {feels} {aqi}>
      <svelte:fragment slot="actions"><Actions {town} {state} {share} {showTelegram} {showShare} /></svelte:fragment>
    </Overlay>
  </div>

  <style>
    .banner { min-height: 240px; box-sizing: border-box; position: relative; overflow: hidden; }

    .scene-sunny  { background: linear-gradient(180deg,#3aa0ff 0%, #7fccff 55%, #ffe6b0 100%); }
    .scene-partly { background: linear-gradient(180deg,#4aa3e8 0%, #9cc8ee 60%, #dfe9ee 100%); }
    .scene-cloudy, .scene-overcast { background: linear-gradient(180deg,#5c7290 0%, #93a4bb 60%, #c3ccd6 100%); }
    .scene-rain   { background: linear-gradient(180deg,#41627f 0%, #6d8aa6 60%, #97abbd 100%); }
    .scene-thunder{ background: linear-gradient(180deg,#2b3345 0%, #4a5570 55%, #6f7a92 100%); }
    .scene-mist   { background: linear-gradient(180deg,#7a828c 0%, #a4abb4 60%, #ccd1d6 100%); }
    .scene-night  { background: linear-gradient(180deg,#0d1b3d 0%, #243a63 60%, #3c4f72 100%); }

    .sun-glow {
      position: absolute; left: -40px; top: -60px; width: 230px; height: 230px;
      background: radial-gradient(circle, rgba(255,255,255,.5), transparent 65%);
    }
    .scene-thunder .sun-glow, .scene-night .sun-glow {
      background: radial-gradient(circle, rgba(255,255,220,.28), transparent 65%);
    }
  </style>
