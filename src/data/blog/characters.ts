import type { GameVariant } from '@/stores/app'
import type { CharacterData } from '@/stores/character'

// ─── Blog Character Interface ───────────────────────────────────────────────

export interface BlogCharacter {
  /** URL-safe slug in classe-razza-nome format, e.g. "ranger-elf-elara-nightwhisper" */
  slug: string
  /** Game variant this character belongs to */
  variant: GameVariant
  /** Complete character data, ready for PDF/JSON export and profile saving */
  characterData: CharacterData
  /** Tags for filtering and SEO (race, class, variant) */
  tags: string[]
}

// ─── D&D 5e Character Imports ───────────────────────────────────────────────

import { elaraNightwhisper } from './dnd5e/elara-nightwhisper'
import { grokkIronfang } from './dnd5e/grokk-ironfang'
import { lyraSilvertongue } from './dnd5e/lyra-silvertongue'
import { thordinStoneheart } from './dnd5e/thordin-stoneheart'
import { rowanAshwood } from './dnd5e/rowan-ashwood'
import { beraBattlehammer } from './dnd5e/bera-battlehammer'
import { kaelWindwalker } from './dnd5e/kael-windwalker'
import { varekBrightscale } from './dnd5e/varek-brightscale'
import { pipShadowfoot } from './dnd5e/pip-shadowfoot'
import { zaraHellfire } from './dnd5e/zara-hellfire'
import { vexNightpact } from './dnd5e/vex-nightpact'
import { aldricSpellweaver } from './dnd5e/aldric-spellweaver'
import { fizzleGearspark } from './dnd5e/fizzle-gearspark'
import { bramThickfoot } from './dnd5e/bram-thickfoot'
import { thistleMossheart } from './dnd5e/thistle-mossheart'
import { araelDawnwhisper } from './dnd5e/arael-dawnwhisper'
import { nyxShadowcloak } from './dnd5e/nyx-shadowcloak'
import { serRolandTheBold } from './dnd5e/ser-roland-the-bold'
import { cassaraStarbloom } from './dnd5e/cassara-starbloom'
import { morthosGrimsoul } from './dnd5e/morthos-grimsoul'
import { fernWildbloom } from './dnd5e/fern-wildbloom'
import { skarFlamerage } from './dnd5e/skar-flamerage'
import { marcoFortunato } from './dnd5e/marco-fortunato'

// ─── Brancalonia Character Imports ──────────────────────────────────────────

import { ruggoTestagrossa } from './brancalonia/ruggo-testagrossa'
import { pulcinellaLinguadoro } from './brancalonia/pulcinella-linguadoro'
import { fraBenedettoMiracolaro } from './brancalonia/fra-benedetto-miracolaro'
import { querciaVerdecuore } from './brancalonia/quercia-verdecuore'
import { scorzaLamadinferno } from './brancalonia/scorza-lamadinferno'
import { fraAnselmoPugnodivino } from './brancalonia/fra-anselmo-pugnodivino'
import { serGaleazzoSenzamacchia } from './brancalonia/ser-galeazzo-senzamacchia'
import { roccoDomabelve } from './brancalonia/rocco-domabelve'
import { volpeManolesta } from './brancalonia/volpe-manolesta'
import { stregaMalocchio } from './brancalonia/strega-malocchio'
import { foscoOcchiomaligno } from './brancalonia/fosco-occhiomaligno'
import { legnoSapiente } from './brancalonia/legno-sapiente'
import { mastroGeppetto } from './brancalonia/mastro-geppetto'
import { tonioRivoltoso } from './brancalonia/tonio-rivoltoso'
import { cantastorieLegnetto } from './brancalonia/cantastorie-legnetto'
import { padreRadice } from './brancalonia/padre-radice'
import { nonnaErba } from './brancalonia/nonna-erba'
import { capitanBracciodiferro } from './brancalonia/capitan-bracciodiferro'
import { cornoduro } from './brancalonia/cornoduro'
import { volpinaDelBosco } from './brancalonia/volpina-delbosco'
import { bambolaFatata } from './brancalonia/bambola-fatata'

// ─── D&D 2024 Character Imports ─────────────────────────────────────────────

