import { useI18n } from 'vue-i18n'
import { translateGameTerm } from '@/i18n/gameTerms'
import type { GameTermCategory } from '@/i18n/gameTerms'

/**
 * Composable that provides translation functions for game terms
 * (weapons, armor, spells, classes, races, etc.) based on current locale.
 */
export function useGameTerms() {
  const { locale } = useI18n()

  function translate(name: string, category: GameTermCategory, variant?: string): string {
    return translateGameTerm(name, locale.value, category, variant)
  }

  function weapon(name: string): string {
    return translate(name, 'weapon')
  }

  function armorName(name: string): string {
    return translate(name, 'armor')
  }

  function spell(name: string): string {
    return translate(name, 'spell')
  }

  function school(name: string): string {
    return translate(name, 'school')
  }

  function damageType(name: string): string {
    return translate(name, 'damageType')
  }

  function pack(name: string): string {
    return translate(name, 'pack')
  }

  function background(name: string): string {
    return translate(name, 'background')
  }

  /**
   * Translate a class name. For variant-specific names (Brancalonia/Apocalisse),
   * pass the variant to get the correct Italian name.
   * Accepts both English names ("Barbarian") and class IDs ("barbarian").
   * @param name - English class name or class ID
   * @param variant - Game variant for variant-specific overrides
   */
  function className(name: string, variant?: string): string {
    return translate(name, 'class', variant)
  }

  /**
   * Translate a race name to Italian.
   * @param name - English race name (e.g., "Dwarf", "Gifted")
   */
  function raceName(name: string): string {
    return translate(name, 'race')
  }

  /**
   * Translate a subrace name to Italian.
   * @param name - English subrace name (e.g., "Hill Dwarf", "Child of the Old World")
   */
  function subraceName(name: string): string {
    return translate(name, 'subrace')
  }

  /**
   * Translate a skill name to Italian.
   * @param name - English skill name (e.g., "Acrobatics", "Stealth")
   */
  function skill(name: string): string {
    return translate(name, 'skill')
  }

  /**
   * Translate an armor/weapon proficiency label to Italian.
   * @param name - English proficiency label (e.g., "light", "martial", "shields")
   */
  function proficiency(name: string): string {
    return translate(name, 'proficiency')
  }

  /**
   * Translate a class feature name to Italian.
   * @param name - English feature name (e.g., "Rage", "Sneak Attack")
   */
  function feature(name: string): string {
    return translate(name, 'feature')
  }

  /**
   * Translate a racial trait to Italian.
   * Accepts kebab-case IDs (D&D 5e/Brancalonia) or full sentences (Apocalisse).
   * @param name - Trait string exactly as defined in race data
   */
  function trait(name: string): string {
    return translate(name, 'trait')
  }

  /**
   * Translate a language name to Italian.
   * @param name - English language name (e.g., "Common", "Elvish")
   */
  function language(name: string): string {
    return translate(name, 'language')
  }

  /**
   * Translate a subclass name to Italian.
   * @param name - Subclass ID (e.g., "berserker", "school-of-evocation")
   */
  function subclassName(name: string): string {
    return translate(name, 'subclass')
  }

  /**
   * Translate an equipment item name to Italian.
   * @param name - Equipment item string (e.g., "Longsword", "Explorer's Pack")
   */
  function equipment(name: string): string {
    return translate(name, 'equipment')
  }

  /**
   * Translate a creature size to Italian.
   * @param name - English size as stored in the race data (e.g., "Medium")
   */
  function size(name: string): string {
    return translate(name, 'size')
  }

  /**
   * Translate a two-letter alignment code to the interface language.
   * @param code - Alignment code as stored on the sheet (e.g., "cn")
   */
  function alignment(code: string): string {
    return translate(code, 'alignment')
  }

  return { weapon, armorName, spell, school, damageType, pack, background, className, raceName, subraceName, skill, proficiency, feature, trait, language, subclassName, equipment, size, alignment }
}
