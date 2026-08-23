<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { usePdfExport } from '@/composables/usePdfExport'
import { copyShareUrl } from '@/utils/shareCharacter'
import QrScheda from '@/components/shared/QrScheda.vue'
import { getMaxLevel } from '@/data'
import VariantPromo from '@/components/shared/VariantPromo.vue'
import CharacterSheet from '@/components/shared/CharacterSheet.vue'

const { t } = useI18n()
const characterStore = useCharacterStore()
const { exportPdf, exporting } = usePdfExport()

const char = computed(() => characterStore.character)

const saveMessage = ref<{ type: 'success' | 'info'; text: string } | null>(null)







// Stessa risoluzione del passo 3: la traduzione è indicizzata per id, e senza
// passarci il riepilogo mostrava il dato grezzo — 'Way of the Open Hand' in
// D&D, la forma composta 'Matador (Mattatore)' in Brancalonia e Apocalisse.

// Multiclass display (defensive: classes may be undefined for old saved characters)



function saveChar() {
  characterStore.saveCharacter()
  saveMessage.value = { type: 'success', text: t('review.saveSuccess') }
  setTimeout(() => { saveMessage.value = null }, 3000)
}

function downloadJson() {
  const json = characterStore.exportJson()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${char.value.name || 'character'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const shareMessage = ref<{ type: 'success' | 'error'; text: string; url?: string } | null>(null)

async function shareCharacter() {
  try {
    const result = await copyShareUrl(char.value)
    if (result.copied) {
      shareMessage.value = { type: 'success', text: t('review.shareCopied') }
      setTimeout(() => { shareMessage.value = null }, 5000)
    } else {
      // Clipboard failed — show the URL so user can copy manually
      shareMessage.value = { type: 'success', text: t('review.shareManual'), url: result.url }
    }
  } catch {
    shareMessage.value = { type: 'error', text: t('review.shareFailed') }
    setTimeout(() => { shareMessage.value = null }, 5000)
  }
}

const canLevelUp = computed(() => char.value.level < getMaxLevel(char.value.variant))
const canLevelDown = computed(() => char.value.level > 1)
const levelUpMessage = ref<string | null>(null)

function doLevelUp() {
  const result = characterStore.levelUp()
  if (!result) {
    levelUpMessage.value = t('characters.maxLevel')
  } else {
    const parts = [`+${result.hpGained} HP`]
    if (result.newFeatures.length > 0) {
      parts.push(result.newFeatures.join(', '))
    }
    levelUpMessage.value = t('characters.levelUpSuccess', { details: parts.join(' | ') })
  }
  setTimeout(() => { levelUpMessage.value = null }, 5000)
}

function doLevelDown() {
  const result = characterStore.levelDown()
  if (!result) {
    levelUpMessage.value = t('characters.minLevel')
  } else {
    const parts = [`-${result.hpLost} HP`]
    if (result.removedFeatures.length > 0) {
      parts.push(result.removedFeatures.join(', '))
    }
    levelUpMessage.value = t('characters.levelDownSuccess', { details: parts.join(' | ') })
  }
  setTimeout(() => { levelUpMessage.value = null }, 5000)
}

const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      characterStore.importJson(e.target?.result as string)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.startsWith('VALIDATION:')) {
        const codes = msg.replace('VALIDATION:', '').split(',')
        alert(codes.map(c => t(`import.${c}`)).join('\n'))
      } else {
        alert(t(`import.${msg}`, t('import.unknownError')))
      }
    }
  }
  reader.readAsText(file)
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <section aria-labelledby="review-heading">
    <h2 id="review-heading" class="text-2xl font-bold text-amber-500 mb-6 font-gothic">{{ t('review.title') }}</h2>

    <!-- La scheda: lo stesso componente della pagina dei personaggi pronti.
         Le sezioni d'ambientazione — rissa, Batoste, Marchio, Virtù, Peccato —
         e le note di sessione entrano dallo slot, perché appartengono a chi
         sta costruendo il personaggio, non a chi lo sfoglia. -->
    <CharacterSheet :char="char">
    </CharacterSheet>

    <!-- Session Notes -->
    <div v-if="char.sessionNotes" class="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
      <h3 class="font-gothic font-semibold text-stone-300 mb-2">{{ t('details.sessionNotes') }}</h3>
      <p class="text-stone-400 text-sm whitespace-pre-wrap">{{ char.sessionNotes }}</p>
    </div>

    <!-- Save/Share confirmation banner -->
    <Transition name="fade">
      <div
        v-if="saveMessage"
        class="mt-4 p-3 rounded-lg border flex items-center gap-3 bg-green-900/30 border-green-700 text-green-300"
        role="status"
        aria-live="polite"
      >
        <span class="text-xl" aria-hidden="true">✅</span>
        <p class="flex-1 text-sm">{{ saveMessage.text }}</p>
      </div>
    </Transition>
    <Transition name="fade">
      <div
        v-if="shareMessage"
        :class="[
          'mt-4 p-3 rounded-lg border flex items-center gap-3',
          shareMessage.type === 'success' ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-red-900/30 border-red-700 text-red-300'
        ]"
        role="status"
        aria-live="polite"
      >
        <span class="text-xl" aria-hidden="true">{{ shareMessage.type === 'success' ? '🔗' : '❌' }}</span>
        <div class="flex-1">
          <p class="text-sm">{{ shareMessage.text }}</p>
          <input v-if="shareMessage.url" type="text" :value="shareMessage.url" readonly
            class="mt-2 w-full text-xs bg-stone-900/50 border border-stone-600 rounded px-2 py-1 text-stone-300 select-all"
            @click="($event.target as HTMLInputElement).select()"
            :aria-label="t('review.shareUrl')"
          />
        </div>
      </div>
    </Transition>


    <!-- Export Buttons -->
    <div class="flex flex-wrap gap-3 mt-6 no-print" role="group" :aria-label="t('review.export')">
      <!-- I tre bottoni il cui colore porta un significato — salva, esporta,
           condividi — usano le varianti semantiche del design system, che
           scelgono anche il primo piano giusto (cambia da colore a colore).
           I due grigi restano utility: il DS non ha un neutro per i bottoni. -->
      <!-- Persist -->
      <button @click="saveChar"
        class="bsc-btn bsc-btn--successo bsc-btn--testo-fedele cursor-pointer">
        <span aria-hidden="true">💾</span> {{ t('review.save') }}
      </button>
      <!-- Export -->
      <button @click="exportPdf" :disabled="exporting"
        class="bsc-btn bsc-btn--attenzione bsc-btn--testo-fedele disabled:opacity-50 cursor-pointer">
        <span aria-hidden="true">📄</span> {{ exporting ? t('common.loading') : t('review.exportPdf') }}
      </button>
      <button @click="downloadJson"
        class="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer">
        <span aria-hidden="true">📥</span> {{ t('review.exportJson') }}
      </button>
      <!-- Import -->
      <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" aria-hidden="true" tabindex="-1" />
      <button @click="triggerImport"
        class="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer">
        <span aria-hidden="true">📤</span> {{ t('review.importJson') }}
      </button>
      <!-- Share -->
      <button @click="shareCharacter"
        class="bsc-btn bsc-btn--info bsc-btn--testo-fedele cursor-pointer">
        <span aria-hidden="true">🔗</span> {{ t('review.shareUrl') }}
      </button>
      <QrScheda :char="char" />
      <!-- Level progression -->
      <button v-if="canLevelUp" @click="doLevelUp"
        class="px-6 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors cursor-pointer">
        <span aria-hidden="true">⬆</span> {{ t('review.levelUp') }}
      </button>
      <button v-if="canLevelDown" @click="doLevelDown"
        class="px-6 py-2 bg-transparent border border-purple-700 text-purple-400 hover:bg-purple-900/20 rounded-lg transition-colors cursor-pointer">
        <span aria-hidden="true">⬇</span> {{ t('review.levelDown') }}
      </button>
    </div>

    <!-- Level Up feedback -->
    <Transition name="fade">
      <div
        v-if="levelUpMessage"
        class="mt-4 p-3 bg-purple-900/30 border border-purple-700 text-purple-300 rounded-lg flex items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <span class="text-xl" aria-hidden="true">✨</span>
        <p class="flex-1 text-sm">{{ levelUpMessage }}</p>
      </div>
    </Transition>

    <VariantPromo :variant="char.variant" class="no-print" />
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
