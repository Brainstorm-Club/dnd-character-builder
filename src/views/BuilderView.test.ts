import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import BuilderView from './BuilderView.vue'
import { useAppStore } from '@/stores/app'
import { useCharacterStore } from '@/stores/character'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

async function mountBuilder() {
  const wrapper = mount(BuilderView, {
    global: {
      plugins: [i18n],
      // I passi sono componenti asincroni con dati propri: qui interessa solo
      // la cornice, cioè la barra di navigazione in fondo.
      stubs: { StepNavigation: true },
    },
  })
  await flushPromises()
  return wrapper
}

/** I due pulsanti della barra in fondo, nell'ordine indietro/avanti. */
function navButtons(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('nav button')
}

describe('cornice del generatore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('usa .bsc-btn sul pulsante avanti, con l\'oro dell\'app e non il rosso del DS', async () => {
    const wrapper = await mountBuilder()
    const next = navButtons(wrapper)[0]!
    expect(next.classes()).toContain('bsc-btn')
    expect(next.classes()).toContain('bg-amber-600')
    // Il bordo da 2px di .bsc-btn va tinto insieme al fondo, altrimenti
    // resta rosso mattone attorno a un pulsante d'oro.
    expect(next.classes()).toContain('border-amber-600')
  })

  it('al passaggio del mouse il pulsante avanti resta d\'oro anche da non valido', async () => {
    // Passo della stirpe senza stirpe scelta: non è valido. Senza un hover:bg
    // esplicito il :hover di .bsc-btn lo colorerebbe di rosso mattone.
    const characterStore = useCharacterStore()
    characterStore.character.variant = 'dnd5e'
    characterStore.character.race = ''
    useAppStore().currentStep = 2
    const wrapper = await mountBuilder()
    const next = navButtons(wrapper)[1]!
    expect(next.classes()).toContain('opacity-60')
    expect(next.classes()).toContain('hover:bg-amber-600')
  })

  it('usa .bsc-btn sul pulsante indietro conservando le etichette accessibili', async () => {
    const characterStore = useCharacterStore()
    characterStore.character.variant = 'dnd5e'
    const appStore = useAppStore()
    appStore.currentStep = 2
    const wrapper = await mountBuilder()

    const [back, next] = navButtons(wrapper)
    expect(back!.classes()).toContain('bsc-btn')
    expect(back!.classes()).toContain('bg-stone-700')
    expect(back!.attributes('aria-label')).toBeTruthy()
    expect(next!.attributes('aria-label')).toBeTruthy()
    expect(next!.attributes('aria-disabled')).toBeDefined()
  })
})
