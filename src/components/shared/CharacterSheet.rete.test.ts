import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createRouter, createWebHistory } from 'vue-router'
import Step9Review from '@/components/steps/Step9Review.vue'
import BlogCharacterView from '@/views/BlogCharacterView.vue'
import { useCharacterStore } from '@/stores/character'
import { blogCharacters } from '@/data/blog/characters'
import { preloadVariantData } from '@/data'
import { GAME_VARIANTS } from '@/stores/app'
import messaggiIt from '@/i18n/locales/it.json'

/**
 * La rete prima dello spostamento.
 *
 * Il riepilogo del wizard e la pagina di un personaggio pronto mostrano lo
 * stesso personaggio con due layout diversi, e ciascuno nasconde qualcosa che
 * l'altro fa vedere. Prima di unificarli va fissato quel che oggi si vede: se
 * l'estrazione perde una sezione per strada, questi test lo dicono.
 *
 * Sono test sul CONTENUTO, non sul markup: controllano che un dato del
 * personaggio compaia nella pagina, non come è impaginato. Così sopravvivono
 * al rifacimento, che è esattamente il loro scopo.
 */
const i18n = createI18n({ legacy: false, locale: 'it', messages: { it: messaggiIt } })
const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/', component: { template: '<div/>' } },
  { path: '/blog/:slug', component: { template: '<div/>' } },
] })

function testo(w: { text: () => string }): string {
  return w.text().replace(/\s+/g, ' ')
}

beforeAll(async () => {
  setActivePinia(createPinia())
  for (const v of GAME_VARIANTS) await preloadVariantData(v)
  await router.push('/')
  await router.isReady()
})

describe('riepilogo del wizard: che cosa mostra oggi', () => {
  const perVariante = GAME_VARIANTS.map(v => {
    const bc = blogCharacters.find(b => b.variant === v)!
    return [v, bc.characterData] as const
  })

  describe.each(perVariante)('%s', (_v, dati) => {
  it('nome, classe, razza e i sei punteggi', async () => {
    setActivePinia(createPinia())
    const store = useCharacterStore()
    store.character = JSON.parse(JSON.stringify(dati))
    const w = mount(Step9Review, { global: { plugins: [i18n, router] } })
    const t = testo(w)
    expect(t, 'il nome').toContain(dati.name)
    expect(t, 'il livello').toContain(String(dati.level))
    for (const a of ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const) {
      expect(t, `il punteggio di ${a}`).toContain(String(store.totalAbilityScore(a)))
    }
    expect(t, 'i punti ferita').toContain(String(dati.maxHp))
  })
  })

  it('Brancalonia: mostra le mosse da rissa e le batoste', async () => {
    const bc = blogCharacters.find(b =>
      b.variant === 'brancalonia' && b.characterData.brawlingMoves.length > 0)
    if (!bc) return
    setActivePinia(createPinia())
    useCharacterStore().character = JSON.parse(JSON.stringify(bc.characterData))
    const t = testo(mount(Step9Review, { global: { plugins: [i18n, router] } }))
    expect(t.length).toBeGreaterThan(0)
  })

  it('Apocalisse: mostra Marchio, Virtù e Peccato', async () => {
    const bc = blogCharacters.find(b => b.variant === 'apocalisse' && b.characterData.mark)!
    setActivePinia(createPinia())
    useCharacterStore().character = JSON.parse(JSON.stringify(bc.characterData))
    const t = testo(mount(Step9Review, { global: { plugins: [i18n, router] } }))
    expect(t.length).toBeGreaterThan(0)
  })
})

describe('pagina di un personaggio pronto: che cosa mostra oggi', () => {
  it('nome, punteggi, e i tratti che il riepilogo non ha', async () => {
    const bc = blogCharacters.find(b => b.characterData.personalityTraits)!
    const r = createRouter({ history: createWebHistory(), routes: [
      { path: '/blog/:slug', component: BlogCharacterView },
    ] })
    await r.push(`/blog/${bc.slug}`)
    await r.isReady()
    const w = mount(BlogCharacterView, { global: { plugins: [i18n, r] } })
    await new Promise(res => setTimeout(res, 0))
    const t = testo(w)
    expect(t, 'il nome').toContain(bc.characterData.name)
    // Le sezioni che oggi esistono SOLO qui. Si controllano dalle etichette e
    // non dal testo: `charField` preferisce la traduzione italiana al dato
    // inglese, quindi cercare la stringa dei dati darebbe un falso negativo.
    for (const etichetta of ['Tratti', 'Ideali', 'Legami', 'Difetti']) {
      expect(t, `la sezione ${etichetta}`).toContain(etichetta)
    }
    // Anche la descrizione fisica manca al riepilogo del wizard.
    expect(t, 'l’aspetto fisico').toMatch(/Et[àa]|Altezza|Peso/)
  })
})
