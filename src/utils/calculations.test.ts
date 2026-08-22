import { describe, it, expect } from 'vitest'
import type { CharacterData } from '@/stores/character'
import type { ArmorClassInput } from './calculations'
import {
  computeArmorClass,
  modifier,
  proficiencyBonus,
  hpAtLevel1,
  hpPerLevel,
  totalHp,
  baseAC,
  spellSaveDC,
  spellAttackBonus,
  formatModifier,
  feetToMeters,
} from './calculations'

describe('modifier', () => {
  it('returns correct modifier for standard scores', () => {
    expect(modifier(10)).toBe(0)
    expect(modifier(11)).toBe(0)
    expect(modifier(12)).toBe(1)
    expect(modifier(14)).toBe(2)
    expect(modifier(20)).toBe(5)
  })

  it('returns negative modifiers for low scores', () => {
    expect(modifier(8)).toBe(-1)
    expect(modifier(6)).toBe(-2)
    expect(modifier(1)).toBe(-5)
  })
})

describe('proficiencyBonus', () => {
  it('returns +2 for levels 1-4', () => {
    for (let lvl = 1; lvl <= 4; lvl++) {
      expect(proficiencyBonus(lvl)).toBe(2)
    }
  })

  it('returns +3 for levels 5-8', () => {
    for (let lvl = 5; lvl <= 8; lvl++) {
      expect(proficiencyBonus(lvl)).toBe(3)
    }
  })

  it('returns +6 for level 20', () => {
    expect(proficiencyBonus(20)).toBe(6)
  })
})

describe('hpAtLevel1', () => {
  it('calculates max hit die + con modifier', () => {
    expect(hpAtLevel1(10, 2)).toBe(12) // d10 fighter, +2 CON
    expect(hpAtLevel1(6, -1)).toBe(5)  // d6 wizard, -1 CON
    expect(hpAtLevel1(12, 3)).toBe(15) // d12 barbarian, +3 CON
  })
})

describe('hpPerLevel', () => {
  it('uses average die roll + 1 + con modifier', () => {
    expect(hpPerLevel(10, 2)).toBe(8)  // floor(10/2)+1+2 = 8
    expect(hpPerLevel(6, 0)).toBe(4)   // floor(6/2)+1+0 = 4
    expect(hpPerLevel(12, 3)).toBe(10) // floor(12/2)+1+3 = 10
  })
})

describe('totalHp', () => {
  it('calculates correct HP at level 1', () => {
    expect(totalHp(10, 2, 1)).toBe(12) // 10 + 2
  })

  it('calculates correct HP at higher levels', () => {
    expect(totalHp(10, 2, 5)).toBe(44) // 12 + 4*8 = 44
  })

  it('returns 0 for level 0 or below', () => {
    expect(totalHp(10, 2, 0)).toBe(0)
    expect(totalHp(10, 2, -1)).toBe(0)
  })

  it('returns at least 1 HP', () => {
    expect(totalHp(6, -5, 1)).toBe(1) // 6 + (-5) = 1 (clamped)
  })
})

describe('baseAC', () => {
  it('returns 10 + DEX modifier', () => {
    expect(baseAC(0)).toBe(10)
    expect(baseAC(2)).toBe(12)
    expect(baseAC(-1)).toBe(9)
  })
})

describe('spellSaveDC', () => {
  it('returns 8 + proficiency + ability mod', () => {
    expect(spellSaveDC(2, 3)).toBe(13) // 8+2+3
    expect(spellSaveDC(4, 5)).toBe(17) // 8+4+5
  })
})

describe('spellAttackBonus', () => {
  it('returns proficiency + ability mod', () => {
    expect(spellAttackBonus(2, 3)).toBe(5)
    expect(spellAttackBonus(6, 5)).toBe(11)
  })
})

describe('formatModifier', () => {
  it('adds + sign for positive and zero', () => {
    expect(formatModifier(0)).toBe('+0')
    expect(formatModifier(3)).toBe('+3')
  })

  it('uses - sign for negative', () => {
    expect(formatModifier(-2)).toBe('-2')
  })
})

describe('feetToMeters', () => {
  it('converts standard D&D distances', () => {
    expect(feetToMeters(30)).toBe('9')   // 30ft = 9m
    expect(feetToMeters(25)).toBe('7.5') // 25ft = 7.5m
    expect(feetToMeters(5)).toBe('1.5')  // 5ft = 1.5m
  })

  it('handles zero', () => {
    expect(feetToMeters(0)).toBe('0')
  })
})

/**
 * Impedisce il ritorno del difetto per cui la CA del riepilogo e quella della
 * scheda PDF valevano sempre 10 + mod DES: armatura indossata e scudo non
 * entravano nel conto, e un paladino in armatura di piastre finiva a CA 10.
 */
