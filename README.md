# D&D Character Builder

A free, open-source character builder for **D&D 5th Edition**, **Brancalonia**, and **Apocalisse**. Runs entirely in your browser — no server, no account, no tracking.

**[Try it live](https://brainstorm-club.github.io/dnd-character-builder/)**

## Features

- **3 game variants**: D&D 5e (SRD), Brancalonia (Spaghetti Fantasy), Apocalisse (Dark Fantasy)
- **9-step wizard**: variant, race, class, abilities, background, equipment, spells, details, review
- **3 ability score methods**: standard array, point buy, 4d6 drop lowest
- **Random character generator**: one click per variant
- **PDF export**: fills official AcroForm character sheets with editable fields
- **JSON import/export**: save, share and load characters with full validation
- **Offline-ready**: PWA with service worker caching
- **Bilingual**: Italian and English (auto-detected)
- **Accessible**: WCAG-compliant, keyboard navigation, screen reader support
- **Sustainable**: follows [W3C Web Sustainability Guidelines](https://www.w3.org/TR/web-sustainability-guidelines/)

## Quick Start

### Use online

Visit **https://brainstorm-club.github.io/dnd-character-builder/** — that's it!

### Run locally

```bash
git clone https://github.com/Brainstorm-Club/dnd-character-builder.git
cd dnd-character-builder
npm install
npm run dev
```

Open http://localhost:5173/dnd-character-builder/ in your browser.

### Build for production

```bash
npm run build
```

The `docs/` folder is ready to deploy on any static hosting (GitHub Pages serves it from `/docs`).

## How to Use

### Create a character from scratch

1. Open the app and pick a game variant (D&D 5e, Brancalonia, or Apocalisse)
2. Click **"From Scratch"** under the variant card
3. Follow the 9-step wizard: choose race, class, generate ability scores, pick background, equipment, spells, fill in details
4. On the review page, export as **PDF** (editable fields) or **JSON**

### Generate a random character

Click **"Random"** under any variant card to instantly create a fully built character. You'll land on the review page where you can tweak, save, or export.

### Import a character from JSON

1. Click **"Import JSON"** under the variant you're importing for
2. Select a `.json` file previously exported from this app
3. The file is validated — if anything is wrong, you'll see specific error messages
4. If the character belongs to a different variant, you'll be warned but it will still load

### Export to PDF

From the review page, click **"Export PDF Sheet"**. The exported PDF uses the official character sheet with **editable AcroForm fields** — you can keep filling it in with any PDF reader (Adobe Acrobat, Foxit, etc.).

### Save characters

Click **"Save Character"** on the review page. Characters are stored in your browser's localStorage and appear on the home page for quick access.

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API + TypeScript)
- [Vite](https://vite.dev/) for build
- [Pinia](https://pinia.vuejs.org/) for state management
- [vue-i18n](https://vue-i18n.intlify.dev/) for translations
- [TailwindCSS v4](https://tailwindcss.com/) for styling
- [pdf-lib](https://pdf-lib.js.org/) for PDF AcroForm filling
- [Courier Prime](https://fonts.google.com/specimen/Courier+Prime) (headings) and [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) (body), self-hosted — from the [Brainstorm Club design system](https://github.com/Brainstorm-Club/design-system)

## Game Variants

| Variant | Races | Classes | Max Level | Source |
|---------|-------|---------|-----------|--------|
| **D&D 5e** | 9 SRD races | 12 classes + subclasses | 20 | [SRD 5.1](https://dnd.wizards.com/resources/systems-reference-document) |
| **Brancalonia** | 6 races | 12 subclasses | 6 | [Acheron Games](https://www.drivethrurpg.com/en/publisher/9086/acheron-games?affiliate_id=2960765) |
| **Apocalisse** | 1 race, 6 origins | 12 archetypes | 20 | [Acheron Games](https://www.drivethrurpg.com/en/publisher/9086/acheron-games/category/44511/apocalisse?affiliate_id=2960765) |

## Project Structure

```
src/
  components/
    layout/          # AppHeader, StepNavigation, LanguageSwitcher
    steps/           # Step1Variant through Step9Review
  composables/       # usePdfExport, useGameTerms
  data/
    dnd5e/           # classes, races, spells, equipment, backgrounds, rules
    brancalonia/     # classes, races, backgrounds, rules
    apocalisse/      # classes, races, backgrounds, rules
  i18n/locales/      # it.json, en.json
  stores/            # app.ts (settings), character.ts (character data)
  utils/             # calculations, diceRoller, pdfFieldMapping, randomCharacter
  views/             # HomeView, BuilderView, CharacterListView, PrivacyView
public/pdf/          # PDF character sheet templates
```

## Deploy to GitHub Pages

This repo includes a pre-built `docs/` folder. To deploy:

1. Go to your repo **Settings > Pages**
2. Set **Source** to **Deploy from a branch**
3. Set **Branch** to `main` and **Folder** to `/docs`
4. Save — your site will be live at `https://<username>.github.io/dnd-character-builder/`

To update the deployment, rebuild and commit:

```bash
npm run build
git add docs/
git commit -m "build: update docs"
git push
```

## Privacy

This app collects **zero data**. Everything runs in your browser. No cookies, no analytics, no accounts. Character data is stored only in your browser's localStorage.

## License

MIT

## Design

The interface wears the **[Brainstorm Club design system](https://github.com/Brainstorm-Club/design-system)** — the warm *carbone* / *rosso mattone* / *carta* palette and the Courier Prime + Atkinson Hyperlegible typography — applied as a theme-level brand skin over TailwindCSS. Dark ("carbone") is the default; a light ("carta") theme mirrors a printed game manual.

## Credits

A [Brainstorm Club](https://github.com/Brainstorm-Club) project — the tabletop gaming association of Faenza. Built with Vue 3 and Anthropic Claude. D&D 5e content from the [Systems Reference Document 5.1](https://dnd.wizards.com/resources/systems-reference-document) under the Open Gaming License. Brancalonia and Apocalisse are products of [Acheron Games](https://www.drivethrurpg.com/en/publisher/9086/acheron-games?affiliate_id=2960765).
