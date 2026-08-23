import { describe, it, expect, beforeAll } from 'vitest'
import {
  originAbilityOptions,
  grantsOriginBonuses,
  originFeatName,
  originFeatId,
  originBonusMap,
  replaceOriginBonuses,
  readOriginChoice,
  NO_ORIGIN_CHOICE,
} from './origine2024'
import { getBackgrounds, preloadVariantData } from '@/data'
import { getFeatsByCategory } from '@/data/dnd2024/feats'
import type { Background } from '@/data/dnd5e/backgrounds'
import type { AbilityKey } from '@/data/dnd5e/classes'

const FEATS = [
  { id: 'alert', name: 'Alert' },
  { id: 'magic-initiate', name: 'Magic Initiate' },
  { id: 'savage-attacker', name: 'Savage Attacker' },
]

function bg(partial: Partial<Background>): Background {
  return {
    id: 'x',
    name: 'X',
    description: '',
    skillProficiencies: [],
    toolProficiencies: [],
    languages: 0,
    equipment: [],
    feature: { name: '', description: '' },
    ...partial,
  }
}

describe('origine 2024 — quali caratteristiche offre il background', () => {
  it('elenca le tre caratteristiche del background 2024', () => {
    expect(originAbilityOptions(bg({ abilityScoreOptions: ['int', 'wis', 'cha'] })))
      .toEqual(['int', 'wis', 'cha'])
  })

  it('non offre nulla per un background senza bonus (2014, Brancalonia, Apocalisse)', () => {
    expect(originAbilityOptions(bg({}))).toEqual([])
    expect(grantsOriginBonuses(bg({}))).toBe(false)
    expect(originAbilityOptions(null)).toEqual([])
  })

  it('scarta le sigle che non sono caratteristiche', () => {
    expect(originAbilityOptions(bg({ abilityScoreOptions: ['int', 'luck', 'CHA'] })))
      .toEqual(['int'])
  })

  it('con una sola caratteristica offerta non c\'è scelta da fare', () => {
    expect(grantsOriginBonuses(bg({ abilityScoreOptions: ['int'] }))).toBe(false)
    expect(grantsOriginBonuses(bg({ abilityScoreOptions: ['int', 'wis'] }))).toBe(true)
  })
})

describe('origine 2024 — talento d\'origine', () => {
  it('legge il nome del talento dal background', () => {
    expect(originFeatName(bg({ originFeat: 'Alert' }))).toBe('Alert')
    expect(originFeatName(bg({}))).toBe('')
  })

  it('risolve l\'id anche quando il background specifica la lista fra parentesi', () => {
    expect(originFeatId(bg({ originFeat: 'Magic Initiate (Cleric)' }), FEATS)).toBe('magic-initiate')
    expect(originFeatId(bg({ originFeat: 'Magic Initiate (Wizard)' }), FEATS)).toBe('magic-initiate')
    expect(originFeatId(bg({ originFeat: 'Alert' }), FEATS)).toBe('alert')
  })

  it('non inventa un id per un talento che il catalogo non ha', () => {
    expect(originFeatId(bg({ originFeat: 'Tough' }), FEATS)).toBe('')
    expect(originFeatId(bg({}), FEATS)).toBe('')
  })
})

describe('origine 2024 — bonus concessi dalla scelta', () => {
  const options: AbilityKey[] = ['int', 'wis', 'cha']

  it('dà +2 alla principale e +1 all\'altra', () => {
    expect(originBonusMap({ major: 'int', minor: 'wis' }, options)).toEqual({ int: 2, wis: 1 })
  })

  it('applica già il +2 quando il giocatore ha scelto solo quello', () => {
    expect(originBonusMap({ major: 'int', minor: '' }, options)).toEqual({ int: 2 })
  })

  it('non concede nulla finché non si sceglie', () => {
    expect(originBonusMap(NO_ORIGIN_CHOICE, options)).toEqual({})
  })

  it('non somma +2 e +1 sulla stessa caratteristica', () => {
    expect(originBonusMap({ major: 'int', minor: 'int' }, options)).toEqual({ int: 2 })
  })

  it('ignora una caratteristica che il background non offre', () => {
    expect(originBonusMap({ major: 'str', minor: 'dex' }, options)).toEqual({})
  })
})

