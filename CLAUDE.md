# D&D Character Builder - Development Guidelines

## Quick Reference

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Type-check + production build → docs/
npm run preview      # Preview production build locally
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run audit:a11y   # Run Lighthouse CI accessibility audit
npm run audit:sci    # Run SCI carbon intensity benchmark
```

## Architecture

- **Vue 3** SPA (Composition API + `<script setup>` + TypeScript strict mode)
- **Pinia 3** stores with localStorage persistence
- **Client-only**: no backend, no API calls, no tracking
- **PWA**: offline-capable with Workbox service worker
- **Hosted**: GitHub Pages at https://brainstorm-club.github.io/dnd-character-builder/ (static, served from `/docs`)
- **Org**: [Brainstorm-Club](https://github.com/Brainstorm-Club) — the repo lives under the organization
- **Four game variants**: `dnd5e` (2014 rules), `dnd2024` (SRD 5.2.1), `brancalonia`, `apocalisse`
  - `dnd5e` must stay on the 2014 rules: Brancalonia and Apocalisse subclasses build on it

## Brand / Design System

The UI applies the [Brainstorm Club design system](https://github.com/Brainstorm-Club/design-system) as a **theme-level brand skin**, not a component rewrite:

- Palette + typography live in `src/style.css`. A Tailwind v4 `@theme` block remaps the `stone` (→ warm *carbone* neutrals), `red` (→ *rosso mattone* primary), and `amber` (→ *oro* secondary) scales, so existing utility classes render in brand colors without touching components.
- Fonts are **self-hosted** in `src/assets/fonts/` (Courier Prime for `.font-gothic` headings, Atkinson Hyperlegible for body) — no third-party font CDN.
- Default theme is dark (*carbone*); `[data-theme="light"]` (*carta*) overrides are hand-tuned in `src/style.css`.
- When restyling, prefer adjusting the `@theme` tokens over editing per-component classes.

## Key Paths

| Area | Path |
|------|------|
| Entry point | `src/main.ts` |
| Router | `src/router/index.ts` |
| Stores | `src/stores/app.ts`, `src/stores/character.ts` |
| Game data | `src/data/{dnd5e,brancalonia,apocalisse}/` |
| Data loader | `src/data/index.ts` |
| PDF mapping | `src/utils/pdfFieldMapping.ts` |
| PDF templates | `public/pdf/` |
| Build output | `docs/` |
| Tests | Co-located `*.test.ts` next to source files |
| WSG report | `wsg-report/wsg-compliance.json` |
| Lighthouse | `lighthouserc.json` |

## Feature Addition Checklist

When adding a new feature, follow these steps in order:

1. **Write the feature** — follow existing patterns (Composition API, TypeScript strict)
2. **Write tests** — co-locate `*.test.ts` next to the source file
3. **Run tests** — `npm run test` — all must pass
4. **Check accessibility** — ensure ARIA labels, keyboard nav, semantic HTML
5. **Run Lighthouse** — `npm run audit:a11y` — accessibility >= 90
6. **Check bundle impact** — `npm run build` and verify no unexpected chunk growth
7. **Verify sustainability** — update `wsg-report/wsg-compliance.json` if architecture changed

## Performance Budget

| Metric | Limit |
|--------|-------|
| Initial JS (gzipped) | < 170 KB |
| Total JS (all chunks, gzipped) | < 760 KB |
| CSS (gzipped) | < 15 KB |
| Lighthouse Accessibility | >= 90 |
| Lighthouse Performance | >= 80 |
| Lighthouse Best Practices | >= 90 |

## Sustainability Principles

This project follows the [W3C Web Sustainability Guidelines 1.0](https://www.w3.org/TR/web-sustainability-guidelines/):

- **Client over server** — all processing happens in-browser (zero server carbon)
- **Less is more** — zero tracking, zero ads, minimal dependencies
- **Offline first** — PWA with service worker, works without network
- **Dark mode default** — reduces OLED display energy
- **Self-hosted fonts** — brand web fonts (Courier Prime, Atkinson Hyperlegible), latin subset only, ~70KB total, `font-display: swap`, no third-party CDN
- **SVG only** — no raster images (6 SVGs total, 6KB)
- **Code splitting** — variant data, wizard steps, and pdf-lib loaded on demand
- **Privacy by design** — no cookies, no analytics, localStorage only

## Code Conventions

- TypeScript strict mode — zero errors required
- Co-located tests: `foo.ts` → `foo.test.ts`
- vue-i18n: **DO NOT** use `@intlify/unplugin-vue-i18n` VueI18nPlugin
- All new interactive elements need `aria-label` or `aria-labelledby`
- Respect `prefers-reduced-motion` for any animations
- WSG guideline references in code comments where applicable (e.g. `// WSG 3.3`)

