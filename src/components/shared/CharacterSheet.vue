<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CharacterData } from '@/stores/character'
import { formatModifier, feetToMeters, proficiencyBonus, computeArmorClass, spellSaveDC, spellAttackBonus } from '@/utils/calculations'
import { CARATTERISTICHE, punteggioTotale, modificatori, tiroSalvezza, bonusAbilita } from '@/domain/scheda'
import { SKILLS } from '@/data/dnd5e/skills'
import { getSpells, getApocalisseRules, getWhacksLevels } from '@/data'
import { getBrancaloniaFeatById } from '@/data/brancalonia/feats'
import { getDnd2024Feat } from '@/data/dnd2024/feats'
import {
  getMoveSlots, getKnownMoveCount, getBrawlClassFeature, getBrawlAce, brawlFeatureId,
} from '@/data/brancalonia/brawl'
import { brawlDescriptionsIt } from '@/data/brancalonia/brawl-it'
import { useGameTerms } from '@/composables/useGameTerms'

/**
 * La scheda del personaggio, una sola per tutta l'applicazione.
 *
 * Prima ne esistevano due: il riepilogo della procedura guidata e la pagina di
 * un personaggio pronto. Non erano la stessa cosa scritta due volte — erano
 * due METÀ, e ciascuna nascondeva quel che l'altra mostrava. Al riepilogo
 * mancavano tratti, ideali, legami, difetti e l'aspetto fisico; alla pagina dei
 * personaggi pronti mancavano la competenza raddoppiata, il multiclasse e —
 * per tutti e 41 i personaggi di Brancalonia e Apocalisse — i dati
 * d'ambientazione: mosse da rissa, Batoste, Marchio, Virtù, Peccato, Umanità.
 *
 * Il layout prende il meglio delle due, come si erano rivelate all'uso:
 * - i blocchi NUMERICI (combattimento, caratteristiche, tiri salvezza,
 *   abilità) tengono la griglia compatta del riepilogo, che li rende
 *   confrontabili a colpo d'occhio — e i tiri salvezza portano il bonus
 *   calcolato, non il solo nome della competenza come faceva l'altra;
 * - i blocchi a ELENCO (privilegi, incantesimi, equipaggiamento) tengono le
 *   pastiglie e le due colonne della pagina dei personaggi pronti, che si
 *   scorrono meglio di una fila di nomi separati da virgole.
 *
 * Il componente non conosce lo store: riceve un personaggio e basta. È la
 * condizione perché possa servire anche una scheda che nello store non passa
 * mai, ed è il motivo per cui i conti sono migrati in `@/domain/scheda`.
 * Le azioni le mette chi lo ospita, attraverso lo slot `azioni`.
 */
const props = withDefaults(defineProps<{
  char: CharacterData
  /** Titolo della scheda. Se assente non si stampa nessuna intestazione. */
  titolo?: string
  /**
   * Innesto per chi ha una versione tradotta di un campo di testo.
   * Serve ai personaggi pronti: i loro tratti, ideali e connotati sono nei
   * dati in inglese ma hanno la traduzione italiana nei file di lingua, e
   * senza questo aggancio la pagina tornerebbe in inglese per 64 schede.
   * Chi non ne ha bisogno non passa nulla e vede il dato com'è.
   */
  traduci?: (campo: string, valore: string) => string
}>(), {
  titolo: undefined,
  traduci: undefined,
})

/** Il valore da mostrare per un campo di testo, tradotto se l'ospite sa farlo. */
function testo(campo: keyof CharacterData): string {
  const grezzo = String(props.char[campo] ?? '')
  return props.traduci ? props.traduci(campo, grezzo) : grezzo
}

const { t, locale } = useI18n()
const gt = useGameTerms()

/**
 * Il nome di un incantesimo da mostrare.
 *
 * In scheda un incantesimo può stare come id ('vicious-mockery', '1-healing-word')
 * o come nome ('Vicious Mockery'): il generatore usa gli id, i personaggi
 * scritti a mano i nomi. Va risolto prima di tradurre, altrimenti sulla scheda
 * finisce l'id grezzo — che è esattamente quel che succedeva.
 */
function nomeIncantesimo(rif: string): string {
  const tutti = getSpells(props.char.variant)
  const sp = tutti.find(x => x.id === rif)
    ?? tutti.find(x => x.name.toLowerCase() === rif.toLowerCase())
  return sp ? gt.spell(sp.name) : gt.spell(rif)
}

