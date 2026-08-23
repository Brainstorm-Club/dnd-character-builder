<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '@/stores/character'
import { modifier, proficiencyBonus } from '@/utils/calculations'
import { getEquipment } from '@/data'
import { useGameTerms } from '@/composables/useGameTerms'
import { getWeaponMastery } from '@/data/dnd2024/mastery'
import VariantPromo from '@/components/shared/VariantPromo.vue'

const { t, locale } = useI18n()
const characterStore = useCharacterStore()
const gt = useGameTerms()

const equipment = computed(() => getEquipment(characterStore.character.variant))
const customEquipment = ref('')

// Armatura e scudo non hanno una copia locale: si leggono e si scrivono
// direttamente sul personaggio. Una copia in più sarebbe stato un secondo
// percorso da tenere allineato, ed era proprio il disallineamento il difetto.
// Le armi la copia ce l'hanno perché qui servono come soli nomi, mentre
// `character.weapons` porta anche bonus e danno, ricalcolati a ogni tocco.
const selectedWeapons = ref<string[]>([])

function restoreWeapons() {
  selectedWeapons.value = characterStore.character.weapons.map(w => w.name)
}
restoreWeapons()

// `<KeepAlive>` in BuilderView non rimonta il passo fra un avanti e un indietro,
// ma caricare una scheda salvata, rientrare nel builder o importare un JSON
// sostituisce l'intero personaggio: partendo da un elenco vuoto il primo clic
// riscriveva `character.weapons` da zero, cancellando le armi già scelte.
watch(() => characterStore.character.id, () => restoreWeapons())

// D&D 2024: barbaro, guerriero, ladro, paladino e ranger sbloccano la
// proprietà di padronanza delle armi che impugnano. Mostrarla accanto
// all'arma è l'unico modo perché il giocatore la veda quando sceglie.
const MASTERY_CLASSES = ['barbarian', 'fighter', 'rogue', 'paladin', 'ranger']

function masteryLabel(weaponName: string): string {
  if (characterStore.character.variant !== 'dnd2024') return ''
  if (!MASTERY_CLASSES.includes(characterStore.character.className)) return ''
  const m = getWeaponMastery(weaponName)
  return m ? ` · ${locale.value === 'it' ? m.nameIt : m.name}` : ''
}

function toggleWeapon(weaponName: string) {
  const idx = selectedWeapons.value.indexOf(weaponName)
  if (idx >= 0) {
    selectedWeapons.value.splice(idx, 1)
  } else {
    selectedWeapons.value.push(weaponName)
  }
  updateCharacterWeapons()
}

function updateCharacterWeapons() {
  characterStore.character.weapons = selectedWeapons.value.map(name => {
    const wpn = [...(equipment.value?.simpleWeapons || []), ...(equipment.value?.martialWeapons || [])]
      .find(w => w.name === name)
    // Ranged and finesse weapons key off Dexterity; everything else off
    // Strength. A weapon stored with a bonus of 0 would print +0 on the sheet.
    const props = wpn?.properties ?? []
    const ranged = props.some(p => p.startsWith('ammunition'))
    const bonuses = characterStore.character.racialBonuses
    const scores = characterStore.character.abilityScores
    const strMod = modifier(scores.str + (bonuses.str || 0))
    const dexMod = modifier(scores.dex + (bonuses.dex || 0))
    const abilityMod = ranged || (props.includes('finesse') && dexMod > strMod) ? dexMod : strMod
    const damage = wpn?.damage || ''
    return {
      name,
      attackBonus: proficiencyBonus(characterStore.character.level) + abilityMod,
      damage: damage && abilityMod !== 0
        ? `${damage}${abilityMod > 0 ? '+' : ''}${abilityMod}`
        : damage,
    }
  })
}

function selectArmor(armorName: string) {
  characterStore.character.armor = armorName
}

function toggleShield() {
  characterStore.character.shield = !characterStore.character.shield
}

function addCustomItem() {
  if (customEquipment.value.trim()) {
    characterStore.character.equipment.push(customEquipment.value.trim())
    customEquipment.value = ''
  }
}

function removeItem(idx: number) {
  characterStore.character.equipment.splice(idx, 1)
}
</script>

