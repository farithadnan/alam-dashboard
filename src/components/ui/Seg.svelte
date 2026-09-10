<script>
let { options = [], value = null, onpick = null, class: cls = "" } = $props();
</script>

<span class="seg {cls}">
  {#each options as o (o.value)}
    <button class:on={value === o.value} class="segbtn" type="button" onclick={() => onpick?.(o.value)}>{o.label}</button>
  {/each}
</span>
