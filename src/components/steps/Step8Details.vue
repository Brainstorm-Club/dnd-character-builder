<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { getRaces, getApocalisseRules, getWhacksLevels, getMaxLevel } from '@/data'
import VariantPromo from '@/components/shared/VariantPromo.vue'
import { useGameTerms } from '@/composables/useGameTerms'

const { t, locale } = useI18n()
const characterStore = useCharacterStore()
const gt = useGameTerms()

const variant = computed(() => characterStore.character.variant)
const isBrancalonia = computed(() => variant.value === 'brancalonia')
const isApocalisse = computed(() => variant.value === 'apocalisse')
const maxLevel = computed(() => getMaxLevel(variant.value))

const alignments = [
  'lg', 'ng', 'cg', 'ln', 'tn', 'cn', 'le', 'ne', 'ce'
]

// Auto-derive size from selected race
const raceSize = computed(() => {
  const races = getRaces(variant.value)
  const race = races.find(r => r.id === characterStore.character.race)
  return race?.size || 'Medium'
})

// Keep size in sync with race
if (!characterStore.character.size) {
  characterStore.character.size = raceSize.value
}

// Apocalisse rules data
const apoRules = computed(() => getApocalisseRules(variant.value))
const apoMarks = computed(() => apoRules.value?.marks ?? [])
const apoVirtues = computed(() => apoRules.value?.virtues ?? [])
const apoSins = computed(() => apoRules.value?.sins ?? [])

const selectedMark = computed(() => apoMarks.value.find(m => m.id === characterStore.character.mark))
const markSpirits = computed(() => selectedMark.value?.spirits ?? [])

// Display helpers for Apocalisse (Italian nameOriginal when locale is IT)
function displayName(item: { name: string; nameOriginal?: string }): string {
  if (locale.value === 'it' && item.nameOriginal) return item.nameOriginal
  return item.name
}

// Whacks level display
function whacksDisplay(level: number): string {
  const wl = getWhacksLevels().find(w => w.level === level)
  return wl ? `${level} - ${gt.feature(wl.name)}` : String(level)
}

// Brawling moves as textarea (one per line)
const brawlingMovesText = computed({
  get: () => characterStore.character.brawlingMoves.join('\n'),
  set: (val: string) => {
    characterStore.character.brawlingMoves = val.split('\n').filter(m => m.trim())
  },
})

// Calculate HP when level changes
function updateLevel() {
  characterStore.syncClassAndLevel()
}

</script>