describe('origine 2024 — sostituzione dei bonus sul personaggio', () => {
  it('toglie i bonus del background precedente invece di accumularli', () => {
    const dopoPrimo = replaceOriginBonuses({}, {}, { int: 2, con: 1 })
    const dopoSecondo = replaceOriginBonuses(dopoPrimo, { int: 2, con: 1 }, { cha: 2, dex: 1 })
    expect(dopoSecondo).toEqual({ cha: 2, dex: 1 })
  })

  it('non porta via i bonus della specie', () => {
    const conSpecie = { str: 2, con: 1 }
    const dopo = replaceOriginBonuses(conSpecie, {}, { int: 2, wis: 1 })
    expect(dopo).toEqual({ str: 2, con: 1, int: 2, wis: 1 })
    expect(replaceOriginBonuses(dopo, { int: 2, wis: 1 }, {})).toEqual({ str: 2, con: 1 })
  })

  it('somma sulla stessa caratteristica senza cancellare il bonus di specie', () => {
    const dopo = replaceOriginBonuses({ con: 1 }, {}, { con: 2 })
    expect(dopo).toEqual({ con: 3 })
    expect(replaceOriginBonuses(dopo, { con: 2 }, {})).toEqual({ con: 1 })
  })

  it('non lascia voci a zero', () => {
    expect(replaceOriginBonuses({ int: 2 }, { int: 2 }, {})).toEqual({})
  })

  it('non produce bonus negativi se la mappa è stata riscritta altrove', () => {
    // Il passo Specie riscrive `racialBonuses` da capo: il nostro +2 non c'è
    // più e sottrarlo lo stesso darebbe un malus che nessun manuale prevede.
    expect(replaceOriginBonuses({}, { int: 2 }, {})).toEqual({})
    expect(replaceOriginBonuses({ str: 2 }, { int: 2 }, { wis: 1 })).toEqual({ str: 2, wis: 1 })
  })

  it('non modifica l\'oggetto ricevuto', () => {
    const partenza = { int: 2 }
    replaceOriginBonuses(partenza, {}, { wis: 1 })
    expect(partenza).toEqual({ int: 2 })
  })
})

describe('origine 2024 — rilettura della scelta salvata', () => {
  const options: AbilityKey[] = ['int', 'wis', 'cha']

  it('ritrova la scelta dai bonus salvati', () => {
    expect(readOriginChoice({ int: 2, wis: 1 }, options)).toEqual({ major: 'int', minor: 'wis' })
  })

  it('ritrova anche una scelta a metà', () => {
    expect(readOriginChoice({ int: 2 }, options)).toEqual({ major: 'int', minor: '' })
  })

  it('su una scheda senza bonus non inventa scelte', () => {
    expect(readOriginChoice({}, options)).toEqual(NO_ORIGIN_CHOICE)
  })

  it('ignora i bonus su caratteristiche che il background non offre', () => {
    expect(readOriginChoice({ str: 2, dex: 1 }, options)).toEqual(NO_ORIGIN_CHOICE)
  })
})

describe('origine 2024 — sui dati veri dell\'SRD 5.2.1', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd2024')
  })

  it('ogni background 2024 offre tre caratteristiche e un talento d\'origine', () => {
    const feats = getFeatsByCategory('origin')
    const backgrounds = getBackgrounds('dnd2024')
    expect(backgrounds.length).toBeGreaterThan(0)
    for (const b of backgrounds) {
      expect(originAbilityOptions(b)).toHaveLength(3)
      expect(grantsOriginBonuses(b)).toBe(true)
      expect(originFeatName(b)).not.toBe('')
      expect(originFeatId(b, feats)).not.toBe('')
    }
  })

  it('nessun background del 2014 concede bonus di caratteristica', () => {
    for (const b of getBackgrounds('dnd5e')) {
      expect(grantsOriginBonuses(b)).toBe(false)
    }
  })
})
