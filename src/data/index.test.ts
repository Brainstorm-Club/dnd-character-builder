import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  isVariantLoaded,
  _resetCaches,
  getRaces,
  getClasses,
  getBackgrounds,
  getRules,
  getMaxLevel,
  getEquipment,
  getSpells,
  getSpellSlots,
  getCantripsKnown,
  getSpellsKnownCount,
  getSpellcastingProfile,
  ensureSpellData,
  getAvailableLanguages,
  getBrancaloniaRules,
  getApocalisseRules,
  preloadVariantData,
} from './index'
import { VARIANT_INFO, HOME_VARIANT_ORDER, variantInfo } from './variants'
import { GAME_VARIANTS, type GameVariant } from '@/stores/app'

// Tutte e quattro: 'dnd2024' restava fuori dalle suite, ed è così che i suoi
// difetti (lista incantesimi, import, condivisione) sono passati inosservati.
const variants: GameVariant[] = ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse']

describe('data loader', () => {
  // Preload all variants before running tests
  beforeAll(async () => {
    await Promise.all(variants.map(v => preloadVariantData(v)))
  })
  describe('getRaces', () => {
    it('returns races for all variants', () => {
      for (const v of variants) {
        const races = getRaces(v)
        expect(races.length).toBeGreaterThan(0)
        expect(races[0]).toHaveProperty('id')
        expect(races[0]).toHaveProperty('name')
      }
    })

    it('dnd5e has 9 races', () => {
      expect(getRaces('dnd5e').length).toBe(9)
    })

    it('brancalonia has races', () => {
      expect(getRaces('brancalonia').length).toBeGreaterThan(0)
    })

    it('apocalisse has races', () => {
      expect(getRaces('apocalisse').length).toBeGreaterThan(0)
    })
  })

  describe('getClasses', () => {
    it('returns classes for all variants', () => {
      for (const v of variants) {
        const classes = getClasses(v)
        expect(classes.length).toBeGreaterThan(0)
        expect(classes[0]).toHaveProperty('id')
        expect(classes[0]).toHaveProperty('name')
        expect(classes[0]).toHaveProperty('hitDie')
      }
    })

    it('dnd5e has 12 classes', () => {
      expect(getClasses('dnd5e').length).toBe(12)
    })

    it('brancalonia classes have brancalonia subclasses', () => {
      const classes = getClasses('brancalonia')
      // At least one class should have brancalonia-specific subclasses
      const hasSubclasses = classes.some(c => c.subclasses.length > 0)
      expect(hasSubclasses).toBe(true)
    })

    it('apocalisse classes have apocalyptic subclasses', () => {
      const classes = getClasses('apocalisse')
      const hasSubclasses = classes.some(c => c.subclasses.length > 0)
      expect(hasSubclasses).toBe(true)
    })
  })

  describe('getBackgrounds', () => {
    it('returns backgrounds for all variants', () => {
      for (const v of variants) {
        const bgs = getBackgrounds(v)
        expect(bgs.length).toBeGreaterThan(0)
        expect(bgs[0]).toHaveProperty('id')
        expect(bgs[0]).toHaveProperty('name')
      }
    })
  })

  describe('getRules / getMaxLevel', () => {
    it('dnd5e max level is 20', () => {
      expect(getMaxLevel('dnd5e')).toBe(20)
      expect(getRules('dnd5e').maxLevel).toBe(20)
    })

    it('brancalonia max level is 6 (Setting Book cap)', () => {
      expect(getMaxLevel('brancalonia')).toBe(6)
      expect(getRules('brancalonia').maxLevel).toBe(6)
    })

    it('brancalonia static rules agree with the loaded variant rules', () => {
      expect(getBrancaloniaRules('brancalonia')?.maxLevel).toBe(getMaxLevel('brancalonia'))
    })

    it('apocalisse max level is 20', () => {
      expect(getMaxLevel('apocalisse')).toBe(20)
    })

    it('brancalonia uses silver standard', () => {
      expect(getRules('brancalonia').currencyStandard).toBe('silver')
    })

    it('dnd5e uses gold standard', () => {
      expect(getRules('dnd5e').currencyStandard).toBe('gold')
    })
  })

  describe('getEquipment', () => {
    it('returns equipment data with weapons and armor', () => {
      const eq = getEquipment('dnd5e')
      expect(eq).toBeDefined()
      expect(eq.simpleWeapons.length).toBeGreaterThan(0)
      expect(eq.martialWeapons.length).toBeGreaterThan(0)
      expect(eq.armor.length).toBeGreaterThan(0)
    })
  })

  describe('getSpells', () => {
    it('returns spells', () => {
      const spells = getSpells('dnd5e')
      expect(spells.length).toBeGreaterThan(0)
      expect(spells[0]).toHaveProperty('name')
      expect(spells[0]).toHaveProperty('level')
    })
  })

  describe('getSpellSlots', () => {
    it('returns spell slots for wizard at level 1', () => {
      const slots = getSpellSlots('wizard', 1)
      expect(slots[1]).toBeGreaterThan(0) // level 1 spell slots
    })

    it('returns empty for non-caster', () => {
      const slots = getSpellSlots('fighter', 1)
      expect(Object.keys(slots)).toHaveLength(0)
    })

    it('returns more slots at higher levels', () => {
      const low = getSpellSlots('wizard', 1)
      const high = getSpellSlots('wizard', 5)
      const lowTotal = Object.values(low).reduce((a, b) => a + b, 0)
      const highTotal = Object.values(high).reduce((a, b) => a + b, 0)
      expect(highTotal).toBeGreaterThan(lowTotal)
    })
  })

  describe('getCantripsKnown', () => {
    it('returns cantrips for wizard', () => {
      expect(getCantripsKnown('wizard', 1)).toBeGreaterThan(0)
    })

    it('returns 0 for non-caster', () => {
      expect(getCantripsKnown('fighter', 1)).toBe(0)
    })

    it('increases cantrips at higher levels', () => {
      expect(getCantripsKnown('wizard', 10)).toBeGreaterThanOrEqual(getCantripsKnown('wizard', 1))
    })
  })

  describe('getSpellsKnownCount', () => {
    const mods = { str: 0, dex: 0, con: 0, int: 3, wis: 2, cha: 1 }

    it('prepared caster: ability mod + level (min 1)', () => {
      // Wizard is a prepared caster using INT
      const count = getSpellsKnownCount('wizard', 3, mods)
      expect(count).toBeGreaterThanOrEqual(1)
    })

    it('returns 0 for non-caster', () => {
      expect(getSpellsKnownCount('fighter', 1, mods)).toBe(0)
    })
  })

  // Le funzioni sugli incantesimi leggevano sempre le classi del 2014, senza
  // guardare la variante: un bardo del 2024 (che prepara) veniva contato con la
  // tabella «incantesimi conosciuti» del 2014, e un guerriero del 2024 (che nei
  // nostri dati non lancia) riceveva gli slot del terzo incantatore 2014.
  describe('incantesimi: le funzioni guardano la variante', () => {
    const mods = { str: 0, dex: 0, con: 0, int: 3, wis: 2, cha: 3 }

    it('il bardo è known-caster nel 2014 e prepared-caster nel 2024', () => {
      expect(getSpellcastingProfile('bard', 5, mods, 'dnd5e').mode).toBe('known')
      expect(getSpellcastingProfile('bard', 5, mods, 'dnd2024').mode).toBe('prepared')
    })

    it('stregone, warlock e ranger cambiano tipo di incantatore nel 2024', () => {
      for (const id of ['sorcerer', 'warlock', 'ranger']) {
        expect(getSpellcastingProfile(id, 5, mods, 'dnd5e').mode, id).toBe('known')
        expect(getSpellcastingProfile(id, 5, mods, 'dnd2024').mode, id).toBe('prepared')
      }
    })

    it('nel 2024 il numero di incantesimi preparati è ignoto, non quello del 2014', () => {
      // La colonna «Prepared Spells» della tabella di classe non è ancora nei
      // dati (src/data/dnd2024/classes.ts porta solo cantripsKnown). Meglio
      // dichiarare «non lo so» che spacciare per buono il conto del 2014.
      expect(getSpellcastingProfile('bard', 5, mods, 'dnd2024').spellsCount).toBeNull()
      expect(getSpellcastingProfile('bard', 5, mods, 'dnd5e').spellsCount).toBe(8)
    })

    it('nel 2014 il prepared-caster resta modificatore + livello (minimo 1)', () => {
      expect(getSpellcastingProfile('wizard', 3, mods, 'dnd5e').spellsCount).toBe(6)
      expect(getSpellcastingProfile('wizard', 1, { ...mods, int: -3 }, 'dnd5e').spellsCount).toBe(1)
    })

    it('il guerriero lancia nel 2014 e non lancia nel 2024', () => {
      // Nei dati del 2024 non ci sono Cavaliere Mistico né Furfante Arcano:
      // guerriero e ladro hanno spellcasting null e non devono ricevere slot.
      expect(Object.keys(getSpellSlots('fighter', 5, 'dnd5e')).length).toBeGreaterThan(0)
      expect(getSpellSlots('fighter', 5, 'dnd2024')).toEqual({})
      expect(getSpellSlots('rogue', 5, 'dnd2024')).toEqual({})
      expect(getSpellcastingProfile('fighter', 5, mods, 'dnd2024').mode).toBe('none')
    })

    it('gli slot del mago non cambiano fra 2014 e 2024 (stessa tabella a incantatore pieno)', () => {
      expect(getSpellSlots('wizard', 5, 'dnd2024')).toEqual(getSpellSlots('wizard', 5, 'dnd5e'))
      expect(getCantripsKnown('wizard', 1, 'dnd2024')).toBe(getCantripsKnown('wizard', 1, 'dnd5e'))
    })

    it('senza variante il comportamento resta quello del 2014 (chiamanti già scritti)', () => {
      expect(getSpellSlots('wizard', 1)).toEqual(getSpellSlots('wizard', 1, 'dnd5e'))
      expect(getCantripsKnown('bard', 4)).toBe(getCantripsKnown('bard', 4, 'dnd5e'))
      expect(getSpellsKnownCount('bard', 5, mods)).toBe(8)
    })

    it('getSpellsKnownCount non inventa un numero quando il dato manca', () => {
      // Il vecchio conteggio (numero secco) non sa dire «ignoto»: torna 0, e
      // chi vuole la verità usa getSpellcastingProfile.
      expect(getSpellsKnownCount('bard', 5, mods, 'dnd2024')).toBe(0)
    })

    it('il burattinaio di Brancalonia è una classe conosciuta e non lancia', () => {
      // Vive fuori dall'elenco 2014: cercandolo solo lì non lo si trovava.
      const branca = getClasses('brancalonia').find(c => c.id === 'burattinaio')
      expect(branca).toBeDefined()
      expect(getSpellcastingProfile('burattinaio', 6, mods, 'brancalonia').mode).toBe('none')
    })

    it('Brancalonia e Apocalisse restano sul telaio 2014', () => {
      for (const v of ['brancalonia', 'apocalisse'] as GameVariant[]) {
        expect(getSpellcastingProfile('bard', 5, mods, v).mode, v).toBe('known')
        expect(getSpellSlots('wizard', 5, v), v).toEqual(getSpellSlots('wizard', 5, 'dnd5e'))
      }
    })

    it('ogni variante risponde per ogni sua classe senza esplodere', () => {
      for (const v of variants) {
        for (const cls of getClasses(v)) {
          const p = getSpellcastingProfile(cls.id, 5, mods, v)
          expect(['none', 'known', 'prepared'], `${v}/${cls.id}`).toContain(p.mode)
          expect(p.cantrips, `${v}/${cls.id}`).toBeGreaterThanOrEqual(0)
        }
      }
    })
  })

  describe('getAvailableLanguages', () => {
    it('dnd5e includes Common', () => {
      expect(getAvailableLanguages('dnd5e')).toContain('Common')
    })

    it('all variants return languages', () => {
      for (const v of variants) {
        expect(getAvailableLanguages(v).length).toBeGreaterThan(0)
      }
    })
  })

  describe('variant-specific rules', () => {
    it('getBrancaloniaRules returns rules for brancalonia', () => {
      expect(getBrancaloniaRules('brancalonia')).not.toBeNull()
      expect(getBrancaloniaRules('dnd5e')).toBeNull()
    })

    it('getApocalisseRules returns rules for apocalisse', () => {
      expect(getApocalisseRules('apocalisse')).not.toBeNull()
      expect(getApocalisseRules('dnd5e')).toBeNull()
    })
  })

  // Il descrittore è nato perché colori e link erano ricopiati a mano in cinque
  // viste e 'dnd2024' era stato dimenticato in quattro: qui si controlla che
  // ogni variante dichiarata nello store sia descritta per intero.
  describe('descrittore delle varianti', () => {
    const campiObbligatori = [
      'emoji', 'badge', 'text', 'border', 'borderHover', 'promoBorder', 'link', 'button', 'publisherLabel',
    ] as const

    it('copre ogni variante di GAME_VARIANTS, senza campi vuoti', () => {
      for (const v of GAME_VARIANTS) {
        const info = VARIANT_INFO[v]
        expect(info, `manca il descrittore di ${v}`).toBeDefined()
        expect(info.id).toBe(v)
        for (const campo of campiObbligatori) {
          expect(info[campo], `${v}.${campo} è vuoto`).toBeTruthy()
        }
      }
    })

    it('dà a ogni variante colori suoi: il distintivo è l\'unico segno che le distingue', () => {
      const distintivi = GAME_VARIANTS.map(v => VARIANT_INFO[v].badge)
      expect(new Set(distintivi).size).toBe(GAME_VARIANTS.length)
    })

    it('non tiene link a metà: o è https, o il campo è vuoto e il link non si mostra', () => {
      for (const v of GAME_VARIANTS) {
        const { publisherUrl, amazonUrl } = VARIANT_INFO[v]
        for (const url of [publisherUrl, amazonUrl]) {
          if (url !== '') expect(url, `${v}: ${url}`).toMatch(/^https:\/\//)
        }
        // Almeno un negozio, altrimenti il riquadro promozionale non ha motivo di esistere
        expect(publisherUrl || amazonUrl, `${v} non ha nessun negozio`).toBeTruthy()
      }
    })

    it('ricade su dnd5e per i personaggi salvati prima delle varianti', () => {
      expect(variantInfo(undefined).id).toBe('dnd5e')
    })

    it('HOME_VARIANT_ORDER mostra tutte le varianti, ognuna una volta sola', () => {
      expect([...HOME_VARIANT_ORDER].sort()).toEqual([...GAME_VARIANTS].sort())
    })
  })

  // Ultimo blocco del file: azzera le cache, quindi deve girare dopo tutto il resto.
  describe('cache per variante', () => {
    afterAll(async () => {
      await Promise.all(variants.map(v => preloadVariantData(v)))
    })

    it('isVariantLoaded non scambia il 2024 per il 2014', async () => {
      _resetCaches()
      expect(isVariantLoaded('dnd2024')).toBe(false)
      await preloadVariantData('dnd5e')
      expect(isVariantLoaded('dnd5e')).toBe(true)
      // Specie, classi e background del 2024 non sono ancora arrivati
      expect(isVariantLoaded('dnd2024')).toBe(false)
      await preloadVariantData('dnd2024')
      expect(isVariantLoaded('dnd2024')).toBe(true)
    })

    it('ensureSpellData porta anche i dati del 2024, non solo quelli del 2014', async () => {
      _resetCaches()
      await ensureSpellData('dnd2024')
      // Senza le classi del 2024 il passo incantesimi vedeva una lista vuota e
      // ricadeva sui trucchetti e sugli slot del 2014.
      expect(getClasses('dnd2024').length).toBeGreaterThan(0)
      expect(getSpellcastingProfile('bard', 5, { str: 0, dex: 0, con: 0, int: 3, wis: 2, cha: 3 }, 'dnd2024').mode).toBe('prepared')
    })

    it('_resetCaches svuota anche i dati del 2024', async () => {
      await preloadVariantData('dnd2024')
      expect(getRaces('dnd2024').length).toBeGreaterThan(0)
      _resetCaches()
      expect(getRaces('dnd2024')).toHaveLength(0)
      expect(isVariantLoaded('dnd2024')).toBe(false)
    })
  })
})
