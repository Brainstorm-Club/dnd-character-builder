import { describe, it, expect } from 'vitest'
import { dnd2024Classes } from './classes'

/**
 * I testi del 2024 sono stati estratti dallo SRD 5.2.1, che è impaginato su
 * due colonne. Linearizzare la pagina invece di ritagliare le colonne una per
 * una incollava insieme pezzi che sul manuale sono lontani: un privilegio
 * iniziava a metà parola ("stitution scores increase by 4"), un altro si
 * portava dentro una tabella ("Second Weapon Wind Mastery 2 3 2 3 2 3"), un
 * terzo si fermava a metà frase. Erano 60 descrizioni su 307.
 *
 * Questi controlli non giudicano il contenuto — per quello ci sono le fonti —
 * ma la forma, che è dove l'estrazione sbagliata si vede a occhio nudo.
 */
const privilegi = dnd2024Classes.flatMap(c => [
  ...c.features.map(f => ({ cls: c.id, sub: '', f })),
  ...c.subclasses.flatMap(s => s.features.map(f => ({ cls: c.id, sub: s.id, f }))),
])

describe('descrizioni delle sottoclassi 2024', () => {
  const sottoclassi = dnd2024Classes.flatMap(c => c.subclasses)

  it('sono dodici, una per classe', () => {
    expect(sottoclassi).toHaveLength(12)
  })

  it('nessuna è rimasta al segnaposto con cui erano nate', () => {
    for (const s of sottoclassi) {
      expect(s.description).not.toMatch(/subclass from the SRD/)
      expect(s.description.length).toBeGreaterThan(80)
    }
  })

  it('aprono con il sottotitolo del manuale e proseguono con la prosa', () => {
    for (const s of sottoclassi) {
      expect(s.description.trim()).toMatch(/^[A-Z]/)
      expect(s.description.trim()).toMatch(/[.!?”"']$/)
    }
  })
})

describe('descrizioni dei privilegi 2024', () => {
  it('ce n’è una per ogni privilegio', () => {
    expect(privilegi.length).toBeGreaterThan(300)
    for (const { f } of privilegi) expect(f.description.length).toBeGreaterThan(20)
  })

  describe.each(privilegi.map(p => [`${p.cls}${p.sub ? '/' + p.sub : ''} — ${p.f.name} (lv${p.f.level})`, p.f.description] as const))(
    '%s',
    (_etichetta, testo) => {
      it('comincia da capo, non a metà parola', () => {
        expect(testo.trim()).toMatch(/^[A-Z“"]/)
      })

      it('arriva in fondo alla frase', () => {
        expect(testo.trim()).toMatch(/[.!?”"']$/)
      })

      it('non si porta dentro una tabella', () => {
        expect(testo).not.toMatch(/(\b\d+ ){4,}\d+/)
      })

      it('non ha sillabe orfane della sillabazione a fine riga', () => {
        expect(testo).not.toMatch(/\b(ciency|recspells|petence|cess)\b/)
      })

      it('non si porta dietro il piè di pagina del manuale', () => {
        expect(testo).not.toMatch(/System Reference Document/)
      })

      it('non sconfina nell’intestazione della sezione seguente', () => {
        expect(testo).not.toMatch(/\b(Subclass:|Spell List)\b/)
      })
    },
  )
})
