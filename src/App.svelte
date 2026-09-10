<script>
import { onMount } from "svelte";
import { app, load } from "./lib/store.svelte.js";
import Area from "./components/Area.svelte";
import Hazards from "./components/Hazards.svelte";

let view = $state("area");

// Reload whenever the selected state changes (reads the server snapshot cache).
$effect(() => {
  if (app.state) load();
});

onMount(() => {
  load(); // first load: get state list, then per-state bundle
  const t = setInterval(() => load(), 60000); // light periodic refresh from cache
  return () => clearInterval(t);
});
</script>

<header class="mx-auto max-w-[640px] px-5 pt-[18px]">
  <div class="flex items-center justify-between">
    <span class="text-[17px] font-bold tracking-wide">Alam<span class="text-accent">.</span></span>
    {#if app.loading}<span class="caption">Updating…</span>{/if}
  </div>
  <nav class="mt-3 flex gap-1 border-b border-line">
    <button class:on={view === "area"} class="navbtn" onclick={() => (view = "area")}>Air and weather</button>
    <button class:on={view === "hazards"} class="navbtn" onclick={() => (view = "hazards")}>Hazards</button>
  </nav>
</header>

<main class="mx-auto max-w-[640px] px-5 pt-1 pb-16">
  {#if view === "area"}
    <Area />
  {:else}
    <Hazards />
  {/if}
</main>
