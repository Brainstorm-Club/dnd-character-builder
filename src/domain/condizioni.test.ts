import { describe, it, expect } from 'vitest'
import { annotaCondizioni, formeDelNome } from './condizioni'
import type { Condition } from '@/data/dnd5e/conditions'

const CONDIZIONI: Condition[] = [
  { id: 'frightened', name: 'Frightened', nameIt: 'Spaventato', descriptionIt: null },
  { id: 'prone', name: 'Prone', nameIt: 'Prono', descriptionIt: null },
  { id: 'invisible', name: 'Invisible', nameIt: 'Invisibile', descriptionIt: 'testo' },
  { id: 'unconscious', name: 'Unconscious', nameIt: 'Privo di sensi', descriptionIt: 'testo' },
  { id: 'charmed', name: 'Charmed', nameIt: 'Affascinato', descriptionIt: 'testo' },
]

/** Solo i pezzi agganciati a una condizione. */
function agganci(segmenti: { testo: string; condizione?: Condition }[]) {
  return segmenti.filter(s => s.condizione).map(s => [s.condizione!.id, s.testo])
}

describe('forme del nome', () => {
  it('flette gli aggettivi italiani, che nel manuale si accordano', () => {
    expect(formeDelNome('Spaventato', 'it')).toBe('Spaventat[oaie]')
    expect(formeDelNome('Invisibile', 'it')).toBe('Invisibil[ei]')
  })

  it('flette solo la prima parola: «privo di sensi», non «di sensa»', () => {
    expect(formeDelNome('Privo di sensi', 'it')).toBe('Priv[oaie] di sensi')
  })

  it('in inglese cerca la parola così com\'è', () => {
    expect(formeDelNome('Frightened', 'en')).toBe('Frightened')
  })
})

describe('condizioni citate in un testo', () => {
  it('aggancia le forme flesse, non solo il maschile singolare', () => {
    const s = annotaCondizioni('La creatura è spaventata e le altre restano affascinate.', CONDIZIONI, 'it')
    expect(agganci(s)).toEqual([['frightened', 'spaventata'], ['charmed', 'affascinate']])
  })

  it('non spezza una parola più lunga che contiene il nome', () => {
    // «invisibilità» non è «invisibile»: senza il controllo di confine il
    // bottone si sarebbe aperto in mezzo alla parola.
    const s = annotaCondizioni('Lancia invisibilità e diventa invisibile.', CONDIZIONI, 'it')
    expect(agganci(s)).toEqual([['invisible', 'invisibile']])
  })

  it('preferisce il nome lungo a quello corto', () => {
    const s = annotaCondizioni('Il bersaglio è privo di sensi.', CONDIZIONI, 'it')
    expect(agganci(s)).toEqual([['unconscious', 'privo di sensi']])
  })

  it('conserva il testo intero, pezzo per pezzo', () => {
    const testo = 'Il bersaglio è spaventato fino alla fine del turno.'
    const s = annotaCondizioni(testo, CONDIZIONI, 'it')
    expect(s.map(x => x.testo).join('')).toBe(testo)
  })

  it('in inglese aggancia i nomi inglesi', () => {
    const s = annotaCondizioni('The target is Frightened and knocked Prone.', CONDIZIONI, 'en')
    expect(agganci(s)).toEqual([['frightened', 'Frightened'], ['prone', 'Prone']])
  })

  it('in inglese non usa i nomi italiani (e viceversa)', () => {
    expect(agganci(annotaCondizioni('è spaventato', CONDIZIONI, 'en'))).toEqual([])
    expect(agganci(annotaCondizioni('is frightened', CONDIZIONI, 'it'))).toEqual([])
  })

  it('senza citazioni torna un solo pezzo, e senza dati non tocca il testo', () => {
    expect(annotaCondizioni('Un testo qualunque.', CONDIZIONI, 'it')).toEqual([{ testo: 'Un testo qualunque.' }])
    // Le condizioni arrivano su richiesta: prima che il modulo sia caricato la
    // lista è vuota, e il testo deve restare leggibile lo stesso.
    expect(annotaCondizioni('è spaventato', [], 'it')).toEqual([{ testo: 'è spaventato' }])
  })
})
