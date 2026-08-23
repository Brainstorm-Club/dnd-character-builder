import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import StepNavigation from './StepNavigation.vue'
import { useCharacterStore } from '@/stores/character'
import { useAppStore } from '@/stores/app'

const push = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

describe('barra dei passi', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockClear()
  })

  it('chiede conferma prima di scartare un personaggio non salvato', async () => {
    const store = useCharacterStore()
    store.character.variant = 'brancalonia'
    store.character.race = 'morgant'
    store.character.className = 'barbarian'

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    await wrapper.findAll('button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    // primo clic: avverte e non tocca nulla
    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true)
    expect(push).not.toHaveBeenCalled()
    expect(store.character.race).toBe('morgant')

    // conferma: scarta e va in home
    const confirm = wrapper.findAll('[role="alertdialog"] button')[0]!
    await confirm.trigger('click')
    await wrapper.vm.$nextTick()
    expect(push).toHaveBeenCalledWith('/')
    expect(store.character.race).toBe('')
  })

  /**
   * La conferma era condizionata a `hasUnsavedWork()`, che è falsa per tutta
   * la prima metà del percorso: variante, caratteristiche e livello scelti
   * sparivano al primo clic sul pallino «1» senza una parola.
   */
  it('chiede conferma anche a personaggio appena iniziato', async () => {
    const store = useCharacterStore()
    const app = useAppStore()
    store.character.variant = 'brancalonia'
    store.character.abilityScores.str = 17
    store.character.level = 4
    app.setStep(1)

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    await wrapper.findAll('button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true)
    expect(push).not.toHaveBeenCalled()
    expect(store.character.abilityScores.str).toBe(17)
    expect(store.character.level).toBe(4)
  })

  it('chiede conferma anche se il personaggio è già salvato', async () => {
    const store = useCharacterStore()
    store.character.variant = 'dnd5e'
    store.character.race = 'human'
    store.character.name = 'Test'
    store.savedCharacters.push({ ...store.character })

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    await wrapper.findAll('button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true)
    expect(push).not.toHaveBeenCalled()
  })

  it('annullando la conferma non si perde niente', async () => {
    const store = useCharacterStore()
    store.character.variant = 'dnd5e'
    store.character.race = 'human'

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    await wrapper.findAll('button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('[role="alertdialog"] button')[1]!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(push).not.toHaveBeenCalled()
    expect(store.character.race).toBe('human')
  })

  /**
   * `currentStep` viene ripescato dal localStorage: senza il riallineamento
   * all'ingresso si rientrava nel riepilogo di un personaggio che non ha
   * ancora una classe, perché il wizard controlla i requisiti solo in avanti.
   */
  it('al rientro riporta il passo al primo non completato', () => {
    const store = useCharacterStore()
    const app = useAppStore()
    store.character.variant = 'dnd5e'
    app.setStep(8)

    mount(StepNavigation, { global: { plugins: [i18n] } })

    expect(app.currentStep).toBe(2)
  })

  it('al rientro lascia stare un passo che il personaggio si è guadagnato', () => {
    const store = useCharacterStore()
    const app = useAppStore()
    store.character.variant = 'dnd5e'
    store.character.race = 'human'
    store.character.className = 'fighter'
    store.character.background = 'soldier'
    app.setStep(8)

    mount(StepNavigation, { global: { plugins: [i18n] } })

    expect(app.currentStep).toBe(8)
  })

  /**
   * Il numero del passo non raggiunto era stone-500 su stone-700: 2,87:1.
   * Su mobile è l'unico contenuto del pulsante, perché l'etichetta è nascosta.
   */
  it('i passi non raggiunti hanno un numero leggibile', () => {
    const app = useAppStore()
    app.setStep(0)

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    const badge = wrapper.findAll('li')[3]!.find('span')

    expect(badge.classes()).not.toContain('text-stone-500')
    expect(badge.classes()).toContain('text-stone-300')
  })

  it('sotto sm resta visibile almeno l\'etichetta del passo corrente', () => {
    const app = useAppStore()
    app.setStep(3)

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    const labels = wrapper.findAll('button > span:nth-child(2)')

    expect(labels[3]!.classes()).toContain('inline')
    expect(labels[3]!.classes()).not.toContain('hidden')
    expect(labels[4]!.classes()).toContain('hidden')
  })

  it('il passo Variante riporta alla home e azzera il personaggio', async () => {
    const store = useCharacterStore()
    const app = useAppStore()
    store.character.variant = 'brancalonia'
    store.character.race = 'morgant'
    store.character.className = 'barbarian'
    store.character.level = 5
    store.character.spellsKnown = ['3-fireball']
    app.setStep(6)

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    await wrapper.findAll('button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('[role="alertdialog"] button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    // Restando nel wizard, riscegliere la stessa variante non azzerava nulla:
    // razza, classe e incantesimi sopravvivevano al "ricominciare".
    expect(push).toHaveBeenCalledWith('/')
    expect(store.character.race).toBe('')
    expect(store.character.className).toBe('')
    expect(store.character.level).toBe(1)
    expect(store.character.spellsKnown).toEqual([])
    expect(app.currentStep).toBe(0)
  })

  it('gli altri passi restano nel wizard', async () => {
    const store = useCharacterStore()
    const app = useAppStore()
    store.character.variant = 'dnd5e'
    store.character.race = 'human'

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    await wrapper.findAll('button')[2]!.trigger('click')
    // goToStep carica i dati della variante prima di spostarsi: lascia
    // risolvere le promesse in coda
    await vi.waitFor(() => expect(app.currentStep).toBe(2))

    expect(push).not.toHaveBeenCalled()
    expect(store.character.race).toBe('human')
  })
})
