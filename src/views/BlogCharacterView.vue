<script setup lang="ts">
import { computed, ref, watchEffect, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getBlogCharacterBySlug } from '@/data/blog/characters'
import { useCharacterStore } from '@/stores/character'
import { useGameTerms } from '@/composables/useGameTerms'
import { usePdfExport } from '@/composables/usePdfExport'
import { generateShareUrl } from '@/utils/shareCharacter'
import { modifier, proficiencyBonus } from '@/utils/calculations'
import { armor as armorTable } from '@/data/dnd5e/equipment'
import type { CharacterData } from '@/stores/character'

const route = useRoute()
const { t } = useI18n()
const gt = useGameTerms()
const characterStore = useCharacterStore()
const { exportPdfFor, exporting } = usePdfExport()

const slug = computed(() => route.params.slug as string)
const blogChar = computed(() => getBlogCharacterBySlug(slug.value))
const char = computed(() => blogChar.value?.characterData)

const saveMessage = ref('')
const shareMessage = ref('')

// ─── Derived stats ──────────────────────────────────────────────────────────

function totalScore(ability: keyof CharacterData['abilityScores']): number {
  if (!char.value) return 10
  return char.value.abilityScores[ability] + (char.value.racialBonuses[ability] || 0)
}

function abilityMod(ability: keyof CharacterData['abilityScores']): number {
  return modifier(totalScore(ability))
}

const profBonus = computed(() => char.value ? proficiencyBonus(char.value.level) : 2)

const armorClass = computed(() => {
  if (!char.value) return 10
  const dexMod = abilityMod('dex')
  const armorData = char.value.armor
    ? armorTable.find(a => a.name === char.value!.armor)
    : null
  let ac: number
  if (!armorData) {
    // Unarmored: 10 + DEX mod
    ac = 10 + dexMod
  } else if (armorData.maxDexBonus === 0) {
    // Heavy armor: flat baseAC
    ac = armorData.baseAC
  } else if (armorData.maxDexBonus !== null) {
    // Medium armor: baseAC + min(DEX mod, maxDexBonus)
    ac = armorData.baseAC + Math.min(dexMod, armorData.maxDexBonus)
  } else {
    // Light armor: baseAC + DEX mod
    ac = armorData.baseAC + dexMod
  }
  if (char.value.shield) ac += 2
  return ac
})

const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
const abilityLabels: Record<string, string> = {
  str: 'abilities.str',
  dex: 'abilities.dex',
  con: 'abilities.con',
  int: 'abilities.int',
  wis: 'abilities.wis',
  cha: 'abilities.cha',
}

// ─── Actions ────────────────────────────────────────────────────────────────

async function downloadPdf() {
  if (!char.value) return
  await exportPdfFor(char.value)
}

