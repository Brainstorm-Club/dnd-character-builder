<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { useAppStore } from '@/stores/app'
import type { GameVariant } from '@/stores/app'
import { ensureStepData } from '@/data'
import VariantPromo from '@/components/shared/VariantPromo.vue'

const { t } = useI18n()
const characterStore = useCharacterStore()
const appStore = useAppStore()

async function selectVariant(variant: GameVariant) {
  // Race, subrace, class, subclass, background, spells and equipment are all
  // variant-specific. Carrying them across would leave, say, a Brancalonia
  // marionette on an Apocalisse character, so switching variant starts over.
  if (characterStore.character.variant !== variant) {
    characterStore.resetCharacter()
  }
  characterStore.character.variant = variant
  // WSG 3.8: Load only race data needed for Step 2
  await ensureStepData(variant, 1)
  appStore.nextStep()
}
</script>

<template>
  <section aria-labelledby="variant-heading">
    <!-- font-gothic: il titolo del passo prende la stessa faccia da macchina
         da scrivere del marchio nell'intestazione. La misura non cambia — la
         scala tipografica dell'app resta quella. -->
    <h2 id="variant-heading" class="text-2xl font-bold text-amber-500 mb-6 font-gothic">{{ t('variant.title') }}</h2>

    <!--
      Le quattro schede sono controlli a due stati (role="radio" +
      aria-checked): NON diventano .bsc-opt. Il .bsc-opt del DS presuppone
      l'attributo `disabled` nativo, che toglie il controllo dalla tabulazione,
      mentre qui il contratto è aria-*. Cambiare la pelle senza aver deciso il
      contratto darebbe una scheda che sembra spenta ed è ancora cliccabile.
    -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="radiogroup" :aria-label="t('variant.title')">
      <button
        @click="selectVariant('dnd5e')"
        class="group bg-stone-800 border-2 rounded-xl p-6 text-left transition-all cursor-pointer hover:shadow-lg"
        :class="characterStore.character.variant === 'dnd5e' ? 'border-amber-500 shadow-amber-500/20' : 'border-stone-700 hover:border-amber-600/50'"
        role="radio"
        :aria-checked="characterStore.character.variant === 'dnd5e'"
      >
        <div class="text-4xl mb-3" aria-hidden="true">&#x1F409;</div>
        <h3 class="text-xl font-bold text-amber-400 mb-2">{{ t('variant.dnd5e') }}</h3>
        <p class="text-stone-400 text-sm">{{ t('variant.dnd5eDesc') }}</p>
        <div class="mt-4 text-xs text-stone-500">
          {{ t('variant.dnd5eFeatures') }}
        </div>
      </button>


      <button
        @click="selectVariant('dnd2024')"
        class="group bg-stone-800 border-2 rounded-xl p-6 text-left transition-all cursor-pointer hover:shadow-lg"
        :class="characterStore.character.variant === 'dnd2024' ? 'border-amber-500 shadow-amber-500/20' : 'border-stone-700 hover:border-amber-600/50'"
        role="radio"
        :aria-checked="characterStore.character.variant === 'dnd2024'"
      >
        <div class="text-4xl mb-3" aria-hidden="true">&#x2694;&#xFE0F;</div>
        <h3 class="text-xl font-bold text-amber-400 mb-2">{{ t('variant.dnd2024') }}</h3>
        <p class="text-stone-400 text-sm">{{ t('variant.dnd2024Desc') }}</p>
        <div class="mt-4 text-xs text-stone-500">
          {{ t('variant.dnd2024Features') }}
        </div>
      </button>

      <button
        @click="selectVariant('brancalonia')"
        class="group bg-stone-800 border-2 rounded-xl p-6 text-left transition-all cursor-pointer hover:shadow-lg"
        :class="characterStore.character.variant === 'brancalonia' ? 'border-amber-500 shadow-amber-500/20' : 'border-stone-700 hover:border-amber-600/50'"
        role="radio"
        :aria-checked="characterStore.character.variant === 'brancalonia'"
      >
        <div class="text-4xl mb-3" aria-hidden="true">&#x1F35D;</div>
        <h3 class="text-xl font-bold text-amber-400 mb-2">{{ t('variant.brancalonia') }}</h3>
        <p class="text-stone-400 text-sm">{{ t('variant.brancaloniaDesc') }}</p>
        <div class="mt-4 text-xs text-stone-500">
          {{ t('variant.brancaloniaFeatures') }}
        </div>
      </button>

      <button
        @click="selectVariant('apocalisse')"
        class="group bg-stone-800 border-2 rounded-xl p-6 text-left transition-all cursor-pointer hover:shadow-lg"
        :class="characterStore.character.variant === 'apocalisse' ? 'border-amber-500 shadow-amber-500/20' : 'border-stone-700 hover:border-amber-600/50'"
        role="radio"
        :aria-checked="characterStore.character.variant === 'apocalisse'"
      >
        <div class="text-4xl mb-3" aria-hidden="true">&#x1F525;</div>
        <h3 class="text-xl font-bold text-amber-400 mb-2">{{ t('variant.apocalisse') }}</h3>
        <p class="text-stone-400 text-sm">{{ t('variant.apocalisseDesc') }}</p>
        <div class="mt-4 text-xs text-stone-500">
          {{ t('variant.apocalisseFeatures') }}
        </div>
      </button>
    </div>

    <VariantPromo variant="brancalonia" />
    <VariantPromo variant="apocalisse" />
  </section>
</template>
