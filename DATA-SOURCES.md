# Data sources

This builder ships game data for three settings. This page records where each
piece comes from, so the licensing position is legible rather than assumed.

## D&D 5e — 2014 rules

Most of the data is transcribed from the **System Reference Document 5.1**,
published by Wizards of the Coast under the Open Gaming License 1.0a. That
covers all 317 spells' level, school, casting time, range, components,
duration and class lists, the equipment tables with list prices, the classes
and their features, and 9 races.

**Some of it is not in the SRD.** The following come from the 2014 *Player's
Handbook* and are used here for reference:

| What | Detail |
|------|--------|
| 2 spells | Blade Ward, Hex |
| 12 backgrounds | The SRD contains only Acolyte |
| Several subraces | The SRD contains one subrace per race at most |

**That row used to say thirteen spells.** It listed Blade Ward, Compulsion,
Counterspell, Druidcraft, Eldritch Blast, Fire Bolt, Guardian of Faith,
Hellish Rebuke, Hex, Hunter's Mark, Poison Spray, Spare the Dying and Vicious
Mockery. The number was established by matching all thirteen ids against the
index of the **Italian** SRD 5.1 compendium (see *Italian spell text* below):
eleven of them are in it — Compulsione, Controincantesimo, Artificio druidico,
Deflagrazione occulta, Dardo di fuoco, Guardiano della fede, Intimorire
infernale, Marchio del cacciatore, Spruzzo velenoso, Salvare i morenti, Beffa
crudele — and only *Blade Ward* and *Hex* are genuinely absent. The check is a
test, not a claim: `src/data/spells-it.test.ts` re-derives the two from the
data and fails if the list moves.

If the project needs to sit strictly inside the OGL, that material has to
come out. It is deliberately listed here rather than left implicit.

English spell descriptions are the opening sentences of the manual text, not
paraphrases; the **Italian** text is the whole entry (see below). Class feature
descriptions are summaries.

## D&D 2024 — SRD 5.2.1

Variante separata da quella 2014, non una sua sostituzione. Due ragioni
concrete: le sottoclassi di Brancalonia e Apocalisse citano privilegi che
nel 2024 non esistono più (i punti ki del monaco, Deviare Proiettili), e
`variant` è salvato nelle schede e nei link di condivisione, quindi
ridefinire `dnd5e` avrebbe trasformato ogni personaggio già salvato.

Dati trascritti dal **System Reference Document 5.2.1**, pubblicato da
Wizards of the Coast sotto licenza CC-BY-4.0:

| Cosa | Quanto |
|------|--------|
| Specie | 9 — senza bonus di caratteristica, che nel 2024 dà il background |
| Discendenze | 24, modellate come sottorazze (draghi, lignaggi elfici, giganti, retaggi) |
| Background | 4, ciascuno con tre caratteristiche e un talento d'origine |
| Classi | 12, con 248 privilegi dal 1° al 20° e una sottoclasse ciascuna |
| Talenti | 16: 3 d'origine, 2 generali, 4 di stile di combattimento, 7 doni epici |
| Padronanza d'armi | Le 8 proprietà, assegnate a 36 armi su 37 |

Gli incantesimi non sono duplicati: la variante riusa i 317 del 2014
applicando gli scostamenti dell'SRD 5.2.1 — 58 liste di classe cambiate e
2 incantesimi usciti — e aggiunge i 23 che esistono solo nel 2024. La
lista è completa rispetto all'SRD.

La rete è l'unica arma senza padronanza: nel manuale ha solo la proprietà
Speciale. L'SRD contiene una sola sottoclasse per classe; le altre stanno
nel Player's Handbook.

I nomi italiani dei privilegi vengono dall'edizione italiana dell'SRD
5.2.1 (`IT_SRD_CC_v5.2.1`).

