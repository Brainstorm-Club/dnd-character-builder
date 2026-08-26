import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import HomeView from './HomeView.vue'
import { useAppStore } from '@/stores/app'
import { useCharacterStore } from '@/stores/character'
import { preloadVariantData } from '@/data'

const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  RouterLink: { template: '<a><slot /></a>' },
}))

// Messaggi vuoti: le chiavi vengono rese com'è, quindi i pulsanti delle card
// leggono 'home.newFrom', 'home.copySheet', 'home.randomButton'.
const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

function mountHome() {
  return mount(HomeView, {
    global: { plugins: [i18n], stubs: { 'router-link': { template: '<a><slot /></a>' } } },
  })
}

/** I pulsanti della card di una variante, riconosciuta dal suo titolo. */
function card(wrapper: ReturnType<typeof mountHome>, variant: string) {
  return wrapper.findAll('article')
    .find(a => a.text().includes(`variant.${variant}`))!
}

function button(wrapper: ReturnType<typeof mountHome>, variant: string, key: string) {
  return card(wrapper, variant).findAll('button').find(b => b.text().includes(key))!
}

/**
 * Il pulsante che apre la trascrizione di una scheda già esistente. Senza un
 * ingresso in home l'unica strada era "Da Zero" e poi scavalcare a mano il
 * metodo delle caratteristiche, a ogni scheda.
 */
describe('home — ricopia una scheda', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockClear()
  })

  it('ogni variante lo offre accanto a "Da Zero"', () => {
    const wrapper = mountHome()
    const varianti = ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse']
    for (const v of varianti) {
      expect(button(wrapper, v, 'home.copySheet'), v).toBeDefined()
      expect(button(wrapper, v, 'home.newFrom'), v).toBeDefined()
    }
  })

  it('apre il builder sulla variante scelta, in modalità trascrizione', async () => {
    const wrapper = mountHome()
    const app = useAppStore()
    const chars = useCharacterStore()

    await button(wrapper, 'dnd5e', 'home.copySheet').trigger('click')
    await new Promise(r => setTimeout(r, 0))

    expect(chars.character.variant).toBe('dnd5e')
    expect(app.transcribing).toBe(true)
    // Passo 1 = Caratteristiche: la variante è già scelta dalla card
    expect(app.currentStep).toBe(1)
    expect(push).toHaveBeenCalledWith('/builder')
  })

  it('"Da Zero" resta la creazione normale e spegne la trascrizione', async () => {
    const wrapper = mountHome()
    const app = useAppStore()
    app.setTranscribing(true)

    await button(wrapper, 'dnd5e', 'home.newFrom').trigger('click')
    await new Promise(r => setTimeout(r, 0))

    expect(app.transcribing).toBe(false)
    expect(app.currentStep).toBe(1)
  })

  it('il personaggio casuale non è una scheda da ricopiare', async () => {
    const wrapper = mountHome()
    const app = useAppStore()
    app.setTranscribing(true)

    await button(wrapper, 'dnd5e', 'home.randomButton').trigger('click')
    await new Promise(r => setTimeout(r, 0))

    expect(app.transcribing).toBe(false)
  })

  it('nemmeno un JSON importato lo è', async () => {
    const wrapper = mountHome()
    const app = useAppStore()
    app.setTranscribing(true)

    await button(wrapper, 'dnd5e', 'home.importJson').trigger('click')

    expect(app.transcribing).toBe(false)
  })
})