describe('computeArmorClass', () => {
  function withArmor(armor: string, dex: number, shield = false) {
    return {
      armor,
      shield,
      abilityScores: { str: 10, dex, con: 10, int: 10, wis: 10, cha: 10 },
      racialBonuses: {},
    } as Pick<CharacterData, 'armor' | 'shield' | 'abilityScores' | 'racialBonuses'>
  }

  it('armatura pesante: la Destrezza non conta, lo scudo sì', () => {
    // Paladino in Piastre (CA 18) con scudo, DES 16: 18 + 2 = 20, non 18 + 3 + 2
    expect(computeArmorClass(withArmor('Plate', 16, true))).toBe(20)
    // Guerriero in Cotta di maglia (CA 16), DES 14: resta 16
    expect(computeArmorClass(withArmor('Chain Mail', 14))).toBe(16)
  })

  it('armatura media: il bonus di Destrezza si ferma a +2', () => {
    // Chierico in Corazza di scaglie (CA 14) con DES 20 (+5): 14 + 2 = 16
    expect(computeArmorClass(withArmor('Scale Mail', 20))).toBe(16)
    // Con DES 12 (+1) il bonus passa per intero
    expect(computeArmorClass(withArmor('Scale Mail', 12))).toBe(15)
  })

  it('armatura leggera più scudo: Destrezza per intero', () => {
    // Cuoio borchiato (CA 12) + DES 18 (+4) + scudo: 12 + 4 + 2 = 18
    expect(computeArmorClass(withArmor('Studded Leather', 18, true))).toBe(18)
  })

  it('senza armatura resta 10 + mod DES', () => {
    expect(computeArmorClass(withArmor('', 16))).toBe(13)
    expect(computeArmorClass(withArmor('', 16, true))).toBe(15)
  })

  it('tiene conto dei bonus razziali alla Destrezza', () => {
    const char = withArmor('Leather', 14) as CharacterData
    char.racialBonuses = { dex: 2 }
    // DES 14 + 2 = 16 (+3), cuoio CA 11 → 14
    expect(computeArmorClass(char)).toBe(14)
  })

  /**
   * Impedisce il ritorno del difetto per cui la Difesa senza Armatura non
   * entrava nel conto: il calcolo non riceveva la classe, e monaco e barbaro
   * senza armatura restavano a 10 + mod DES (un monaco a CA 14 invece di 17).
   */
  describe('Difesa senza Armatura', () => {
    function unarmored(className: string, dex: number, wis: number, con: number, shield = false) {
      return {
        armor: '',
        shield,
        abilityScores: { str: 10, dex, con, int: 10, wis, cha: 10 },
        racialBonuses: {},
        className,
        classes: [],
      } as ArmorClassInput
    }

    it('il monaco somma la Saggezza, ma non se impugna uno scudo', () => {
      // DES 16 (+3), SAG 16 (+3): 10 + 3 + 3 = 16
      expect(computeArmorClass(unarmored('monk', 16, 16, 12))).toBe(16)
      // Con lo scudo il privilegio decade: 10 + 3 + 2 = 15
      expect(computeArmorClass(unarmored('monk', 16, 16, 12, true))).toBe(15)
    })

    it('il barbaro somma la Costituzione, scudo compreso', () => {
      // DES 14 (+2), COS 16 (+3): 10 + 2 + 3 = 15
      expect(computeArmorClass(unarmored('barbarian', 14, 10, 16))).toBe(15)
      // Lo scudo si somma comunque: 15 + 2 = 17
      expect(computeArmorClass(unarmored('barbarian', 14, 10, 16, true))).toBe(17)
    })

    it('con l\'armatura addosso il privilegio non si applica', () => {
      const char = withArmor('Chain Mail', 14) as CharacterData
      char.className = 'barbarian'
      char.abilityScores.con = 18
      expect(computeArmorClass(char)).toBe(16)
    })

    it('le altre classi restano a 10 + mod DES', () => {
      expect(computeArmorClass(unarmored('wizard', 16, 18, 18))).toBe(13)
    })

    it('nel multiclasse vale la voce più conveniente', () => {
      const char = unarmored('fighter', 14, 10, 16) as CharacterData
      char.classes = [
        { classId: 'fighter', subclass: '', level: 2, hitDie: 10 },
        { classId: 'barbarian', subclass: '', level: 1, hitDie: 12 },
      ]
      // Il barbaro nel multiclasse porta la Costituzione: 10 + 2 + 3 = 15
      expect(computeArmorClass(char)).toBe(15)
    })
  })
})
