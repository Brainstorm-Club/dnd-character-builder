<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import { useAppStore } from '@/stores/app'
import type { GameVariant } from '@/stores/app'
import { generateRandomCharacter } from '@/utils/randomCharacter'
import { preloadVariantData, ensureStepData } from '@/data'
import { useGameTerms } from '@/composables/useGameTerms'
import { VARIANT_INFO, HOME_VARIANT_ORDER, variantInfo } from '@/data/variants'

const { t } = useI18n()
const router = useRouter()
const characterStore = useCharacterStore()
const appStore = useAppStore()
const gt = useGameTerms()

const fileInputDnd5e = ref<HTMLInputElement | null>(null)
const fileInputDnd2024 = ref<HTMLInputElement | null>(null)
const fileInputBrancalonia = ref<HTMLInputElement | null>(null)
const fileInputApocalisse = ref<HTMLInputElement | null>(null)
const importMessage = ref<{ type: 'error' | 'warning' | 'success'; text: string } | null>(null)

async function startNew(variant: GameVariant) {
  characterStore.resetCharacter()
  characterStore.character.variant = variant
  // WSG 3.8: Load only race data for Step 2 (rest loaded per step)
  await ensureStepData(variant, 1)
  // Skip Step1 (variant selection) — already chosen from the home card
  appStore.setStep(1)
  router.push('/builder')
}

async function randomChar(variant: GameVariant) {
  // WSG 3.8: Preload data before generating random character
  await preloadVariantData(variant)
  const char = generateRandomCharacter(variant)
  characterStore.character = char
  appStore.setStep(8)
  router.push('/builder')
}

function triggerImport(variant: GameVariant) {
  importMessage.value = null
  const refs = { dnd5e: fileInputDnd5e, dnd2024: fileInputDnd2024, brancalonia: fileInputBrancalonia, apocalisse: fileInputApocalisse }
  refs[variant].value?.click()
}

function handleImport(event: Event, expectedVariant: GameVariant) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const result = characterStore.importJson(e.target?.result as string)

      // Check variant mismatch
      if (result.data.variant !== expectedVariant) {
        importMessage.value = {
          type: 'warning',
          text: t('import.variantMismatch', {
            expected: t(`variant.${expectedVariant}`),
            actual: t(`variant.${result.data.variant}`),
          }),
        }
        // Still load — but warn
        setTimeout(() => {
          appStore.setStep(8)
          router.push('/builder')
        }, 3000)
        return
      }

      // Show warnings if any
      if (result.warnings.length > 0) {
        const warningTexts = result.warnings.map(w => t(`import.${w}`)).join(', ')
        importMessage.value = { type: 'warning', text: warningTexts }
        setTimeout(() => {
          appStore.setStep(8)
          router.push('/builder')
        }, 2000)
        return
      }

      appStore.setStep(8)
      router.push('/builder')
    } catch (err) {
      const msg = (err as Error).message
      if (msg === 'JSON_PARSE_ERROR') {
        importMessage.value = { type: 'error', text: t('import.parseError') }
      } else if (msg === 'JSON_NOT_OBJECT') {
        importMessage.value = { type: 'error', text: t('import.notObject') }
      } else if (msg.startsWith('VALIDATION:')) {
        const codes = msg.replace('VALIDATION:', '').split(',')
        const errorTexts = codes.map(c => t(`import.${c}`)).join('. ')
        importMessage.value = { type: 'error', text: errorTexts }
      } else {
        importMessage.value = { type: 'error', text: t('import.unknownError') }
      }
    }
  }
  reader.readAsText(file)
  // Reset input so same file can be re-selected
  const input = event.target as HTMLInputElement
  if (input) input.value = ''
}

function dismissMessage() {
  importMessage.value = null
}

// Emoji, bordi e colori dei pulsanti vengono dal descrittore unico: due per
// riga, nell'ordine deciso in HOME_VARIANT_ORDER.
const variants = HOME_VARIANT_ORDER.map(v => VARIANT_INFO[v])
</script>

