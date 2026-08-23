<script setup lang="ts">
// Un testo di regole in cui i nomi delle condizioni si possono aprire.
//
// Serve a un difetto preciso: l'app stampava «il bersaglio è spaventato» senza
// saper dire cosa volesse dire, perché le condizioni non erano fra i suoi dati.
// Adesso ci sono, e il nome citato diventa un bottone che apre il testo
// dell'SRD. Nessuno stato di gioco: qui non si applica niente al personaggio.
//
// Quando la fonte non ha il testo (le quattro voci che l'SRD 5.1 italiano non
// traduce) il bottone c'è lo stesso e dichiara l'assenza: mostrare il testo
// del 2024 al suo posto sarebbe un'altra edizione spacciata per questa.

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GameVariant } from '@/stores/app'
import { getConditions } from '@/data'
import { annotaCondizioni } from '@/domain/condizioni'

const props = defineProps<{
  text: string
  variant: GameVariant
  /** Classi del testo normale, così il chiamante non perde il suo stile. */
  textClass?: string
}>()

const { t, locale } = useI18n()

const segmenti = computed(() =>
  annotaCondizioni(props.text, getConditions(props.variant), locale.value))

/** Id della condizione aperta, se ce n'è una. Una sola alla volta. */
const aperta = ref('')
const condizioneAperta = computed(() =>
  segmenti.value.find(s => s.condizione?.id === aperta.value)?.condizione)

// Il pannello è uno solo, sotto il paragrafo: niente popover da posizionare,
// niente `title` — che con la tastiera non si apre e sul touch nemmeno.
function apriChiudi(id: string) {
  aperta.value = aperta.value === id ? '' : id
}

const idPannello = `cond-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <span :class="textClass">
    <template v-for="(segmento, i) in segmenti" :key="i">
      <button
        v-if="segmento.condizione"
        type="button"
        class="underline decoration-dotted underline-offset-2 text-amber-400 hover:text-amber-300 cursor-pointer"
        :aria-expanded="aperta === segmento.condizione.id"
        :aria-controls="aperta === segmento.condizione.id ? idPannello : undefined"
        :aria-label="t('conditions.explain', { name: segmento.testo })"
        @click="apriChiudi(segmento.condizione.id)"
      >{{ segmento.testo }}</button>
      <template v-else>{{ segmento.testo }}</template>
    </template>
  </span>

  <span
    v-if="condizioneAperta"
    :id="idPannello"
    role="note"
    class="block mt-1 mb-2 bg-stone-800 border border-amber-700/40 rounded p-2 text-xs text-stone-300"
  >
    <span class="block font-semibold text-amber-400">
      {{ locale === 'it' ? condizioneAperta.nameIt : condizioneAperta.name }}
    </span>

    <span v-if="condizioneAperta.descriptionIt" class="block mt-1">
      {{ condizioneAperta.descriptionIt }}
    </span>
    <!-- Niente corsivo: quelle facce del carattere non sono precaricate per
         l'offline (`src/vite-config.test.ts`). L'assenza si segnala col colore. -->
    <span v-else class="block mt-1 text-stone-400">
      {{ t('conditions.noText') }}
    </span>

    <!-- Nota redazionale: non è dell'SRD, e si vede che non lo è. -->
    <span
      v-if="condizioneAperta.note"
      class="block mt-2 pt-2 border-t border-stone-600 text-stone-400"
    >
      <strong class="text-stone-300">{{ t('conditions.editorialNote') }}</strong>
      {{ condizioneAperta.note }}
    </span>

    <span class="block mt-2 text-[0.65rem] text-stone-500">
      {{ t(variant === 'dnd2024' ? 'conditions.source2024' : 'conditions.source2014') }}
      <!-- Il testo delle condizioni esiste solo nell'edizione italiana
           dell'SRD: nell'interfaccia inglese va detto, non nascosto. -->
      <template v-if="locale !== 'it' && condizioneAperta.descriptionIt">
        {{ t('conditions.italianOnly') }}
      </template>
    </span>
  </span>
</template>
