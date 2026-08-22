import type { CharacterClass } from '../dnd5e/classes'

/**
 * Burattinaio (Puppeteer) — the Brancalonia-exclusive class introduced in the
 * Macaronicon expansion, in the "Mangiafuoco Caravan" companion.
 *
 * The Puppeteer is NOT a spellcaster. Its whole kit is the Strings: a fey bond
 * to one animated triflewood puppet at a time, through which the puppeteer acts
 * at a distance. Intelligence drives the puppets' attack and save DCs.
 */
export const burattinaioBrancaloniaClass: CharacterClass = {
  id: 'burattinaio',
  name: 'Puppeteer',
  description:
    'The discovery of triflewood\'s astonishing faculties paved the way for the magical art of the Puppeteers: artisans and entertainers skilled at creating sentient marionettes, animated puppets and more common figurines, and at making them perform. Their existence smells of wood — moving from village to village in wagons overflowing with props and carpenter\'s tools, living amidst wood-shavings and spare parts, forever trying to make ends meet. But a Puppeteer with a capital P is no simple carpenter or barker: their creations are animated, prodigious, sometimes even sentient, and after generations devoted to the sublime art of entertainment these artisans and their creations are ready to carry out other kinds of Jobs.',
  hitDie: 8,
  primaryAbility: ['int'],
  savingThrows: ['dex', 'int'],
  armorProficiencies: ['light'],
  weaponProficiencies: ['simple'],
  toolProficiencies: ['mason\'s tools', 'tinker\'s tools', 'woodcarver\'s tools'],
  skillChoices: [
    'arcana', 'deception', 'history',
    'performance', 'persuasion', 'sleight-of-hand',
  ],
  numSkillChoices: 2,
  startingEquipment: [
    'light crossbow and 20 bolts (or any simple weapon)',
    'entertainer-pack (or explorer-pack)',
    'leather armor',
    'any simple weapon',
    'two daggers',
    'mason\'s tools',
    'woodcarver\'s tools',
  ],
  subclassLevel: 1,
  subclassName: 'Puppeteer\'s Tradition',
  // The Puppeteer has no spellcasting: every effect runs through the puppets.
  spellcasting: null,
  features: [
    {
      id: 'theatre-of-extravaganza',
      name: 'Theatre of Extravaganza',
      level: 1,
      description:
        'Your puppets are not sentient, but you share your energies with some of them through an inner fey bond called Strings. When you finish building an animated puppet, the Strings weave between you and your creation: they let you move the puppet and activate its unique abilities. You can be connected to only one puppet at a time and can move the Strings to another with a bonus action; the connection ends if you are incapacitated or die. While the puppet is in sight and within your Distance of Use you can use your action to have it take the Attack, Dash, Disengage, Dodge or Help action or make a skill check, use your bonus action to move it, and use its Secret Technique. Recoil: all damage, effects, spells and conditions inflicted on a puppet you are connected to are inflicted on you instead, and you make its saving throws. Your attack bonus with a puppet equals your Intelligence modifier + your proficiency bonus, and the DC to resist its effects is 8 + your Intelligence modifier + your proficiency bonus. Distance of Use starts at 50 feet and grows to 60, 80 and 100 feet as you gain levels.',
    },
    {
      id: 'puppets-created',
      name: 'Puppets Created',
      level: 1,
      description:
        'You own three puppets of your choice from the common puppets list — Romualdo, Doctor Mutandone, Guerlocco, Brighella, Pulcinello, the Archangel Giorel and Taratata are the classic models — and gain more at 3rd and 5th level, to a total of five. Each puppeteer builds their own puppets and can only bind their Strings to puppets they made themselves. A puppet you are connected to counts as a Tiny construct; unbound it is an object with 10 hit points and AC 8, and at 0 hit points it breaks. Repairing a broken puppet takes a long rest and 30 gp. Puppets cannot carry or equip items.',
    },
    {
      id: 'puppeteers-tradition',
      name: 'Puppeteer\'s Tradition',
      level: 1,
      description:
        'You choose a tradition — Geppetto or Mangiafuoco — named after the mythical founders of the two approaches to the art of animated puppets. Your choice grants you features at 1st and 6th level.',
    },
    {
      id: 'canons',
      name: 'Canons',
      level: 2,
      description:
        'Dedicating yourself to the art of puppets, you develop artistic canons of construction and staging that let your puppets perform true portents. You learn two canons at 2nd level and more as you advance, and each time you gain a level you can swap one canon you know for another you could learn. Available canons: Child\'s Play (5th level — the bound puppet can move along vertical surfaces and ceilings with its hands free and gains a climbing speed); Cold Audience and Inflame the Audience (the bound puppet deals an extra 1d6 cold or fire damage on a hit); Fierce Puppets (5th level — the puppet makes two attacks instead of one when you take the Attack action); Last Performance (you can use a bound puppet\'s Secret Technique, but the puppet breaks); Lightning Replacement (swap places with the bound puppet as a bonus action); Perception of Wood (requires Mise-en-scene — the puppet gains blindsight in a 20-foot radius); Protection from Energy (5th level, requires Construction Art — the puppet gains resistance to a chosen damage type); Quick Puppets (the puppet\'s speed increases by 10 feet); Ventriloquism (you can speak through the bound puppet).',
    },
    {
      id: 'artistic-vocation',
      name: 'Artistic Vocation',
      level: 3,
      description:
        'You choose the vocation that will characterize your Theatre of Extravaganza. Mise-en-scene: you double your Distance of Use, and as an action you can extend your perceptions through a bound puppet until the start of your next turn, during which you are blind and deaf to your own surroundings. Construction Art: all your creations are sturdier — an unbound puppet has 20 hit points and AC 10, and repairing a broken puppet costs you only a short rest and 15 gp.',
    },
    {
      // Macaronicon ITA 2.2, tabella «Burattinaio» a pag. 12: il 4° livello
      // dà l'Aumento dei Punteggi di Caratteristica, come le classi base
      id: 'asi-4',
      name: 'Ability Score Improvement',
      level: 4,
      description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.',
    },
    {
      id: 'masterpiece',
      name: 'Masterpiece',
      level: 5,
      description:
        'You create a new unique and special puppet, your masterpiece, chosen from the list of masterpieces.',
    },
  ],
  subclasses: [
    {
      id: 'mangiafuoco',
      name: 'Mangiafuoco',
      description:
        'Mangiafuocos usually come from the street, born among the many artists and entrepreneurs of the Kingdom\'s cities. They build their own puppets exactly as the Geppettos do, but they are far less emotionally tied to their creations, using them essentially as actors in their own company — and are ready to sacrifice them when they must.',
      features: [
        {
          id: 'the-show-must-go-on',
          name: 'The Show Must Go On',
          level: 1,
          description:
            'When a puppet is about to take damage, you can use your reaction to cut the Strings that bind you to it. The puppet loses all the benefits of the bond.',
        },
        {
          id: 'pyrotechnics-art',
          name: 'Pyrotechnics Art',
          level: 6,
          description:
            'When you use The Show Must Go On you can destroy the puppet instead, releasing the triflewood\'s extravaganza in a great firework display. Each creature within 10 feet of the puppet must make a Constitution saving throw, taking 3d8 thunder damage and being blinded on a failure, or half as much damage and no condition on a success.',
        },
      ],
    },
    {
      id: 'geppetto',
      name: 'Geppetto',
      description:
        'Unlike the Mangiafuocos, who resemble unscrupulous entrepreneurs more than loyal creators, Geppettos relate to their puppets with a solid and personal emotional bond — one the puppets themselves cannot fail to feel. That deeper intimacy turns the relationship between puppeteer and puppets into a strong friendship, or something close to a parental one.',
      features: [
        {
          id: 'fatherly-love',
          name: 'Fatherly Love',
          level: 1,
          description:
            'You have advantage on all saving throws made because of an effect transmitted through your bond with a puppet.',
        },
        {
          id: 'loyal-son',
          name: 'Loyal Son',
          level: 6,
          description:
            'When you are reduced to 0 hit points while your Strings are bound to a puppet, they are not cut: you can keep taking actions using only the puppet for 3 rounds, and for the whole duration the Recoil of the Strings does not affect you. The effect ends if you regain any hit points, if you die, or if you are still at 0 hit points at the end of the third round — and when it ends, the puppet breaks.',
        },
      ],
    },
  ],
}
