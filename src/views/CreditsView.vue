<script setup lang="ts">
// Pagina dei crediti.
//
// Esiste per un obbligo preciso: il testo italiano degli incantesimi viene
// dagli SRD di Wizards of the Coast sotto CC-BY-4.0, e la licenza chiede
// l'attribuzione nella forma che l'editore ha pubblicato. Le due dichiarazioni
// stanno in `credits.srd51` e `credits.srd521` **verbatim**, in italiano anche
// nella versione inglese dell'interfaccia: sono avvisi di licenza, non testo
// dell'applicazione, e tradurli vorrebbe dire riscriverli.
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="max-w-2xl mx-auto py-12" aria-labelledby="credits-heading">
    <h2 id="credits-heading" class="text-3xl font-bold text-amber-500 mb-8">{{ t('credits.title') }}</h2>

    <div class="space-y-6 text-stone-300">
      <p>{{ t('credits.intro') }}</p>

      <div class="bsc-card border border-stone-700 rounded-lg">
        <h3 class="font-gothic text-amber-400 mb-2">{{ t('credits.srd51Title') }}</h3>
        <!-- lang="it": la dichiarazione resta italiana anche a interfaccia
             inglese, e un lettore di schermo deve pronunciarla come tale. -->
        <blockquote lang="it" class="text-sm text-stone-400 border-l-2 border-stone-600 pl-4">
          {{ t('credits.srd51') }}
        </blockquote>
      </div>

      <div class="bsc-card border border-stone-700 rounded-lg">
        <h3 class="font-gothic text-amber-400 mb-2">{{ t('credits.srd521Title') }}</h3>
        <blockquote lang="it" class="text-sm text-stone-400 border-l-2 border-stone-600 pl-4">
          {{ t('credits.srd521') }}
        </blockquote>
      </div>

      <div class="bsc-card border border-stone-700 rounded-lg">
        <h3 class="font-gothic text-amber-400 mb-2">{{ t('credits.missingTitle') }}</h3>
        <p class="text-sm text-stone-400">{{ t('credits.missing') }}</p>
      </div>

      <div class="bsc-card border border-stone-700 rounded-lg">
        <h3 class="font-gothic text-amber-400 mb-2">{{ t('credits.moreTitle') }}</h3>
        <p class="text-sm text-stone-400 mb-2">{{ t('credits.more') }}</p>
        <a
          href="https://github.com/Brainstorm-Club/dnd-character-builder/blob/main/DATA-SOURCES.md"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >{{ t('credits.moreLink') }}</a>
      </div>
    </div>

    <div class="mt-8">
      <router-link to="/" class="text-amber-400 hover:text-amber-300 transition-colors">
        &larr; {{ t('nav.home') }}
      </router-link>
    </div>
  </section>
</template>
