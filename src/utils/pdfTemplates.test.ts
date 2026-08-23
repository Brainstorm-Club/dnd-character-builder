// Questo test legge i modelli PDF dal disco: i tipi di Node servono qui e
// solo qui, quindi si dichiarano nel file invece di aprirli a tutta l'app.
/// <reference types="node" />
import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { PDFDocument } from 'pdf-lib'
import fs from 'node:fs'
import { getDnd5eFieldMapping, getBrancaloniaFieldMapping } from './pdfFieldMapping'
import { generateRandomCharacter } from './randomCharacter'
import { preloadVariantData } from '@/data'
import type { GameVariant } from '@/stores/app'

/**
 * I nomi dei campi nei due modelli sono quelli scelti da chi ha disegnato le
 * schede, con spazi in coda e nomi sbagliati rimasti lì (la razza di
 * Brancalonia si chiama 'Nome 1'). Scrivere un nome che nel PDF non esiste non
 * dà errore: pdf-lib lo ignora e il dato sparisce senza un segno. È così che
 * la razza mancava dalla scheda brancaloniana.
 *
 * Qui si carica il modello vero e si controlla che ogni casella su cui il
 * codice scrive esista davvero.
 */
const MODELLI: [GameVariant, string, 'dnd' | 'branca'][] = [
  ['dnd5e', 'dnd-5e-sheet', 'dnd'],
  ['dnd2024', 'dnd-5e-sheet', 'dnd'],
  ['apocalisse', 'dnd-5e-sheet', 'dnd'],
  ['brancalonia', 'brancalonia-sheet', 'branca'],
]

async function caselleDelModello(file: string): Promise<Set<string>> {
  // Il Buffer di Node non supera la validazione di pdf-lib sotto jsdom.
  const dati = new Uint8Array(fs.readFileSync(`public/pdf/${file}.pdf`))
  const doc = await PDFDocument.load(dati, { ignoreEncryption: true })
  return new Set(doc.getForm().getFields().map(f => f.getName()))
}

describe.each(MODELLI)('scheda PDF — %s', (variante, file, quale) => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    await preloadVariantData(variante)
  })

  it('scrive solo su caselle che esistono nel modello', async () => {
    const reali = await caselleDelModello(file)
    const scritte = new Set<string>()
    for (let i = 0; i < 25; i++) {
      const c = generateRandomCharacter(variante, 1 + (i % 12))
      c.coins = { cp: 1, sp: 2, ep: 3, gp: 4, pp: 5 }
      c.weapons = [
        { name: 'Dagger', attackBonus: 5, damage: '1d4' },
        { name: 'Shortbow', attackBonus: 4, damage: '1d6' },
        { name: 'Club', attackBonus: 3, damage: '1d4' },
      ]
      const m = quale === 'dnd' ? getDnd5eFieldMapping(c, 'it') : getBrancaloniaFieldMapping(c)
      for (const k of Object.keys(m)) scritte.add(k)
    }
    const fantasma = [...scritte].filter(k => !reali.has(k))
    expect(fantasma, `caselle inesistenti nel modello: il dato scritto qui si perde`).toEqual([])
  })

  it('riempie sempre le caselle anagrafiche: nome, classe, livello, razza', async () => {
    for (let i = 0; i < 20; i++) {
      const c = generateRandomCharacter(variante, 1 + (i % 12))
      const m = quale === 'dnd' ? getDnd5eFieldMapping(c, 'it') : getBrancaloniaFieldMapping(c)
      const chi = `${variante} ${c.race}/${c.className} lv${c.level}`
      const [nome, classe, razza] = quale === 'dnd'
        ? [m['CharacterName'], m['ClassLevel'], m['Race ']]
        : [m['Nome'], m['Classe'], m['Nome 1']]
      expect(nome, `${chi}: nome`).toBeTruthy()
      expect(classe, `${chi}: classe`).toBeTruthy()
      expect(razza, `${chi}: razza`).toBeTruthy()
      if (quale === 'branca') expect(m['Liv'], `${chi}: livello`).toBeTruthy()
    }
  })
})
