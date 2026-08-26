<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { getRaces, getApocalisseRules, getWhacksLevels, getMaxLevel } from '@/data'
import VariantPromo from '@/components/shared/VariantPromo.vue'
import ManualSheetValues from '@/components/shared/ManualSheetValues.vue'
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
    <h2 id="details-heading" class="font-gothic text-2xl font-bold text-amber-500 mb-6">{{ t('details.title') }}</h2>

    <!-- Ventuno controlli ripetevano la stessa riga di utility: etichetta
         (`block text-sm font-semibold text-stone-300 mb-1`) e campo
         (`w-full … px-3 py-2 …`). Sono .bsc-field / .bsc-input / .bsc-select del
         design system, riscritti a mano. Adesso il componente porta struttura,
         larghezza, padding e colore del segnaposto; le utility che restano
         servono a NON cambiare l'aspetto di oggi:
         - `gap-1` tiene i 4px del vecchio `mb-1` (il DS ne vuole 8);
         - `font-semibold` tiene il grassetto dell'etichetta (il DS la vuole di
           peso normale);
         - `bg-stone-800` / `border-stone-700` / `rounded-lg` / `text-stone-200`
           tengono fondo, bordo, raggio e inchiostro di oggi, e sono anche gli
           agganci del foglio di stampa e del tema carta in style.css, che sono
           scritti sulle classi Tailwind e non sui token del DS;
         - `focus:border-amber-500 focus:outline-none` resta il fuoco di oggi:
           le utility vincono sul layer components, quindi il fuoco del DS
           (anello rosso da 3px) non subentra senza una decisione esplicita.
         Sui campi cambia solo il carattere dell'etichetta, che passa a Courier
         Prime: è la voce del marchio, che nei nove passi non compariva. -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bsc-field gap-1">
        <label for="char-name" class="font-semibold">{{ t('details.name') }}</label>
        <input id="char-name" v-model="characterStore.character.name" type="text"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div class="bsc-field gap-1">
        <label for="player-name" class="font-semibold">{{ t('details.playerName') }}</label>
        <input id="player-name" v-model="characterStore.character.playerName" type="text"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div class="bsc-field gap-1">
        <label for="char-level" class="font-semibold">{{ t('common.level') }}</label>
        <input id="char-level" v-model.number="characterStore.character.level" type="number" min="1" :max="maxLevel"
          @change="updateLevel"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <!-- .bsc-select è l'unico punto in cui l'aspetto cambia davvero: la
           freccia nativa del sistema lascia il posto al chevron del DS
           (`appearance: none` + immagine di sfondo), uguale su ogni browser.
           Per questo i menu non prendono `px-3`: il padding destro del
           componente è più largo apposta, per fare posto alla freccia. -->
      <div class="bsc-field gap-1">
        <label for="char-alignment" class="font-semibold">{{ t('details.alignment') }}</label>
        <select id="char-alignment" v-model="characterStore.character.alignment"
          class="bsc-select bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none">
          <option value="">--</option>
          <option v-for="a in alignments" :key="a" :value="a">{{ t(`alignments.${a}`) }}</option>
        </select>
      </div>

      <div class="bsc-field gap-1">
        <label for="char-age" class="font-semibold">{{ t('details.age') }}</label>
        <input id="char-age" v-model="characterStore.character.age" type="text"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div class="bsc-field gap-1">
        <label for="char-height" class="font-semibold">{{ t('details.height') }}</label>
        <input id="char-height" v-model="characterStore.character.height" type="text"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div class="bsc-field gap-1">
        <label for="char-weight" class="font-semibold">{{ t('details.weight') }}</label>
        <input id="char-weight" v-model="characterStore.character.weight" type="text"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div class="bsc-field gap-1">
        <label for="char-eyes" class="font-semibold">{{ t('details.eyes') }}</label>
        <input id="char-eyes" v-model="characterStore.character.eyes" type="text"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div class="bsc-field gap-1">
        <label for="char-hair" class="font-semibold">{{ t('details.hair') }}</label>
        <input id="char-hair" v-model="characterStore.character.hair" type="text"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>

      <div class="bsc-field gap-1">
        <label for="char-skin" class="font-semibold">{{ t('details.skin') }}</label>
        <input id="char-skin" v-model="characterStore.character.skin" type="text"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
      </div>
    </div>

    <div class="bsc-field gap-1 mt-6">
      <label for="char-backstory" class="font-semibold">{{ t('details.backstory') }}</label>
      <textarea id="char-backstory" v-model="characterStore.character.backstory" rows="5"
        class="bsc-input bg-stone-800 border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
    </div>

    <!-- Session Notes -->
    <div class="bsc-field gap-1 mt-6">
      <label for="session-notes" class="font-semibold">{{ t('details.sessionNotes') }}</label>
      <textarea id="session-notes" v-model="characterStore.character.sessionNotes" rows="4"
        :placeholder="t('details.sessionNotesPlaceholder')"
        class="bsc-input bg-stone-800 border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
    </div>

    <!-- Valori della scheda: il riepilogo dei PF era di sola lettura, e chi
         ricopiava una scheda esistente non aveva dove scrivere i propri. -->
    <ManualSheetValues />

    <!-- ═══ BRANCALONIA: Brawling & Size ═══ -->
    <div v-if="isBrancalonia" class="mt-6 bg-stone-800 border border-amber-700/30 rounded-lg p-4" role="region" :aria-label="t('details.brawling')">
      <h3 class="font-gothic font-semibold text-amber-400 mb-4">{{ t('details.brawling') }}</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Size (auto from race) -->
        <div class="bsc-field gap-1">
          <label for="branc-size" class="font-semibold">{{ t('details.size') }}</label>
          <input id="branc-size" :value="gt.size(raceSize)" readonly aria-readonly="true"
            class="bsc-input bg-stone-900 border-stone-700 rounded-lg text-stone-400 cursor-not-allowed" />
        </div>

        <!-- Whacks Level -->
        <div class="bsc-field gap-1">
          <label for="branc-whacks" class="font-semibold">{{ t('details.whacksLevel') }}</label>
          <select id="branc-whacks" v-model.number="characterStore.character.whacksLevel"
            class="bsc-select bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none">
            <option v-for="wl in getWhacksLevels()" :key="wl.level" :value="wl.level">
              {{ whacksDisplay(wl.level) }}
            </option>
          </select>
          <p v-if="characterStore.character.whacksLevel > 0" class="bsc-field-hint text-xs">
            {{ getWhacksLevels().find(w => w.level === characterStore.character.whacksLevel)?.mechanicalEffect }}
          </p>
        </div>
      </div>

      <!-- Brawling Moves -->
      <div class="bsc-field gap-1 mt-4">
        <label for="branc-brawling-moves" class="font-semibold">{{ t('details.brawlingMoves') }}</label>
        <textarea id="branc-brawling-moves" v-model="brawlingMovesText" rows="3"
          :placeholder="t('details.brawlingMovesPlaceholder')"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
      </div>

      <!-- Misdeeds -->
      <div class="bsc-field gap-1 mt-4">
        <label for="branc-misdeeds" class="font-semibold">{{ t('details.misdeeds') }}</label>
        <textarea id="branc-misdeeds" v-model="characterStore.character.misdeeds" rows="3"
          :placeholder="t('details.misdeedsPlaceholder')"
          class="bsc-input bg-stone-800 border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
      </div>
    </div>

    <!-- ═══ APOCALISSE: Mark, Virtue, Sin, Humanity ═══ -->
    <div v-if="isApocalisse" class="mt-6 bg-stone-800 border border-red-700/30 rounded-lg p-4" role="region" :aria-label="t('details.markSection')">
      <h3 class="font-gothic font-semibold text-red-400 mb-4">{{ t('details.markSection') }}</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Mark -->
        <div class="bsc-field gap-1">
          <label for="apo-mark" class="font-semibold">{{ t('details.mark') }}</label>
          <select id="apo-mark" v-model="characterStore.character.mark"
            class="bsc-select bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none">
            <option value="">{{ t('details.selectMark') }}</option>
            <option v-for="mark in apoMarks" :key="mark.id" :value="mark.id">
              {{ displayName(mark) }}
            </option>
          </select>
        </div>

        <!-- Mark Spirit -->
        <div class="bsc-field gap-1">
          <label for="apo-spirit" class="font-semibold">{{ t('details.markSpirit') }}</label>
          <select id="apo-spirit" v-model="characterStore.character.markSpirit"
            :disabled="!characterStore.character.mark"
            class="bsc-select bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none disabled:opacity-50">
            <option value="">{{ t('details.selectSpirit') }}</option>
            <option v-for="spirit in markSpirits" :key="spirit.id" :value="spirit.id">
              {{ displayName(spirit) }}
            </option>
          </select>
        </div>

        <!-- Virtue -->
        <div class="bsc-field gap-1">
          <label for="apo-virtue" class="font-semibold">{{ t('details.virtue') }}</label>
          <select id="apo-virtue" v-model="characterStore.character.virtue"
            class="bsc-select bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none">
            <option value="">{{ t('details.selectVirtue') }}</option>
            <option v-for="v in apoVirtues" :key="v.id" :value="v.id">
              {{ displayName(v) }}
            </option>
          </select>
          <p v-if="characterStore.character.virtue" class="bsc-field-hint text-xs">
            {{ apoVirtues.find(v => v.id === characterStore.character.virtue)?.description }}
          </p>
        </div>

        <!-- Sin -->
        <div class="bsc-field gap-1">
          <label for="apo-sin" class="font-semibold">{{ t('details.sin') }}</label>
          <select id="apo-sin" v-model="characterStore.character.sin"
            class="bsc-select bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none">
            <option value="">{{ t('details.selectSin') }}</option>
            <option v-for="s in apoSins" :key="s.id" :value="s.id">
              {{ displayName(s) }}
            </option>
          </select>
          <p v-if="characterStore.character.sin" class="bsc-field-hint text-xs">
            {{ apoSins.find(s => s.id === characterStore.character.sin)?.benefit }}
          </p>
        </div>

        <!-- Humanity -->
        <div class="bsc-field gap-1">
          <label for="apo-humanity" class="font-semibold">{{ t('details.humanity') }}</label>
          <input id="apo-humanity" v-model.number="characterStore.character.humanity" type="number" min="0" max="10"
            class="bsc-input bg-stone-800 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none" />
        </div>
      </div>
    </div>

    <VariantPromo :variant="characterStore.character.variant" class="no-print" />
  </section>
</template>
