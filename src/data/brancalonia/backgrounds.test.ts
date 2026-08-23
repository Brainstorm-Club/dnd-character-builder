import { describe, it, expect } from 'vitest'
import { brancaloniaBackgrounds } from './backgrounds'
import { SKILLS } from '../dnd5e/skills'

const skillIds = new Set(SKILLS.map(s => s.id))

describe('background di Brancalonia', () => {
  it('ha i 6 del Manuale di Ambientazione più i 14 delle espansioni', () => {
    expect(brancaloniaBackgrounds).toHaveLength(20)
  })

  it('non ha id o nomi italiani duplicati', () => {
    expect(new Set(brancaloniaBackgrounds.map(b => b.id)).size).toBe(20)
    expect(new Set(brancaloniaBackgrounds.map(b => b.nameOriginal)).size).toBe(20)
  })

  it('usa solo abilità esistenti', () => {
    for (const b of brancaloniaBackgrounds) {
      for (const s of b.skillProficiencies) expect(skillIds, `${b.name}: ${s}`).toContain(s)
    }
  })

  it('dà due competenze di abilità a tutti tranne il lavativo', () => {
    for (const b of brancaloniaBackgrounds) {
      const expected = b.id === 'slacker' ? 0 : 2
      expect(b.skillProficiencies.length, b.name).toBe(expected)
    }
  })

  it('ogni background ha privilegio, descrizione ed equipaggiamento', () => {
    for (const b of brancaloniaBackgrounds) {
      expect(b.feature.name.length, b.name).toBeGreaterThan(3)
      expect(b.feature.description.length, b.name).toBeGreaterThan(40)
      expect(b.description.length, b.name).toBeGreaterThan(60)
      expect(b.equipment.length, b.name).toBeGreaterThan(0)
    }
  })

  /**
   * L'equipaggiamento è stato riallineato riga per riga alle voci
   * «Equipaggiamento:» dei tre manuali italiani (Manuale di Ambientazione 2.6,
   * Macaronicon 2.2, L'Impero Randella Ancora 1.0), verificando ogni volta il
   * nome del background che precede la riga. Prima dieci divergevano: voci
   * mancanti, borse con l'importo sbagliato e due oggetti tradotti male.
   *
   * Il numero di voci è quello che conta il manuale: gli oggetti separati da
   * virgola sono voci distinte (per questo calamaio e pennino sono due), le
   * alternative unite da "o" restano una sola.
   */
  const dotazioneDaManuale: Record<string, { voci: number; contiene: string[] }> = {
    // ── Manuale di Ambientazione 2.6
    ambulant: { voci: 3, contiene: ['A jewel dedicated to Saint Pathrick', 'A pouch containing 15 sp'] },
    brawler: { voci: 4, contiene: ['A brawl trophy (roll an additional Memorabilia)', 'A pouch containing 15 sp'] },
    finagler: { voci: 6, contiene: ['A bottle of black ink', 'An ink pen', 'A pouch containing 20 sp'] },
    fugitive: { voci: 4, contiene: ['A dagger', 'A pouch containing 10 sp'] },
    rover: { voci: 5, contiene: ['A staff', 'Colored pigments', 'A pouch containing 10 sp'] },
    tough: { voci: 4, contiene: ['A pendant of Saint Marauda', 'A pouch containing 15 sp'] },
    // ── Macaronicon 2.2
    crosser: { voci: 2, contiene: ['A set of traveler\'s clothes', 'A pouch containing 15 sp'] },
    'dispatch-rider': {
      voci: 5,
      contiene: [
        'A pouch containing a secret pocket for dispatches',
        'A dice set or a poppycock card deck',
        'A pouch containing 10 sp',
      ],
    },
    enamored: { voci: 6, contiene: ['A bottle of black ink', 'An ink pen', 'A pouch containing 15 sp'] },
    impresario: { voci: 3, contiene: ['A well-made outfit', 'A pouch containing 20 sp'] },
    lucignolo: { voci: 3, contiene: ['One additional Memorabilia', 'A pouch containing 15 sp'] },
    prelate: { voci: 4, contiene: ['Priest\'s vestments', 'A pouch containing 25 sp'] },
    'relic-hunter': {
      voci: 4,
      contiene: ['A parchment case filled with study notes and maps', 'A crowbar', 'A pouch containing 10 sp'],
    },
    // ── L'Impero Randella Ancora 1.0
    'fork-adept': { voci: 3, contiene: ['A cape of the Order', 'A pouch containing 20 sp'] },
    'fork-renegade': { voci: 3, contiene: ['Forged documents', 'A pouch containing 15 sp'] },
    blazoned: {
      voci: 5,
      contiene: ['A rusty noble seal', 'An expired pass permit', 'A patched noble outfit', 'A pouch containing 25 sp'],
    },
    herbalist: { voci: 3, contiene: ['Worn gloves', 'A pouch containing 10 sp'] },
    // Il polveriere non ha denaro: il manuale si ferma alle melagranate.
    'powder-dabbler': { voci: 1, contiene: ['3 flawed pomegrenades'] },
    slacker: { voci: 4, contiene: ['A pouch with 30 sp that fell into your hands in a sheer stroke of luck'] },
    inspirited: { voci: 3, contiene: ['A strange receipt detailing an unknown purchase', 'A pouch containing 15 sp'] },
  }

  it('ha la dotazione contata dai manuali, voce per voce', () => {
    for (const b of brancaloniaBackgrounds) {
      const atteso = dotazioneDaManuale[b.id]
      expect(atteso, `${b.id} non è nella tabella dei manuali`).toBeDefined()
      expect(b.equipment.length, `${b.id}: ${b.equipment.join(' | ')}`).toBe(atteso!.voci)
      for (const voce of atteso!.contiene) expect(b.equipment, b.id).toContain(voce)
    }
  })

  it('non porta più le voci sbagliate corrette sui manuali', () => {
    const tutte = brancaloniaBackgrounds.flatMap(b => b.equipment)
    // La bolla nobiliare del blasonato è un sigillo, non una lama.
    expect(tutte).not.toContain('A rusty blade')
    // Il suscitato ha una ricevuta, non un ninnolo qualsiasi.
    expect(tutte).not.toContain('A strange trinket')
    // La staffetta ha una borsa con la tasca per i dispacci, non un messaggio.
    expect(tutte).not.toContain('A pouch containing a secret communication')
    // Calamaio e pennino non tornano fusi in una voce sola.
    expect(tutte).not.toContain('A bottle of black ink and a pen')
    expect(tutte).not.toContain('Ink and an ink pen')
  })

  it('mette la borsa in fondo, come il manuale — tranne al lucignolo', () => {
    for (const b of brancaloniaBackgrounds) {
      const conBorsa = b.equipment.filter(v => /\d+ sp/.test(v))
      if (conBorsa.length === 0) {
        // Solo il polveriere resta senza denaro.
        expect(b.id).toBe('powder-dabbler')
        continue
      }
      expect(conBorsa, b.id).toHaveLength(1)
      // Il Macaronicon elenca il Cimelio del lucignolo dopo la borsa.
      const attesa = b.id === 'lucignolo' ? b.equipment.length - 2 : b.equipment.length - 1
      expect(b.equipment.indexOf(conBorsa[0]!), b.id).toBe(attesa)
    }
  })

  it('i due background della Forca concedono un talento della Forca', () => {
    for (const id of ['fork-adept', 'fork-renegade']) {
      const b = brancaloniaBackgrounds.find(x => x.id === id)
      expect(b?.feature.name, id).toBe('Fork Feat')
      expect(b?.feature.description, id).toMatch(/Fork feats list/)
    }
  })
})
