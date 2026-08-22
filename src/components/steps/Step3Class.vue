<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { getClasses, getFeatureDescription, getFeatureName } from '@/data'
import type { CharacterClass, Subclass } from '@/data/dnd5e/classes'
import { SKILLS } from '@/data/dnd5e/skills'
import { useGameTerms } from '@/composables/useGameTerms'
import { getClassBlurb } from '@/data/classBlurbs'
import VariantPromo from '@/components/shared/VariantPromo.vue'

// Multiclass support (D&D 5e only)

const { t, locale } = useI18n()
const characterStore = useCharacterStore()
const gt = useGameTerms()

const variant = computed(() => characterStore.character.variant)

function skillDisplayName(skillId: string): string {
  const skill = SKILLS.find(s => s.id === skillId)
  return skill ? gt.skill(skill.name) : skillId
}

const classes = computed(() => getClasses(characterStore.character.variant))
const selectedClass = ref<CharacterClass | null>(null)
const selectedSkills = ref<string[]>([])
const selectedSubclass = ref<string>('')

// Restore the pickers when the user comes back to this step
const storedClass = classes.value.find(c => c.id === characterStore.character.className)
if (storedClass) {
  selectedClass.value = storedClass
  selectedSkills.value = characterStore.character.skillProficiencies
    .filter(s => storedClass.skillChoices.includes(s))
  selectedSubclass.value = characterStore.character.subclass
}

// Switching variant resets the character, so drop the local selection too —
// otherwise the panel keeps offering a class the new variant does not have,
// and its skill picker keeps writing to the store.
watch(
  () => [characterStore.character.variant, characterStore.character.className],
  ([, className]) => {
    if (!className) {
      selectedClass.value = null
      selectedSubclass.value = ''
      selectedSkills.value = []
    }
  },
)

function selectClass(cls: CharacterClass) {
  // Drop the subclass (and its features) chosen for the previous class
  if (characterStore.character.subclass) characterStore.setSubclass('')
  selectedSubclass.value = ''
  selectedClass.value = cls
  characterStore.character.className = cls.id
  characterStore.character.hitDie = cls.hitDie
  characterStore.character.savingThrowProficiencies = [...cls.savingThrows]
  selectedSkills.value = []

  // Set spellcasting info. Fighter and Rogue carry a third-caster progression
  // only for their spellcasting subclasses, so a plain one gets no spell sheet.
  const castsBySubclass = cls.spellcasting?.casterType === 'third'
  if (cls.spellcasting && !castsBySubclass) {
    characterStore.character.spellcastingClass = cls.id
    characterStore.character.spellcastingAbility = cls.spellcasting.ability
  } else {
    characterStore.character.spellcastingClass = ''
    characterStore.character.spellcastingAbility = ''
  }

  // Grant the class features the character's level entitles it to. Without
  // this a hand-built character ends up with only its subclass features.
  characterStore.syncClassAndLevel()
}

function toggleSkill(skill: string) {
  if (!selectedClass.value) return
  const idx = selectedSkills.value.indexOf(skill)
  if (idx >= 0) {
    selectedSkills.value.splice(idx, 1)
  } else if (selectedSkills.value.length < selectedClass.value.numSkillChoices) {
    selectedSkills.value.push(skill)
  }
  characterStore.character.skillProficiencies = [...selectedSkills.value]
}

// ── Subclass ────────────────────────────────────────────────────────────────

/** Level the character has in a given class (multiclass entries count separately) */
function classLevel(classId: string): number {
  const entry = (characterStore.character.classes ?? []).find(c => c.classId === classId)
  return entry ? entry.level : characterStore.character.level
}

/**
 * Subclass names are translated by id (see `subclassNamesIt`); fall back to the
 * English name rather than showing a raw slug.
 */
function subclassLabel(sub: Subclass): string {
  const translated = gt.subclassName(sub.id)
  return translated === sub.id ? sub.name : translated
}

const subclassUnlocked = computed(() =>
  !!selectedClass.value
  && selectedClass.value.subclasses.length > 0
  && classLevel(selectedClass.value.id) >= selectedClass.value.subclassLevel,
)

/** Level in the currently selected class (0 when no class is chosen) */
const selectedClassLevel = computed(() =>
  selectedClass.value ? classLevel(selectedClass.value.id) : 0,
)

const selectedSubclassObj = computed(
  () => selectedClass.value?.subclasses.find(s => s.id === selectedSubclass.value) || null,
)

