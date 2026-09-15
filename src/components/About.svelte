  <script>
    import { SITE } from "../lib/config.js";
    import { tr } from "../lib/i18n.svelte.js";

    const FEAT_ICONS = ["🌬️", "⛅", "📅", "⚠️", "🌐", "🌗"];
    const feats = $derived([tr("feat1"), tr("feat2"), tr("feat3"), tr("feat4"), tr("feat5"), tr("feat6")]);
    let reportOpen = $state(false);
    let rtype = $state("data");
    let rdesc = $state("");
    let remail = $state("");

    function sendReport() {
      const subj = encodeURIComponent(`[Alam report] ${rtype}`);
      const body = encodeURIComponent(`${rdesc}\n\n—\nContact: ${remail || "n/a"}`);
      window.location.href = `mailto:${SITE.email}?subject=${subj}&body=${body}`;
    }
  </script>

  <section class="mx-auto max-w-[68ch] py-6">
    <h2 class="text-[22px] font-bold">{tr("aboutTitle")}</h2>
    <p class="mt-2 leading-relaxed">{tr("aboutWhat")}</p>

    <h3 class="mt-6 text-[15px] font-bold">{tr("featTitle")}</h3>
    <ul class="mt-2 list-none m-0 border-t border-line p-0">
      {#each feats as f, i (f)}
        <li class="flex items-center gap-2.5 border-b border-line px-1 py-2 text-[13.5px]">
          <span class="shrink-0 text-[16px] leading-none" aria-hidden="true">{FEAT_ICONS[i]}</span>
          <span class="min-w-0">{f}</span>
        </li>
      {/each}
    </ul>

    <h3 class="mt-6 text-[15px] font-bold">{tr("sourcesTitle")}</h3>
    <p class="mt-1 leading-relaxed text-muted">{tr("sourcesCredit")}</p>

    <h3 class="mt-6 text-[15px] font-bold">{tr("privTitle")}</h3>
    <p class="mt-1 leading-relaxed text-muted">{tr("privText")}</p>
    <p class="mt-1 leading-relaxed text-muted">{tr("discText")}</p>

    <h3 class="mt-6 text-[15px] font-bold">{tr("contactTitle")}</h3>
    <div class="mt-2 space-y-1.5 text-[14px]">
      <a class="flex items-center gap-2 text-accent hover:underline" href="mailto:${SITE.email}">
        <span aria-hidden="true">✉️</span>{SITE.email}
      </a>
      <a class="flex items-center gap-2 text-accent hover:underline" href="{SITE.github}" target="_blank" rel="noopener" aria-label="GitHub">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>farithadnan
      </a>
    </div>

    <button class="btn-primary mt-6" onclick={() => (reportOpen = true)}>{tr("reportBtn")}</button>
  </section>

  {#if reportOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onclick={() => (reportOpen = false)} role="dialog" aria-modal="true">
      <div class="w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl" onclick={(e) => e.stopPropagation()}>
        <h3 class="mt-0 mb-3 text-[16px] font-bold">{tr("reportTitle")}</h3>
        <label class="flex flex-col gap-1">
          <span class="caption text-[12px]">{tr("reportType")}</span>
          <select bind:value={rtype}>
            <option value="data">{tr("reportTypeData")}</option>
            <option value="bug">{tr("reportTypeBug")}</option>
            <option value="idea">{tr("reportTypeIdea")}</option>
          </select>
        </label>
        <label class="mt-3 flex flex-col gap-1">
          <span class="caption text-[12px]">{tr("reportDesc")}</span>
          <textarea class="min-h-[96px] rounded-xl border border-line bg-bg p-2 text-[14px]" bind:value={rdesc} placeholder={tr("reportDescPh")}></textarea>
        </label>
        <label class="mt-3 flex flex-col gap-1">
          <span class="caption text-[12px]">{tr("reportEmail")}</span>
          <input class="rounded-xl border border-line bg-bg p-2 text-[14px]" bind:value={remail} type="email" />
        </label>
        <div class="mt-4 flex items-center justify-between gap-2">
          <span class="caption text-[12px]">{tr("reportThanks")}</span>
          <button class="btn-primary" onclick={sendReport}>{tr("reportSend")}</button>
        </div>
      </div>
    </div>
  {/if}
