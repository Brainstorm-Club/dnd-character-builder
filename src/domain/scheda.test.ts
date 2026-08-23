import { describe, it, expect } from 'vitest'
import {
  CARATTERISTICHE, punteggioTotale, modificatore, modificatori, tiroSalvezza, bonusAbilita,
} from './scheda'
import type { CharacterData } from '@/stores/character'

/**
 * Questi conti stavano nei getter dello store, quindi la pagina di un
 * personaggio pronto — che nello store non ci passa — non poteva usarli e si
 * era scritta la propria versione, più povera. Qui sono puri: prendono il
 * personaggio e basta.
 */
const base = {
  abilityScores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  racialBonuses: { str: 2, con: 1 },
  savingThrowProficiencies: ['str', 'con'],
  skillProficiencies: ['athletics', 'stealth'],
  skillExpertise: ['stealth'],
  level: 5,
} as unknown as CharacterData

describe('valori derivati della scheda', () => {
  it('somma i bonus al punteggio base', () => {
    expect(punteggioTotale(base, 'str')).toBe(17)
    expect(punteggioTotale(base, 'dex'), 'senza bonus resta il base').toBe(14)
  })

  it('ricava il modificatore dal punteggio pieno, non da quello base', () => {
    // 15 darebbe +2, ma con il +2 razziale il punteggio è 17 e il modificatore +3.
    expect(modificatore(base, 'str')).toBe(3)
    expect(modificatori(base)).toEqual({ str: 3, dex: 2, con: 2, int: 1, wis: 0, cha: -1 })
    expect(CARATTERISTICHE).toHaveLength(6)
  })

  it('aggiunge la competenza al tiro salvezza solo dove la classe la dà', () => {
    expect(tiroSalvezza(base, 'str'), 'competente: +3 e +3').toBe(6)
    expect(tiroSalvezza(base, 'dex'), 'non competente: solo il modificatore').toBe(2)
  })

  it('conta la competenza due volte quando l’abilità è raddoppiata', () => {
    expect(bonusAbilita(base, 'athletics', 'str'), 'competente').toBe(6)
    expect(bonusAbilita(base, 'stealth', 'dex'), 'raddoppiata: +2 e due volte +3').toBe(8)
    expect(bonusAbilita(base, 'arcana', 'int'), 'né l’una né l’altra').toBe(1)
  })
})
