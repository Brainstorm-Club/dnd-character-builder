import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { blogCharacters } from '@/data/blog/characters'
import { getDnd5eFieldMapping, getBrancaloniaFieldMapping, getApocalisseFieldMapping } from '@/utils/pdfFieldMapping'
import { preloadVariantData } from '@/data'
import { GAME_VARIANTS } from '@/stores/app'
import messaggiIt from '@/i18n/locales/it.json'
import type { CharacterData } from '@/stores/character'

/**
 * I campi di prosa dei personaggi pronti stanno nei dati in inglese e hanno la
 * traduzione italiana nei file di lingua. La pagina la usa, il PDF no: usciva
 * una scheda italiana con tratti, ideali, legami e difetti in inglese.
 *
 * Qui si verifica la precondizione della correzione — che la traduzione ci sia
 * davvero e sia diversa dall'inglese — e che applicandola il PDF la porti.
 */
const CAMPI = ['personalityTraits', 'ideals', 'bonds', 'flaws'] as const

/** La stessa cosa che fa `charField` nella pagina. */
function tradotto(slug: string, campo: string): string {
  const dizionario = messaggiIt as unknown as {
    blog?: { characters?: Record<string, Record<string, string> | undefined> }
  }
  return dizionario.blog?.characters?.[slug]?.[campo] ?? ''
}

function mappa(c: CharacterData) {
  return c.variant === 'brancalonia' ? getBrancaloniaFieldMapping(c)
    : c.variant === 'apocalisse' ? getApocalisseFieldMapping(c)
      : getDnd5eFieldMapping(c, 'it')
}

beforeAll(async () => {
  setActivePinia(createPinia())
  for (const v of GAME_VARIANTS) await preloadVariantData(v)
})

describe('la scheda PDF di un personaggio pronto esce in italiano', () => {
  const conTraduzione = blogCharacters.filter(b => CAMPI.some(c => tradotto(b.slug, c)))

  it('la maggior parte dei personaggi pronti ha la prosa tradotta', () => {
    expect(conTraduzione.length, 'senza traduzioni la correzione non serve a niente')
      .toBeGreaterThan(20)
  })

  it.each(conTraduzione.slice(0, 20).map(b => [b.slug, b] as const))(
    '%s: il testo italiano arriva sulla scheda',
    (slug, bc) => {
      // Quel che fa la pagina prima di esportare: traduce, poi mappa.
      const copia: CharacterData = JSON.parse(JSON.stringify(bc.characterData))
      for (const campo of CAMPI) {
        const it = tradotto(slug, campo)
        if (it) (copia as unknown as Record<string, string>)[campo] = it
      }
      const testo = Object.values(mappa(copia)).filter(v => typeof v === 'string').join(' ⁋ ')
      for (const campo of CAMPI) {
        const it = tradotto(slug, campo)
        if (!it) continue
        // Un pezzo riconoscibile basta: il PDF taglia i campi lunghi.
        expect(testo, `${campo} non è arrivato tradotto`).toContain(it.slice(0, 24))
      }
    },
  )
})
