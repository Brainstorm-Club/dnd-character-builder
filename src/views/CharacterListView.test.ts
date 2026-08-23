import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import CharacterListView from './CharacterListView.vue'
import { useCharacterStore } from '@/stores/character'
import type { CharacterData } from '@/stores/character'
import { preloadVariantData } from '@/data'

const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  RouterLink: { template: '<a><slot /></a>' },
}))

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

function mountList() {
  return mount(CharacterListView, {
    global: { plugins: [i18n], stubs: { 'router-link': { template: '<a><slot /></a>' } } },
  })
}

/** Scheda d'archivio minima ma completa quanto basta a essere disegnata. */
function saved(overrides: Partial<CharacterData> = {}): CharacterData {
  const store = useCharacterStore()
  return {
    ...JSON.parse(JSON.stringify(store.character)),
    id: 'archiviato',
    variant: 'dnd5e',
    name: 'Archiviato',
    race: 'human',
    className: 'fighter',
    background: 'soldier',
    hitDie: 10,
    level: 2,
    maxHp: 20,
    classes: [],
    ...overrides,
  }
}

describe('elenco dei personaggi', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockClear()
  })

  /**
   * La cancellazione era immediata: un clic sbagliato bruciava una scheda che
   * vive solo nel localStorage di questo browser, senza cestino né annulla.
   */
  it('chiede conferma prima di cancellare', async () => {
    const store = useCharacterStore()
    store.savedCharacters.push(saved())

    const wrapper = mountList()
    await wrapper.find('[aria-label="characters.deleteLabel"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true)
    expect(store.savedCharacters).toHaveLength(1)

    await wrapper.findAll('[role="alertdialog"] button')[0]!.trigger('click')
    await wrapper.vm.$nextTick()
    expect(store.savedCharacters).toHaveLength(0)
  })

  it('annullando la conferma la scheda resta', async () => {
    const store = useCharacterStore()
    store.savedCharacters.push(saved())

    const wrapper = mountList()
    await wrapper.find('[aria-label="characters.deleteLabel"]').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('[role="alertdialog"] button')[1]!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(store.savedCharacters).toHaveLength(1)
  })

  /**
   * "Sali di Livello" passava da `loadCharacter(id)`: la scheda dell'archivio
   * prendeva il posto del personaggio in costruzione, che spariva.
   */
  it('salire di livello dall\'archivio non tocca il personaggio in corso', async () => {
    const store = useCharacterStore()
    store.character.name = 'In Costruzione'
    store.character.race = 'elf'
    store.character.className = 'wizard'
    store.savedCharacters.push(saved())

    const wrapper = mountList()
    await wrapper.find('[aria-label="characters.levelUpLabel"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(store.savedCharacters[0]!.level).toBe(3)
    expect(store.character.name).toBe('In Costruzione')
    expect(store.character.className).toBe('wizard')
    expect(store.character.level).toBe(1)
  })
})
