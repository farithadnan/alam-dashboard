<script>
let { value = $bindable(""), placeholder = "Search…", ariaLabel = "Search", class: cls = "" } = $props();
</script>

<input class={"mt-1 w-full " + cls} type="search" {placeholder} aria-label={ariaLabel} bind:value />
