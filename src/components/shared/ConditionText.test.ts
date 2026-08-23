import { describe, it, expect, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ConditionText from './ConditionText.vue'
import { ensureConditionData } from '@/data'
import messaggiIt from '@/i18n/locales/it.json'
import messaggiEn from '@/i18n/locales/en.json'

/**
 * Il testo di un privilegio con dentro il nome di una condizione: il nome si
 * apre, il testo dell'SRD compare, e dove l'SRD tace il pannello lo dichiara
 * invece di riempire il buco con l'altra edizione.
 */
function monta(testo: string, variant: 'dnd5e' | 'dnd2024' | 'brancalonia', locale = 'it') {
  const i18n = createI18n({ legacy: false, locale, messages: { it: messaggiIt, en: messaggiEn } })
  return mount(ConditionText, {
    props: { text: testo, variant },
    global: { plugins: [i18n] },
  })
}

beforeAll(async () => {
  for (const v of ['dnd5e', 'dnd2024', 'brancalonia'] as const) await ensureConditionData(v)
})

describe('ConditionText', () => {
  it('stampa il testo intero, con la condizione come bottone', () => {
    const w = monta('Il bersaglio è affascinato fino al tuo prossimo turno.', 'dnd5e')
    expect(w.text()).toContain('Il bersaglio è affascinato fino al tuo prossimo turno.')
    expect(w.findAll('button')).toHaveLength(1)
    expect(w.find('button').text()).toBe('affascinato')
  })

  it('un testo senza condizioni non guadagna bottoni', () => {
    const w = monta('Ottieni un dado di ispirazione.', 'dnd5e')
    expect(w.findAll('button')).toHaveLength(0)
    expect(w.text()).toContain('Ottieni un dado di ispirazione.')
  })

  it('il bottone apre il testo dell\'SRD e lo richiude', async () => {
    const w = monta('Il bersaglio è affascinato.', 'dnd5e')
    expect(w.find('[role="note"]').exists()).toBe(false)
    await w.find('button').trigger('click')
    const nota = w.find('[role="note"]')
    expect(nota.exists()).toBe(true)
    expect(nota.text()).toContain('Una creatura affascinata non può attaccare chi l\'ha affascinata')
    expect(w.find('button').attributes('aria-expanded')).toBe('true')
    await w.find('button').trigger('click')
    expect(w.find('[role="note"]').exists()).toBe(false)
  })

  it('dove l\'SRD 5.1 italiano tace lo dice, e non prende il testo del 2024', async () => {
    const w = monta('Il bersaglio è spaventato.', 'dnd5e')
    await w.find('button').trigger('click')
    const nota = w.find('[role="note"]').text()
    expect(nota).toContain('Spaventato')
    expect(nota).toContain(messaggiIt.conditions.noText)
    // Il testo del 2024 parla di «influenza sulle prove con d20»: se comparisse
    // qui vorrebbe dire che l'edizione sbagliata è stata usata come tappabuchi.
    expect(nota.toLowerCase()).not.toContain('prove con d20')
  })

  it('la stessa condizione, nel 2024, ha il testo', async () => {
    const w = monta('Il bersaglio è spaventato.', 'dnd2024')
    await w.find('button').trigger('click')
    expect(w.find('[role="note"]').text()).not.toContain(messaggiIt.conditions.noText)
  })

  it('Brancalonia legge le condizioni del 2014, non quelle del 2024', async () => {
    const w = monta('Il bersaglio è spaventato.', 'brancalonia')
    await w.find('button').trigger('click')
    expect(w.find('[role="note"]').text()).toContain(messaggiIt.conditions.noText)
  })

  it('la nota redazionale sull\'«Incapacitato» del 2024 sta fuori dal testo della fonte', async () => {
    const w = monta('Il bersaglio è incapacitato.', 'dnd2024')
    await w.find('button').trigger('click')
    const nota = w.find('[role="note"]')
    expect(nota.text()).toContain('errore di traduzione')
    // Separata a vista: sta in un blocco suo, staccato da un bordo.
    const redazionale = nota.findAll('span').find(s => s.text().startsWith(messaggiIt.conditions.editorialNote))
    expect(redazionale?.classes().join(' ')).toContain('border-t')
  })

  it('in inglese aggancia i nomi inglesi e avverte che il testo è italiano', async () => {
    const w = monta('The target is Charmed.', 'dnd5e', 'en')
    expect(w.find('button').text()).toBe('Charmed')
    await w.find('button').trigger('click')
    expect(w.find('[role="note"]').text()).toContain(messaggiEn.conditions.italianOnly)
  })
})
