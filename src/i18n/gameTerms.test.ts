import { describe, it, expect, beforeAll } from 'vitest'
import {
  translateGameTerm,
  spellNamesIt,
  subclassNamesIt,
  raceNamesIt,
  subraceNamesIt,
  backgroundNamesIt,
} from './gameTerms'
import { getRaces, getBackgrounds, getClasses, getSpells, preloadVariantData } from '@/data'
import { GAME_VARIANTS } from '@/stores/app'

describe('nomi di gioco', () => {
  beforeAll(async () => {
    for (const v of GAME_VARIANTS) await preloadVariantData(v)
  })

  /**
   * Impedisce il ritorno del difetto per cui 22 fra discendenze, lignaggi e
   * specie del 2024 non avevano alcun nome italiano, e per cui la ricerca per
   * id falliva su chiavi che non si ottengono capitalizzando ('dark-elf' è
   * indicizzata 'Dark Elf (Drow)', 'wolfcat' è 'WolfCat'): a schermo e sul PDF
   * compariva lo slug grezzo o il nome inglese.
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: ogni specie, sottorazza e background si risolve per id e per nome`, () => {
      const checks: { cat: 'race' | 'subrace' | 'background'; id: string; name: string; map: Record<string, string> }[] = []

      for (const race of getRaces(variant)) {
        checks.push({ cat: 'race', id: race.id, name: race.name, map: raceNamesIt })
        for (const sub of race.subraces ?? []) {
          checks.push({ cat: 'subrace', id: sub.id, name: sub.name, map: subraceNamesIt })
        }
      }
      for (const bg of getBackgrounds(variant)) {
        checks.push({ cat: 'background', id: bg.id, name: bg.name, map: backgroundNamesIt })
      }

      for (const { cat, id, name, map } of checks) {
        const label = `${variant}/${cat}/${id}`
        // Esiste davvero un nome italiano, non solo un ripiego sull'inglese
        expect(map[name], `${label}: manca la voce italiana per "${name}"`).toBeDefined()
        // ...e ci si arriva tanto dall'id quanto dal nome inglese
        expect(translateGameTerm(id, 'it', cat), `${label}: id non risolto in italiano`).toBe(map[name])
        expect(translateGameTerm(name, 'it', cat), `${label}: nome non risolto in italiano`).toBe(map[name])
        // In inglese l'id deve comunque diventare il nome, mai lo slug
        expect(translateGameTerm(id, 'en', cat), `${label}: id non risolto in inglese`).toBe(name)
        expect(translateGameTerm(name, 'en', cat), `${label}: nome alterato in inglese`).toBe(name)
      }
    })
  }

  /**
   * Impedisce il ritorno del difetto per cui non esisteva alcuna tabella delle
   * taglie: i dati razza le portano in inglese e finivano tali e quali nel
   * passo 8, nel passo 9 e nella scheda italiana.
   */
  it('le taglie hanno un nome italiano e restano inglesi in inglese', () => {
    const expected: Record<string, string> = {
      Tiny: 'Minuscola', Small: 'Piccola', Medium: 'Media',
      Large: 'Grande', Huge: 'Enorme', Gargantuan: 'Mastodontica',
    }
    for (const [en, it] of Object.entries(expected)) {
      expect(translateGameTerm(en, 'it', 'size'), en).toBe(it)
      expect(translateGameTerm(en, 'en', 'size'), en).toBe(en)
    }
  })

  it('ogni taglia usata dai dati razza è tradotta', () => {
    for (const variant of GAME_VARIANTS) {
      for (const race of getRaces(variant)) {
        const size = race.size
        if (!size) continue
        expect(translateGameTerm(size, 'it', 'size'), `${variant}/${race.id}: taglia "${size}"`).not.toBe(size)
      }
    }
  })

  /**
   * Impedisce il ritorno del difetto per cui la scheda stampava il codice a due
   * lettere dell'allineamento ('cn') invece del nome.
   */
  it('gli allineamenti si leggono in entrambe le lingue', () => {
    const codes = ['lg', 'ng', 'cg', 'ln', 'tn', 'cn', 'le', 'ne', 'ce']
    for (const code of codes) {
      expect(translateGameTerm(code, 'it', 'alignment'), code).not.toBe(code)
      expect(translateGameTerm(code, 'en', 'alignment'), code).not.toBe(code)
    }
    expect(translateGameTerm('cn', 'it', 'alignment')).toBe('Caotico Neutrale')
    expect(translateGameTerm('cn', 'en', 'alignment')).toBe('Chaotic Neutral')
  })

  it('le competenze si leggono per esteso anche in inglese', () => {
    expect(translateGameTerm('light', 'en', 'proficiency')).toBe('Light Armor')
    expect(translateGameTerm('martial', 'en', 'proficiency')).toBe('Martial Weapons')
    expect(translateGameTerm('shields', 'it', 'proficiency')).toBe('Scudi')
  })
  /**
   * Impedisce il ritorno del difetto per cui 126 incantesimi su 338 non
   * avevano un nome italiano: la lista del passo 7 e le schede di Brancalonia e
   * Apocalisse — che restano sempre in italiano — mescolavano le due lingue.
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: ogni incantesimo ha un nome italiano`, () => {
      const missing = getSpells(variant)
        .map(sp => sp.name)
        .filter(name => !spellNamesIt[name])
      expect(missing, `${variant}: incantesimi senza voce italiana`).toEqual([])
    })
  }

  /**
   * Impedisce il ritorno del difetto per cui 40 dei 53 tratti delle specie del
   * 2024 non avevano voce in traitNamesIt: il riquadro Privilegi e Tratti del
   * passo 9 e il campo "Features and Traits" della scheda PDF stampavano l'id
   * grezzo ('goliath-storms-thunder') proprio in italiano, mentre in inglese
   * l'id veniva almeno ripulito.
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: ogni tratto di specie ha un nome italiano`, () => {
      const missing: string[] = []
      for (const race of getRaces(variant)) {
        const ids = [
          ...(race.traits ?? []).map(id => `${race.id}/${id}`),
          ...(race.subraces ?? []).flatMap(sub =>
            (sub.traits ?? []).map(id => `${race.id}/${sub.id}/${id}`)),
        ]
        for (const path of ids) {
          const id = path.slice(path.lastIndexOf('/') + 1)
          // Sia 'trait' sia 'feature' devono risolvere: il passo 9 e il PDF
          // passano i tratti razziali dentro featuresTraits, cioè da 'feature'
          if (translateGameTerm(id, 'it', 'trait') === id) missing.push(path)
          else if (translateGameTerm(id, 'it', 'feature') === id) missing.push(path)
        }
      }
      expect(missing, `${variant}: tratti senza voce italiana`).toEqual([])
    })
  }

  /**
   * Impedisce il ritorno del difetto per cui 10 sottoclassi restavano in
   * inglese nel selettore: le traduzioni c'erano, ma indicizzate con chiavi che
   * nessuna classe usa ('the-fiend' invece di 'fiend', 'school-of-evocation'
   * invece di 'evocation').
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: ogni sottoclasse ha un nome italiano indicizzato per id`, () => {
      const missing: string[] = []
      for (const cls of getClasses(variant)) {
        for (const sub of cls.subclasses) {
          if (!subclassNamesIt[sub.id]) missing.push(`${cls.id}/${sub.id}`)
        }
      }
      expect(missing, `${variant}: sottoclassi senza voce italiana`).toEqual([])
    })
  }

  /**
   * Le chiavi che non appartengono a nessuna sottoclasse sono traduzioni morte:
   * restano nel bundle e coprono la deriva degli id invece di segnalarla.
   */
  it('subclassNamesIt non contiene chiavi orfane', () => {
    const known = new Set<string>()
    for (const variant of GAME_VARIANTS) {
      for (const cls of getClasses(variant)) {
        for (const sub of cls.subclasses) known.add(sub.id)
      }
    }
    const orphans = Object.keys(subclassNamesIt).filter(id => !known.has(id))
    expect(orphans).toEqual([])
  })
})

