/**
 * Character sharing via URL.
 * Compresses character JSON using base64 encoding into a URL hash.
 * Uses a compact format to minimize URL length.
 */
import type { CharacterData } from '@/stores/character'

/** Maximum encoded share URL data length (bytes). Prevents abuse / DoS. */
export const MAX_SHARE_DATA_LENGTH = 20_000

/** Compact keys for the most common character fields to reduce URL size */
const COMPACT_KEYS: Record<string, string> = {
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
  sessionNotes: 'nt',
  classes: 'cl',

  featuresTraits: 'ft',
  languages: 'lg',
  proficienciesOther: 'po',
  coins: 'co',
  currentHp: 'chp',
  speed: 'sp',
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
