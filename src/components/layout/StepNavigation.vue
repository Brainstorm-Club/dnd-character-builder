<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore, STEP_KEYS } from '@/stores/app'
import { useCharacterStore } from '@/stores/character'
import { ensureStepData } from '@/data'

const { t } = useI18n()
const appStore = useAppStore()
const characterStore = useCharacterStore()

const stepKeys = STEP_KEYS
const isLoading = ref(false)

// I dati della variante sono caricati su richiesta (WSG 3.8). Saltando a un
// passo dalla barra senza caricarli prima, il passo compariva vuoto.
async function goToStep(idx: number) {
  const variant = characterStore.character.variant
  if (variant) {
    isLoading.value = true
    try {
      await ensureStepData(variant, idx)
    } finally {
      isLoading.value = false
    }
  }
  appStore.setStep(idx)
}
</script>

<template>
  <nav class="mb-8" aria-label="Character creation steps">
    <ol class="flex items-center gap-1 overflow-x-auto pb-2" role="list">
      <li
        v-for="(key, idx) in stepKeys"
        :key="key"
        class="flex items-center"
        role="listitem"
      >
        <button
          @click="goToStep(idx)"
          :disabled="isLoading"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer"
          :class="{
            'bg-amber-600 text-stone-900': idx === appStore.currentStep,
            'bg-stone-700 text-stone-300 hover:bg-stone-600': idx < appStore.currentStep,
            'bg-stone-800 text-stone-500': idx > appStore.currentStep,
          }"
          :aria-current="idx === appStore.currentStep ? 'step' : undefined"
          :aria-label="`${t(`steps.${key}`)} (${idx + 1}/${stepKeys.length})`"
        >
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            :class="{
              'bg-stone-900 text-amber-500': idx === appStore.currentStep,
              'bg-stone-600 text-stone-200': idx < appStore.currentStep,
              'bg-stone-700 text-stone-500': idx > appStore.currentStep,
            }"
            aria-hidden="true"
          >{{ idx + 1 }}</span>
          <span class="hidden sm:inline">{{ t(`steps.${key}`) }}</span>
        </button>
        <span v-if="idx < stepKeys.length - 1" class="text-stone-600 mx-1" aria-hidden="true">&rsaquo;</span>
      </li>
    </ol>
  </nav>
</template>