<template>
  <section class="flex flex-col items-center py-8" aria-labelledby="home-heading">
    <div class="text-center max-w-3xl mb-8">
      <h2 id="home-heading" class="text-4xl font-bold text-amber-500 mb-3 font-gothic">{{ t('home.welcome') }}</h2>
      <p class="text-stone-400 text-base leading-relaxed">{{ t('home.description') }}</p>
    </div>

    <!-- Import message banner -->
    <Transition name="fade">
      <div
        v-if="importMessage"
        :class="[
          'w-full max-w-3xl mb-6 p-4 rounded-lg border flex items-start gap-3',
          importMessage.type === 'error' ? 'bg-red-900/30 border-red-700 text-red-300' :
          importMessage.type === 'warning' ? 'bg-amber-900/30 border-amber-700 text-amber-300' :
          'bg-green-900/30 border-green-700 text-green-300'
        ]"
        role="alert"
      >
        <span class="text-xl" aria-hidden="true">{{ importMessage.type === 'error' ? '❌' : importMessage.type === 'warning' ? '⚠️' : '✅' }}</span>
        <p class="flex-1 text-sm">{{ importMessage.text }}</p>
        <button @click="dismissMessage" class="text-stone-400 hover:text-stone-200 cursor-pointer text-lg" :aria-label="t('common.cancel')">&times;</button>
      </div>
    </Transition>

    <!-- Hidden file inputs for each variant -->
    <input ref="fileInputDnd5e" type="file" accept=".json" class="hidden" @change="handleImport($event, 'dnd5e')" aria-hidden="true" tabindex="-1" />
    <input ref="fileInputDnd2024" type="file" accept=".json" class="hidden" @change="handleImport($event, 'dnd2024')" aria-hidden="true" tabindex="-1" />
    <input ref="fileInputBrancalonia" type="file" accept=".json" class="hidden" @change="handleImport($event, 'brancalonia')" aria-hidden="true" tabindex="-1" />
    <input ref="fileInputApocalisse" type="file" accept=".json" class="hidden" @change="handleImport($event, 'apocalisse')" aria-hidden="true" tabindex="-1" />

    <!-- Variant cards -->
    <div class="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
      <article
        v-for="v in variants"
        :key="v.id"
        :class="['bg-stone-800 rounded-xl border p-6 flex flex-col items-center gap-4', v.border]"
      >
        <div class="text-4xl" aria-hidden="true">{{ v.emoji }}</div>
        <h3 class="text-xl font-bold text-stone-100 font-gothic">{{ t(`variant.${v.id}`) }}</h3>
        <p class="text-sm text-stone-400 text-center leading-relaxed">{{ t(`variant.${v.id}Desc`) }}</p>

        <div class="flex flex-col gap-2 w-full mt-auto">
          <button
            @click="startNew(v.id)"
            :class="['w-full px-4 py-2.5 font-semibold rounded-lg transition-colors cursor-pointer text-sm', v.button]"
          >
            <span aria-hidden="true">✨</span> {{ t('home.newFrom') }}
          </button>

          <button
            @click="randomChar(v.id)"
            class="w-full px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer text-sm border border-stone-600"
          >
            <span aria-hidden="true">🎲</span> {{ t('home.randomButton') }}
          </button>

          <button
            @click="triggerImport(v.id)"
            class="w-full px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer text-sm border border-stone-600"
          >
            <span aria-hidden="true">📂</span> {{ t('home.importJson') }}
          </button>
        </div>
      </article>
    </div>

    <!-- Saved characters -->
    <section
      v-if="characterStore.savedCharacters.length > 0"
      class="mt-12 w-full max-w-3xl"
      aria-labelledby="saved-heading"
    >
      <h3 id="saved-heading" class="text-xl font-semibold text-stone-300 mb-4 font-gothic">{{ t('home.savedCharacters') }}</h3>
      <ul class="space-y-2" role="list">
        <li
          v-for="char in characterStore.savedCharacters"
          :key="char.id"
        >
          <button
            class="w-full bg-stone-800 rounded-lg p-4 flex items-center justify-between border border-stone-700 hover:border-amber-700/50 transition-colors cursor-pointer text-left"
            @click="characterStore.loadCharacter(char.id); appStore.setStep(8); $router.push('/builder')"
            :aria-label="`${char.name || t('common.unnamed')} - ${char.race} ${char.className} Lv.${char.level}`"
          >
            <div>
              <span class="font-medium text-amber-400">{{ char.name || t('common.unnamed') }}</span>
              <span class="text-stone-500 ml-2">
                {{ gt.raceName(char.race) }} {{ gt.className(char.className, char.variant) }} Lv.{{ char.level }}
              </span>
            </div>
            <span
              :class="['text-xs uppercase px-2 py-0.5 rounded', variantInfo(char.variant).badge]"
            >{{ char.variant }}</span>
          </button>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
