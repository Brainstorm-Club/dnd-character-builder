<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { getBackgrounds } from '@/data'
import type { Background } from '@/data/dnd5e/backgrounds'
import { SKILLS } from '@/data/dnd5e/skills'
import { useGameTerms } from '@/composables/useGameTerms'
import VariantPromo from '@/components/shared/VariantPromo.vue'

const { t } = useI18n()
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
