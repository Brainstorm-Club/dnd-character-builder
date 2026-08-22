import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import type { GameVariant } from '@/stores/app'
import { getClasses, preloadVariantData } from '@/data'
import Step9Review from './Step9Review.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'it',
  fallbackLocale: 'it',
  messages: { it: {} },
  missingWarn: false,
  fallbackWarn: false,
})

function mountReview(variant: GameVariant, classId: string, subclassId: string, level: number) {
  const store = useCharacterStore()
  store.resetCharacter()
  store.character.variant = variant
  store.character.className = classId
  store.character.level = level
  store.syncClassAndLevel()
  store.setSubclass(subclassId)
  return mount(Step9Review, {
    global: {
      plugins: [i18n],
      stubs: { VariantPromo: true, RouterLink: true },
    },
  })
}

describe('Step9Review', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    await Promise.all((['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse'] as const).map(v => preloadVariantData(v)))
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /**
   * Impedisce il ritorno del difetto per cui il riepilogo mostrava il nome
   * della sottoclasse così come sta nei dati — 'Way of the Open Hand' in D&D,
   * la forma composta 'Matador (Mattatore)' in Brancalonia e Apocalisse —
   * mentre il selettore del passo 3 la mostrava già tradotta.
   */
  it('mostra la sottoclasse in italiano, come il passo 3', () => {
    const cases: [GameVariant, string, string, string, number][] = [
      ['dnd5e', 'monk', 'open-hand', 'Via della Mano Aperta', 3],
      ['dnd2024', 'wizard', 'evoker', 'Invocatore', 3],
      ['brancalonia', 'ranger', 'mattatore', 'Mattatore', 3],
      ['apocalisse', 'barbarian', 'path-of-the-horseman', 'Cammino del Martirio', 3],
    ]
    for (const [variant, classId, subclassId, expected, level] of cases) {
      setActivePinia(createPinia())
      const wrapper = mountReview(variant, classId, subclassId, level)
      expect(wrapper.text(), `${variant}/${subclassId}`).toContain(expected)
      // E niente più il dato grezzo dei file di gioco
      const raw = getClasses(variant).find(c => c.id === classId)!
        .subclasses.find(s => s.id === subclassId)!.name
      if (raw !== expected) {
        expect(wrapper.text(), `${variant}/${subclassId}: nome grezzo`).not.toContain(raw)
      }
    }
  })
})
