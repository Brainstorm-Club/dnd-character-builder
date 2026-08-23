/**
 * Il bonus di attacco di un'arma, in un posto solo.
 *
 * Prima questa regola era scritta due volte — nel passo Equipaggiamento e nel
 * generatore casuale — e le due copie non dicevano la stessa cosa. Il
 * generatore, per le classi da Destrezza, metteva la Destrezza secca su ogni
 * arma accurata, anche a chi aveva la Forza migliore; e il danno usciva nudo
 * di qua ('1d8') e col modificatore di là ('1d8+3'), così la stessa arma
 * finiva sul PDF in due modi a seconda di come era nato il personaggio.
 *
 * Vale la regola del manuale: l'arma accurata dice che PUOI usare la Destrezza
 * al posto della Forza, quindi chi impugna sceglie la migliore delle due.
 *
 * Qui dentro non entrano né Vue né lo store: si passano i dati dell'arma e i
 * modificatori, si riceve il risultato. È l'unico modo perché la stessa
 * correzione non vada scritta due volte.
 */

/** La caratteristica con cui si tira l'attacco. */
export type CaratteristicaAttacco = 'str' | 'dex'

/** I dati dell'arma che servono al calcolo, così come stanno nel catalogo. */
export interface ArmaBase {
  readonly name: string
  /** Il dado nudo, es. '1d8'. Senza modificatore: quello lo aggiunge il calcolo. */
  readonly damage: string
  readonly properties: readonly string[]
}

/** Quel che il personaggio porta al tiro: i due modificatori e la competenza. */
export interface ModificatoriAttacco {
  readonly strMod: number
  readonly dexMod: number
  readonly proficiencyBonus: number
  /**
   * Vero per un monaco: Arti Marziali gli lascia usare la Destrezza al posto
   * della Forza con le armi da monaco. Senza questo, il bastone ferrato di un
   * monaco tirava di Forza — ed è il motivo per cui due personaggi pronti
   * risultavano "sbagliati" mentre erano il codice a non conoscere la regola.
   */
  readonly artiMarziali?: boolean
}

/**
 * Il risultato, nella forma in cui finisce in `character.weapons`.
 * Combacia con l'interfaccia `Weapon` dello store senza importarla, così il
 * dominio resta indipendente dal negozio dei dati.
 */
export interface AttaccoArma {
  name: string
  attackBonus: number
  damage: string
}

/**
 * Un'arma è a distanza se consuma munizioni. Il lancio (`thrown`) non conta:
 * l'arma da lancio tira con la caratteristica del corpo a corpo, ed era il
 * motivo per cui pugnale e giavellotto non potevano essere trattati uguali.
 */
export function isADistanza(properties: readonly string[]): boolean {
  return properties.some(p => p.trim().toLowerCase().startsWith('ammunition'))
}

/** Accurata: `finesse` nei dati SRD. */
export function isAccurata(properties: readonly string[]): boolean {
  return properties.some(p => p.trim().toLowerCase() === 'finesse')
}

/**
 * Arma da monaco: arma semplice da mischia che non sia pesante né a due mani,
 * più la spada corta. Arti Marziali lascia usare la Destrezza al posto della
 * Forza con queste, ed è il motivo per cui il bastone ferrato di un monaco
 * tira con la Destrezza pur non essendo un'arma accurata.
 */
export function isArmaDaMonaco(nome: string, properties: readonly string[]): boolean {
  if (nome.trim().toLowerCase() === 'shortsword') return true
  if (isADistanza(properties)) return false
  const p = properties.map(x => x.trim().toLowerCase())
  return !p.includes('heavy') && !p.includes('two-handed')
}

/**
 * A distanza si tira con la Destrezza; con l'arma accurata — e con l'arma da
 * monaco in mano a un monaco — si sceglie la caratteristica migliore delle
 * due; per tutto il resto vale la Forza.
 */
export function caratteristicaAttacco(
  properties: readonly string[],
  strMod: number,
  dexMod: number,
  opzioni: { armaDaMonaco?: boolean } = {},
): CaratteristicaAttacco {
  if (isADistanza(properties)) return 'dex'
  if ((isAccurata(properties) || opzioni.armaDaMonaco) && dexMod > strMod) return 'dex'
  return 'str'
}

/** Il solo modificatore di caratteristica applicato al tiro e al danno. */
export function modificatoreAttacco(
  properties: readonly string[],
  strMod: number,
  dexMod: number,
  opzioni: { armaDaMonaco?: boolean } = {},
): number {
  return caratteristicaAttacco(properties, strMod, dexMod, opzioni) === 'dex' ? dexMod : strMod
}

/**
 * Il danno stampato sulla scheda porta il modificatore, perché la scheda è
 * quel che il giocatore tira al tavolo: '1d8+3', non '1d8'. Con modificatore
 * zero resta il dado nudo, che un '+0' in colonna danno è solo rumore.
 */
export function formattaDanno(danno: string, mod: number): string {
  if (!danno || mod === 0) return danno
  return `${danno}${mod > 0 ? '+' : ''}${mod}`
}

/**
 * Il calcolo completo: bonus di attacco (competenza + caratteristica) e
 * stringa del danno. Dà per scontata la competenza nell'arma, come facevano
 * entrambe le implementazioni che questa funzione sostituisce.
 */
export function calcolaAttacco(arma: ArmaBase, mods: ModificatoriAttacco): AttaccoArma {
  const daMonaco = mods.artiMarziali === true && isArmaDaMonaco(arma.name, arma.properties)
  const mod = modificatoreAttacco(arma.properties, mods.strMod, mods.dexMod, { armaDaMonaco: daMonaco })
  return {
    name: arma.name,
    attackBonus: mods.proficiencyBonus + mod,
    damage: formattaDanno(arma.damage, mod),
  }
}

/**
 * Come `calcolaAttacco`, ma partendo dal solo nome: è il caso del passo
 * Equipaggiamento, dove il giocatore sceglie i nomi e il resto va cercato nel
 * catalogo. Un nome che nel catalogo non c'è (arma scritta a mano, dati di una
 * variante diversa) non fa saltare il conto: vale come arma senza proprietà,
 * quindi Forza e danno vuoto.
 */
export function attaccoPerNome(
  name: string,
  catalogo: readonly ArmaBase[],
  mods: ModificatoriAttacco,
): AttaccoArma {
  const arma = catalogo.find(w => w.name === name)
  return calcolaAttacco(arma ?? { name, damage: '', properties: [] }, mods)
}

/**
 * Ricalcola le armi già in scheda.
 *
 * Serve perché bonus e danno stanno MEMORIZZATI dentro `character.weapons`:
 * quando sale il bonus di competenza — o cambia una caratteristica — il numero
 * scritto nell'arma resta quello vecchio e finisce così sul PDF. Chi cambia il
 * livello o i punteggi deve richiamare questa funzione.
 *
 * Le armi che nel catalogo non ci sono restano intatte: del loro dado di danno
 * non sappiamo nulla, e riscriverle a mani vuote cancellerebbe quel che il
 * giocatore ha inserito.
 */
export function ricalcolaArmi(
  weapons: readonly AttaccoArma[],
  catalogo: readonly ArmaBase[],
  mods: ModificatoriAttacco,
): AttaccoArma[] {
  return weapons.map(w => {
    const arma = catalogo.find(c => c.name === w.name)
    return arma ? calcolaAttacco(arma, mods) : { ...w }
  })
}
