import { describe, it as test, expect, beforeAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { setActivePinia, createPinia } from 'pinia'
import {
  CHARACTER_SCHEMA_VERSION,
  computeFeatureEntries,
  deriveFeatureEntries,
  featureNames,
  migrateCharacter,
} from './character'
import type { CharacterData, FeatureEntry } from './character'
import { computeArmorClass, armorIdFromName, findArmorById, armorSlug } from '@/utils/calculations'
import { decodeCharacterFromUrl, encodeCharacterToUrl, MAX_SHARE_DATA_LENGTH } from '@/utils/shareCharacter'
import { armor as armorTable } from '@/data/dnd5e/equipment'
import { preloadVariantData, getClasses, getRaces } from '@/data'
import { GAME_VARIANTS } from './app'

const FIXTURES = path.join(__dirname, '__fixtures__')

/**
 * Tre export veri, prodotti dal «🎲 Casuale» prima che lo schema 2 esistesse:
 * nessuno dei tre ha `armorId`, `featureEntries` o `schemaVersion`.
 */
function loadFixture(name: string): CharacterData {
  return JSON.parse(fs.readFileSync(path.join(FIXTURES, `${name}.json`), 'utf8')) as CharacterData
}

const FIXTURE_NAMES = [
  'reale-dnd5e-barbaro-10',
  'reale-dnd5e-chierico-3',
  'reale-dnd2024-guerriero-3',
] as const

/**
 * L'algoritmo con cui `featuresTraits` veniva costruito prima dello schema 2.
 * Copiato qui apposta: serve come metro di paragone indipendente: se
 * `computeFeatureEntries` cambiasse anche solo l'ordine di una riga, il
 * riepilogo e la scheda PDF mostrerebbero qualcosa di diverso da ieri.
 */
function computeFeaturesLegacy(char: CharacterData): string[] {
  const race = getRaces(char.variant).find(r => r.id === char.race)
  const subrace = race?.subraces.find(s => s.id === char.subrace)
  const out: string[] = [...(race?.traits ?? []), ...(subrace?.traits ?? [])]
  const allClasses = getClasses(char.variant)
  const entries = char.classes.length >= 2
    ? char.classes.map(c => ({ classId: c.classId, subclass: c.subclass, level: c.level }))
    : [{ classId: char.className, subclass: char.subclass, level: char.level }]
  for (const e of entries) {
    const cls = allClasses.find(c => c.id === e.classId)
    if (!cls) continue
    out.push(...cls.features.filter(f => f.level <= e.level).map(f => f.name))
    const sub = cls.subclasses.find(s => s.id === e.subclass)
    if (sub) out.push(...sub.features.filter(f => f.level <= e.level).map(f => f.name))
  }
  return out
}

/** Tutto quello che l'utente vede di una scheda, in un oggetto confrontabile. */
function visibleShape(c: CharacterData) {
  return {
    name: c.name,
    race: c.race,
    subrace: c.subrace,
    className: c.className,
    subclass: c.subclass,
    level: c.level,
    background: c.background,
    abilityScores: c.abilityScores,
    racialBonuses: c.racialBonuses,
    skillProficiencies: c.skillProficiencies,
    savingThrowProficiencies: c.savingThrowProficiencies,
    languages: c.languages,
    proficienciesOther: c.proficienciesOther,
    weapons: c.weapons,
    armor: c.armor,
    shield: c.shield,
    equipment: c.equipment,
    coins: c.coins,
    featuresTraits: c.featuresTraits,
    cantrips: c.cantrips,
    spellsKnown: c.spellsKnown,
    spellsPrepared: c.spellsPrepared,
    hitDie: c.hitDie,
    maxHp: c.maxHp,
    currentHp: c.currentHp,
    speed: c.speed,
    armorClass: computeArmorClass(c),
  }
}

describe('schema 2 della scheda: privilegi strutturati e slug d\'armatura', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of GAME_VARIANTS) await preloadVariantData(v)
  })

  // ───────────────────────────────────────────────────────────────────────
  // 1. Migrazione di una scheda salvata col formato vecchio
  // ───────────────────────────────────────────────────────────────────────

  describe('migrazione di un export reale scritto con lo schema 1', () => {
    for (const name of FIXTURE_NAMES) {
      test(`${name}: dopo la migrazione l'utente vede esattamente la stessa scheda`, () => {
        const saved = loadFixture(name)
        // Prova che si parte davvero dal formato vecchio.
        expect(saved.schemaVersion, 'la fixture non è più schema 1').toBeUndefined()
        expect(saved.armorId).toBeUndefined()
        expect(saved.featureEntries).toBeUndefined()

        const before = visibleShape(saved)
        const migrated = JSON.parse(JSON.stringify(saved)) as CharacterData
        migrateCharacter(migrated)

        expect(visibleShape(migrated)).toEqual(before)
        // La CA in particolare: il chierico in mezza armatura non deve
        // diventare un chierico senza armatura.
        expect(computeArmorClass(migrated)).toBe(computeArmorClass(saved))
      })

      test(`${name}: la migrazione aggiunge, non sostituisce`, () => {
        const saved = loadFixture(name)
        const migrated = JSON.parse(JSON.stringify(saved)) as CharacterData
        migrateCharacter(migrated)

        // Nessun campo del formato vecchio è sparito o è cambiato.
        for (const [key, value] of Object.entries(saved)) {
          expect((migrated as unknown as Record<string, unknown>)[key], `campo ${key}`).toEqual(value)
        }
        // E i campi nuovi ci sono.
        expect(migrated.schemaVersion).toBe(CHARACTER_SCHEMA_VERSION)
        expect(Array.isArray(migrated.featureEntries)).toBe(true)
        expect(typeof migrated.armorId).toBe('string')
      })

      test(`${name}: espandendo le voci si riottiene featuresTraits identico`, () => {
        const c = loadFixture(name)
        migrateCharacter(c)
        expect(featureNames(c.featureEntries!)).toEqual(c.featuresTraits)
      })

      test(`${name}: ogni voce dice id, provenienza e livello`, () => {
        const c = loadFixture(name)
        migrateCharacter(c)
        const sconosciute = c.featureEntries!.filter(e => e.source === 'unknown')
        expect(sconosciute.map(e => e.name), 'privilegi non riconducibili ai dati').toEqual([])
        for (const e of c.featureEntries!) {
          expect(e.id, `${e.name}: id vuoto`).not.toBe('')
          expect(e.sourceId, `${e.name}: sorgente senza id`).not.toBe('')
          expect(e.count).toBeGreaterThanOrEqual(1)
          expect(e.level).toBeGreaterThanOrEqual(0)
        }
      })
    }

    test('il barbaro di 10° non ha più righe ripetute: i doppioni si distinguono per livello', () => {
      const c = loadFixture('reale-dnd5e-barbaro-10')
      // Nel formato vecchio la stessa riga compariva due volte.
      expect(c.featuresTraits.filter(f => f === 'Ability Score Improvement')).toHaveLength(2)
      expect(c.featuresTraits.filter(f => f === 'Primal Path feature')).toHaveLength(2)

      migrateCharacter(c)
      const asi = c.featureEntries!.filter(e => e.name === 'Ability Score Improvement')
      expect(asi.map(e => e.level)).toEqual([4, 8])
      const archetipo = c.featureEntries!.filter(e => e.name === 'Primal Path feature')
      expect(archetipo.map(e => e.level)).toEqual([6, 10])

      // Nessuna coppia di voci resta indistinguibile.
      const chiavi = c.featureEntries!.map(e => `${e.source}|${e.sourceId}|${e.id}|${e.level}`)
      expect(new Set(chiavi).size).toBe(chiavi.length)
    })

    test('id e nomi non sono più mescolati: il tratto razziale si riconosce dalla provenienza', () => {
      const c = loadFixture('reale-dnd5e-chierico-3')
      migrateCharacter(c)
      const entries = c.featureEntries!
      const draconica = entries.find(e => e.name === 'draconic-ancestry')!
      expect(draconica.source).toBe('race')
      expect(draconica.sourceId).toBe('dragonborn')
      expect(draconica.level).toBe(0)

      const dominio = entries.find(e => e.name === 'Divine Domain')!
      expect(dominio.source).toBe('class')
      expect(dominio.sourceId).toBe('cleric')
      expect(dominio.id).not.toBe(dominio.name)

      const discepolo = entries.find(e => e.name === 'Disciple of Life')!
      expect(discepolo.source).toBe('subclass')
      expect(discepolo.sourceId).toBe('life')
    })

    test('lo slug d\'armatura si aggancia senza normalizzare due grafie', () => {
      const chierico = loadFixture('reale-dnd5e-chierico-3')
      migrateCharacter(chierico)
      expect(chierico.armor).toBe('Half Plate')
      expect(chierico.armorId).toBe('half-plate')

      const guerriero = loadFixture('reale-dnd2024-guerriero-3')
      migrateCharacter(guerriero)
      expect(guerriero.armor).toBe('Chain Mail')
      expect(guerriero.armorId).toBe('chain-mail')
      // Il difetto che questo campo esiste per evitare: cotta di maglia, CA 16.
      expect(computeArmorClass(guerriero)).toBe(16)

      const barbaro = loadFixture('reale-dnd5e-barbaro-10')
      migrateCharacter(barbaro)
      expect(barbaro.armor).toBe('')
      expect(barbaro.armorId).toBe('')
    })

    test('migrare due volte non cambia niente', () => {
      const c = loadFixture('reale-dnd5e-barbaro-10')
      migrateCharacter(c)
      const primo = JSON.parse(JSON.stringify(c))
      migrateCharacter(c)
      expect(c).toEqual(primo)
    })

    test('un privilegio che i dati non conoscono resta come voce onesta, col nome intatto', () => {
      const c = loadFixture('reale-dnd5e-barbaro-10')
      c.featuresTraits = [...c.featuresTraits, 'Privilegio della casa']
      migrateCharacter(c)
      const inventato = c.featureEntries!.find(e => e.name === 'Privilegio della casa')!
      expect(inventato.source).toBe('unknown')
      expect(inventato.sourceId).toBe('')
      // Nessun nome si perde, e l'elenco piatto resta quello salvato.
      expect(featureNames(c.featureEntries!)).toEqual(c.featuresTraits)
    })
  })

  // ───────────────────────────────────────────────────────────────────────
  // 2. Link di condivisione generato PRIMA della modifica
  // ───────────────────────────────────────────────────────────────────────

  describe('link generati prima dello schema 2', () => {
    /**
     * Link vero prodotto dal codificatore di HEAD~ (54 chiavi brevi, senza
     * 'fx' né 'ai') a partire da `reale-dnd5e-chierico-3.json`.
     */
    const LINK_VECCHIO =
      'eyJ2IjoiZG5kNWUiLCJuIjoiVWxyaWMiLCJyIjoiZHJhZ29uYm9ybiIsImMiOiJjbGVyaWMiLCJzYyI6ImxpZmUiLCJsdiI6MywiYmciOiJzYWlsb3IiLCJhbCI6InRuIiwiYXMiOnsic3RyIjoxMiwiZGV4IjoxMywiY29uIjoxNSwiaW50IjoxMiwid2lzIjoxNywiY2hhIjoxM30sInJiIjp7InN0ciI6MiwiY2hhIjoxfSwic3AiOlsicGVyc3Vhc2lvbiIsImhpc3RvcnkiLCJhdGhsZXRpY3MiLCJwZXJjZXB0aW9uIl0sInN0IjpbIndpcyIsImNoYSJdLCJoZCI6OCwiaHAiOjI0LCJhciI6IkhhbGYgUGxhdGUiLCJ3cCI6W3sibmFtZSI6IkphdmVsaW4iLCJhdHRhY2tCb251cyI6NCwiZGFtYWdlIjoiMWQ2KzIifV0sImN0IjpbImd1aWRhbmNlIiwibWVuZGluZyIsImxpZ2h0Il0sInNrIjpbIjEtcHJvdGVjdGlvbi1mcm9tLWV2aWwtYW5kLWdvb2QiLCIyLWxvY2F0ZS1vYmplY3QiLCIxLWN1cmUtd291bmRzIiwiMi1maW5kLXRyYXBzIiwiMi1jYWxtLWVtb3Rpb25zIiwiMi1nZW50bGUtcmVwb3NlIl0sInNhIjoid2lzIiwic3giOiJjbGVyaWMiLCJlcSI6WyJtYWNlIiwic2NhbGUgbWFpbCIsImxpZ2h0IGNyb3NzYm93IGFuZCAyMCBib2x0cyIsInByaWVzdC1wYWNrIiwic2hpZWxkIiwiaG9seSBzeW1ib2wiLCJBIGJlbGF5aW5nIHBpbiAoY2x1YikiLCI1MCBmZWV0IG9mIHNpbGsgcm9wZSIsIkEgbHVja3kgY2hhcm0gc3VjaCBhcyBhIHJhYmJpdCdzIGZvb3Qgb3IgYSBzbWFsbCBzdG9uZSB3aXRoIGEgaG9sZSBpbiB0aGUgY2VudGVyIiwiQSBzZXQgb2YgY29tbW9uIGNsb3RoZXMiLCJBIGJlbHQgcG91Y2ggY29udGFpbmluZyAxMCBncCJdLCJwdCI6Ikkgc2VlIHNpZ25zIGFuZCBvbWVucyBpbiBldmVyeWRheSBldmVudHMuIE15IGZhaXRoIGdpdmVzIG1lIHN0cmVuZ3RoIGluIGRhcmsgdGltZXMuIiwiaWQiOiJGYWl0aC4gVGhlIGRpdmluZSBoYXMgYSBwbGFuLCBhbmQgSSBhbSBpdHMgaW5zdHJ1bWVudC4iLCJibyI6Ikkgd2lsbCBkbyBhbnl0aGluZyB0byBwcm90ZWN0IG15IHRlbXBsZSBhbmQgaXRzIGNvbmdyZWdhdGlvbi4iLCJmbCI6IkkganVkZ2Ugb3RoZXJzIGhhcnNobHkgd2hvIGRvIG5vdCBzaGFyZSBteSBiZWxpZWZzLiIsImFnIjoiMTA1IiwiaHQiOiI2JzdcIiIsInd0IjoiMTY3IGxicyIsImV5IjoiSGF6ZWwiLCJociI6IlNpbHZlciIsInNuIjoiR3JlZW4iLCJodSI6MTAsImZ0IjpbImRyYWNvbmljLWFuY2VzdHJ5IiwiYnJlYXRoLXdlYXBvbiIsImRhbWFnZS1yZXNpc3RhbmNlIiwiU3BlbGxjYXN0aW5nIiwiRGl2aW5lIERvbWFpbiIsIkNoYW5uZWwgRGl2aW5pdHkiLCJDaGFubmVsIERpdmluaXR5OiBUdXJuIFVuZGVhZCIsIkJvbnVzIFByb2ZpY2llbmN5IiwiRGlzY2lwbGUgb2YgTGlmZSJdLCJsZyI6WyJDb21tb24iLCJEcmFjb25pYyJdLCJwbyI6WyJsaWdodCIsIm1lZGl1bSIsInNoaWVsZHMiLCJzaW1wbGUiLCJOYXZpZ2F0b3IncyB0b29scyIsIlZlaGljbGVzICh3YXRlcikiXSwiY28iOnsiY3AiOjAsInNwIjowLCJlcCI6MCwiZ3AiOjM4LCJwcCI6MH0sImNocCI6MjQsInNwZCI6MzAsInN6IjoiTWVkaXVtIn0'

    test('un link vecchio si decodifica ancora intero', () => {
      const decoded = decodeCharacterFromUrl(LINK_VECCHIO)
      const atteso = loadFixture('reale-dnd5e-chierico-3')
      expect(decoded.variant).toBe('dnd5e')
      expect(decoded.name).toBe(atteso.name)
      expect(decoded.race).toBe('dragonborn')
      expect(decoded.className).toBe('cleric')
      expect(decoded.subclass).toBe('life')
      expect(decoded.level).toBe(3)
      expect(decoded.armor).toBe('Half Plate')
      expect(decoded.featuresTraits).toEqual(atteso.featuresTraits)
      expect(decoded.abilityScores).toEqual(atteso.abilityScores)
      expect(decoded.maxHp).toBe(atteso.maxHp)
      // I campi nuovi semplicemente non ci sono: nessun errore.
      expect(decoded.armorId).toBeUndefined()
      expect(decoded.featureEntries).toBeUndefined()
    })

    test('un link vecchio, una volta migrato, dà la stessa CA di prima', () => {
      const decoded = decodeCharacterFromUrl(LINK_VECCHIO)
      const atteso = loadFixture('reale-dnd5e-chierico-3')
      const ricostruito = { ...atteso, ...decoded } as CharacterData
      const caPrima = computeArmorClass(atteso)
      migrateCharacter(ricostruito)
      expect(computeArmorClass(ricostruito)).toBe(caPrima)
      expect(ricostruito.armorId).toBe('half-plate')
      expect(featureNames(ricostruito.featureEntries!)).toEqual(atteso.featuresTraits)
    })

    test('i campi nuovi sopravvivono al giro di andata e ritorno', () => {
      const c = loadFixture('reale-dnd5e-barbaro-10')
      migrateCharacter(c)
      const decoded = decodeCharacterFromUrl(encodeCharacterToUrl(c))
      expect(decoded.armorId).toBe(c.armorId === '' ? undefined : c.armorId)
      expect(decoded.featureEntries).toEqual(c.featureEntries)
      expect(decoded.featuresTraits).toEqual(c.featuresTraits)
    })

    test('il link resta abbondantemente sotto il tetto anche col campo in più', () => {
      for (const name of FIXTURE_NAMES) {
        const c = loadFixture(name)
        migrateCharacter(c)
        expect(encodeCharacterToUrl(c).length, name).toBeLessThan(MAX_SHARE_DATA_LENGTH)
      }
    })
  })

  // ───────────────────────────────────────────────────────────────────────
  // 3. L'elenco piatto non cambia mai, per nessuna combinazione
  // ───────────────────────────────────────────────────────────────────────

  describe('featuresTraits resta quello di prima', () => {
    for (const variant of GAME_VARIANTS) {
      test(`${variant}: ogni classe, sottoclasse e livello produce la stessa lista`, () => {
        const classi = getClasses(variant)
        const razze = getRaces(variant)
        expect(classi.length, `${variant}: dati non caricati`).toBeGreaterThan(0)
        let combinazioni = 0
        for (const cls of classi) {
          for (const sub of ['', ...cls.subclasses.map(s => s.id)]) {
            for (const level of [1, 3, 5, 8, 10, 20]) {
              for (const race of [razze[0]!, razze[razze.length - 1]!]) {
                const char = {
                  variant,
                  race: race.id,
                  subrace: race.subraces[0]?.id ?? '',
                  className: cls.id,
                  subclass: sub,
                  level,
                  classes: [],
                } as unknown as CharacterData
                expect(featureNames(computeFeatureEntries(char)), `${variant}/${cls.id}/${sub}/${level}`)
                  .toEqual(computeFeaturesLegacy(char))
                combinazioni++
              }
            }
          }
        }
        expect(combinazioni).toBeGreaterThan(50)
      })
    }
  })

  // ───────────────────────────────────────────────────────────────────────
  // 4. Slug d'armatura
  // ───────────────────────────────────────────────────────────────────────

  describe('slug d\'armatura', () => {
    test('ogni armatura di listino ha uno slug distinto che la ritrova', () => {
      const slugs = armorTable.map(a => armorSlug(a.name))
      expect(new Set(slugs).size, `slug duplicati: ${slugs}`).toBe(slugs.length)
      for (const a of armorTable) {
        expect(armorIdFromName(a.name)).toBe(armorSlug(a.name))
        expect(findArmorById(armorSlug(a.name))?.name).toBe(a.name)
      }
    })

    test('un nome che non è un\'armatura non produce uno slug fasullo', () => {
      expect(armorIdFromName('')).toBe('')
      expect(armorIdFromName('Cotta di maglia')).toBe('')
      expect(findArmorById('')).toBeUndefined()
      expect(findArmorById('cotta-di-maglia')).toBeUndefined()
    })

    test('la CA non cambia per nessuna armatura, con o senza slug', () => {
      const base = {
        abilityScores: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
        racialBonuses: {},
        shield: false,
        className: 'fighter',
        classes: [],
      }
      for (const a of armorTable) {
        const soloNome = computeArmorClass({ ...base, armor: a.name })
        const conSlug = computeArmorClass({ ...base, armor: a.name, armorId: armorSlug(a.name) })
        expect(conSlug, a.name).toBe(soloNome)
        // Anche partendo dal solo slug, come farebbe un consumatore esterno.
        expect(computeArmorClass({ ...base, armor: '', armorId: armorSlug(a.name) }), a.name)
          .toBe(soloNome)
      }
    })

    test('il nome resta la fonte primaria: uno slug rimasto indietro non ha voce in capitolo', () => {
      const c = {
        abilityScores: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
        racialBonuses: {},
        shield: false,
        className: 'fighter',
        classes: [],
        armor: 'Chain Mail',
        armorId: 'padded',
      }
      expect(computeArmorClass(c)).toBe(16)
    })
  })

  // ───────────────────────────────────────────────────────────────────────
  // 5. Le due strade verso le voci strutturate concordano
  // ───────────────────────────────────────────────────────────────────────

  test('ricostruire dai nomi salvati dà lo stesso risultato di calcolare dai dati', () => {
    for (const name of FIXTURE_NAMES) {
      const c = loadFixture(name)
      const dalCalcolo = computeFeatureEntries(c)
      const daiNomi = deriveFeatureEntries(c)
      expect(featureNames(dalCalcolo), name).toEqual(featureNames(daiNomi))
      const chiave = (e: FeatureEntry) => `${e.id}|${e.source}|${e.sourceId}|${e.level}|${e.count}`
      expect(dalCalcolo.map(chiave), name).toEqual(daiNomi.map(chiave))
    }
  })
})