La colonna **Incantesimi preparati** delle otto classi incantatrici
(`src/data/dnd2024/prepared.ts`) viene dalle stesse tabelle di classe
dell'SRD 5.2.1 italiano, estratte con `pdftotext -layout` e già verificate
nel pacchetto dati di [dnd-companion](https://github.com/Brainstorm-Club/dnd-companion);
`scripts/import-prepared-2024.ts` la trascrive da lì senza reinterpretarla.
Nel 2024 quel numero è stampato livello per livello e non è più la formula
2014 «modificatore + livello», che resta in uso per `dnd5e`, Brancalonia e
Apocalisse.

> Quest'opera include materiale tratto dal System Reference Document 5.2.1
> («SRD 5.2.1») di Wizards of the Coast LLC, disponibile all'indirizzo
> https://www.dndbeyond.com/srd. L'SRD 5.2.1 è concesso in licenza ai sensi
> della licenza Creative Commons Attribuzione 4.0 Internazionale, disponibile
> all'indirizzo https://creativecommons.org/licenses/by/4.0/legalcode.

## Italian spell text — SRD 5.1 e SRD 5.2.1 italiani

I **nomi** degli incantesimi erano tradotti da tempo (`src/i18n/gameTerms.ts`,
351 voci); il **testo** no. Le descrizioni inglesi qui sopra sono le prime
frasi del manuale: bastano a costruire un personaggio, non a giocarlo — manca
proprio la parte che serve quando l'incantesimo si usa.

`src/data/dnd5e/spells-it.ts` e `src/data/dnd2024/spells-it.ts` portano il
testo **integrale in italiano**, preso dalle edizioni italiane degli SRD:

| Edizione | Fonte | Coperti |
|----------|-------|---------|
| 2014 | SRD 5.1 italiano | 315 su 317 — mancano *Blade Ward* e *Hex* |
| 2024 | SRD 5.2.1 italiano | 338 su 338 |

I due senza testo restano con la descrizione inglese: non si inventa nulla e
non si copia dal *Player's Handbook*, che non è ridistribuibile.

I due file sono **generati**, non scritti a mano:

```
node scripts/import-spells-it.mjs [--companion <percorso>]
node scripts/import-spells-it.mjs --check      # in CI: fallisce se sono disallineati
```

La fonte è il compendio di [dnd-companion](https://github.com/Brainstorm-Club/dnd-companion),
che sta fuori da questo repository (`--companion`, o `DND_COMPANION_DIR`, o il
percorso standard `../brainstorm/dnd-companion`). L'aggancio fra l'id inglese
del builder e il record italiano è il `ponte.json` del compendio. Lo script è
deterministico: stesso compendio, stesso file byte per byte.

Sono ~600 KB di prosa, il blocco di dati più grosso dell'app: stanno in due
chunk a sé (`game-dnd5e-spells-it`, `game-dnd24-spells-it`) importati solo con
interfaccia italiana, solo nel passo incantesimi, solo per la variante in uso.
Il bundle iniziale non cambia.

### Attribuzione CC-BY-4.0

Entrambi gli SRD italiani sono sotto **Creative Commons Attribuzione 4.0
Internazionale**, che richiede l'attribuzione nella forma pubblicata
dall'editore. Le due dichiarazioni sono riportate **verbatim** qui e nella
pagina Crediti dell'app (`/credits`, `src/views/CreditsView.vue`), oltre che in
calce al testo dentro il riquadro di dettaglio di ogni incantesimo.

> Questo lavoro include materiale del System Reference Document 5.1 (“SRD 5.1”) di Wizards of the Coast LLC
> disponibile al sito https://dnd.wizards.com/it/resources/systems-reference-document. L'SRD 5.1 è concesso in
> licenza sotto l'Attribuzione 4.0 Internazionale di Creative Commons disponibile al sito
> https://creativecommons.org/licenses/by/4.0/legalcode.it.

> Quest'opera include materiale tratto dal System Reference Document 5.2.1 ("SRD 5.2.1") di Wizards of the Coast
> LLC, disponibile all'indirizzo https://www.dndbeyond.com/srd. Il SRD 5.2.1 è concesso in licenza ai sensi
> della licenza di attribuzione 4.0 Internazionale di Creative Commons, disponibile all'indirizzo
> https://creativecommons.org/licenses/by/4.0/legalcode.

Nota: la sezione *D&D 2024* qui sopra riporta la stessa dichiarazione 5.2.1
riscritta con le virgolette caporali. Quella lì vale per i privilegi e le
tabelle; questa è la forma verbatim, ed è quella che l'app mostra.

### Come è stato estratto il testo (e come si sbagliava prima)

Vale per questo testo e per ogni altra estrazione da PDF di questo progetto,
`CLAUDE.md` compreso.

Il difetto noto — «sessanta descrizioni su 307 illeggibili», commit `2807243` —
viene dall'**intreccio delle colonne** di `pdftotext -layout`: su una pagina a
due colonne quel flag conserva la posizione orizzontale e cuce insieme la riga
di sinistra e quella di destra, per cui una frase comincia a metà di un'altra.

Togliere `-layout` non è la soluzione, ma non è nemmeno il disastro che sembra:
senza flag l'ordine di lettura è **giusto quasi ovunque**. Il residuo è
circoscritto e sempre lo stesso — su una decina di pagine per edizione il
riquadro colorato dell'intestazione di scuola esce dal flusso del testo e
finisce a valle del corpo, attaccando a un incantesimo l'intestazione di quello
dopo. Difetto raro ma velenoso, perché produce record plausibili e sbagliati.

La soluzione è **`-bbox-layout`**: restituisce ogni parola con le sue
coordinate, si ricostruiscono le colonne dalle `x` e si legge ciascuna dall'alto
in basso. Le intestazioni fuori flusso si riconoscono dalla posizione e non
dall'aspetto del testo, e vengono anche i rientri di capoverso, che
l'estrazione piatta butta via. È il metodo con cui è stato prodotto il
compendio da cui questi due file arrivano.

## Condizioni

Le quindici condizioni di ciascuna edizione — nome e testo in italiano — arrivano
dai pacchetti regole di [dnd-companion](https://github.com/Brainstorm-Club/dnd-companion),
`data/rules/2014.json` e `data/rules/2024.json`, estratti dalle edizioni italiane
degli SRD sotto licenza **CC-BY-4.0**. Le trascrive `scripts/import-conditions.mjs`
in `src/data/dnd5e/conditions.ts` (SRD 5.1) e `src/data/dnd2024/conditions.ts`
(SRD 5.2.1): sono file generati, si rigenerano invece di modificarli a mano.
Brancalonia e Apocalisse poggiano sulle regole 2014 e usano le condizioni del 2014.

Il resto dei dati 2014 di questo repository sta sotto OGL 1.0a (vedi sopra); il
testo delle condizioni no: viene dall'edizione italiana dell'SRD 5.1, che Wizards
of the Coast pubblica sotto CC-BY-4.0, e per questo porta l'attribuzione qui sotto.

**Quattro condizioni del 2014 non hanno testo.** L'Appendice A dell'SRD 5.1 italiano
è mutila: si ferma a «Privo di sensi», e **Prono, Spaventato, Stordito e Trattenuto
non ci sono**. Nei dati la loro descrizione è `null` e l'app mostra il nome
dichiarando che il testo manca. Non sono state riscritte né prese in prestito dal
2024, che le definisce con regole diverse: sarebbe un'altra edizione spacciata per
questa.

**«Incapacitato» nel 2024 ha un errore di traduzione.** La voce dell'SRD 5.2.1
italiano si apre dicendo «ha la condizione "paralizzato"»; nell'originale la
condizione è «incapacitated», e il resto della voce è corretto. Il testo resta
**verbatim** — una fonte si cita, non si corregge — con accanto una nota redazionale
dell'app (campo `note`, non della fonte), che l'interfaccia mostra staccata dal testo
dell'SRD.

Attribuzione dell'SRD 5.1, come richiesta dalla licenza:

> Questo lavoro include materiale del System Reference Document 5.1 (“SRD 5.1”) di
> Wizards of the Coast LLC disponibile al sito
> https://dnd.wizards.com/it/resources/systems-reference-document. L'SRD 5.1 è
> concesso in licenza sotto l'Attribuzione 4.0 Internazionale di Creative Commons
> disponibile al sito https://creativecommons.org/licenses/by/4.0/legalcode.it.

Per le condizioni del 2024 vale l'attribuzione dell'SRD 5.2.1 riportata più sopra.

## Le fonti in breve

| Variante | Regole | Fonte |
|----------|--------|-------|
| D&D 5e | 2014 | SRD 5.1 (OGL) + Player's Handbook |
| D&D 2024 | 2024 | SRD 5.2.1 (CC-BY-4.0) |
| Brancalonia | 2014 | Manuale di Ambientazione, Macaronicon, L'Impero |
| Apocalisse | 2014 | John's Guide to the Armageddon |

## Brancalonia

Data transcribed from the manuals published by [Acheron Games](https://www.drivethrurpg.com/en/publisher/9086/acheron-games?affiliate_id=2960765):

- **Manuale di Ambientazione 2.6** — races, subclasses, backgrounds, the Brawl
  system (whacks, moves, class moves, aces in the hole), currency, Emeriticences
- **Macaronicon 2.2** — the Burattinaio class, further subclasses, 7 backgrounds,
  racial brawl features
- **L'Impero Randella Ancora! 1.0** — 16 feats, 7 backgrounds, further subclasses

Italian names are the ones printed in the Italian editions, not translations
back from the English ones.

## Apocalisse

Data transcribed from **John's Guide to the Armageddon 1.0**, also Acheron
Games. Origins, archetypes, the Marks and their fourteen spirits, the seven
Virtues and seven Sins.

One thing in the app is **not** from the manual: the Humanity score (0-10).
The manual replaces alignment with a Virtue and a Sin and has no such track.
It is flagged as a house rule in `src/data/apocalisse/rules.ts`.

## The manuals themselves

The PDFs are not in this repository and never have been. `schede/` and
`manuali/` are in `.gitignore`.
