<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCharacterStore, clampToMaxLevel } from '@/stores/character'
import { useAppStore, GAME_VARIANTS } from '@/stores/app'
import { decodeCharacterFromUrl, MAX_SHARE_DATA_LENGTH } from '@/utils/shareCharacter'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const characterStore = useCharacterStore()
const appStore = useAppStore()

const error = ref(false)
const characterName = ref('')

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
    characterName.value = characterStore.character.name || t('common.unnamed')

    // Navigate to review step
    appStore.setStep(8)
    router.replace('/builder')
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
    <div v-else class="text-center">
      <div class="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" aria-hidden="true"></div>
      <p class="text-stone-400">{{ t('common.loading') }}</p>
    </div>
  </section>
</template>
