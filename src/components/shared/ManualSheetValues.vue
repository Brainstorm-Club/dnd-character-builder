<script setup lang="ts">
/**
 * I valori che il generatore normalmente deriva, resi scrivibili a mano.
 *
 * Serve a chi ha già una scheda — di carta, di un'altra app, di una campagna
 * cominciata altrove — e vuole ricopiarla invece di rigenerarla. Lì i punti
 * ferita vengono dai dadi tirati al tavolo, la CA da un usbergo incantato che
 * qui non esiste, le competenze da un talento: ricalcolarli significherebbe
 * scrivere numeri diversi da quelli che il giocatore ha davanti.
 *
 * I punteggi di caratteristica non sono qui: si scrivono nel passo
 * Caratteristiche, col metodo "A mano".
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import type { AbilityScores } from '@/stores/character'
import { computeArmorClass, feetToMeters } from '@/utils/calculations'
import { useGameTerms } from '@/composables/useGameTerms'
import { SKILLS } from '@/data/dnd5e/skills'

const { t } = useI18n()
const characterStore = useCharacterStore()
const gt = useGameTerms()

const char = computed(() => characterStore.character)

const abilities: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** Numero ripulito: il campo `type="number"` accetta vuoto, testo e decimali. */
function toInt(raw: string, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}

/**
 * Scrivere i PF a mano alza `hpManual`: da lì in poi il ricalcolo integrale
 * (cambio di livello, di classe, rimozione di un multiclasse) li lascia stare.
 * Le salite di livello continuano ad aggiungere il loro incremento, che è
 * quello che succede anche al tavolo.
 */
function setMaxHp(raw: string) {
  char.value.maxHp = toInt(raw, 1, 999, char.value.maxHp)
  char.value.hpManual = true
  // I PF attuali seguono il massimo finché nessuno li ha toccati: una scheda
  // appena trascritta è a pieni PF, non a zero.
  if (char.value.currentHp === 0 || char.value.currentHp > char.value.maxHp) {
    char.value.currentHp = char.value.maxHp
  }
}

function setCurrentHp(raw: string) {
  char.value.currentHp = toInt(raw, 0, 999, char.value.currentHp)
  char.value.hpManual = true
}

function setTempHp(raw: string) {
  char.value.tempHp = toInt(raw, 0, 999, char.value.tempHp)
}

/** Torna ai PF calcolati da dado vita, Costituzione e livello. */
function recomputeHp() {
  char.value.hpManual = false
  characterStore.syncClassAndLevel()
}

/** CA calcolata dall'equipaggiamento, cioè quella che si avrebbe senza il valore a mano. */
const computedAc = computed(() =>
  computeArmorClass({ ...char.value, armorClassOverride: 0 }),
)

function setAc(raw: string) {
  char.value.armorClassOverride = toInt(raw, 0, 99, char.value.armorClassOverride ?? 0)
}

function setSpeed(raw: string) {
  char.value.speed = toInt(raw, 0, 200, char.value.speed)
}

function setXp(raw: string) {
  char.value.experiencePoints = toInt(raw, 0, 999_999, char.value.experiencePoints)
}

// ── Competenze ──────────────────────────────────────────────────────────────
// Classe e background ne concedono già un elenco; qui si aggiunge o si toglie
// quello che la scheda dice in più o in meno (un talento, una scelta fatta al
// tavolo). Entrambi i passi rimuovono solo ciò che hanno concesso loro, quindi
// quello che si spunta qui sopravvive a un ritorno indietro nel wizard.

function toggleSave(ability: keyof AbilityScores) {
  const list = char.value.savingThrowProficiencies
  const idx = list.indexOf(ability)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(ability)
}

function toggleSkill(skillId: string) {
  const list = char.value.skillProficiencies
  const idx = list.indexOf(skillId)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(skillId)
}

const skills = computed(() =>
  SKILLS.map(s => ({ id: s.id, label: gt.skill(s.name) })),
)
</script>

