import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import itJson from './it.json'
import enJson from './en.json'

type Tree = { [k: string]: unknown }

/** Appiattisce l'albero in chiavi puntate ("spells.ritual"). */
function flatten(node: Tree, prefix = ''): string[] {
  const out: string[] = []
  for (const key of Object.keys(node)) {
    const value = node[key]
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...flatten(value as Tree, path))
    } else {
      out.push(path)
    }
  }
  return out
}

const it_ = flatten(itJson as unknown as Tree)
const en_ = flatten(enJson as unknown as Tree)

describe('file di lingua', () => {
  it('sono JSON validi', () => {
    // Rileggerli dal disco: l'import di Vite normalizza, il parse no.
    for (const file of ['it.json', 'en.json']) {
      const raw = readFileSync(resolve(__dirname, file), 'utf8')
      expect(() => JSON.parse(raw), file).not.toThrow()
    }
  })

  it('hanno esattamente le stesse chiavi', () => {
    // Una chiave presente in una sola lingua manda in produzione la stringa
    // grezza della chiave: it.json ne aveva tre in più di en.json.
    expect(en_.filter(k => !it_.includes(k))).toEqual([])
    expect(it_.filter(k => !en_.includes(k))).toEqual([])
    expect(it_.length).toBe(en_.length)
  })

  it('non lasciano stringhe vuote', () => {
    const empty = (tree: Tree, keys: string[]) =>
      keys.filter(k => {
        const value = k.split('.').reduce<unknown>((n, part) => (n as Tree)?.[part], tree)
        return typeof value === 'string' && value.trim() === ''
      })
    expect(empty(itJson as unknown as Tree, it_)).toEqual([])
    expect(empty(enJson as unknown as Tree, en_)).toEqual([])
  })

  it('ha una promo per ognuna delle quattro varianti', () => {
    // VariantPromo compone la chiave a runtime (`variant.${variant}Promo`):
    // se ne manca una il riquadro stampa la chiave al posto del testo.
    for (const variant of ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse']) {
      expect(it_, `it ${variant}`).toContain(`variant.${variant}Promo`)
      expect(en_, `en ${variant}`).toContain(`variant.${variant}Promo`)
    }
  })

  it('espone le etichette che LanguageSwitcher e Step7Spells non scrivono più a mano', () => {
    for (const key of [
      'common.close',
      'common.changeLanguage',
      'common.availableLanguages',
      'spells.levelShort',
      'spells.slots',
      'spells.showDetail',
    ]) {
      expect(it_, `it ${key}`).toContain(key)
      expect(en_, `en ${key}`).toContain(key)
    }
  })

  it('usa lo stesso set di segnaposto nelle due lingue', () => {
    // "Passo {current} di {total}" tradotto perdendo {total} stampa un buco.
    const placeholders = (s: string) => (s.match(/\{[^}]+\}/g) ?? []).sort()
    const read = (tree: Tree, k: string) =>
      k.split('.').reduce<unknown>((n, part) => (n as Tree)?.[part], tree)
    const mismatched = it_.filter(k => {
      const a = read(itJson as unknown as Tree, k)
      const b = read(enJson as unknown as Tree, k)
      if (typeof a !== 'string' || typeof b !== 'string') return false
      return placeholders(a).join('|') !== placeholders(b).join('|')
    })
    expect(mismatched).toEqual([])
  })
})
