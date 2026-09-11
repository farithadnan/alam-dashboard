<script>
let { label = "", value = "–", sub = "", class: cls = "" } = $props();
</script>

<div class={"glass rounded-xl px-3 py-2 " + cls}>
  <div class="caption text-[11px]">{label}</div>
  <div class="text-[15px] font-semibold">{value}</div>
  {#if sub}<div class="caption text-[11px]">{sub}</div>{/if}
</div>