<template>
  <section aria-labelledby="equipment-heading">
    <h2 id="equipment-heading" class="text-2xl font-bold text-amber-500 mb-6">{{ t('equipment.title') }}</h2>

    <!-- Weapons -->
    <div class="mb-6">
      <h3 id="weapons-heading" class="text-lg font-semibold text-stone-300 mb-3">{{ t('equipment.weapons') }}</h3>

      <div v-if="equipment?.simpleWeapons?.length" class="mb-4">
        <h4 id="simple-weapons-heading" class="text-sm font-medium text-stone-400 mb-2">{{ t('equipment.simpleWeapons') }}</h4>
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('equipment.simpleWeapons')">
          <button
            v-for="wpn in equipment.simpleWeapons"
            :key="wpn.name"
            @click="toggleWeapon(wpn.name)"
            class="px-3 py-1 rounded text-xs transition-colors cursor-pointer"
            :class="selectedWeapons.includes(wpn.name)
              ? 'bg-amber-600 text-stone-900 font-medium'
              : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
            :aria-pressed="selectedWeapons.includes(wpn.name)"
          >
            {{ gt.weapon(wpn.name) }} ({{ wpn.damage }}){{ masteryLabel(wpn.name) }}
          </button>
        </div>
      </div>

      <div v-if="equipment?.martialWeapons?.length">
        <h4 id="martial-weapons-heading" class="text-sm font-medium text-stone-400 mb-2">{{ t('equipment.martialWeapons') }}</h4>
        <div class="flex flex-wrap gap-2" role="group" :aria-label="t('equipment.martialWeapons')">
          <button
            v-for="wpn in equipment.martialWeapons"
            :key="wpn.name"
            @click="toggleWeapon(wpn.name)"
            class="px-3 py-1 rounded text-xs transition-colors cursor-pointer"
            :class="selectedWeapons.includes(wpn.name)
              ? 'bg-amber-600 text-stone-900 font-medium'
              : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
            :aria-pressed="selectedWeapons.includes(wpn.name)"
          >
            {{ gt.weapon(wpn.name) }} ({{ wpn.damage }}){{ masteryLabel(wpn.name) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Armor -->
    <div class="mb-6">
      <h3 id="armor-heading" class="text-lg font-semibold text-stone-300 mb-3">{{ t('equipment.armor') }}</h3>
      <div class="flex flex-wrap gap-2" role="radiogroup" :aria-label="t('equipment.armor')">
        <button
          v-for="arm in equipment?.armor || []"
          :key="arm.name"
          @click="selectArmor(arm.name)"
          class="px-3 py-1 rounded text-xs transition-colors cursor-pointer"
          :class="characterStore.character.armor === arm.name
            ? 'bg-amber-600 text-stone-900 font-medium'
            : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
          role="radio"
          :aria-checked="characterStore.character.armor === arm.name"
        >
          {{ gt.armorName(arm.name) }} ({{ t('review.ac') }} {{ arm.baseAC }})
        </button>
        <button
          @click="toggleShield()"
          class="px-3 py-1 rounded text-xs transition-colors cursor-pointer"
          :class="characterStore.character.shield ? 'bg-amber-600 text-stone-900 font-medium' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'"
          :aria-pressed="characterStore.character.shield"
        >
          {{ t('review.shieldBonus') }}
        </button>
      </div>
    </div>

    <!-- Coins -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-stone-300 mb-3">{{ t('equipment.coins') }}</h3>
      <div class="flex gap-4" role="group" :aria-label="t('equipment.coins')">
        <div v-for="coin in ['gp', 'sp', 'cp'] as const" :key="coin" class="flex items-center gap-1">
          <label :for="`coin-${coin}`" class="text-xs text-stone-400 uppercase">{{ coin }}</label>
          <input :id="`coin-${coin}`" type="number" v-model.number="characterStore.character.coins[coin]" min="0"
            class="w-16 bg-stone-700 text-stone-200 rounded px-2 py-1 text-sm text-center" :aria-label="`${coin.toUpperCase()}`" />
        </div>
      </div>
    </div>

    <!-- Custom Equipment -->
    <div>
      <h3 id="other-equipment-heading" class="text-lg font-semibold text-stone-300 mb-3">{{ t('equipment.other') }}</h3>
      <div class="flex gap-2 mb-3">
        <label for="custom-equipment" class="sr-only">{{ t('equipment.addItem') }}</label>
        <input id="custom-equipment" v-model="customEquipment" @keyup.enter="addCustomItem"
          class="flex-1 bg-stone-700 text-stone-200 rounded px-3 py-1 text-sm" :placeholder="t('equipment.addItem')" />
        <button @click="addCustomItem" :aria-label="t('equipment.addItem')"
          class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-stone-900 rounded text-sm font-medium cursor-pointer">+</button>
      </div>
      <ul class="flex flex-wrap gap-2" role="list" :aria-label="t('equipment.other')">
        <li v-for="(item, idx) in characterStore.character.equipment" :key="idx"
          class="px-2 py-1 bg-stone-700 rounded text-xs text-stone-300 flex items-center gap-1">
          {{ item }}
          <button @click="removeItem(idx)" class="text-stone-500 hover:text-red-400 cursor-pointer" :aria-label="`${t('common.remove')} ${item}`">&times;</button>
        </li>
      </ul>
    </div>

    <VariantPromo :variant="characterStore.character.variant" />
  </section>
</template>
