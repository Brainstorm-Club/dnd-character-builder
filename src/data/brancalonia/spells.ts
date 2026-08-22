import type { Spell } from '../dnd5e/spells'

/**
 * Spells that exist only in Brancalonia, transcribed from the Macaronicon and
 * L'Impero Randella Ancora. The Setting Book adds none: its Invocations of
 * Saints are the ordinary cleric spells under devotional names.
 *
 * Several subclasses reference these by name — the Exorcist's domain list, the
 * Rat Catcher's ranger spells, the Talismancer's expanded list — so they have
 * to be selectable, not just mentioned.
 */
export const brancaloniaSpells: readonly Spell[] = [
  // ═══ Macaronicon ═══════════════════════════════════════════════════
  {
    id: 'dreadful-tale',
    name: 'Dreadful Tale',
    level: 1,
    school: 'Transmutation',
    castingTime: '1 bonus action',
    range: '90 feet',
    components: 'V',
    duration: 'Concentration, up to 1 minute',
    description:
      "You tell a disturbing tale that only one creature of your choice within range can hear, shocking it with psychic energy. The target must make a Wisdom saving throw or become frightened for the duration. At the end of each of its turns it repeats the save or takes 1d8 psychic damage; on a success the spell ends. At Higher Levels: the damage increases by 1d8 for each slot level above 1st.",
    classes: ['bard'],
  },
  {
    id: 'incandescent-mark',
    name: 'Incandescent Mark',
    level: 1,
    school: 'Transmutation',
    castingTime: '1 bonus action',
    range: '90 feet',
    components: 'V',
    duration: 'Concentration, up to 1 hour',
    description:
      'You mark a creature you can see within range with a glowing sign. Until the spell ends you deal an extra 1d6 fire damage whenever you hit it with a weapon attack, and the target sheds bright light in a 20-foot radius and dim light for another 20 feet. At Higher Levels: the damage increases by 1d6 for each slot level above 1st.',
    classes: ['ranger'],
  },
  {
    id: 'quality-stamp',
    name: 'Quality Stamp',
    level: 1,
    school: 'Transmutation',
    castingTime: '1 bonus action',
    range: 'Touch',
    components: 'V, S',
    duration: '1 hour',
    description:
      'You touch a shoddy object or creature and, until the spell ends, the target loses the shoddy quality. At Higher Levels: cast with a 3rd-level slot, the duration increases to 8 hours.',
    classes: ['wizard'],
  },
  {
    id: 'exorcism',
    name: 'Exorcism',
    level: 2,
    school: 'Abjuration',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S, M (incense and a page of prayers, which the spell consumes)',
    duration: 'Concentration, up to 1 minute',
    description:
      "You pray to the Ternal Father, to the Cinquain or to the whole Bingo, and choose a fey, fiend or undead within range. On a failed Wisdom saving throw it is incapacitated for the duration and must spend its turns moving as far from you as it can, and cannot willingly come within 30 feet of you; it repeats the save at the end of each of its turns. While the spell lasts you can use Break Enchantment: as an action, touch a creature within reach that is charmed, frightened or possessed by a celestial, elemental, fey, fiend or undead, and it is no longer so. At Higher Levels: one additional target for each slot level above 2nd.",
    classes: ['cleric', 'druid'],
  },
  {
    id: 'angelic-emanation',
    name: 'Angelic Emanation',
    level: 3,
    school: 'Abjuration',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V',
    duration: 'Concentration, up to 10 minutes',
    description:
      'A willing creature you touch is pervaded by angelic energy and wings of light spread from its back. Until the spell ends it gains a flying speed of 30 feet, cannot become diseased, has resistance to poison damage, and has advantage on saving throws against effects that would blind, charm, deafen, frighten, paralyze, poison or stun it.',
    classes: ['cleric'],
  },
  {
    id: 'cleanse',
    name: 'Cleanse',
    level: 3,
    school: 'Evocation',
    castingTime: '12 hours',
    range: 'Touch',
    components: 'V, S, M (herbs, oils and incense worth at least 50 gp, which the spell consumes)',
    duration: 'Until dispelled',
    description:
      'You infuse an area of up to a 60-foot radius with holy or unholy power; the spell fails if the radius overlaps another cleanse. Fey, fiends and undead cannot enter the area, nor charm, frighten or possess creatures inside it, and any creature so afflicted is freed on entering. You can exclude one or more of those creature types from the effect.',
    classes: ['cleric', 'druid'],
  },
  {
    id: 'insurance',
    name: 'Insurance',
    level: 3,
    school: 'Evocation',
    castingTime: '10 minutes',
    range: 'Self',
    components: 'V, S, M (a sheet naming the insured spell and its trigger, sealed in wax and gold dust worth 15 gp)',
    duration: '10 days',
    description:
      'Choose a spell of 2nd level or lower that you can cast, with a casting time of 1 action, that can target you. You cast it as part of casting insurance, expending both slots, but it does not take effect until the triggering circumstance you described occurs — then it takes effect on you alone, whether you want it to or not, and insurance ends. Only one insurance can be active on you, and it ends if its material component ever leaves your person.',
    classes: ['wizard'],
  },
  {
    id: 'poormans-feast',
    name: "Poorman's Feast",
    level: 3,
    school: 'Conjuration',
    castingTime: '10 minutes',
    range: '30 feet',
    components: 'V, S, M (onion, celery, carrot and herbs)',
    duration: 'Instantaneous',
    description:
      'You evoke a great banquet of pasta, pizza, wine and the other typical dishes of your home region. The feast takes 1 hour to consume and vanishes at the end of it, and its beneficial effects do not set in until that hour is over.',
    classes: ['cleric', 'druid'],
  },

  // ═══ L'Impero Randella Ancora ═════════════════════════════════════
  {
    id: 'finger-of-fate',
    name: 'Finger of Fate',
    level: 0,
    school: 'Divination',
    castingTime: '1 reaction, when you see a creature make a saving throw, an ability check or an attack',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description:
      'You point at a creature and whisper words of luck. On a failed Wisdom saving throw it has disadvantage on the roll it is making; if it succeeds, it has advantage on that roll instead.',
    classes: ['bard', 'cleric', 'sorcerer', 'warlock', 'wizard'],
  },
  {
    id: 'extravagant-skin',
    name: 'Extravagant Skin',
    level: 1,
    school: 'Transmutation',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S, M (a fistful of turquoise wood ash, which the spell consumes)',
    duration: 'Concentration, up to 1 hour',
    description:
      'You cover yourself in the essence of Extravaganza and become part of it. Choose one effect, changeable with an action while in your true form. Change Shape: polymorph into a cat, groundhog, fox, owl or similar animal, worn equipment transforming with you. Innate Spellcasting: cast dancing lights, hideous laughter, mage hand, minor illusion and misty step at will, without material components. Magic Resistance: advantage on saving throws against spells.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
  },
  {
    id: 'illusory-tribute',
    name: 'Illusory Tribute',
    level: 1,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Self',
    components: 'S, M (10 cp, which the spell consumes)',
    duration: '1 hour',
    description:
      'You alter ten copper pieces so that they appear to be gold, worth 10 gp for the duration, and you alter how they appear to detect magic and similar effects so they do not reveal their magical nature. They cannot be used as spell components.',
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
  },
  {
    id: 'chex',
    name: 'Chex',
    level: 2,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '90 feet',
    components: 'V, S, M (a piece of parchment)',
    duration: 'Concentration, up to 1 minute',
    description:
      'You summon a magic parchment listing exorbitant items and prices. Any creature that starts its turn holding it or comes within 5 feet is intrigued and reads it, taking 2d6 psychic damage and, on a failed Wisdom saving throw, dropping a carried item or a number of silver pieces equal to the damage. A creature with nothing to drop takes the damage again while it remains in the area. At Higher Levels: the damage increases by 1d6 for each slot level above 2nd.',
    classes: ['bard', 'cleric', 'sorcerer', 'wizard'],
  },
  {
    id: 'roast',
    name: 'Roast',
    level: 2,
    school: 'Transmutation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: '1 hour',
    description:
      'You touch an object and turn it into a shoddy version of itself for the duration. Against a creature you make a melee spell attack, and on a hit the items it wears or carries become shoddy for the duration. At Higher Levels: cast with a 3rd-level slot, the duration increases to 8 hours.',
    classes: ['bard', 'warlock'],
  },
  {
    id: 'misinformation',
    name: 'Misinformation',
    level: 3,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, M (one dry leaf and some honey)',
    duration: 'Concentration, up to 1 hour',
    description:
      'You toy with the information in the mind of a creature that can hear and understand you. On a failed Intelligence saving throw it loses the ability to distinguish truth from falsehood, and every statement you make sounds true to it until the spell ends. It repeats the save whenever it takes damage, and asking it to harm itself breaks the effect. When the spell ends the creature realizes it was influenced and turns hostile.',
    classes: ['bard', 'cleric', 'warlock', 'wizard'],
  },
]
