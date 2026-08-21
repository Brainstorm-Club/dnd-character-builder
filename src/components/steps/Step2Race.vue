<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { getRaces, getTraitDescription } from '@/data'
import type { Race } from '@/data/dnd5e/races'
import type { AbilityScores } from '@/stores/character'
import { formatModifier, feetToMeters } from '@/utils/calculations'
import { useGameTerms } from '@/composables/useGameTerms'
import VariantPromo from '@/components/shared/VariantPromo.vue'

const { t, locale } = useI18n()
const characterStore = useCharacterStore()
const gt = useGameTerms()

function traitDescription(traitId: string): string {
  return getTraitDescription(characterStore.character.variant, traitId, locale.value)
}

const races = computed(() => getRaces(characterStore.character.variant))

const selectedRace = ref<Race | null>(null)
const selectedSubrace = ref<string>('')
const selectedSubraceObj = computed(
  () => selectedRace.value?.subraces?.find(s => s.id === selectedSubrace.value) || null,
)
// Switching variant resets the character, so drop the local selection too —
// otherwise the detail panel keeps showing a race the new variant does not have.
watch(
  () => [characterStore.character.variant, characterStore.character.race],
  ([, race]) => {
    if (!race) {
      selectedRace.value = null
      selectedSubrace.value = ''
      resetChoices(null)
    }
  },
)

// Free ability score increases the player assigns, one entry per tier.
// Without this a race whose bonus is only a choice — the Brancalonia human,
// every Apocalisse origin but one — silently gets nothing at all.
const abilityKeys: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const chosenBonuses = ref<(keyof AbilityScores | '')[][]>([])

function resetChoices(race: Race | null) {
  chosenBonuses.value = (race?.abilityScoreChoice ?? []).map(tier => Array(tier.count).fill(''))
}

/** Abilities a given tier slot may still offer: no fixed bonus, no duplicate. */
function availableFor(tierIdx: number, slotIdx: number): (keyof AbilityScores)[] {
  const race = selectedRace.value
  if (!race) return []
  const taken = new Set<string>(Object.keys(race.abilityBonuses))
  const sub = race.subraces.find(s => s.id === selectedSubrace.value)
  Object.keys(sub?.abilityBonuses ?? {}).forEach(k => taken.add(k))
  chosenBonuses.value.forEach((tier, ti) =>
    tier.forEach((a, si) => {
      if (a && !(ti === tierIdx && si === slotIdx)) taken.add(a)
    }),
  )
  return abilityKeys.filter(a => !taken.has(a))
}

function chooseBonus(tierIdx: number, slotIdx: number, ability: string) {
  chosenBonuses.value[tierIdx]![slotIdx] = ability as keyof AbilityScores | ''
  if (selectedRace.value) applyRace(selectedRace.value, selectedSubrace.value)
}

// Apply race + chosen subrace to the character (bonuses, speed, languages).
// Kept separate from selectRace so switching subrace does NOT reset the choice.
function applyRace(race: Race, subraceId: string) {
  characterStore.character.race = race.id
  characterStore.character.subrace = subraceId
  characterStore.character.racialBonuses = { ...race.abilityBonuses }
  if (subraceId && race.subraces) {
    const sub = race.subraces.find(s => s.id === subraceId)
    if (sub?.abilityBonuses) {
      for (const [key, val] of Object.entries(sub.abilityBonuses)) {
        const k = key as keyof typeof characterStore.character.racialBonuses
        characterStore.character.racialBonuses[k] = (characterStore.character.racialBonuses[k] || 0) + (val || 0)
      }
    }
  }
  const tiers = race.abilityScoreChoice ?? []
  tiers.forEach((tier, ti) => {
    for (const ability of chosenBonuses.value[ti] ?? []) {
      if (!ability) continue
      const bonuses = characterStore.character.racialBonuses
      bonuses[ability] = (bonuses[ability] || 0) + tier.amount
    }
  })
  characterStore.character.speed = race.speed
  characterStore.character.languages = [...race.languages]
}

function selectRace(race: Race) {
  selectedRace.value = race
  resetChoices(race)
  selectedSubrace.value = race.subraces?.[0]?.id || ''
  applyRace(race, selectedSubrace.value)
}

function selectSubrace(subraceId: string) {
  selectedSubrace.value = subraceId
  if (selectedRace.value) {
    applyRace(selectedRace.value, subraceId)
  }
}

function bonusString(bonuses: Record<string, number>): string {
  return Object.entries(bonuses)
    .filter(([, v]) => v !== 0)
    .map(([k, v]) => `${k.toUpperCase()} ${formatModifier(v)}`)
    .join(', ')
}
</script>

