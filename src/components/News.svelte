  <script>
    import { app } from "../lib/store.svelte.js";
    import { timeAgo } from "../lib/flags.js";
    import { tr } from "../lib/i18n.svelte.js";
    import SearchInput from "./ui/SearchInput.svelte";
    import PageHeader from "./ui/PageHeader.svelte";
    import EmptyState from "./ui/EmptyState.svelte";

    const news = $derived(app.data?.news ?? []);
    let newsQ = $state("");
    let showAll = $state(false);
    const NEWS_INITIAL = 8;

    const newsFiltered = $derived(
      news.filter((n) => {
        const q = newsQ.trim().toLowerCase();
        if (!q) return true;
        return `${n.title ?? ""} ${n.outlet ?? ""}`.toLowerCase().includes(q);
      }),
    );
  </script>

  <PageHeader title={tr("newsTitle")} updated={app.updated} />
  {#if news.length}
    <p class="caption -mt-1 mb-1 text-[10.5px] text-muted">{news.length} {tr("newsCount")}</p>
    <SearchInput bind:value={newsQ} placeholder={tr("searchNews")} ariaLabel={tr("searchNews")} />
    {#if newsFiltered.length}
      <ul class="list-none m-0 border-t border-line p-0">
        {#each newsFiltered.slice(0, showAll ? newsFiltered.length : NEWS_INITIAL) as n, i (n.url ?? n.title + i)}
          <li class="border-b border-line px-2.5 py-2.5">
            <a class="text-[14px] font-semibold hover:text-accent" href={n.url} target="_blank" rel="noopener">{n.title}</a>
            <div class="mt-0.5 flex items-center gap-2 text-[12px] text-muted">
              {#if n.outlet}<span class="badge">{n.outlet}</span>{/if}
              {#if n.publishedAt}<span>{timeAgo(n.publishedAt)}</span>{/if}
            </div>
          </li>
        {/each}
      </ul>
      {#if newsFiltered.length > NEWS_INITIAL}
        <button class="ghostbtn mt-3 w-full justify-center" onclick={() => (showAll = !showAll)}>{showAll ? tr("showLess") : tr("showMore")}</button>
      {/if}
    {:else}
      <EmptyState icon="🔍" title={tr("noMatches")} desc="" action={{ label: tr("clearSearch"), onClick: () => (newsQ = "") }} />
    {/if}
  {:else}
    <EmptyState icon="📰" title={tr("noNews")} />
  {/if}
