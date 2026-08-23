<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const showCookieBanner = ref(false)

// Initialize theme — applies data-theme attribute on <html>
useTheme()

onMounted(() => {
  if (!localStorage.getItem('gdpr-accepted')) {
    showCookieBanner.value = true
  }
})

function acceptGdpr() {
  localStorage.setItem('gdpr-accepted', '1')
  showCookieBanner.value = false
}
</script>

<template>
  <div class="min-h-screen bg-stone-900 text-stone-100 flex flex-col">
    <!-- Skip to content link for keyboard users -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-stone-900 focus:rounded focus:font-semibold"
    >
      Skip to content
    </a>
    <AppHeader />
    <main id="main-content" class="container mx-auto px-4 py-6 flex-1" role="main">
      <router-view />
    </main>
    <footer class="border-t border-stone-800 py-6 text-center" role="contentinfo">
      <div class="container mx-auto px-4 flex flex-col items-center gap-3">
        <!--
          .bsc-btn del design system al posto della solita stringa di utility.
          Restano solo le classi che il DS non può indovinare: il colore (l'app
          usa l'oro come azione principale, il DS il rosso mattone — la scelta
          del marchio non si cambia qui) e no-underline, perché è un <a>.
          --sm porta la misura del piede di pagina, px-4 tiene la larghezza di
          prima invece dei 12px del modificatore.
        -->
        <a
          href="https://paypal.me/fullo/2"
          target="_blank"
          rel="noopener noreferrer"
          class="bsc-btn bsc-btn--sm px-4 py-2 bg-amber-600 hover:bg-amber-500 border-amber-600 hover:border-amber-500 text-stone-900 no-underline"
          aria-label="Buy me a coffee (opens PayPal)"
        >
          <span aria-hidden="true">☕</span> Buy me a coffee
        </a>
        <nav class="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-500" aria-label="Footer links">
          <a
            href="https://www.brainstormclub.it/"
            target="_blank"
            rel="noopener noreferrer"
            class="font-gothic text-red-500 hover:text-red-400 transition-colors no-underline"
            :title="t('footer.brainstormTitle')"
          >{{ t('footer.brainstorm') }}</a>
          <span aria-hidden="true">·</span>
          <span>🇪🇺 {{ t('footer.madeInEU') }}</span>
          <span aria-hidden="true">·</span>
          <router-link to="/privacy" class="hover:text-amber-400 transition-colors">{{ t('footer.privacy') }}</router-link>
          <span aria-hidden="true">·</span>
          <a href="https://github.com/Brainstorm-Club/dnd-character-builder" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 transition-colors">{{ t('footer.license') }}</a>
          <span aria-hidden="true">·</span>
          <a href="https://www.w3.org/TR/web-sustainability-guidelines/" target="_blank" rel="noopener noreferrer" class="hover:text-amber-400 transition-colors" :title="t('footer.wsgTitle')">{{ t('footer.wsg') }}</a>
          <span aria-hidden="true">·</span>
          <router-link to="/sci-report" class="hover:text-emerald-400 transition-colors" :title="t('footer.sciTitle')">{{ t('footer.sci') }}</router-link>
        </nav>
      </div>
    </footer>

    <!--
      GDPR Cookie Banner.
      Valutato .bsc-alert e scartato: il componente del DS è un richiamo in
      linea con filetto rosso a sinistra su fondo neutro, mentre questa è una
      barra fissa a tutta larghezza con filetto in alto. Adottarlo sposterebbe
      il filetto e imporrebbe `display: flex` sull'involucro, che qui contiene
      un `container mx-auto` da centrare: cambierebbe la forma, non solo la
      pelle. Serve prima un .bsc-alert--bar a monte nel submodule.
    -->
    <div
      v-if="showCookieBanner"
      class="fixed bottom-0 left-0 right-0 bg-stone-800 border-t border-amber-700/30 p-4 z-50 shadow-lg"
      role="region"
      :aria-label="t('gdpr.label')"
      aria-describedby="gdpr-desc"
    >
      <div class="container mx-auto flex flex-col sm:flex-row items-center gap-4 max-w-4xl">
        <p id="gdpr-desc" class="text-sm text-stone-300 flex-1">
          {{ t('gdpr.banner') }}
        </p>
        <!-- Stesso .bsc-btn del pulsante del caffè: px-6/py-2 erano già i
             valori del DS, quindi spariscono; resta il colore dell'app. -->
        <button
          @click="acceptGdpr"
          class="bsc-btn bg-amber-600 hover:bg-amber-500 border-amber-600 hover:border-amber-500 text-stone-900 whitespace-nowrap text-sm"
        >
          {{ t('gdpr.accept') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* .bsc-btn solleva il pulsante di 1px al passaggio del mouse e il design
   system non protegge quella transform dietro prefers-reduced-motion. Il
   progetto lo fa ovunque (WSG 2.16), quindi qui è una toppa locale: va
   portata a monte nel submodule, non risolta file per file. */
@media (prefers-reduced-motion: reduce) {
  .bsc-btn,
  .bsc-btn:hover,
  .bsc-btn:active {
    transition: none;
    transform: none;
  }
}
</style>