// Subclasses that grant spellcasting on a third-caster chassis, i.e. the only
// reason Fighter and Rogue carry a spellcasting block at all.
const THIRD_CASTER_SUBCLASSES = ['eldritch-knight', 'arcane-trickster']

function selectSubclass(subclassId: string) {
  if (!selectedClass.value) return
  selectedSubclass.value = subclassId
  characterStore.setSubclass(subclassId, selectedClass.value.id)

  const cls = selectedClass.value
  if (cls.spellcasting?.casterType === 'third') {
    const casts = THIRD_CASTER_SUBCLASSES.includes(subclassId)
    characterStore.character.spellcastingClass = casts ? cls.id : ''
    characterStore.character.spellcastingAbility = casts ? cls.spellcasting.ability : ''
  }
}

/**
 * Subclass options for a secondary (multiclass) entry, once that class reaches
 * its own subclass level. The primary class is skipped — it has the picker in
 * the class details panel above.
 */
function multiclassSubclasses(classId: string): Subclass[] {
  if (classId === characterStore.character.className) return []
  const cls = classes.value.find(c => c.id === classId)
  if (!cls || classLevel(classId) < cls.subclassLevel) return []
  return cls.subclasses
}

function selectMulticlassSubclass(classId: string, subclassId: string) {
  characterStore.setSubclass(subclassId, classId)
}

// Multiclass: only D&D 5e, only if primary class is selected
const canMulticlass = computed(() =>
  variant.value === 'dnd5e' && !!characterStore.character.className
)

const multiclassOptions = computed(() => {
  if (!canMulticlass.value) return []
  const takenIds = new Set(characterStore.character.classes.map(c => c.classId))
  // Also exclude primary class if classes array is empty
  if (takenIds.size === 0) takenIds.add(characterStore.character.className)
  return classes.value.filter(c => !takenIds.has(c.id))
})

const multiclassDisplay = computed(() => {
  const cls_arr = characterStore.character.classes ?? []
  if (cls_arr.length < 2) return ''
  return cls_arr
    .map(c => {
      const cls = classes.value.find(cl => cl.id === c.classId)
      const name = cls ? gt.className(cls.name, variant.value) : c.classId
      return `${name} ${c.level}`
    })
    .join(' / ')
})

const showMulticlassAdd = ref(false)

function addSecondaryClass(clsId: string) {
  characterStore.addMulticlass(clsId)
  showMulticlassAdd.value = false
}

function removeSecondaryClass(clsId: string) {
  characterStore.removeMulticlass(clsId)
}
// In italiano mostriamo il testo dei manuali italiani: quelli di Brancalonia
// e Apocalisse per i contenuti propri, l'SRD 5.2.1 italiano come autorità
// terminologica per i privilegi delle classi base di D&D.
function classBlurb(cls: { id: string; blurb?: string }): string | undefined {
  return cls.blurb ?? getClassBlurb(characterStore.character.variant, cls.id)
}

function featureText(feature: { id?: string; name: string; description?: string }): string {
  const v = characterStore.character.variant
  return getFeatureDescription(v, feature.id ?? '', locale.value, feature.description ?? '')
}
function featureLabel(feature: { id?: string; name: string }): string {
  const v = characterStore.character.variant
  return getFeatureName(v, feature.id ?? '', locale.value, gt.feature(feature.name))
}

</script>

