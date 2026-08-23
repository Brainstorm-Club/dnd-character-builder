<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { getSpells, getSpellSlots, getSpellcastingProfile, getClasses, getMulticlassSpellSlots, ensureSpellData } from '@/data'
import type { SpellcastingMode } from '@/data'
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
      // A third-caster chassis only casts through its spellcasting subclass;
      // a plain Fighter or Rogue contributes nothing to the caster level.
      casterType: (cls?.spellcasting?.casterType === 'third' && !entry.subclass
        ? null
        : cls?.spellcasting?.casterType ?? null) as CasterType | null,
    }
  }),
)

// Spell slots: use multiclass calculation when multiclassed
const spellSlots = computed(() => {
  void dataReady.value
  if (isMulticlass.value) return getMulticlassSpellSlots(casterClassEntries.value, characterStore.character.variant).slots
  // Key off spellcastingClass, not className: it is set only when the
  // character genuinely casts, which for Fighter and Rogue means a caster
  // subclass was chosen.
  if (!characterStore.character.spellcastingClass) return {}
  // La variante decide chi lancia: nei dati del 2024 guerriero e ladro non
  // hanno incantesimi, e senza passarla ricevevano gli slot del terzo
  // incantatore del 2014.
  return getSpellSlots(characterStore.character.spellcastingClass, characterStore.character.level, characterStore.character.variant)
})

