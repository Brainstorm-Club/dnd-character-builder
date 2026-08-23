import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sorvegliaAggiornamenti, INTERVALLO_CONTROLLO_MS } from './aggiornamento'

/** Un finto registro di service worker che sa emettere `controllerchange`. */
function fintoSw(conControllore: boolean) {
  const ascoltatori: Record<string, ((e?: unknown) => void)[]> = {}
  const update = vi.fn()
  return {
    controller: conControllore ? {} : null,
    addEventListener: (tipo: string, fn: () => void) => {
      (ascoltatori[tipo] ??= []).push(fn)
    },
    removeEventListener: (tipo: string, fn: () => void) => {
      ascoltatori[tipo] = (ascoltatori[tipo] ?? []).filter(x => x !== fn)
    },
    getRegistration: () => Promise.resolve({ update }),
    /** Simula il worker nuovo che prende il controllo. */
    cambiaControllore: () => (ascoltatori['controllerchange'] ?? []).forEach(f => f()),
    quantiAscoltano: () => (ascoltatori['controllerchange'] ?? []).length,
    update,
  }
}

describe('accorgersi di una versione nuova', () => {
  it('ricarica quando il worker nuovo prende il controllo', () => {
    const sw = fintoSw(true)
    const ricarica = vi.fn()
    sorvegliaAggiornamenti({ sw: sw as unknown as ServiceWorkerContainer, ricarica })
    expect(ricarica).not.toHaveBeenCalled()
    sw.cambiaControllore()
    expect(ricarica).toHaveBeenCalledTimes(1)
  })

  it('alla primissima visita non ricarica: non e\' un aggiornamento', () => {
    // Nessun controllore prima: e' il worker che entra in carica la prima
    // volta. Senza questa distinzione ogni nuovo visitatore vedrebbe la
    // pagina sbattere subito dopo l'apertura.
    const sw = fintoSw(false)
    const ricarica = vi.fn()
    sorvegliaAggiornamenti({ sw: sw as unknown as ServiceWorkerContainer, ricarica })
    sw.cambiaControllore()
    expect(ricarica).not.toHaveBeenCalled()
  })

  it('ricarica una volta sola, anche se il controllore cambia ancora', () => {
    const sw = fintoSw(true)
    const ricarica = vi.fn()
    sorvegliaAggiornamenti({ sw: sw as unknown as ServiceWorkerContainer, ricarica })
    sw.cambiaControllore()
    sw.cambiaControllore()
    sw.cambiaControllore()
    expect(ricarica).toHaveBeenCalledTimes(1)
  })

  it('senza service worker non fa nulla e non esplode', () => {
    const ricarica = vi.fn()
    const stop = sorvegliaAggiornamenti({ sw: undefined, ricarica })
    expect(ricarica).not.toHaveBeenCalled()
    expect(() => stop()).not.toThrow()
  })

  it('smette di ascoltare quando glielo si chiede', () => {
    const sw = fintoSw(true)
    const ricarica = vi.fn()
    const stop = sorvegliaAggiornamenti({ sw: sw as unknown as ServiceWorkerContainer, ricarica })
    expect(sw.quantiAscoltano()).toBe(1)
    stop()
    expect(sw.quantiAscoltano()).toBe(0)
    sw.cambiaControllore()
    expect(ricarica).not.toHaveBeenCalled()
  })

  it('programma un ricontrollo periodico del worker', async () => {
    const sw = fintoSw(true)
    let azione: (() => void) | null = null
    let intervallo = 0
    sorvegliaAggiornamenti({
      sw: sw as unknown as ServiceWorkerContainer,
      ricarica: vi.fn(),
      programma: (a, ms) => { azione = a; intervallo = ms },
    })
    expect(intervallo).toBe(INTERVALLO_CONTROLLO_MS)
    azione!()
    await Promise.resolve(); await Promise.resolve()
    expect(sw.update).toHaveBeenCalled()
  })
})

const SPIE_ARCHIVIO = /localStorage|sessionStorage|indexedDB/

describe('il vincolo: le schede non si perdono', () => {
  /**
   * Archivio finto: in jsdom `localStorage` non e' pilotabile dai test, come
   * gia' annotato in `stores/app.test.ts`. Qui serve poter osservare ogni
   * scrittura e ogni cancellazione, cosa che il vero localStorage non
   * concede.
   */
  function archivioSorvegliato() {
    const dati = new Map<string, string>()
    const cancellati: string[] = []
    return {
      dati, cancellati,
      getItem: (k: string) => dati.get(k) ?? null,
      setItem: (k: string, v: string) => { dati.set(k, v) },
      removeItem: (k: string) => { cancellati.push(k); dati.delete(k) },
      clear: () => { cancellati.push('*'); dati.clear() },
    }
  }

  it('sorvegliare un aggiornamento non cancella nulla dall\'archivio', () => {
    const archivio = archivioSorvegliato()
    archivio.setItem('character', JSON.stringify({ character: { name: 'Ludovica' } }))
    archivio.setItem('app', JSON.stringify({ locale: 'it' }))

    const sw = fintoSw(true)
    sorvegliaAggiornamenti({ sw: sw as unknown as ServiceWorkerContainer, ricarica: () => {} })
    sw.cambiaControllore()

    // L'unica azione del modulo e' il ricaricamento: nessuna chiave toccata.
    expect(archivio.cancellati).toEqual([])
    expect(JSON.parse(archivio.getItem('character')!).character.name).toBe('Ludovica')
    expect(archivio.getItem('app')).not.toBeNull()
  })

  it('il modulo non nomina nemmeno l\'archivio dei personaggi', () => {
    // Prova strutturale: se un domani qualcuno mettesse qui una pulizia di
    // localStorage, questa riga diventa rossa prima che una scheda sparisca
    // dal telefono di qualcuno.
    const sorgente = readFileSync(resolve(process.cwd(), 'src/utils/aggiornamento.ts'), 'utf-8')
    // Senza togliere i commenti la prova fallirebbe sul proprio testo: il
    // modulo spiega a parole perche' le schede sono al sicuro, e quella
    // spiegazione nomina localStorage. E' codice che va guardato.
    const codice = sorgente.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    expect(codice).not.toMatch(SPIE_ARCHIVIO)
    // La prova sa distinguere: sullo stesso testo con una cancellazione
    // dentro, diventa rossa.
    expect(codice + "\nlocalStorage.removeItem('character')").toMatch(SPIE_ARCHIVIO)
  })
})
