import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  getApocalisseFieldMapping, getDnd5eFieldMapping, getBrancaloniaFieldMapping,
} from './pdfFieldMapping'
import { generateRandomCharacter } from './randomCharacter'
import { blogCharacters } from '@/data/blog/characters'
import { preloadVariantData } from '@/data'
import { apocalisseRules } from '@/data/apocalisse/rules'
import { translateGameTerm } from '@/i18n/gameTerms'
import { getSpells } from '@/data'
import type { CharacterData } from '@/stores/character'

/**
 * Apocalisse esportava sulla scheda di D&D perché il suo PDF non era un
 * modulo compilabile: Marchio, Spirito, Virtù, Peccato e Umanità finivano
 * schiacciati dentro la casella dei privilegi, insieme a tutto il resto.
 * Ora il modello ha i suoi campi, e ognuna di quelle voci ha il proprio.
 */
describe('scheda di Apocalisse', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    await preloadVariantData('apocalisse')
  })

  it('porta Marchio, Virtù, Peccato e Umanità ognuno nel proprio posto', () => {
    let conMarchio = 0
    for (let i = 0; i < 30; i++) {
      const c = generateRandomCharacter('apocalisse', 1 + (i % 12))
      const m = getApocalisseFieldMapping(c)
      if (c.mark) {
        conMarchio++
        // La barra sotto l'etichetta MARCHIO è larga 67 pt: il nome per
        // esteso ("Marchio della Bestia — Spirito della Desolazione") sborda
        // da entrambi i lati, e l'etichetta stampata dice già MARCHIO. Sulla
        // scheda finisce quindi il solo nome, senza il prefisso.
        const atteso = apocalisseRules.marks.find(x => x.id === c.mark)!.nameOriginal
          .replace(/^Marchio (?:della|del) /, '')
        expect(String(m['marchio']), 'il marchio va nella sua casella').toContain(atteso)
        expect(String(m['marchio']), 'senza il prefisso, che non ci sta').not.toContain('Marchio ')
      }
      if (c.virtue) {
        expect(m['virtu']).toBe(apocalisseRules.virtues.find(v => v.id === c.virtue)!.nameOriginal)
      }
      if (c.sin) {
        expect(m['peccato']).toBe(apocalisseRules.sins.find(s => s.id === c.sin)!.nameOriginal)
      }
      // L'Umanità è una regola della casa e non ha una casella sua: sta fra
      // le competenze, non sepolta nei privilegi.
      expect(String(m['competenze-linguaggi'])).toMatch(/Umanità: \d+/)
    }
    expect(conMarchio, 'il generatore assegna il marchio').toBeGreaterThan(0)
  })

  it('sceglie il dado del marchio in base al livello', () => {
    for (const lv of [1, 5, 11, 17, 20]) {
      const c = generateRandomCharacter('apocalisse', lv)
      if (!c.mark) continue
      const atteso = apocalisseRules.markDiceProgression
        .find(d => lv >= d.levelRange[0] && lv <= d.levelRange[1])!.die
      expect(getApocalisseFieldMapping(c)['dadi-marchio'], `livello ${lv}`).toBe(atteso)
    }
  })

  /**
   * La pagina degli incantesimi ha una casella per ogni riga stampata — nove
   * per i livelli 0-3, otto per i livelli 4-7, sei per l'8° e il 9° — perché
   * con un riquadro multiriga per livello pdf-lib non permette di far cadere
   * i nomi sulle righe se non portando il corpo a 11.4. Quando gli
   * incantesimi sono più delle righe l'ultima li raccoglie tutti: nessuno
   * deve sparire dalla scheda.
   */
  it('mette ogni incantesimo sulla sua riga senza perderne nessuno', () => {
    const c = generateRandomCharacter('apocalisse', 1)
    c.spellcastingAbility = 'int'
    c.spellcastingClass = 'wizard'
    c.cantrips = []
    c.spellsPrepared = []
    c.spellsKnown = getSpells('apocalisse').filter(s => s.level === 1).slice(0, 14).map(s => s.id)
    expect(c.spellsKnown.length, 'servono più incantesimi che righe').toBeGreaterThan(9)
    const m = getApocalisseFieldMapping(c)
    for (let i = 1; i <= 9; i++) expect(m, `manca la riga ${i}`).toHaveProperty(`incantesimi1-${i}`)
    expect(m).not.toHaveProperty('incantesimi1-10')
    const testo = Object.values(m).filter(v => typeof v === 'string').join(' ')
    for (const id of c.spellsKnown) {
      const sp = getSpells('apocalisse').find(x => x.id === id)!
      expect(testo, `${sp.name} perso`).toContain(translateGameTerm(sp.name, 'it', 'spell'))
    }
  })

  it('non lascia vuote le caselle che il personaggio sa riempire', () => {
    const c = generateRandomCharacter('apocalisse', 6)
    const m = getApocalisseFieldMapping(c)
    for (const k of ['nome-personaggio', 'origine', 'classe-livello', 'classe-armatura',
      'pf-attuali', 'dadi-vita', 'velocita', 'percezione-passiva', 'bonus-competenza']) {
      expect(m[k], k).toBeTruthy()
    }
  })
})

