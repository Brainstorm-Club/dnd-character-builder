import { describe, it, expect } from 'vitest'
import { spells } from './dnd5e/spells'
import { toDnd2024Spells } from './dnd2024/spells'
import { dnd5eSpellTextsIt } from './dnd5e/spells-it'
import { dnd2024SpellTextsIt } from './dnd2024/spells-it'
import { ensureSpellTextsIt, getSpellTextIt, spellTextEdition, spellTextsItLoaded } from './spells-it'
import type { SpellTextIt } from './spells-it'
import { spellNamesIt } from '@/i18n/gameTerms'

/**
 * I due incantesimi che l'SRD 5.1 italiano non contiene: stanno nel Player's
 * Handbook. Restano senza testo integrale di proposito — vedi DATA-SOURCES.md.
 */
const FUORI_SRD_2014 = ['blade-ward', '1-hex']

const spells2024 = toDnd2024Spells(spells)

/** Ogni caso di questo file gira due volte, una per edizione. */
const EDIZIONI = [
  { nome: '2014', testi: dnd5eSpellTextsIt, lista: spells, fuoriSrd: FUORI_SRD_2014 },
  { nome: '2024', testi: dnd2024SpellTextsIt, lista: spells2024, fuoriSrd: [] as string[] },
] as const

describe.each(EDIZIONI)('testo italiano degli incantesimi — $nome', ({ testi, lista, fuoriSrd }) => {
  const idLista = new Set(lista.map(s => s.id))

  it('non aggancia id che nella lista del builder non esistono', () => {
    // Il ponte del compendio è scritto sugli id del builder: se un id cambia
    // qui e nessuno rilancia lo script, il testo diventa irraggiungibile e
    // l'unico sintomo sarebbe una descrizione inglese al posto di quella
    // italiana. Questo caso lo trasforma in un test rosso.
    const orfani = Object.keys(testi).filter(id => !idLista.has(id))
    expect(orfani).toEqual([])
  })

  it('copre tutti gli incantesimi tranne quelli fuori SRD', () => {
    const senzaTesto = lista.map(s => s.id).filter(id => !testi[id])
    expect(senzaTesto.sort()).toEqual([...fuoriSrd].sort())
  })

  it('non contiene testi vuoti né piè di pagina dell\'SRD', () => {
    const vuoti: string[] = []
    const footer: string[] = []
    for (const [id, v] of Object.entries(testi)) {
      if (v.testo.trim() === '') vuoti.push(id)
      if (v.aLivelliSuperiori !== undefined && v.aLivelliSuperiori.trim() === '') vuoti.push(id)
      // La riga che l'estrazione dai PDF si porta dietro quando va storta.
      if (/Not for resale|photocopy this document|System Reference Document 5\./i.test(v.testo)) footer.push(id)
    }
    expect(vuoti).toEqual([])
    expect(footer).toEqual([])
  })

  it('è testo integrale, non le prime frasi', () => {
    // Il difetto da cui nasce tutto questo lavoro: le descrizioni inglesi sono
    // troncate. Un testo italiano di poche parole sarebbe lo stesso difetto in
    // un'altra lingua — ma la soglia va scelta sui dati, non a occhio: il più
    // corto di tutti è Vita Falsata del 2024, «L'incantatore ottiene 2d4 + 4
    // punti ferita temporanei.», 54 caratteri, ed è davvero tutto quello che
    // l'SRD 5.2.1 stampa. Sotto i 40 non c'è più nessun incantesimo vero.
    const corti = Object.entries(testi).filter(([, v]) => v.testo.length < 40).map(([id]) => id)
    expect(corti).toEqual([])
  })

  it('è più lungo della descrizione inglese, in media', () => {
    let it = 0
    let en = 0
    for (const s of lista) {
      const t = testi[s.id]
      if (!t) continue
      it += t.testo.length + (t.aLivelliSuperiori?.length ?? 0)
      en += s.description.length
    }
    expect(it).toBeGreaterThan(en)
  })

  it('non contiene tag HTML: il riquadro lo stampa come testo', () => {
    const conTag = Object.entries(testi).filter(([, v]) => /<[a-z/][^>]*>/i.test(v.testo)).map(([id]) => id)
    expect(conTag).toEqual([])
  })
})

describe('nomi e testo restano allineati', () => {
  it('ogni incantesimo con il testo italiano ha anche il nome italiano', () => {
    // Un riquadro con il titolo in inglese e il corpo in italiano è peggio di
    // uno tutto inglese: sembra un errore di dati, e lo è.
    const senzaNome = spells
      .filter(s => dnd5eSpellTextsIt[s.id] && !spellNamesIt[s.name])
      .map(s => s.name)
    expect(senzaNome).toEqual([])
  })
})

