import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { useAppStore, furthestAllowedStep } from './app'

/** Archivio finto: in jsdom `localStorage` non è pilotabile dai test. */
function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v) },
    removeItem: (k: string) => { data.delete(k) },
  } as unknown as Storage
}

/**
 * Simula un caricamento della pagina. L'app Vue finta serve perché Pinia
 * tiene i plugin in coda finché non viene installata su un'app: senza,
 * `pinia.use()` non ha alcun effetto e il test non proverebbe niente.
 */
function reload(storage: Storage) {
  const pinia = createPinia()
  pinia.use(createPersistedState({ storage }))
  createApp({}).use(pinia)
  setActivePinia(pinia)
}

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with step 0 and 9 total steps', () => {
    const store = useAppStore()
    expect(store.currentStep).toBe(0)
    expect(store.totalSteps).toBe(9)
  })

  it('navigates forward through steps', () => {
    const store = useAppStore()
    store.nextStep()
    expect(store.currentStep).toBe(1)
    store.nextStep()
    expect(store.currentStep).toBe(2)
  })

  it('does not exceed max steps', () => {
    const store = useAppStore()
    store.setStep(8) // last step (0-indexed)
    store.nextStep()
    expect(store.currentStep).toBe(8) // stays at 8
  })

  it('navigates backward', () => {
    const store = useAppStore()
    store.setStep(3)
    store.prevStep()
    expect(store.currentStep).toBe(2)
  })

  it('does not go below step 0', () => {
    const store = useAppStore()
    store.prevStep()
    expect(store.currentStep).toBe(0)
  })

  it('resets steps to 0', () => {
    const store = useAppStore()
    store.setStep(5)
    store.resetSteps()
    expect(store.currentStep).toBe(0)
  })

  it('sets locale', () => {
    const store = useAppStore()
    store.setLocale('en')
    expect(store.locale).toBe('en')
    store.setLocale('it')
    expect(store.locale).toBe('it')
  })

  /**
   * Il passo non era persistito: ricaricare la pagina a metà procedura
   * riportava al primo passo mentre il personaggio restava dov'era.
   */
  it('il passo sopravvive a un ricaricamento', async () => {
    const storage = memoryStorage()
    reload(storage)
    useAppStore().setStep(5)
    await nextTick()

    reload(storage)
    expect(useAppStore().currentStep).toBe(5)
  })

  describe('riallineamento del passo al personaggio', () => {
    it('senza variante non si va oltre il primo passo', () => {
      expect(furthestAllowedStep({})).toBe(0)
    })

    it('la variante da sola arriva fino alla razza', () => {
      expect(furthestAllowedStep({ variant: 'dnd5e' })).toBe(2)
    })

    it('con razza si arriva alla classe, con classe al background', () => {
      expect(furthestAllowedStep({ variant: 'dnd5e', race: 'human' })).toBe(3)
      expect(furthestAllowedStep({ variant: 'dnd5e', race: 'human', className: 'fighter' })).toBe(4)
    })

    it('completo si arriva al riepilogo', () => {
      expect(furthestAllowedStep({
        variant: 'dnd5e', race: 'human', className: 'fighter', background: 'soldier',
      })).toBe(8)
    })

    it('abbassa un passo ripescato troppo avanti', () => {
      const store = useAppStore()
      store.setStep(8)
      store.clampStepToProgress({ variant: 'dnd5e' })
      expect(store.currentStep).toBe(2)
    })

    it('non sposta in avanti chi è indietro di suo', () => {
      const store = useAppStore()
      store.setStep(1)
      store.clampStepToProgress({
        variant: 'dnd5e', race: 'human', className: 'fighter', background: 'soldier',
      })
      expect(store.currentStep).toBe(1)
    })
  })

  it('sets theme', () => {
    const store = useAppStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
    store.setTheme('light')
    expect(store.theme).toBe('light')
    store.setTheme('auto')
    expect(store.theme).toBe('auto')
  })
})
