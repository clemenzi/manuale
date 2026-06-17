---
name: exerciser
description: Crea o amplia sezioni di esercizi dentro le guide di Manuale in `apps/www/src/content/docs/**`. Usa questa skill quando Codex deve aggiungere esercizi per principianti coerenti con una lezione esistente, dedurre linguaggio e argomento dal percorso del file e dal contenuto della pagina, oppure inserire soluzioni nascoste con spiegazione dentro blocchi details.
---

# Exerciser

## Overview

Usa questa skill per aggiungere esercizi pratici alle pagine di Manuale senza rompere tono, progressione e livello della guida.
Leggi prima la pagina target e poi genera esercizi piccoli, verificabili e coerenti con gli argomenti gia trattati.

## Workflow

1. Identifica il file target.
2. Ricava il linguaggio dal percorso, di solito `apps/www/src/content/docs/<linguaggio>/...`.
3. Leggi la pagina completa e almeno 1-2 pagine vicine della stessa sezione se ti serve confermare tono, prerequisiti o nomi dei concetti.
4. Individua i concetti gia spiegati nella pagina.
5. Se stai creando una pagina dedicata agli esercizi, usa nel frontmatter un titolo diretto come `Esercizi Python`, `Esercizi PHP`, `Esercizi Java` o equivalente per il linguaggio corretto.
6. Se invece stai arricchendo una guida esistente, aggiungi o aggiorna una sezione `## Esercizi` vicino alla fine del file.
7. Nelle pagine dedicate agli esercizi, dopo il titolo vai subito agli esercizi: niente introduzioni, niente paragrafi iniziali, niente sezioni decorative.
8. Scrivi esercizi progressivi e, sotto ognuno, inserisci un blocco `<details>` con soluzione e spiegazione.

## Regole Editoriali

- Mantieni il tono semplice, paziente e concreto della skill `writer`.
- Parti da esercizi guidati e aumenta gradualmente l'autonomia.
- Preferisci consegne brevi, asciutte, poco narrative e organizzate come elenco di problemi.
- Preferisci formulazioni generali come `calcolare`, `determinare`, `verificare`, `leggere`, `inviare in output` invece di scenari troppo descritti.
- Non introdurre sintassi o librerie non ancora spiegate nella guida, salvo dettagli minimi gia impliciti nella pagina.
- Mantieni nomi di variabili ed esempi brevi e leggibili.
- Se la pagina e introduttiva, preferisci 3 esercizi. Se la pagina e intermedia o avanzata, usa 4 o 5 esercizi solo se restano davvero focalizzati.
- Se esiste gia una sezione di prova, esercizi o un paragrafo simile, riusalo e normalizzalo invece di duplicarlo.
- Se il file e una pagina dedicata ai soli esercizi, la struttura deve essere essenziale: titolo della pagina e poi subito gli esercizi.
- Non aggiungere introduzioni come "in questa pagina", spiegazioni iniziali, conclusioni o sezioni extra quando la pagina nasce come raccolta di esercizi.

## Come Creare Un Buon Esercizio

Un buon esercizio non e solo "sullo stesso argomento": deve allenare proprio il passaggio che il lettore ha appena studiato.

Per ogni esercizio, controlla queste domande:

1. Qual e l'abilita precisa che il lettore deve usare?
2. La consegna si capisce al primo colpo, senza interpretazioni ambigue?
3. Il lettore puo risolverlo usando solo cio che la pagina ha gia spiegato?
4. Il risultato finale e verificabile con un output, un valore atteso o un comportamento chiaro?
5. La difficolta aggiunge un solo gradino rispetto all'esercizio precedente?

Nel dubbio, usa questo modello: poche parole, verbo iniziale chiaro, nessuna storia lunga, nessun aiuto nascosto dentro la consegna.

## Come Gestire La Difficolta

Fai crescere la difficolta cambiando **una sola cosa alla volta**.

Fai crescere la difficolta in modo generale:

1. Prima fai applicare un singolo concetto semplice.
2. Poi proponi esercizi che chiedono ancora un solo concetto, ma in una forma un po piu impegnativa.
3. Solo dopo passa a esercizi che mettono insieme due concetti vicini tra loro.
4. Infine, se la guida lo consente, proponi esercizi che combinano piu passaggi o piu concetti gia studiati.

Dentro una singola pagina non devi coprire tutta questa progressione. Scegli solo il tratto coerente con la lezione e con il livello del lettore.

Preferisci esercizi che seguono questa progressione:

1. Ripetere il concetto base appena spiegato.
2. Applicarlo con una piccola variazione.
3. Chiedere una versione un po piu impegnativa dello stesso concetto.
4. Solo se la pagina lo consente, unire quel concetto con un altro concetto gia spiegato.

Evita esercizi deboli:

- troppo larghi, come "fai un programma sulle variabili"
- troppo avanzati rispetto alla pagina
- con piu problemi nascosti nella stessa consegna
- senza un criterio chiaro per capire se la risposta e giusta
- con dettagli troppo prescrittivi su nomi di variabili, valori, frasi di output o struttura del codice

Non essere troppo specifico nella consegna.
La consegna deve dire **cosa ottenere**, non gia **come scrivere il programma**.

Preferisci:

- `calcolare la media di tre numeri interi`
- `verificare se una sequenza e crescente`
- `determinare il maggiore degli elementi letti`

Evita formulazioni che guidano troppo il lettore, come:

- imporre nomi esatti delle variabili
- imporre frasi di output troppo rigide se non servono
- spezzare la soluzione in passaggi gia quasi completi dentro la consegna

## Regole Tecniche

- Usa il linguaggio del file anche nei blocchi di codice delle soluzioni.
- Copia la convenzione gia presente nella pagina per frammenti, output e wrapper del codice.
- Per PHP, mantieni `<?php` se la pagina usa esempi completi.
- Per SQL, privilegia query piccole e dati facili da immaginare.
- Per C++, Java e Python, evita strutture avanzate se la pagina non le ha ancora introdotte.
- Il codice della soluzione deve essere sempre completo e funzionante rispetto alla consegna.
- Non mostrare mai solo la riga mancante, il solo corpo di una funzione o un frammento implicito se la consegna richiede un programma o una query completa.
- Se la pagina usa esempi completi, la soluzione deve restare completa anche quando l'esercizio e semplice.

## Formato Di Output

Segui il formato descritto in [references/exercise-format.md](references/exercise-format.md).

## Controlli Finali

- Verifica che ogni esercizio si possa risolvere con cio che la pagina ha gia spiegato.
- Verifica che la difficolta cresca per piccoli gradini e non con salti improvvisi.
- Verifica che le consegne restino brevi e non troppo specifiche.
- Verifica che ogni `<details>` contenga sia soluzione sia spiegazione.
- Verifica che i blocchi di codice usino il fence corretto.
- Verifica che la soluzione mostri sempre il codice completo necessario a risolvere l'esercizio.
- Verifica che una pagina di soli esercizi inizi direttamente con gli esercizi, senza introduzioni o sezioni intermedie.
- Verifica che la sezione finale sembri parte naturale della guida, non un'aggiunta scollegata.
