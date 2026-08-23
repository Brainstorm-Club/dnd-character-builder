<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useCharacterStore } from '@/stores/character'
import { useAppStore } from '@/stores/app'
import type { GameVariant } from '@/stores/app'
import { useGameTerms } from '@/composables/useGameTerms'
import { getMaxLevel } from '@/data'

const { t } = useI18n()
const router = useRouter()
const characterStore = useCharacterStore()
const appStore = useAppStore()
const gt = useGameTerms()

const variantSections: { id: GameVariant; emoji: string; color: string; border: string }[] = [
  { id: 'dnd5e', emoji: '\uD83D\uDC09', color: 'amber', border: 'border-amber-600/40' },
  { id: 'brancalonia', emoji: '\uD83C\uDF72', color: 'emerald', border: 'border-emerald-600/40' },
  { id: 'apocalisse', emoji: '\uD83D\uDD25', color: 'red', border: 'border-red-600/40' },
  { id: 'dnd2024', emoji: '\u2694\uFE0F', color: 'sky', border: 'border-sky-600/40' },
]

const groupedCharacters = computed(() => {
  const groups: Record<GameVariant, typeof characterStore.savedCharacters> = {
    dnd5e: [],
    dnd2024: [],
    brancalonia: [],
    apocalisse: [],
  }
  for (const char of characterStore.savedCharacters) {
    const variant = char.variant || 'dnd5e'
    if (groups[variant]) {
      groups[variant].push(char)
    }
  }
  return groups
})

const totalCount = computed(() => characterStore.savedCharacters.length)

function editCharacter(id: string) {
  characterStore.loadCharacter(id)
  appStore.setStep(8)
  router.push('/builder')
}

// La cancellazione era immediata: un clic sbagliato bruciava una scheda che
// esiste solo nel localStorage di questo browser, senza cestino né annulla.
const pendingDelete = ref<string | null>(null)

function askRemoveCharacter(id: string) {
  pendingDelete.value = id
}

function confirmRemoveCharacter() {
  if (!pendingDelete.value) return
  characterStore.deleteCharacter(pendingDelete.value)
  pendingDelete.value = null
}

const levelUpMessage = ref<{ charId: string; text: string } | null>(null)

function levelUpCharacter(id: string) {
  // `levelUpSaved` invece di `loadCharacter` + `levelUp`: far salire di livello
  // una scheda dell'archivio non deve rimpiazzare il personaggio in corso.
  const result = characterStore.levelUpSaved(id)
  if (!result) {
    levelUpMessage.value = { charId: id, text: t('characters.maxLevel') }
  } else {
    const parts = [`+${result.hpGained} HP`]
    if (result.newFeatures.length > 0) {
      parts.push(result.newFeatures.join(', '))
    }
    levelUpMessage.value = {
      charId: id,
      text: t('characters.levelUpSuccess', { details: parts.join(' | ') }),
    }
  }
  setTimeout(() => { levelUpMessage.value = null }, 5000)
}

