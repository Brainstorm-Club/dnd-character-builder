<script setup lang="ts">
// Pagina dei crediti.
//
// Esiste per un obbligo preciso: il testo italiano degli incantesimi viene
// dagli SRD di Wizards of the Coast sotto CC-BY-4.0, e la licenza chiede
// l'attribuzione nella forma che l'editore ha pubblicato. Le due dichiarazioni
// stanno in `credits.srd51` e `credits.srd521` **verbatim**, in italiano anche
// nella versione inglese dell'interfaccia: sono avvisi di licenza, non testo
// dell'applicazione, e tradurli vorrebbe dire riscriverli.
//
// Poi ci sono Brancalonia e Apocalisse, che un obbligo del genere non ce
// l'hanno — non sono CC-BY, sono di Acheron Games — e che proprio per questo
// erano finite fuori: la pagina le nominava di sfuggita in «Cosa non c'è»,
// mentre l'app ne spedisce classi, sottoclassi, razze, background, talenti e
// incantesimi. Le attribuzioni sono quelle che scrivono i manuali, parola per
// parola: Brancalonia non è «un gioco di Longo, Mana e Marolla» come si legge
// spesso in giro — loro tre hanno creato Zappa e Spada — ed è il manuale a
// dirlo. Restano in italiano per lo stesso motivo delle due sopra.
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
        <h3 class="font-gothic text-amber-400 mb-2">{{ t('credits.acheronTitle') }}</h3>
        <p class="text-sm text-stone-400 mb-4">{{ t('credits.acheron') }}</p>

        <h4 class="font-gothic text-stone-300 text-sm mb-1">{{ t('credits.brancaloniaTitle') }}</h4>
        <blockquote lang="it" class="text-sm text-stone-400 border-l-2 border-stone-600 pl-4 mb-4">
          {{ t('credits.brancalonia') }}
        </blockquote>

        <h4 class="font-gothic text-stone-300 text-sm mb-1">{{ t('credits.apocalisseTitle') }}</h4>
        <blockquote lang="it" class="text-sm text-stone-400 border-l-2 border-stone-600 pl-4 mb-4">
          {{ t('credits.apocalisse') }}
        </blockquote>

        <a
          href="https://www.acheron.it"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >{{ t('credits.acheronLink') }}</a>
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
