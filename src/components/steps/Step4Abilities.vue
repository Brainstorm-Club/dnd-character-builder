<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import type { AbilityScores } from '@/stores/character'
import { rollAbilityScores, STANDARD_ARRAY, POINT_BUY_COSTS, pointBuyRemaining } from '@/utils/diceRoller'
import { getMaxLevel } from '@/data'
import { modifier, formatModifier } from '@/utils/calculations'
import DiceRoller from '@/components/shared/DiceRoller.vue'
import VariantPromo from '@/components/shared/VariantPromo.vue'

const { t } = useI18n()
const characterStore = useCharacterStore()

// The starting level is picked here because the class step needs it to know
// whether the character has reached its subclass level yet.
const maxLevel = computed(() => getMaxLevel(characterStore.character.variant))

function clampLevel() {
  // The `max` attribute is only a hint: a typed value can exceed it.
  const lv = characterStore.character.level
  characterStore.character.level = Math.min(Math.max(Math.round(lv) || 1, 1), maxLevel.value)
}

type Method = 'standard' | 'pointbuy' | 'roll'
const method = ref<Method>('standard')
const abilities: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
const rolledScores = ref<number[]>([])
const assignedRolls = ref<Record<keyof AbilityScores, number | null>>({
  str: null, dex: null, con: null, int: null, wis: null, cha: null,
})

// Standard Array
const standardAssignment = ref<Record<keyof AbilityScores, number | null>>({
  str: null, dex: null, con: null, int: null, wis: null, cha: null,
})
const availableStandard = computed(() => {
  const used = Object.values(standardAssignment.value).filter(v => v !== null)
  return STANDARD_ARRAY.filter(v => {
    const usedCount = used.filter(u => u === v).length
    const totalCount = STANDARD_ARRAY.filter(s => s === v).length
    return usedCount < totalCount
  })
})

function setStandardScore(ability: keyof AbilityScores, value: number | null) {
  standardAssignment.value[ability] = value
  if (value !== null) {
    characterStore.character.abilityScores[ability] = value
  }
}

// Point Buy
const pointBuyScores = ref<Record<keyof AbilityScores, number>>({
  str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
})
const remaining = computed(() => pointBuyRemaining(Object.values(pointBuyScores.value)))

function adjustPointBuy(ability: keyof AbilityScores, delta: number) {
  const newVal = pointBuyScores.value[ability] + delta
  if (newVal < 8 || newVal > 15) return
  const oldCost = POINT_BUY_COSTS[pointBuyScores.value[ability]] ?? 0
  const newCost = POINT_BUY_COSTS[newVal] ?? 0
  if (remaining.value - (newCost - oldCost) < 0) return
  pointBuyScores.value[ability] = newVal
  characterStore.character.abilityScores[ability] = newVal
}

// Roll
const isRolling = ref(false)

function doRoll() {
  const result = rollAbilityScores()
  rolledScores.value = result.totals
  assignedRolls.value = { str: null, dex: null, con: null, int: null, wis: null, cha: null }
  isRolling.value = true
}

function onAnimationDone() {
  isRolling.value = false
}

const availableRolls = computed(() => {
  const usedIndices = new Set(
    Object.values(assignedRolls.value).filter((v): v is number => v !== null)
  )
  return rolledScores.value
    .map((score, index) => ({ index, score }))
    .filter(item => !usedIndices.has(item.index))
})

function assignRoll(ability: keyof AbilityScores, val: string) {
  const index = val === '' ? null : Number(val)
  assignedRolls.value[ability] = index
  if (index !== null && rolledScores.value[index] !== undefined) {
    characterStore.character.abilityScores[ability] = rolledScores.value[index]
  }
}

function totalScore(ability: keyof AbilityScores): number {
  return characterStore.totalAbilityScore(ability)
}

function setMethod(m: Method) {
  method.value = m
  if (m === 'pointbuy') {
    for (const a of abilities) {
      characterStore.character.abilityScores[a] = pointBuyScores.value[a]
    }
  }
}
</script>

