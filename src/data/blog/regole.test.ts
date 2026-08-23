import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { blogCharacters } from './characters'
import { preloadVariantData, getClasses, getRaces, getBackgrounds, getSpells } from '@/data'
import { modifier, proficiencyBonus, hpPerLevel } from '@/utils/calculations'
import { castsSpells } from '@/data/spellcasting'
import { GAME_VARIANTS } from '@/stores/app'

/**
 * I personaggi pronti sono scritti a mano, e a mano si sbaglia: c'erano
 * bardi di 5° livello con i trucchetti di un 3°, un barbaro che non aveva
 * mai applicato Movimento Veloce, un chierico di 4° con un incantesimo di
 * 3° livello e due bastoni ferrati con +0 al posto di +1.
 *
 * I test accanto controllano che i riferimenti esistano; questi controllano
 * che i conti tornino. Sono le stesse regole che il generatore casuale
 * applica da sé, applicate a chi è stato scritto a mano.
 */
const MOVIMENTO_MONACO = (lv: number) =>
  lv >= 18 ? 30 : lv >= 14 ? 25 : lv >= 10 ? 20 : lv >= 6 ? 15 : lv >= 2 ? 10 : 0
/** Il Movimento Veloce del barbaro non vale in armatura pesante. */
const ARMATURE_PESANTI = ['Chain Mail', 'Splint', 'Plate', 'Ring Mail']

beforeAll(async () => {
  setActivePinia(createPinia())
  for (const v of GAME_VARIANTS) await preloadVariantData(v)
})

describe.each(blogCharacters.map(b => [`${b.slug} [${b.variant}]`, b] as const))('%s', (_et, bc) => {
  const c = bc.characterData
  const cls = () => getClasses(c.variant).find(x => x.id === c.className)!
  const race = () => getRaces(c.variant).find(r => r.id === c.race)!
  const sottorazza = () => race().subraces.find(x => x.id === c.subrace)
  const tratti = () => [...race().traits, ...(sottorazza()?.traits ?? [])]
  const mod = (k: keyof typeof c.abilityScores) =>
    modifier(c.abilityScores[k] + (c.racialBonuses[k] || 0))

  it('ha i punti ferita che la sua classe, il livello e la Costituzione danno', () => {
    const con = mod('con')
    const die = cls().hitDie
    let atteso = (die + con) + (c.level - 1) * hpPerLevel(die, con)
    // Tempra Nanica: un punto ferita in più per livello.
    if (tratti().includes('dwarven-toughness')) atteso += c.level
    expect(c.maxHp).toBe(atteso)
    expect(c.currentHp).toBe(c.maxHp)
  })

  it('ha la velocità della sua specie, più quella che classe e discendenza aggiungono', () => {
    const t = tratti()
    let atteso = race().speed
    if (t.includes('fleet-of-foot') || t.includes('elf-wood-elf')) atteso += 5
    if (c.className === 'monk' && !c.armor && !c.shield) atteso += MOVIMENTO_MONACO(c.level)
    if (c.className === 'barbarian' && c.level >= 5 && !ARMATURE_PESANTI.includes(c.armor)) atteso += 10
    expect(c.speed).toBe(atteso)
  })

  it('usa il dado vita e i tiri salvezza della sua classe', () => {
    expect(c.hitDie).toBe(cls().hitDie)
    expect([...c.savingThrowProficiencies].sort()).toEqual([...cls().savingThrows].sort())
  })

  it('ha un background che esiste nella sua variante', () => {
    if (c.background) {
      expect(getBackgrounds(c.variant).some(b => b.id === c.background)).toBe(true)
    }
  })

  it('conosce solo incantesimi che esistono, di un livello che può lanciare', () => {
    const inc = getSpells(c.variant)
    const perId = new Map(inc.map(x => [x.id, x]))
    const perNome = new Map(inc.map(x => [x.name.toLowerCase(), x]))
    const risolvi = (n: string) => perId.get(n) ?? perNome.get(n.toLowerCase())
    const tipo = cls().spellcasting?.casterType
    const max = tipo === 'third' ? Math.min(4, Math.ceil(c.level / 6))
      : tipo === 'half' ? Math.min(5, Math.ceil((c.level + 1) / 4))
        : Math.min(9, Math.ceil(c.level / 2))
    for (const n of [...c.spellsKnown, ...c.spellsPrepared]) {
      const sp = risolvi(n)
      expect(sp, `${n} non esiste fra gli incantesimi di ${c.variant}`).toBeDefined()
      expect(sp!.level, `${n} è di livello ${sp!.level}`).toBeLessThanOrEqual(max)
      expect(sp!.level, `${n} è un trucchetto`).toBeGreaterThan(0)
    }
    for (const n of c.cantrips) {
      const sp = risolvi(n)
      expect(sp, `${n} non esiste`).toBeDefined()
      expect(sp!.level, `${n} non è un trucchetto`).toBe(0)
    }
  })

  it('sta nella lista della propria classe, salvo quel che specie o patrono aggiungono', () => {
    const tipo = cls().spellcasting?.casterType
    if (!castsSpells(tipo, c.subclass)) return
    const inc = getSpells(c.variant)
    const perNome = new Map(inc.map(x => [x.name.toLowerCase(), x]))
    const perId = new Map(inc.map(x => [x.id, x]))
    // Alcune sottoclassi ampliano la lista: i loro incantesimi stanno nel
    // testo del privilegio, come li stampa il manuale.
    const ampliati = (cls().subclasses.find(s => s.id === c.subclass)?.features ?? [])
      .filter(f => /Expanded Spell List/i.test(f.name))
      .map(f => f.description.toLowerCase()).join(' ')
    for (const n of [...c.cantrips, ...c.spellsKnown, ...c.spellsPrepared]) {
      const sp = perId.get(n) ?? perNome.get(n.toLowerCase())
      if (!sp) continue
      const daClasse = sp.classes.includes(cls().id)
      // L'alto elfo prende un trucchetto dalla lista del mago.
      const daSpecie = tratti().includes('cantrip') && sp.level === 0 && sp.classes.includes('wizard')
      const daPatrono = ampliati.includes(sp.name.toLowerCase())
      expect(daClasse || daSpecie || daPatrono, `${sp.name} non è di ${cls().id}`).toBe(true)
    }
  })

  it('conosce quanti trucchetti e incantesimi la sua classe concede', () => {
    const sc = cls().spellcasting
    const tipo = sc?.casterType
    if (!castsSpells(tipo, c.subclass)) {
      expect(c.cantrips.length + c.spellsKnown.length + c.spellsPrepared.length).toBe(0)
      return
    }
    const extra = tratti().includes('cantrip') ? 1 : 0
    expect(c.cantrips.length).toBe((sc!.cantripsKnown[c.level - 1] ?? 0) + extra)
    const noti = sc!.spellsKnown?.[c.level - 1]
    if (noti != null) expect(c.spellsKnown.length).toBe(noti)
  })

  it('ha bonus di attacco spiegabili con una caratteristica e la competenza', () => {
    const pb = proficiencyBonus(c.level)
    const mods = (['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(mod)
    for (const w of c.weapons) {
      // Il +2 in più è lo stile di combattimento Tiro (Archery).
      const ok = mods.some(m => w.attackBonus === m + pb || w.attackBonus === m + pb + 2)
      expect(ok, `${w.name}: ${w.attackBonus} con competenza ${pb} e modificatori ${mods.join('/')}`).toBe(true)
    }
  })
})
