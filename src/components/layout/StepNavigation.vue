<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore, STEP_KEYS } from '@/stores/app'
import { useCharacterStore } from '@/stores/character'
import { ensureStepData } from '@/data'

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const characterStore = useCharacterStore()

const stepKeys = STEP_KEYS
const isLoading = ref(false)
const confirmingReset = ref(false)

// Il passo è persistito insieme al personaggio, ma l'archivio può contenere
// una coppia incoerente (passo 8 con un personaggio senza classe): il wizard
// controlla i requisiti solo per avanzare, non all'ingresso. Questo è il
// primo componente montato dal builder, quindi è qui che si rimette in riga.
onMounted(() => {
  appStore.clampStepToProgress(characterStore.character)
})

function discardAndGoHome() {
  confirmingReset.value = false
  characterStore.resetCharacter()
  appStore.resetSteps()
  router.push('/')
}

// I dati della variante sono caricati su richiesta (WSG 3.8). Saltando a un
// passo dalla barra senza caricarli prima, il passo compariva vuoto.
async function goToStep(idx: number) {
  // Il passo "Variante" riporta alla home invece di aprire il primo passo del
  // wizard. La home è il vero selettore di variante — ha tutte e quattro,
  // l'archivio e l'importazione — e ripartire da lì azzera davvero il
  // personaggio: restando nel wizard, riscegliere la stessa variante lasciava
  // in piedi razza, classe, incantesimi ed equipaggiamento già scelti.
  if (idx === 0) {
    // Conferma sempre: la vecchia scorciatoia "chiedi solo se hasUnsavedWork"
    // taceva proprio nella prima metà del percorso, dove basta aver scelto
    // variante, caratteristiche e livello per perdere lavoro con un clic.
    if (!confirmingReset.value) {
      confirmingReset.value = true
      return
    }
    discardAndGoHome()
    return
  }

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
            'bg-stone-800 text-stone-300': idx > appStore.currentStep,
          }"
          :aria-current="idx === appStore.currentStep ? 'step' : undefined"
          :aria-label="`${t(`steps.${key}`)} (${idx + 1}/${stepKeys.length})`"
        >
          <!-- I passi non ancora raggiunti avevano stone-500 su stone-700:
               2,87:1, sotto il 4,5:1 richiesto. Su mobile quel numero è
               l'unico contenuto del pulsante, quindi era illeggibile e basta. -->
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            :class="{
              'bg-stone-900 text-amber-500': idx === appStore.currentStep,
              'bg-stone-600 text-stone-200': idx < appStore.currentStep,
              'bg-stone-700 text-stone-300': idx > appStore.currentStep,
            }"
            aria-hidden="true"
          >{{ idx + 1 }}</span>
          <!-- Sotto sm l'etichetta resta nascosta per non far esplodere la
               barra, tranne quella del passo corrente: senza, il solo modo di
               sapere dove si è era contare i pallini. -->
          <span :class="[idx === appStore.currentStep ? 'inline' : 'hidden', 'sm:inline']">{{ t(`steps.${key}`) }}</span>
        </button>
        <span v-if="idx < stepKeys.length - 1" class="text-stone-600 mx-1" aria-hidden="true">&rsaquo;</span>
      </li>
    </ol>

    <div
      v-if="confirmingReset"
      class="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-700/50 bg-amber-950/30 px-4 py-3"
      role="alertdialog"
      aria-labelledby="reset-confirm-text"
    >
      <p id="reset-confirm-text" class="text-sm text-stone-300 grow">
        {{ t('common.discardWarning') }}
      </p>
      <button
        class="px-3 py-1.5 rounded text-sm font-semibold bg-red-700 hover:bg-red-600 text-stone-100 cursor-pointer"
        @click="discardAndGoHome"
      >
        {{ t('common.discardConfirm') }}
      </button>
      <button
        class="px-3 py-1.5 rounded text-sm bg-stone-700 hover:bg-stone-600 text-stone-200 cursor-pointer"
        @click="confirmingReset = false"
      >
        {{ t('common.cancel') }}
      </button>
    </div>
  </nav>
</template>
