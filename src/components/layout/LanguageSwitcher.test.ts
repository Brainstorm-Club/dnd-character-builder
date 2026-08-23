import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'

const loadLocale = vi.fn(async (_code: string) => {})
vi.mock('@/i18n', () => ({ loadLocale: (code: string) => loadLocale(code) }))

const messages = {
  it: { common: { changeLanguage: 'Cambia lingua', availableLanguages: 'Lingue disponibili' } },
  en: { common: { changeLanguage: 'Change language', availableLanguages: 'Available languages' } },
}

function mountSwitcher(locale = 'it') {
  const i18n = createI18n({
    legacy: false, locale, fallbackLocale: 'en', messages,
    missingWarn: false, fallbackWarn: false,
  })
  return mount(LanguageSwitcher, {
    global: { plugins: [i18n] },
    attachTo: document.body, // il fuoco reale serve: i test lo verificano
  })
}

let wrapper: VueWrapper | null = null

describe('selettore di lingua', () => {
  beforeEach(() => loadLocale.mockClear())
  afterEach(() => { wrapper?.unmount(); wrapper = null })

  it('da chiuso non lascia il listbox nell’albero di accessibilità', () => {
    wrapper = mountSwitcher()
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('false')
  })

  it('collega il pulsante al menu con aria-controls', async () => {
    wrapper = mountSwitcher()
    const trigger = wrapper.get('button')
    await trigger.trigger('click')
    const menu = wrapper.get('[role="listbox"]')
    expect(trigger.attributes('aria-controls')).toBe(menu.attributes('id'))
    expect(menu.attributes('id')).toBeTruthy()
  })

  it('apre il menu con la freccia giù e porta il fuoco sulla lingua attiva', async () => {
    wrapper = mountSwitcher('en')
    const trigger = wrapper.get('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)
    // 'en' è la seconda voce: il menu si apre già posizionato lì.
    expect(document.activeElement).toBe(options[1]!.element)
    expect(options[1]!.attributes('tabindex')).toBe('0')
    expect(options[0]!.attributes('tabindex')).toBe('-1')
  })

  it('con la freccia su apre partendo dall’ultima voce', async () => {
    wrapper = mountSwitcher('it')
    await wrapper.get('button').trigger('keydown', { key: 'ArrowUp' })
    await wrapper.vm.$nextTick()
    const options = wrapper.findAll('[role="option"]')
    expect(document.activeElement).toBe(options[1]!.element)
  })

  it('sposta il fuoco con le frecce e gira in tondo', async () => {
    wrapper = mountSwitcher('it')
    await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    const menu = wrapper.get('[role="listbox"]')
    const options = wrapper.findAll('[role="option"]')

    await menu.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(options[1]!.element)

    await menu.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(options[0]!.element)

    await menu.trigger('keydown', { key: 'ArrowUp' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(options[1]!.element)

    await menu.trigger('keydown', { key: 'Home' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(options[0]!.element)

    await menu.trigger('keydown', { key: 'End' })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(options[1]!.element)
  })

  it('sceglie la lingua con Invio e riporta il fuoco sul pulsante', async () => {
    wrapper = mountSwitcher('it')
    const trigger = wrapper.get('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    await wrapper.get('[role="listbox"]').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    await wrapper.get('[role="listbox"]').trigger('keydown', { key: 'Enter' })
    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()

    expect(loadLocale).toHaveBeenCalledWith('en')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
  })

  it('sceglie la lingua anche con la barra spaziatrice', async () => {
    wrapper = mountSwitcher('it')
    await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    await wrapper.get('[role="listbox"]').trigger('keydown', { key: 'End' })
    await wrapper.vm.$nextTick()
    await wrapper.get('[role="listbox"]').trigger('keydown', { key: ' ' })
    await new Promise(r => setTimeout(r, 0))
    expect(loadLocale).toHaveBeenCalledWith('en')
  })

  it('Esc chiude il menu e rimette il fuoco sul pulsante', async () => {
    wrapper = mountSwitcher('it')
    const trigger = wrapper.get('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    await wrapper.get('[role="listbox"]').trigger('keydown', { key: 'Escape' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
    expect(loadLocale).not.toHaveBeenCalled()
  })

  it('Tab esce dal menu senza riprendersi il fuoco', async () => {
    wrapper = mountSwitcher('it')
    const trigger = wrapper.get('button')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.vm.$nextTick()
    await wrapper.get('[role="listbox"]').trigger('keydown', { key: 'Tab' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(document.activeElement).not.toBe(trigger.element)
  })

  it('marca la lingua corrente come selezionata', async () => {
    wrapper = mountSwitcher('en')
    await wrapper.get('button').trigger('click')
    const options = wrapper.findAll('[role="option"]')
    expect(options[0]!.attributes('aria-selected')).toBe('false')
    expect(options[1]!.attributes('aria-selected')).toBe('true')
  })

  it('etichetta pulsante e menu con le stringhe tradotte, non scritte a mano', async () => {
    // Sentinelle al posto delle traduzioni vere: se il componente tornasse a
    // scrivere "Change language" nel template il confronto fallirebbe.
    const i18n = createI18n({
      legacy: false, locale: 'en', fallbackLocale: 'en',
      messages: { en: { common: { changeLanguage: '§lingua', availableLanguages: '§elenco' } } },
      missingWarn: false, fallbackWarn: false,
    })
    wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] }, attachTo: document.body })
    const trigger = wrapper.get('button')
    expect(trigger.attributes('aria-label')).toBe('§lingua')
    await trigger.trigger('click')
    expect(wrapper.get('[role="listbox"]').attributes('aria-label')).toBe('§elenco')
  })

  it('il clic su una voce cambia lingua e chiude', async () => {
    wrapper = mountSwitcher('it')
    await wrapper.get('button').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('[role="option"]')[1]!.trigger('click')
    await new Promise(r => setTimeout(r, 0))
    await wrapper.vm.$nextTick()

    expect(loadLocale).toHaveBeenCalledWith('en')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })
})
