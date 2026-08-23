import { describe, it, expect } from 'vitest'
import { ensureSpellTextsIt, getSpellTextIt } from '@/data/spells-it'

describe('verifica di integrazione: il testo italiano arriva davvero', () => {
  it('gli incantesimi del chierico di prova hanno il testo, in italiano', async () => {
    await ensureSpellTextsIt('dnd5e')
    const ids = ['guidance', 'mending', 'light', '1-cure-wounds', '2-locate-object',
                 '1-protection-from-evil-and-good', '2-find-traps', '2-calm-emotions', '2-gentle-repose']
    const mancanti = ids.filter(id => !getSpellTextIt('dnd5e', id)?.testo)
    expect(mancanti).toEqual([])
    const cura = getSpellTextIt('dnd5e', '1-cure-wounds')!
    expect(cura.testo).toMatch(/creatura|incantatore|punti ferita/i)
    expect(cura.testo).not.toMatch(/Rivendita vietata|Not for resale/)
  })

  it('i due incantesimi fuori SRD non hanno testo, e non è un errore', async () => {
    await ensureSpellTextsIt('dnd5e')
    expect(getSpellTextIt('dnd5e', 'blade-ward')?.testo).toBeUndefined()
  })

  it('il 2024 ha la sua edizione, non quella del 2014', async () => {
    await ensureSpellTextsIt('dnd2024')
    const t2024 = getSpellTextIt('dnd2024', '1-cure-wounds')?.testo
    const t2014 = getSpellTextIt('dnd5e', '1-cure-wounds')?.testo
    expect(t2024).toBeTruthy()
    expect(t2024).not.toBe(t2014)
  })
})