function downloadJson() {
  if (!char.value) return
  const json = JSON.stringify(char.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${char.value.name || 'character'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function saveToProfile() {
  if (!char.value) return
  // Create a deep copy with a new unique ID so it doesn't clash
  const copy: CharacterData = JSON.parse(JSON.stringify(char.value))
  copy.id = crypto.randomUUID()
  characterStore.character = copy
  characterStore.saveCharacter()
  saveMessage.value = t('blog.savedSuccess')
  setTimeout(() => { saveMessage.value = '' }, 3000)
}

async function shareCharacter() {
  if (!char.value) return
  const url = generateShareUrl(char.value)
  try {
    await navigator.clipboard.writeText(url)
    shareMessage.value = t('review.shareCopied')
  } catch {
    shareMessage.value = url
  }
  setTimeout(() => { shareMessage.value = '' }, 5000)
}

function formatMod(val: number): string {
  return val >= 0 ? `+${val}` : `${val}`
}

/**
 * Get a character field (personality, physical) from i18n if available, fallback to raw data.
 */
function charField(field: string): string {
  const key = `blog.characters.${slug.value}.${field}`
  const translated = t(key)
  // vue-i18n returns the key itself when no translation exists
  if (translated === key && char.value) {
    return (char.value as unknown as Record<string, unknown>)[field] as string ?? ''
  }
  return translated
}

// ─── SEO ────────────────────────────────────────────────────────────────────

const originalTitle = document.title
watchEffect(() => {
  if (char.value) {
    document.title = `${char.value.name} - ${gt.className(char.value.className, char.value.variant)} | D&D Character Builder`
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', t(`blog.characters.${slug.value}.description`).slice(0, 160))
    }
  }
})
onUnmounted(() => {
  document.title = originalTitle
})
</script>

<template>
  <!-- 404 guard -->
  <section v-if="!char" class="py-16 text-center">
    <h2 class="text-2xl font-bold text-stone-400 mb-4">{{ t('blog.characterNotFound') }}</h2>
    <router-link to="/blog" class="text-amber-400 hover:text-amber-300 transition-colors">
      {{ t('blog.backToList') }}
    </router-link>
  </section>

  <article v-else class="max-w-4xl mx-auto py-8 space-y-8">
    <!-- Back link -->
    <router-link
      to="/blog"
      class="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-amber-400 transition-colors"
    >
      <span aria-hidden="true">&larr;</span> {{ t('blog.backToList') }}
    </router-link>

    <!-- ─── Header ──────────────────────────────────────────────────── -->
    <header class="bg-stone-800 rounded-xl border border-stone-700 p-6 space-y-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-3xl font-bold text-amber-500 font-gothic">{{ char.name }}</h1>
          <p class="text-stone-300 mt-1">
            {{ gt.raceName(char.race) }}
            <template v-if="char.subrace"> ({{ gt.subraceName(char.subrace) }})</template>
            &middot;
            {{ gt.className(char.className, char.variant) }}
            <template v-if="char.subclass"> — {{ gt.subclassName(char.subclass) }}</template>
            &middot;
            {{ t('common.level') }} {{ char.level }}
          </p>
        </div>
        <span
          :class="[
            'text-xs uppercase px-3 py-1 rounded font-medium',
            char.variant === 'dnd5e' ? 'bg-amber-900/40 text-amber-400' :
            char.variant === 'brancalonia' ? 'bg-emerald-900/40 text-emerald-400' :
            'bg-red-900/40 text-red-400'
          ]"
        >
          {{ t(`variant.${char.variant}`) }}
        </span>
      </div>

      <p v-if="char.alignment" class="text-sm text-stone-400">
        {{ t(`alignments.${char.alignment}`) }}
        <template v-if="char.background"> &middot; {{ gt.background(char.background) }}</template>
      </p>
    </header>

    <!-- ─── Action Buttons ──────────────────────────────────────────── -->
    <div class="flex flex-wrap gap-3">
      <button
        @click="downloadPdf"
        :disabled="exporting"
        class="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-50"
      >
        <span aria-hidden="true">📄</span> {{ t('blog.downloadPdf') }}
      </button>
      <button
        @click="downloadJson"
        class="px-4 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer text-sm border border-stone-600"
      >
        <span aria-hidden="true">💾</span> {{ t('blog.downloadJson') }}
      </button>
      <button
        @click="saveToProfile"
        class="px-4 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer text-sm border border-stone-600"
      >
        <span aria-hidden="true">⭐</span> {{ t('blog.saveToProfile') }}
      </button>
      <button
        @click="shareCharacter"
        class="px-4 py-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer text-sm border border-stone-600"
      >
        <span aria-hidden="true">🔗</span> {{ t('blog.shareUrl') }}
      </button>
    </div>

    <!-- Success messages -->
    <Transition name="fade">
      <p v-if="saveMessage" class="text-sm text-green-400 bg-green-900/20 border border-green-800 rounded-lg px-4 py-2" role="alert">
        {{ saveMessage }}
      </p>
    </Transition>
    <Transition name="fade">
      <p v-if="shareMessage" class="text-sm text-amber-400 bg-amber-900/20 border border-amber-800 rounded-lg px-4 py-2 break-all" role="alert">
        {{ shareMessage }}
      </p>
    </Transition>

    <!-- ─── Description ─────────────────────────────────────────────── -->
    <section class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <p class="text-stone-300 leading-relaxed">
        {{ t(`blog.characters.${slug}.description`) }}
      </p>
    </section>

    <!-- ─── Bio ─────────────────────────────────────────────────────── -->
    <section class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <h2 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">📜</span> {{ t('blog.bioTitle') }}
      </h2>
      <p class="text-stone-300 leading-relaxed">
        {{ t(`blog.characters.${slug}.bio`) }}
      </p>
    </section>

    <!-- ─── Personality ─────────────────────────────────────────────── -->
    <section class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <h2 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">🎭</span> {{ t('blog.personalityTitle') }}
      </h2>
      <p class="text-stone-300 leading-relaxed mb-4">
        {{ t(`blog.characters.${slug}.personality`) }}
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div v-if="char.personalityTraits" class="bg-stone-900/50 rounded-lg p-3">
          <span class="text-stone-500 block mb-1">{{ t('background.personalityTraits') }}</span>
          <span class="text-stone-300">{{ charField('personalityTraits') }}</span>
        </div>
        <div v-if="char.ideals" class="bg-stone-900/50 rounded-lg p-3">
          <span class="text-stone-500 block mb-1">{{ t('background.ideals') }}</span>
          <span class="text-stone-300">{{ charField('ideals') }}</span>
        </div>
        <div v-if="char.bonds" class="bg-stone-900/50 rounded-lg p-3">
          <span class="text-stone-500 block mb-1">{{ t('background.bonds') }}</span>
          <span class="text-stone-300">{{ charField('bonds') }}</span>
        </div>
        <div v-if="char.flaws" class="bg-stone-900/50 rounded-lg p-3">
          <span class="text-stone-500 block mb-1">{{ t('background.flaws') }}</span>
          <span class="text-stone-300">{{ charField('flaws') }}</span>
        </div>
      </div>
    </section>

    <!-- ─── Ability Scores ──────────────────────────────────────────── -->
    <section class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <h2 class="text-xl font-bold text-amber-400 mb-4 font-gothic">
        <span aria-hidden="true">📊</span> {{ t('blog.statsTitle') }}
      </h2>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <div
          v-for="ab in abilities"
          :key="ab"
          class="bg-stone-900/50 rounded-lg p-3 text-center"
        >
          <span class="text-xs text-stone-500 uppercase block">{{ t(abilityLabels[ab]!) }}</span>
          <span class="text-2xl font-bold text-stone-100">{{ totalScore(ab) }}</span>
          <span class="text-sm text-amber-400 block">{{ formatMod(abilityMod(ab)) }}</span>
        </div>
      </div>
    </section>

    <!-- ─── Combat Stats ────────────────────────────────────────────── -->
    <section class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <h2 class="text-xl font-bold text-amber-400 mb-4 font-gothic">
        <span aria-hidden="true">⚔️</span> {{ t('blog.combatTitle') }}
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-stone-900/50 rounded-lg p-3 text-center">
          <span class="text-xs text-stone-500 uppercase block">{{ t('review.hp') }}</span>
          <span class="text-2xl font-bold text-red-400">{{ char.maxHp }}</span>
        </div>
        <div class="bg-stone-900/50 rounded-lg p-3 text-center">
          <span class="text-xs text-stone-500 uppercase block">{{ t('review.ac') }}</span>
          <span class="text-2xl font-bold text-stone-100">{{ armorClass }}</span>
        </div>
        <div class="bg-stone-900/50 rounded-lg p-3 text-center">
          <span class="text-xs text-stone-500 uppercase block">{{ t('review.speed') }}</span>
          <span class="text-2xl font-bold text-stone-100">{{ char.speed }} ft</span>
        </div>
        <div class="bg-stone-900/50 rounded-lg p-3 text-center">
          <span class="text-xs text-stone-500 uppercase block">{{ t('review.proficiencyBonus') }}</span>
          <span class="text-2xl font-bold text-amber-400">+{{ profBonus }}</span>
        </div>
      </div>

      <!-- Weapons -->
      <div v-if="char.weapons.length > 0" class="mt-4">
        <h3 class="text-sm font-medium text-stone-400 mb-2">{{ t('review.attacks') }}</h3>
        <div class="space-y-1">
          <div
            v-for="(w, i) in char.weapons"
            :key="i"
            class="flex items-center gap-3 bg-stone-900/50 rounded-lg px-3 py-2 text-sm"
          >
            <span class="text-stone-200 font-medium">{{ gt.weapon(w.name) }}</span>
            <span class="text-amber-400">{{ formatMod(w.attackBonus) }}</span>
            <span class="text-stone-400">{{ w.damage }}</span>
          </div>
        </div>
      </div>

      <!-- Hit Die & Armor -->
      <div class="mt-4 flex flex-wrap gap-4 text-sm text-stone-400">
        <span>{{ t('review.hitDie') }}: <strong class="text-stone-200">d{{ char.hitDie }}</strong></span>
        <span v-if="char.armor">{{ t('review.armorLabel') }}: <strong class="text-stone-200">{{ gt.armorName(char.armor) }}</strong></span>
        <span v-if="char.shield">{{ t('review.shieldBonus') }}</span>
      </div>
    </section>

    <!-- ─── Proficiencies ───────────────────────────────────────────── -->
    <section class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <h2 class="text-xl font-bold text-amber-400 mb-4 font-gothic">
        <span aria-hidden="true">🎯</span> {{ t('blog.proficienciesTitle') }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div v-if="char.savingThrowProficiencies.length > 0">
          <h3 class="text-stone-500 mb-1">{{ t('review.savingThrows') }}</h3>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="st in char.savingThrowProficiencies"
              :key="st"
              class="bg-stone-700 text-stone-200 px-2 py-0.5 rounded text-xs"
            >
              {{ t(`abilities.${st}`) }}
            </span>
          </div>
        </div>
        <div v-if="char.skillProficiencies.length > 0">
          <h3 class="text-stone-500 mb-1">{{ t('review.skills') }}</h3>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="sk in char.skillProficiencies"
              :key="sk"
              class="bg-stone-700 text-stone-200 px-2 py-0.5 rounded text-xs"
            >
              {{ gt.skill(sk) }}
            </span>
          </div>
        </div>
        <div v-if="char.languages.length > 0">
          <h3 class="text-stone-500 mb-1">{{ t('race.languages') }}</h3>
          <span class="text-stone-300">{{ char.languages.map(l => gt.language(l)).join(', ') }}</span>
        </div>
        <div v-if="char.proficienciesOther.length > 0">
          <h3 class="text-stone-500 mb-1">{{ t('class.proficiencies') }}</h3>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="p in char.proficienciesOther"
              :key="p"
              class="bg-stone-700 text-stone-200 px-2 py-0.5 rounded text-xs"
            >
              {{ gt.proficiency(p) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Equipment ───────────────────────────────────────────────── -->
    <section v-if="char.equipment.length > 0" class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <h2 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">🎒</span> {{ t('blog.equipmentTitle') }}
      </h2>
      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-stone-300">
        <li v-for="(item, i) in char.equipment" :key="i" class="flex items-center gap-2">
          <span class="text-stone-600" aria-hidden="true">&bull;</span> {{ gt.equipment(item) }}
        </li>
      </ul>
      <p v-if="char.coins.gp > 0" class="text-sm text-stone-400 mt-2">
        {{ t('equipment.coins') }}: {{ char.coins.gp }} {{ t('blog.goldPieces') }}
      </p>
    </section>

    <!-- ─── Features & Traits ───────────────────────────────────────── -->
    <section v-if="char.featuresTraits.length > 0" class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <h2 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">✨</span> {{ t('blog.featuresTitle') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="feat in char.featuresTraits"
          :key="feat"
          class="bg-amber-900/30 text-amber-300 border border-amber-700/30 px-3 py-1 rounded-lg text-sm"
        >
          {{ gt.feature(feat) }}
        </span>
      </div>
    </section>

    <!-- ─── Spells ──────────────────────────────────────────────────── -->
    <section v-if="char.spellsKnown.length > 0 || char.cantrips.length > 0" class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <h2 class="text-xl font-bold text-amber-400 mb-3 font-gothic">
        <span aria-hidden="true">🔮</span> {{ t('blog.spellsTitle') }}
      </h2>
      <div v-if="char.spellcastingAbility" class="text-sm text-stone-400 mb-3">
        {{ t('spells.spellcastingAbility') }}: <strong class="text-stone-200">{{ t(`abilities.${char.spellcastingAbility}`) }}</strong>
      </div>
      <div v-if="char.cantrips.length > 0" class="mb-3">
        <h3 class="text-sm text-stone-500 mb-1">{{ t('spells.cantrips') }}</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="c in char.cantrips"
            :key="c"
            class="bg-purple-900/30 text-purple-300 border border-purple-700/30 px-3 py-1 rounded-lg text-sm"
          >
            {{ gt.spell(c) }}
          </span>
        </div>
      </div>
      <div v-if="char.spellsKnown.length > 0">
        <h3 class="text-sm text-stone-500 mb-1">{{ t('spells.knownSpells') }}</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="s in char.spellsKnown"
            :key="s"
            class="bg-purple-900/30 text-purple-300 border border-purple-700/30 px-3 py-1 rounded-lg text-sm"
          >
            {{ gt.spell(s) }}
          </span>
        </div>
      </div>
    </section>

    <!-- ─── Physical Details ────────────────────────────────────────── -->
    <section class="bg-stone-800 rounded-xl border border-stone-700 p-6">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm text-center">
        <div v-if="char.age" class="bg-stone-900/50 rounded-lg p-2">
          <span class="text-stone-500 block text-xs">{{ t('details.age') }}</span>
          <span class="text-stone-200">{{ charField('age') }}</span>
        </div>
        <div v-if="char.height" class="bg-stone-900/50 rounded-lg p-2">
          <span class="text-stone-500 block text-xs">{{ t('details.height') }}</span>
          <span class="text-stone-200">{{ char.height }}</span>
        </div>
        <div v-if="char.weight" class="bg-stone-900/50 rounded-lg p-2">
          <span class="text-stone-500 block text-xs">{{ t('details.weight') }}</span>
          <span class="text-stone-200">{{ char.weight }}</span>
        </div>
        <div v-if="char.eyes" class="bg-stone-900/50 rounded-lg p-2">
          <span class="text-stone-500 block text-xs">{{ t('details.eyes') }}</span>
          <span class="text-stone-200">{{ charField('eyes') }}</span>
        </div>
        <div v-if="char.hair" class="bg-stone-900/50 rounded-lg p-2">
          <span class="text-stone-500 block text-xs">{{ t('details.hair') }}</span>
          <span class="text-stone-200">{{ charField('hair') }}</span>
        </div>
        <div v-if="char.skin" class="bg-stone-900/50 rounded-lg p-2">
          <span class="text-stone-500 block text-xs">{{ t('details.skin') }}</span>
          <span class="text-stone-200">{{ charField('skin') }}</span>
        </div>
      </div>
    </section>

    <!-- ─── JSON-LD Structured Data ─────────────────────────────────── -->
    <component :is="'script'" type="application/ld+json" v-html="JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'name': char.name,
      'description': t(`blog.characters.${slug}.description`).slice(0, 160),
      'url': `https://brainstorm-club.github.io/dnd-character-builder/blog/${slug}`,
      'author': { '@type': 'Person', 'name': 'fullo' },
      'publisher': { '@type': 'Organization', 'name': 'D&D Character Builder' },
    })" />
  </article>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
