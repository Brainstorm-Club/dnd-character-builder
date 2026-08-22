import { describe, it, expect } from 'vitest'
import { dnd2024Species } from './races'
import { dnd2024Backgrounds } from './backgrounds'
import { races as races2014 } from '../dnd5e/races'
import { SKILLS } from '../dnd5e/skills'

const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha']

describe('specie di D&D 2024', () => {
  it('ha le 9 specie dell\'SRD 5.2.1', () => {
    expect(dnd2024Species).toHaveLength(9)
    expect(dnd2024Species.map(s => s.id).sort()).toEqual([
      'dragonborn', 'dwarf', 'elf', 'gnome', 'goliath', 'halfling', 'human', 'orc', 'tiefling',
    ])
  })

  it('non dà bonus alle caratteristiche: nel 2024 li dà il background', () => {
    // È la differenza che distingue le due edizioni a colpo d'occhio.
    for (const s of dnd2024Species) {
      expect(Object.keys(s.abilityBonuses), s.name).toEqual([])
      expect(s.abilityScoreChoice, s.name).toBeUndefined()
    }
    // ...mentre nel 2014 li dava, e quei dati restano intatti.
    expect(races2014.some(r => Object.keys(r.abilityBonuses).length > 0)).toBe(true)
  })

  it('modella le discendenze come sottorazze da scegliere', () => {
    const byId = new Map(dnd2024Species.map(s => [s.id, s]))
    expect(byId.get('dragonborn')!.subraces).toHaveLength(10) // i dieci draghi cromatici e metallici
    expect(byId.get('elf')!.subraces).toHaveLength(3)         // Drow, Alto Elfo, Elfo dei Boschi
    expect(byId.get('gnome')!.subraces).toHaveLength(2)
    expect(byId.get('goliath')!.subraces).toHaveLength(6)
    expect(byId.get('tiefling')!.subraces).toHaveLength(3)
    // Le altre non hanno discendenze da scegliere
    for (const id of ['dwarf', 'halfling', 'human', 'orc']) {
      expect(byId.get(id)!.subraces, id).toHaveLength(0)
    }
  })

  it('riporta velocità e taglia del manuale', () => {
    const byId = new Map(dnd2024Species.map(s => [s.id, s]))
    expect(byId.get('goliath')!.speed).toBe(35)   // l'unica a 10,5 metri
    expect(byId.get('gnome')!.size).toBe('Small')
    expect(byId.get('halfling')!.size).toBe('Small')
    expect(byId.get('orc')!.speed).toBe(30)
  })

  it('ha un blurb su ogni specie', () => {
    for (const s of dnd2024Species) {
      expect(s.blurb, s.name).toBeDefined()
      expect(s.blurb!.length, s.name).toBeGreaterThan(80)
      expect(s.blurb!.length, `${s.name} troppo lungo`).toBeLessThan(230)
    }
  })
})

describe('background di D&D 2024', () => {
  it('ha i 4 dell\'SRD 5.2.1', () => {
    expect(dnd2024Backgrounds.map(b => b.id)).toEqual(['acolyte', 'criminal', 'sage', 'soldier'])
  })

  it('assegna tre caratteristiche e un talento d\'origine', () => {
    for (const b of dnd2024Backgrounds) {
      expect(b.abilityScoreOptions, b.name).toHaveLength(3)
      for (const a of b.abilityScoreOptions!) expect(ABILITIES, `${b.name}: ${a}`).toContain(a)
      expect(b.originFeat, b.name).toBeTruthy()
    }
  })

  it('dà due competenze di abilità, come nel manuale', () => {
    const skillIds = new Set(SKILLS.map(s => s.id))
    for (const b of dnd2024Backgrounds) {
      expect(b.skillProficiencies, b.name).toHaveLength(2)
      for (const s of b.skillProficiencies) expect(skillIds, `${b.name}: ${s}`).toContain(s)
    }
  })

  it('usa le caratteristiche giuste per ogni background', () => {
    const byId = new Map(dnd2024Backgrounds.map(b => [b.id, b]))
    expect(byId.get('acolyte')!.abilityScoreOptions).toEqual(['int', 'wis', 'cha'])
    expect(byId.get('criminal')!.abilityScoreOptions).toEqual(['dex', 'con', 'int'])
    expect(byId.get('sage')!.abilityScoreOptions).toEqual(['con', 'int', 'wis'])
    expect(byId.get('soldier')!.abilityScoreOptions).toEqual(['str', 'dex', 'con'])
  })
})

