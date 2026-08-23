import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { getDnd5eFieldMapping, getBrancaloniaFieldMapping } from './pdfFieldMapping'
import { computeArmorClass } from './calculations'
import { generateRandomCharacter } from './randomCharacter'
import { useCharacterStore } from '@/stores/character'
import { preloadVariantData, getClasses, getSpells, getSpellSlots } from '@/data'
import { GAME_VARIANTS } from '@/stores/app'
import { translateGameTerm } from '@/i18n/gameTerms'
import type { CharacterData } from '@/stores/character'

/** Id di incantesimo o equipaggiamento lasciato grezzo, es. '1-jump' */
const RAW_ID = /^\d+-[a-z-]+$/
/** Codice di allineamento a due lettere, es. 'cn' */
const ALIGNMENT_CODE = /^(lg|ng|cg|ln|tn|cn|le|ne|ce)$/

function mappingFor(char: CharacterData, locale = 'it') {
  return char.variant === 'brancalonia'
    ? getBrancaloniaFieldMapping(char)
    : getDnd5eFieldMapping(char, locale)
}

/**
 * La razza non finiva sulla scheda brancaloniana: la casella esiste, ma nel
 * modello si chiama 'Nome 1' -- un nome sbagliato rimasto nel PDF originale --
 * e nessuno ci scriveva. Sulla scheda è quella a destra di Background, sotto
 * l'etichetta stampata "Razza".
 */
describe('scheda di Brancalonia: dati che si perdevano', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    await preloadVariantData('brancalonia')
  })

  it('scrive sempre la razza, per qualunque personaggio', () => {
    for (let i = 0; i < 30; i++) {
      const c = generateRandomCharacter('brancalonia', 1 + (i % 6))
      const m = getBrancaloniaFieldMapping(c)
      expect(m['Nome 1'], `${c.race} lv${c.level}: razza assente dalla scheda`).toBeTruthy()
      expect(String(m['Nome 1'])).not.toMatch(RAW_ID)
    }
  })

  it('mette la sottorazza fra parentesi accanto alla razza', () => {
    const c = generateRandomCharacter('brancalonia', 3)
    c.race = 'marionette'
    c.subrace = 'pupo'
    const m = getBrancaloniaFieldMapping(c)
    expect(m['Nome 1']).toBe('Marionetta (Pupo)')
  })

  /**
   * Le quattro caselle del borsello sono, da sinistra, MR MA MF MO. Il manuale
   * di Ambientazione le scioglie in spicci di rame, denaro d'argento, soldo di
   * ferro e oro, e dice che "l'electrum non esiste, e al suo posto abbiamo il
   * soldo di ferro": quindi l'electrum va in MF, non in MA. Erano scambiati, e
   * l'argento del personaggio finiva nella casella del ferro.
   */
  it('mette ogni moneta nella propria casella', () => {
    const c = generateRandomCharacter('brancalonia', 3)
    c.coins = { cp: 11, sp: 22, ep: 33, gp: 44, pp: 55 }
    const m = getBrancaloniaFieldMapping(c)
    expect(m['MR'], 'rame').toBe('11')
    expect(m['MA'], 'argento').toBe('22')
    expect(m['MF '], 'ferro, al posto dell’electrum').toBe('33')
    expect(m['MO'], 'oro').toBe('44')
  })
})