<template>
  <section aria-labelledby="abilities-heading">
    <h2 id="abilities-heading" class="text-2xl font-bold text-amber-500 mb-6">{{ t('abilities.title') }}</h2>

    <!-- Starting level: decides which subclasses the class step can offer -->
    <div class="mb-6 max-w-xs">
      <label for="starting-level" class="block text-sm font-semibold text-stone-300 mb-1">{{ t('abilities.startingLevel') }}</label>
      <input id="starting-level" v-model.number="characterStore.character.level" type="number" min="1" :max="maxLevel"
        @change="clampLevel"
        class="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:border-amber-500 focus:outline-none" />
      <p class="text-xs text-stone-500 mt-1">{{ t('abilities.startingLevelHint', { max: maxLevel }) }}</p>
    </div>

    <!-- Method Selection -->
    <div class="flex gap-2 mb-6" role="radiogroup" :aria-label="t('abilities.method')">
      <button
        v-for="m in (['standard', 'pointbuy', 'roll'] as Method[])"
        :key="m"
        @click="setMethod(m)"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        :class="method === m ? 'bg-amber-600 text-stone-900' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
        role="radio"
        :aria-checked="method === m"
      >
        {{ t(`abilities.${m === 'pointbuy' ? 'pointBuy' : m === 'standard' ? 'standardArray' : 'roll'}`) }}
      </button>
    </div>

    <!-- Point Buy remaining -->
    <div v-if="method === 'pointbuy'" class="mb-4 text-sm font-medium"
      :class="remaining >= 0 ? 'text-green-400' : 'text-red-400'">
      {{ t('abilities.pointsRemaining', { points: remaining }) }}
    </div>

    <!-- Roll button -->
    <div v-if="method === 'roll'" class="mb-4">
      <div class="flex gap-3 items-center">
        <button
          @click="doRoll"
          :disabled="isRolling"
          class="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-900 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="isRolling" class="inline-flex items-center gap-1">
            <span class="animate-spin inline-block w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full" aria-hidden="true"></span>
            {{ t('abilities.rollDice') }}
          </span>
          <span v-else><span aria-hidden="true">🎲</span> {{ t('abilities.rollDice') }}</span>
        </button>
        <button v-if="rolledScores.length && !isRolling"
          @click="doRoll"
          class="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-lg text-sm transition-colors cursor-pointer"
        ><span aria-hidden="true">🔄</span> {{ t('abilities.reroll') }}</button>
      </div>
      <div v-if="rolledScores.length" class="mt-3">
        <DiceRoller :scores="rolledScores" :rolling="isRolling" @animation-done="onAnimationDone" />
      </div>
    </div>

    <!-- Ability Score Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="ability in abilities"
        :key="ability"
        class="bg-stone-800 border border-stone-700 rounded-lg p-4"
      >
        <h4 class="font-bold text-amber-400 text-sm uppercase mb-3">{{ t(`abilities.${ability}`) }}</h4>

        <!-- Standard Array -->
        <div v-if="method === 'standard'">
          <select
            :value="standardAssignment[ability]"
            @change="setStandardScore(ability, Number(($event.target as HTMLSelectElement).value) || null)"
            class="w-full bg-stone-700 text-stone-200 rounded px-2 py-1 text-sm"
            :aria-label="t(`abilities.${ability}`)"
          >
            <option :value="null">--</option>
            <option v-for="v in availableStandard" :key="v" :value="v"
              :selected="standardAssignment[ability] === v">{{ v }}</option>
            <option v-if="standardAssignment[ability] !== null" :value="standardAssignment[ability]">
              {{ standardAssignment[ability] }} (current)
            </option>
          </select>
        </div>

        <!-- Point Buy -->
        <div v-else-if="method === 'pointbuy'" class="flex items-center gap-3" role="group" :aria-label="t(`abilities.${ability}`)">
          <button @click="adjustPointBuy(ability, -1)"
            :aria-label="`${t(`abilities.${ability}`)} -1`"
            class="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-stone-300 font-bold cursor-pointer">-</button>
          <span class="text-xl font-bold text-stone-200 w-8 text-center" aria-live="polite">{{ pointBuyScores[ability] }}</span>
          <button @click="adjustPointBuy(ability, 1)"
            :aria-label="`${t(`abilities.${ability}`)} +1`"
            class="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-stone-300 font-bold cursor-pointer">+</button>
          <span class="text-xs text-stone-500">({{ POINT_BUY_COSTS[pointBuyScores[ability]] ?? 0 }} pts)</span>
        </div>

        <!-- Roll Assignment (index-based to handle duplicate rolled values) -->
        <div v-else-if="method === 'roll'">
          <select
            :value="assignedRolls[ability] ?? ''"
            @change="assignRoll(ability, ($event.target as HTMLSelectElement).value)"
            class="w-full bg-stone-700 text-stone-200 rounded px-2 py-1 text-sm"
            :aria-label="t(`abilities.${ability}`)"
          >
            <option value="">--</option>
            <option v-for="item in availableRolls" :key="item.index" :value="item.index">{{ item.score }}</option>
            <option v-if="assignedRolls[ability] !== null" :value="assignedRolls[ability]">
              {{ rolledScores[assignedRolls[ability]!] }} (current)
            </option>
          </select>
        </div>

        <!-- Calculated Values -->
        <div class="mt-3 flex items-center justify-between text-xs text-stone-400">
          <div>
            <span v-if="(characterStore.character.racialBonuses[ability] || 0) !== 0" class="text-green-400">
              {{ t('abilities.racialBonus') }}: {{ formatModifier(characterStore.character.racialBonuses[ability] || 0) }}
            </span>
          </div>
          <div class="text-right">
            <div class="text-stone-300">{{ t('abilities.total') }}: <strong class="text-lg text-amber-400">{{ totalScore(ability) }}</strong></div>
            <div>{{ t('abilities.modifier') }}: <strong>{{ formatModifier(modifier(totalScore(ability))) }}</strong></div>
          </div>
        </div>
      </div>
    </div>

    <VariantPromo :variant="characterStore.character.variant" />
  </section>
</template>