describe('nomi italiani dei privilegi 2024', () => {
  it('ogni privilegio di classe ha un nome italiano', async () => {
    const { featureNamesIt } = await import('@/i18n/gameTerms')
    const { dnd2024Classes } = await import('./classes')
    const missing: string[] = []
    for (const c of dnd2024Classes) {
      for (const f of c.features) {
        if (!featureNamesIt[f.name]) missing.push(`${c.id}/${f.name}`)
      }
    }
    expect(missing).toEqual([])
  })

  it('non lascia artefatti di colonna nei nomi', async () => {
    const { dnd2024Classes } = await import('./classes')
    for (const c of dnd2024Classes) {
      for (const f of c.features) {
        // le tabelle del PDF portano colonne di dadi che si incollavano al nome
        expect(f.name, `${c.id}/${f.name}`).not.toMatch(/\s(D|\d*d\d+|\d+)$/)
        expect(f.name.length, `${c.id}/${f.name}`).toBeGreaterThan(2)
      }
    }
  })

  it('usa i nomi 2024, non quelli 2014', async () => {
    const { featureNamesIt } = await import('@/i18n/gameTerms')
    expect(featureNamesIt['Weapon Mastery']).toBe("Padronanza d'armi")
    expect(featureNamesIt['Monk’s Focus']).toBe('Concentrazione da monaco')
    expect(featureNamesIt['Deflect Attacks']).toBe('Devia attacchi')
    expect(featureNamesIt['Paladin’s Smite']).toBe('Punizione del paladino')
  })
})

describe('coerenza delle classi 2024', () => {
  it('ogni incantatore ha il privilegio che gli dà gli incantesimi', async () => {
    const { dnd2024Classes } = await import('./classes')
    for (const c of dnd2024Classes) {
      if (!c.spellcasting) continue
      const names = c.features.map(f => f.name)
      const hasIt = names.includes('Spellcasting') || names.includes('Pact Magic')
      expect(hasIt, `${c.id}: nessun privilegio di incantesimi`).toBe(true)
    }
  })

  it('non ha privilegi duplicati allo stesso livello', async () => {
    const { dnd2024Classes } = await import('./classes')
    for (const c of dnd2024Classes) {
      const seen = new Set<string>()
      for (const f of c.features) {
        const key = `${f.level}/${f.name}`
        expect(seen.has(key), `${c.id}: ${key} due volte`).toBe(false)
        seen.add(key)
      }
      expect(new Set(c.features.map(f => f.id)).size, `${c.id}: id duplicati`).toBe(c.features.length)
    }
  })

  it('sceglie la sottoclasse al 3° livello, come vuole il 2024', async () => {
    const { dnd2024Classes } = await import('./classes')
    for (const c of dnd2024Classes) expect(c.subclassLevel, c.id).toBe(3)
  })

  it('paladino e ranger lanciano incantesimi dal 1° livello', async () => {
    const { dnd2024Classes } = await import('./classes')
    for (const id of ['paladin', 'ranger']) {
      const c = dnd2024Classes.find(x => x.id === id)!
      const sc = c.features.find(f => f.name === 'Spellcasting')
      expect(sc, `${id}: manca Spellcasting`).toBeDefined()
      expect(sc!.level, `${id}: nel 2024 parte dal 1°, non dal 2°`).toBe(1)
    }
  })
})