// Pact magic slots (Warlock in multiclass) — shown separately
const pactSlots = computed(() => {
  void dataReady.value
  if (!isMulticlass.value) return {}
  return getMulticlassSpellSlots(casterClassEntries.value, characterStore.character.variant).pactSlots
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

// Profilo di lancio (trucchetti, conosciuti/preparati) di ogni classe che
// lancia, secondo le regole della variante scelta — non del 2014.
// Un solo `void dataReady.value` qui dentro basta per tutte le derivate qui
// sotto: dipendendo da questa computed si ricalcolano da sole quando l'import
// asincrono dei dati arriva. Prima ognuna doveva toccarlo per conto suo.
const casterProfiles = computed(() => {
  void dataReady.value
  const variant = characterStore.character.variant
  const mods = characterStore.abilityModifiers
  const entries = isMulticlass.value
    ? characterStore.character.classes.map(e => ({ classId: e.classId, level: e.level }))
    : [{ classId: characterStore.character.className, level: characterStore.character.level }]
  return entries.map(e => ({ ...e, profile: getSpellcastingProfile(e.classId, e.level, mods, variant) }))
})

// Cantrips: sum from all caster classes for multiclass
const maxCantrips = computed(() => casterProfiles.value.reduce((sum, e) => sum + e.profile.cantrips, 0))

/**
 * Titolo giusto per l'elenco: nel 2024 bardo, stregone, warlock e ranger
 * preparano gli incantesimi invece di conoscerli, e chiamarli «conosciuti»
 * insegnerebbe la regola sbagliata. In multiclasse basta un known-caster
 * perché il totale sia un elenco di conosciuti.
 */
const spellsMode = computed<SpellcastingMode>(() => {
  const casting = casterProfiles.value.filter(e => e.profile.mode !== 'none')
  if (!casting.length) return 'none'
  return casting.every(e => e.profile.mode === 'prepared') ? 'prepared' : 'known'
})

const spellsListLabel = computed(() =>
  spellsMode.value === 'prepared' ? t('spells.preparedSpells') : t('spells.knownSpells'))

// Numero da manuale di incantesimi che la scheda può portare: nel 2014 la
// formula «modificatore + livello», nel 2024 la colonna «Incantesimi
// preparati» della tabella di classe. `null` = il dato non c'è ancora (i dati
// della variante stanno arrivando): meglio non mostrare nessun numero che
// mostrare quello di un'altra edizione.
const rawSpellsCount = computed<number | null>(() => {
  let total = 0
  for (const e of casterProfiles.value) {
    // Un solo addendo ignoto rende ignoto il totale: contarlo come zero
    // stamperebbe un tetto più basso del vero.
    if (e.profile.spellsCount === null) return null
    total += e.profile.spellsCount
  }
  return total
})

// Effective limit of spells known. An explicit override (roll / manual / auto)
// wins over the class default. Deliberately NOT tied to spell slots.
const maxSpellsKnown = computed<number | null>(() => {
  const lim = characterStore.character.spellsKnownLimit ?? 0
  return lim > 0 ? lim : rawSpellsCount.value
})

// Senza un tetto noto non si può dire «hai finito»: la selezione resta libera
// finché non arriva un numero (dal manuale o dal tiro qui accanto).
const spellsFull = computed(() => {
  const max = maxSpellsKnown.value
  return max !== null && characterStore.character.spellsKnown.length >= max
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
  const max = maxSpellsKnown.value
  // Tetto ignoto: non si taglia nulla, o si cancellerebbero scelte valide.
  if (max !== null && c.spellsKnown.length > max) {
    c.spellsKnown = c.spellsKnown.slice(0, max)
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
  // Dopo il tiro il tetto è per forza un numero (l'override vince sul valore
  // di classe), ma il ?? 0 tiene onesta la firma.
  c.spellsKnown = pool.slice(0, maxSpellsKnown.value ?? 0).map(s => s.id)
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
  else if (!spellsFull.value) characterStore.character.spellsKnown.push(spellId)
}

// ─── Dettaglio incantesimo: apertura, fuoco, chiusura ──────────────────────
const detailDialogEl = ref<HTMLElement | null>(null)
// Da dove è partita l'apertura: alla chiusura il fuoco deve tornare lì, non
// finire sul <body> lasciando chi naviga da tastiera a ripartire da capo.
const detailOpener = ref<HTMLElement | null>(null)

async function showDetail(spell: Spell, opener?: EventTarget | null) {
  detailOpener.value = (opener as HTMLElement | null)
    ?? (document.activeElement as HTMLElement | null)
  selectedSpellDetail.value = spell
  await nextTick()
  // Il riquadro è modale: senza spostarci il fuoco un lettore di schermo
  // continuerebbe a leggere la lista sotto, che nel frattempo è inerte.
  detailDialogEl.value?.focus()
}

function closeDetail() {
  if (!selectedSpellDetail.value) return
  selectedSpellDetail.value = null
  const back = detailOpener.value
  detailOpener.value = null
  back?.focus()
}

/** Selettore dei nodi tabulabili dentro il riquadro (per il giro del Tab). */
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

function onDetailKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    closeDetail()
    return
  }
  if (e.key !== 'Tab') return
  const root = detailDialogEl.value
  if (!root) return
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
  if (!nodes.length) {
    // Nessun comando dentro: il Tab non deve poter uscire da un dialogo modale.
    e.preventDefault()
    return
  }
  const first = nodes[0]!
  const last = nodes[nodes.length - 1]!
  const current = document.activeElement
  if (e.shiftKey && (current === first || current === root)) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && current === last) {
    e.preventDefault()
    first.focus()
  }
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
            <span class="text-stone-400">{{ t('spells.levelShort') }}{{ level }}:</span>
            <span class="text-amber-400 font-medium ml-1">{{ slots }} {{ t('spells.slots') }}</span>
          </div>
        </div>
        <div v-if="hasPactSlots" class="flex flex-wrap gap-4 text-sm mt-2 pt-2 border-t border-stone-700">
          <div class="text-purple-400 font-medium">{{ t('spells.pactMagic') }}:</div>
          <div v-for="(slots, level) in pactSlots" :key="'pact-' + level">
            <span class="text-stone-400">{{ t('spells.levelShort') }}{{ level }}:</span>
            <span class="text-purple-400 font-medium ml-1">{{ slots }} {{ t('spells.slots') }}</span>
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
          <!-- Due comandi distinti e affiancati: il chip sceglie, la "i" mostra
               il dettaglio. Annidare il secondo dentro il primo darebbe un
               <button> dentro un <button>, che il browser scarta. -->
          <span
            v-for="spell in cantrips"
            :key="spell.id"
            class="inline-flex items-stretch rounded overflow-hidden"
          >
            <button
              type="button"
              @click="toggleCantrip(spell.id)"
              @contextmenu.prevent="showDetail(spell, $event.currentTarget)"
              class="px-3 py-1 text-xs transition-colors cursor-pointer"
              :class="characterStore.character.cantrips.includes(spell.id)
                ? 'bg-amber-600 text-stone-900 font-medium'
                : characterStore.character.cantrips.length >= maxCantrips
                  ? 'bg-stone-800 text-stone-600'
                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
              :aria-pressed="characterStore.character.cantrips.includes(spell.id)"
              :aria-disabled="!characterStore.character.cantrips.includes(spell.id) && characterStore.character.cantrips.length >= maxCantrips"
            >
              {{ gt.spell(spell.name) }}
            </button>
            <button
              type="button"
              class="px-2 py-1 text-xs bg-stone-700 text-stone-400 hover:bg-stone-600 hover:text-amber-400 cursor-pointer border-l border-stone-800"
              :aria-label="t('spells.showDetail', { name: gt.spell(spell.name) })"
              @click="showDetail(spell, $event.currentTarget)"
            >&#9432;</button>
          </span>
          <p v-if="!cantrips.length" class="text-sm text-stone-500">{{ t('spells.noneForClass') }}</p>
        </div>
      </div>

      <!-- Leveled Spells -->
      <div>
        <h3 id="spells-known-heading" class="text-lg font-semibold text-stone-300 mb-2">
          {{ spellsListLabel }}
          <!-- Con il tetto ignoto si stampa un trattino: un numero preso da
               un'altra edizione sarebbe peggio del non sapere. -->
          <span class="text-sm text-stone-500" aria-live="polite">({{ characterStore.character.spellsKnown.length }}/{{ maxSpellsKnown ?? '—' }})</span>
        </h3>
        <!-- Etichettato dal titolo qui sopra, non da una stringa a parte: così
             il nome del gruppo segue known/prepared senza doppioni. -->
        <div class="space-y-1" role="group" aria-labelledby="spells-known-heading">
          <div v-for="spell in leveledSpells" :key="spell.id" class="flex items-stretch gap-1">
            <button
              type="button"
              @click="toggleSpell(spell.id)"
              @contextmenu.prevent="showDetail(spell, $event.currentTarget)"
              class="flex-1 text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer flex items-center justify-between"
              :class="characterStore.character.spellsKnown.includes(spell.id)
                ? 'bg-amber-600/20 border border-amber-600 text-stone-200'
                : spellsFull
                  ? 'bg-stone-800 text-stone-600'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'"
              :aria-pressed="characterStore.character.spellsKnown.includes(spell.id)"
              :aria-disabled="!characterStore.character.spellsKnown.includes(spell.id) && spellsFull"
            >
              <span>
                <span class="font-medium">{{ gt.spell(spell.name) }}</span>
                <span class="text-stone-500 ml-2">{{ t('spells.levelShort') }}{{ spell.level }} - {{ gt.school(spell.school) }}</span>
                <span
                  v-if="spell.ritual"
                  class="ml-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wide rounded bg-amber-900/40 text-amber-300 border border-amber-800"
                >{{ t('spells.ritual') }}</span>
              </span>
              <span class="text-xs text-stone-500">{{ spell.castingTime }}</span>
            </button>
            <button
              type="button"
              class="px-3 rounded text-sm bg-stone-800 border border-stone-700 text-stone-400 hover:bg-stone-700 hover:text-amber-400 cursor-pointer"
              :aria-label="t('spells.showDetail', { name: gt.spell(spell.name) })"
              @click="showDetail(spell, $event.currentTarget)"
            >&#9432;</button>
          </div>
          <p v-if="!leveledSpells.length" class="text-sm text-stone-500">{{ t('spells.noneAtLevel') }}</p>
        </div>
      </div>

      <!-- Spell Detail Modal -->
      <div v-if="selectedSpellDetail" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="closeDetail()">
        <!-- role/aria-modal e tabindex stanno sul riquadro, non sullo sfondo:
             è il riquadro a ricevere il fuoco e a intercettare Esc e Tab. -->
        <div
          ref="detailDialogEl"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          :aria-label="gt.spell(selectedSpellDetail.name)"
          @keydown="onDetailKeydown"
          class="bg-stone-800 border border-stone-600 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        >
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-bold text-amber-400">{{ gt.spell(selectedSpellDetail.name) }}</h3>
            <button type="button" @click="closeDetail()" class="text-stone-500 hover:text-stone-300 cursor-pointer" :aria-label="t('common.close')">&times;</button>
          </div>
          <div class="space-y-2 text-sm text-stone-400">
            <!-- common.level e non spells.level: quest'ultima è "Livello {level}"
                 e senza il parametro stampava l'etichetta monca. -->
            <p><strong>{{ t('common.level') }}:</strong> {{ selectedSpellDetail.level === 0 ? t('spells.cantrips') : selectedSpellDetail.level }}</p>
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
