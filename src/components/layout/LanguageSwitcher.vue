<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLocale } from '@/i18n'

const { locale } = useI18n()
const open = ref(false)

const languages = [
  { code: 'it', label: 'Italiano', flag: 'IT' },
  { code: 'en', label: 'English', flag: 'EN' },
]

async function selectLang(code: string) {
  // WSG 3.8: Lazy-load locale messages before switching
  await loadLocale(code)
  locale.value = code
  open.value = false
}

function handleBlur() {
  // Delay to allow click on dropdown item
  setTimeout(() => { open.value = false }, 150)
}
</script>

<template>
  <!-- Switch lingua unificato del design system (.bsc-dropdown / .bsc-langswitch) -->
  <div class="bsc-dropdown bsc-langswitch" :class="{ 'is-open': open }">
    <button
      class="bsc-dropdown__trigger"
      @click="open = !open"
      @blur="handleBlur"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-label="locale === 'it' ? 'Cambia lingua' : 'Change language'"
    >
      {{ languages.find(l => l.code === locale)?.flag ?? 'EN' }}
      <svg class="bsc-dropdown__caret" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <path d="M1 1.5 6 6.5 11 1.5" />
      </svg>
    </button>
    <ul
      class="bsc-dropdown__menu"
      role="listbox"
      :aria-label="locale === 'it' ? 'Lingue disponibili' : 'Available languages'"
    >
      <li
        v-for="lang in languages"
        :key="lang.code"
        class="bsc-dropdown__item"
        role="option"
        :aria-selected="locale === lang.code"
        @click="selectLang(lang.code)"
      >
        {{ lang.flag }} <span class="bsc-code-tag">{{ lang.label }}</span>
      </li>
    </ul>
  </div>
</template>
