import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import { getEquipment, preloadVariantData } from '@/data'
import Step6Equipment from './Step6Equipment.vue'

// Con locale 'en' e messaggi vuoti i nomi delle armi e delle armature restano
// quelli dei dati, quindi i pulsanti si trovano per nome.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false,
})

function mountStep() {
  const store = useCharacterStore()
  store.character.variant = 'dnd5e'
  const wrapper = mount(Step6Equipment, { global: { plugins: [i18n] } })
  return { store, wrapper }
}

type Wrapper = ReturnType<typeof mountStep>['wrapper']

function weaponButton(wrapper: Wrapper, name: string) {
  const btn = wrapper.find('[aria-label="equipment.simpleWeapons"]')
    .findAll('button')
    .find(b => b.text().startsWith(name))
  expect(btn, `pulsante arma "${name}"`).toBeTruthy()
  return btn!
}

function armorButtons(wrapper: Wrapper) {
  return wrapper.find('[aria-label="equipment.armor"]').findAll('button')
}

describe('passo Equipaggiamento — la scheda caricata non viene cancellata', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  it('mostra come già scelti armatura e scudo del personaggio', async () => {
    const eq = getEquipment('dnd5e')
    const worn = eq.armor[1]!
    setActivePinia(createPinia())
    const store = useCharacterStore()
    store.character.variant = 'dnd5e'
    store.character.armor = worn.name
    store.character.shield = true

    const wrapper = mount(Step6Equipment, { global: { plugins: [i18n] } })
    const buttons = armorButtons(wrapper)
    const checked = buttons.filter(b => b.attributes('aria-checked') === 'true')
    expect(checked.map(b => b.text().split(' (')[0])).toEqual([worn.name])
    // L'ultimo pulsante del gruppo è lo scudo
    expect(buttons[buttons.length - 1]!.attributes('aria-pressed')).toBe('true')
  })

  it('non cancella le armi già in scheda al primo clic', async () => {
    const eq = getEquipment('dnd5e')
    const [first, second] = eq.simpleWeapons as [typeof eq.simpleWeapons[0], typeof eq.simpleWeapons[0]]
    const { store } = mountStep()
    store.character.weapons = [{ name: first!.name, attackBonus: 2, damage: first!.damage }]

    // Il passo va rimontato: è l'ingresso nel passo con la scheda già piena
    const wrapper = mount(Step6Equipment, { global: { plugins: [i18n] } })
    await weaponButton(wrapper, second!.name).trigger('click')

    expect(store.character.weapons.map(w => w.name)).toEqual([first!.name, second!.name])
  })

  it('si riallinea alle armi della scheda caricata senza essere rimontato', async () => {
    const eq = getEquipment('dnd5e')
    const [first, second] = eq.simpleWeapons as [typeof eq.simpleWeapons[0], typeof eq.simpleWeapons[0]]
    const { store, wrapper } = mountStep()

    await weaponButton(wrapper, first!.name).trigger('click')
    store.saveCharacter()
    const savedId = store.character.id

    // `<KeepAlive>` in BuilderView tiene vivo il passo mentre il personaggio
    // viene sostituito sotto di lui: un secondo personaggio con un'arma
    // diversa, poi il ritorno al primo.
    store.resetCharacter()
    store.character.variant = 'dnd5e'
    await wrapper.vm.$nextTick()
    await weaponButton(wrapper, second!.name).trigger('click')
    expect(store.character.weapons.map(w => w.name)).toEqual([second!.name])

    store.loadCharacter(savedId)
    await wrapper.vm.$nextTick()

    expect(weaponButton(wrapper, first!.name).attributes('aria-pressed')).toBe('true')
    expect(weaponButton(wrapper, second!.name).attributes('aria-pressed')).toBe('false')
  })
})