<template>
  <section aria-labelledby="details-heading">
    <h2 id="details-heading" class="text-2xl font-bold text-amber-500 mb-6">{{ t('details.title') }}</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="char-name" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.name') }}</label>
        <input id="char-name" v-model="characterStore.character.name" type="text"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div>
        <label for="player-name" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.playerName') }}</label>
        <input id="player-name" v-model="characterStore.character.playerName" type="text"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div>
        <label for="char-level" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('common.level') }}</label>
        <input id="char-level" v-model.number="characterStore.character.level" type="number" min="1" :max="maxLevel"
          @change="updateLevel"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div>
        <label for="char-alignment" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.alignment') }}</label>
        <select id="char-alignment" v-model="characterStore.character.alignment"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none">
          <option value="">--</option>
          <option v-for="a in alignments" :key="a" :value="a">{{ t(`alignments.${a}`) }}</option>
        </select>
      </div>

      <div>
        <label for="char-age" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.age') }}</label>
        <input id="char-age" v-model="characterStore.character.age" type="text"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div>
        <label for="char-height" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.height') }}</label>
        <input id="char-height" v-model="characterStore.character.height" type="text"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div>
        <label for="char-weight" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.weight') }}</label>
        <input id="char-weight" v-model="characterStore.character.weight" type="text"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div>
        <label for="char-eyes" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.eyes') }}</label>
        <input id="char-eyes" v-model="characterStore.character.eyes" type="text"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div>
        <label for="char-hair" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.hair') }}</label>
        <input id="char-hair" v-model="characterStore.character.hair" type="text"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div>
        <label for="char-skin" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.skin') }}</label>
        <input id="char-skin" v-model="characterStore.character.skin" type="text"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>
    </div>

    <div class="mt-6">
      <label for="char-backstory" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.backstory') }}</label>
      <textarea id="char-backstory" v-model="characterStore.character.backstory" rows="5"
        class="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
    </div>

    <!-- Session Notes -->
    <div class="mt-6">
      <label for="session-notes" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.sessionNotes') }}</label>
      <textarea id="session-notes" v-model="characterStore.character.sessionNotes" rows="4"
        :placeholder="t('details.sessionNotesPlaceholder')"
        class="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
    </div>

    <!-- HP Summary -->
    <div class="mt-6 bg-stone-800 border border-stone-700 rounded-lg p-4">
      <h3 class="font-semibold text-stone-300 mb-2">{{ t('review.hp') }}</h3>
      <div class="flex gap-6 text-sm">
        <div>
          <span class="text-stone-400">{{ t('review.maxHp') }}:</span>
          <span class="text-amber-400 font-bold ml-1">{{ characterStore.character.maxHp }}</span>
        </div>
        <div>
          <span class="text-stone-400">{{ t('review.hitDie') }}:</span>
          <span class="text-stone-200 ml-1">{{ characterStore.character.level }}d{{ characterStore.character.hitDie }}</span>
        </div>
      </div>
    </div>

    <!-- ═══ BRANCALONIA: Brawling & Size ═══ -->
    <div v-if="isBrancalonia" class="mt-6 bg-stone-800 border border-amber-700/30 rounded-lg p-4" role="region" :aria-label="t('details.brawling')">
      <h3 class="font-semibold text-amber-400 mb-4">{{ t('details.brawling') }}</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Size (auto from race) -->
        <div>
          <label for="branc-size" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.size') }}</label>
          <input id="branc-size" :value="gt.size(raceSize)" readonly aria-readonly="true"
            class="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-400 cursor-not-allowed" />
        </div>

        <!-- Whacks Level -->
        <div>
          <label for="branc-whacks" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.whacksLevel') }}</label>
          <select id="branc-whacks" v-model.number="characterStore.character.whacksLevel"
            class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none">
            <option v-for="wl in getWhacksLevels()" :key="wl.level" :value="wl.level">
              {{ whacksDisplay(wl.level) }}
            </option>
          </select>
          <p v-if="characterStore.character.whacksLevel > 0" class="text-xs text-stone-500 mt-1">
            {{ getWhacksLevels().find(w => w.level === characterStore.character.whacksLevel)?.mechanicalEffect }}
          </p>
        </div>
      </div>

      <!-- Brawling Moves -->
      <div class="mt-4">
        <label for="branc-brawling-moves" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.brawlingMoves') }}</label>
        <textarea id="branc-brawling-moves" v-model="brawlingMovesText" rows="3"
          :placeholder="t('details.brawlingMovesPlaceholder')"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
      </div>

      <!-- Misdeeds -->
      <div class="mt-4">
        <label for="branc-misdeeds" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.misdeeds') }}</label>
        <textarea id="branc-misdeeds" v-model="characterStore.character.misdeeds" rows="3"
          :placeholder="t('details.misdeedsPlaceholder')"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
      </div>
    </div>

    <!-- ═══ APOCALISSE: Mark, Virtue, Sin, Humanity ═══ -->
    <div v-if="isApocalisse" class="mt-6 bg-stone-800 border border-red-700/30 rounded-lg p-4" role="region" :aria-label="t('details.markSection')">
      <h3 class="font-semibold text-red-400 mb-4">{{ t('details.markSection') }}</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Mark -->
        <div>
          <label for="apo-mark" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.mark') }}</label>
          <select id="apo-mark" v-model="characterStore.character.mark"
            class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none">
            <option value="">{{ t('details.selectMark') }}</option>
            <option v-for="mark in apoMarks" :key="mark.id" :value="mark.id">
              {{ displayName(mark) }}
            </option>
          </select>
        </div>

        <!-- Mark Spirit -->
        <div>
          <label for="apo-spirit" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.markSpirit') }}</label>
          <select id="apo-spirit" v-model="characterStore.character.markSpirit"
            :disabled="!characterStore.character.mark"
            class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none disabled:opacity-50">
            <option value="">{{ t('details.selectSpirit') }}</option>
            <option v-for="spirit in markSpirits" :key="spirit.id" :value="spirit.id">
              {{ displayName(spirit) }}
            </option>
          </select>
        </div>

        <!-- Virtue -->
        <div>
          <label for="apo-virtue" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.virtue') }}</label>
          <select id="apo-virtue" v-model="characterStore.character.virtue"
            class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none">
            <option value="">{{ t('details.selectVirtue') }}</option>
            <option v-for="v in apoVirtues" :key="v.id" :value="v.id">
              {{ displayName(v) }}
            </option>
          </select>
          <p v-if="characterStore.character.virtue" class="text-xs text-stone-500 mt-1">
            {{ apoVirtues.find(v => v.id === characterStore.character.virtue)?.description }}
          </p>
        </div>

        <!-- Sin -->
        <div>
          <label for="apo-sin" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.sin') }}</label>
          <select id="apo-sin" v-model="characterStore.character.sin"
            class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none">
            <option value="">{{ t('details.selectSin') }}</option>
            <option v-for="s in apoSins" :key="s.id" :value="s.id">
              {{ displayName(s) }}
            </option>
          </select>
          <p v-if="characterStore.character.sin" class="text-xs text-stone-500 mt-1">
            {{ apoSins.find(s => s.id === characterStore.character.sin)?.benefit }}
          </p>
        </div>

        <!-- Humanity -->
        <div>
          <label for="apo-humanity" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('details.humanity') }}</label>
          <input id="apo-humanity" v-model.number="characterStore.character.humanity" type="number" min="0" max="10"
            class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
        </div>
      </div>
    </div>

    <VariantPromo :variant="characterStore.character.variant" class="no-print" />
  </section>
</template>
