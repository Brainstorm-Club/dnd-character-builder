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
  competenzeConcesse,
  mezzaCompetenza,
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

describe('competenze concesse d\'ufficio da un privilegio', () => {
  it('il Guappo di Brancalonia dà Intimidire', () => {
    // Il difetto segnalato: il privilegio compariva nell'elenco della scheda,
    // ma accanto a Intimidire restava il numero di chi non è competente.
    expect(competenzeConcesse(['competence-bonus'], 'brancalonia')).toEqual(['intimidation'])
  })

  it('e gli altri privilegi che concedono senza far scegliere', () => {
    expect(competenzeConcesse(['brigandage'], 'brancalonia')).toEqual(['nature', 'survival'])
    expect(competenzeConcesse(['treasure-seeker'], 'brancalonia')).toEqual(['investigation', 'perception'])
    expect(competenzeConcesse(['disheartening-presence'], 'brancalonia')).toEqual(['intimidation'])
    expect(competenzeConcesse(['master-of-performance'], 'brancalonia')).toEqual(['animal-handling', 'performance'])
    expect(competenzeConcesse(['improved-perception'], 'apocalisse')).toEqual(['perception'])
  })

  it('non ne dà due volte quando due privilegi concedono la stessa', () => {
    expect(competenzeConcesse(['competence-bonus', 'disheartening-presence'], 'brancalonia'))
      .toEqual(['intimidation'])
  })

  it('un privilegio di un\'altra ambientazione non vale in questa', () => {
    // Brancalonia e Apocalisse partono dalle stesse classi base: due
    // sottoclassi diverse possono avere privilegi con lo stesso id, e una
    // tabella sola prima o poi pescherebbe quello sbagliato.
    expect(competenzeConcesse(['improved-perception'], 'brancalonia')).toEqual([])
    expect(competenzeConcesse(['competence-bonus'], 'apocalisse')).toEqual([])
    expect(competenzeConcesse(['competence-bonus'], 'dnd5e')).toEqual([])
  })

  it('ogni abilità della tabella esiste davvero', () => {
    // Un id storto qui non fallisce: concede una competenza che non compare in
    // nessuna riga della scheda, e sparisce senza dire niente.
    const varianti: GameVariant[] = ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse']
    const ids = [
      'brigandage', 'competence-bonus', 'disheartening-presence',
      'master-of-performance', 'treasure-seeker', 'improved-perception',
    ]
    for (const v of varianti) {
      for (const s of competenzeConcesse(ids, v)) expect(allSkillIds).toContain(s)
    }
  })

  it('ogni privilegio della tabella esiste nei dati della sua variante', async () => {
    // Se i dati rinominano un privilegio, la competenza smette di arrivare in
    // silenzio: qui invece il test cade.
    await preloadVariantData('brancalonia')
    await preloadVariantData('apocalisse')
    /** @type {Record<GameVariant, string[]>} */
    const attesi: Partial<Record<GameVariant, string[]>> = {
      brancalonia: [
        'brigandage', 'competence-bonus', 'disheartening-presence',
        'master-of-performance', 'treasure-seeker',
      ],
      apocalisse: ['improved-perception'],
    }
    for (const [variante, ids] of Object.entries(attesi) as [GameVariant, string[]][]) {
      const presenti = new Set(
        getClasses(variante).flatMap(c => [
          ...c.features.map(f => f.id),
          ...c.subclasses.flatMap(s => s.features.map(f => f.id)),
        ]),
      )
      for (const id of ids) expect(presenti, `${variante}: ${id}`).toContain(id)
    }
  })
})

describe('mezza competenza (Factotum)', () => {
  it('metà del bonus di competenza, arrotondata per difetto', () => {
    // Bonus di competenza +2 fino al 4°, +3 dal 5°: metà fa 1 in entrambi i
    // casi, e 2 solo dal 9° in poi.
    expect(mezzaCompetenza({ level: 2, featureEntries: [{ id: 'jack-of-all-trades' }] })).toBe(1)
    expect(mezzaCompetenza({ level: 5, featureEntries: [{ id: 'jack-of-all-trades' }] })).toBe(1)
    expect(mezzaCompetenza({ level: 9, featureEntries: [{ id: 'jack-of-all-trades' }] })).toBe(2)
  })

  it('senza il privilegio non aggiunge niente', () => {
    expect(mezzaCompetenza({ level: 9, featureEntries: [{ id: 'expertise-bard' }] })).toBe(0)
    expect(mezzaCompetenza({ level: 9 })).toBe(0)
  })

  it('riconosce anche una scheda vecchia, che ha solo i nomi', () => {
    // `featureEntries` è arrivato dopo: le schede salvate prima portano ancora
    // il solo elenco piatto dei nomi inglesi, e devono contare lo stesso.
    expect(mezzaCompetenza({ level: 2, featuresTraits: ['Jack of All Trades'] })).toBe(1)
    expect(mezzaCompetenza({ level: 2, featuresTraits: ['Song of Rest'] })).toBe(0)
  })

  it('il bardo lo prende al livello che dicono i dati', () => {
    const bardo = classById(dnd5eClasses, 'bard')
    expect(featureLevel(bardo, 'jack-of-all-trades')).toBe(2)
  })
})