function downloadJson(id: string) {
  const char = characterStore.savedCharacters.find(c => c.id === id)
  if (!char) return
  const json = JSON.stringify(char, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${char.name || 'character'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <h2 class="text-2xl font-bold text-amber-500 mb-2 font-gothic">{{ t('nav.characters') }}</h2>

    <!-- localStorage warning -->
    <div class="bg-stone-800/60 border border-stone-700 rounded-lg p-4 mb-6 flex items-start gap-3">
      <span class="text-xl shrink-0" aria-hidden="true">💾</span>
      <div class="text-sm text-stone-400">
        <p>{{ t('characters.storageWarning') }}</p>
        <p class="mt-1 text-stone-500">{{ t('characters.backupAdvice') }}</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="totalCount === 0" class="text-center py-12 text-stone-500">
      <p class="text-4xl mb-3" aria-hidden="true">📜</p>
      <p class="text-lg">{{ t('characters.noCharacters') }}</p>
      <router-link to="/" class="text-amber-500 hover:text-amber-400 mt-4 inline-block">
        {{ t('characters.createFirst') }}
      </router-link>
    </div>

    <!-- Grouped by variant -->
    <template v-else>
      <template v-for="section in variantSections" :key="section.id">
        <section
          v-if="groupedCharacters[section.id].length > 0"
          class="mb-8"
          :aria-label="t(`variant.${section.id}`)"
        >
          <h3 :class="[
            'text-lg font-semibold mb-3 font-gothic flex items-center gap-2',
            section.id === 'dnd5e' ? 'text-amber-400' :
            section.id === 'brancalonia' ? 'text-emerald-400' :
            'text-red-400'
          ]">
            <span aria-hidden="true">{{ section.emoji }}</span>
            {{ t(`variant.${section.id}`) }}
            <span class="text-xs font-normal text-stone-500 ml-1">({{ groupedCharacters[section.id].length }})</span>
          </h3>

          <ul class="space-y-2" role="list">
            <li
              v-for="char in groupedCharacters[section.id]"
              :key="char.id"
            >
              <div :class="['bg-stone-800 rounded-lg p-4 border', section.border]">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <span class="font-medium text-amber-400 text-lg truncate block">
                      {{ char.name || t('common.unnamed') }}
                    </span>
                    <div class="text-stone-400 text-sm mt-1">
                      {{ gt.raceName(char.race) }} {{ gt.className(char.className, char.variant || 'dnd5e') }} Lv.{{ char.level }}
                    </div>
                  </div>
                  <div class="flex gap-2 shrink-0">
                    <button
                      @click="editCharacter(char.id)"
                      :class="[
                        'px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer',
                        section.id === 'dnd5e' ? 'bg-amber-600 hover:bg-amber-500 text-stone-900' :
                        section.id === 'brancalonia' ? 'bg-emerald-600 hover:bg-emerald-500 text-stone-900' :
                        'bg-red-600 hover:bg-red-500 text-stone-100'
                      ]"
                      :aria-label="t('characters.editLabel', { name: char.name || t('common.unnamed') })"
                    >{{ t('characters.edit') }}</button>
                    <button
                      v-if="char.level < getMaxLevel(char.variant || 'dnd5e')"
                      @click="levelUpCharacter(char.id)"
                      class="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-purple-100 rounded text-sm font-medium transition-colors cursor-pointer"
                      :aria-label="t('characters.levelUpLabel', { name: char.name || t('common.unnamed') })"
                    ><span aria-hidden="true">⬆</span> {{ t('characters.levelUp') }}</button>
                    <button
                      @click="downloadJson(char.id)"
                      class="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded text-sm transition-colors cursor-pointer"
                      :aria-label="t('characters.exportLabel', { name: char.name || t('common.unnamed') })"
                    >JSON</button>
                    <button
                      @click="askRemoveCharacter(char.id)"
                      class="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-300 rounded text-sm transition-colors cursor-pointer"
                      :aria-label="t('characters.deleteLabel', { name: char.name || t('common.unnamed') })"
                      :aria-expanded="pendingDelete === char.id"
                    >{{ t('common.remove') }}</button>
                  </div>
                </div>

                <!-- Conferma di cancellazione -->
                <div
                  v-if="pendingDelete === char.id"
                  class="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-red-700/50 bg-red-950/30 px-3 py-2"
                  role="alertdialog"
                  :aria-labelledby="`delete-confirm-${char.id}`"
                >
                  <p :id="`delete-confirm-${char.id}`" class="text-sm text-stone-300 grow">
                    {{ t('characters.deleteLabel', { name: char.name || t('common.unnamed') }) }}?
                  </p>
                  <button
                    class="px-3 py-1.5 rounded text-sm font-semibold bg-red-700 hover:bg-red-600 text-stone-100 cursor-pointer"
                    @click="confirmRemoveCharacter"
                  >
                    {{ t('common.remove') }}
                  </button>
                  <button
                    class="px-3 py-1.5 rounded text-sm bg-stone-700 hover:bg-stone-600 text-stone-200 cursor-pointer"
                    @click="pendingDelete = null"
                  >
                    {{ t('common.cancel') }}
                  </button>
                </div>
                <!-- Level Up feedback -->
                <div
                  v-if="levelUpMessage?.charId === char.id"
                  class="mt-2 p-2 bg-purple-900/30 border border-purple-700 text-purple-300 rounded text-sm"
                  role="status"
                  aria-live="polite"
                >
                  <span aria-hidden="true">✨</span> {{ levelUpMessage.text }}
                </div>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </div>
</template>