## Sustainability Tracking

| File | Purpose |
|------|---------|
| `wsg-report/wsg-compliance.json` | WSG 1.0 compliance status (80 guidelines) |
| `lighthouserc.json` | Lighthouse CI thresholds and audit config |
| `vitest.config.ts` | Test framework configuration |

## Known Technical Constraints

- `unsafe-eval` in CSP required for vue-i18n runtime compilation
- GitHub Pages: SPA routing via 404.html redirect hack
- Pinia "getActivePinia()" warnings in dev mode are HMR artifacts (safe to ignore)
- All four variants export to their own PDF sheet. The Apocalisse template shipped
  without any AcroForm fields, so its 114 fields were authored for this project and
  the publisher's order watermark was stripped from the content stream.

## Verifying Your Own Work

These rules come from mistakes made repeatedly in this codebase. The dominant
failure was not buggy project code — it was **buggy throwaway verification
scripts whose output was then believed**.

### The check is more likely wrong than the code

Before acting on a script that reports a defect, prove the script works: run it
against one case you know is good and one you know is bad. If it can't tell them
apart, fix the check first.

Real cases: a contrast audit used the wrong hex for `--bsc-carbone` (`#131112`
instead of `#181617`) and reported 4.69:1 for a pair that was actually 4.49:1 —
an inaccessible component nearly shipped into the shared design system. The same
audit later compared a dark-theme token against light-theme surfaces and
"found" three defects that did not exist.

### Field names here do not match intuition — read the interface first

`CharacterData` has `armor`, not `equipment.armor`. Spells live in `cantrips`,
`spellsKnown` and `spellsPrepared` — there is no `spells`. A spell reference may
be an id (`3-fireball`, `vicious-mockery`) **or** a name (`Fireball`): resolve
both, or half the data silently fails to match. The `useGameTerms()` composable
returns `armorName`, not `armor`; `dnd5e/equipment.ts` exports `armor`, not
`armorTable`. In `pdfFieldMapping.ts`, `Spells 1015` is a level-1 slot, not
level 0 — read `DND5E_SPELL_FIELDS` rather than guessing from the field name.

### When data disagrees with a rule you implemented, suspect the rule

Hand-authored game data is usually right, because it came from a manual.
Two blog monks appeared to have wrong attack bonuses; the data was correct and
the code did not know that Martial Arts lets a monk use Dexterity with monk
weapons. Check the manual before "fixing" data.

### Fuzzy matching against a manual is a hypothesis, not a result

Matching manual passages to data records by shared words was wrong 3 times out
of 20. Anchor on the printed heading above the passage, and verify each match
before writing. If a record has no such line in the manual, the answer is
"none", never "the one from the neighbouring block".

### Extraction and refactoring break at the cut boundaries

When moving code between components, the errors are at the edges: host-specific
markup dragged into a shared component, an opening tag left behind, a helper
deleted that was still needed (`spellName()` — its loss printed raw spell ids on
the sheet). After any extraction, run `vue-tsc` **and** check which symbols
became unused in the source file: each one is either dead code to remove or
something you forgot to move.

### `vitest` does not type-check

A test file can pass `npm run test` with dozens of TS errors. Always run
`npx vue-tsc --noEmit -p tsconfig.app.json` before believing a green suite.
Watch for import names shadowing globals: `import it from './it.json'` silently
replaces vitest's `it` and the file collects zero tests.

### Two-column PDF extraction

Every PDF in `manuali/` and `schede/` is laid out in two columns. Linearising a
page glues the columns together: text starts mid-word, tables land inside prose,
sections swallow the next heading — and whole records disappear (the `Skilled`
feat was absorbed into `savage-attacker` and went missing from the data). Always
crop columns separately, dehyphenate line ends, and close a record on section
headings as well as on the next record. Then check the result mechanically: no
entry may start lowercase, end without punctuation, contain a run of digits, or
carry the running footer.

### Browser verification

Screenshots of content below the fold often fail to composite in the preview
pane. `read_page` and `javascript_tool` measurements are both faster and stronger
evidence — prefer them, and use screenshots for the visual gestalt only.
