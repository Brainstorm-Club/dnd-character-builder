<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { getBackgrounds } from '@/data'
import type { Background } from '@/data/dnd5e/backgrounds'
import { SKILLS } from '@/data/dnd5e/skills'
import { getFeatsByCategory } from '@/data/dnd2024/feats'
import { translateGameTerm } from '@/i18n/gameTerms'
import type { AbilityKey } from '@/data/dnd5e/classes'
import {
  originAbilityOptions,
  grantsOriginBonuses,
  originFeatName,
  originFeatId,
  originBonusMap,
  replaceOriginBonuses,
  readOriginChoice,
  NO_ORIGIN_CHOICE,
  type OriginChoice,
  type OriginBonuses,
} from '@/domain/origine2024'
import { useGameTerms } from '@/composables/useGameTerms'
import VariantPromo from '@/components/shared/VariantPromo.vue'

const { t, locale } = useI18n()
const characterStore = useCharacterStore()
const gt = useGameTerms()

/** Translate a background name. Uses nameOriginal for variant backgrounds, gameTerms for D&D 5e. */
function bgDisplayName(bg: Background): string {
  if ((bg as any).nameOriginal) return (bg as any).nameOriginal
  return gt.background(bg.name)
}

function skillDisplayName(skillId: string): string {
  const skill = SKILLS.find(s => s.id === skillId)
  return skill ? gt.skill(skill.name) : skillId
}

const backgrounds = computed(() => getBackgrounds(characterStore.character.variant))
const selectedBg = ref<Background | null>(null)

// Competenze scelte dal giocatore, una casella per slot. Le Origini di
// Apocalisse concedono "due fra Arcano, Medicina, ...": fissarne due
// d'ufficio toglieva al giocatore una scelta che il manuale gli dà.
const chosenSkills = ref<string[][]>([])

// Competenze che questo passo ha già concesso. `skillProficiencies` è un elenco
// piatto condiviso con classe e razza: senza memoria di ciò che è nostro non
// si può togliere il background precedente senza portarsi via il resto.
let appliedSkills: string[] = []

function resetSkillChoices(bg: Background | null) {
  chosenSkills.value = (bg?.skillChoices ?? []).map(c => Array(c.count).fill(''))
}

// --- D&D 2024: bonus di caratteristica e talento d'origine dal background ---
// La regola vive in `@/domain/origine2024`, la stessa che deve chiamare il
// generatore casuale: finché stava scritta solo là dentro, il personaggio
// costruito a mano usciva con sei punteggi nudi e senza talento.

/** Le tre caratteristiche offerte: vuoto in tutte le varianti fuorché il 2024. */
const abilityOptions = computed<AbilityKey[]>(() => originAbilityOptions(selectedBg.value))
const showOriginBonuses = computed(() => grantsOriginBonuses(selectedBg.value))
/**
 * Il background scrive il talento come "Magic Initiate (Cleric)": il nome base
 * ha la sua traduzione, la parentesi no. Si traduce il nome e si riattacca la
 * parentesi, invece di mostrare tutto in inglese come faceva prima.
 */
const originFeatLabel = computed(() => {
  const grezzo = originFeatName(selectedBg.value)
  if (!grezzo) return ''
  const m = /^(.*?)\s*(\(.*\))?$/.exec(grezzo)
  const base = (m?.[1] ?? grezzo).trim()
  const parentesi = m?.[2] ?? ''
  const tradotto = translateGameTerm(base, locale.value, 'feature')
  return parentesi ? `${tradotto} ${parentesi}` : tradotto
})
const originChoice = ref<OriginChoice>({ ...NO_ORIGIN_CHOICE })

// Ciò che questo passo ha già concesso, per poterlo togliere. `racialBonuses` è
// condiviso con la specie: azzerarlo di netto porterebbe via anche i suoi bonus.
let appliedBonuses: OriginBonuses = {}
// Idem per il talento: lo cancelliamo solo se è quello che avevamo messo noi.
let appliedFeat = ''

/** Il +1 non può cadere sulla stessa caratteristica che ha preso il +2. */
const minorOptions = computed(() =>
  abilityOptions.value.filter(a => a !== originChoice.value.major),
)

