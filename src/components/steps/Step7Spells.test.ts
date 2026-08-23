import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import { preloadVariantData, ensureSpellData } from '@/data'
import Step7Spells from './Step7Spells.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  // Le poche etichette che i test leggono davvero; il resto rende la chiave.
  messages: {
    en: {
      common: { close: 'Close', level: 'Level' },
      // Sentinelle al posto di "Lv." e "slot": se il template tornasse a
      // scriverli a mano il confronto qui sotto fallirebbe.
      spells: { levelShort: '«liv»', slots: '«slot»', showDetail: '{name} details' },
    },
  },
  missingWarn: false,
  fallbackWarn: false,
})

async function mountStep() {
  const store = useCharacterStore()
  store.character.variant = 'dnd5e'
  store.character.className = 'wizard'
  store.character.spellcastingClass = 'wizard'
  store.character.spellcastingAbility = 'int'
  store.character.level = 3
  const wrapper = mount(Step7Spells, {
    global: { plugins: [i18n] },
    attachTo: document.body, // il fuoco reale serve: i test lo verificano
  })
  await ensureSpellData('dnd5e')
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  return { store, wrapper }
}

let wrapper: VueWrapper | null = null

describe('passo incantesimi', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
    await ensureSpellData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => { wrapper?.unmount(); wrapper = null })

  it('offre un pulsante di dettaglio per ogni incantesimo, non solo il tasto destro', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    const detailButtons = wrapper.findAll('button[aria-label$="details"]')
    // Un pulsante per trucchetto + uno per incantesimo di livello.
    expect(detailButtons.length).toBeGreaterThan(0)
    for (const b of detailButtons) expect(b.attributes('aria-label')).toBeTruthy()
  })

  it('non annida il pulsante di dettaglio dentro quello di selezione', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    // Un <button> dentro un <button> è markup non valido: il browser lo
    // riscrive e il comando interno smette di funzionare.
    expect(wrapper.element.querySelector('button button')).toBeNull()
  })

  it('apre il dettaglio da tastiera e ci porta dentro il fuoco', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    const detail = wrapper.findAll('button[aria-label$="details"]')[0]!
    ;(detail.element as HTMLElement).focus()
    await detail.trigger('click')
    await wrapper.vm.$nextTick()

    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(document.activeElement).toBe(dialog.element)
  })

  it('Esc chiude il dettaglio e riporta il fuoco dove era', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    const detail = wrapper.findAll('button[aria-label$="details"]')[0]!
    const opener = detail.element as HTMLElement
    opener.focus()
    await detail.trigger('click')
    await wrapper.vm.$nextTick()

    await wrapper.get('[role="dialog"]').trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(opener)
  })

  it('il pulsante di chiusura riporta il fuoco sull’apritore', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    const detail = wrapper.findAll('button[aria-label$="details"]')[0]!
    const opener = detail.element as HTMLElement
    opener.focus()
    await detail.trigger('click')
    await wrapper.vm.$nextTick()

    await wrapper.get('[role="dialog"] button[aria-label="Close"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(opener)
  })

  it('trattiene il Tab dentro il riquadro modale', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    const detail = wrapper.findAll('button[aria-label$="details"]')[0]!
    ;(detail.element as HTMLElement).focus()
    await detail.trigger('click')
    await wrapper.vm.$nextTick()

    const dialog = wrapper.get('[role="dialog"]')
    const close = dialog.get('button').element as HTMLElement
    close.focus()
    // La chiusura è l'unico comando: da lì il Tab deve tornare su se stesso,
    // non finire sulla lista sotto, che è inerte.
    await dialog.trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(close)
  })

  it('il dialogo porta ruolo e tabindex sul riquadro, non sullo sfondo', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    const detail = wrapper.findAll('button[aria-label$="details"]')[0]!
    await detail.trigger('click')
    await wrapper.vm.$nextTick()
    const dialog = wrapper.get('[role="dialog"]')
    expect(dialog.attributes('tabindex')).toBe('-1')
    // Lo sfondo scuro non deve essere lui il dialogo: cliccandolo si chiude.
    expect(dialog.classes()).not.toContain('fixed')
  })

  it('traduce le etichette dei livelli e degli slot invece di scriverle a mano', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    const summary = wrapper.get('[role="region"]').text()
    expect(summary).toContain('«liv»1:')
    expect(summary).toContain('«slot»')
  })

  it('nel dettaglio usa l’etichetta di livello semplice, non quella parametrica', async () => {
    const mounted = await mountStep()
    wrapper = mounted.wrapper
    const detail = wrapper.findAll('button[aria-label$="details"]')[0]!
    await detail.trigger('click')
    await wrapper.vm.$nextTick()
    const text = wrapper.get('[role="dialog"]').text()
    // spells.level è "Level {level}": senza parametro stampava un'etichetta monca.
    expect(text).toContain('Level:')
    expect(text).not.toContain('{level}')
  })

  it('selezionare un incantesimo continua a funzionare accanto al nuovo pulsante', async () => {
    const { store, wrapper: w } = await mountStep()
    wrapper = w
    const before = store.character.spellsKnown.length
    const rows = w.findAll('[aria-label="spells.knownSpells"] > div > button[aria-pressed]')
    expect(rows.length).toBeGreaterThan(0)
    await rows[0]!.trigger('click')
    expect(store.character.spellsKnown.length).toBe(before + 1)
  })
})