describe('sottoclassi di D&D 2024', () => {
  // Quanti privilegi ha ogni sottoclasse nell'SRD 5.2.1: numeri contati sul
  // manuale, non sull'estrazione, così una riga persa fa fallire il test.
  const ATTESI: Record<string, [string, number]> = {
    barbarian: ['path-of-the-berserker', 4],
    bard: ['college-of-lore', 4],
    cleric: ['life-domain', 5],
    druid: ['circle-of-the-land', 5],
    fighter: ['champion', 6],
    monk: ['warrior-of-the-open-hand', 4],
    paladin: ['oath-of-devotion', 5],
    ranger: ['hunter', 5],
    rogue: ['thief', 5],
    sorcerer: ['draconic-sorcery', 5],
    warlock: ['fiend-patron', 5],
    wizard: ['evoker', 5],
  }

  it('ha una sola sottoclasse per classe, e nessuna è vuota', async () => {
    const { dnd2024Classes } = await import('./classes')
    expect(dnd2024Classes).toHaveLength(12)
    for (const c of dnd2024Classes) {
      expect(c.subclasses, c.id).toHaveLength(1)
      const atteso = ATTESI[c.id]
      expect(atteso, `${c.id}: classe non prevista`).toBeDefined()
      const [id, quanti] = atteso!
      expect(c.subclasses[0]!.id, c.id).toBe(id)
      expect(c.subclasses[0]!.features.length, `${c.id}: privilegi di ${id}`).toBe(quanti)
    }
  })

  it('ha i 58 privilegi di sottoclasse dell\'SRD 5.2.1', async () => {
    const { dnd2024Classes } = await import('./classes')
    const totale = dnd2024Classes.reduce(
      (n, c) => n + c.subclasses.reduce((m, s) => m + s.features.length, 0), 0)
    expect(totale).toBe(58)
  })

  it('non dà privilegi prima del 3° livello né oltre il 20°', async () => {
    const { dnd2024Classes } = await import('./classes')
    for (const c of dnd2024Classes) {
      for (const s of c.subclasses) {
        const livelli = s.features.map(f => f.level)
        for (const l of livelli) {
          expect(l, `${s.id}: livello ${l}`).toBeGreaterThanOrEqual(c.subclassLevel)
          expect(l, `${s.id}: livello ${l}`).toBeLessThanOrEqual(20)
        }
        // La sottoclasse deve dare qualcosa già nel momento in cui la si sceglie
        expect(Math.min(...livelli), `${s.id}: niente al 3° livello`).toBe(c.subclassLevel)
        // ...e i privilegi sono in ordine di livello, come nel manuale
        expect(livelli, `${s.id}: livelli fuori ordine`).toEqual([...livelli].sort((a, b) => a - b))
      }
    }
  })

  it('non ha id duplicati fra classe e sottoclasse', async () => {
    const { dnd2024Classes } = await import('./classes')
    for (const c of dnd2024Classes) {
      const ids = [...c.features.map(f => f.id), ...c.subclasses.flatMap(s => s.features.map(f => f.id))]
      expect(new Set(ids).size, `${c.id}: id ripetuti`).toBe(ids.length)
      for (const s of c.subclasses) {
        for (const f of s.features) expect(f.id, `${s.id}/${f.name}`).toMatch(/^[a-z0-9-]+$/)
      }
    }
  })

  it('non lascia descrizioni tronche o sporche di PDF', async () => {
    const { dnd2024Classes } = await import('./classes')
    // Le colonne del PDF si intrufolavano nei testi: queste stringhe sono le
    // tracce che lasciavano quando l'estrazione sbordava nella voce accanto.
    const sporcizia = /System Reference Document|This section presents|Spell List|Core \w+ Traits|@@@/
    for (const c of dnd2024Classes) {
      for (const s of c.subclasses) {
        for (const f of s.features) {
          const eti = `${s.id}/${f.name}`
          expect(f.description.length, eti).toBeGreaterThan(50)
          expect(f.description, eti).not.toMatch(sporcizia)
          // Un testo tronco a metà frase comincia in minuscolo o non finisce col punto
          expect(f.description[0], `${eti}: comincia a metà frase`).toMatch(/[A-Z“"]/)
          expect(f.description.trim(), `${eti}: finisce a metà frase`).toMatch(/[.”]$/)
        }
      }
    }
  })

  it('dà un nome italiano a ogni privilegio di sottoclasse', async () => {
    const { featureNamesIt } = await import('@/i18n/gameTerms')
    const { dnd2024Classes } = await import('./classes')
    const mancanti: string[] = []
    for (const c of dnd2024Classes) {
      for (const s of c.subclasses) {
        for (const f of s.features) if (!featureNamesIt[f.name]) mancanti.push(`${s.id}/${f.name}`)
      }
    }
    expect(mancanti).toEqual([])
  })

  it('riporta i privilegi caratteristici, con il livello del manuale', async () => {
    const { dnd2024Classes } = await import('./classes')
    const trova = (cls: string, nome: string) =>
      dnd2024Classes.find(c => c.id === cls)!.subclasses[0]!.features.find(f => f.name === nome)
    expect(trova('barbarian', 'Frenzy')!.level).toBe(3)
    expect(trova('barbarian', 'Intimidating Presence')!.level).toBe(14)
    expect(trova('fighter', 'Improved Critical')!.level).toBe(3)   // nel 2014 era al 3° come qui
    expect(trova('fighter', 'Superior Critical')!.level).toBe(15)
    expect(trova('monk', 'Quivering Palm')!.level).toBe(17)
    expect(trova('paladin', 'Holy Nimbus')!.level).toBe(20)
    expect(trova('rogue', 'Use Magic Device')!.level).toBe(13)
    expect(trova('wizard', 'Potent Cantrip')!.level).toBe(3)
    // Il monaco 2024 spende Punti concentrazione, non Ki
    expect(trova('monk', 'Quivering Palm')!.description).toContain('Focus Points')
    expect(trova('monk', 'Quivering Palm')!.description).not.toContain('ki point')
  })
})

describe('incantesimi 2024', () => {
  it('include i 23 che esistono solo nell\'SRD 5.2.1', async () => {
    const { toDnd2024Spells } = await import('./spells')
    const { dnd2024OnlySpells } = await import('./spells-new')
    const { spells } = await import('../dnd5e/spells')
    const list = toDnd2024Spells(spells)
    const names = new Set(list.map(s => s.name))
    for (const s of dnd2024OnlySpells) expect(names, s.name).toContain(s.name)
    expect(dnd2024OnlySpells).toHaveLength(23)
  })

  it('toglie quelli usciti dall\'SRD e non crea doppioni', async () => {
    const { toDnd2024Spells } = await import('./spells')
    const { spells } = await import('../dnd5e/spells')
    const list = toDnd2024Spells(spells)
    const names = list.map(s => s.name)
    expect(new Set(names).size, 'nomi duplicati').toBe(names.length)
    expect(new Set(list.map(s => s.id)).size, 'id duplicati').toBe(list.length)
    expect(names).not.toContain('Blade Ward')
    expect(names).not.toContain('Feeblemind')
  })

  it('ha metadati completi su ogni incantesimo aggiunto', async () => {
    const { dnd2024OnlySpells } = await import('./spells-new')
    for (const s of dnd2024OnlySpells) {
      expect(s.castingTime, s.name).toBeTruthy()
      expect(s.range, s.name).toBeTruthy()
      expect(s.components, s.name).toMatch(/^[VSM](, [VSM])*$/)
      expect(s.duration, s.name).toBeTruthy()
      expect(s.description.length, s.name).toBeGreaterThan(40)
      expect(s.classes.length, s.name).toBeGreaterThan(0)
    }
  })

  it('assegna solo classi valide', async () => {
    const { dnd2024OnlySpells } = await import('./spells-new')
    const CL = ['bard','cleric','druid','paladin','ranger','sorcerer','warlock','wizard']
    for (const s of dnd2024OnlySpells) {
      for (const c of s.classes) expect(CL, `${s.name}: ${c}`).toContain(c)
    }
  })
})

describe('talenti 2024', () => {
  it('ha i 16 dell\'SRD 5.2.1, divisi per categoria', async () => {
    const { dnd2024Feats, getFeatsByCategory } = await import('./feats')
    expect(dnd2024Feats).toHaveLength(16)
    expect(getFeatsByCategory('origin').map(f => f.id).sort())
      .toEqual(['alert', 'magic-initiate', 'savage-attacker'])
    expect(getFeatsByCategory('general')).toHaveLength(2)
    expect(getFeatsByCategory('fighting-style')).toHaveLength(4)
    expect(getFeatsByCategory('epic-boon')).toHaveLength(7)
  })

  it('descrive ogni talento e ne segna i requisiti', async () => {
    const { dnd2024Feats } = await import('./feats')
    for (const f of dnd2024Feats) {
      expect(f.description.length, f.name).toBeGreaterThan(50)
      // i talenti d'origine non hanno requisiti, gli altri sì
      if (f.category === 'origin') expect(f.prerequisite, f.name).toBeUndefined()
      else expect(f.prerequisite, f.name).toBeTruthy()
    }
  })

  it('i background rimandano a talenti d\'origine che esistono', async () => {
    const { dnd2024Backgrounds } = await import('./backgrounds')
    const { getFeatsByCategory } = await import('./feats')
    const origins = getFeatsByCategory('origin').map(f => f.name)
    for (const b of dnd2024Backgrounds) {
      // "Magic Initiate (Cleric)" rimanda al talento "Magic Initiate"
      const base = b.originFeat!.replace(/\s*\(.*\)$/, '')
      expect(origins, `${b.name}: ${b.originFeat}`).toContain(base)
    }
  })
})

describe('padronanza d\'armi 2024', () => {
  it('ha le 8 proprietà dell\'SRD, con nome italiano', async () => {
    const { masteryProperties } = await import('./mastery')
    expect(masteryProperties).toHaveLength(8)
    expect(masteryProperties.map(p => p.id).sort())
      .toEqual(['cleave', 'graze', 'nick', 'push', 'sap', 'slow', 'topple', 'vex'])
    for (const p of masteryProperties) {
      expect(p.nameIt, p.name).toBeTruthy()
      expect(p.description.length, p.name).toBeGreaterThan(60)
    }
  })

  it('assegna una padronanza a ogni arma che l\'app conosce', async () => {
    const { getWeaponMastery } = await import('./mastery')
    const { simpleWeapons, martialWeapons } = await import('../dnd5e/equipment')
    const senza: string[] = []
    for (const w of [...simpleWeapons, ...martialWeapons]) {
      if (!getWeaponMastery(w.name)) senza.push(w.name)
    }
    // La rete è l'unica senza: nel manuale ha solo la proprietà Speciale.
    expect(senza).toEqual(['Net'])
  })

  it('usa le proprietà giuste per un campione noto', async () => {
    const { getWeaponMastery } = await import('./mastery')
    expect(getWeaponMastery('Greataxe')?.id).toBe('cleave')
    expect(getWeaponMastery('Greatsword')?.id).toBe('graze')
    expect(getWeaponMastery('Dagger')?.id).toBe('nick')
    expect(getWeaponMastery('Quarterstaff')?.id).toBe('topple')
    expect(getWeaponMastery('Rapier')?.id).toBe('vex')
    expect(getWeaponMastery('Longsword')?.id).toBe('sap')
  })
})
