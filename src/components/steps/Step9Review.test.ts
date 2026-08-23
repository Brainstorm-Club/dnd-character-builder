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

  /**
   * I dodici riquadri del riepilogo (sei dati di combattimento, sei
   * caratteristiche) erano altrettante copie a mano di .bsc-stat. Se qualcuno
   * ne aggiunge uno ricopiando la vecchia ricetta di utility, qui si vede.
   */
  it('usa .bsc-stat per i riquadri di combattimento e caratteristiche', () => {
    const wrapper = mountReview('dnd5e', 'fighter', 'champion', 3)
    const stats = wrapper.findAll('.bsc-stat')
    expect(stats).toHaveLength(12)
    for (const box of stats) {
      expect(box.find('.bsc-stat__label').exists()).toBe(true)
      expect(box.find('.bsc-stat__value').exists()).toBe(true)
      // Il fondo resta agganciato alla utility Tailwind: il foglio di stampa in
      // style.css sbianca `.bg-stone-800`, e senza la classe stamperebbe nero.
      expect(box.classes()).toContain('bg-stone-800')
    }
  })

  /**
   * Il DS vuole il modificatore in rosso (.bsc-stat__mod), ma qui il rosso è il
   * colore dei danni: il modificatore è oro da sempre e l'oro resta.
   */
  it('tiene il modificatore in oro, non nel rosso del design system', () => {
    const wrapper = mountReview('dnd5e', 'fighter', 'champion', 3)
    const mods = wrapper.findAll('.bsc-stat__mod')
    expect(mods).toHaveLength(6)
    for (const mod of mods) {
      expect(mod.classes()).toContain('text-amber-400')
    }
  })

  /**
   * .font-gothic (Courier Prime) non compariva in nessuno dei nove passi:
   * il prodotto vero era l'unica parte senza la voce del marchio.
   */
  it('dà ai titoli la voce tipografica del marchio', () => {
    const wrapper = mountReview('brancalonia', 'ranger', 'mattatore', 6)
    expect(wrapper.get('#review-heading').classes()).toContain('font-gothic')
    for (const h of wrapper.findAll('h3, h4')) {
      expect(h.classes()).toContain('font-gothic')
    }
  })
})