/**
 * Due difetti che valevano per tutte e quattro le schede, trovati mentre si
 * costruiva quella di Apocalisse.
 */
describe('incantesimi sulla scheda, in tutte le varianti', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse'] as const) {
      await preloadVariantData(v)
    }
  })

  const mappa = (c: CharacterData) => c.variant === 'brancalonia'
    ? getBrancaloniaFieldMapping(c)
    : c.variant === 'apocalisse'
      ? getApocalisseFieldMapping(c)
      : getDnd5eFieldMapping(c, 'it')

  /**
   * Un incantesimo si può memorizzare per id ('3-fireball') o per nome
   * ('Fireball'): il generatore usa gli id, i personaggi scritti a mano usano
   * i nomi. Cercando solo per id, i secondi restavano irrisolti e uscivano in
   * inglese e al livello zero — tutti fra i trucchetti.
   */
  it('risolve gli incantesimi memorizzati per nome, non solo per id', () => {
    const conNomi = blogCharacters.filter(b =>
      [...b.characterData.spellsKnown, ...b.characterData.spellsPrepared].some(s => /[A-Z]/.test(s[0]!)))
    expect(conNomi.length, 'ci sono personaggi che li salvano per nome').toBeGreaterThan(0)
    for (const { characterData: c } of conNomi.slice(0, 12)) {
      const testo = Object.values(mappa(c)).filter(v => typeof v === 'string').join(' ')
      const tutti = getSpells(c.variant)
      for (const rif of [...c.spellsKnown, ...c.spellsPrepared]) {
        // Sulla scheda il nome è tradotto: risolverlo è la prova che non è
        // rimasto grezzo e che il livello è stato letto dai dati.
        const sp = tutti.find(x => x.id === rif)
          ?? tutti.find(x => x.name.toLowerCase() === rif.toLowerCase())
        expect(sp, `${c.name}: ${rif} non esiste nei dati`).toBeDefined()
        const atteso = translateGameTerm(sp!.name, 'it', 'spell')
        expect(testo, `${c.name}: ${atteso} non compare sulla scheda`).toContain(atteso)
      }
    }
  })

  /**
   * Chierici, druidi, maghi e paladini tengono gli incantesimi in
   * `spellsPrepared`: leggendo solo `spellsKnown` la loro scheda usciva senza
   * un solo incantesimo.
   */
  it('mette sulla scheda anche gli incantesimi preparati', () => {
    const preparatori = blogCharacters.filter(b => b.characterData.spellsPrepared.length > 0)
    expect(preparatori.length, 'ci sono incantatori a preparazione').toBeGreaterThan(0)
    for (const { characterData: c } of preparatori) {
      const testo = Object.values(mappa(c)).filter(v => typeof v === 'string').join(' ')
      expect(testo.length, `${c.name}: scheda vuota`).toBeGreaterThan(0)
      const tutti = getSpells(c.variant)
      for (const rif of c.spellsPrepared) {
        const sp = tutti.find(x => x.id === rif)
          ?? tutti.find(x => x.name.toLowerCase() === rif.toLowerCase())
        if (!sp) continue
        const atteso = translateGameTerm(sp.name, 'it', 'spell')
        expect(testo, `${c.name}: ${atteso} preparato ma assente`).toContain(atteso)
      }
    }
  })
})
