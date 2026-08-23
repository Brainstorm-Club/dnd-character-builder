<script setup lang="ts">
import { ref, computed, watchEffect, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { blogCharacters } from '@/data/blog/characters'
import { useGameTerms } from '@/composables/useGameTerms'
import { GAME_VARIANTS, type GameVariant } from '@/stores/app'
import { variantInfo } from '@/data/variants'

const { t } = useI18n()
const gt = useGameTerms()

const activeFilter = ref<'all' | GameVariant>('all')

const filteredCharacters = computed(() => {
  if (activeFilter.value === 'all') return blogCharacters
  return blogCharacters.filter(c => c.variant === activeFilter.value)
})

// I filtri seguono GAME_VARIANTS: una variante nuova compare qui da sola,
// invece di restare senza scheda come era successo a 'dnd2024' altrove.
const filters: { id: 'all' | GameVariant; key: string }[] = [
  { id: 'all', key: 'blog.filters.all' },
  ...GAME_VARIANTS.map(v => ({ id: v, key: `blog.filters.${v}` })),
]

// SEO: update document title and meta description
const originalTitle = document.title
watchEffect(() => {
  document.title = t('blog.meta.listTitle')
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) metaDesc.setAttribute('content', t('blog.meta.listDescription'))
})
onUnmounted(() => {
  document.title = originalTitle
})
</script>

<template>
  <section class="flex flex-col items-center py-8" aria-labelledby="blog-heading">
    <div class="text-center max-w-3xl mb-8">
      <h2 id="blog-heading" class="text-4xl font-bold text-amber-500 mb-3 font-gothic">
        {{ t('blog.title') }}
      </h2>
      <p class="text-stone-400 text-base leading-relaxed">
        {{ t('blog.description') }}
      </p>
    </div>

    <!-- Variant filter tabs -->
    <nav class="flex flex-wrap gap-2 mb-8" aria-label="Filter by variant">
      <button
        v-for="f in filters"
        :key="f.id"
        @click="activeFilter = f.id"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
          activeFilter === f.id
            ? 'bg-amber-600 text-stone-900'
            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
        ]"
        :aria-pressed="activeFilter === f.id"
      >
        {{ t(f.key) }}
      </button>
    </nav>

    <!-- Character grid -->
    <div class="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link
        v-for="char in filteredCharacters"
        :key="char.slug"
        :to="`/blog/${char.slug}`"
        :class="[
          'bg-stone-800 rounded-xl border p-5 flex flex-col gap-3 transition-colors no-underline group',
          variantInfo(char.variant).borderHover,
        ]"
      >
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-lg font-bold text-amber-400 font-gothic group-hover:text-amber-300 transition-colors">
            {{ char.characterData.name }}
          </h3>
          <span :class="['text-xs uppercase px-2 py-0.5 rounded whitespace-nowrap', variantInfo(char.variant).badge]">
            {{ char.variant }}
          </span>
        </div>

        <p class="text-sm text-stone-400">
          {{ gt.raceName(char.characterData.race) }}
          <template v-if="char.characterData.subrace">
            ({{ gt.subraceName(char.characterData.subrace) }})
          </template>
        </p>

        <p class="text-sm text-stone-300">
          {{ gt.className(char.characterData.className, char.variant) }}
          <span class="text-stone-500">Lv.{{ char.characterData.level }}</span>
        </p>

        <p class="text-xs text-stone-500 mt-auto line-clamp-2">
          {{ t(`blog.characters.${char.slug}.description`).slice(0, 120) }}...
        </p>
      </router-link>
    </div>

    <!-- Empty state -->
    <p
      v-if="filteredCharacters.length === 0"
      class="text-stone-500 text-center py-8"
    >
      {{ t('common.noResults') }}
    </p>
  </section>
</template>
