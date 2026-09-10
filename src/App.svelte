<script>
import Air from "./components/Air.svelte";
import Hazards from "./components/Hazards.svelte";
import Weather from "./components/Weather.svelte";

let view = $state("air");
let tick = $state(0);
const tabs = [
  { k: "air", l: "Air quality" },
  { k: "hazards", l: "Hazards" },
  { k: "weather", l: "Weather" },
];
</script>

<header class="mx-auto max-w-[640px] px-5 pt-[18px]">
  <div class="flex items-center justify-between">
    <span class="text-[17px] font-bold tracking-wide">Alam<span class="text-accent">.</span></span>
    <button class="ghostbtn" onclick={() => tick++}>Refresh</button>
  </div>
  <nav class="mt-3 flex gap-1 border-b border-line">
    {#each tabs as t (t.k)}
      <button class:on={view === t.k} class="navbtn" onclick={() => (view = t.k)}>{t.l}</button>
    {/each}
  </nav>
</header>

<main class="mx-auto max-w-[640px] px-5 pt-1 pb-16">
  {#if view === "air"}
    <Air refresh={tick} />
  {:else if view === "hazards"}
    <Hazards refresh={tick} />
  {:else}
    <Weather refresh={tick} />
  {/if}
</main>
