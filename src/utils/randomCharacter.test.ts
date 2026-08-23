import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { generateRandomCharacter } from './randomCharacter'
import { getDnd5eFieldMapping } from './pdfFieldMapping'
import { preloadVariantData } from '@/data'
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