/**
 * L'equipaggiamento dei background di Brancalonia è scritto per esteso nei dati
 * (`src/data/brancalonia/backgrounds.ts`) e non passa da nessuna tabella: 51
 * voci distinte finivano sulla scheda italiana in inglese, in mezzo al resto
 * tradotto — «A pouch containing 15 sp» accanto a «Un abito comune».
 *
 * Le traduzioni vengono dai manuali italiani (Manuale di Ambientazione 2.6,
 * Macaronicon 2.2, L'Impero Randella Ancora 1.0), non tradotte a orecchio.
 */
describe('equipaggiamento dei background di Brancalonia', () => {
  beforeAll(async () => {
    await preloadVariantData('brancalonia')
  })

  const voci = () => {
    const tutte = getBackgrounds('brancalonia').flatMap(b => b.equipment ?? [])
    return [...new Set(tutte)].sort()
  }

  it('ne conta 51 distinte, come i manuali', () => {
    expect(voci()).toHaveLength(51)
  })

  it('nessuna resta in inglese su una scheda italiana', () => {
    const senzaTraduzione = voci().filter(v => translateGameTerm(v, 'it', 'equipment', 'brancalonia') === v)
    expect(senzaTraduzione).toEqual([])
  })

  it('le traduzioni non sono l\'inglese ricopiato', () => {
    for (const v of voci()) {
      const it = translateGameTerm(v, 'it', 'equipment', 'brancalonia')
      // "sp" è il denaro d'argento e in italiano si scrive "ma": trovarlo
      // ancora significa che la voce è passata di là senza essere tradotta.
      expect(it, v).not.toMatch(/\b(sp|pouch|clothes|A set of)\b/)
    }
  })

  it('usa i termini di gioco del manuale, non calchi dall\'inglese', () => {
    const t = (v: string) => translateGameTerm(v, 'it', 'equipment', 'brancalonia')
    // Memorabilia è il Cimelio, non "memorabilia".
    expect(t('A brawl trophy (roll an additional Memorabilia)')).toMatch(/Cimelio/)
    // Le Dives non sono tuffi: sul manuale sono le locande (Bettole a glossario).
    expect(t('A map listing all the Dives in your hometown')).toMatch(/locande/)
    // Poppycock sono le minchiate, il mazzo di carte.
    expect(t('A poppycock card deck or another game')).toMatch(/minchiate/)
    // I santi hanno un nome italiano loro.
    expect(t('A jewel dedicated to Saint Pathrick')).toMatch(/Santa Percorrenza/)
    expect(t('A pendant of Saint Marauda')).toMatch(/Santa Predatoria/)
  })
})

/**
 * Nel 2024 il talento sta sulla scheda accanto ai privilegi. Di sedici nomi
 * solo "Ability Score Improvement" era tradotto — perché serviva già come
 * privilegio di classe — e gli altri quindici uscivano in inglese.
 */
describe('nomi dei talenti di D&D 2024', () => {
  it('ogni talento del catalogo si traduce', async () => {
    const { dnd2024Feats } = await import('@/data/dnd2024/feats')
    const senza = dnd2024Feats
      .map(f => f.name)
      .filter(n => translateGameTerm(n, 'it', 'feature', 'dnd2024') === n)
    expect(senza).toEqual([])
  })

  it('usa i nomi stampati sul manuale italiano', async () => {
    const t = (n: string) => translateGameTerm(n, 'it', 'feature', 'dnd2024')
    // "Archery" sull'SRD italiano è "Tiro", non "Tiro con l'arco".
    expect(t('Archery')).toBe('Tiro')
    expect(t('Grappler')).toBe('Lottatore')
    expect(t('Skilled')).toBe('Abile')
    expect(t('Boon of Truesight')).toBe('Dono della vista pura')
  })
})
