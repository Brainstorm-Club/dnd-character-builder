<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { formatModifier, spellSaveDC, spellAttackBonus, feetToMeters } from '@/utils/calculations'
import { usePdfExport } from '@/composables/usePdfExport'
import { copyShareUrl } from '@/utils/shareCharacter'
import { SKILLS } from '@/data/dnd5e/skills'
import { getSpells, getClasses, getRaces, getBackgrounds, getApocalisseRules, getMaxLevel, getWhacksLevels } from '@/data'
import { useGameTerms } from '@/composables/useGameTerms'
import VariantPromo from '@/components/shared/VariantPromo.vue'

const { t, locale } = useI18n()
const characterStore = useCharacterStore()
const { exportPdf, exporting } = usePdfExport()
const gt = useGameTerms()

const char = computed(() => characterStore.character)
const mods = computed(() => characterStore.abilityModifiers)
const prof = computed(() => characterStore.profBonus)

const saveMessage = ref<{ type: 'success' | 'info'; text: string } | null>(null)

const savingThrows = computed(() => {
  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
  return abilities.map(a => ({
    ability: a,
    value: mods.value[a] + (char.value.savingThrowProficiencies.includes(a) ? prof.value : 0),
    proficient: char.value.savingThrowProficiencies.includes(a),
  }))
})

const skills = computed(() => {
  return SKILLS.map(skill => {
    const abilityMod = mods.value[skill.ability as keyof typeof mods.value]
    const proficient = char.value.skillProficiencies.includes(skill.id)
    const expert = char.value.skillExpertise.includes(skill.id)
    let bonus = abilityMod
    if (proficient) bonus += prof.value
    if (expert) bonus += prof.value
    return { ...skill, bonus, proficient, expert }
  })
})

const spellDC = computed(() => {
  if (!char.value.spellcastingAbility) return 0
  const abilityMod = mods.value[char.value.spellcastingAbility as keyof typeof mods.value]
  return spellSaveDC(prof.value, abilityMod)
})

const spellAtk = computed(() => {
  if (!char.value.spellcastingAbility) return 0
  const abilityMod = mods.value[char.value.spellcastingAbility as keyof typeof mods.value]
  return spellAttackBonus(prof.value, abilityMod)
})

const allSpells = computed(() => getSpells(char.value.variant))

function spellName(id: string): string {
  const spell = allSpells.value.find(s => s.id === id)
  return spell ? gt.spell(spell.name) : id
}

const variantClasses = computed(() => getClasses(char.value.variant))
const variantRaces = computed(() => getRaces(char.value.variant))
const variantBackgrounds = computed(() => getBackgrounds(char.value.variant))
const className = computed(() => {
  const cls = variantClasses.value.find(c => c.id === char.value.className)
  return gt.className(cls?.name ?? char.value.className, char.value.variant)
})
const subclassName = computed(() => {
  if (!char.value.subclass) return ''
  const cls = variantClasses.value.find(c => c.id === char.value.className)
  return cls?.subclasses.find(s => s.id === char.value.subclass)?.name ?? char.value.subclass
})
const displayRace = computed(() => {
  const race = variantRaces.value.find(r => r.id === char.value.race)
  if (!race) return char.value.race
  const raceTr = gt.raceName(race.name)
  if (char.value.subrace && race.subraces) {
    const sub = race.subraces.find(s => s.id === char.value.subrace)
    if (sub) return `${raceTr} (${gt.subraceName(sub.name)})`
  }
  return raceTr
})
const displayBackground = computed(() => {
  const bg = variantBackgrounds.value.find(b => b.id === char.value.background)
  if (!bg) return char.value.background
  if ((bg as any).nameOriginal) return (bg as any).nameOriginal
  return gt.background(bg.name)
})

// Multiclass display (defensive: classes may be undefined for old saved characters)
const multiclassDisplay = computed(() => {
  const classes = char.value.classes ?? []
  if (classes.length < 2) return ''
  return classes
    .map(c => {
      const cls = variantClasses.value.find(cl => cl.id === c.classId)
      const name = cls ? gt.className(cls.name, char.value.variant) : c.classId
      return `${name} ${c.level}`
    })
    .join(' / ')
})

