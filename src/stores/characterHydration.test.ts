import { describe, it as test, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { setActivePinia, createPinia } from 'pinia'
import { CHARACTER_SCHEMA_VERSION, featureNames, migrateCharacter } from './character'
import type { CharacterData } from './character'
import { preloadVariantData, getClasses } from '@/data'

/**
 * Il momento scomodo della migrazione: `pinia-plugin-persistedstate` reidrata
 * dal localStorage in modo sincrono, prima che i dati della variante — che si
 * caricano a richiesta, per non spedirli a chi non li apre — siano in memoria.
 *
 * Questo file, apposta, **non** chiama `preloadVariantData` all'inizio: è
 * l'unico posto in cui `getClasses()` è ancora vuota, e serve a provare che in
 * quelle condizioni la migrazione non congela un elenco inservibile.
 */
describe('migrazione all\'idratazione, prima che i dati della variante esistano', () => {
  function fixture(): CharacterData {
    return JSON.parse(fs.readFileSync(
      path.join(__dirname, '__fixtures__', 'reale-dnd5e-barbaro-10.json'), 'utf8',
    )) as CharacterData
  }

  test('a dati scarichi non perde nulla e si riserva di rifare il lavoro', async () => {
    setActivePinia(createPinia())
    expect(getClasses('dnd5e'), 'i dati non dovevano essere ancora caricati').toHaveLength(0)

    const c = fixture()
    const featuresTraitsSalvati = [...c.featuresTraits]
    migrateCharacter(c)

    // Lo slug d'armatura non dipende dal caricamento: la tabella è statica.
    expect(c.armorId).toBe('')
    // Nessun nome si perde…
    expect(featureNames(c.featureEntries!)).toEqual(featuresTraitsSalvati)
    expect(c.featuresTraits).toEqual(featuresTraitsSalvati)
    // …ma senza dati le voci non sanno da dove vengono, quindi la migrazione
    // resta dichiaratamente incompiuta invece di spacciarsi per finita.
    expect(c.featureEntries!.every(e => e.source === 'unknown')).toBe(true)
    expect(c.schemaVersion).toBe(1)

    // Caricati i dati, il passaggio successivo la porta a termine.
    await preloadVariantData('dnd5e')
    migrateCharacter(c)
    expect(c.schemaVersion).toBe(CHARACTER_SCHEMA_VERSION)
    expect(c.featureEntries!.some(e => e.source === 'class')).toBe(true)
    expect(c.featureEntries!.some(e => e.source === 'subclass')).toBe(true)
    expect(featureNames(c.featureEntries!)).toEqual(featuresTraitsSalvati)
    expect(c.featuresTraits).toEqual(featuresTraitsSalvati)
  })
})