function chooseMajor(value: string) {
  originChoice.value = { ...originChoice.value, major: value as AbilityKey | '' }
  // Se il +2 si sposta sulla caratteristica che aveva il +1, quest'ultimo resta
  // orfano: meglio svuotarlo che lasciare un selettore che mostra una scelta
  // ormai priva di effetto.
  if (originChoice.value.minor === originChoice.value.major) originChoice.value.minor = ''
  applyOrigin()
}

function chooseMinor(value: string) {
  originChoice.value = { ...originChoice.value, minor: value as AbilityKey | '' }
  applyOrigin()
}

// Fotografia dei bonus come li abbiamo lasciati noi: se li ritroviamo diversi
// significa che li ha riscritti il passo Specie, che rifà la mappa da zero
// (`racialBonuses = { ...race.abilityBonuses }`) ogni volta che si tocca la
// razza. `<KeepAlive>` tiene vivo questo passo, quindi possiamo accorgercene.
let lastWritten: OriginBonuses = {}

function sameBonuses(a: OriginBonuses, b: OriginBonuses): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const k = key as AbilityKey
    if ((a[k] ?? 0) !== (b[k] ?? 0)) return false
  }
  return true
}

/** Riscrive bonus e talento d'origine sul personaggio, senza toccare il resto. */
function applyOrigin() {
  const char = characterStore.character
  const next = originBonusMap(originChoice.value, abilityOptions.value)
  char.racialBonuses = replaceOriginBonuses(char.racialBonuses, appliedBonuses, next)
  appliedBonuses = next
  lastWritten = { ...char.racialBonuses }

  const featId = originFeatId(selectedBg.value, getFeatsByCategory('origin'))
  // Il talento del background precedente se ne va con lui.
  if (appliedFeat && char.feat === appliedFeat && appliedFeat !== featId) char.feat = ''
  // Ma non calpestiamo il talento scelto al passo Specie: l'umano del 2024 ne
  // prende uno con Versatile, e la scheda ha una casella sola per entrambi.
  if (featId && !char.feat) char.feat = featId
  appliedFeat = char.feat === featId ? featId : ''
}

/**
 * Rilegge dalla scheda la scelta già fatta. Senza questo, riaprendo un
 * personaggio salvato i due selettori tornavano vuoti mentre i bonus restavano
 * in scheda: la prima modifica ne avrebbe tolti di meno di quanti ne aveva messi.
 */
function restoreOrigin(bg: Background | null) {
  const options = originAbilityOptions(bg)
  const char = characterStore.character
  originChoice.value = readOriginChoice(char.racialBonuses, options)
  appliedBonuses = originBonusMap(originChoice.value, options)
  const featId = originFeatId(bg, getFeatsByCategory('origin'))
  appliedFeat = featId && char.feat === featId ? featId : ''
  lastWritten = { ...char.racialBonuses }
}

/**
 * Tornare al passo Specie e cambiare razza riscrive `racialBonuses` da capo e
 * si porta via il +2/+1 del background: il giocatore l'aveva scelto e se lo
 * ritrovava sparito dalla scheda. Qui ce ne accorgiamo e lo rimettiamo, senza
 * contarlo due volte — per la mappa nuova non abbiamo ancora concesso nulla.
 */
watch(
  () => characterStore.character.racialBonuses,
  bonuses => {
    if (sameBonuses(bonuses, lastWritten)) return
    if (!showOriginBonuses.value) {
      lastWritten = { ...bonuses }
      return
    }
    appliedBonuses = {}
    applyOrigin()
  },
  { deep: true },
)

/**
 * Riallinea il pannello al personaggio corrente. `<KeepAlive>` in BuilderView
 * evita il rimontaggio fra un passo e l'altro, ma caricare una scheda salvata,
 * rientrare nel builder o importare un JSON sostituisce l'intero personaggio:
 * senza questo il pannello restava vuoto e il primo clic riscriveva tutto.
 */
