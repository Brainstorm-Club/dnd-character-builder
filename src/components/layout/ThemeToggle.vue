<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'

const { t } = useI18n()
const { theme, effectiveTheme, toggleTheme } = useTheme()
</script>

<template>
  <!--
    Pelle unificata del design system (.bsc-theme-toggle), la stessa che usa
    harp-forge: pastiglia trasparente col bordo, non più il quadrato pieno
    rifatto a mano. Sta accanto allo switch lingua, che è già passato a
    .bsc-dropdown__trigger: i due controlli ora hanno lo stesso peso visivo.
  -->
  <button
    @click="toggleTheme"
    class="bsc-theme-toggle"
    :aria-label="t('theme.toggle')"
    :title="theme === 'auto' ? t('theme.auto') : theme === 'light' ? t('theme.light') : t('theme.dark')"
  >
    <!--
      Le icone restano scelte da Vue e non dal CSS del DS. Il design system
      commuta luna/sole con `:root[data-theme]`, che qui vale il tema EFFETTIVO:
      basterebbe per due stati, ma l'app ne ha tre e in "auto" deve mostrare il
      mezzo cerchio, non la luna. Le classi .bsc-tt-* sono comunque quelle del
      DS e concordano con il v-if (sole solo con data-theme="light", luna solo
      con "dark"), quindi le due regole non si contraddicono mai.
    -->
    <!-- Sun icon (light mode) -->
    <svg v-if="effectiveTheme === 'light'" class="bsc-tt-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="5" stroke-width="2" />
      <path stroke-linecap="round" stroke-width="2"
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
    <!-- Moon icon (dark mode) -->
    <svg v-else-if="theme === 'dark'" class="bsc-tt-moon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
    <!--
      Terzo stato "auto": NON usa .bsc-tt-auto. Quella classe è `display: none`
      finché <html> non ha `data-theme-pref="auto"`, che qui nessuno imposta —
      metterla renderebbe il pulsante vuoto proprio in modalità automatica. La
      misura è quella delle altre due icone del DS (18px), non w-4.
    -->
    <svg v-else class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke-width="2" />
      <path d="M12 3a9 9 0 010 18" fill="currentColor" stroke="none" />
    </svg>
  </button>
</template>
