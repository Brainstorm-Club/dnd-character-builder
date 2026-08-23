import { describe, it, expect } from 'vitest'
import { brancaloniaRules } from './rules'
import { brancaloniaBackgrounds } from './backgrounds'
import { translateGameTerm } from '@/i18n/gameTerms'

/**
 * I nomi delle lingue del Regno sono in inglese nei dati e tradotti in
 * gameTerms, come tutto il resto. Una era rimasta col nome italiano:
 * «Lingua Ignota», che l'edizione inglese usa una volta sola — nel glossario,
 * come glossa fra parentesi — mentre in gioco scrive sempre «Unknown
 * Language». Il risultato era una lingua italiana in mezzo a una scheda
 * inglese.
 */
describe('nomi delle lingue di Brancalonia', () => {
  const lingue = brancaloniaRules.languages

  it('sono tutti in inglese, come il resto dei dati', () => {
    for (const l of lingue) {
      expect(l.name, `«${l.name}» non è un nome inglese`).not.toBe('Lingua Ignota')
      expect(l.name).toMatch(/^[A-Z][A-Za-z' ]+$/)
    }
  })

  it('la Lingua Ignota si chiama Unknown Language e si traduce', () => {
    const l = lingue.find(x => x.id === 'lingua-ignota')
    expect(l, 'la lingua esiste ancora, solo con un altro nome').toBeDefined()
    expect(l!.name).toBe('Unknown Language')
    expect(translateGameTerm('Unknown Language', 'it', 'language')).toBe('Lingua Ignota')
  })

  it('le schede salvate prima del rinomino continuano a tradursi', () => {
    // Un personaggio salvato porta scritto il nome vecchio nel proprio elenco
    // di lingue: senza l'alias in gameTerms resterebbe non tradotto.
    expect(translateGameTerm('Lingua Ignota', 'it', 'language')).toBe('Lingua Ignota')
  })

  it('ogni lingua nominata da un background esiste davvero', () => {
    const noti = new Set(lingue.map(l => l.name))
    for (const bg of brancaloniaBackgrounds) {
      for (const nome of bg.languageNames ?? []) {
        expect(noti.has(nome), `${bg.name}: «${nome}» non è una lingua del Regno`).toBe(true)
      }
      // E il conteggio deve combaciare con i nomi, o il generatore ne
      // sorteggerebbe uno in più.
      if (bg.languageNames) expect(bg.languages, bg.name).toBe(bg.languageNames.length)
    }
  })
})
