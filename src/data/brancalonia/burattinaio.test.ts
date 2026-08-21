import { describe, it, expect } from 'vitest'
import { burattinaioBrancaloniaClass as puppeteer } from './burattinaio'
import { featureNamesIt, subclassNamesIt, brancaloniaClassNamesIt } from '@/i18n/gameTerms'

describe('burattinaio (Puppeteer)', () => {
  it('is an Intelligence-based class, not a spellcaster', () => {
    // Everything the Puppeteer does runs through the puppets, and the puppets'
    // attack bonus and save DC key off Intelligence. It has no spell list.
    expect(puppeteer.primaryAbility).toEqual(['int'])
    expect(puppeteer.savingThrows).toEqual(['dex', 'int'])
    expect(puppeteer.spellcasting).toBeNull()
  })

  it('matches the proficiencies printed in the Macaronicon', () => {
    expect(puppeteer.hitDie).toBe(8)
    expect(puppeteer.armorProficiencies).toEqual(['light'])
    expect(puppeteer.weaponProficiencies).toEqual(['simple'])
    expect(puppeteer.numSkillChoices).toBe(2)
    expect(puppeteer.skillChoices).toHaveLength(6)
  })

  it('picks its tradition at 1st level', () => {
    expect(puppeteer.subclassLevel).toBe(1)
    expect(puppeteer.subclasses.map(s => s.id)).toEqual(['mangiafuoco', 'geppetto'])
  })

  it('keeps every feature within the level 6 cap of the setting', () => {
    const features = [
      ...puppeteer.features,
      ...puppeteer.subclasses.flatMap(s => s.features),
    ]
    for (const f of features) {
      expect(f.level, f.id).toBeGreaterThanOrEqual(1)
      expect(f.level, f.id).toBeLessThanOrEqual(6)
      expect(f.description, f.id).toBeTruthy()
    }
  })

  it('translates the class, its traditions and every feature to Italian', () => {
    // Step3Class translates by the class name, not the id, so both must resolve
    expect(brancaloniaClassNamesIt[puppeteer.id]).toBe('Burattinaio')
    expect(brancaloniaClassNamesIt[puppeteer.name.toLowerCase()]).toBe('Burattinaio')
    for (const sub of puppeteer.subclasses) {
      expect(subclassNamesIt[sub.id], sub.id).toBeTruthy()
    }
    const features = [
      ...puppeteer.features,
      ...puppeteer.subclasses.flatMap(s => s.features),
    ]
    for (const f of features) {
      expect(featureNamesIt[f.name], f.name).toBeTruthy()
    }
  })
})
