<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { getSpells, getSpellSlots, getCantripsKnown, getSpellsKnownCount, getClasses, getMulticlassSpellSlots, ensureSpellData } from '@/data'
import type { CasterType } from '@/data/dnd5e/classes'
import { useGameTerms } from '@/composables/useGameTerms'
import type { Spell } from '@/data/dnd5e/spells'
import { rollDice } from '@/utils/diceRoller'
import VariantPromo from '@/components/shared/VariantPromo.vue'

const { t } = useI18n()
const characterStore = useCharacterStore()
const gt = useGameTerms()

// Game data is loaded lazily and the getters read non-reactive module state.
// Loading it here and touching `dataReady` inside the derived computeds makes
// the list (re)appear once the async import resolves — even when this step is
// reached directly (reload, editing a saved character) rather than sequentially.
const dataReady = ref(false)
onMounted(async () => {
  await ensureSpellData(characterStore.character.variant)
  dataReady.value = true
})

const allSpells = computed(() => { void dataReady.value; return getSpells(characterStore.character.variant) })
const allClasses = computed(() => { void dataReady.value; return getClasses(characterStore.character.variant) })

const isMulticlass = computed(() => (characterStore.character.classes ?? []).length >= 2)

// For multiclass, check if ANY class is a caster
const isCaster = computed(() => {
  if (isMulticlass.value) {
    return characterStore.character.classes.some(entry => {
      const cls = allClasses.value.find(c => c.id === entry.classId)
      return !!cls?.spellcasting
    })
  }
  return !!characterStore.character.spellcastingAbility
})

const casterClassEntries = computed(() =>
  characterStore.character.classes.map(entry => {
    const cls = allClasses.value.find(c => c.id === entry.classId)
    return {
      classId: entry.classId,
      level: entry.level,
      casterType: (cls?.spellcasting?.casterType ?? null) as CasterType | null,
    }
  }),
)

// Spell slots: use multiclass calculation when multiclassed
const spellSlots = computed(() => {
  void dataReady.value
  if (isMulticlass.value) return getMulticlassSpellSlots(casterClassEntries.value).slots
  return getSpellSlots(characterStore.character.className, characterStore.character.level)
})

// Pact magic slots (Warlock in multiclass) — shown separately
const pactSlots = computed(() => {
  void dataReady.value
  if (!isMulticlass.value) return {}
  return getMulticlassSpellSlots(casterClassEntries.value).pactSlots
})

const hasPactSlots = computed(() => Object.keys(pactSlots.value).length > 0)

/** Total character level (sum of class levels for multiclass). */
const totalLevel = computed(() => {
  const c = characterStore.character
  if ((c.classes ?? []).length >= 2) return c.classes.reduce((s, e) => s + e.level, 0)
  return c.level
})

/** Highest spell level the character can actually cast (drives what's learnable). */
const maxSpellLevel = computed(() => {
  const fromSlots = Object.keys(spellSlots.value).map(Number).filter(l => (spellSlots.value as Record<number, number>)[l]! > 0)
  const fromPact = Object.keys(pactSlots.value).map(Number).filter(l => (pactSlots.value as Record<number, number>)[l]! > 0)
  return Math.max(0, ...fromSlots, ...fromPact)
})

// Cantrips: sum from all caster classes for multiclass
const maxCantrips = computed(() => {
  void dataReady.value
  if (isMulticlass.value) {
    let total = 0
    for (const entry of characterStore.character.classes) total += getCantripsKnown(entry.classId, entry.level)
    return total
  }
  return getCantripsKnown(characterStore.character.className, characterStore.character.level)
})

// Default (RAW, by class rules) number of spells known.
const rawSpellsKnown = computed(() => {
  void dataReady.value
  if (isMulticlass.value) {
    let total = 0
    for (const entry of characterStore.character.classes) total += getSpellsKnownCount(entry.classId, entry.level, characterStore.abilityModifiers)
    return total
  }
  return getSpellsKnownCount(characterStore.character.className, characterStore.character.level, characterStore.abilityModifiers)
})