describe('DATA-SOURCES.md: i tredici incantesimi fuori SRD sono due', () => {
  /**
   * L'elenco che DATA-SOURCES.md dichiarava fuori SRD. È stato costruito
   * sull'SRD 5.1 **inglese**; confrontato con quello **italiano**, undici di
   * questi tredici ci sono eccome.
   */
  const TREDICI_DICHIARATI = [
    'blade-ward', '4-compulsion', '3-counterspell', 'druidcraft', 'eldritch-blast',
    'fire-bolt', '4-guardian-of-faith', '1-hellish-rebuke', '1-hex', '1-hunters-mark',
    'poison-spray', 'spare-the-dying', 'vicious-mockery',
  ]

  it('i tredici id esistono davvero nella lista del builder', () => {
    const ids = new Set(spells.map(s => s.id))
    expect(TREDICI_DICHIARATI.filter(id => !ids.has(id))).toEqual([])
  })

  it('solo Blade Ward e Hex mancano dall\'SRD 5.1 italiano', () => {
    const mancanti = TREDICI_DICHIARATI.filter(id => !dnd5eSpellTextsIt[id])
    expect(mancanti.sort()).toEqual([...FUORI_SRD_2014].sort())
  })
})

describe('caricamento su richiesta', () => {
  it('manda Brancalonia e Apocalisse sul testo 2014, il 2024 sul suo', () => {
    expect(spellTextEdition('dnd5e')).toBe('2014')
    expect(spellTextEdition('brancalonia')).toBe('2014')
    expect(spellTextEdition('apocalisse')).toBe('2014')
    expect(spellTextEdition('dnd2024')).toBe('2024')
  })

  it('serve il testo solo dopo ensureSpellTextsIt', async () => {
    // Lo stato è di modulo: qui si verifica che il getter non esploda prima
    // del caricamento — deve tornare undefined, cioè «usa la descrizione
    // inglese», non lanciare.
    expect(() => getSpellTextIt('dnd5e', '3-fireball')).not.toThrow()
    await ensureSpellTextsIt('dnd5e')
    expect(spellTextsItLoaded('dnd5e')).toBe(true)
    const palla = getSpellTextIt('dnd5e', '3-fireball')
    expect(palla?.testo).toContain('scia di luce brillante')
    expect(palla?.aLivelliSuperiori).toContain('4° livello')
  })

  it('non ha testo per i due fuori SRD, né per gli id inventati', async () => {
    await ensureSpellTextsIt('dnd5e')
    for (const id of FUORI_SRD_2014) expect(getSpellTextIt('dnd5e', id)).toBeUndefined()
    expect(getSpellTextIt('dnd5e', 'incantesimo-che-non-esiste')).toBeUndefined()
  })

  it('il 2024 ha il suo testo, diverso da quello del 2014', async () => {
    await ensureSpellTextsIt('dnd2024')
    const a = getSpellTextIt('dnd5e', '3-fireball')
    const b = getSpellTextIt('dnd2024', '3-fireball')
    expect(b?.testo).toBeTruthy()
    expect(b?.testo).not.toBe(a?.testo)
  })

  it('la seconda chiamata non ricarica nulla', async () => {
    const uno = ensureSpellTextsIt('dnd5e')
    const due = ensureSpellTextsIt('dnd5e')
    await Promise.all([uno, due])
    expect(spellTextsItLoaded('dnd5e')).toBe(true)
  })
})

describe('forma dei record', () => {
  it('ha solo i due campi previsti', () => {
    const chiavi = new Set<string>()
    for (const v of Object.values(dnd5eSpellTextsIt) as SpellTextIt[]) {
      for (const k of Object.keys(v)) chiavi.add(k)
    }
    expect([...chiavi].sort()).toEqual(['aLivelliSuperiori', 'testo'])
  })

  it('conta 315 incantesimi nel 2014 e 338 nel 2024', () => {
    // I numeri dichiarati in DATA-SOURCES.md e nell'intestazione dei due file
    // generati: se cambiano, va aggiornata anche la documentazione.
    expect(Object.keys(dnd5eSpellTextsIt).length).toBe(315)
    expect(Object.keys(dnd2024SpellTextsIt).length).toBe(338)
    expect(spells.length).toBe(317)
    expect(spells2024.length).toBe(338)
  })
})