<template>
  <section aria-labelledby="class-heading">
    <h2 id="class-heading" class="text-2xl font-bold text-amber-500 mb-6">{{ t('class.title') }}</h2>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="radiogroup" :aria-label="t('class.title')">
      <button
        v-for="cls in classes"
        :key="cls.id"
        @click="selectClass(cls)"
        class="bg-stone-800 border-2 rounded-lg p-3 text-left transition-all cursor-pointer"
        :class="characterStore.character.className === cls.id ? 'border-amber-500' : 'border-stone-700 hover:border-stone-600'"
        role="radio"
        :aria-checked="characterStore.character.className === cls.id"
        :aria-label="gt.className(cls.name, variant)"
      >
        <h3 class="font-bold text-amber-400 text-sm">{{ gt.className(cls.name, variant) }}</h3>
        <p class="text-xs text-stone-500 mt-1">d{{ cls.hitDie }} &bull; {{ cls.primaryAbility.map((a: string) => a.toUpperCase()).join(', ') }}</p>
        <p v-if="classBlurb(cls)" class="text-xs text-stone-400/90 mt-2 leading-snug">{{ classBlurb(cls) }}</p>
      </button>
    </div>

    <!-- Class Details -->
    <div v-if="selectedClass" class="mt-6 bg-stone-800 border border-stone-700 rounded-lg p-6">
      <h3 class="text-xl font-bold text-amber-400 mb-3">{{ gt.className(selectedClass.name, variant) }}</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 class="font-semibold text-stone-300 mb-1">{{ t('class.hitDie') }}</h4>
          <p class="text-stone-400">d{{ selectedClass.hitDie }}</p>
        </div>
        <div>
          <h4 class="font-semibold text-stone-300 mb-1">{{ t('class.savingThrows') }}</h4>
          <p class="text-stone-400">{{ selectedClass.savingThrows.map(s => s.toUpperCase()).join(', ') }}</p>
        </div>
        <div>
          <h4 class="font-semibold text-stone-300 mb-1">{{ t('class.proficiencies') }}</h4>
          <p class="text-stone-400 text-xs">
            {{ selectedClass.armorProficiencies.map(p => gt.proficiency(p)).join(', ') }}<br>
            {{ selectedClass.weaponProficiencies.map(p => gt.proficiency(p)).join(', ') }}
          </p>
        </div>
        <div v-if="selectedClass.spellcasting">
          <h4 class="font-semibold text-stone-300 mb-1">{{ t('spells.spellcastingAbility') }}</h4>
          <p class="text-stone-400">{{ selectedClass.spellcasting.ability.toUpperCase() }} ({{ selectedClass.spellcasting.casterType }})</p>
        </div>
      </div>

      <!-- Skill Selection -->
      <div class="mt-4">
        <h4 class="font-semibold text-stone-300 mb-2">
          {{ t('class.skillChoices', { count: selectedClass.numSkillChoices }) }}
          <span class="text-stone-500">({{ selectedSkills.length }}/{{ selectedClass.numSkillChoices }})</span>
        </h4>
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('class.skillChoices', { count: selectedClass.numSkillChoices })">
          <button
            v-for="skill in selectedClass.skillChoices"
            :key="skill"
            @click="toggleSkill(skill)"
            class="px-3 py-1 rounded text-xs transition-colors cursor-pointer"
            :class="selectedSkills.includes(skill)
              ? 'bg-amber-600 text-stone-900 font-medium'
              : selectedSkills.length >= selectedClass.numSkillChoices
                ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
            :aria-pressed="selectedSkills.includes(skill)"
            :aria-disabled="!selectedSkills.includes(skill) && selectedSkills.length >= selectedClass.numSkillChoices"
          >
            {{ skillDisplayName(skill) }}
          </button>
        </div>
      </div>

      <!-- Features -->
      <div v-if="selectedClass.features?.length" class="mt-4">
        <h4 class="font-semibold text-stone-300 mb-2">{{ t('class.features') }}</h4>
        <div class="space-y-2">
          <div v-for="feature in selectedClass.features.filter(f => f.level <= characterStore.character.level)" :key="feature.name" class="text-sm">
            <span class="text-amber-400 font-medium">Lv.{{ feature.level }}:</span>
            <span class="text-stone-400 ml-1">{{ featureLabel(feature) }}</span>
            <p v-if="feature.description" class="text-stone-500 text-xs ml-4">{{ featureText(feature) }}</p>
          </div>
        </div>
      </div>

      <!-- Subclass -->
      <div v-if="selectedClass.subclasses.length" class="mt-4">
        <h4 class="font-semibold text-stone-300 mb-2">{{ t('class.subclass') }}</h4>

        <p v-if="!subclassUnlocked" class="text-stone-500 text-sm">
          {{ t('class.subclassAtLevel', { level: selectedClass.subclassLevel }) }}
        </p>

        <template v-else>
          <div class="flex gap-2 flex-wrap" role="radiogroup" :aria-label="t('class.subclass')">
            <button
              v-for="sub in selectedClass.subclasses"
              :key="sub.id"
              @click="selectSubclass(sub.id)"
              class="px-3 py-1 rounded text-sm transition-colors cursor-pointer"
              :class="selectedSubclass === sub.id ? 'bg-amber-600 text-stone-900' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
              role="radio"
              :aria-checked="selectedSubclass === sub.id"
            >
              {{ subclassLabel(sub) }}
            </button>
          </div>

          <!-- Selected subclass details -->
          <div v-if="selectedSubclassObj" class="mt-3 text-sm">
            <p class="text-stone-400">{{ featureText(selectedSubclassObj) }}</p>
            <div v-if="selectedSubclassObj.features.length" class="mt-2 space-y-2">
              <div
                v-for="feature in selectedSubclassObj.features.filter(f => f.level <= selectedClassLevel)"
                :key="feature.name"
              >
                <span class="text-amber-400 font-medium">Lv.{{ feature.level }}:</span>
                <span class="text-stone-400 ml-1">{{ featureLabel(feature) }}</span>
                <p v-if="feature.description" class="text-stone-500 text-xs ml-4">{{ featureText(feature) }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Multiclass (D&D 5e only) -->
    <div v-if="canMulticlass" class="mt-6 bg-stone-800 border border-purple-700/30 rounded-lg p-4" role="region" :aria-label="t('class.multiclass')">
      <h3 class="font-semibold text-purple-400 mb-3">{{ t('class.multiclass') }}</h3>

      <!-- Current multiclass breakdown -->
      <div v-if="(characterStore.character.classes ?? []).length >= 2" class="mb-3">
        <p class="text-stone-300 text-sm font-medium mb-2">{{ multiclassDisplay }} ({{ t('common.level') }} {{ characterStore.character.level }})</p>
        <div class="flex flex-col gap-2">
          <div
            v-for="entry in characterStore.character.classes"
            :key="entry.classId"
            class="bg-stone-700 rounded px-3 py-1.5 text-sm"
          >
            <div class="flex items-center gap-2">
              <span class="text-amber-400 font-medium">
                {{ classes.find(c => c.id === entry.classId) ? gt.className(classes.find(c => c.id === entry.classId)!.name, variant) : entry.classId }}
              </span>
              <span class="text-stone-400">Lv.{{ entry.level }}</span>
              <span class="text-stone-500 text-xs">(d{{ entry.hitDie }})</span>
              <!-- Remove button (only for secondary classes) -->
              <button
                v-if="entry.classId !== characterStore.character.classes[0]?.classId"
                @click="removeSecondaryClass(entry.classId)"
                class="text-red-400 hover:text-red-300 text-xs ml-1 cursor-pointer"
                :aria-label="t('class.removeClass')"
              >✕</button>
            </div>

            <!-- Per-class subclass picker, unlocked at that class's own level -->
            <div
              v-if="multiclassSubclasses(entry.classId).length"
              class="flex gap-2 flex-wrap mt-2"
              role="radiogroup"
              :aria-label="t('class.subclass')"
            >
              <button
                v-for="sub in multiclassSubclasses(entry.classId)"
                :key="sub.id"
                @click="selectMulticlassSubclass(entry.classId, sub.id)"
                class="px-2 py-0.5 rounded text-xs transition-colors cursor-pointer"
                :class="entry.subclass === sub.id ? 'bg-amber-600 text-stone-900' : 'bg-stone-600 text-stone-300 hover:bg-stone-500'"
                role="radio"
                :aria-checked="entry.subclass === sub.id"
              >
                {{ subclassLabel(sub) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add class button/selector -->
      <div v-if="!showMulticlassAdd">
        <button
          @click="showMulticlassAdd = true"
          class="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-purple-100 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          :disabled="multiclassOptions.length === 0"
        >
          <span aria-hidden="true">+</span> {{ t('class.addClass') }}
        </button>
      </div>
      <div v-else>
        <p class="text-stone-400 text-sm mb-2">{{ t('class.selectClassToAdd') }}:</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="cls in multiclassOptions"
            :key="cls.id"
            @click="addSecondaryClass(cls.id)"
            class="bg-stone-700 hover:bg-stone-600 border border-stone-600 rounded-lg p-2 text-left transition-colors cursor-pointer"
          >
            <span class="text-amber-400 text-sm font-medium">{{ gt.className(cls.name, variant) }}</span>
            <span class="text-stone-500 text-xs ml-1">(d{{ cls.hitDie }})</span>
          </button>
        </div>
        <button
          @click="showMulticlassAdd = false"
          class="mt-2 text-stone-500 hover:text-stone-400 text-sm cursor-pointer"
        >{{ t('common.cancel') }}</button>
      </div>
    </div>

    <VariantPromo :variant="characterStore.character.variant" />
  </section>
</template>
