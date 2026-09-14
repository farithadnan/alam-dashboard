  <!-- Generic compact filter: one pill per option, optional count + active colour.
       Colour is a hex like "#a51612" (background is its 10% tint). -->
  <script>
    let { pills = [], value = "", onPick = null, allLabel = "", allValue = "", class: cls = "" } = $props();
  </script>

  <div class="flex flex-wrap gap-1.5 {cls}">
    {#if allLabel}
      <button type="button" class="pillfilter" onclick={() => onPick?.(allValue)}
        style={value === allValue ? "border-color:#8a8277;color:#8a8277;background:#8a82771a" : ""}>{allLabel}</button>
    {/if}
    {#each pills as p (p.key)}
      <button type="button" class="pillfilter" onclick={() => onPick?.(p.key)}
        style={value === p.key ? `border-color:${p.color || "#8a8277"};color:${p.color || "#8a8277"};background:${(p.color || "#8a8277")}1a` : ""}>
        {p.label}{#if p.count != null} <span class="font-mono font-semibold">{p.count}</span>{/if}
      </button>
    {/each}
  </div>
