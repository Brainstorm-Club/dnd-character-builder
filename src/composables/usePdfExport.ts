import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'
import { useCharacterStore } from '@/stores/character'
import { useAppStore } from '@/stores/app'
import type { CharacterData } from '@/stores/character'
import { getDnd5eFieldMapping, getBrancaloniaFieldMapping } from '@/utils/pdfFieldMapping'

/**
 * I moduli PDF portano il proprio font: se non ha il glifo di una lettera
 * accentata, pdf-lib solleva un errore e il campo resterebbe vuoto. Prima di
 * rinunciare riproviamo con la forma senza accento ("citta'" invece di
 * "città"), che nei manuali italiani è una convenzione già in uso.
 */
const ACCENT_FALLBACK: Record<string, string> = {
  à: "a'", è: "e'", é: "e'", ì: "i'", í: "i'", ò: "o'", ó: "o'", ù: "u'", ú: "u'",
  À: "A'", È: "E'", É: "E'", Ì: "I'", Ò: "O'", Ù: "U'",
  '\u2019': "'", '\u2018': "'", '\u201c': '"', '\u201d': '"', '\u2013': '-', '\u2014': '-', '\u2026': '...',
}

function transliterate(text: string): string {
  return text.replace(/[^\u0000-\u00ff]|[\u00c0-\u00ff]/g, ch => ACCENT_FALLBACK[ch] ?? ch)
}

export function usePdfExport() {
  const exporting = ref(false)

  /**
   * Export a character to PDF.
   * - Call with no args (or from @click) to export the current store character.
   * - Call exportPdfFor(charData) to export an arbitrary CharacterData.
   */
  async function exportPdf() {
    const characterStore = useCharacterStore()
    return _doExport(characterStore.character)
  }

  async function exportPdfFor(charData: CharacterData) {
    return _doExport(charData)
  }

  async function _doExport(char: CharacterData) {
    exporting.value = true

    try {
      // Apocalisse uses D&D 5e sheet (Apocalisse PDF sheets are not fillable AcroForms)
      const base = import.meta.env.BASE_URL
      const pdfUrl = char.variant === 'brancalonia'
        ? `${base}pdf/brancalonia-sheet.pdf`
        : `${base}pdf/dnd-5e-sheet.pdf`

      const pdfBytes = await fetch(pdfUrl).then(r => r.arrayBuffer())
      const pdfDoc = await PDFDocument.load(pdfBytes)
      const form = pdfDoc.getForm()

      // La scheda D&D segue la lingua dell'interfaccia; quelle di Brancalonia
      // e Apocalisse restano in italiano (lo decide getDnd5eFieldMapping).
      const uiLocale = useAppStore().locale
      const fieldMapping = char.variant === 'brancalonia'
        ? getBrancaloniaFieldMapping(char)
        : getDnd5eFieldMapping(char, uiLocale)

      const MAX_FIELD_LENGTH = 1000
      const skippedFields: string[] = []
      for (const [fieldName, value] of Object.entries(fieldMapping)) {
        try {
          if (typeof value === 'boolean') {
            if (value) {
              const checkbox = form.getCheckBox(fieldName)
              checkbox.check()
            }
          } else if (value) {
            const textField = form.getTextField(fieldName)
            const full = String(value)
            const text = full.length > MAX_FIELD_LENGTH ? full.slice(0, MAX_FIELD_LENGTH) : full
            try {
              textField.setText(text)
            } catch {
              // Il font del modulo non conosce qualche carattere: riprova senza accenti
              textField.setText(transliterate(text))
            }
          }
        } catch {
          skippedFields.push(fieldName)
        }
      }
      if (skippedFields.length > 0) {
        console.warn(`PDF export: ${skippedFields.length} field(s) not found in template:`, skippedFields)
      }

      const filledPdfBytes = await pdfDoc.save()
      const blob = new Blob([filledPdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${char.name || 'character'}-sheet.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Errore durante l\'esportazione del PDF. Riprova.')
    } finally {
      exporting.value = false
    }
  }

  return { exportPdf, exportPdfFor, exporting }
}
