import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import { preloadVariantData, ensureSpellData } from '@/data'
import type { GameVariant } from '@/stores/app'
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

interface MountOpts {
  variant?: GameVariant
  className?: string
  ability?: string
  level?: number
}

async function mountStep(opts: MountOpts = {}) {
  const variant = opts.variant ?? 'dnd5e'
  const className = opts.className ?? 'wizard'
  const store = useCharacterStore()
  store.character.variant = variant
  store.character.className = className
  store.character.spellcastingClass = className
  store.character.spellcastingAbility = (opts.ability ?? 'int') as typeof store.character.spellcastingAbility
  store.character.level = opts.level ?? 3
  const wrapper = mount(Step7Spells, {
    global: { plugins: [i18n] },
    attachTo: document.body, // il fuoco reale serve: i test lo verificano
  })
  await ensureSpellData(variant)
  await wrapper.vm.$nextTick()
  await wrapper.vm.$nextTick()
  return { store, wrapper }
}

/** Il gruppo degli incantesimi di livello, etichettato dal suo titolo. */
const SPELL_GROUP = '[role="group"][aria-labelledby="spells-known-heading"]'

let wrapper: VueWrapper | null = null

describe('passo incantesimi', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
    await preloadVariantData('dnd2024')
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
    const rows = w.findAll(`${SPELL_GROUP} > div > button[aria-pressed]`)
    expect(rows.length).toBeGreaterThan(0)
    await rows[0]!.trigger('click')
    expect(store.character.spellsKnown.length).toBe(before + 1)
  })

  // Il passo leggeva sempre le classi del 2014: un bardo del 2024 (che nel suo
  // manuale prepara gli incantesimi) usciva con la tabella «conosciuti» del
  // 2014, e la lista arrivava dagli incantesimi del 2014.
  describe('il passo segue la variante scelta', () => {
    it('il bardo del 2014 conosce gli incantesimi e mostra il suo numero', async () => {
      const mounted = await mountStep({ className: 'bard', ability: 'cha', level: 5 })
      wrapper = mounted.wrapper
      const heading = mounted.wrapper.get('#spells-known-heading').text()
      expect(heading).toContain('spells.knownSpells')
      // Tabella del bardo 2014: 8 incantesimi conosciuti al 5° livello.
      expect(heading).toContain('/8')
    })

    it('il bardo del 2024 prepara gli incantesimi, non li conosce', async () => {
      const mounted = await mountStep({ variant: 'dnd2024', className: 'bard', ability: 'cha', level: 5 })
      wrapper = mounted.wrapper
      const heading = mounted.wrapper.get('#spells-known-heading').text()
      expect(heading).toContain('spells.preparedSpells')
      expect(heading).not.toContain('spells.knownSpells')
    })

    it('nel 2024 stampa il numero della colonna «Incantesimi preparati», non quello del 2014', async () => {
      const mounted = await mountStep({ variant: 'dnd2024', className: 'bard', ability: 'cha', level: 5 })
      wrapper = mounted.wrapper
      const heading = mounted.wrapper.get('#spells-known-heading').text()
      expect(heading).toContain('/9') // tabella del bardo 2024 al 5° livello
      expect(heading).not.toContain('/8') // conteggio del bardo 2014
      expect(heading).not.toContain('/—')
    })

    it('il tetto del 2024 vale davvero: il decimo incantesimo del bardo è inerte', async () => {
      const { store, wrapper: w } = await mountStep({ variant: 'dnd2024', className: 'bard', ability: 'cha', level: 5 })
      wrapper = w
      const rows = w.findAll(`${SPELL_GROUP} > div > button[aria-pressed]`)
      expect(rows.length).toBeGreaterThan(9)
      for (let i = 0; i < 9; i++) await rows[i]!.trigger('click')
      expect(store.character.spellsKnown.length).toBe(9)
      expect(rows[9]!.attributes('aria-disabled')).toBe('true')
      await rows[9]!.trigger('click')
      expect(store.character.spellsKnown.length).toBe(9)
    })

    it('il mago del 2024 al 14° livello segue la sua colonna, non quella degli altri', async () => {
      // 18 preparati: gli altri incantatori pieni ne hanno 17 allo stesso
      // livello, e il conto 2014 (INT +0) ne darebbe 14.
      const mounted = await mountStep({ variant: 'dnd2024', className: 'wizard', ability: 'int', level: 14 })
      wrapper = mounted.wrapper
      const heading = mounted.wrapper.get('#spells-known-heading').text()
      expect(heading).toContain('/18')
    })

    it('un tiro esplicito rimette un tetto anche nel 2024', async () => {
      const { store, wrapper: w } = await mountStep({ variant: 'dnd2024', className: 'bard', ability: 'cha', level: 5 })
      wrapper = w
      store.character.spellsKnownLimit = 2
      await w.vm.$nextTick()
      expect(w.get('#spells-known-heading').text()).toContain('/2')
      const rows = w.findAll(`${SPELL_GROUP} > div > button[aria-pressed]`)
      for (let i = 0; i < 3; i++) await rows[i]!.trigger('click')
      expect(store.character.spellsKnown.length).toBe(2)
    })

    it('nel 2024 il guerriero non riceve gli slot del terzo incantatore del 2014', async () => {
      // Nei dati del 2024 non ci sono Cavaliere Mistico né Furfante Arcano.
      const mounted = await mountStep({ variant: 'dnd2024', className: 'fighter', ability: 'int', level: 5 })
      wrapper = mounted.wrapper
      const summary = mounted.wrapper.get('[role="region"]').text()
      expect(summary).not.toContain('«liv»1:')
    })

    it('carica i dati del 2024 da sé: la lista non resta vuota né ricade sul 2014', async () => {
      const mounted = await mountStep({ variant: 'dnd2024', className: 'wizard', ability: 'int', level: 3 })
      wrapper = mounted.wrapper
      const rows = mounted.wrapper.findAll(`${SPELL_GROUP} > div > button[aria-pressed]`)
      expect(rows.length).toBeGreaterThan(0)
    })
  })
})
