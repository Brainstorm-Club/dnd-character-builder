import { describe, it, expect } from 'vitest'
import { spells } from './spells'

/**
 * Gli incantesimi vengono dallo SRD 5.1, un PDF in cui il piè di pagina
 * ("System Reference Document 5.0 156") cade in mezzo al testo quando una
 * descrizione scavalca la pagina. Nove ne erano rimaste segnate, e Fulmine
 * si fermava a "A creature takes 8d6" perdendo il tipo di danno.
 *
 * Ogni pagina dello SRD porta però due righe di piè di pagina, non una: sopra
 * al numero di pagina c'è la nota di licenza ("Not for resale. Permission
 * granted…"), e altri undici incantesimi se l'erano portata dentro.
 *
 * Come per i privilegi del 2024, qui si controlla la forma del testo: è lì
 * che un'estrazione andata storta si riconosce senza riaprire il manuale.
 */

/** Tutto ciò che nello SRD sta nel piè di pagina e non nella descrizione. */
const BOILERPLATE = [
  /(System )?Reference Document/i,
  /Not for resale/i,
  /Permission granted/i,
  /photocopy/i,
  /personal use only/i,
  /Open Game License/i,
  /All rights reserved/i,
  /Wizards of the Coast/i,
]

describe.each(spells.map(s => [s.name, s.description] as const))('%s', (_nome, testo) => {
  it('comincia da capo, non a metà frase', () => {
    expect(testo.trim()).toMatch(/^[A-Z“"'(]/)
  })

  it('arriva in fondo alla frase', () => {
    expect(testo.trim()).toMatch(/[.!?”"')]$/)
  })

  it.each(BOILERPLATE)('non si porta dentro il piè di pagina del manuale (%s)', pezzo => {
    expect(testo).not.toMatch(pezzo)
  })
})
