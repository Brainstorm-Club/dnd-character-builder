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
- **Three game variants**: `dnd5e`, `brancalonia`, `apocalisse`

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
| Total JS (all chunks, gzipped) | < 550 KB |
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
- Apocalisse variant uses D&D 5e PDF template (Apocalisse PDFs are not fillable AcroForms)