import { vaskaStonemarch } from './dnd2024/vaska-stonemarch'
import { wrenApplecross } from './dnd2024/wren-applecross'
import { dagraEmberhearth } from './dnd2024/dagra-emberhearth'
import { sylwenThornhollow } from './dnd2024/sylwen-thornhollow'
import { corvinAshmere } from './dnd2024/corvin-ashmere'
import { grashQuickfist } from './dnd2024/grash-quickfist'
import { vaelothSunscale } from './dnd2024/vaeloth-sunscale'
import { pibTanglewood } from './dnd2024/pib-tanglewood'
import { sableDuskrend } from './dnd2024/sable-duskrend'
import { ignisEmberclaw } from './dnd2024/ignis-emberclaw'
import { malachaiVoidwhisper } from './dnd2024/malachai-voidwhisper'
import { ilyanaStarweave } from './dnd2024/ilyana-starweave'

// ─── Apocalisse Character Imports ───────────────────────────────────────────

import { damienCavaliereNero } from './apocalisse/damien-cavaliere-nero'
import { profetaCanto } from './apocalisse/profeta-canto'
import { suoraCenere } from './apocalisse/suora-cenere'
import { spinaVeleno } from './apocalisse/spina-veleno'
import { marcusUltimo } from './apocalisse/marcus-ultimo'
import { pellegrinoSigilli } from './apocalisse/pellegrino-sigilli'
import { gabrielRovina } from './apocalisse/gabriel-rovina'
import { sentinelConfine } from './apocalisse/sentinel-confine'
import { ombraAssenzio } from './apocalisse/ombra-assenzio'
import { sangueAntico } from './apocalisse/sangue-antico'
import { figliaLilith } from './apocalisse/figlia-lilith'
import { salomoneUltimo } from './apocalisse/salomone-ultimo'
import { furiaTempesta } from './apocalisse/furia-tempesta'
import { penitenteCenere } from './apocalisse/penitente-cenere'
import { guardianoMonte } from './apocalisse/guardiano-monte'
import { micheleCaduto } from './apocalisse/michele-caduto'
import { ladroRicordi } from './apocalisse/ladro-ricordi'
import { graziaSpezzata } from './apocalisse/grazia-spezzata'
import { animaErrante } from './apocalisse/anima-errante'
import { cronistaOblio } from './apocalisse/cronista-oblio'

// ─── Character Registry ─────────────────────────────────────────────────────

