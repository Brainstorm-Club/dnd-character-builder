<script setup lang="ts">
import { computed, ref, watchEffect, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getBlogCharacterBySlug } from '@/data/blog/characters'
import { useCharacterStore } from '@/stores/character'
import { useGameTerms } from '@/composables/useGameTerms'
import type { CharacterData } from '@/stores/character'
import CharacterSheet from '@/components/shared/CharacterSheet.vue'
import { usePdfExport } from '@/composables/usePdfExport'
import { generateShareUrl } from '@/utils/shareCharacter'
import { variantInfo } from '@/data/variants'

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

// I conti derivati vivevano qui in una versione più povera di quella del
// riepilogo: adesso li fa CharacterSheet, uno solo per tutta l'app.

// ─── Actions ────────────────────────────────────────────────────────────────

/**
 * I campi di prosa dei personaggi pronti stanno nei dati in inglese e hanno la
 * traduzione italiana nei file di lingua — è per questo che la pagina si legge
 * in italiano. Il PDF però esportava il dato grezzo, e usciva una scheda
 * italiana con tratti, ideali, legami e difetti in inglese. Qui il personaggio
 * viene tradotto PRIMA di darlo all'esportazione.
 */
const CAMPI_TRADOTTI = [
  'personalityTraits', 'ideals', 'bonds', 'flaws', 'eyes', 'hair', 'skin', 'age',
] as const

function personaggioTradotto(): CharacterData | undefined {
  if (!char.value) return undefined
  const copia: CharacterData = JSON.parse(JSON.stringify(char.value))
  for (const campo of CAMPI_TRADOTTI) {
    const tradotto = charField(campo)
    if (tradotto) (copia as unknown as Record<string, unknown>)[campo] = tradotto
  }
  return copia
}

async function downloadPdf() {
  const c = personaggioTradotto()
  if (!c) return
  await exportPdfFor(c)
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
          :class="['text-xs uppercase px-3 py-1 rounded font-medium', variantInfo(char.variant).badge]"
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

    <!-- La scheda vera e propria: un solo componente per tutta
         l'applicazione. `traduci` gli passa la versione italiana dei campi
         di testo, che per i personaggi pronti sta nei file di lingua. -->
    <CharacterSheet :char="char" :traduci="(campo, valore) => charField(campo) || valore" />

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