const mods = computed(() => modificatori(props.char))
const prof = computed(() => proficiencyBonus(props.char.level))

const tiriSalvezza = computed(() => CARATTERISTICHE.map(a => ({
  ability: a,
  value: tiroSalvezza(props.char, a),
  proficient: props.char.savingThrowProficiencies.includes(a),
})))

const abilita = computed(() => SKILLS.map(s => ({
  id: s.id,
  name: s.name,
  bonus: bonusAbilita(props.char, s.id, s.ability),
  proficient: props.char.skillProficiencies.includes(s.id),
  expert: props.char.skillExpertise.includes(s.id),
})))

const dcIncantesimi = computed(() => {
  const a = props.char.spellcastingAbility as (typeof CARATTERISTICHE)[number] | ''
  return a ? spellSaveDC(prof.value, mods.value[a]) : 0
})
const attaccoIncantesimi = computed(() => {
  const a = props.char.spellcastingAbility as (typeof CARATTERISTICHE)[number] | ''
  return a ? spellAttackBonus(prof.value, mods.value[a]) : 0
})

/** Il personaggio ha qualcosa da mostrare nella sezione aspetto? */
/**
 * Un personaggio multiclasse va scritto per esteso — "Guerriero 3 / Ladro 2" —
 * e i suoi dadi vita sono più d'uno. Il riepilogo lo faceva, la pagina dei
 * personaggi pronti no: nella scheda unica lo vedono entrambi.
 */
const classiMultiple = computed(() => props.char.classes ?? [])
const classeELivello = computed(() => classiMultiple.value.length >= 2
  ? classiMultiple.value.map(c => `${gt.className(c.classId, props.char.variant)} ${c.level}`).join(' / ')
  : `${gt.className(props.char.className, props.char.variant)} ${props.char.level}`)
const dadiVita = computed(() => classiMultiple.value.length >= 2
  ? classiMultiple.value.map(c => `${c.level}d${c.hitDie}`).join(' + ')
  : `${props.char.level}d${props.char.hitDie}`)

// Le sezioni d'ambientazione: rissa e Batoste di Brancalonia, Marchio,
// Virtù e Peccato di Apocalisse. Stavano nel solo riepilogo, e i 41
// personaggi pronti di quelle due ambientazioni non le mostravano affatto —
// cioè nascondevano proprio ciò che distingue il loro gioco.
const isBrancalonia = computed(() => props.char.variant === 'brancalonia')
const isApocalisse = computed(() => props.char.variant === 'apocalisse')

// Apocalisse display helpers
const apoRules = computed(() => getApocalisseRules(props.char.variant))
function displayNameLocale(item: { name: string; nameOriginal?: string } | undefined): string {
  if (!item) return '--'
  if (locale.value === 'it' && item.nameOriginal) return item.nameOriginal
  return item.name
}
// Corredo da rissa: quanti slot mossa e quante mosse spettano al personaggio,
// più la mossa di classe e (dal 6°) l'asso nella manica.
const brawlKit = computed(() => {
  if (props.char.variant !== 'brancalonia' || !props.char.className) return null
  const cls = props.char.className
  const lv = props.char.level
  const it = locale.value === 'it'
  const feature = getBrawlClassFeature(cls)
  const ace = lv >= 6 ? getBrawlAce(cls) : undefined
  return {
    slots: getMoveSlots(lv),
    moves: getKnownMoveCount(lv),
    feature: feature && {
      name: it ? feature.nameOriginal : feature.name,
      description: (it && brawlDescriptionsIt[brawlFeatureId(feature.name)]) || feature.description,
    },
    ace: ace && {
      name: it ? ace.nameOriginal : ace.name,
      description: (it && brawlDescriptionsIt[brawlFeatureId(ace.name)]) || ace.description,
    },
  }
})

const displayFeat = computed(() => {
  if (!props.char.feat) return null
  if (props.char.variant === 'dnd2024') {
    const f = getDnd2024Feat(props.char.feat)
    return f ? { name: f.name, benefits: [f.description] } : null
  }
  if (props.char.variant !== 'brancalonia') return null
  const f = getBrancaloniaFeatById(props.char.feat)
  if (!f) return null
  return { name: locale.value === 'it' ? f.nameOriginal : f.name, benefits: f.benefits }
})

