import { describe, it, expect } from 'vitest'
import { dnd2024Feats, getFeatsByCategory, getDnd2024Feat } from './feats'
import { dnd2024FeatDescriptionsIt, getDnd2024FeatDescription } from './feats-it'
import { featureNamesIt } from '@/i18n/gameTerms'

/**
 * I talenti del 2024 sono stati estratti dalle pagg. 87-88 dello SRD 5.2.1, che
 * è impaginato su due colonne. La prima estrazione linearizzava la pagina
 * intera e incollava insieme testi che sul manuale sono lontani: "Savage
 * Attacker" si portava dietro tutto "Skilled" e il titolo "General Feats",
 * "Archery" nasceva con una "s" orfana e finiva con un "it", "Magic Initiate"
 * si troncava su "the ability to ca", "Two-Weapon Fighting" finiva con
 * l'intestazione "Epic Boon Feats" e "Boon of Truesight" proseguiva dentro il
 * capitolo Equipment. Otto descrizioni su sedici erano rovinate.
 *
 * Questi controlli non giudicano il contenuto — per quello c'è il manuale — ma
 * la forma, che è dove l'estrazione sbagliata si vede a occhio nudo.
 */
describe('talenti 2024: il catalogo', () => {
  it('ha i 17 dell\'SRD 5.2.1, divisi per categoria', () => {
    expect(dnd2024Feats).toHaveLength(17)
    expect(getFeatsByCategory('origin').map(f => f.id))
      .toEqual(['alert', 'magic-initiate', 'savage-attacker', 'skilled'])
    expect(getFeatsByCategory('general')).toHaveLength(2)
    expect(getFeatsByCategory('fighting-style')).toHaveLength(4)
    expect(getFeatsByCategory('epic-boon')).toHaveLength(7)
  })

  /**
   * "Skilled" era finito dentro la descrizione di "Savage Attacker", che sul
   * manuale gli sta sopra nella stessa colonna, e quindi non esisteva come
   * voce: l'umano con Versatile aveva una scelta in meno del dovuto.
   */
  it('contiene Skilled, che l\'estrazione sbagliata aveva inghiottito', () => {
    const skilled = getDnd2024Feat('skilled')
    expect(skilled).toBeDefined()
    expect(skilled!.category).toBe('origin')
    expect(skilled!.description).toMatch(/three skills or tools of your choice/)
    // ...e "Savage Attacker" non se lo porta più dietro.
    expect(getDnd2024Feat('savage-attacker')!.description).not.toMatch(/Skilled|proficiency/)
  })

  it('non ha id ripetuti', () => {
    const ids = dnd2024Feats.map(f => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe.each(dnd2024Feats.map(f => [`${f.category}/${f.name}`, f] as const))(
  'talento 2024 — %s',
  (_etichetta, feat) => {
    const testo = feat.description.trim()

    it('comincia da capo, non a metà parola né con una lettera orfana', () => {
      expect(testo).toMatch(/^[A-Z“"]/)
      // "Archery" nasceva come «s You gain a +2 bonus...»
      expect(testo).not.toMatch(/^[A-Za-z]\s/)
    })

    it('arriva in fondo alla frase', () => {
      expect(testo).toMatch(/[.!?”"']$/)
      // "Magic Initiate" si fermava su «the ability to ca»
      expect(testo).not.toMatch(/\b(ca|ex|Initiativ)\.?$/)
    })

    it('non ha lettere orfane in mezzo al testo', () => {
      // "Grappler" diceva «with an e Unarmed Strike»: la "e" veniva dall'altra
      // colonna. In inglese le uniche parole di una lettera sono "a" e "I".
      expect(testo).not.toMatch(/(?:^|\s)[b-hj-z](?:\s|$)/)
    })

    it('non si porta dentro un\'intestazione di sezione', () => {
      expect(testo).not.toMatch(/\b(Origin|General|Fighting Style|Epic Boon) Feats?\b/)
      expect(testo).not.toMatch(/\b(Feat Descriptions|Parts of a Feat|Coins)\b/)
    })

    it('non si porta dietro il piè di pagina del manuale', () => {
      expect(testo).not.toMatch(/System Reference Document/)
    })

    it('non si porta dentro un filare di numeri di una tabella', () => {
      expect(testo).not.toMatch(/(\b\d+ ){4,}\d+/)
    })

    /**
     * Due guasti che nessun controllo di forma vede: una parola tagliata a
     * fine colonna ("Initiativ" invece di "Initiative") e due parole saldate
     * dove il PDF aveva un a capo ("abonus" invece di "a bonus"). Restano qui
     * per nome, come le sillabe orfane in `descriptions.test.ts`.
     */
    it('non ha parole tagliate o saldate dall\'a capo', () => {
      expect(testo).not.toMatch(/\b(Initiativ|abonus|apenalty|spellcast|Versa)\b/)
    })

    it('segna i requisiti solo dove il manuale li mette', () => {
      // I talenti d'origine si prendono al 1° livello e non hanno prerequisiti.
      if (feat.category === 'origin') expect(feat.prerequisite).toBeUndefined()
      else expect(feat.prerequisite).toBeTruthy()
    })
  },
)

describe('talenti 2024 in italiano', () => {
  it('ogni talento ha la sua descrizione italiana', () => {
    const senza = dnd2024Feats.filter(f => !dnd2024FeatDescriptionsIt[f.id])
    expect(senza.map(f => f.id)).toEqual([])
  })

  /**
   * Chiavi che non appartengono a nessun talento sono traduzioni morte: pesano
   * nel bundle e nascondono la deriva degli id invece di segnalarla.
   */
  it('non ci sono descrizioni italiane orfane', () => {
    const noti = new Set(dnd2024Feats.map(f => f.id))
    expect(Object.keys(dnd2024FeatDescriptionsIt).filter(id => !noti.has(id))).toEqual([])
  })

  it('ogni talento ha il nome italiano nella mappa condivisa', () => {
    const senza = dnd2024Feats.filter(f => !featureNamesIt[f.name])
    expect(senza.map(f => f.name)).toEqual([])
  })

  describe.each(dnd2024Feats.map(f => [f.name, f.id] as const))('%s', (_nome, id) => {
    const testo = dnd2024FeatDescriptionsIt[id]!.trim()

    it('è una descrizione compiuta, non un troncone', () => {
      expect(testo).toMatch(/^[A-Z]/)
      expect(testo).toMatch(/[.!?»]$/)
      expect(testo.length).toBeGreaterThan(60)
    })

    /**
     * L'errore che si vede a occhio su una scheda italiana è una frase inglese
     * rimasta in mezzo. Queste sono le parole che ricorrono in ogni talento
     * dell'SRD inglese.
     */
    it('non ha residui di inglese', () => {
      expect(testo).not.toMatch(/\b(You gain|benefits|Increase|Repeatable|Prerequisite|feet|Bonus Action)\b/)
    })

    /**
     * Il manuale italiano usa i metri, non i piedi, e ha una terminologia sua:
     * tradurre a orecchio produceva "punti abilità" al posto di "punteggi di
     * caratteristica" e "azione bonus" scritta in inglese.
     */
    it('usa le distanze in metri, come il manuale italiano', () => {
      expect(testo).not.toMatch(/\b\d+ (piedi|feet)\b/)
    })
  })

  /**
   * Fuori dall'italiano si torna all'inglese di `feats.ts`: è la stessa regola
   * che `getFeatureDescription` applica ai privilegi di classe, e serve perché
   * la scheda non accosti due lingue nella stessa schermata.
   */
  it('getDnd2024FeatDescription risponde in italiano solo in italiano', () => {
    const en = getDnd2024Feat('grappler')!.description
    expect(getDnd2024FeatDescription('grappler', 'it', en)).toBe(dnd2024FeatDescriptionsIt['grappler'])
    expect(getDnd2024FeatDescription('grappler', 'en', en)).toBe(en)
    // Un id sconosciuto non deve svuotare la scheda: torna il testo di partenza.
    expect(getDnd2024FeatDescription('tough', 'it', en)).toBe(en)
  })
})
