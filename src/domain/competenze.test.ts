import { describe, it, expect, beforeAll } from 'vitest'
import { classes as dnd5eClasses } from '@/data/dnd5e/classes'
import { dnd2024Classes } from '@/data/dnd2024/classes'
import { SKILLS } from '@/data/dnd5e/skills'
import { getClasses, preloadVariantData } from '@/data'
import type { CharacterClass } from '@/data/dnd5e/classes'
import type { GameVariant } from '@/stores/app'
import {
  getExpertiseGrants,
  getExpertiseCount,
  getExpertiseOptions,
  reconcileExpertise,
} from './competenze'

function classById(list: readonly CharacterClass[], id: string): CharacterClass {
  const cls = list.find(c => c.id === id)
  if (!cls) throw new Error(`classe "${id}" assente dai dati`)
  return cls
}

/** Livello a cui i dati collocano il privilegio indicato */
function featureLevel(cls: CharacterClass, featureId: string): number {
  const feature = cls.features.find(f => f.id === featureId)
  if (!feature) throw new Error(`privilegio "${featureId}" assente da ${cls.id}`)
  return feature.level
}

const allSkillIds = SKILLS.map(s => s.id)

describe('competenze raddoppiate — D&D 5e 2014', () => {
  const rogue = classById(dnd5eClasses, 'rogue')
  const bard = classById(dnd5eClasses, 'bard')

  it('il ladro ne prende 2 al 1° e 2 al 6°, come dice il manuale', () => {
    expect(featureLevel(rogue, 'expertise-rogue')).toBe(1)
    expect(featureLevel(rogue, 'expertise-rogue-6')).toBe(6)

    expect(getExpertiseCount(rogue, 'dnd5e', 1)).toBe(2)
    expect(getExpertiseCount(rogue, 'dnd5e', 5)).toBe(2)
    expect(getExpertiseCount(rogue, 'dnd5e', 6)).toBe(4)
    expect(getExpertiseCount(rogue, 'dnd5e', 20)).toBe(4)
  })

  it('il bardo ne prende 2 al 3° e 2 al 10°, e nulla prima', () => {
    expect(featureLevel(bard, 'expertise-bard')).toBe(3)
    expect(featureLevel(bard, 'expertise-bard-10')).toBe(10)

    expect(getExpertiseCount(bard, 'dnd5e', 2)).toBe(0)
    expect(getExpertiseCount(bard, 'dnd5e', 3)).toBe(2)
    expect(getExpertiseCount(bard, 'dnd5e', 9)).toBe(2)
    expect(getExpertiseCount(bard, 'dnd5e', 10)).toBe(4)
  })

  it('i privilegi tornano ordinati per livello, col nome da mostrare', () => {
    const grants = getExpertiseGrants(rogue, 'dnd5e', 20)
    expect(grants.map(g => g.level)).toEqual([1, 6])
    expect(grants.map(g => g.featureId)).toEqual(['expertise-rogue', 'expertise-rogue-6'])
    expect(grants.every(g => g.featureName.length > 0)).toBe(true)
    // Nessuna limitazione di elenco: il ladro sceglie fra tutte le sue competenze
    expect(grants.every(g => g.restrictedTo === undefined)).toBe(true)
  })

  it('le altre classi non ne concedono nessuna, nemmeno al 20°', () => {
    const senzaExpertise = dnd5eClasses.filter(c => c.id !== 'rogue' && c.id !== 'bard')
    expect(senzaExpertise.length).toBeGreaterThan(0)
    for (const cls of senzaExpertise) {
      expect(getExpertiseCount(cls, 'dnd5e', 20), cls.id).toBe(0)
    }
  })
})

describe('competenze raddoppiate — D&D 2024', () => {
  const rogue = classById(dnd2024Classes, 'rogue')
  const bard = classById(dnd2024Classes, 'bard')
  const ranger = classById(dnd2024Classes, 'ranger')
  const wizard = classById(dnd2024Classes, 'wizard')

  it('il ladro ne prende 2 al 1° e 2 al 6°', () => {
    expect(featureLevel(rogue, 'expertise')).toBe(1)
    expect(featureLevel(rogue, 'expertise-2')).toBe(6)

    expect(getExpertiseCount(rogue, 'dnd2024', 1)).toBe(2)
    expect(getExpertiseCount(rogue, 'dnd2024', 5)).toBe(2)
    expect(getExpertiseCount(rogue, 'dnd2024', 6)).toBe(4)
  })

  it('il bardo ne prende 2 al 2° e 2 al 9°: nel 2024 i livelli sono cambiati', () => {
    expect(featureLevel(bard, 'expertise')).toBe(2)
    expect(featureLevel(bard, 'expertise-d')).toBe(9)

    expect(getExpertiseCount(bard, 'dnd2024', 1)).toBe(0)
    expect(getExpertiseCount(bard, 'dnd2024', 2)).toBe(2)
    expect(getExpertiseCount(bard, 'dnd2024', 8)).toBe(2)
    expect(getExpertiseCount(bard, 'dnd2024', 9)).toBe(4)
  })

  it('il ranger ne prende 1 col Deft Explorer al 2° e 2 al 9°', () => {
    expect(featureLevel(ranger, 'deft-explorer')).toBe(2)
    expect(featureLevel(ranger, 'expertise')).toBe(9)

    expect(getExpertiseCount(ranger, 'dnd2024', 1)).toBe(0)
    expect(getExpertiseCount(ranger, 'dnd2024', 2)).toBe(1)
    expect(getExpertiseCount(ranger, 'dnd2024', 9)).toBe(3)
  })

  it('il mago ne prende 1 al 2°, ma solo fra le sei abilità dello Studioso', () => {
    expect(featureLevel(wizard, 'scholar')).toBe(2)

    const grants = getExpertiseGrants(wizard, 'dnd2024', 20)
    expect(grants).toHaveLength(1)
    expect(grants[0]!.count).toBe(1)
    expect(grants[0]!.restrictedTo).toEqual(
      ['arcana', 'history', 'investigation', 'medicine', 'nature', 'religion'],
    )
  })

  it('le classi senza Expertise restano a zero', () => {
    const conExpertise = new Set(['rogue', 'bard', 'ranger', 'wizard'])
    const altre = dnd2024Classes.filter(c => !conExpertise.has(c.id))
    expect(altre.length).toBeGreaterThan(0)
    for (const cls of altre) {
      expect(getExpertiseCount(cls, 'dnd2024', 20), cls.id).toBe(0)
    }
  })

  /**
   * Nei dati del 2024 il privilegio del ladro si chiama `expertise` e basta.
   * Cercare quell'id senza distinguere l'edizione avrebbe regalato competenze
   * raddoppiate a chiunque, in qualunque variante, avesse un privilegio con
   * quel nome — nel 2014 nessuno, ma la trappola resta aperta a ogni aggiunta.
   */
  it('la tabella del 2024 non si applica alle varianti sulle regole 2014', () => {
    expect(getExpertiseCount(rogue, 'dnd5e', 20)).toBe(0)
    expect(getExpertiseCount(ranger, 'brancalonia', 20)).toBe(0)
    expect(getExpertiseCount(wizard, 'apocalisse', 20)).toBe(0)
  })
})