const hitDiceDisplay = computed(() => {
  const classes = char.value.classes ?? []
  if (classes.length < 2) {
    return `${char.value.level}d${char.value.hitDie}`
  }
  return classes
    .map(c => `${c.level}d${c.hitDie}`)
    .join(' + ')
})

const isBrancalonia = computed(() => char.value.variant === 'brancalonia')
const isApocalisse = computed(() => char.value.variant === 'apocalisse')

// Apocalisse display helpers
const apoRules = computed(() => getApocalisseRules(char.value.variant))
function displayNameLocale(item: { name: string; nameOriginal?: string } | undefined): string {
  if (!item) return '--'
  if (locale.value === 'it' && item.nameOriginal) return item.nameOriginal
  return item.name
}
const displayMark = computed(() => {
  if (!char.value.mark) return '--'
  const mark = apoRules.value?.marks.find(m => m.id === char.value.mark)
  return displayNameLocale(mark)
})
const displaySpirit = computed(() => {
  if (!char.value.markSpirit || !char.value.mark) return ''
  const mark = apoRules.value?.marks.find(m => m.id === char.value.mark)
  const spirit = mark?.spirits.find(s => s.id === char.value.markSpirit)
  return displayNameLocale(spirit)
})
const displayVirtue = computed(() => {
  if (!char.value.virtue) return '--'
  const v = apoRules.value?.virtues.find(x => x.id === char.value.virtue)
  return displayNameLocale(v)
})
const displaySin = computed(() => {
  if (!char.value.sin) return '--'
  const s = apoRules.value?.sins.find(x => x.id === char.value.sin)
  return displayNameLocale(s)
})

// Brancalonia display helpers
const whacksDisplay = computed(() => {
  const wl = getWhacksLevels().find(w => w.level === char.value.whacksLevel)
  return wl ? `${wl.level} - ${wl.name}` : String(char.value.whacksLevel)
})

function saveChar() {
  characterStore.saveCharacter()
  saveMessage.value = { type: 'success', text: t('review.saveSuccess') }
  setTimeout(() => { saveMessage.value = null }, 3000)
}