<template>
  <section
    class="mt-6 bg-stone-800 border border-stone-700 rounded-lg p-4"
    aria-labelledby="manual-values-heading"
  >
    <h3 id="manual-values-heading" class="font-gothic font-semibold text-stone-300">
      {{ t('manual.title') }}
    </h3>
    <p class="text-xs text-stone-500 mt-1 mb-4">{{ t('manual.hint') }}</p>

    <!-- Punti ferita -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bsc-field gap-1">
        <label for="manual-max-hp" class="font-semibold">{{ t('review.maxHp') }}</label>
        <input
          id="manual-max-hp" type="number" min="1" max="999" inputmode="numeric"
          :value="char.maxHp"
          @input="setMaxHp(($event.target as HTMLInputElement).value)"
          class="bsc-input bg-stone-900 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div class="bsc-field gap-1">
        <label for="manual-current-hp" class="font-semibold">{{ t('manual.currentHp') }}</label>
        <input
          id="manual-current-hp" type="number" min="0" max="999" inputmode="numeric"
          :value="char.currentHp"
          @input="setCurrentHp(($event.target as HTMLInputElement).value)"
          class="bsc-input bg-stone-900 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div class="bsc-field gap-1">
        <label for="manual-temp-hp" class="font-semibold">{{ t('manual.tempHp') }}</label>
        <input
          id="manual-temp-hp" type="number" min="0" max="999" inputmode="numeric"
          :value="char.tempHp"
          @input="setTempHp(($event.target as HTMLInputElement).value)"
          class="bsc-input bg-stone-900 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>

    <p v-if="char.hpManual" class="mt-2 text-xs text-amber-400 flex items-center gap-2 flex-wrap">
      <span>{{ t('manual.hpManualNotice') }}</span>
      <button
        type="button" @click="recomputeHp"
        class="px-2 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded cursor-pointer"
      >{{ t('manual.recomputeHp') }}</button>
    </p>
    <p v-else class="mt-2 text-xs text-stone-500">
      {{ t('manual.hpAutoNotice', { die: `${char.level}d${char.hitDie}` }) }}
    </p>

    <!-- CA, velocità, esperienza -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <div class="bsc-field gap-1">
        <label for="manual-ac" class="font-semibold">{{ t('review.ac') }}</label>
        <input
          id="manual-ac" type="number" min="0" max="99" inputmode="numeric"
          :value="char.armorClassOverride || 0"
          @input="setAc(($event.target as HTMLInputElement).value)"
          class="bsc-input bg-stone-900 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
        />
        <p class="bsc-field-hint text-xs">{{ t('manual.acHint', { ac: computedAc }) }}</p>
      </div>

      <div class="bsc-field gap-1">
        <label for="manual-speed" class="font-semibold">{{ t('review.speed') }}</label>
        <input
          id="manual-speed" type="number" min="0" max="200" step="5" inputmode="numeric"
          :value="char.speed"
          @input="setSpeed(($event.target as HTMLInputElement).value)"
          class="bsc-input bg-stone-900 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
        />
        <p class="bsc-field-hint text-xs">{{ feetToMeters(char.speed) }}m</p>
      </div>

      <div class="bsc-field gap-1">
        <label for="manual-xp" class="font-semibold">{{ t('manual.experiencePoints') }}</label>
        <input
          id="manual-xp" type="number" min="0" max="999999" inputmode="numeric"
          :value="char.experiencePoints"
          @input="setXp(($event.target as HTMLInputElement).value)"
          class="bsc-input bg-stone-900 border-stone-700 rounded-lg text-stone-200 focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Competenze: chiuse di default, sono già decise da classe e background -->
    <details class="mt-4">
      <summary class="cursor-pointer text-sm font-semibold text-stone-300">
        {{ t('manual.proficiencies') }}
      </summary>
      <p class="text-xs text-stone-500 mt-2">{{ t('manual.proficienciesHint') }}</p>

      <h4 class="text-sm font-medium text-stone-400 mt-3 mb-2">{{ t('review.savingThrows') }}</h4>
      <div class="flex flex-wrap gap-2" role="group" :aria-label="t('review.savingThrows')">
        <button
          v-for="ability in abilities" :key="ability" type="button"
          @click="toggleSave(ability)"
          :aria-pressed="char.savingThrowProficiencies.includes(ability)"
          class="px-3 py-1 rounded text-xs transition-colors cursor-pointer"
          :class="char.savingThrowProficiencies.includes(ability)
            ? 'bg-amber-600 text-stone-900 font-medium'
            : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
        >{{ t(`abilities.${ability}`) }}</button>
      </div>

      <h4 class="text-sm font-medium text-stone-400 mt-4 mb-2">{{ t('review.skills') }}</h4>
      <div class="flex flex-wrap gap-2" role="group" :aria-label="t('review.skills')">
        <button
          v-for="skill in skills" :key="skill.id" type="button"
          @click="toggleSkill(skill.id)"
          :aria-pressed="char.skillProficiencies.includes(skill.id)"
          class="px-3 py-1 rounded text-xs transition-colors cursor-pointer"
          :class="char.skillProficiencies.includes(skill.id)
            ? 'bg-amber-600 text-stone-900 font-medium'
            : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
        >{{ skill.label }}</button>
      </div>
    </details>
  </section>
</template>
