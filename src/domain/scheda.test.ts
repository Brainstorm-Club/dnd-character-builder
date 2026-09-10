import { describe, it, expect } from 'vitest'
import {
  CARATTERISTICHE, punteggioTotale, modificatore, modificatori, tiroSalvezza, bonusAbilita, iniziativa,
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

/**
 * Il Factotum del bardo: metà competenza su ogni prova che non includa già la
 * competenza. Il difetto era che la scheda non ne teneva conto affatto — su un
 * arlecchino di 3° quattordici abilità su diciotto portavano il numero
 * sbagliato, e l'iniziativa pure.
 */
const factotum = {
  ...base,
  level: 3,
  skillProficiencies: ['athletics'],
  skillExpertise: [],
  featureEntries: [{ id: 'jack-of-all-trades', name: 'Jack of All Trades' }],
} as unknown as CharacterData

describe('mezza competenza sulla scheda', () => {
  it('si aggiunge dove la competenza piena non c\'è', () => {
    // Furtività: DES 14 → +2, più 1 di mezza competenza.
    expect(bonusAbilita(factotum, 'stealth', 'dex')).toBe(3)
  })

  it('ma non si somma a quella piena', () => {
    // Atletica: FOR 17 → +3, più 2 di competenza. Non 2 + 1.
    expect(bonusAbilita(factotum, 'athletics', 'str')).toBe(5)
  })

  it('e vale anche per l\'iniziativa, che è una prova di Destrezza', () => {
    expect(iniziativa(factotum)).toBe(3)
    expect(iniziativa(base), 'chi non ha il privilegio resta al modificatore').toBe(2)
  })

  it('senza il privilegio le abilità non competenti restano al modificatore', () => {
    expect(bonusAbilita(base, 'acrobatics', 'dex')).toBe(2)
  })
})