function restoreFromCharacter() {
  const bg = backgrounds.value.find(b => b.id === characterStore.character.background) ?? null
  selectedBg.value = bg
  resetSkillChoices(bg)
  restoreOrigin(bg)
  if (!bg) {
    appliedSkills = []
    return
  }
  // Ricostruisco le scelte solo per gli slot con un elenco esplicito: uno slot
  // "una qualsiasi" combacerebbe con le competenze di classe e razza, e
  // rivendicarle qui significherebbe cancellarle al prossimo background.
  const claimed = new Set(bg.skillProficiencies)
  ;(bg.skillChoices ?? []).forEach((tier, ti) => {
    if (!tier.from.length) return
    let slot = 0
    for (const skill of characterStore.character.skillProficiencies) {
      if (slot >= tier.count) break
      if (claimed.has(skill) || !tier.from.includes(skill)) continue
      chosenSkills.value[ti]![slot] = skill
      claimed.add(skill)
      slot++
    }
  })
  appliedSkills = [...bg.skillProficiencies, ...chosenSkills.value.flat().filter(Boolean)]
}
restoreFromCharacter()
watch(() => characterStore.character.id, () => restoreFromCharacter())

/** Abilità ancora offerte da uno slot: né già concesse né già scelte altrove. */
function skillOptions(tierIdx: number, slotIdx: number): string[] {
  const bg = selectedBg.value
  if (!bg) return []
  const tier = bg.skillChoices?.[tierIdx]
  const pool = tier && tier.from.length ? tier.from : SKILLS.map(s => s.id)
  const taken = new Set(bg.skillProficiencies)
  chosenSkills.value.forEach((tierSlots, ti) =>
    tierSlots.forEach((s, si) => {
      if (s && !(ti === tierIdx && si === slotIdx)) taken.add(s)
    }),
  )
  return pool.filter(s => !taken.has(s))
}

function chooseSkill(tierIdx: number, slotIdx: number, skill: string) {
  const tier = chosenSkills.value[tierIdx]
  if (!tier) return
  tier[slotIdx] = skill
  applySkills()
}

/**
 * Riscrive le competenze del background: le fisse più quelle scelte. Toglie
 * prima quelle concesse dal background precedente — limitarsi ad aggiungere
 * faceva accumulare le competenze di ogni background provato, una addosso
 * all'altra — ma non tocca ciò che hanno concesso classe e razza.
 */
function applySkills() {
  const bg = selectedBg.value
  if (!bg) return
  const granted = [...bg.skillProficiencies, ...chosenSkills.value.flat().filter(Boolean)]
  const next = characterStore.character.skillProficiencies
    .filter(s => !appliedSkills.includes(s) || granted.includes(s))
  for (const skill of granted) {
    if (!next.includes(skill)) next.push(skill)
  }
  characterStore.character.skillProficiencies = next
  appliedSkills = granted
}

function selectBackground(bg: Background) {
  selectedBg.value = bg
  characterStore.character.background = bg.id
  resetSkillChoices(bg)
  applySkills()
  // Il background nuovo riparte senza scelta: i bonus del precedente vanno via
  // qui dentro, invece di restare sommati a quelli che il giocatore sceglierà.
  originChoice.value = { ...NO_ORIGIN_CHOICE }
  applyOrigin()
}
</script>

