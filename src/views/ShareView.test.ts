import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import { h } from 'vue'
import ShareView from './ShareView.vue'
import { useCharacterStore } from '@/stores/character'
import { encodeCharacterToUrl } from '@/utils/shareCharacter'
import { generateRandomCharacter } from '@/utils/randomCharacter'
import { preloadVariantData } from '@/data'
import { GAME_VARIANTS } from '@/stores/app'

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

const Blank = { render: () => h('div') }

async function openShareLink(encoded: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/share/:data', component: ShareView },
      { path: '/builder', component: Blank },
      { path: '/', component: Blank },
    ],
  })
  router.push(`/share/${encoded}`)
  await router.isReady()
  const wrapper = mount(ShareView, { global: { plugins: [i18n, router] } })
  await flushPromises()
  return wrapper
}

describe('apertura di un link di condivisione', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of GAME_VARIANTS) await preloadVariantData(v)
  })

  beforeEach(() => setActivePinia(createPinia()))

  /**
   * Impedisce il ritorno del difetto per cui la lista bianca delle varianti
   * di ShareView si era fermata a tre: il link di un personaggio del 2024
   * finiva sulla pagina d'errore invece che nel riepilogo.
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: il personaggio condiviso viene caricato`, async () => {
      const char = generateRandomCharacter(variant)
      char.name = 'Condiviso'
      const wrapper = await openShareLink(encodeCharacterToUrl(char))

      const store = useCharacterStore()
      expect(store.character.variant, `${variant}: variante rifiutata`).toBe(variant)
      expect(store.character.name).toBe('Condiviso')
      expect(wrapper.text(), `${variant}: mostrata la pagina d'errore`).not.toContain('share.error')
    })
  }

  /**
   * ShareView chiamava `resetCharacter()` prima ancora di disegnare qualcosa:
   * aprire un link condiviso cancellava il personaggio in costruzione senza
   * che nessuno avesse chiesto niente.
   */
  it('con lavoro non salvato chiede prima di sovrascrivere', async () => {
    setActivePinia(createPinia())
    const store = useCharacterStore()
    store.character.name = 'Mio'
    store.character.race = 'human'
    store.character.className = 'fighter'

    const shared = generateRandomCharacter('dnd5e')
    shared.name = 'Condiviso'
    const wrapper = await openShareLink(encodeCharacterToUrl(shared))

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true)
    expect(store.character.name).toBe('Mio')
    expect(store.character.race).toBe('human')

    await wrapper.findAll('[role="alertdialog"] button')[0]!.trigger('click')
    await flushPromises()
    expect(store.character.name).toBe('Condiviso')
  })

  it('annullando, il personaggio in corso resta intatto', async () => {
    setActivePinia(createPinia())
    const store = useCharacterStore()
    store.character.name = 'Mio'
    store.character.race = 'human'

    const shared = generateRandomCharacter('dnd5e')
    shared.name = 'Condiviso'
    const wrapper = await openShareLink(encodeCharacterToUrl(shared))
    await wrapper.findAll('[role="alertdialog"] button')[1]!.trigger('click')
    await flushPromises()

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(store.character.name).toBe('Mio')
    expect(store.character.race).toBe('human')
  })

  it('un link con una variante sconosciuta resta un errore', async () => {
    const char = generateRandomCharacter('dnd5e')
    const encoded = encodeCharacterToUrl({ ...char, variant: 'pathfinder' as never })
    const wrapper = await openShareLink(encoded)
    expect(wrapper.text()).toContain('share.error')
  })
})
