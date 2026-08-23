/**
 * Character sharing via URL.
 * Compresses character JSON using base64 encoding into a URL hash.
 * Uses a compact format to minimize URL length.
 */
import type { CharacterData } from '@/stores/character'

/** Maximum encoded share URL data length (bytes). Prevents abuse / DoS. */
export const MAX_SHARE_DATA_LENGTH = 20_000

/**
 * Compact keys for the most common character fields to reduce URL size.
 * Esportata perché i test possano verificare che restino tutte distinte: una
 * chiave usata due volte fa sparire in silenzio uno dei due campi dal link.
 */
export const COMPACT_KEYS: Record<string, string> = {
  variant: 'v',
  name: 'n',
  playerName: 'pn',
  race: 'r',
  subrace: 'sr',
  className: 'c',
  subclass: 'sc',
  level: 'lv',
  background: 'bg',
  alignment: 'al',
  abilityScores: 'as',
  racialBonuses: 'rb',
  skillProficiencies: 'sp',
  savingThrowProficiencies: 'st',
  hitDie: 'hd',
  maxHp: 'hp',
  armor: 'ar',
  shield: 'sh',
  weapons: 'wp',
  cantrips: 'ct',
  spellsKnown: 'sk',
  spellcastingAbility: 'sa',
  spellcastingClass: 'sx',
  equipment: 'eq',
  personalityTraits: 'pt',
  ideals: 'id',
  bonds: 'bo',
  flaws: 'fl',
  backstory: 'bs',
  age: 'ag',
  height: 'ht',
  weight: 'wt',
  eyes: 'ey',
  hair: 'hr',
  skin: 'sn',
  mark: 'mk',
  markSpirit: 'ms',
  virtue: 'vr',
  sin: 'si',
  humanity: 'hu',
  feat: 'fe',
  sessionNotes: 'nt',
  classes: 'cl',

  featuresTraits: 'ft',
  // Chiavi nuove e distinte, accanto a quelle di sempre: 'ft' e 'ar' restano
  // dove sono, quindi un link generato prima continua a decodificarsi intero.
  featureEntries: 'fx',
  armorId: 'ai',
  languages: 'lg',
  proficienciesOther: 'po',
  coins: 'co',
  currentHp: 'chp',
  speed: 'spd',
  size: 'sz',
  whacksLevel: 'wl',
  brawlingMoves: 'bm',
  misdeeds: 'md',
  spellsKnownLimit: 'skl',
}

const REVERSE_KEYS: Record<string, string> = Object.fromEntries(
  Object.entries(COMPACT_KEYS).map(([k, v]) => [v, k])
)

/** Set of allowed full-key property names (whitelist) */
const ALLOWED_KEYS = new Set(Object.keys(COMPACT_KEYS))

/** Create a compact representation of essential character data */
function compactCharacter(char: CharacterData): Record<string, unknown> {
  const compact: Record<string, unknown> = {}
  for (const [fullKey, shortKey] of Object.entries(COMPACT_KEYS)) {
    const val = (char as any)[fullKey]
    // Skip empty/default values to save space
    if (val === undefined || val === null || val === '' || val === 0 || val === false) continue
    if (Array.isArray(val) && val.length === 0) continue
    if (typeof val === 'object' && !Array.isArray(val)) {
      // For ability scores and racial bonuses, check if all zeros
      const vals = Object.values(val as Record<string, number>)
      if (vals.every(v => v === 0 || v === null || v === undefined)) continue
    }
    compact[shortKey] = val
  }
  return compact
}

/** Restore full keys from compact representation (whitelist-only) */
function expandCharacter(compact: Record<string, unknown>): Partial<CharacterData> {
  const expanded: Record<string, unknown> = {}
  for (const [shortKey, val] of Object.entries(compact)) {
    const fullKey = REVERSE_KEYS[shortKey]
    // Only accept keys that map to known CharacterData properties
    if (!fullKey || !ALLOWED_KEYS.has(fullKey)) continue
    expanded[fullKey] = val
  }
  return expanded as Partial<CharacterData>
}

