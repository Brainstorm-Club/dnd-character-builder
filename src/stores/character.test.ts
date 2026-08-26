import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { createApp, nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { useCharacterStore } from './character'
import type { CharacterData } from './character'
import { preloadVariantData, getClasses, getMaxLevel, getRaces } from '@/data'
import { GAME_VARIANTS } from './app'

function makeMinimalCharacter(overrides: Partial<CharacterData> = {}): Partial<CharacterData> {
  return {
    variant: 'dnd5e',
    race: 'human',
    className: 'fighter',
    level: 1,
    abilityScores: { str: 16, dex: 14, con: 13, int: 10, wis: 12, cha: 8 },
    ...overrides,
  }
}

describe('useCharacterStore', () => {
  // Preload data for tests that use getClasses/getMaxLevel
  beforeAll(async () => {
    await Promise.all(GAME_VARIANTS.map(v => preloadVariantData(v)))
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initialization', () => {
    it('starts with an empty character', () => {
      const store = useCharacterStore()
      expect(store.character.variant).toBe('dnd5e')
      expect(store.character.name).toBe('')
      expect(store.character.level).toBe(1)
      expect(store.character.abilityScores.str).toBe(10)
    })

    it('starts with empty saved characters', () => {
      const store = useCharacterStore()
      expect(store.savedCharacters).toEqual([])
    })

    it('starts with spellsKnownLimit 0 (use class default, decoupled from slots)', () => {
      const store = useCharacterStore()
      expect(store.character.spellsKnownLimit).toBe(0)
    })
  })

  describe('resetCharacter', () => {
    it('resets to default values with new id', () => {
      const store = useCharacterStore()
      const oldId = store.character.id
      store.character.name = 'Test'
      store.character.level = 5
      store.resetCharacter()
      expect(store.character.name).toBe('')
      expect(store.character.level).toBe(1)
      expect(store.character.id).not.toBe(oldId)
    })
  })

  describe('computed properties', () => {
    it('calculates ability modifiers correctly', () => {
      const store = useCharacterStore()
      store.character.abilityScores = { str: 16, dex: 14, con: 13, int: 10, wis: 12, cha: 8 }
      expect(store.abilityModifiers.str).toBe(3)
      expect(store.abilityModifiers.dex).toBe(2)
      expect(store.abilityModifiers.con).toBe(1)
      expect(store.abilityModifiers.int).toBe(0)
      expect(store.abilityModifiers.wis).toBe(1)
      expect(store.abilityModifiers.cha).toBe(-1)
    })

    it('includes racial bonuses in ability modifiers', () => {
      const store = useCharacterStore()
      store.character.abilityScores.str = 14 // mod +2
      store.character.racialBonuses = { str: 2 } // total 16, mod +3
      expect(store.abilityModifiers.str).toBe(3)
    })

    it('calculates proficiency bonus by level', () => {
      const store = useCharacterStore()
      store.character.level = 1
      expect(store.profBonus).toBe(2)
      store.character.level = 5
      expect(store.profBonus).toBe(3)
      store.character.level = 9
      expect(store.profBonus).toBe(4)
      store.character.level = 17
      expect(store.profBonus).toBe(6)
    })

    it('calculates armor class (10 + DEX mod)', () => {
      const store = useCharacterStore()
      store.character.abilityScores.dex = 16 // mod +3
      expect(store.armorClass).toBe(13)
    })

    it('calculates initiative from DEX mod', () => {
      const store = useCharacterStore()
      store.character.abilityScores.dex = 14
      expect(store.initiative).toBe(2)
    })

    it('calculates passive perception', () => {
      const store = useCharacterStore()
      store.character.abilityScores.wis = 14 // mod +2
      store.character.level = 1 // prof +2
      expect(store.passivePerception).toBe(12) // 10 + 2

      store.character.skillProficiencies = ['perception']
      expect(store.passivePerception).toBe(14) // 10 + 2 + 2
    })
  })

  describe('save/load/delete', () => {
    it('saves and loads a character', () => {
      const store = useCharacterStore()
      store.character.name = 'Gandalf'
      store.character.race = 'human'
      store.character.className = 'wizard'
      store.saveCharacter()

      expect(store.savedCharacters).toHaveLength(1)
      expect(store.savedCharacters[0]!.name).toBe('Gandalf')

      // Load into a fresh character
      store.resetCharacter()
      expect(store.character.name).toBe('')
      store.loadCharacter(store.savedCharacters[0]!.id)
      expect(store.character.name).toBe('Gandalf')
    })

    it('updates existing character on save', () => {
      const store = useCharacterStore()
      store.character.name = 'Gandalf'
      store.saveCharacter()
      expect(store.savedCharacters).toHaveLength(1)

      store.character.name = 'Gandalf the White'
      store.saveCharacter()
      expect(store.savedCharacters).toHaveLength(1)
      expect(store.savedCharacters[0]!.name).toBe('Gandalf the White')
    })

    it('deletes a character', () => {
      const store = useCharacterStore()
      store.character.name = 'ToDelete'
      store.saveCharacter()
      const id = store.savedCharacters[0]!.id
      expect(store.savedCharacters).toHaveLength(1)

      store.deleteCharacter(id)
      expect(store.savedCharacters).toHaveLength(0)
    })

    it('does nothing when loading non-existent id', () => {
      const store = useCharacterStore()
      store.character.name = 'Original'
      store.loadCharacter('non-existent-id')
      expect(store.character.name).toBe('Original')
    })
  })

  describe('exportJson / importJson', () => {
    it('exports valid JSON', () => {
      const store = useCharacterStore()
      store.character.name = 'Test'
      const json = store.exportJson()
      const parsed = JSON.parse(json)
      expect(parsed.name).toBe('Test')
      expect(parsed.variant).toBe('dnd5e')
    })

    it('imports valid character JSON', () => {
      const store = useCharacterStore()
      const json = JSON.stringify(makeMinimalCharacter({ name: 'Imported' }))
      const { data, warnings } = store.importJson(json)
      expect(data.name).toBe('Imported')
      expect(data.variant).toBe('dnd5e')
      expect(data.race).toBe('human')
      expect(warnings).toContain('WARN_NO_HP')
    })

    it('rejects invalid JSON string', () => {
      const store = useCharacterStore()
      expect(() => store.importJson('not json')).toThrow('JSON_PARSE_ERROR')
    })

    it('rejects non-object JSON', () => {
      const store = useCharacterStore()
      expect(() => store.importJson('"hello"')).toThrow('JSON_NOT_OBJECT')
      expect(() => store.importJson('[1,2]')).toThrow('JSON_NOT_OBJECT')
    })

    it('rejects missing variant', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({ race: 'human', className: 'fighter', level: 1, abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
      expect(() => store.importJson(json)).toThrow('VALIDATION:MISSING_VARIANT')
    })

    it('rejects missing race', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({ variant: 'dnd5e', className: 'fighter', level: 1, abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
      expect(() => store.importJson(json)).toThrow('MISSING_RACE')
    })

    it('rejects missing className', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({ variant: 'dnd5e', race: 'human', level: 1, abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
      expect(() => store.importJson(json)).toThrow('MISSING_CLASSNAME')
    })

    it('rejects invalid level', () => {
      const store = useCharacterStore()
      const json = JSON.stringify(makeMinimalCharacter({ level: 0 }))
      expect(() => store.importJson(json)).toThrow('INVALID_LEVEL')
    })

    it('rejects invalid ability scores', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({
        ...makeMinimalCharacter(),
        abilityScores: { str: 0, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      })
      expect(() => store.importJson(json)).toThrow('INVALID_ABILITY_SCORES')
    })

    it('warns about missing name and background', () => {
      const store = useCharacterStore()
      const json = JSON.stringify(makeMinimalCharacter())
      const { warnings } = store.importJson(json)
      expect(warnings).toContain('WARN_NO_NAME')
      expect(warnings).toContain('WARN_NO_BACKGROUND')
    })

    it('truncates long strings', () => {
      const store = useCharacterStore()
      const longStr = 'x'.repeat(6000)
      const json = JSON.stringify(makeMinimalCharacter({ name: longStr }))
      const { data } = store.importJson(json)
      expect(data.name.length).toBe(5000)
    })

    it('filters invalid array items', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({
        ...makeMinimalCharacter(),
        skillProficiencies: ['athletics', 42, null, 'perception'],
      })
      const { data } = store.importJson(json)
      expect(data.skillProficiencies).toEqual(['athletics', 'perception'])
    })

    it('strips unknown properties (whitelist)', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({
        ...makeMinimalCharacter(),
        maliciousField: '<script>alert(1)</script>',
      })
      const { data } = store.importJson(json)
      expect((data as any).maliciousField).toBeUndefined()
    })

    /**
     * Impedisce il ritorno del difetto per cui 'dnd2024' mancava dalla lista
     * bianca: il pulsante di import esisteva già, ma `importJson` sollevava
     * MISSING_VARIANT e la pagina di condivisione mostrava l'errore.
     */
    it('accepts all four variants', () => {
      const store = useCharacterStore()
      for (const variant of GAME_VARIANTS) {
        const json = JSON.stringify(makeMinimalCharacter({ variant }))
        const { data } = store.importJson(json)
        expect(data.variant).toBe(variant)
      }
    })
  })

  describe('multiclass', () => {
    it('isMulticlass is false for single class', () => {
      const store = useCharacterStore()
      expect(store.isMulticlass).toBe(false)
    })

    it('only works for dnd5e variant', () => {
      const store = useCharacterStore()
      store.character.variant = 'brancalonia'
      store.character.className = 'fighter'
      store.addMulticlass('wizard')
      expect(store.character.classes).toHaveLength(0)
    })

    it('does not add the same class twice', () => {
      const store = useCharacterStore()
      store.character.variant = 'dnd5e'
      store.character.className = 'fighter'
      store.character.hitDie = 10
      store.character.level = 3
      store.addMulticlass('fighter') // same class
      // classes should have just the primary class entry
      expect(store.character.classes).toHaveLength(1)
    })
  })

  describe('variant level cap', () => {
    it('refuses to level a brancalonia character past 6', () => {
      const store = useCharacterStore()
      store.character.variant = 'brancalonia'
      store.character.className = 'fighter'
      store.character.hitDie = 10
      store.character.level = 6
      expect(store.levelUp()).toBeNull()
      expect(store.character.level).toBe(6)
    })

    it('still levels a brancalonia character up to 6', () => {
      const store = useCharacterStore()
      store.character.variant = 'brancalonia'
      store.character.className = 'fighter'
      store.character.hitDie = 10
      store.character.level = 5
      expect(store.levelUp()).not.toBeNull()
      expect(store.character.level).toBe(6)
    })

    it('clamps saved brancalonia characters above the cap on hydration', async () => {
      const store = useCharacterStore()
      store.savedCharacters = [
        { ...makeMinimalCharacter({ variant: 'brancalonia', level: 10, id: 'over' }) },
      ] as CharacterData[]
      await nextTick()
      expect(store.savedCharacters[0]!.level).toBe(6)
    })

    it('leaves saved characters within the cap untouched', async () => {
      const store = useCharacterStore()
      store.savedCharacters = [
        { ...makeMinimalCharacter({ variant: 'brancalonia', level: 4, id: 'ok' }) },
        { ...makeMinimalCharacter({ variant: 'dnd5e', level: 17, id: 'dnd' }) },
      ] as CharacterData[]
      await nextTick()
      expect(store.savedCharacters[0]!.level).toBe(4)
      expect(store.savedCharacters[1]!.level).toBe(17)
    })

    it('clamps an imported over-cap character instead of rejecting it', () => {
      const store = useCharacterStore()
      const json = JSON.stringify(makeMinimalCharacter({ variant: 'brancalonia', level: 9 }))
      const { data, warnings } = store.importJson(json)
      expect(data.level).toBe(6)
      expect(warnings).toContain('WARN_LEVEL_CLAMPED')
    })

    it('does not warn when an imported character is within the cap', () => {
      const store = useCharacterStore()
      const json = JSON.stringify(makeMinimalCharacter({ variant: 'brancalonia', level: 3 }))
      const { data, warnings } = store.importJson(json)
      expect(data.level).toBe(3)
      expect(warnings).not.toContain('WARN_LEVEL_CLAMPED')
    })
  })
})

describe('switching game variant', () => {
  it('starts from a clean character so no cross-variant data survives', () => {
    const store = useCharacterStore()
    store.character.variant = 'brancalonia'
    store.character.race = 'marionette'
    store.character.subrace = 'pinocchio'
    store.character.className = 'burattinaio'
    store.character.subclass = 'geppetto'
    store.character.background = 'ambulant'
    store.character.name = 'Legnetto'

    // What Step1Variant does when the player picks a different variant
    store.resetCharacter()
    store.character.variant = 'apocalisse'

    expect(store.character.race).toBe('')
    expect(store.character.subrace).toBe('')
    expect(store.character.className).toBe('')
    expect(store.character.subclass).toBe('')
    expect(store.character.background).toBe('')
    expect(store.character.variant).toBe('apocalisse')
  })
})

/**
 * levelUp e levelDown devono restare l'uno l'inverso dell'altro, e coincidere
 * con quello che syncClassAndLevel produce per lo stesso personaggio.
 */
describe('salita e discesa di livello', () => {
  beforeAll(async () => {
    await Promise.all(GAME_VARIANTS.map(v => preloadVariantData(v)))
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /** Personaggio pulito di quella classe al livello indicato, già sincronizzato. */
  function seed(variant: typeof GAME_VARIANTS[number], classId: string, level: number) {
    const store = useCharacterStore()
    store.resetCharacter()
    store.character.variant = variant
    store.character.className = classId
    store.character.level = level
    store.syncClassAndLevel()
    return store
  }

  for (const variant of GAME_VARIANTS) {
    /**
     * Impedisce il ritorno del difetto per cui levelUp aggiungeva un privilegio
     * solo se il nome non era già presente: ogni ripetizione di "Ability Score
     * Improvement", "Extra Attack" e dei privilegi d'archetipo andava persa
     * (guerriero di 20°: 13 voci invece di 22).
     */
    it(`${variant}: salire di livello uno alla volta dà la stessa lista di syncClassAndLevel`, () => {
      const maxLv = getMaxLevel(variant)
      for (const cls of getClasses(variant)) {
        const climbing = seed(variant, cls.id, 1)
        for (let lv = 2; lv <= maxLv; lv++) {
          expect(climbing.levelUp(), `${variant}/${cls.id} liv.${lv}`).not.toBeNull()
        }
        const climbed = [...climbing.character.featuresTraits]

        setActivePinia(createPinia())
        const expected = seed(variant, cls.id, maxLv).character.featuresTraits

        expect(climbed, `${variant}/${cls.id} al ${maxLv}°`).toEqual(expected)
      }
    })

    /**
     * Impedisce il ritorno del difetto per cui levelDown cercava i privilegi per
     * nome e cancellava l'unica occorrenza rimasta anche quando spettava a un
     * livello inferiore (guerriero sceso all'8° senza alcun "Ability Score
     * Improvement", mentre al 7° ne ha due).
     */
    it(`${variant}: risalire e riscendere lascia la lista del livello inferiore`, () => {
      const maxLv = getMaxLevel(variant)
      if (maxLv < 2) return
      for (const cls of getClasses(variant)) {
        const store = seed(variant, cls.id, 1)
        for (let lv = 2; lv <= maxLv; lv++) store.levelUp()
        expect(store.levelDown(), `${variant}/${cls.id}`).not.toBeNull()
        expect(store.character.level).toBe(maxLv - 1)
        const descended = [...store.character.featuresTraits]

        setActivePinia(createPinia())
        const expected = seed(variant, cls.id, maxLv - 1).character.featuresTraits

        expect(descended, `${variant}/${cls.id} al ${maxLv - 1}°`).toEqual(expected)
      }
    })
  }

  it('Brancalonia: al 6° guerriero e ladro hanno tutti i privilegi', () => {
    // Il 6° è il livello massimo di Brancalonia, e proprio lì la vecchia
    // levelUp perdeva un privilegio per entrambe le classi.
    for (const classId of ['fighter', 'rogue']) {
      const climbing = seed('brancalonia', classId, 1)
      for (let lv = 2; lv <= 6; lv++) climbing.levelUp()
      const climbed = [...climbing.character.featuresTraits]

      setActivePinia(createPinia())
      const expected = seed('brancalonia', classId, 6).character.featuresTraits
      expect(climbed, classId).toEqual(expected)
      expect(climbed.length, classId).toBe(expected.length)
    }
  })

  /**
   * Impedisce il ritorno del difetto per cui levelDown non ricontrollava mai
   * `cls.subclassLevel`: un guerriero di 3° portato al 2° restava con
   * l'Archetipo Marziale stampato su riepilogo e scheda.
   */
  it('scendere sotto il livello di sblocco azzera la sottoclasse', () => {
    const store = useCharacterStore()
    store.resetCharacter()
    store.character.variant = 'dnd5e'
    store.character.className = 'fighter'
    store.character.level = 3
    store.character.subclass = 'champion'
    store.syncClassAndLevel()
    expect(store.character.subclass).toBe('champion')

    store.levelDown()

    expect(store.character.level).toBe(2)
    expect(store.character.subclass).toBe('')
    // E i privilegi dell'archetipo se ne vanno con lui
    const championFeatures = getClasses('dnd5e')
      .find(c => c.id === 'fighter')!.subclasses
      .find(sc => sc.id === 'champion')!.features
      .map(f => f.name)
    for (const feat of championFeatures) {
      expect(store.character.featuresTraits, feat).not.toContain(feat)
    }
  })
})

/**
 * I tratti di specie e sottorazza fanno parte dei privilegi della scheda tanto
 * quanto quelli di classe: chi li perde per strada si ritrova un elfo senza
 * Scurovisione nel riepilogo e nel PDF.
 */
describe('privilegi di specie', () => {
  beforeAll(async () => {
    await Promise.all(GAME_VARIANTS.map(v => preloadVariantData(v)))
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  for (const variant of GAME_VARIANTS) {
    /**
     * Impedisce il ritorno del difetto per cui computeFeatures ricostruiva
     * l'elenco dai soli privilegi di classe e sottoclasse: bastava scegliere la
     * classe al passo 3 o cambiare livello al passo 4 perché syncClassAndLevel
     * cancellasse i tratti razziali di tutti e 64 i personaggi del blog.
     */
    it(`${variant}: syncClassAndLevel non cancella i tratti di specie`, () => {
      const cls = getClasses(variant)[0]!
      for (const race of getRaces(variant)) {
        const subrace = race.subraces[0]
        const store = useCharacterStore()
        store.resetCharacter()
        store.character.variant = variant
        store.character.race = race.id
        store.character.subrace = subrace?.id ?? ''
        store.character.className = cls.id
        store.character.level = 3

        store.syncClassAndLevel()

        for (const trait of [...race.traits, ...(subrace?.traits ?? [])]) {
          expect(store.character.featuresTraits, `${variant}/${race.id}: ${trait}`).toContain(trait)
        }
        // E i privilegi di classe restano al loro posto
        for (const feat of cls.features.filter(f => f.level <= 3)) {
          expect(store.character.featuresTraits, feat.name).toContain(feat.name)
        }
      }
    })
  }
})

/**
 * Scegliere la sottoclasse al passo 3 e arrivare allo stesso livello salendo
 * di grado devono lasciare la stessa scheda.
 */
describe('scelta della sottoclasse', () => {
  beforeAll(async () => {
    await Promise.all(GAME_VARIANTS.map(v => preloadVariantData(v)))
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  for (const variant of GAME_VARIANTS) {
    /**
     * Impedisce il ritorno del difetto per cui setSubclass aggiungeva i
     * privilegi solo se il nome non era già presente, mentre levelUp e
     * syncClassAndLevel li ricostruiscono ammettendo le ripetizioni: il warlock
     * di Lilith in Apocalisse perdeva la seconda occorrenza di "Pact Boon" e
     * usciva con 23 privilegi invece di 24.
     */
    it(`${variant}: setSubclass dà la stessa lista di syncClassAndLevel`, () => {
      const maxLv = getMaxLevel(variant)
      for (const cls of getClasses(variant)) {
        for (const sub of cls.subclasses) {
          setActivePinia(createPinia())
          const chosen = useCharacterStore()
          chosen.resetCharacter()
          chosen.character.variant = variant
          chosen.character.className = cls.id
          chosen.character.level = maxLv
          chosen.syncClassAndLevel()
          expect(chosen.setSubclass(sub.id), `${variant}/${cls.id}/${sub.id}`).not.toBeNull()

          setActivePinia(createPinia())
          const synced = useCharacterStore()
          synced.resetCharacter()
          synced.character.variant = variant
          synced.character.className = cls.id
          synced.character.subclass = sub.id
          synced.character.level = maxLv
          synced.syncClassAndLevel()

          expect(chosen.character.featuresTraits, `${variant}/${cls.id}/${sub.id}`)
            .toEqual(synced.character.featuresTraits)
        }
      }
    })
  }
})

/**
 * Il passo 3 aggiunge e toglie classi senza passare dal passo 4 o dall'8:
 * quello che lascia in scheda deve essere già completo.
 */
describe('multiclasse dal passo 3', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /** Personaggio di classe singola, portato al livello chiesto. */
  function primaryAt(classId: string, level: number) {
    setActivePinia(createPinia())
    const store = useCharacterStore()
    store.resetCharacter()
    store.character.variant = 'dnd5e'
    store.character.className = classId
    store.character.level = level
    store.syncClassAndLevel()
    return store
  }

  const pairs: [string, string][] = [
    ['fighter', 'wizard'],
    ['cleric', 'rogue'],
    ['barbarian', 'druid'],
    ['rogue', 'warlock'],
  ]

  /**
   * Impedisce il ritorno del difetto per cui addMulticlass toccava solo
   * classi, livello e punti ferita: il guerriero che prendeva un livello da
   * mago restava con i soli privilegi da guerriero, senza Incantesimi né
   * Recupero Arcano, tanto nel riepilogo quanto sulla scheda.
   */
  for (const [primary, secondary] of pairs) {
    it(`${primary} + ${secondary}: addMulticlass dà la stessa lista di syncClassAndLevel`, () => {
      const added = primaryAt(primary, 5)
      added.addMulticlass(secondary)
      expect(added.character.level).toBe(6)

      // Stessa scheda, ma ricostruita dal percorso già corretto
      const synced = primaryAt(primary, 5)
      synced.character.classes = [
        { classId: primary, subclass: synced.character.subclass, level: 5, hitDie: synced.character.hitDie },
        { classId: secondary, subclass: '', level: 1, hitDie: getClasses('dnd5e').find(c => c.id === secondary)!.hitDie },
      ]
      synced.character.level = 6
      synced.syncClassAndLevel()

      expect(added.character.featuresTraits, `${primary}/${secondary}`)
        .toEqual(synced.character.featuresTraits)

      // E il 1° livello della classe presa davvero c'è
      const first = getClasses('dnd5e').find(c => c.id === secondary)!.features.filter(f => f.level === 1)
      for (const feat of first) {
        expect(added.character.featuresTraits, `${secondary}: ${feat.name}`).toContain(feat.name)
      }
    })
  }

  /**
   * Impedisce il ritorno del difetto gemello su removeMulticlass: il livello
   * tornava a quello della classe principale, ma i privilegi della classe
   * tolta restavano in lista e finivano sul PDF.
   */
  for (const [primary, secondary] of pairs) {
    it(`${primary} + ${secondary}: removeMulticlass riporta la lista a quella di partenza`, () => {
      const before = primaryAt(primary, 5).character.featuresTraits.slice()

      // Multiclasse costruito dal percorso già corretto, così che i privilegi
      // della seconda classe siano davvero in lista prima di toglierla
      const store = primaryAt(primary, 5)
      store.character.classes = [
        { classId: primary, subclass: store.character.subclass, level: 5, hitDie: store.character.hitDie },
        { classId: secondary, subclass: '', level: 1, hitDie: getClasses('dnd5e').find(c => c.id === secondary)!.hitDie },
      ]
      store.character.level = 6
      store.syncClassAndLevel()
      expect(store.character.featuresTraits.length).toBeGreaterThan(before.length)

      store.removeMulticlass(secondary)

      expect(store.character.level).toBe(5)
      expect(store.character.featuresTraits, `${primary}/${secondary}`).toEqual(before)
    })
  }
})

/**
 * Il lavoro in corso non sopravviveva a un ricaricamento: la persistenza
 * copriva solo `savedCharacters`, così bastava un refresh a metà procedura
 * per ritrovarsi un personaggio vuoto.
 */
describe('persistenza del personaggio in corso', () => {
  beforeAll(async () => {
    await Promise.all(GAME_VARIANTS.map(v => preloadVariantData(v)))
  })

  function memoryStorage(seed: Record<string, string> = {}) {
    const data = new Map<string, string>(Object.entries(seed))
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => { data.set(k, v) },
      removeItem: (k: string) => { data.delete(k) },
    } as unknown as Storage
  }

  /**
   * Simula un caricamento della pagina. L'app Vue finta serve perché Pinia
   * tiene i plugin in coda finché non viene installata su un'app.
   */
  function reload(storage: Storage) {
    const pinia = createPinia()
    pinia.use(createPersistedState({ storage }))
    createApp({}).use(pinia)
    setActivePinia(pinia)
  }

  it('il personaggio in corso torna dopo un ricaricamento', async () => {
    const storage = memoryStorage()
    reload(storage)
    const before = useCharacterStore()
    before.character.variant = 'brancalonia'
    before.character.name = 'Baldo'
    before.character.race = 'morgante'
    before.character.className = 'barbarian'
    before.character.level = 3
    await nextTick()

    reload(storage)
    const after = useCharacterStore()
    expect(after.character.name).toBe('Baldo')
    expect(after.character.className).toBe('barbarian')
    expect(after.character.level).toBe(3)
  })

  /**
   * Persistendo `character` rientra dall'archivio un oggetto che la vecchia
   * `migrateCharacters` non guardava nemmeno: iterava solo `savedCharacters`.
   */
  it('anche il personaggio in corso passa dalla migrazione', () => {
    const stored = JSON.stringify({
      character: {
        id: 'in-corso', variant: 'brancalonia', name: 'Fuorilegge',
        className: 'barbarian', level: 9,
      },
    })
    reload(memoryStorage({ character: stored }))

    const store = useCharacterStore()
    // Livello oltre il tetto della variante: va riportato al massimo
    expect(store.character.level).toBe(getMaxLevel('brancalonia'))
    // Campi aggiunti dopo: senza migrazione restavano undefined e facevano
    // esplodere ogni `.length` / `.find` sul multiclasse
    expect(Array.isArray(store.character.classes)).toBe(true)
    expect(store.character.sessionNotes).toBe('')
    expect(store.character.spellsKnownLimit).toBe(0)
  })
})

describe('levelUpSaved', () => {
  beforeAll(async () => {
    await Promise.all(GAME_VARIANTS.map(v => preloadVariantData(v)))
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /**
   * L'elenco personaggi faceva `loadCharacter(id)` prima di `levelUp()`:
   * salire di livello una scheda dell'archivio buttava via, senza chiedere,
   * il personaggio che si stava costruendo.
   */
  it('non tocca il personaggio in costruzione', () => {
    const store = useCharacterStore()
    store.character.name = 'In Costruzione'
    store.character.race = 'elf'
    store.character.className = 'wizard'
    store.character.level = 1

    store.savedCharacters.push({
      ...store.character,
      id: 'archiviato', name: 'Archiviato', className: 'fighter',
      hitDie: 10, level: 2, maxHp: 20, classes: [],
    } as CharacterData)

    const result = store.levelUpSaved('archiviato')

    expect(result).not.toBeNull()
    expect(store.savedCharacters[0]!.level).toBe(3)
    expect(store.character.name).toBe('In Costruzione')
    expect(store.character.className).toBe('wizard')
    expect(store.character.level).toBe(1)
  })

  it('restituisce null oltre il tetto della variante e non cambia niente', () => {
    const store = useCharacterStore()
    const maxLv = getMaxLevel('brancalonia')
    store.savedCharacters.push({
      ...store.character,
      id: 'al-massimo', variant: 'brancalonia', className: 'barbarian',
      hitDie: 12, level: maxLv, maxHp: 60, classes: [],
    } as CharacterData)

    expect(store.levelUpSaved('al-massimo')).toBeNull()
    expect(store.savedCharacters[0]!.level).toBe(maxLv)
  })

  it('su un id sconosciuto non inventa niente', () => {
    const store = useCharacterStore()
    expect(store.levelUpSaved('mai-visto')).toBeNull()
  })
})

describe('hasUnsavedWork', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('è falso su un personaggio appena aperto', () => {
    expect(useCharacterStore().hasUnsavedWork).toBe(false)
  })

  it('è vero appena si sceglie una razza', () => {
    const store = useCharacterStore()
    store.character.race = 'human'
    expect(store.hasUnsavedWork).toBe(true)
  })

  it('è falso se quel personaggio è già nell\'archivio', () => {
    const store = useCharacterStore()
    store.character.race = 'human'
    store.savedCharacters.push({ ...store.character })
    expect(store.hasUnsavedWork).toBe(false)
  })
})


/**
 * Trascrizione di una scheda già esistente: i punti ferita scritti a mano sono
 * un dato del giocatore, non un derivato. Sulla carta vengono dai dadi tirati
 * al tavolo, che quasi mai coincidono con la media usata dal generatore, e
 * prima bastava ripassare dal livello per cancellarli.
 */
describe('PF scritti a mano', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  /** Guerriero di 5° con COS 13 (+1), PF calcolati dal generatore. */
  function fighterAt5() {
    const store = useCharacterStore()
    store.resetCharacter()
    store.character.variant = 'dnd5e'
    store.character.className = 'fighter'
    store.character.abilityScores = { str: 16, dex: 14, con: 13, int: 10, wis: 12, cha: 8 }
    store.character.level = 5
    store.syncClassAndLevel()
    return store
  }

  it('una scheda nuova nasce con i PF calcolati, non dichiarati', () => {
    const store = useCharacterStore()
    expect(store.character.hpManual).toBe(false)
    expect(store.character.armorClassOverride).toBe(0)
  })

  it('syncClassAndLevel non li tocca più, ma riallinea livello e privilegi', () => {
    const store = fighterAt5()
    const calcolati = store.character.maxHp
    expect(calcolati).toBeGreaterThan(0)

    // Il giocatore ricopia il 47 che ha sulla scheda
    store.character.maxHp = 47
    store.character.currentHp = 47
    store.character.hpManual = true

    store.character.level = 6
    store.syncClassAndLevel()

    expect(store.character.maxHp).toBe(47)
    expect(store.character.level).toBe(6)
    expect(store.character.hitDie).toBe(10)
    expect(store.character.maxHp).not.toBe(calcolati)
  })

  it('senza il contrassegno il ricalcolo resta quello di sempre', () => {
    const store = fighterAt5()
    store.character.maxHp = 47
    store.character.level = 6
    store.syncClassAndLevel()
    expect(store.character.maxHp).not.toBe(47)
  })

  it('la salita di livello aggiunge il suo incremento anche ai PF dichiarati', () => {
    // Al tavolo si tira comunque: il totale scritto a mano è la base, non un
    // valore congelato.
    const store = fighterAt5()
    store.character.maxHp = 47
    store.character.currentHp = 47
    store.character.hpManual = true

    const result = store.levelUp()
    expect(result).not.toBeNull()
    expect(store.character.maxHp).toBe(47 + result!.hpGained)
  })

  it('removeMulticlass riporta il livello ma lascia stare i PF dichiarati', () => {
    const store = fighterAt5()
    store.addMulticlass('wizard')
    store.character.maxHp = 52
    store.character.currentHp = 52
    store.character.hpManual = true

    store.removeMulticlass('wizard')

    expect(store.character.level).toBe(5)
    expect(store.character.maxHp).toBe(52)
  })

  it('togliendo il contrassegno i PF tornano quelli del dado vita', () => {
    const store = fighterAt5()
    const calcolati = store.character.maxHp
    store.character.maxHp = 47
    store.character.hpManual = true

    store.character.hpManual = false
    store.syncClassAndLevel()

    expect(store.character.maxHp).toBe(calcolati)
  })

  it('una scheda salvata prima della trascrizione a mano prende i valori neutri', async () => {
    const store = useCharacterStore()
    const vecchia = { ...store.character, id: 'vecchia' } as Record<string, unknown>
    delete vecchia.hpManual
    delete vecchia.armorClassOverride
    store.savedCharacters = [vecchia as unknown as CharacterData]
    // La migrazione è un watcher: scatta al tick dopo l'idratazione.
    await nextTick()

    expect(store.savedCharacters[0]!.hpManual).toBe(false)
    expect(store.savedCharacters[0]!.armorClassOverride).toBe(0)
  })
})

/**
 * L'import è testo che arriva da fuori: i due campi della trascrizione a mano
 * hanno il whitelist ma non il tipo, e un `hpManual: "si"` congelerebbe i PF
 * di chiunque apra quel file.
 */
describe('import dei valori scritti a mano', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  function importa(extra: Record<string, unknown>) {
    const store = useCharacterStore()
    return store.importJson(JSON.stringify({ ...makeMinimalCharacter(), ...extra })).data
  }

  it('accetta i valori ben formati', () => {
    const data = importa({ hpManual: true, armorClassOverride: 18 })
    expect(data.hpManual).toBe(true)
    expect(data.armorClassOverride).toBe(18)
  })

  it('scarta i tipi sbagliati tornando ai valori neutri', () => {
    const data = importa({ hpManual: 'si', armorClassOverride: 'tanta' })
    expect(data.hpManual).toBe(false)
    expect(data.armorClassOverride).toBe(0)
  })

  it('scarta una CA fuori scala o non intera', () => {
    expect(importa({ armorClassOverride: -3 }).armorClassOverride).toBe(0)
    expect(importa({ armorClassOverride: 500 }).armorClassOverride).toBe(0)
    expect(importa({ armorClassOverride: 12.5 }).armorClassOverride).toBe(0)
  })
})
