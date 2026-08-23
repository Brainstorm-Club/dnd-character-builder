<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameVariant } from '@/stores/app'
import { variantInfo } from '@/data/variants'

const props = defineProps<{
  variant: GameVariant
}>()

const { t } = useI18n()

// Unica fonte di verità per colori e link: prima i tre dizionari locali erano
// `Record<string, ...>` senza la voce 'dnd2024', e il riquadro finiva senza
// bordo e con due <a> privi di href.
const info = computed(() => variantInfo(props.variant))

/** Solo i link con un URL reale: un <a> senza href non è né cliccabile né focusabile. */
const shops = computed(() => {
  const { publisherUrl, publisherLabel, amazonUrl } = info.value
  return [
    { url: publisherUrl, label: publisherLabel },
    { url: amazonUrl, label: 'Amazon' },
  ].filter(s => s.url !== '')
})
</script>

<template>
  <div
    v-if="shops.length > 0"
    class="mt-6 bg-stone-800/50 border rounded-lg p-4 text-center"
    :class="info.promoBorder"
  >
    <p class="text-stone-400 text-sm">
      {{ t(`variant.${variant}Promo`) }}
      <template v-for="(shop, i) in shops" :key="shop.url">
        <span v-if="i > 0" class="text-stone-600 mx-1">|</span>
        <a
          :href="shop.url"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline"
          :class="[info.link, i === 0 ? 'ml-1' : '']"
        >{{ shop.label }}</a>
      </template>
    </p>
  </div>
</template>
