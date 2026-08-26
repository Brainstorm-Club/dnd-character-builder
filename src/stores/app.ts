import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Elenco delle varianti di gioco. Unica fonte di verità: le liste bianche di
 * `importJson` e di ShareView leggono da qui, così una quinta variante non
 * resta fuori da metà dell'app come era successo a 'dnd2024'.
 */
export const GAME_VARIANTS = ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse'] as const

export type GameVariant = typeof GAME_VARIANTS[number]
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * Ordine dei passi del wizard. Le Caratteristiche vengono prima della Razza
 * perché lì si sceglie il livello di partenza, da cui dipendono le sottoclassi.
 * Unica fonte di verità: BuilderView e StepNavigation leggono da qui.
 */
export const STEP_KEYS = [
  'variant', 'abilities', 'race', 'class', 'background',
  'equipment', 'spells', 'details', 'review',
] as const

/**
 * I soli campi da cui dipende il diritto di stare su un passo. Tipo strutturale
 * e non `CharacterData` per non far dipendere questo store da quello del
 * personaggio, che invece dipende da questo.
 */
export interface StepProgress {
  variant?: string
  race?: string
  className?: string
  background?: string
}

/**
 * Ultimo passo che il personaggio ha il diritto di occupare. Ricalca i
 * requisiti di `isCurrentStepValid` in BuilderView: quelli governano
 * l'avanzamento, questo governa il rientro dopo un ricaricamento.
 */
export function furthestAllowedStep(c: StepProgress): number {
  if (!c.variant) return 0
  if (!c.race) return 2
  if (!c.className) return 3
  if (!c.background) return 4
  return STEP_KEYS.length - 1
}

export const useAppStore = defineStore('app', () => {
  const locale = ref<string>(navigator.language.startsWith('it') ? 'it' : 'en')
  const currentStep = ref(0)
  const totalSteps = ref(STEP_KEYS.length)
  const theme = ref<ThemeMode>('auto')
  /**
   * Si sta ricopiando una scheda che esiste già invece di crearne una da zero.
   * Non cambia i dati del personaggio: cambia solo cosa il generatore propone
   * per primo, cioè i punteggi da scrivere invece dei dadi da tirare.
   */
  const transcribing = ref(false)

  function setLocale(lang: string) {
    locale.value = lang
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode
  }

  function setStep(step: number) {
    currentStep.value = step
  }

  /** Entra (o esce) dalla trascrizione di una scheda già esistente. */
  function setTranscribing(on: boolean) {
    transcribing.value = on
  }

  function nextStep() {
    if (currentStep.value < totalSteps.value - 1) {
      currentStep.value++
    }
  }

  function prevStep() {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  function resetSteps() {
    currentStep.value = 0
  }

  /**
   * Riporta il passo entro quello che il personaggio consente. Serve al
   * rientro: `currentStep` viene ripescato dall'archivio, e senza questo
   * controllo un archivio con "passo 8" e un personaggio svuotato a mano
   * riapriva il riepilogo di una scheda inesistente.
   */
  function clampStepToProgress(c: StepProgress) {
    const limit = furthestAllowedStep(c)
    if (currentStep.value > limit) currentStep.value = limit
  }

  return {
    locale, currentStep, totalSteps, theme, transcribing,
    setLocale, setTheme, setStep, setTranscribing, nextStep, prevStep, resetSteps, clampStepToProgress,
  }
}, {
  persist: {
    // `currentStep` è persistito perché ricaricando la pagina si tornava al
    // primo passo pur avendo ancora il personaggio in corso. `transcribing`
    // sta con lui: il personaggio in corso sopravvive al ricaricamento, e
    // ritrovarsi il tiro di dadi al posto dei campi da riempire a metà
    // trascrizione sarebbe la stessa perdita di contesto.
    pick: ['locale', 'theme', 'currentStep', 'transcribing'],
  },
})
