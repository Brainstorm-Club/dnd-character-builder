import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
// `it` e `en` non si possono chiamare così: `it` è la funzione dei test, e
// importarla con quel nome la copre — i test smettono di esistere in silenzio.
import messaggiIt from '@/i18n/locales/it.json'
import messaggiEn from '@/i18n/locales/en.json'
import CreditsView from './CreditsView.vue'

/**
 * La pagina esiste per un obbligo di licenza — l'attribuzione CC-BY degli SRD —
 * e per anni ha coperto solo quello. Brancalonia e Apocalisse, che un obbligo
 * del genere non ce l'hanno perché non sono CC-BY, erano finite fuori proprio
 * per questo: comparivano di sfuggita in «Cosa non c'è», mentre l'app spedisce
 * classi, sottoclassi, razze, background, talenti e incantesimi di entrambe.
 */
function pagina(locale: 'it' | 'en') {
  const i18n = createI18n({
    legacy: false, locale, fallbackLocale: 'it',
    messages: { it: messaggiIt, en: messaggiEn }, missingWarn: false, fallbackWarn: false,
  })
  return mount(CreditsView, {
    global: { plugins: [i18n], stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
}

describe('CreditsView', () => {
  for (const locale of ['it', 'en'] as const) {
    describe(`interfaccia ${locale}`, () => {
      it('porta le due dichiarazioni CC-BY nella forma richiesta', () => {
        const testo = pagina(locale).text()
        expect(testo).toContain('SRD 5.1')
        expect(testo).toContain('SRD 5.2.1')
        expect(testo).toContain('creativecommons.org/licenses/by/4.0')
      })

      it('e attribuisce ad Acheron Games le due ambientazioni che spedisce', () => {
        const testo = pagina(locale).text()
        expect(testo).toContain('Acheron Games')
        expect(testo, 'Brancalonia').toContain('Brancalonia è un gioco di Acheron Games')
        expect(testo, 'Apocalisse').toContain('Riccardo Sirignano e Simone Formicola')
      })

      /**
       * «Brancalonia è un gioco di Longo, Mana e Marolla» si legge spesso in
       * giro, ma non è quello che scrive il manuale: loro tre hanno creato
       * *Zappa e Spada*, e il manuale attribuisce Brancalonia ad Acheron Games.
       * Sbagliare l'attribuzione è peggio che non metterla.
       */
      it('e li cita come il manuale, non come si dice in giro', () => {
        const testo = pagina(locale).text()
        expect(testo).toContain('Zappa e Spada è una creazione di Mauro Longo, Davide Mana e Samuel Marolla')
        expect(testo).toContain('Jack Sensolini e Luca Mazza')
      })

      it('e manda ai manuali, che senza non si gioca', () => {
        const link = pagina(locale).findAll('a').map(a => a.attributes('href'))
        expect(link).toContain('https://www.acheron.it')
      })
    })
  }

  it('le dichiarazioni restano in italiano anche a interfaccia inglese', () => {
    // Sono avvisi di attribuzione, non testo dell'applicazione: tradurli
    // vorrebbe dire riscriverli.
    for (const b of pagina('en').findAll('blockquote')) {
      expect(b.attributes('lang'), b.text().slice(0, 40)).toBe('it')
    }
  })
})
