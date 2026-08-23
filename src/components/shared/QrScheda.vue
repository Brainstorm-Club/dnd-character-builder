<script setup lang="ts">
/**
 * Il pannello che mostra la scheda come QR code.
 *
 * Il codice non si costruisce all'apertura della pagina: il modulo che lo
 * disegna pesa piu' di tutto il resto del passo finale, e la maggior parte
 * di chi arriva qui esporta il PDF e se ne va. Si carica al primo clic.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CharacterData } from '@/stores/character'
import { creaQrScheda, type QrScheda } from '@/utils/qrScheda'

const props = defineProps<{ char: CharacterData }>()
const { t } = useI18n()

const qr = ref<QrScheda | null>(null)
const errore = ref<string | null>(null)
const inCorso = ref(false)
const aperto = ref(false)

async function mostra() {
  if (qr.value) { aperto.value = true; return }
  inCorso.value = true
  errore.value = null
  try {
    qr.value = await creaQrScheda(props.char)
    aperto.value = true
  } catch (e) {
    const codice = (e as Error).message
    errore.value = codice === 'QR_NO_COMPRESSION' ? t('review.qrNoSupport') : t('review.qrTooLarge')
    aperto.value = true
  } finally {
    inCorso.value = false
  }
}

function chiudi() {
  aperto.value = false
}

/**
 * Salva il disegno come file.
 *
 * L'SVG e' testo, quindi basta un Blob: nessuna tela, nessun raster, e il
 * file si stampa nitido a qualunque misura.
 */
function scarica() {
  if (!qr.value) return
  const blob = new Blob([qr.value.svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(props.char.name || 'personaggio').replace(/[^\w-]+/g, '_')}-qr.svg`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <button
    type="button"
    class="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg transition-colors cursor-pointer"
    :disabled="inCorso"
    :aria-expanded="aperto"
    aria-controls="pannello-qr"
    @click="aperto ? chiudi() : mostra()"
  >
    <span aria-hidden="true">&#x1F4F1;</span>
    {{ inCorso ? t('common.loading') : t('review.qrCode') }}
  </button>

  <div
    v-if="aperto"
    id="pannello-qr"
    class="w-full mt-4 bg-stone-800 border border-stone-700 rounded-xl p-6 flex flex-col items-center gap-3"
  >
    <h3 class="text-lg font-gothic font-semibold text-amber-400">{{ t('review.qrTitle') }}</h3>

    <p v-if="errore" class="text-red-300 text-sm max-w-md text-center" role="alert">{{ errore }}</p>

    <template v-else-if="qr">
      <!-- Il codice sta su fondo bianco perche' un QR invertito lo leggono in
           pochi: la cornice chiara e' parte di cio' che lo rende scansionabile,
           anche quando la pagina attorno e' scura.
           La misura non e' estetica. Un personaggio intero produce un codice di
           versione alta — trenta e passa, cioe' oltre 140 moduli per lato — e a
           256px ogni modulo cadeva sotto il pixel e mezzo: troppo fitto perche'
           una fotocamera lo agganci. A 28rem si arriva vicino ai tre pixel per
           modulo, che e' la soglia sotto cui la lettura diventa un terno al
           lotto. Chi ha bisogno di piu' nitidezza scarica l'SVG e lo stampa. -->
      <div
        class="bg-white rounded-lg p-3 w-full max-w-[28rem]"
        role="img"
        :aria-label="t('review.qrAlt', { name: char.name || '—' })"
        v-html="qr.svg"
      ></div>

      <p class="text-stone-400 text-sm max-w-md text-center leading-relaxed">{{ t('review.qrHint') }}</p>

      <p v-if="qr.ridotto" class="text-amber-300 text-sm max-w-md text-center" role="status">
        <span aria-hidden="true">&#x26A0;&#xFE0F;</span> {{ t('review.qrReduced') }}
      </p>

      <p class="text-stone-500 text-xs">
        {{ t('review.qrInfo', { version: qr.versione, bytes: qr.byte }) }}
      </p>

      <div class="flex gap-2 flex-wrap justify-center">
        <button
          type="button"
          class="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-lg text-sm transition-colors cursor-pointer"
          @click="scarica"
        >
          <span aria-hidden="true">&#x2B07;&#xFE0F;</span> {{ t('review.qrDownload') }}
        </button>
        <button
          type="button"
          class="px-4 py-2 border border-stone-600 text-stone-300 hover:text-amber-400 hover:border-amber-700/60 rounded-lg text-sm transition-colors cursor-pointer"
          @click="chiudi"
        >{{ t('review.qrClose') }}</button>
      </div>
    </template>
  </div>
</template>