// Effective limit of spells known. An explicit override (roll / manual / auto)
// wins over the class default. Deliberately NOT tied to spell slots.
const maxSpellsKnown = computed(() => {
  const lim = characterStore.character.spellsKnownLimit ?? 0
  return lim > 0 ? lim : rawSpellsKnown.value
})

const searchQuery = ref('')
const filterLevel = ref<number | null>(null)

const casterClassIds = computed(() => {
  if (isMulticlass.value) return characterStore.character.classes.map(c => c.classId)
  return [characterStore.character.className]
})

const availableSpells = computed(() => {
  const classIds = casterClassIds.value
  return allSpells.value.filter(spell => {
    if (!classIds.some(cls => spell.classes.includes(cls))) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      if (!spell.name.toLowerCase().includes(q) && !gt.spell(spell.name).toLowerCase().includes(q)) return false
    }
    if (filterLevel.value !== null && spell.level !== filterLevel.value) return false
    return true
  })
})

const cantrips = computed(() => availableSpells.value.filter(s => s.level === 0))
// Only leveled spells the character can actually cast (level ≤ their max) are learnable.
const leveledSpells = computed(() => availableSpells.value.filter(s => s.level > 0 && s.level <= maxSpellLevel.value))

const selectedSpellDetail = ref<Spell | null>(null)

// ─── Known-spells count: roll / manual / auto ──────────────────────────────
const lastRoll = ref<number[] | null>(null)

function trimKnownToLimit() {
  const c = characterStore.character
  if (c.spellsKnown.length > maxSpellsKnown.value) {
    c.spellsKnown = c.spellsKnown.slice(0, maxSpellsKnown.value)
  }
}

/** Roll 1d4 per character level → number of spells known. */
function rollSpellsKnown() {
  const rolls = rollDice(Math.max(1, totalLevel.value), 4)
  lastRoll.value = rolls
  characterStore.character.spellsKnownLimit = rolls.reduce((a, b) => a + b, 0)
  trimKnownToLimit()
}

function onManualLimit() {
  lastRoll.value = null
  const c = characterStore.character
  if ((c.spellsKnownLimit ?? 0) < 0) c.spellsKnownLimit = 0
  trimKnownToLimit()
}

/** Auto: roll the count, then auto-pick that many learnable spells + cantrips. */
function autoSelect() {
  rollSpellsKnown()
  const c = characterStore.character
  const pool = [...leveledSpells.value].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
  c.spellsKnown = pool.slice(0, maxSpellsKnown.value).map(s => s.id)
  c.cantrips = cantrips.value.slice(0, maxCantrips.value).map(s => s.id)
}

function resetToClassDefault() {
  characterStore.character.spellsKnownLimit = 0
  lastRoll.value = null
}

function toggleCantrip(spellId: string) {
  const idx = characterStore.character.cantrips.indexOf(spellId)
  if (idx >= 0) characterStore.character.cantrips.splice(idx, 1)
  else if (characterStore.character.cantrips.length < maxCantrips.value) characterStore.character.cantrips.push(spellId)
}

function toggleSpell(spellId: string) {
  const idx = characterStore.character.spellsKnown.indexOf(spellId)
  if (idx >= 0) characterStore.character.spellsKnown.splice(idx, 1)
  else if (characterStore.character.spellsKnown.length < maxSpellsKnown.value) characterStore.character.spellsKnown.push(spellId)
}

function showDetail(spell: Spell) {
  selectedSpellDetail.value = spell
}
</script>