describe('competenze raddoppiate — Brancalonia e Apocalisse', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
    await preloadVariantData('brancalonia')
    await preloadVariantData('apocalisse')
  })

  it('costruiscono sulle classi 2014 e ne ereditano le competenze raddoppiate', () => {
    for (const variant of ['brancalonia', 'apocalisse'] as GameVariant[]) {
      const rogue = classById(getClasses(variant), 'rogue')
      expect(getExpertiseCount(rogue, variant, 1), variant).toBe(2)
      expect(getExpertiseCount(rogue, variant, 6), variant).toBe(4)
    }
  })

  it('a Brancalonia il bardo si ferma a 2: il 10° livello non esiste (cap al 6°)', () => {
    const bard = classById(getClasses('brancalonia'), 'bard')
    expect(getExpertiseCount(bard, 'brancalonia', 6)).toBe(2)
  })

  it('il burattinaio, classe propria di Brancalonia, non ne concede', () => {
    const burattinaio = classById(getClasses('brancalonia'), 'burattinaio')
    expect(getExpertiseCount(burattinaio, 'brancalonia', 6)).toBe(0)
  })
})

describe('elenco delle abilità raddoppiabili', () => {
  const rogue = classById(dnd5eClasses, 'rogue')
  const wizard = classById(dnd2024Classes, 'wizard')

  it('offre solo le abilità in cui il personaggio è già competente', () => {
    const options = getExpertiseOptions(rogue, 'dnd5e', 1, ['stealth', 'perception'])
    expect(options).toEqual(['perception', 'stealth'])
  })

  it("torna sempre nell'ordine canonico, non in quello di scelta", () => {
    const scelte = ['survival', 'acrobatics', 'history']
    const options = getExpertiseOptions(rogue, 'dnd5e', 1, scelte)
    const atteso = allSkillIds.filter(id => scelte.includes(id))
    expect(options).toEqual(atteso)
    expect(options).not.toEqual(scelte)
  })

  it('scarta le voci che non sono abilità note', () => {
    // `skillProficiencies` è un elenco piatto: ci finiscono anche id storti
    // (per esempio "sleight of hand" con lo spazio invece del trattino).
    const options = getExpertiseOptions(rogue, 'dnd5e', 1, ['stealth', 'sleight of hand', "thieves' tools"])
    expect(options).toEqual(['stealth'])
  })

  it('senza privilegi maturati non offre nulla, anche se il personaggio è competente', () => {
    const bard = classById(dnd5eClasses, 'bard')
    expect(getExpertiseOptions(bard, 'dnd5e', 2, ['persuasion', 'performance'])).toEqual([])
  })

  it('lo Studioso del mago vede solo le abilità del suo elenco ristretto', () => {
    const options = getExpertiseOptions(wizard, 'dnd2024', 2, ['arcana', 'stealth', 'nature'])
    expect(options).toEqual(['arcana', 'nature'])
  })
})

describe('riallineamento della scelta', () => {
  it('toglie le competenze che non sono più fra le opzioni', () => {
    expect(reconcileExpertise(['stealth', 'arcana'], ['stealth', 'perception'], 2))
      .toEqual(['stealth'])
  })

  it("taglia l'eccedenza quando il numero concesso cala", () => {
    expect(reconcileExpertise(['stealth', 'perception', 'acrobatics'], ['stealth', 'perception', 'acrobatics'], 2))
      .toEqual(['stealth', 'perception'])
  })

  it('non lascia doppioni a rubare uno slot', () => {
    expect(reconcileExpertise(['stealth', 'stealth', 'perception'], ['stealth', 'perception'], 2))
      .toEqual(['stealth', 'perception'])
  })

  it("non modifica l'elenco ricevuto", () => {
    const current = ['stealth', 'arcana']
    const risultato = reconcileExpertise(current, ['stealth'], 2)
    expect(current).toEqual(['stealth', 'arcana'])
    expect(risultato).not.toBe(current)
  })

  it('con zero slot svuota la scelta', () => {
    expect(reconcileExpertise(['stealth'], ['stealth'], 0)).toEqual([])
  })
})