describe('mappa dei campi della scheda PDF', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of GAME_VARIANTS) await preloadVariantData(v)
  })

  /**
   * Impedisce il ritorno del difetto per cui la CA del PDF era calcolata a
   * parte come 10 + mod DES, mentre riepilogo e vista blog ne usavano un'altra:
   * su 300 generazioni in dnd5e le tre cifre divergevano 207 volte.
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: la CA del PDF coincide con quella del riepilogo`, () => {
      const store = useCharacterStore()
      for (let i = 0; i < 300; i++) {
        const c = generateRandomCharacter(variant)
        store.character = c
        const expected = computeArmorClass(c)
        const fields = mappingFor(c)
        const pdfAc = variant === 'brancalonia' ? fields['CA '] : fields['AC']
        expect(String(pdfAc), `${variant} #${i} (${c.armor || 'senza armatura'})`).toBe(String(expected))
        expect(store.armorClass, `${variant} #${i} riepilogo`).toBe(expected)
      }
    })
  }

  /**
   * Impedisce il ritorno del difetto per cui la scheda stampava gli id grezzi
   * degli incantesimi ('1-jump, 1-alarm') e il codice a due lettere
   * dell'allineamento ('cn') invece dei nomi leggibili.
   */
  for (const variant of GAME_VARIANTS) {
    it(`${variant}: nessun id grezzo né codice di allineamento nei campi`, () => {
      // Serve un incantatore: si estrae finché non ne esce uno con incantesimi
      let caster: CharacterData | null = null
      for (let i = 0; i < 300 && !caster; i++) {
        const c = generateRandomCharacter(variant)
        if (c.spellcastingAbility && (c.spellsKnown.length || c.cantrips.length)) caster = c
      }
      expect(caster, `${variant}: nessun incantatore estratto`).not.toBeNull()
      caster!.alignment = 'cn'

      const fields = mappingFor(caster!)
      for (const [field, value] of Object.entries(fields)) {
        if (typeof value !== 'string' || !value) continue
        for (const piece of value.split(/,\s*|\n/)) {
          expect(RAW_ID.test(piece), `${variant}/${field}: id grezzo "${piece}"`).toBe(false)
          expect(ALIGNMENT_CODE.test(piece), `${variant}/${field}: codice allineamento "${piece}"`).toBe(false)
        }
      }
    })
  }

  it('la scheda di Brancalonia riporta incantesimi e allineamento in italiano', () => {
    const c = generateRandomCharacter('brancalonia')
    c.spellcastingAbility = 'wis'
    c.spellcastingClass = 'ranger'
    c.alignment = 'lg'
    c.cantrips = []
    c.spellsKnown = ['1-jump', '1-alarm', '2-protection-from-poison', '2-find-traps']

    const fields = getBrancaloniaFieldMapping(c)
    expect(fields['Incantesimi livello 1 ']).toBe('Salto, Allarme')
    expect(fields['Incantesimi livello 2']).toBe('Protezione dal Veleno, Individuazione di Trappole')
    expect(fields['Allineamento']).toBe('Legale Buono')
  })

  it('la scheda di D&D 5e in inglese scrive allineamento e competenze per esteso', () => {
    const c = generateRandomCharacter('dnd5e')
    c.alignment = 'cn'
    c.proficienciesOther = ['light', 'medium', 'heavy', 'shields', 'simple', 'martial']

    const fields = getDnd5eFieldMapping(c, 'en')
    expect(fields['Alignment']).toBe('Chaotic Neutral')
    expect(String(fields['ProficienciesLang']).split('\n')[0]).toBe(
      'Light Armor, Medium Armor, Heavy Armor, Shields, Simple Weapons, Martial Weapons',
    )
  })

  /**
   * Impedisce il ritorno del difetto per cui il PDF costruiva la chiave di
   * traduzione capitalizzando l'id: 'risen-purgatory' diventava
   * 'Risen-Purgatory' e 'Risen Purgatory', due chiavi che nelle tabelle non
   * esistono, e la scheda stampava lo slug.
   */
  it('Apocalisse: razza e background sono in italiano nel PDF', () => {
    const c = generateRandomCharacter('apocalisse')
    c.race = 'risen-purgatory'
    c.subrace = ''
    c.background = 'risen-purgatory'

    const fields = getDnd5eFieldMapping(c, 'it')
    expect(fields['Race ']).toBe('Risorto dal Purgatorio')
    expect(fields['Background']).toBe('Risorto dal Purgatorio')
  })

  it('Brancalonia: i background dei manuali hanno il nome italiano nel PDF', () => {
    const c = generateRandomCharacter('brancalonia')
    c.background = 'powder-dabbler'
    expect(getBrancaloniaFieldMapping(c)['Background']).toBe('Polverista')
    c.background = 'relic-hunter'
    expect(getBrancaloniaFieldMapping(c)['Background']).toBe('Cacciatore di Reliquie')
  })

  /**
   * Impedisce il ritorno del difetto per cui la taglia finiva nel PDF italiano
   * così come sta nei dati razza ('Medium'), a fianco di un valore di ripiego
   * italiano ('Media') che non le somigliava nemmeno.
   */
  it('Brancalonia: la taglia è tradotta', () => {
    const c = generateRandomCharacter('brancalonia')
    c.size = 'Small'
    expect(getBrancaloniaFieldMapping(c)['Taglia']).toBe('Piccola')
    c.size = 'Medium'
    expect(getBrancaloniaFieldMapping(c)['Taglia']).toBe('Media')
  })

  /**
   * Impedisce il ritorno del difetto per cui la terza pagina della scheda D&D
   * restava vuota: la funzione riempiva solo l'intestazione da incantatore, e
   * nessuno dei 101 riquadri 'Spells 10*' del modello.
   */
  for (const variant of ['dnd5e', 'dnd2024', 'apocalisse'] as const) {
    it(`${variant}: la pagina degli incantesimi non resta vuota`, () => {
      let caster: CharacterData | null = null
      for (let i = 0; i < 300 && !caster; i++) {
        const c = generateRandomCharacter(variant)
        if (c.spellcastingAbility && c.cantrips.length && c.spellsKnown.length) caster = c
      }
      expect(caster, `${variant}: nessun incantatore estratto`).not.toBeNull()

      // Riquadri disponibili per livello sul modello, trucchetti compresi
      const boxes: Record<number, number> = { 0: 8, 1: 13, 2: 13, 3: 13, 4: 13, 5: 9, 6: 9, 7: 9, 8: 7, 9: 7 }
      // Il livello si legge dai dati, non dal prefisso dell'id: contarlo col
      // prefisso è proprio l'errore che la scheda faceva, e l'atteso non
      // vedrebbe gli incantesimi con id senza numero davanti
      const spells = getSpells(caster!.variant)
      let expected = Math.min(caster!.cantrips.length, boxes[0]!)
      for (let lv = 1; lv <= 9; lv++) {
        const atLevel = caster!.spellsKnown.filter(id => spells.find(sp => sp.id === id)?.level === lv).length
        expected += Math.min(atLevel, boxes[lv]!)
      }

      const fields = getDnd5eFieldMapping(caster!, 'it')
      const written = Object.entries(fields)
        .filter(([k, v]) => k.startsWith('Spells 10') && typeof v === 'string' && v !== '')
      expect(written.length, `${variant}: nessun campo 'Spells 10*' scritto`).toBe(expected)
      expect(written.length, `${variant}`).toBeGreaterThan(0)
    })
  }

  /**
   * I riquadri sono raggruppati per livello e i nomi del modello non seguono
   * l'ordine di stampa: 'Spells 1015' e 'Spells 101014' aprono il blocco di 1°
   * livello pur venendo in coda alla lista che pdf-lib restituisce.
   */
  it('gli incantesimi finiscono nel blocco del proprio livello', () => {
    const c = generateRandomCharacter('dnd5e')
    c.spellcastingAbility = 'int'
    c.spellcastingClass = 'wizard'
    c.cantrips = ['fire-bolt']
    c.spellsKnown = ['1-jump', '2-web', '3-fireball']

    const fields = getDnd5eFieldMapping(c, 'it')
    // Trucchetti: primo riquadro del blocco 0
    expect(fields['Spells 1014']).toBe('Dardo di Fuoco')
    // 1° livello: i due riquadri fuori sequenza aprono il blocco
    expect(fields['Spells 101014']).toBe('Salto')
    // 2° e 3° livello hanno il proprio blocco, ciascuno col primo riquadro
    expect(fields['Spells 1046']).toBe('Ragnatela')
    expect(fields['Spells 1048']).toBe('Palla di Fuoco')
  })

  /**
   * Impedisce il ritorno del difetto per cui il livello di un incantesimo era
   * letto dal prefisso dell'id: i 13 incantesimi esclusivi di Brancalonia hanno
   * id senza numero davanti ('chex', 'cleanse') e sparivano dalla scheda senza
   * che nulla lo segnalasse.
   */
  it('Brancalonia: gli incantesimi senza prefisso non spariscono dalla scheda', () => {
    const c = generateRandomCharacter('brancalonia')
    c.spellcastingAbility = 'int'
    c.spellcastingClass = 'wizard'
    c.cantrips = []
    c.spellsKnown = ['illusory-tribute', 'chex', 'cleanse', '1-shield']

    const fields = getBrancaloniaFieldMapping(c)
    expect(fields['Incantesimi livello 1 ']).toContain('Tributo Illusorio')
    expect(fields['Incantesimi livello 1 ']).toContain('Scudo')
    expect(fields['Incantesimi livello 2']).toContain('Chex')
    expect(fields['Incantesimi livello 3']).toContain('Bonificare')
  })

  /**
   * Come sopra, ma su tutti gli incantatori che il generatore produce: nessun
   * incantesimo noto deve restare fuori dai tre campi della scheda.
   */
  it('Brancalonia: ogni incantesimo noto compare nel campo del proprio livello', () => {
    const store = useCharacterStore()
    const spells = getSpells('brancalonia')
    let casters = 0
    for (let i = 0; i < 300; i++) {
      const c = generateRandomCharacter('brancalonia')
      if (!c.spellcastingAbility || !c.spellsKnown.length) continue
      casters++
      store.character = c
      const fields = getBrancaloniaFieldMapping(c)
      const boxes: Record<number, string> = {
        1: String(fields['Incantesimi livello 1 ']),
        2: String(fields['Incantesimi livello 2']),
        3: String(fields['Incantesimi livello 3']),
      }
      for (const id of c.spellsKnown) {
        const spell = spells.find(sp => sp.id === id)
        if (!spell || spell.level < 1 || spell.level > 3) continue
        const name = translateGameTerm(spell.name, 'it', 'spell')
        expect(boxes[spell.level], `#${i} ${id} (livello ${spell.level})`).toContain(name)
      }
    }
    expect(casters, 'nessun incantatore estratto').toBeGreaterThan(0)
  })

  /**
   * Impedisce il ritorno del difetto per cui la casella degli slot restava
   * bianca su ogni scheda: nessuno dei 18 campi 'Slots*' del modello veniva
   * scritto, nemmeno per un incantatore pieno.
   */
  it('gli slot incantesimo finiscono nei riquadri del proprio livello', () => {
    const c = generateRandomCharacter('dnd5e')
    c.classes = []
    c.className = 'wizard'
    c.level = 5
    c.spellcastingAbility = 'int'
    c.spellcastingClass = 'wizard'

    const fields = getDnd5eFieldMapping(c, 'it')
    // Un mago di 5° ha 4 slot di 1°, 3 di 2° e 2 di 3°, e nient'altro
    expect(fields['SlotsTotal 19']).toBe('4')
    expect(fields['SlotsTotal 20']).toBe('3')
    expect(fields['SlotsTotal 21']).toBe('2')
    for (let lv = 4; lv <= 9; lv++) {
      expect(fields[`SlotsTotal ${18 + lv}`], `livello ${lv}`).toBe('')
    }
    // La scheda si esporta a riposo compiuto: gli slot residui sono tutti
    for (let lv = 1; lv <= 9; lv++) {
      expect(fields[`SlotsRemaining ${18 + lv}`], `livello ${lv}`).toBe(fields[`SlotsTotal ${18 + lv}`])
    }

    // E i nove riquadri coincidono con la tabella dei dati, non con una copia
    const slots = getSpellSlots('wizard', 5)
    for (let lv = 1; lv <= 9; lv++) {
      const expected = slots[lv] ? String(slots[lv]) : ''
      expect(fields[`SlotsTotal ${18 + lv}`], `livello ${lv}`).toBe(expected)
    }
  })

  /**
   * Impedisce il ritorno del difetto per cui i due riquadri della stessa
   * casella DADI VITA si contraddicevano sul multiclasse: 'HDTotal' elencava
   * '5d10 + 1d6' mentre 'HD' stampava '6d10', cioè un dado che il personaggio
   * non ha in nessuna delle due classi.
   */
  it('i dadi vita del multiclasse dicono la stessa cosa nei due riquadri', () => {
    const c = generateRandomCharacter('dnd5e')
    c.className = 'fighter'
    c.hitDie = 10
    c.level = 6
    c.classes = [
      { classId: 'fighter', level: 5, hitDie: 10, subclass: '' },
      { classId: 'wizard', level: 1, hitDie: 6, subclass: '' },
    ]

    const fields = getDnd5eFieldMapping(c, 'it')
    expect(fields['HDTotal']).toBe('5d10 + 1d6')
    expect(fields['HD']).toBe('5d10 + 1d6')

    // A classe singola nulla cambia
    const single = generateRandomCharacter('dnd5e')
    single.classes = []
    single.level = 4
    single.hitDie = 8
    const singleFields = getDnd5eFieldMapping(single, 'it')
    expect(singleFields['HDTotal']).toBe('4d8')
    expect(singleFields['HD']).toBe('4d8')
  })

  /**
   * Impedisce il ritorno del difetto per cui il nome della classe restava in
   * inglese ('Druid 6') accanto a background e allineamento già tradotti,
   * perché pdfClassName non guardava la lingua della scheda.
   */
  it('D&D 5e e 2024: la classe segue la lingua della scheda', () => {
    for (const variant of ['dnd5e', 'dnd2024'] as const) {
      const c = generateRandomCharacter(variant)
      c.className = 'druid'
      c.classes = []
      c.level = 6
      c.spellcastingAbility = 'wis'
      c.spellcastingClass = 'druid'

      expect(getDnd5eFieldMapping(c, 'it')['ClassLevel'], variant).toBe('Druido 6')
      expect(getDnd5eFieldMapping(c, 'it')['Spellcasting Class 2'], variant).toBe('Druido')
      expect(getDnd5eFieldMapping(c, 'en')['ClassLevel'], variant).toBe('Druid 6')
    }
  })

  /**
   * Impedisce il ritorno del difetto per cui l'ultima riga di 'Features and
   * Traits' riportava l'id grezzo del background ('Background: acolyte'),
   * mentre il campo dedicato della stessa scheda lo traduceva.
   */
  it('D&D 2024: la riga del background è tradotta come il campo dedicato', () => {
    const c = generateRandomCharacter('dnd2024')
    c.background = 'acolyte'
    const fields = getDnd5eFieldMapping(c, 'it')
    const lines = String(fields['Features and Traits']).split('\n')
    expect(lines).toContain(`Background: ${fields['Background']}`)
    expect(lines).toContain('Background: Accolito')
  })

  /**
   * Impedisce il ritorno del difetto per cui le competenze del 2024 finivano
   * sulla scheda italiana in inglese, e per giunta come frasi estratte male dal
   * manuale ("Simple weapons Tool Proficiencies Herbalism Kit").
   */
  it('D&D 2024: le competenze sono in italiano, una voce per riga', () => {
    const c = generateRandomCharacter('dnd2024')
    const cls = getClasses('dnd2024').find(k => k.id === 'barbarian')!
    c.className = cls.id
    c.proficienciesOther = [...cls.armorProficiencies, ...cls.weaponProficiencies, ...cls.toolProficiencies]

    const line = String(getDnd5eFieldMapping(c, 'it')['ProficienciesLang']).split('\n')[0]
    expect(line).toBe('Armature Leggere, Armature Medie, Scudi, Armi Semplici, Armi da Guerra')

    // E nessuna classe del 2024 porta più frasi intere del manuale
    for (const k of getClasses('dnd2024')) {
      for (const p of [...k.armorProficiencies, ...k.weaponProficiencies, ...k.toolProficiencies]) {
        expect(p, `${k.id}: "${p}"`).not.toMatch(/Tool Proficiencies/)
        expect(translateGameTerm(p, 'it', 'proficiency'), `${k.id}: "${p}"`).not.toBe(p)
      }
    }
  })

})

