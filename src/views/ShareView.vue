<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCharacterStore, clampToMaxLevel, migrateCharacter } from '@/stores/character'
import { useAppStore, GAME_VARIANTS } from '@/stores/app'
import { decodeCharacterFromUrl, MAX_SHARE_DATA_LENGTH } from '@/utils/shareCharacter'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const characterStore = useCharacterStore()
const appStore = useAppStore()

const error = ref(false)
const characterName = ref('')
/**
 * Personaggio decodificato ma non ancora applicato. Aprire un link condiviso
 * chiamava `resetCharacter()` subito, prima di mostrare qualunque cosa: il
 * personaggio in costruzione spariva senza che nessuno lo avesse chiesto.
 */
const pendingShared = ref<Record<string, unknown> | null>(null)

function applyShared(partial: Record<string, unknown>) {
  // Reset and apply only known character fields (whitelist enforced by decodeCharacterFromUrl)
  characterStore.resetCharacter()
  const current = characterStore.character
  for (const [key, value] of Object.entries(partial)) {
    if (key in current) {
      ;(current as Record<string, unknown>)[key] = value
    }
  }
  // A link shared before the variant's level cap was lowered may carry an
  // over-cap level; clamp it rather than showing an impossible character.
  clampToMaxLevel(characterStore.character)
  // Un link generato prima dello schema 2 non porta né lo slug d'armatura né le
  // voci strutturate: si ricavano da quello che il link contiene.
  migrateCharacter(characterStore.character)
  characterName.value = characterStore.character.name || t('common.unnamed')

  // Navigate to review step
  appStore.setStep(8)
  router.replace('/builder')
}

function confirmOverwrite() {
  const partial = pendingShared.value
  pendingShared.value = null
  if (partial) applyShared(partial)
}

function cancelOverwrite() {
  pendingShared.value = null
  router.replace('/')
}

onMounted(() => {
  try {
    const data = route.params.data as string
    if (!data || data.length > MAX_SHARE_DATA_LENGTH) {
      error.value = true
      return
    }

    const partial = decodeCharacterFromUrl(data)
    if (!partial.variant || !(GAME_VARIANTS as readonly string[]).includes(partial.variant)) {
      error.value = true
      return
    }

    // Il link va applicato solo se non c'è lavoro non salvato da travolgere.
    if (characterStore.hasUnsavedWork) {
      pendingShared.value = partial as Record<string, unknown>
      return
    }
    applyShared(partial as Record<string, unknown>)
  } catch (err) {
    console.error('Failed to decode shared character:', err)
    error.value = true
  }
})
</script>

<template>
  <section class="flex flex-col items-center justify-center py-16" aria-labelledby="share-heading">
    <div v-if="error" class="text-center max-w-md">
      <h2 id="share-heading" class="text-2xl font-bold text-red-400 mb-4">{{ t('share.error') }}</h2>
      <p class="text-stone-400 mb-6">{{ t('share.errorDesc') }}</p>
      <router-link to="/"
        class="inline-block px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold rounded-lg transition-colors">
        {{ t('nav.home') }}
      </router-link>
    </div>
    <div
      v-else-if="pendingShared"
      class="max-w-md rounded-lg border border-amber-700/50 bg-amber-950/30 px-4 py-4"
      role="alertdialog"
      aria-labelledby="share-overwrite-text"
    >
      <p id="share-overwrite-text" class="text-sm text-stone-300 mb-4">
        {{ t('common.discardWarning') }}
      </p>
      <div class="flex flex-wrap gap-3">
        <button
          class="px-3 py-1.5 rounded text-sm font-semibold bg-red-700 hover:bg-red-600 text-stone-100 cursor-pointer"
          @click="confirmOverwrite"
        >
          {{ t('common.confirm') }}
        </button>
        <button
          class="px-3 py-1.5 rounded text-sm bg-stone-700 hover:bg-stone-600 text-stone-200 cursor-pointer"
          @click="cancelOverwrite"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
    <div v-else class="text-center">
      <div class="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" aria-hidden="true"></div>
      <p class="text-stone-400">{{ t('common.loading') }}</p>
    </div>
  </section>
</template>
