<script setup lang="ts">
import { ref, nextTick, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLocale } from '@/i18n'

const { t, locale } = useI18n()
const open = ref(false)

// AppHeader monta due switch (barra desktop e menu mobile): un id fisso li
// renderebbe duplicati, e aria-controls punterebbe al menu sbagliato.
const menuId = `lang-switcher-menu-${useId()}`

const languages = [
  { code: 'it', label: 'Italiano', flag: 'IT' },
  { code: 'en', label: 'English', flag: 'EN' },
]

const rootEl = ref<HTMLElement | null>(null)
const triggerEl = ref<HTMLButtonElement | null>(null)
const itemEls = ref<(HTMLLIElement | null)[]>([])

// Il listbox usa il fuoco mobile: una sola voce per volta è raggiungibile con
// Tab, le altre si raggiungono con le frecce. Senza questo indice le voci
// erano <li> senza tabindex, quindi da tastiera il menu non esisteva affatto.
const activeIndex = ref(0)

function setItemEl(el: unknown, index: number) {
  itemEls.value[index] = (el as HTMLLIElement | null) ?? null
}

async function focusItem(index: number) {
  const n = languages.length
  // Le frecce girano in tondo: da EN in giù si torna a IT, come in un select.
  activeIndex.value = ((index % n) + n) % n
  await nextTick()
  itemEls.value[activeIndex.value]?.focus()
}

async function openMenu(atEnd = false) {
  open.value = true
  const current = languages.findIndex(l => l.code === locale.value)
  await nextTick()
  await focusItem(atEnd ? languages.length - 1 : Math.max(0, current))
}

/**
 * Chiudendo il menu il fuoco torna sul pulsante: senza questo, chi naviga da
 * tastiera si ritroverebbe il fuoco sul <body> e ripartirebbe da capo.
 * `returnFocus` è falso solo quando è l'utente stesso a portare il fuoco
 * altrove (Tab, clic fuori): riportarlo indietro sarebbe un rapimento.
 */
function closeMenu(returnFocus = true) {
  if (!open.value) return
  open.value = false
  if (returnFocus) triggerEl.value?.focus()
}

function toggle() {
  if (open.value) closeMenu()
  else void openMenu()
}

async function selectLang(code: string) {
  // WSG 3.8: Lazy-load locale messages before switching
  await loadLocale(code)
  locale.value = code
  closeMenu()
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    // preventDefault: senza, la freccia scrolla la pagina sotto il menu appena aperto.
    e.preventDefault()
    void openMenu()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    void openMenu(true)
  } else if (e.key === 'Escape') {
    closeMenu()
  }
}

function onMenuKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      void focusItem(activeIndex.value + 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      void focusItem(activeIndex.value - 1)
      break
    case 'Home':
      e.preventDefault()
      void focusItem(0)
      break
    case 'End':
      e.preventDefault()
      void focusItem(languages.length - 1)
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      void selectLang(languages[activeIndex.value]!.code)
      break
    case 'Escape':
      e.preventDefault()
      closeMenu()
      break
    case 'Tab':
      // Tab esce dal menu: lo si chiude ma senza rubare indietro il fuoco.
      closeMenu(false)
      break
  }
}

function onFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (next && rootEl.value?.contains(next)) return
  closeMenu(false)
}
</script>

<template>
  <!-- Switch lingua unificato del design system (.bsc-dropdown / .bsc-langswitch) -->
  <div
    ref="rootEl"
    class="bsc-dropdown bsc-langswitch"
    :class="{ 'is-open': open }"
    @focusout="onFocusOut"
  >
    <button
      ref="triggerEl"
      class="bsc-dropdown__trigger"
      type="button"
      @click="toggle"
      @keydown="onTriggerKeydown"
      :aria-expanded="open"
      aria-haspopup="listbox"
      :aria-controls="menuId"
      :aria-label="t('common.changeLanguage')"
    >
      {{ languages.find(l => l.code === locale)?.flag ?? 'EN' }}
      <svg class="bsc-dropdown__caret" width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <path d="M1 1.5 6 6.5 11 1.5" />
      </svg>
    </button>
    <!-- v-if e non solo CSS: da chiuso il listbox non deve restare
         nell'albero di accessibilità, altrimenti i lettori di schermo
         annunciano due lingue selezionabili che non si possono raggiungere. -->
    <ul
      v-if="open"
      :id="menuId"
      class="bsc-dropdown__menu"
      role="listbox"
      :aria-label="t('common.availableLanguages')"
      @keydown="onMenuKeydown"
    >
      <li
        v-for="(lang, index) in languages"
        :key="lang.code"
        :ref="el => setItemEl(el, index)"
        class="bsc-dropdown__item"
        role="option"
        :tabindex="index === activeIndex ? 0 : -1"
        :aria-selected="locale === lang.code"
        @click="selectLang(lang.code)"
      >
        {{ lang.flag }} <span class="bsc-code-tag">{{ lang.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Il design system non definisce un focus ring per .bsc-dropdown__item: senza
   questa regola la voce a fuoco è indistinguibile dalle altre. Va portata a
   monte nel submodule, qui è una toppa locale. */
.bsc-dropdown__item:focus-visible {
  outline: 3px solid var(--bsc-focus, currentColor);
  outline-offset: -3px;
}
</style>
