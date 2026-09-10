<script>
import { tr } from "../lib/i18n.svelte.js";

const feats = $derived([tr("feat1"), tr("feat2"), tr("feat3"), tr("feat4"), tr("feat5"), tr("feat6")]);
let reportOpen = $state(false);
let rtype = $state("data");
let rdesc = $state("");
let remail = $state("");

function sendReport() {
  const subj = encodeURIComponent(`[Alam report] ${rtype}`);
  const body = encodeURIComponent(`${rdesc}\n\n—\nContact: ${remail || "n/a"}`);
  window.location.href = `mailto:hello@ohmyalam.com?subject=${subj}&body=${body}`;
}
</script>

<section class="mx-auto max-w-[68ch] py-6">
  <h2 class="text-[22px] font-bold">{tr("aboutTitle")}</h2>
  <p class="mt-2 leading-relaxed">{tr("aboutWhat")}</p>

  <h3 class="mt-6 text-[15px] font-bold">{tr("featTitle")}</h3>
  <ul class="mt-2 list-disc space-y-1 pl-5">
    {#each feats as f (f)}
      <li>{f}</li>
    {/each}
  </ul>

  <h3 class="mt-6 text-[15px] font-bold">{tr("apprecTitle")}</h3>
  <p class="mt-1 leading-relaxed text-muted">{tr("apprecText")}</p>

  <h3 class="mt-6 text-[15px] font-bold">{tr("discTitle")}</h3>
  <p class="mt-1 leading-relaxed text-muted">{tr("discText")}</p>

  <h3 class="mt-6 text-[15px] font-bold">{tr("privTitle")}</h3>
  <p class="mt-1 leading-relaxed text-muted">{tr("privText")}</p>

  <h3 class="mt-6 text-[15px] font-bold">{tr("contactTitle")}</h3>
  <p class="mt-1"><a class="text-accent underline" href="mailto:hello@ohmyalam.com">hello@ohmyalam.com</a></p>

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
