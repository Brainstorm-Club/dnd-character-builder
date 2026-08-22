# Data sources

This builder ships game data for three settings. This page records where each
piece comes from, so the licensing position is legible rather than assumed.

## D&D 5e — 2014 rules

Most of the data is transcribed from the **System Reference Document 5.1**,
published by Wizards of the Coast under the Open Gaming License 1.0a. That
covers all 317 spells' level, school, casting time, range, components,
duration and class lists, the equipment tables with list prices, the classes
and their features, and 9 races.

**Some of it is not in the SRD.** The following come from the 2014 *Player's
Handbook* and are used here for reference:

| What | Detail |
|------|--------|
| 13 spells | Blade Ward, Compulsion, Counterspell, Druidcraft, Eldritch Blast, Fire Bolt, Guardian of Faith, Hellish Rebuke, Hex, Hunter's Mark, Poison Spray, Spare the Dying, Vicious Mockery |
| 12 backgrounds | The SRD contains only Acolyte |
| Several subraces | The SRD contains one subrace per race at most |

If the project needs to sit strictly inside the OGL, that material has to
come out. It is deliberately listed here rather than left implicit.

Spell descriptions are the opening sentences of the manual text, not
paraphrases; class feature descriptions are summaries.

## Brancalonia

Data transcribed from the manuals published by [Acheron Games](https://www.drivethrurpg.com/en/publisher/9086/acheron-games?affiliate_id=2960765):

- **Manuale di Ambientazione 2.6** — races, subclasses, backgrounds, the Brawl
  system (whacks, moves, class moves, aces in the hole), currency, Emeriticences
- **Macaronicon 2.2** — the Burattinaio class, further subclasses, 7 backgrounds,
  racial brawl features
- **L'Impero Randella Ancora! 1.0** — 16 feats, 7 backgrounds, further subclasses

Italian names are the ones printed in the Italian editions, not translations
back from the English ones.

## Apocalisse

Data transcribed from **John's Guide to the Armageddon 1.0**, also Acheron
Games. Origins, archetypes, the Marks and their fourteen spirits, the seven
Virtues and seven Sins.

One thing in the app is **not** from the manual: the Humanity score (0-10).
The manual replaces alignment with a Virtue and a Sin and has no such track.
It is flagged as a house rule in `src/data/apocalisse/rules.ts`.

## The manuals themselves

The PDFs are not in this repository and never have been. `schede/` and
`manuali/` are in `.gitignore`.
