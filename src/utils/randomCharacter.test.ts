import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { generateRandomCharacter } from './randomCharacter'
import { getDnd5eFieldMapping } from './pdfFieldMapping'
import { preloadVariantData, getBackgrounds, getRaces, getAvailableLanguages } from '@/data'
import { THIRD_CASTER_SUBCLASSES } from '@/data/spellcasting'
import { GAME_VARIANTS } from '@/stores/app'
import { calcolaAttacco } from '@/domain/armi'
import { simpleWeapons, martialWeapons } from '@/data/dnd5e/equipment'
import { modifier, proficiencyBonus } from './calculations'

describe('generatore casuale', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of GAME_VARIANTS) await preloadVariantData(v)
  })

  /**
   * Impedisce il ritorno del difetto per cui il generatore leggeva il solo
   * `cls.spellcasting` e marcava come incantatore anche guerrieri e ladri: quel
   * blocco esiste con `casterType: 'third'` per Cavaliere Mistico e
   * Mistificatore Arcano, non per il Campione o il Furfante.
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: guerrieri e ladri senza sottoclasse da incantatore non lanciano incantesimi`, () => {
      for (let i = 0; i < 400; i++) {
        const c = generateRandomCharacter(variant)
        if (c.className !== 'fighter' && c.className !== 'rogue') continue
        if (THIRD_CASTER_SUBCLASSES.includes(c.subclass)) continue

        const who = `${variant}/${c.className}/${c.subclass || 'senza sottoclasse'} liv.${c.level}`
        expect(c.spellcastingClass, who).toBe('')
        expect(c.spellcastingAbility, who).toBe('')
        expect(c.cantrips, who).toEqual([])
        expect(c.spellsKnown, who).toEqual([])

        // E la scheda non deve riportare il blocco da incantatore
        const fields = getDnd5eFieldMapping(c)
        expect(fields['Spellcasting Class 2'], who).toBeUndefined()
        expect(fields['SpellcastingAbility 2'], who).toBeUndefined()
        expect(fields['SpellSaveDC  2'], who).toBeUndefined()
        expect(fields['SpellAtkBonus 2'], who).toBeUndefined()
      }
    })
  }

  /**
   * Bonus di attacco e danno devono uscire dalla regola condivisa di
   * `src/domain/armi.ts`, non da un conto scritto qui dentro: erano due
   * implementazioni diverse — qui le classi da Destrezza mettevano la Destrezza
   * secca su ogni arma accurata, e il danno usciva nudo mentre il passo
   * Equipaggiamento ci scriveva il modificatore — e ogni correzione andava
   * scritta due volte.
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: le armi generate rispettano la regola condivisa del bonus di attacco`, () => {
      const catalogo = [...simpleWeapons, ...martialWeapons]
      for (let i = 0; i < 120; i++) {
        const c = generateRandomCharacter(variant)
        const mods = {
          strMod: modifier(c.abilityScores.str + (c.racialBonuses.str || 0)),
          dexMod: modifier(c.abilityScores.dex + (c.racialBonuses.dex || 0)),
          proficiencyBonus: proficiencyBonus(c.level),
        }
        for (const w of c.weapons) {
          const arma = catalogo.find(a => a.name === w.name)
          expect(arma, `${w.name} non è nel catalogo`).toBeDefined()
          expect(w, `${variant}/${c.className} liv.${c.level} — ${w.name}`)
            .toEqual(calcolaAttacco(arma!, mods))
        }
      }
    })
  }

  it('gli incantatori veri continuano a ricevere i propri incantesimi', () => {
    let casters = 0
    for (let i = 0; i < 400 && casters < 5; i++) {
      const c = generateRandomCharacter('dnd5e')
      if (c.className !== 'wizard' && c.className !== 'cleric') continue
      casters++
      expect(c.spellcastingClass, c.className).toBe(c.className)
      expect(c.spellcastingAbility.length, c.className).toBeGreaterThan(0)
    }
    expect(casters, 'nessun incantatore estratto in 400 tentativi').toBeGreaterThan(0)
  })
})

/**
 * `Background.languages` dice soltanto QUANTI linguaggi concede il background.
 * Dove il manuale li NOMINA — «Linguaggi: Baccaglio» — il numero da solo non
 * basta: il generatore ne sorteggiava altrettanti a caso fra tutti quelli della
 * variante, e un adepto del Credo poteva finire a parlare Petroglifico.
 * Questi test pinnano i nomi letti dai manuali e il fatto che il generatore li
 * assegni davvero.
 */
describe('linguaggi nominati dal background', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of GAME_VARIANTS) await preloadVariantData(v)
  })

  for (const variant of GAME_VARIANTS) {
    it(`${variant}: i nomi sono lingue che l'applicazione conosce e il conteggio combacia`, () => {
      const conosciute = new Set(getAvailableLanguages(variant))
      for (const bg of getBackgrounds(variant)) {
        if (!bg.languageNames) continue
        // Se il manuale ne nomina due, `languages` deve dire due: altrimenti
        // uno dei due conti è sbagliato e non si sa quale creda la scheda.
        expect(bg.languages, `${variant}/${bg.id}`).toBe(bg.languageNames.length)
        expect(new Set(bg.languageNames).size, `${variant}/${bg.id}: nomi ripetuti`)
          .toBe(bg.languageNames.length)
        for (const nome of bg.languageNames) {
          expect(conosciute, `${variant}/${bg.id}: «${nome}» non è fra le lingue della variante`)
            .toContain(nome)
        }
      }
    })

    it(`${variant}: il generatore assegna proprio quei linguaggi, non altri a caso`, () => {
      const conNomi = getBackgrounds(variant).filter(b => b.languageNames?.length)
      if (conNomi.length === 0) return
      const visti = new Set<string>()

      for (let i = 0; i < 600 && visti.size < conNomi.length; i++) {
        const c = generateRandomCharacter(variant)
        const bg = getBackgrounds(variant).find(b => b.id === c.background)!
        const razza = getRaces(variant).find(r => r.id === c.race)!

        if (!bg.languageNames?.length) {
          // Il ramo a sorteggio non deve cambiare: tanti quanti ne dice il
          // background, senza doppioni con quelli di razza.
          const attesi = new Set([...razza.languages])
          expect(c.languages.length, `${variant}/${bg.id}`)
            .toBe(attesi.size + bg.languages)
          continue
        }

        visti.add(bg.id)
        // Non basta che ci siano: non devono esserci lingue in più. Prima della
        // correzione qui comparivano proprio i sorteggi al posto dei nomi.
        const attesi = new Set([...razza.languages, ...bg.languageNames])
        expect(new Set(c.languages), `${variant}/${bg.id}`).toEqual(attesi)
      }

      expect(visti.size, `${variant}: background nominati mai estratti in 600 tentativi`)
        .toBe(conNomi.length)
    })
  }
})
