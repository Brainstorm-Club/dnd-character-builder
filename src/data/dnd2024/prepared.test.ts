import { describe, it, expect } from 'vitest'
import { DND2024_PREPARED_SPELLS, getPreparedSpells2024 } from './prepared'
import { dnd2024Classes } from './classes'

/**
 * La colonna «Incantesimi preparati» delle tabelle di classe 2024, confrontata
 * classe per classe e livello per livello con l'SRD 5.2.1.
 *
 * I numeri qui sotto sono trascritti a mano dal manuale e non generati dallo
 * stesso script che scrive `prepared.ts`: se lo fossero, il test dimostrerebbe
 * soltanto che lo script è d'accordo con sé stesso.
 */
const DA_MANUALE: Record<string, number[]> = {
  bard:     [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  cleric:   [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  druid:    [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  paladin:  [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  ranger:   [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  sorcerer: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  warlock:  [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  wizard:   [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
}

describe('incantesimi preparati 2024', () => {
  it('copre esattamente le otto classi incantatrici del 2024', () => {
    const conTabella = Object.keys(DND2024_PREPARED_SPELLS).sort()
    const chePreparano = dnd2024Classes
      .filter(c => c.spellcasting?.preparedCaster)
      .map(c => c.id)
      .sort()
    expect(conTabella).toEqual(chePreparano)
    expect(conTabella).toHaveLength(8)
  })

  for (const [classe, attesa] of Object.entries(DA_MANUALE)) {
    it(`${classe}: la progressione dal 1° al 20° livello è quella del manuale`, () => {
      expect(DND2024_PREPARED_SPELLS[classe]).toEqual(attesa)
      for (let livello = 1; livello <= 20; livello++) {
        expect(getPreparedSpells2024(classe, livello), `${classe} al ${livello}°`)
          .toBe(attesa[livello - 1])
      }
    })
  }

  // Il controllo che smaschera un'estrazione sbagliata: il mago non segue gli
  // altri incantatori pieni nella coda della tabella. Se coincidessero, la
  // colonna letta dal PDF sarebbe quella di un'altra classe.
  it('il mago diverge dagli altri incantatori pieni dal 13° livello in su', () => {
    const mago = DND2024_PREPARED_SPELLS.wizard!
    const bardo = DND2024_PREPARED_SPELLS.bard!
    expect(mago.slice(0, 12)).toEqual(bardo.slice(0, 12))
    expect(mago.slice(12)).not.toEqual(bardo.slice(12))
    // La coda esatta, livello per livello, dall'11° al 20°.
    expect(mago.slice(10)).toEqual([16, 16, 17, 18, 19, 21, 22, 23, 24, 25])
    // Al 20° il mago ne prepara tre in più del bardo, non lo stesso numero.
    expect(mago[19]).toBe(25)
    expect(bardo[19]).toBe(22)
  })

  it('mezzi incantatori e warlock hanno progressioni proprie', () => {
    expect(DND2024_PREPARED_SPELLS.paladin).toEqual(DND2024_PREPARED_SPELLS.ranger)
    expect(DND2024_PREPARED_SPELLS.paladin).not.toEqual(DND2024_PREPARED_SPELLS.bard)
    expect(DND2024_PREPARED_SPELLS.warlock).not.toEqual(DND2024_PREPARED_SPELLS.paladin)
    // Lo stregone parte da 2 come i mezzi incantatori, ma al 3° ha già raggiunto
    // gli altri incantatori pieni.
    expect(DND2024_PREPARED_SPELLS.sorcerer![0]).toBe(2)
    expect(DND2024_PREPARED_SPELLS.sorcerer!.slice(2)).toEqual(DND2024_PREPARED_SPELLS.bard!.slice(2))
  })

  it('ogni progressione è di 20 valori interi che non calano mai', () => {
    for (const [classe, tabella] of Object.entries(DND2024_PREPARED_SPELLS)) {
      expect(tabella, classe).toHaveLength(20)
      tabella.forEach((n, i) => {
        expect(Number.isInteger(n) && n >= 1, `${classe} al ${i + 1}°`).toBe(true)
        if (i > 0) expect(n, `${classe} al ${i + 1}°`).toBeGreaterThanOrEqual(tabella[i - 1]!)
      })
    }
  })

  it('fuori intervallo si aggancia al primo e all\'ultimo livello, e le classi ignote restano null', () => {
    expect(getPreparedSpells2024('wizard', 0)).toBe(4)
    expect(getPreparedSpells2024('wizard', 25)).toBe(25)
    expect(getPreparedSpells2024('fighter', 5)).toBeNull()
    expect(getPreparedSpells2024('burattinaio', 5)).toBeNull()
  })
})
