<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="max-w-2xl mx-auto py-12" aria-labelledby="privacy-heading">
    <h2 id="privacy-heading" class="text-3xl font-bold text-amber-500 mb-8">{{ t('privacy.title') }}</h2>

    <div class="space-y-6 text-stone-300">
      <!--
        .bsc-card del design system: porta fondo (--bsc-surface, cioè lo stesso
        stone-800) e imbottitura. Restano bordo e raggio in utility perché la
        card del DS ha 2px di stone-600 e 12px di raggio: qui il bordo è da 1px
        e rounded-lg è il raggio di tutta l'app (121 occorrenze), e un solo
        riquadro fuori scala si noterebbe.
      -->
      <div class="bsc-card border border-stone-700 rounded-lg">
        <p class="mb-4">{{ t('privacy.noData') }}</p>
        <p class="mb-4">{{ t('privacy.localStorage') }}</p>
        <p class="mb-4">{{ t('privacy.noCookies') }}</p>
        <p>{{ t('privacy.noAccount') }}</p>
      </div>
    </div>

    <div class="mt-8">
      <router-link to="/" class="text-amber-400 hover:text-amber-300 transition-colors">
        &larr; {{ t('nav.home') }}
      </router-link>
    </div>
  </section>
</template>
