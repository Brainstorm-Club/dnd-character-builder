import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Il localStorage di jsdom in questa configurazione non conserva nulla fra un
 * `vi.resetModules()` e l'altro (`localStorage.length` è undefined), quindi
 * senza questo doppione in memoria il ramo "cache calda" non viene mai
 * percorso e il difetto non si riproduce.
 */
function installPersistentLocalStorage(): Map<string, string> {
  const backing = new Map<string, string>()
  const stub = {
    getItem: (k: string) => backing.get(k) ?? null,
    setItem: (k: string, v: string) => { backing.set(k, String(v)) },
    removeItem: (k: string) => { backing.delete(k) },
    clear: () => { backing.clear() },
    key: (i: number) => [...backing.keys()][i] ?? null,
    get length() { return backing.size },
  }
  vi.stubGlobal('localStorage', stub)
  return backing
}

describe('incantesimi della variante 2024 con la cache già scritta', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  /**
   * Impedisce il ritorno del difetto per cui `ensureDnd2024()` assegnava la
   * funzione di trasformazione degli incantesimi solo nel ramo di caricamento
   * dinamico: alla seconda visita i dati arrivavano dalla cache di
   * localStorage, la funzione restava nulla e `getSpells('dnd2024')`
   * restituiva la lista 2014 (317 incantesimi invece di 338).
   */
  it('la seconda visita vede la stessa lista della prima', async () => {
    const backing = installPersistentLocalStorage()

    // Prima visita: cache vuota, i moduli vengono importati davvero
    const first = await import('./index')
    await first.preloadVariantData('dnd2024')
    const firstSpells = first.getSpells('dnd2024')
    expect(backing.size, 'la prima visita non ha scritto la cache').toBeGreaterThan(0)

    // Seconda visita: stessi moduli ricaricati da zero, ma cache calda
    vi.resetModules()
    const second = await import('./index')
    await second.preloadVariantData('dnd2024')
    const secondSpells = second.getSpells('dnd2024')

    expect(secondSpells.length, 'la lista 2024 è regredita a quella del 2014').toBe(firstSpells.length)
    expect(secondSpells.length).toBe(338)

    const ids = new Set(secondSpells.map(s => s.id))
    // Esclusivi del 2024: se mancano, la lista è quella del 2014
    expect(ids.has('sorcerous-burst'), 'sorcerous-burst').toBe(true)
    expect(ids.has('elementalism'), 'elementalism').toBe(true)
    expect(ids.has('starry-wisp'), 'starry-wisp').toBe(true)
    // Rimossi dal 2024: se ci sono, la lista è quella del 2014
    expect(ids.has('blade-ward'), 'blade-ward').toBe(false)
    expect(ids.has('8-feeblemind'), '8-feeblemind').toBe(false)
  })

  it('anche le liste di classe restano quelle della prima visita', async () => {
    installPersistentLocalStorage()

    const first = await import('./index')
    await first.preloadVariantData('dnd2024')
    const firstDruid = first.getSpells('dnd2024')
      .filter(s => s.level === 1 && s.classes.includes('druid'))
      .map(s => s.id)
      .sort()

    vi.resetModules()
    const second = await import('./index')
    await second.preloadVariantData('dnd2024')
    const secondDruid = second.getSpells('dnd2024')
      .filter(s => s.level === 1 && s.classes.includes('druid'))
      .map(s => s.id)
      .sort()

    expect(secondDruid, 'la lista del druido è tornata quella del 2014').toEqual(firstDruid)
  })
})
