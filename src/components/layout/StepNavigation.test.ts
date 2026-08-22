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

  it('non disturba se il personaggio è appena iniziato', async () => {
    const store = useCharacterStore()
    store.character.variant = 'dnd5e'

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    await wrapper.findAll('button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(push).toHaveBeenCalledWith('/')
  })

  it('non disturba se il personaggio è già salvato', async () => {
    const store = useCharacterStore()
    store.character.variant = 'dnd5e'
    store.character.race = 'human'
    store.character.name = 'Test'
    store.savedCharacters.push({ ...store.character })

    const wrapper = mount(StepNavigation, { global: { plugins: [i18n] } })
    await wrapper.findAll('button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(push).toHaveBeenCalledWith('/')
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