<template>
  <section aria-labelledby="background-heading">
    <h2 id="background-heading" class="text-2xl font-bold text-amber-500 mb-6">{{ t('background.title') }}</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="radiogroup" :aria-label="t('background.title')">
      <button
        v-for="bg in backgrounds"
        :key="bg.id"
        @click="selectBackground(bg)"
        class="bg-stone-800 border-2 rounded-lg p-4 text-left transition-all cursor-pointer"
        :class="characterStore.character.background === bg.id ? 'border-amber-500' : 'border-stone-700 hover:border-stone-600'"
        role="radio"
        :aria-checked="characterStore.character.background === bg.id"
        :aria-label="bgDisplayName(bg)"
      >
        <h3 class="font-bold text-amber-400">{{ bgDisplayName(bg) }}</h3>
        <p class="text-xs text-stone-500 mt-1">{{ bg.skillProficiencies.map(skillDisplayName).join(', ') }}</p>
      </button>
    </div>

    <!-- Background Details -->
    <div v-if="selectedBg" class="mt-6 bg-stone-800 border border-stone-700 rounded-lg p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3">{{ bgDisplayName(selectedBg) }}</h3>
      <div class="space-y-3 text-sm">
        <div>
          <h4 class="font-semibold text-stone-300">{{ t('background.skillProficiencies') }}</h4>
          <p v-if="selectedBg.skillProficiencies.length" class="text-stone-400">{{ selectedBg.skillProficiencies.map(skillDisplayName).join(', ') }}</p>
          <div v-for="(tier, ti) in selectedBg.skillChoices ?? []" :key="ti" class="mt-2">
            <p class="text-xs text-stone-500 mb-1">
              {{ t('background.chooseSkills', { count: tier.count }) }}
            </p>
            <div class="flex gap-2 flex-wrap">
              <select
                v-for="slot in tier.count"
                :key="slot"
                class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200"
                :aria-label="t('background.chooseSkills', { count: tier.count })"
                :value="chosenSkills[ti]?.[slot - 1] || ''"
                @change="chooseSkill(ti, slot - 1, ($event.target as HTMLSelectElement).value)"
              >
                <option value="">—</option>
                <option v-for="s in skillOptions(ti, slot - 1)" :key="s" :value="s">
                  {{ skillDisplayName(s) }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <!-- D&D 2024: il +2 e il +1 li dà il background, non la specie -->
        <div v-if="showOriginBonuses">
          <h4 class="font-semibold text-stone-300">{{ t('background.abilityScores') }}</h4>
          <p class="text-xs text-stone-500 mb-1">{{ t('background.abilityScoresHint') }}</p>
          <div class="flex gap-2 flex-wrap">
            <select
              class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200"
              :aria-label="t('background.chooseMajorAbility')"
              :value="originChoice.major"
              @change="chooseMajor(($event.target as HTMLSelectElement).value)"
            >
              <option value="">{{ t('background.chooseMajorAbility') }}</option>
              <option v-for="a in abilityOptions" :key="a" :value="a">
                {{ t(`abilities.${a}`) }} +2
              </option>
            </select>
            <select
              class="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-sm text-stone-200"
              :aria-label="t('background.chooseMinorAbility')"
              :value="originChoice.minor"
              @change="chooseMinor(($event.target as HTMLSelectElement).value)"
            >
              <option value="">{{ t('background.chooseMinorAbility') }}</option>
              <option v-for="a in minorOptions" :key="a" :value="a">
                {{ t(`abilities.${a}`) }} +1
              </option>
            </select>
          </div>
        </div>
        <div v-if="originFeatLabel">
          <h4 class="font-semibold text-stone-300">{{ t('background.originFeat') }}</h4>
          <p class="text-stone-400">{{ originFeatLabel }}</p>
        </div>
        <div v-if="selectedBg.toolProficiencies.length">
          <h4 class="font-semibold text-stone-300">Strumenti</h4>
          <p class="text-stone-400">{{ selectedBg.toolProficiencies.join(', ') }}</p>
        </div>
        <div v-if="selectedBg.languages > 0">
          <h4 class="font-semibold text-stone-300">{{ t('race.languages') }}</h4>
          <p class="text-stone-400">{{ selectedBg.languages }} {{ t('background.languageChoices') }}</p>
        </div>
        <div>
          <h4 class="font-semibold text-stone-300">{{ gt.feature(selectedBg.feature.name) }}</h4>
          <p class="text-stone-400">{{ selectedBg.feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- Personality -->
    <div class="mt-6 space-y-4">
      <div>
        <label for="personality-traits" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('background.personalityTraits') }}</label>
        <textarea id="personality-traits" v-model="characterStore.character.personalityTraits" rows="2"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
      </div>
      <div>
        <label for="ideals" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('background.ideals') }}</label>
        <textarea id="ideals" v-model="characterStore.character.ideals" rows="2"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
      </div>
      <div>
        <label for="bonds" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('background.bonds') }}</label>
        <textarea id="bonds" v-model="characterStore.character.bonds" rows="2"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
      </div>
      <div>
        <label for="flaws" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('background.flaws') }}</label>
        <textarea id="flaws" v-model="characterStore.character.flaws" rows="2"
          class="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-stone-200 text-sm focus:border-amber-500 focus:outline-none" />
      </div>
    </div>

    <VariantPromo :variant="characterStore.character.variant" />
  </section>
</template>
