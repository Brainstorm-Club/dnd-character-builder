import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { h } from 'vue'
import SciReportView from './SciReportView.vue'

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

const RouterLinkStub = { props: ['to'], render() { return h('a') } }

const report = {
  commit: 'abc1234',
  date: '2026-01-01T10:00:00.000Z',
  machine: 'test',
  lcaSource: 'test',
  constants: { devicePowerW: 20, carbonIntensity: 300, embodiedG: 250000, lifetimeH: 35040 },
  results: [
    { service: 'pdf-export', wallTimeMs: 120, inputBytes: 2048, outputBytes: 4096, sciMgCO2eq: 0.42 },
    { service: 'random-character', wallTimeMs: 8, inputBytes: 0, outputBytes: 512, sciMgCO2eq: 0.03 },
  ],
  totalSciMg: 0.45,
}

async function mountReport() {
  const wrapper = mount(SciReportView, {
    global: { plugins: [i18n], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  return wrapper
}

describe('rapporto SCI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => report })))
  })

  it('usa la tabella del design system invece di rifarla a mano', async () => {
    const wrapper = await mountReport()
    const table = wrapper.find('table')
    expect(table.classes()).toContain('bsc-table')
    // Il contenitore che scorre in orizzontale è quello del DS.
    expect(wrapper.find('.bsc-table-scroll').exists()).toBe(true)
    // Nessun residuo dell'impalcatura rifatta a mano sulla tabella.
    expect(table.classes()).not.toContain('w-full')
  })

  it('allinea a destra le colonne numeriche con .bsc-num', async () => {
    const wrapper = await mountReport()
    // quattro intestazioni numeriche su cinque colonne
    expect(wrapper.findAll('thead th.bsc-num')).toHaveLength(4)
    const firstRow = wrapper.findAll('tbody tr')[0]!
    expect(firstRow.findAll('td.bsc-num')).toHaveLength(4)
  })

  it('mostra i dati del rapporto e conserva l\'etichetta della tabella', async () => {
    const wrapper = await mountReport()
    expect(wrapper.find('table').attributes('aria-label')).toBe('SCI benchmark results')
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.text()).toContain('pdf-export')
    expect(wrapper.text()).toContain('0.420')
  })

  it('usa la card del design system per il riepilogo', async () => {
    const wrapper = await mountReport()
    expect(wrapper.find('.bsc-card').exists()).toBe(true)
  })
})