/**
 * Gli slot sulla scheda esportata nascevano dalla tabella del 2014 anche per
 * un personaggio 2024: `pdfSpellSlots` chiamava `getSpellSlots` senza passare
 * la variante. Un paladino 2024 di 1º livello usciva quindi con i riquadri
 * vuoti, e il multiclasse contava i suoi livelli per difetto invece che per
 * eccesso.
 */
describe('scheda 2024: gli slot vengono dalle regole del 2024', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    await Promise.all([preloadVariantData('dnd2024'), preloadVariantData('dnd5e')])
  })

  /** Casella 'SlotsTotal N' del livello di incantesimo dato. */
  const slotBox = (lv: number) => `SlotsTotal ${18 + lv}`

  function paladin(variant: 'dnd5e' | 'dnd2024', level: number): CharacterData {
    const c = generateRandomCharacter(variant, level)
    c.className = 'paladin'
    c.level = level
    c.spellcastingAbility = 'cha'
    c.spellcastingClass = 'paladin'
    c.classes = []
    return c
  }

  it('il paladino 2024 di 1º livello ha due slot sulla scheda, quello 2014 nessuno', () => {
    expect(getDnd5eFieldMapping(paladin('dnd2024', 1), 'it')[slotBox(1)]).toBe('2')
    expect(getDnd5eFieldMapping(paladin('dnd5e', 1), 'it')[slotBox(1)]).toBe('')
  })

  it('a ogni livello i riquadri seguono la tabella della propria edizione', () => {
    for (const variant of ['dnd5e', 'dnd2024'] as const) {
      for (let level = 1; level <= 20; level++) {
        const fields = getDnd5eFieldMapping(paladin(variant, level), 'it')
        const slots = getSpellSlots('paladin', level, variant)
        for (let lv = 1; lv <= 9; lv++) {
          const expected = slots[lv] ? String(slots[lv]) : ''
          expect(fields[slotBox(lv)], `${variant} paladino ${level}, slot di ${lv}º`).toBe(expected)
        }
      }
    }
  })

  it('il multiclasse 2024 conta i livelli da paladino per eccesso', () => {
    // Paladino 1/mago 1: nel 2024 è un incantatore di 2º livello (tre slot di
    // 1º), nel 2014 di 1º (due slot).
    const build = (variant: 'dnd5e' | 'dnd2024') => {
      const c = generateRandomCharacter(variant, 2)
      c.className = 'paladin'
      c.level = 2
      c.spellcastingAbility = 'cha'
      c.spellcastingClass = 'paladin'
      c.classes = [
        { classId: 'paladin', level: 1, subclass: '', hitDie: 10 },
        { classId: 'wizard', level: 1, subclass: '', hitDie: 6 },
      ]
      return getDnd5eFieldMapping(c, 'it')
    }
    expect(build('dnd2024')[slotBox(1)]).toBe('3')
    expect(build('dnd5e')[slotBox(1)]).toBe('2')
  })
})