/** Convert a UTF-8 string to base64 (modern, no deprecated escape/unescape) */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Convert base64 back to a UTF-8 string (modern, no deprecated escape/unescape) */
function base64ToUtf8(b64: string): string {
  const binary = atob(b64)
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Encode character data to a URL-safe string */
export function encodeCharacterToUrl(char: CharacterData): string {
  const compact = compactCharacter(char)
  const json = JSON.stringify(compact)
  const encoded = utf8ToBase64(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return encoded
}

/** Decode character data from URL-safe string */
export function decodeCharacterFromUrl(encoded: string): Partial<CharacterData> {
  if (encoded.length > MAX_SHARE_DATA_LENGTH) {
    throw new Error('Share data exceeds maximum allowed size')
  }
  // Restore base64 padding
  const padded = encoded
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const paddedWithEquals = padded + '='.repeat((4 - padded.length % 4) % 4)
  const json = base64ToUtf8(paddedWithEquals)
  const compact = JSON.parse(json)
  if (typeof compact !== 'object' || compact === null || Array.isArray(compact)) {
    throw new Error('Invalid share data format')
  }
  return expandCharacter(compact)
}

/** Generate a full share URL for the character */
export function generateShareUrl(char: CharacterData): string {
  const encoded = encodeCharacterToUrl(char)
  // Use history-mode URL: /dnd-character-builder/share/ENCODED
  const base = window.location.origin + '/dnd-character-builder'
  return `${base}/share/${encoded}`
}

/** Generate share URL and copy to clipboard. Returns { copied, url }. */
export async function copyShareUrl(char: CharacterData): Promise<{ copied: boolean; url: string }> {
  const url = generateShareUrl(char)
  try {
    await navigator.clipboard.writeText(url)
    return { copied: true, url }
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return { copied: success, url }
    } catch {
      return { copied: false, url }
    }
  }
}

/* ------------------------------------------------------------------ *
 * Formato compresso
 *
 * Il formato qui sopra — chiavi accorciate e base64 — produce da 4.300 a
 * 6.400 caratteri per un personaggio vero. Un QR code ne regge al massimo
 * 2.953: per starci dentro non basta accorciare le chiavi, serve comprimere.
 * Sgonfiato e ribase64ato lo stesso personaggio sta in 1.550-2.150 byte.
 *
 * Il formato vecchio resta e continua a decodificarsi: i link gia' condivisi
 * non devono smettere di funzionare. A distinguerli e' il marcatore iniziale,
 * che non appartiene all'alfabeto base64url e quindi non puo' comparire per
 * caso in testa a un link vecchio.
 * ------------------------------------------------------------------ */

/** Marca un payload compresso. Fuori dall'alfabeto base64url, e URL-safe. */
export const MARCATORE_COMPRESSO = '~'

function bytesToBase64Url(bytes: Uint8Array<ArrayBuffer>): string {
  let binario = ''
  for (const b of bytes) binario += String.fromCharCode(b)
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const raw = b64.replace(/-/g, '+').replace(/_/g, '/')
  const conPad = raw + '='.repeat((4 - raw.length % 4) % 4)
  return Uint8Array.from(atob(conPad), ch => ch.charCodeAt(0))
}

/** Vero se il browser sa comprimere. Safari sotto la 16.4 non sa. */
export function sappiamoComprimere(): boolean {
  return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined'
}

async function sgonfia(testo: string): Promise<Uint8Array<ArrayBuffer>> {
  const cs = new CompressionStream('deflate-raw')
  const w = cs.writable.getWriter()
  void w.write(new TextEncoder().encode(testo))
  void w.close()
  return new Uint8Array(await new Response(cs.readable).arrayBuffer())
}

async function rigonfia(bytes: Uint8Array<ArrayBuffer>): Promise<string> {
  const ds = new DecompressionStream('deflate-raw')
  const w = ds.writable.getWriter()
  void w.write(bytes)
  void w.close()
  return new TextDecoder().decode(await new Response(ds.readable).arrayBuffer())
}

/**
 * Codifica compressa dello stesso insieme di campi del formato lungo.
 *
 * `omettiTesti` lascia fuori i campi di testo libero — trascorsi, note di
 * sessione, tratti — che sono i piu' lunghi e i soli davvero comprimibili
 * fino a un certo punto. Serve a chi deve stare in un QR code e ha finito
 * lo spazio: meglio una scheda senza il racconto che nessun codice.
 */
export async function encodeCharacterCompressed(
  char: CharacterData,
  omettiTesti = false,
): Promise<string> {
  const compatto = compactCharacter(char)
  if (omettiTesti) {
    for (const campo of ['bs', 'nt', 'pt', 'id', 'bo', 'fl']) delete compatto[campo]
  }
  const bytes = await sgonfia(JSON.stringify(compatto))
  return MARCATORE_COMPRESSO + bytesToBase64Url(bytes)
}

/**
 * Decodifica un payload di entrambi i formati.
 *
 * Il marcatore decide: con, e' compresso; senza, e' un link di prima e passa
 * per la strada di sempre.
 */
export async function decodeCharacterAny(encoded: string): Promise<Partial<CharacterData>> {
  if (encoded.length > MAX_SHARE_DATA_LENGTH) {
    throw new Error('Share data exceeds maximum allowed size')
  }
  if (!encoded.startsWith(MARCATORE_COMPRESSO)) return decodeCharacterFromUrl(encoded)
  const json = await rigonfia(base64UrlToBytes(encoded.slice(MARCATORE_COMPRESSO.length)))
  const compatto = JSON.parse(json)
  if (typeof compatto !== 'object' || compatto === null || Array.isArray(compatto)) {
    throw new Error('Invalid share data format')
  }
  return expandCharacter(compatto)
}

/** La base di ogni link condiviso, senza il payload. */
export function baseCondivisione(): string {
  return `${window.location.origin}/dnd-character-builder/share/`
}
