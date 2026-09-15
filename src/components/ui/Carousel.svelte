<script>
let { class: cls = "", children } = $props();
let el;
const scroll = (d) => el?.scrollBy({ left: d * 340, behavior: "smooth" });
</script>

<div class="relative">
  <button class="absolute left-0 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-panel/90 text-[16px] shadow" onclick={() => scroll(-1)} aria-label="Scroll left">‹</button>
  <div bind:this={el} class={"no-scrollbar flex gap-2 overflow-x-auto scroll-smooth px-8 pb-1 " + cls}>{@render children()}</div>
  <button class="absolute right-0 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-panel/90 text-[16px] shadow" onclick={() => scroll(1)} aria-label="Scroll right">›</button>
</div>
