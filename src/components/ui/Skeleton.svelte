<script>
let { h = 16, w = "100%", class: cls = "" } = $props();
</script>

<div class={"rounded-lg bg-line/60 " + cls} style="height:{h}px;width:{w}" aria-hidden="true"></div>
