import { describe, it, expect } from 'vitest'
import { dnd2024Classes } from './classes'
import { dnd2024FeatureDescriptionsIt } from './classes-it'
import { getFeatureDescription, preloadVariantData } from '../index'

/** Tutti gli id dei privilegi della variante 2024, classi e sottoclassi. */
function allFeatureIds(): string[] {
  const ids = new Set<string>()
  for (const cls of dnd2024Classes) {
    for (const f of cls.features) ids.add(f.id)
    for (const sub of cls.subclasses ?? []) {
      // Anche la sottoclasse ha una descrizione, e la schermata di scelta la
      // cerca in questa stessa mappa passando il suo id.
      ids.add(sub.id)
      for (const f of sub.features ?? []) ids.add(f.id)
    }
  }
  return [...ids]
}

describe('descrizioni italiane dei privilegi di D&D 2024', () => {
  it('copre ogni privilegio di classe e di sottoclasse', () => {
    const mancanti = allFeatureIds().filter(id => !(id in dnd2024FeatureDescriptionsIt))
    expect(mancanti).toEqual([])
  })

  it('non contiene id che non esistono nei dati', () => {
    const noti = new Set(allFeatureIds())
    const orfani = Object.keys(dnd2024FeatureDescriptionsIt).filter(id => !noti.has(id))
    expect(orfani).toEqual([])
  })

  it('non lascia inglese residuo nelle descrizioni', () => {
    const inglese = /\b(you can|your|the target|saving throw|hit points|bonus action)\b/i
    const sospette = Object.entries(dnd2024FeatureDescriptionsIt)
      .filter(([, testo]) => inglese.test(testo))
      .map(([id]) => id)
    expect(sospette).toEqual([])
  })

  it('scrive descrizioni di lunghezza sensata', () => {
    const corte = Object.entries(dnd2024FeatureDescriptionsIt)
      .filter(([, testo]) => testo.length < 40)
      .map(([id]) => id)
    expect(corte).toEqual([])
  })

  it('usa la terminologia 2024, non quella del 2014', () => {
    // Il monaco 2024 spende punti concentrazione, non ki.
    expect(dnd2024FeatureDescriptionsIt['monk-s-focus']).toContain('punti concentrazione')
    expect(dnd2024FeatureDescriptionsIt['monk-s-focus']).not.toMatch(/\bki\b/i)
    // La Padronanza d'armi esiste solo nel 2024.
    expect(dnd2024FeatureDescriptionsIt['weapon-mastery']).toContain('padronanza')
    // L'Ira 2024 dura fino alla fine del turno successivo e va prolungata.
    expect(dnd2024FeatureDescriptionsIt['rage']).toContain('prolungata')
  })
})

describe('getFeatureDescription per la variante 2024', () => {
  it('restituisce l\'italiano e non il fallback inglese', async () => {
    await preloadVariantData('dnd2024')
    for (const id of ['rage', 'weapon-mastery', 'monk-s-focus', 'cutting-words', 'overchannel']) {
      const testo = getFeatureDescription('dnd2024', id, 'it', 'FALLBACK')
      expect(testo).not.toBe('FALLBACK')
      expect(testo).toBe(dnd2024FeatureDescriptionsIt[id])
    }
  })

  it('lascia l\'inglese quando la lingua non è italiano', async () => {
    await preloadVariantData('dnd2024')
    expect(getFeatureDescription('dnd2024', 'rage', 'en', 'FALLBACK')).toBe('FALLBACK')
  })

  it('non pesca dalle descrizioni 2014 per gli id omonimi', async () => {
    await preloadVariantData('dnd2024')
    await preloadVariantData('dnd5e')
    const testo = getFeatureDescription('dnd2024', 'primal-champion', 'it', 'FALLBACK')
    expect(testo).toBe(dnd2024FeatureDescriptionsIt['primal-champion'])
    // Nel 2024 il massimo è 25, nel 2014 era 24.
    expect(testo).toContain('25')
  })
})