<template>
  <section aria-labelledby="race-heading">
    <h2 id="race-heading" class="text-2xl font-bold text-amber-500 mb-6">{{ t('race.title') }}</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="radiogroup" :aria-label="t('race.title')">
      <button
        v-for="race in races"
        :key="race.id"
        @click="selectRace(race)"
        class="bg-stone-800 border-2 rounded-lg p-4 text-left transition-all cursor-pointer"
        :class="characterStore.character.race === race.id ? 'border-amber-500' : 'border-stone-700 hover:border-stone-600'"
        role="radio"
        :aria-checked="characterStore.character.race === race.id"
        :aria-label="gt.raceName(race.name)"
      >
        <h3 class="font-bold text-amber-400">{{ gt.raceName(race.name) }}</h3>
        <p class="text-xs text-stone-400 mt-1">{{ bonusString(race.abilityBonuses) }}</p>
        <p class="text-xs text-stone-500 mt-1">{{ t('race.speed') }}: {{ feetToMeters(race.speed) }}m &bull; {{ race.size }}</p>
      </button>
    </div>

    <!-- Race Details -->
    <div v-if="selectedRace" class="mt-6 bg-stone-800 border border-stone-700 rounded-lg p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3">{{ gt.raceName(selectedRace.name) }}</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 class="font-semibold text-stone-300 mb-1">{{ t('race.abilityBonuses') }}</h4>
          <p class="text-stone-400">{{ bonusString(selectedRace.abilityBonuses) }}</p>
        </div>
        <div>
          <h4 class="font-semibold text-stone-300 mb-1">{{ t('race.speed') }}</h4>
          <p class="text-stone-400">{{ feetToMeters(selectedRace.speed) }}m</p>
        </div>
        <div>
          <h4 class="font-semibold text-stone-300 mb-1">{{ t('race.size') }}</h4>
          <p class="text-stone-400">{{ selectedRace.size }}</p>
        </div>
        <div>
          <h4 class="font-semibold text-stone-300 mb-1">{{ t('race.languages') }}</h4>
          <p class="text-stone-400">{{ selectedRace.languages.map(l => gt.language(l)).join(', ') }}</p>
        </div>
      </div>

      <!-- Free ability score increases the race leaves to the player -->
      <div v-if="selectedRace.abilityScoreChoice?.length" class="mt-4">
        <h4 class="font-semibold text-stone-300 mb-2">{{ t('race.chooseBonuses') }}</h4>
        <div
          v-for="(tier, ti) in selectedRace.abilityScoreChoice"
          :key="ti"
          class="mb-2"
        >
          <p class="text-xs text-stone-500 mb-1">
            {{ t('race.bonusTier', { amount: formatModifier(tier.amount), count: tier.count }) }}
          </p>
          <div class="flex gap-2 flex-wrap">
            <select
              v-for="slot in tier.count"
              :key="slot"
              :value="chosenBonuses[ti]?.[slot - 1] || ''"
              :aria-label="t('race.bonusTier', { amount: formatModifier(tier.amount), count: tier.count })"
              @change="chooseBonus(ti, slot - 1, ($event.target as HTMLSelectElement).value)"
              class="bg-stone-800 border border-stone-700 rounded-lg px-3 py-1 text-sm text-stone-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="">--</option>
              <option
                v-for="a in availableFor(ti, slot - 1)"
                :key="a"
                :value="a"
              >{{ t(`abilities.${a}`) }}</option>
              <option
                v-if="chosenBonuses[ti]?.[slot - 1]"
                :value="chosenBonuses[ti]?.[slot - 1]"
              >{{ t(`abilities.${chosenBonuses[ti]?.[slot - 1]}`) }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="selectedRace.traits.length" class="mt-4">
        <h4 class="font-semibold text-stone-300 mb-1">{{ t('race.traits') }}</h4>
        <ul class="text-stone-400 text-sm space-y-2">
          <li v-for="trait in selectedRace.traits" :key="trait">
            <span class="text-stone-300">&bull; {{ gt.trait(trait) }}</span>
            <span v-if="traitDescription(trait)" class="block ml-3 text-stone-400/80">{{ traitDescription(trait) }}</span>
          </li>
        </ul>
      </div>

      <!-- Subraces -->
      <div v-if="selectedRace.subraces && selectedRace.subraces.length > 0" class="mt-4">
        <h4 class="font-semibold text-stone-300 mb-2">{{ t('race.subrace') }}</h4>
        <div class="flex gap-2 flex-wrap" role="radiogroup" :aria-label="t('race.subrace')">
          <button
            v-for="sub in selectedRace.subraces"
            :key="sub.id"
            @click="selectSubrace(sub.id)"
            class="px-3 py-1 rounded text-sm transition-colors cursor-pointer"
            :class="selectedSubrace === sub.id ? 'bg-amber-600 text-stone-900' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
            role="radio"
            :aria-checked="selectedSubrace === sub.id"
          >
            {{ gt.subraceName(sub.name) }}
          </button>
        </div>

        <!-- Selected subrace details -->
        <div v-if="selectedSubraceObj" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div v-if="bonusString(selectedSubraceObj.abilityBonuses)">
            <h4 class="font-semibold text-stone-300 mb-1">{{ t('race.abilityBonuses') }}</h4>
            <p class="text-stone-400">{{ bonusString(selectedSubraceObj.abilityBonuses) }}</p>
          </div>
          <div v-if="selectedSubraceObj.traits.length">
            <h4 class="font-semibold text-stone-300 mb-1">{{ t('race.traits') }}</h4>
            <ul class="text-stone-400 space-y-2">
              <li v-for="trait in selectedSubraceObj.traits" :key="trait">
                <span class="text-stone-300">&bull; {{ gt.trait(trait) }}</span>
                <span v-if="traitDescription(trait)" class="block ml-3 text-stone-400/80">{{ traitDescription(trait) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <VariantPromo :variant="characterStore.character.variant" />
  </section>
</template>