function downloadJson() {
  const json = characterStore.exportJson()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${char.value.name || 'character'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const shareMessage = ref<{ type: 'success' | 'error'; text: string; url?: string } | null>(null)

async function shareCharacter() {
  try {
    const result = await copyShareUrl(char.value)
    if (result.copied) {
      shareMessage.value = { type: 'success', text: t('review.shareCopied') }
      setTimeout(() => { shareMessage.value = null }, 5000)
    } else {
      // Clipboard failed — show the URL so user can copy manually
      shareMessage.value = { type: 'success', text: t('review.shareManual'), url: result.url }
    }
  } catch {
    shareMessage.value = { type: 'error', text: t('review.shareFailed') }
    setTimeout(() => { shareMessage.value = null }, 5000)
  }
}

const canLevelUp = computed(() => char.value.level < getMaxLevel(char.value.variant))
const canLevelDown = computed(() => char.value.level > 1)
const levelUpMessage = ref<string | null>(null)

function doLevelUp() {
  const result = characterStore.levelUp()
  if (!result) {
    levelUpMessage.value = t('characters.maxLevel')
  } else {
    const parts = [`+${result.hpGained} HP`]
    if (result.newFeatures.length > 0) {
      parts.push(result.newFeatures.join(', '))
    }
    levelUpMessage.value = t('characters.levelUpSuccess', { details: parts.join(' | ') })
  }
  setTimeout(() => { levelUpMessage.value = null }, 5000)
}

function doLevelDown() {
  const result = characterStore.levelDown()
  if (!result) {
    levelUpMessage.value = t('characters.minLevel')
  } else {
    const parts = [`-${result.hpLost} HP`]
    if (result.removedFeatures.length > 0) {
      parts.push(result.removedFeatures.join(', '))
    }
    levelUpMessage.value = t('characters.levelDownSuccess', { details: parts.join(' | ') })
  }
  setTimeout(() => { levelUpMessage.value = null }, 5000)
}

const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      characterStore.importJson(e.target?.result as string)
    } catch (err) {
      const msg = (err as Error).message
      if (msg.startsWith('VALIDATION:')) {
        const codes = msg.replace('VALIDATION:', '').split(',')
        alert(codes.map(c => t(`import.${c}`)).join('\n'))
      } else {
        alert(t(`import.${msg}`, t('import.unknownError')))
      }
    }
  }
  reader.readAsText(file)
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <section aria-labelledby="review-heading">
    <h2 id="review-heading" class="text-2xl font-bold text-amber-500 mb-6">{{ t('review.title') }}</h2>

    <!-- Header -->
    <div class="bg-stone-800 border border-stone-700 rounded-lg p-6 mb-4">
      <div class="flex flex-wrap gap-6">
        <div>
          <p class="text-xs text-stone-500 uppercase">{{ t('review.charName') }}</p>
          <p class="text-xl font-bold text-amber-400">{{ char.name || '--' }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-500 uppercase">{{ t('review.classLevel') }}</p>
          <p class="text-stone-200">{{ multiclassDisplay || `${className} ${char.level}` }}</p>
          <p v-if="!multiclassDisplay && subclassName" class="text-xs text-stone-500">{{ subclassName }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-500 uppercase">{{ t('review.charRace') }}</p>
          <p class="text-stone-200">{{ displayRace }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-500 uppercase">{{ t('review.charBackground') }}</p>
          <p class="text-stone-200">{{ displayBackground }}</p>
        </div>
        <div>
          <p class="text-xs text-stone-500 uppercase">{{ t('details.alignment') }}</p>
          <p class="text-stone-200">{{ char.alignment ? t(`alignments.${char.alignment}`) : '--' }}</p>
        </div>
      </div>
    </div>

    <!-- Combat Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
      <div class="bg-stone-800 border border-amber-700/30 rounded-lg p-3 text-center">
        <p class="text-xs text-stone-500">{{ t('review.ac') }}</p>
        <p class="text-2xl font-bold text-amber-400">{{ characterStore.armorClass }}</p>
      </div>
      <div class="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
        <p class="text-xs text-stone-500">{{ t('review.initiative') }}</p>
        <p class="text-2xl font-bold text-stone-200">{{ formatModifier(characterStore.initiative) }}</p>
      </div>
      <div class="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
        <p class="text-xs text-stone-500">{{ t('review.speed') }}</p>
        <p class="text-2xl font-bold text-stone-200">{{ feetToMeters(char.speed) }}m</p>
      </div>
      <div class="bg-stone-800 border border-red-700/30 rounded-lg p-3 text-center">
        <p class="text-xs text-stone-500">{{ t('review.hp') }}</p>
        <p class="text-2xl font-bold text-red-400">{{ char.maxHp }}</p>
      </div>
      <div class="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
        <p class="text-xs text-stone-500">{{ t('review.hitDie') }}</p>
        <p class="text-lg font-bold text-stone-200">{{ hitDiceDisplay }}</p>
      </div>
      <div class="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
        <p class="text-xs text-stone-500">{{ t('review.proficiencyBonus') }}</p>
        <p class="text-2xl font-bold text-stone-200">{{ formatModifier(prof) }}</p>
      </div>
    </div>

    <!-- Ability Scores -->
    <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
      <div v-for="a in (['str','dex','con','int','wis','cha'] as const)" :key="a"
        class="bg-stone-800 border border-stone-700 rounded-lg p-3 text-center">
        <p class="text-xs text-stone-500 uppercase">{{ t(`abilities.${a}`) }}</p>
        <p class="text-xl font-bold text-stone-200">{{ characterStore.totalAbilityScore(a) }}</p>
        <p class="text-sm text-amber-400">{{ formatModifier(mods[a]) }}</p>
      </div>
    </div>

    <!-- Saving Throws & Skills -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="bg-stone-800 border border-stone-700 rounded-lg p-4">
        <h3 class="font-semibold text-stone-300 mb-2">{{ t('review.savingThrows') }}</h3>
        <div class="space-y-1 text-sm">
          <div v-for="st in savingThrows" :key="st.ability" class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" :class="st.proficient ? 'bg-amber-500' : 'bg-stone-600'" :aria-label="st.proficient ? 'Proficient' : 'Not proficient'" role="img"></span>
            <span class="text-stone-400 uppercase w-8">{{ st.ability }}</span>
            <span class="text-stone-200 font-medium">{{ formatModifier(st.value) }}</span>
          </div>
        </div>
      </div>

      <div class="bg-stone-800 border border-stone-700 rounded-lg p-4">
        <h3 class="font-semibold text-stone-300 mb-2">{{ t('review.skills') }}</h3>
        <div class="space-y-1 text-xs max-h-60 overflow-y-auto">
          <div v-for="skill in skills" :key="skill.id" class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :class="skill.proficient ? 'bg-amber-500' : 'bg-stone-600'" :aria-label="skill.proficient ? 'Proficient' : 'Not proficient'" role="img"></span>
            <span class="text-stone-400 flex-1">{{ gt.skill(skill.name) }}</span>
            <span class="text-stone-200 font-medium">{{ formatModifier(skill.bonus) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Spells -->
    <div v-if="char.spellcastingAbility" class="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
      <h3 class="font-semibold text-stone-300 mb-2">{{ t('spells.title') }}</h3>
      <div class="flex gap-4 text-sm mb-3">
        <span class="text-stone-400">{{ t('spells.spellSaveDC') }}: <strong class="text-amber-400">{{ spellDC }}</strong></span>
        <span class="text-stone-400">{{ t('spells.spellAttackBonus') }}: <strong class="text-amber-400">{{ formatModifier(spellAtk) }}</strong></span>
      </div>
      <div v-if="char.cantrips.length" class="mb-2">
        <span class="text-xs text-stone-500">{{ t('spells.cantrips') }}:</span>
        <span class="text-stone-300 text-sm ml-1">{{ char.cantrips.map(spellName).join(', ') }}</span>
      </div>
      <div v-if="char.spellsKnown.length">
        <span class="text-xs text-stone-500">{{ t('spells.knownSpells') }}:</span>
        <span class="text-stone-300 text-sm ml-1">{{ char.spellsKnown.map(spellName).join(', ') }}</span>
      </div>
    </div>

    <!-- Weapons & Armor -->
    <div v-if="char.weapons.length || char.armor || char.equipment.length" class="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
      <div v-if="char.armor || char.shield" class="mb-3">
        <h4 class="font-semibold text-stone-300 mb-1">{{ t('review.armorLabel') }}</h4>
        <div class="flex gap-3 text-sm">
          <span v-if="char.armor" class="text-stone-300">{{ gt.armorName(char.armor) }}</span>
          <span v-if="char.shield" class="text-amber-400">{{ t('review.shieldBonus') }}</span>
          <span v-if="!char.armor && !char.shield" class="text-stone-500">{{ t('review.noArmor') }}</span>
        </div>
      </div>

      <div v-if="char.weapons.length" class="mb-3">
        <h4 class="font-semibold text-stone-300 mb-1">{{ t('review.attacks') }}</h4>
        <div class="space-y-1">
          <div v-for="(wpn, i) in char.weapons" :key="i" class="flex gap-4 text-sm">
            <span class="text-amber-400 font-medium w-36">{{ gt.weapon(wpn.name) }}</span>
            <span class="text-stone-400 w-12">{{ formatModifier(wpn.attackBonus) }}</span>
            <span class="text-stone-300">{{ wpn.damage }}</span>
          </div>
        </div>
      </div>

      <div v-if="char.equipment.length">
        <h4 class="font-semibold text-stone-300 mb-1">{{ t('equipment.title') }}</h4>
        <p class="text-stone-400 text-sm">{{ char.equipment.join(', ') }}</p>
      </div>
    </div>

    <!-- Features & Traits -->
    <div v-if="char.featuresTraits.length" class="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
      <h3 class="font-semibold text-stone-300 mb-2">{{ t('class.features') }}</h3>
      <div class="space-y-1">
        <div v-for="(feat, i) in char.featuresTraits" :key="i" class="text-sm text-stone-400">
          {{ gt.feature(feat) }}
        </div>
      </div>
    </div>

    <!-- Brancalonia: Brawling Info -->
    <div v-if="isBrancalonia" class="bg-stone-800 border border-amber-700/30 rounded-lg p-4 mb-4">
      <h3 class="font-semibold text-amber-400 mb-2">{{ t('details.brawling') }}</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <span class="text-stone-500">{{ t('details.size') }}:</span>
          <span class="text-stone-200 ml-1">{{ char.size || 'Medium' }}</span>
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

    <!-- Apocalisse: Mark, Virtue, Sin, Humanity -->
    <div v-if="isApocalisse" class="bg-stone-800 border border-red-700/30 rounded-lg p-4 mb-4">
      <h3 class="font-semibold text-red-400 mb-2">{{ t('details.markSection') }}</h3>
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

    <!-- Session Notes -->
    <div v-if="char.sessionNotes" class="bg-stone-800 border border-stone-700 rounded-lg p-4 mb-4">
      <h3 class="font-semibold text-stone-300 mb-2">{{ t('details.sessionNotes') }}</h3>
      <p class="text-stone-400 text-sm whitespace-pre-wrap">{{ char.sessionNotes }}</p>
    </div>

    <!-- Save/Share confirmation banner -->
    <Transition name="fade">
      <div
        v-if="saveMessage"
        class="mt-4 p-3 rounded-lg border flex items-center gap-3 bg-green-900/30 border-green-700 text-green-300"
        role="status"
        aria-live="polite"
      >
        <span class="text-xl" aria-hidden="true">✅</span>
        <p class="flex-1 text-sm">{{ saveMessage.text }}</p>
      </div>
    </Transition>
    <Transition name="fade">
      <div
        v-if="shareMessage"
        :class="[
          'mt-4 p-3 rounded-lg border flex items-center gap-3',
          shareMessage.type === 'success' ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-red-900/30 border-red-700 text-red-300'
        ]"
        role="status"
        aria-live="polite"
      >
        <span class="text-xl" aria-hidden="true">{{ shareMessage.type === 'success' ? '🔗' : '❌' }}</span>
        <div class="flex-1">
          <p class="text-sm">{{ shareMessage.text }}</p>
          <input v-if="shareMessage.url" type="text" :value="shareMessage.url" readonly
            class="mt-2 w-full text-xs bg-stone-900/50 border border-stone-600 rounded px-2 py-1 text-stone-300 select-all"
            @click="($event.target as HTMLInputElement).select()"
            :aria-label="t('review.shareUrl')"
          />
        </div>
      </div>
    </Transition>

    <!-- Export Buttons -->
    <div class="flex flex-wrap gap-3 mt-6 no-print" role="group" :aria-label="t('review.export')">
      <!-- Persist -->
      <button @click="saveChar"
        class="px-6 py-2 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors cursor-pointer">
        <span aria-hidden="true">💾</span> {{ t('review.save') }}
      </button>
      <!-- Export -->
      <button @click="exportPdf" :disabled="exporting"
        class="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
        <span aria-hidden="true">📄</span> {{ exporting ? t('common.loading') : t('review.exportPdf') }}
      </button>
      <button @click="downloadJson"
        class="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer">
        <span aria-hidden="true">📥</span> {{ t('review.exportJson') }}
      </button>
      <!-- Import -->
      <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" aria-hidden="true" tabindex="-1" />
      <button @click="triggerImport"
        class="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer">
        <span aria-hidden="true">📤</span> {{ t('review.importJson') }}
      </button>
      <!-- Share -->
      <button @click="shareCharacter"
        class="px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer">
        <span aria-hidden="true">🔗</span> {{ t('review.shareUrl') }}
      </button>
      <!-- Level progression -->
      <button v-if="canLevelUp" @click="doLevelUp"
        class="px-6 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors cursor-pointer">
        <span aria-hidden="true">⬆</span> {{ t('review.levelUp') }}
      </button>
      <button v-if="canLevelDown" @click="doLevelDown"
        class="px-6 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-lg font-semibold transition-colors cursor-pointer">
        <span aria-hidden="true">⬇</span> {{ t('review.levelDown') }}
      </button>
    </div>

    <!-- Level Up feedback -->
    <Transition name="fade">
      <div
        v-if="levelUpMessage"
        class="mt-4 p-3 bg-purple-900/30 border border-purple-700 text-purple-300 rounded-lg flex items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <span class="text-xl" aria-hidden="true">✨</span>
        <p class="flex-1 text-sm">{{ levelUpMessage }}</p>
      </div>
    </Transition>

    <VariantPromo :variant="char.variant" class="no-print" />
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