const displayMark = computed(() => {
  if (!props.char.mark) return '--'
  const mark = apoRules.value?.marks.find(m => m.id === props.char.mark)
  return displayNameLocale(mark)
})
const displaySpirit = computed(() => {
  if (!props.char.markSpirit || !props.char.mark) return ''
  const mark = apoRules.value?.marks.find(m => m.id === props.char.mark)
  const spirit = mark?.spirits.find(s => s.id === props.char.markSpirit)
  return displayNameLocale(spirit)
})
const displayVirtue = computed(() => {
  if (!props.char.virtue) return '--'
  const v = apoRules.value?.virtues.find(x => x.id === props.char.virtue)
  return displayNameLocale(v)
})
const displaySin = computed(() => {
  if (!props.char.sin) return '--'
  const s = apoRules.value?.sins.find(x => x.id === props.char.sin)
  return displayNameLocale(s)
})

// Brancalonia display helpers
const whacksDisplay = computed(() => {
  const wl = getWhacksLevels().find(w => w.level === props.char.whacksLevel)
  return wl ? `${wl.level} - ${wl.name}` : String(props.char.whacksLevel)
})

const haAspetto = computed(() => Boolean(
  props.char.age || props.char.height || props.char.weight
  || props.char.eyes || props.char.hair || props.char.skin,
))
const haPersonalita = computed(() => Boolean(
  props.char.personalityTraits || props.char.ideals || props.char.bonds || props.char.flaws,
))
</script>