export const blogCharacters: BlogCharacter[] = [
  // ── D&D 5e (23 characters) ─────────────────────────────────────────────
  {
    slug: 'ranger-elf-elara-nightwhisper',
    variant: 'dnd5e',
    characterData: elaraNightwhisper,
    tags: ['elf', 'wood-elf', 'ranger', 'hunter', 'dnd5e'],
  },
  {
    slug: 'barbarian-halforc-grokk-ironfang',
    variant: 'dnd5e',
    characterData: grokkIronfang,
    tags: ['half-orc', 'barbarian', 'berserker', 'dnd5e'],
  },
  {
    slug: 'bard-halfelf-lyra-silvertongue',
    variant: 'dnd5e',
    characterData: lyraSilvertongue,
    tags: ['half-elf', 'bard', 'college-of-lore', 'dnd5e'],
  },
  {
    slug: 'cleric-dwarf-thordin-stoneheart',
    variant: 'dnd5e',
    characterData: thordinStoneheart,
    tags: ['dwarf', 'hill-dwarf', 'cleric', 'life', 'dnd5e'],
  },
  {
    slug: 'druid-human-rowan-ashwood',
    variant: 'dnd5e',
    characterData: rowanAshwood,
    tags: ['human', 'druid', 'circle-of-the-land', 'dnd5e'],
  },
  {
    slug: 'fighter-dwarf-bera-battlehammer',
    variant: 'dnd5e',
    characterData: beraBattlehammer,
    tags: ['dwarf', 'mountain-dwarf', 'fighter', 'champion', 'dnd5e'],
  },
  {
    slug: 'monk-elf-kael-windwalker',
    variant: 'dnd5e',
    characterData: kaelWindwalker,
    tags: ['elf', 'wood-elf', 'monk', 'way-of-the-open-hand', 'dnd5e'],
  },
  {
    slug: 'paladin-dragonborn-varek-brightscale',
    variant: 'dnd5e',
    characterData: varekBrightscale,
    tags: ['dragonborn', 'paladin', 'oath-of-devotion', 'dnd5e'],
  },
  {
    slug: 'rogue-halfling-pip-shadowfoot',
    variant: 'dnd5e',
    characterData: pipShadowfoot,
    tags: ['halfling', 'lightfoot', 'rogue', 'thief', 'dnd5e'],
  },
  {
    slug: 'sorcerer-tiefling-zara-hellfire',
    variant: 'dnd5e',
    characterData: zaraHellfire,
    tags: ['tiefling', 'sorcerer', 'draconic-bloodline', 'dnd5e'],
  },
  {
    slug: 'warlock-elf-vex-nightpact',
    variant: 'dnd5e',
    characterData: vexNightpact,
    tags: ['elf', 'dark-elf', 'warlock', 'the-fiend', 'dnd5e'],
  },
  {
    slug: 'wizard-elf-aldric-spellweaver',
    variant: 'dnd5e',
    characterData: aldricSpellweaver,
    tags: ['elf', 'high-elf', 'wizard', 'school-of-evocation', 'dnd5e'],
  },
  {
    slug: 'wizard-gnome-fizzle-gearspark',
    variant: 'dnd5e',
    characterData: fizzleGearspark,
    tags: ['gnome', 'rock-gnome', 'wizard', 'evocation', 'dnd5e'],
  },
  {
    slug: 'fighter-halfling-bram-thickfoot',
    variant: 'dnd5e',
    characterData: bramThickfoot,
    tags: ['halfling', 'stout', 'fighter', 'champion', 'dnd5e'],
  },
  {
    slug: 'ranger-gnome-thistle-mossheart',
    variant: 'dnd5e',
    characterData: thistleMossheart,
    tags: ['gnome', 'forest-gnome', 'ranger', 'hunter', 'dnd5e'],
  },
  {
    slug: 'cleric-elf-arael-dawnwhisper',
    variant: 'dnd5e',
    characterData: araelDawnwhisper,
    tags: ['elf', 'high-elf', 'cleric', 'life', 'dnd5e'],
  },
  {
    slug: 'rogue-elf-nyx-shadowcloak',
    variant: 'dnd5e',
    characterData: nyxShadowcloak,
    tags: ['elf', 'drow', 'rogue', 'thief', 'dnd5e'],
  },
  {
    slug: 'paladin-human-ser-roland-the-bold',
    variant: 'dnd5e',
    characterData: serRolandTheBold,
    tags: ['human', 'paladin', 'devotion', 'dnd5e'],
  },
  {
    slug: 'sorcerer-halfelf-cassara-starbloom',
    variant: 'dnd5e',
    characterData: cassaraStarbloom,
    tags: ['half-elf', 'sorcerer', 'draconic-bloodline', 'dnd5e'],
  },
  {
    slug: 'warlock-tiefling-morthos-grimsoul',
    variant: 'dnd5e',
    characterData: morthosGrimsoul,
    tags: ['tiefling', 'warlock', 'the-fiend', 'dnd5e'],
  },
  {
    slug: 'druid-elf-fern-wildbloom',
    variant: 'dnd5e',
    characterData: fernWildbloom,
    tags: ['elf', 'wood-elf', 'druid', 'circle-of-the-land', 'dnd5e'],
  },
  {
    slug: 'barbarian-dragonborn-skar-flamerage',
    variant: 'dnd5e',
    characterData: skarFlamerage,
    tags: ['dragonborn', 'barbarian', 'berserker', 'dnd5e'],
  },
  {
    slug: 'bard-human-marco-fortunato',
    variant: 'dnd5e',
    characterData: marcoFortunato,
    tags: ['human', 'bard', 'college-of-lore', 'dnd5e'],
  },

  // ── Brancalonia (21 characters) ─────────────────────────────────────────
  {
    slug: 'barbarian-morgant-ruggo-testagrossa',
    variant: 'brancalonia',
    characterData: ruggoTestagrossa,
    tags: ['morgant', 'barbarian', 'pagan', 'brancalonia'],
  },
  {
    slug: 'bard-human-pulcinella-linguadoro',
    variant: 'brancalonia',
    characterData: pulcinellaLinguadoro,
    tags: ['human', 'bard', 'harlequin', 'brancalonia'],
  },
  {
    slug: 'cleric-human-fra-benedetto-miracolaro',
    variant: 'brancalonia',
    characterData: fraBenedettoMiracolaro,
    tags: ['human', 'cleric', 'miracolaro', 'brancalonia'],
  },
  {
    slug: 'druid-sylvan-quercia-verdecuore',
    variant: 'brancalonia',
    characterData: querciaVerdecuore,
    tags: ['sylvan', 'druid', 'benandante', 'brancalonia'],
  },
  {
    slug: 'fighter-malebranche-scorza-lamadinferno',
    variant: 'brancalonia',
    characterData: scorzaLamadinferno,
    tags: ['malebranche', 'fighter', 'sword-player', 'brancalonia'],
  },
  {
    slug: 'monk-human-fra-anselmo-pugnodivino',
    variant: 'brancalonia',
    characterData: fraAnselmoPugnodivino,
    tags: ['human', 'monk', 'friar', 'brancalonia'],
  },
  {
    slug: 'paladin-human-ser-galeazzo-senzamacchia',
    variant: 'brancalonia',
    characterData: serGaleazzoSenzamacchia,
    tags: ['human', 'paladin', 'knight-errant', 'brancalonia'],
  },
  {
    slug: 'ranger-morgant-rocco-domabelve',
    variant: 'brancalonia',
    characterData: roccoDomabelve,
    tags: ['morgant', 'ranger', 'mattatore', 'brancalonia'],
  },
  {
    slug: 'rogue-gifted-volpe-manolesta',
    variant: 'brancalonia',
    characterData: volpeManolesta,
    tags: ['gifted', 'rogue', 'brigand', 'brancalonia'],
  },
  {
    slug: 'sorcerer-gifted-strega-malocchio',
    variant: 'brancalonia',
    characterData: stregaMalocchio,
    tags: ['gifted', 'sorcerer', 'scaramante', 'brancalonia'],
  },
  {
    slug: 'warlock-malebranche-fosco-occhiomaligno',
    variant: 'brancalonia',
    characterData: foscoOcchiomaligno,
    tags: ['malebranche', 'warlock', 'menagramo', 'brancalonia'],
  },
  {
    slug: 'wizard-marionette-legno-sapiente',
    variant: 'brancalonia',
    characterData: legnoSapiente,
    tags: ['marionette', 'wizard', 'guiscardo', 'brancalonia'],
  },
  {
    slug: 'burattinaio-human-mastro-geppetto',
    variant: 'brancalonia',
    characterData: mastroGeppetto,
    tags: ['human', 'burattinaio', 'brancalonia'],
  },
  {
    slug: 'barbarian-human-tonio-rivoltoso',
    variant: 'brancalonia',
    characterData: tonioRivoltoso,
    tags: ['human', 'barbarian', 'rabble-rouser', 'brancalonia'],
  },
  {
    slug: 'bard-marionette-cantastorie-legnetto',
    variant: 'brancalonia',
    characterData: cantastorieLegnetto,
    tags: ['marionette', 'bard', 'storyteller', 'brancalonia'],
  },
  {
    slug: 'cleric-sylvan-padre-radice',
    variant: 'brancalonia',
    characterData: padreRadice,
    tags: ['sylvan', 'cleric', 'preacher', 'brancalonia'],
  },
  {
    slug: 'druid-human-nonna-erba',
    variant: 'brancalonia',
    characterData: nonnaErba,
    tags: ['human', 'druid', 'hedge-witch', 'brancalonia'],
  },
  {
    slug: 'fighter-morgant-capitan-bracciodiferro',
    variant: 'brancalonia',
    characterData: capitanBracciodiferro,
    tags: ['morgant', 'fighter', 'mercenary-captain', 'brancalonia'],
  },
  {
    slug: 'monk-malebranche-cornoduro',
    variant: 'brancalonia',
    characterData: cornoduro,
    tags: ['malebranche', 'monk', 'wrestler', 'brancalonia'],
  },
  {
    slug: 'rogue-sylvan-volpina-delbosco',
    variant: 'brancalonia',
    characterData: volpinaDelBosco,
    tags: ['sylvan', 'rogue', 'charlatan', 'brancalonia'],
  },
  {
    slug: 'sorcerer-marionette-bambola-fatata',
    variant: 'brancalonia',
    characterData: bambolaFatata,
    tags: ['marionette', 'sorcerer', 'witch', 'brancalonia'],
  },

  // ── Apocalisse (20 characters) ──────────────────────────────────────────
  {
    slug: 'barbarian-risen-hell-damien-cavaliere-nero',
    variant: 'apocalisse',
    characterData: damienCavaliereNero,
    tags: ['risen-hell', 'barbarian', 'horseman', 'apocalisse'],
  },
  {
    slug: 'bard-risen-limbo-profeta-canto',
    variant: 'apocalisse',
    characterData: profetaCanto,
    tags: ['risen-limbo', 'bard', 'laments', 'apocalisse'],
  },
  {
    slug: 'cleric-risen-heaven-suora-cenere',
    variant: 'apocalisse',
    characterData: suoraCenere,
    tags: ['risen-heaven', 'cleric', 'heresy', 'apocalisse'],
  },
  {
    slug: 'druid-child-apocalypse-spina-veleno',
    variant: 'apocalisse',
    characterData: spinaVeleno,
    tags: ['child-apocalypse', 'druid', 'plagues', 'apocalisse'],
  },
  {
    slug: 'fighter-child-old-world-marcus-ultimo',
    variant: 'apocalisse',
    characterData: marcusUltimo,
    tags: ['child-old-world', 'fighter', 'furioso', 'apocalisse'],
  },
  {
    slug: 'monk-risen-purgatory-pellegrino-sigilli',
    variant: 'apocalisse',
    characterData: pellegrinoSigilli,
    tags: ['risen-purgatory', 'monk', 'seven-seals', 'apocalisse'],
  },
  {
    slug: 'paladin-risen-heaven-gabriel-rovina',
    variant: 'apocalisse',
    characterData: gabrielRovina,
    tags: ['risen-heaven', 'paladin', 'oath-of-the-end', 'apocalisse'],
  },
  {
    slug: 'ranger-child-apocalypse-sentinel-confine',
    variant: 'apocalisse',
    characterData: sentinelConfine,
    tags: ['child-apocalypse', 'ranger', 'bastion', 'apocalisse'],
  },
  {
    slug: 'rogue-risen-hell-ombra-assenzio',
    variant: 'apocalisse',
    characterData: ombraAssenzio,
    tags: ['risen-hell', 'rogue', 'wormwood-specter', 'apocalisse'],
  },
  {
    slug: 'sorcerer-risen-limbo-sangue-antico',
    variant: 'apocalisse',
    characterData: sangueAntico,
    tags: ['risen-limbo', 'sorcerer', 'otherworldly-heritage', 'apocalisse'],
  },
  {
    slug: 'warlock-risen-hell-figlia-lilith',
    variant: 'apocalisse',
    characterData: figliaLilith,
    tags: ['risen-hell', 'warlock', 'lilith', 'apocalisse'],
  },
  {
    slug: 'wizard-child-old-world-salomone-ultimo',
    variant: 'apocalisse',
    characterData: salomoneUltimo,
    tags: ['child-old-world', 'wizard', 'solomon', 'apocalisse'],
  },
  {
    slug: 'barbarian-child-apocalypse-furia-tempesta',
    variant: 'apocalisse',
    characterData: furiaTempesta,
    tags: ['child-apocalypse', 'barbarian', 'horseman', 'apocalisse'],
  },
  {
    slug: 'cleric-risen-purgatory-penitente-cenere',
    variant: 'apocalisse',
    characterData: penitenteCenere,
    tags: ['risen-purgatory', 'cleric', 'heresy', 'apocalisse'],
  },
  {
    slug: 'druid-risen-purgatory-guardiano-monte',
    variant: 'apocalisse',
    characterData: guardianoMonte,
    tags: ['risen-purgatory', 'druid', 'plagues', 'apocalisse'],
  },
  {
    slug: 'fighter-risen-heaven-michele-caduto',
    variant: 'apocalisse',
    characterData: micheleCaduto,
    tags: ['risen-heaven', 'fighter', 'furioso', 'apocalisse'],
  },
  {
    slug: 'rogue-child-old-world-ladro-ricordi',
    variant: 'apocalisse',
    characterData: ladroRicordi,
    tags: ['child-old-world', 'rogue', 'wormwood-specter', 'apocalisse'],
  },
  {
    slug: 'sorcerer-risen-heaven-grazia-spezzata',
    variant: 'apocalisse',
    characterData: graziaSpezzata,
    tags: ['risen-heaven', 'sorcerer', 'otherworldly-heritage', 'apocalisse'],
  },
  {
    slug: 'warlock-risen-purgatory-anima-errante',
    variant: 'apocalisse',
    characterData: animaErrante,
    tags: ['risen-purgatory', 'warlock', 'lilith', 'apocalisse'],
  },
  {
    slug: 'wizard-risen-limbo-cronista-oblio',
    variant: 'apocalisse',
    characterData: cronistaOblio,
    tags: ['risen-limbo', 'wizard', 'solomon', 'apocalisse'],
  },

  // ── D&D 2024 (12 characters) ──────────────────────────────────────────
  {
    slug: 'barbarian-goliath-vaska-stonemarch',
    variant: 'dnd2024',
    characterData: vaskaStonemarch,
    tags: ['goliath', 'stones-endurance', 'barbarian', 'path-of-the-berserker', 'dnd2024'],
  },
  {
    slug: 'bard-halfling-wren-applecross',
    variant: 'dnd2024',
    characterData: wrenApplecross,
    tags: ['halfling', 'bard', 'college-of-lore', 'dnd2024'],
  },
  {
    slug: 'cleric-dwarf-dagra-emberhearth',
    variant: 'dnd2024',
    characterData: dagraEmberhearth,
    tags: ['dwarf', 'cleric', 'life-domain', 'dnd2024'],
  },
  {
    slug: 'druid-elf-sylwen-thornhollow',
    variant: 'dnd2024',
    characterData: sylwenThornhollow,
    tags: ['elf', 'wood-elf', 'druid', 'circle-of-the-land', 'dnd2024'],
  },
  {
    slug: 'fighter-human-corvin-ashmere',
    variant: 'dnd2024',
    characterData: corvinAshmere,
    tags: ['human', 'fighter', 'champion', 'dnd2024'],
  },
  {
    slug: 'monk-orc-grash-quickfist',
    variant: 'dnd2024',
    characterData: grashQuickfist,
    tags: ['orc', 'monk', 'warrior-of-the-open-hand', 'dnd2024'],
  },
  {
    slug: 'paladin-dragonborn-vaeloth-sunscale',
    variant: 'dnd2024',
    characterData: vaelothSunscale,
    tags: ['dragonborn', 'gold', 'paladin', 'oath-of-devotion', 'dnd2024'],
  },
  {
    slug: 'ranger-gnome-pib-tanglewood',
    variant: 'dnd2024',
    characterData: pibTanglewood,
    tags: ['gnome', 'forest-gnome', 'ranger', 'hunter', 'dnd2024'],
  },
  {
    slug: 'rogue-tiefling-sable-duskrend',
    variant: 'dnd2024',
    characterData: sableDuskrend,
    tags: ['tiefling', 'infernal', 'rogue', 'thief', 'dnd2024'],
  },
  {
    slug: 'sorcerer-dragonborn-ignis-emberclaw',
    variant: 'dnd2024',
    characterData: ignisEmberclaw,
    tags: ['dragonborn', 'red', 'sorcerer', 'draconic-sorcery', 'dnd2024'],
  },
  {
    slug: 'warlock-tiefling-malachai-voidwhisper',
    variant: 'dnd2024',
    characterData: malachaiVoidwhisper,
    tags: ['tiefling', 'abyssal', 'warlock', 'fiend-patron', 'dnd2024'],
  },
  {
    slug: 'wizard-elf-ilyana-starweave',
    variant: 'dnd2024',
    characterData: ilyanaStarweave,
    tags: ['elf', 'high-elf', 'wizard', 'evoker', 'dnd2024'],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getBlogCharacterBySlug(slug: string): BlogCharacter | undefined {
  return blogCharacters.find(c => c.slug === slug)
}

export function getBlogCharactersByVariant(variant: GameVariant): BlogCharacter[] {
  return blogCharacters.filter(c => c.variant === variant)
}