<template>
  <section aria-labelledby="spells-heading">
    <h2 id="spells-heading" class="text-2xl font-bold text-amber-500 mb-6">{{ t('spells.title') }}</h2>

    <div v-if="!isCaster" class="text-center py-12 text-stone-500" role="status">
      <p class="text-lg">{{ isMulticlass ? t('spells.notACasterMulticlass') : t('spells.notACaster') }}</p>
      <p class="text-sm mt-2">{{ t('spells.pressNext') }}</p>
    </div>

    <template v-else>
      <!-- Spell Slots Summary -->
      <div class="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4" role="region" :aria-label="t('spells.spellSlots')">
        <div class="flex flex-wrap gap-4 text-sm">
          <div v-if="characterStore.character.spellcastingAbility">
            <span class="text-stone-400">{{ t('spells.spellcastingAbility') }}:</span>
            <span class="text-amber-400 font-medium ml-1">{{ characterStore.character.spellcastingAbility.toUpperCase() }}</span>
          </div>
          <div v-for="(slots, level) in spellSlots" :key="level">
            <span class="text-stone-400">Lv.{{ level }}:</span>
            <span class="text-amber-400 font-medium ml-1">{{ slots }} slot</span>
          </div>
        </div>
        <div v-if="hasPactSlots" class="flex flex-wrap gap-4 text-sm mt-2 pt-2 border-t border-stone-700">
          <div class="text-purple-400 font-medium">{{ t('spells.pactMagic') }}:</div>
          <div v-for="(slots, level) in pactSlots" :key="'pact-' + level">
            <span class="text-stone-400">Lv.{{ level }}:</span>
            <span class="text-purple-400 font-medium ml-1">{{ slots }} slot</span>
          </div>
        </div>
      </div>

      <!-- Known-spells count control (decoupled from slots) -->
      <div class="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-6">
        <h3 class="text-sm font-semibold text-stone-300 mb-1">{{ t('spells.knownCount') }}</h3>
        <p class="text-xs text-stone-500 mb-3">{{ t('spells.knownHint') }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" @click="rollSpellsKnown"
            class="px-3 py-2 rounded text-sm bg-stone-700 text-stone-200 hover:bg-stone-600 cursor-pointer">
            🎲 {{ t('spells.rollPerLevel') }}
          </button>
          <button type="button" @click="autoSelect"
            class="px-3 py-2 rounded text-sm bg-amber-600 text-stone-900 font-medium hover:bg-amber-500 cursor-pointer">
            ✨ {{ t('spells.auto') }}
          </button>
          <label class="text-sm text-stone-400 flex items-center gap-2">
            {{ t('spells.manual') }}
            <input type="number" min="0" :max="99" v-model.number="characterStore.character.spellsKnownLimit"
              @input="onManualLimit"
              class="w-20 bg-stone-700 text-stone-200 rounded px-2 py-1 text-sm" :aria-label="t('spells.manual')" />
          </label>
          <button v-if="(characterStore.character.spellsKnownLimit ?? 0) > 0" type="button" @click="resetToClassDefault"
            class="text-xs text-stone-500 hover:text-stone-300 underline cursor-pointer">
            {{ t('spells.resetDefault') }}
          </button>
        </div>
        <p v-if="lastRoll" class="text-xs text-amber-400 mt-2" aria-live="polite">
          🎲 {{ lastRoll.join(' + ') }} = {{ characterStore.character.spellsKnownLimit }}
        </p>
      </div>

      <!-- Search & Filter -->
      <div class="flex gap-3 mb-4">
        <label for="spell-search" class="sr-only">{{ t('common.search') }}</label>
        <input id="spell-search" v-model="searchQuery" :placeholder="t('common.search')"
          class="flex-1 bg-stone-700 text-stone-200 rounded px-3 py-2 text-sm" />
        <label for="spell-level-filter" class="sr-only">{{ t('spells.allLevels') }}</label>
        <select id="spell-level-filter" v-model="filterLevel" class="bg-stone-700 text-stone-200 rounded px-3 py-2 text-sm" :aria-label="t('spells.allLevels')">
          <option :value="null">{{ t('spells.allLevels') }}</option>
          <option :value="0">{{ t('spells.cantrips') }}</option>
          <option v-for="l in 9" :key="l" :value="l">{{ t('spells.level', { level: l }) }}</option>
        </select>
      </div>

      <!-- Cantrips -->
      <div class="mb-6">
        <h3 id="cantrips-heading" class="text-lg font-semibold text-stone-300 mb-2">
          {{ t('spells.cantrips') }}
          <span class="text-sm text-stone-500" aria-live="polite">({{ characterStore.character.cantrips.length }}/{{ maxCantrips }})</span>
        </h3>
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('spells.cantrips')">
          <button
            v-for="spell in cantrips"
            :key="spell.id"
            @click="toggleCantrip(spell.id)"
            @contextmenu.prevent="showDetail(spell)"
            class="px-3 py-1 rounded text-xs transition-colors cursor-pointer"
            :class="characterStore.character.cantrips.includes(spell.id)
              ? 'bg-amber-600 text-stone-900 font-medium'
              : characterStore.character.cantrips.length >= maxCantrips
                ? 'bg-stone-800 text-stone-600'
                : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
            :title="spell.description"
            :aria-pressed="characterStore.character.cantrips.includes(spell.id)"
            :aria-disabled="!characterStore.character.cantrips.includes(spell.id) && characterStore.character.cantrips.length >= maxCantrips"
          >
            {{ gt.spell(spell.name) }}
          </button>
          <p v-if="!cantrips.length" class="text-sm text-stone-500">{{ t('spells.noneForClass') }}</p>
        </div>
      </div>

      <!-- Leveled Spells -->
      <div>
        <h3 id="spells-known-heading" class="text-lg font-semibold text-stone-300 mb-2">
          {{ t('spells.knownSpells') }}
          <span class="text-sm text-stone-500" aria-live="polite">({{ characterStore.character.spellsKnown.length }}/{{ maxSpellsKnown }})</span>
        </h3>
        <div class="space-y-1" role="group" :aria-label="t('spells.knownSpells')">
          <button
            v-for="spell in leveledSpells"
            :key="spell.id"
            @click="toggleSpell(spell.id)"
            @contextmenu.prevent="showDetail(spell)"
            class="w-full text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer flex items-center justify-between"
            :class="characterStore.character.spellsKnown.includes(spell.id)
              ? 'bg-amber-600/20 border border-amber-600 text-stone-200'
              : characterStore.character.spellsKnown.length >= maxSpellsKnown
                ? 'bg-stone-800 text-stone-600'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'"
            :aria-pressed="characterStore.character.spellsKnown.includes(spell.id)"
            :aria-disabled="!characterStore.character.spellsKnown.includes(spell.id) && characterStore.character.spellsKnown.length >= maxSpellsKnown"
          >
            <span>
              <span class="font-medium">{{ gt.spell(spell.name) }}</span>
              <span class="text-stone-500 ml-2">Lv.{{ spell.level }} - {{ gt.school(spell.school) }}</span>
            </span>
            <span class="text-xs text-stone-500">{{ spell.castingTime }}</span>
          </button>
          <p v-if="!leveledSpells.length" class="text-sm text-stone-500">{{ t('spells.noneAtLevel') }}</p>
        </div>
      </div>

      <!-- Spell Detail Modal -->
      <div v-if="selectedSpellDetail" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="selectedSpellDetail = null" role="dialog" aria-modal="true" :aria-label="gt.spell(selectedSpellDetail.name)">
        <div class="bg-stone-800 border border-stone-600 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-bold text-amber-400">{{ gt.spell(selectedSpellDetail.name) }}</h3>
            <button @click="selectedSpellDetail = null" class="text-stone-500 hover:text-stone-300 cursor-pointer" :aria-label="t('common.cancel')">&times;</button>
          </div>
          <div class="space-y-2 text-sm text-stone-400">
            <p><strong>{{ t('spells.level') }}:</strong> {{ selectedSpellDetail.level === 0 ? t('spells.cantrips') : selectedSpellDetail.level }}</p>
            <p><strong>{{ t('spells.school') }}:</strong> {{ gt.school(selectedSpellDetail.school) }}</p>
            <p><strong>{{ t('spells.castingTime') }}:</strong> {{ selectedSpellDetail.castingTime }}</p>
            <p><strong>{{ t('spells.range') }}:</strong> {{ selectedSpellDetail.range }}</p>
            <p><strong>{{ t('spells.components') }}:</strong> {{ selectedSpellDetail.components }}</p>
            <p><strong>{{ t('spells.duration') }}:</strong> {{ selectedSpellDetail.duration }}</p>
            <p class="mt-3">{{ selectedSpellDetail.description }}</p>
          </div>
        </div>
      </div>
    </template>

    <VariantPromo :variant="characterStore.character.variant" />
  </section>
</template>