<template>
  <div class="space-y-4">
    <h2 v-if="titolo" class="text-2xl font-bold text-amber-500 font-gothic">{{ titolo }}</h2>

    <!-- Intestazione: chi è il personaggio -->
    <section class="bg-stone-800 border border-stone-700 rounded-xl p-6">
      <div class="flex flex-wrap gap-6">
        <div>
          <p class="text-xs text-stone-400 uppercase">{{ t('review.charName') }}</p>
          <p class="text-xl font-bold text-amber-400 font-gothic">{{ char.name || '--' }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-400 uppercase">{{ t('review.classLevel') }}</p>
          <p class="text-stone-200">{{ classeELivello }}</p>
          <p v-if="char.subclass && classiMultiple.length < 2" class="text-xs text-stone-400">{{ gt.subclassName(char.subclass) }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-400 uppercase">{{ t('review.charRace') }}</p>
          <p class="text-stone-200">{{ gt.raceName(char.race) }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-400 uppercase">{{ t('review.charBackground') }}</p>
          <p class="text-stone-200">{{ gt.background(char.background) }}</p>
        </div>
        <div v-if="char.alignment">
          <p class="text-xs text-stone-400 uppercase">{{ t('details.alignment') }}</p>
          <p class="text-stone-200">{{ t(`alignments.${char.alignment}`) }}</p>
        </div>
      </div>
    </section>

    <!-- NUMERI: la griglia compatta del riepilogo -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      <div class="bsc-stat bg-stone-800 border-amber-700/30 rounded-lg">
        <p class="bsc-stat__label normal-case">{{ t('review.ac') }}</p>
        <p class="bsc-stat__value text-2xl font-bold text-amber-400">{{ computeArmorClass(char) }}</p>
      </div>
      <div class="bsc-stat bg-stone-800 border-stone-700 rounded-lg">
        <p class="bsc-stat__label normal-case">{{ t('review.initiative') }}</p>
        <p class="bsc-stat__value text-2xl font-bold text-stone-200">{{ formatModifier(mods.dex) }}</p>
      </div>
      <div class="bsc-stat bg-stone-800 border-stone-700 rounded-lg">
        <p class="bsc-stat__label normal-case">{{ t('review.speed') }}</p>
        <p class="bsc-stat__value text-2xl font-bold text-stone-200">{{ feetToMeters(char.speed) }}m</p>
      </div>
      <div class="bsc-stat bg-stone-800 border-red-700/30 rounded-lg">
        <p class="bsc-stat__label normal-case">{{ t('review.hp') }}</p>
        <p class="bsc-stat__value text-2xl font-bold text-red-400">{{ char.maxHp }}</p>
      </div>
      <div class="bsc-stat bg-stone-800 border-stone-700 rounded-lg">
        <p class="bsc-stat__label normal-case">{{ t('review.hitDie') }}</p>
        <p class="bsc-stat__value text-lg font-bold text-stone-200">{{ dadiVita }}</p>
      </div>
      <div class="bsc-stat bg-stone-800 border-stone-700 rounded-lg">
        <p class="bsc-stat__label normal-case">{{ t('review.proficiencyBonus') }}</p>
        <p class="bsc-stat__value text-2xl font-bold text-stone-200">{{ formatModifier(prof) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
      <div v-for="a in CARATTERISTICHE" :key="a" class="bsc-stat bg-stone-800 border-stone-700 rounded-lg">
        <p class="bsc-stat__label">{{ t(`abilities.${a}`) }}</p>
        <p class="bsc-stat__value text-xl font-bold text-stone-200">{{ punteggioTotale(char, a) }}</p>
        <p class="bsc-stat__mod text-sm text-amber-400">{{ formatModifier(mods[a]) }}</p>
      </div>
    </div>

    <!-- Tiri salvezza e abilità, col bonus calcolato -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <section class="bg-stone-800 border border-stone-700 rounded-xl p-4">
        <h3 class="font-gothic font-semibold text-stone-200 mb-2">{{ t('review.savingThrows') }}</h3>
        <div class="space-y-1 text-sm">
          <div v-for="st in tiriSalvezza" :key="st.ability" class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full" :class="st.proficient ? 'bg-amber-500' : 'bg-stone-600'"
              role="img" :aria-label="st.proficient ? t('review.proficient') : t('review.notProficient')"
            ></span>
            <span class="text-stone-300 uppercase w-8">{{ st.ability }}</span>
            <span class="text-stone-200 font-medium">{{ formatModifier(st.value) }}</span>
          </div>
        </div>
      </section>

      <section class="bg-stone-800 border border-stone-700 rounded-xl p-4">
        <h3 class="font-gothic font-semibold text-stone-200 mb-2">{{ t('review.skills') }}</h3>
        <div class="space-y-1 text-xs max-h-60 overflow-y-auto">
          <div v-for="s in abilita" :key="s.id" class="flex items-center gap-2">
            <!-- Il pallino pieno dice competente, il doppio cerchio raddoppiata:
                 la competenza raddoppiata non era visibile da nessuna parte. -->
            <span
              class="w-2.5 h-2.5 rounded-full"
              :class="s.expert ? 'bg-amber-400 ring-2 ring-amber-400/40' : s.proficient ? 'bg-amber-500' : 'bg-stone-600'"
              role="img"
              :aria-label="s.expert ? t('review.expertise') : s.proficient ? t('review.proficient') : t('review.notProficient')"
            ></span>
            <span class="text-stone-300 flex-1">{{ gt.skill(s.name) }}</span>
            <span class="text-stone-200 font-medium">{{ formatModifier(s.bonus) }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- ELENCHI: le pastiglie della pagina dei personaggi pronti -->
    <section v-if="char.weapons.length || char.armor" class="bg-stone-800 border border-stone-700 rounded-xl p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">⚔️</span> {{ t('review.attacks') }}
      </h3>
      <p v-if="char.armor || char.shield" class="text-sm text-stone-300 mb-3">
        {{ t('review.armorLabel') }}:
        <strong class="text-stone-200">{{ char.armor ? gt.armorName(char.armor) : t('review.noArmor') }}</strong>
        <span v-if="char.shield"> + {{ t('review.shieldBonus') }}</span>
      </p>
      <ul v-if="char.weapons.length" class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
        <li v-for="(w, i) in char.weapons" :key="i" class="flex items-center gap-2 text-stone-300">
          <span class="text-stone-500" aria-hidden="true">&bull;</span>
          <span class="flex-1">{{ gt.weapon(w.name) }}</span>
          <span class="text-amber-400 font-medium">{{ formatModifier(w.attackBonus) }}</span>
          <span class="text-stone-400">{{ w.damage }}</span>
        </li>
      </ul>
    </section>

    <section v-if="char.equipment.length" class="bg-stone-800 border border-stone-700 rounded-xl p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">🎒</span> {{ t('equipment.title') }}
      </h3>
      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-stone-300">
        <li v-for="(item, i) in char.equipment" :key="i" class="flex items-center gap-2">
          <span class="text-stone-500" aria-hidden="true">&bull;</span> {{ gt.equipment(item) }}
        </li>
      </ul>
    </section>

    <section v-if="char.featuresTraits.length" class="bg-stone-800 border border-stone-700 rounded-xl p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">✨</span> {{ t('class.features') }}
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(feat, i) in char.featuresTraits" :key="i"
          class="bg-amber-900/30 text-amber-300 border border-amber-700/30 px-3 py-1 rounded-lg text-sm"
        >{{ gt.feature(feat) }}</span>
      </div>
    </section>

    <section v-if="char.spellcastingAbility" class="bg-stone-800 border border-stone-700 rounded-xl p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">🔮</span> {{ t('spells.title') }}
      </h3>
      <div class="flex flex-wrap gap-4 text-sm mb-3">
        <span class="text-stone-300">{{ t('spells.spellSaveDC') }}: <strong class="text-amber-400">{{ dcIncantesimi }}</strong></span>
        <span class="text-stone-300">{{ t('spells.spellAttackBonus') }}: <strong class="text-amber-400">{{ formatModifier(attaccoIncantesimi) }}</strong></span>
      </div>
      <div v-if="char.cantrips.length" class="mb-3">
        <h4 class="text-sm text-stone-400 mb-1">{{ t('spells.cantrips') }}</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="c in char.cantrips" :key="c"
            class="bg-purple-900/30 text-purple-300 border border-purple-700/30 px-3 py-1 rounded-lg text-sm"
          >{{ nomeIncantesimo(c) }}</span>
        </div>
      </div>
      <div v-if="char.spellsKnown.length || char.spellsPrepared.length">
        <h4 class="text-sm text-stone-400 mb-1">{{ t('spells.knownSpells') }}</h4>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="s in [...char.spellsKnown, ...char.spellsPrepared]" :key="s"
            class="bg-purple-900/30 text-purple-300 border border-purple-700/30 px-3 py-1 rounded-lg text-sm"
          >{{ nomeIncantesimo(s) }}</span>
        </div>
      </div>
    </section>

    <!-- Le sezioni d'ambientazione e di gioco di ruolo: qui sotto lo slot per
         chi ospita la scheda, che aggiunge quel che gli serve. -->
    <!-- Brancalonia: Brawling Info -->
    <div v-if="isBrancalonia" class="bg-stone-800 border border-amber-700/30 rounded-lg p-4 mb-4">
      <h3 class="font-gothic font-semibold text-amber-400 mb-2">{{ t('details.brawling') }}</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <span class="text-stone-500">{{ t('details.size') }}:</span>
          <span class="text-stone-200 ml-1">{{ gt.size(char.size || 'Medium') }}</span>
        </div>
        <div>
          <span class="text-stone-500">{{ t('details.whacksLevel') }}:</span>
          <span class="text-stone-200 ml-1">{{ whacksDisplay }}</span>
        </div>
      </div>
      <div v-if="char.brawlingMoves.length" class="mt-2">
        <span class="text-stone-500 text-sm">{{ t('details.brawlingMoves') }}:</span>
        <span class="text-stone-300 text-sm ml-1">{{ char.brawlingMoves.join(', ') }}</span>
      </div>
      <div v-if="char.misdeeds" class="mt-2">
        <span class="text-stone-500 text-sm">{{ t('details.misdeeds') }}:</span>
        <span class="text-stone-300 text-sm ml-1">{{ char.misdeeds }}</span>
      </div>
    </div>

    <!-- Brancalonia: corredo da rissa -->
    <div v-if="brawlKit" class="bg-stone-800 border border-red-700/30 rounded-lg p-4 mb-4">
      <h3 class="font-gothic font-semibold text-red-400 mb-2">{{ t('review.brawl') }}</h3>
      <div class="grid grid-cols-2 gap-3 text-sm mb-2">
        <div>
          <span class="text-stone-500">{{ t('review.moveSlots') }}:</span>
          <span class="text-amber-400 font-bold ml-1">{{ brawlKit.slots }}</span>
        </div>
        <div>
          <span class="text-stone-500">{{ t('review.knownMoves') }}:</span>
          <span class="text-amber-400 font-bold ml-1">{{ brawlKit.moves }}</span>
        </div>
      </div>
      <p v-if="brawlKit.feature" class="text-sm">
        <span class="text-stone-200">{{ brawlKit.feature.name }}</span>
        <span class="block text-stone-400">{{ brawlKit.feature.description }}</span>
      </p>
      <p v-if="brawlKit.ace" class="text-sm mt-2">
        <span class="text-stone-200">{{ t('review.ace') }}: {{ brawlKit.ace.name }}</span>
        <span class="block text-stone-400">{{ brawlKit.ace.description }}</span>
      </p>
    </div>

    <!-- Brancalonia: talento razziale scelto -->
    <div v-if="displayFeat" class="bg-stone-800 border border-red-700/30 rounded-lg p-4 mb-4">
      <h3 class="font-gothic font-semibold text-red-400 mb-2">{{ t('race.chooseFeat') }}</h3>
      <p class="text-stone-200 text-sm">{{ displayFeat.name }}</p>
      <ul class="mt-1 ml-4 list-disc text-stone-400 text-sm space-y-0.5">
        <li v-for="(b, i) in displayFeat.benefits" :key="i">{{ b }}</li>
      </ul>
    </div>

    <!-- Apocalisse: Mark, Virtue, Sin, Humanity -->
    <div v-if="isApocalisse" class="bg-stone-800 border border-red-700/30 rounded-lg p-4 mb-4">
      <h3 class="font-gothic font-semibold text-red-400 mb-2">{{ t('details.markSection') }}</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <span class="text-stone-500">{{ t('details.mark') }}:</span>
          <span class="text-stone-200 ml-1">{{ displayMark }}</span>
        </div>
        <div v-if="displaySpirit">
          <span class="text-stone-500">{{ t('details.markSpirit') }}:</span>
          <span class="text-stone-200 ml-1">{{ displaySpirit }}</span>
        </div>
        <div>
          <span class="text-stone-500">{{ t('details.virtue') }}:</span>
          <span class="text-stone-200 ml-1">{{ displayVirtue }}</span>
        </div>
        <div>
          <span class="text-stone-500">{{ t('details.sin') }}:</span>
          <span class="text-stone-200 ml-1">{{ displaySin }}</span>
        </div>
        <div>
          <span class="text-stone-500">{{ t('details.humanity') }}:</span>
          <span class="text-amber-400 font-bold ml-1">{{ char.humanity }}</span>
        </div>
      </div>
    </div>

    <section v-if="haPersonalita" class="bg-stone-800 border border-stone-700 rounded-xl p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">🎭</span> {{ t('blog.personalityTitle') }}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div v-if="char.personalityTraits" class="bg-stone-900/50 rounded-lg p-3">
          <span class="text-stone-400 block mb-1">{{ t('background.personalityTraits') }}</span>
          <span class="text-stone-300">{{ testo('personalityTraits') }}</span>
        </div>
        <div v-if="char.ideals" class="bg-stone-900/50 rounded-lg p-3">
          <span class="text-stone-400 block mb-1">{{ t('background.ideals') }}</span>
          <span class="text-stone-300">{{ testo('ideals') }}</span>
        </div>
        <div v-if="char.bonds" class="bg-stone-900/50 rounded-lg p-3">
          <span class="text-stone-400 block mb-1">{{ t('background.bonds') }}</span>
          <span class="text-stone-300">{{ testo('bonds') }}</span>
        </div>
        <div v-if="char.flaws" class="bg-stone-900/50 rounded-lg p-3">
          <span class="text-stone-400 block mb-1">{{ t('background.flaws') }}</span>
          <span class="text-stone-300">{{ testo('flaws') }}</span>
        </div>
      </div>
    </section>

    <section v-if="haAspetto" class="bg-stone-800 border border-stone-700 rounded-xl p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">👤</span> {{ t('details.appearance') }}
      </h3>
      <dl class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div v-if="char.age"><dt class="text-stone-400">{{ t('details.age') }}</dt><dd class="text-stone-300">{{ testo('age') }}</dd></div>
        <div v-if="char.height"><dt class="text-stone-400">{{ t('details.height') }}</dt><dd class="text-stone-300">{{ char.height }}</dd></div>
        <div v-if="char.weight"><dt class="text-stone-400">{{ t('details.weight') }}</dt><dd class="text-stone-300">{{ char.weight }}</dd></div>
        <div v-if="char.eyes"><dt class="text-stone-400">{{ t('details.eyes') }}</dt><dd class="text-stone-300">{{ testo('eyes') }}</dd></div>
        <div v-if="char.hair"><dt class="text-stone-400">{{ t('details.hair') }}</dt><dd class="text-stone-300">{{ testo('hair') }}</dd></div>
        <div v-if="char.skin"><dt class="text-stone-400">{{ t('details.skin') }}</dt><dd class="text-stone-300">{{ testo('skin') }}</dd></div>
      </dl>
    </section>

    <slot name="azioni" />
  </div>
</template>
