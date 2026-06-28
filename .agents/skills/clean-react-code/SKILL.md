---
name: clean-react-code
description: Scrivere, revisionare e rifattorizzare componenti, hook e applicazioni React con codice semplice, idiomatico e manutenibile. Usare quando Codex deve implementare funzionalità React, correggere code smell, valutare stato ed Effects, ridurre l'uso improprio di ref o manipolazioni DOM, progettare custom Hook oppure svolgere una code review React.
---

# Clean React Code

## Obiettivo

Produrre codice che descriva l'interfaccia come funzione di props e stato. Preferire il flusso dati dichiarativo di React; trattare Effect, ref e accesso imperativo al DOM come escape hatch da giustificare.

## Procedura

1. Leggere i file coinvolti, le convenzioni del progetto, la versione di React e i test esistenti.
2. Individuare responsabilità, sorgenti di verità, dati derivati, interazioni utente e sistemi esterni.
3. Progettare prima il flusso dichiarativo: props in ingresso, eventi in uscita, stato minimo e rendering puro.
4. Usare un escape hatch solo se esiste una sincronizzazione reale con qualcosa fuori da React.
5. Implementare la soluzione più piccola coerente con il codice circostante.
6. Eseguire lint, type-check e test pertinenti. Non dichiarare verifiche non eseguite.
7. In una revisione, spiegare ogni problema con causa, effetto concreto e correzione proposta; assegnare priorità ai difetti che compromettono correttezza e sincronizzazione.

## Rendere componenti e Hook leggibili

- Mantenere il rendering puro: non produrre side effect, non mutare valori preesistenti e non dipendere dall'ordine dei render.
- Assegnare a ogni componente una responsabilità riconoscibile. Estrarre un componente quando crea un confine concettuale o di riuso, non soltanto per ridurre il numero di righe.
- Preferire composizione e `children` a componenti configurati da molti flag booleani.
- Dare nomi orientati al dominio a componenti, props, eventi e Hook. Nominare i callback ricevuti con `on...` e gli handler locali con `handle...`.
- Conservare insieme codice che cambia per la stessa ragione. Estrarre funzioni pure per trasformazioni complesse.
- Evitare astrazioni premature e custom Hook che nascondono pochi dettagli senza esprimere un concetto riutilizzabile.
- Rispettare sempre le Rules of Hooks. Non chiamare Hook in condizioni, cicli, callback arbitrarie o dopo return anticipati.

## Modellare bene props e stato

- Conservare nello stato solo la sorgente di verità minima. Calcolare durante il render ciò che deriva interamente da props o altro stato.
- Evitare stato duplicato, props copiate nello stato e coppie di valori che possono contraddirsi.
- Modellare stati mutuamente esclusivi con un'unica rappresentazione esplicita, per esempio uno status, invece di più booleani indipendenti.
- Aggiornare oggetti e array senza mutarli. Usare la forma funzionale del setter quando il prossimo valore dipende dal precedente.
- Tenere lo stato vicino ai componenti che lo usano; sollevarlo solo quando deve essere condiviso. Preservare una sola sorgente di verità.
- Scegliere tra componente controllato e non controllato in modo intenzionale; evitare ibridi che alternano autorità tra stato interno e props.
- Usare chiavi stabili derivate dai dati. Non usare l'indice quando elementi possono essere inseriti, rimossi o riordinati.
- Gestire transizioni di caricamento, vuoto, errore e successo come stati espliciti quando fanno parte del comportamento.

## Trattare gli escape hatch come eccezioni

Fare riferimento alla guida ufficiale [Escape Hatches](https://react.dev/learn/escape-hatches) quando il compito coinvolge Effect, ref, DOM imperativo o custom Hook.

### Evitare Effect non necessari

Usare un Effect soltanto per sincronizzare il componente con un sistema esterno, come rete, browser API, timer, subscription, widget non React o DOM non descrivibile con JSX.

Evitare un Effect per:

- calcolare dati usati nel render: calcolarli direttamente, eventualmente memoizzando solo dopo aver misurato un costo reale;
- reagire a un'azione dell'utente: eseguire la logica nell'event handler che conosce l'evento;
- copiare props o stato in altro stato: eliminare la copia e derivare il valore;
- concatenare aggiornamenti che potrebbero essere una singola transizione di stato;
- notificare il genitore di un cambiamento causato nello stesso handler: aggiornare entrambi nello stesso evento quando appropriato;
- inizializzare dati dell'app una sola volta senza considerare remount, rendering server o più istanze.

Spiegare che gli Effect superflui aggiungono un passaggio render-Effect-render, creano valori transitori incoerenti e rendono il flusso più lento e difficile da seguire.

### Scrivere Effect corretti quando servono

- Esprimere una singola sincronizzazione per Effect. Separare processi indipendenti.
- Includere tutte le dipendenze reattive lette. Considerare l'elenco delle dipendenze una descrizione del codice, non una scelta manuale.
- Non disabilitare `exhaustive-deps` e non mentire al linter. Modificare il codice affinché la dipendenza diventi davvero inutile.
- Creare dentro l'Effect oggetti o funzioni usati soltanto dall'Effect, così da evitare dipendenze instabili.
- Restituire sempre il cleanup necessario per subscription, connessioni, timer e listener.
- Gestire risposte asincrone obsolete con cleanup, `AbortController` o un meccanismo equivalente supportato dal progetto.
- Verificare che la sequenza setup-cleanup-setup sia corretta: in sviluppo Strict Mode può esporre cleanup mancanti.
- Separare la logica causata da un'interazione dalla sincronizzazione reattiva. Usare Effect Event solo se disponibile nella versione React del progetto e se rappresenta davvero logica non reattiva.

### Usare ref con disciplina

- Usare una ref per valori che devono sopravvivere ai render ma non influenzano l'output visivo, come ID di timer o istanze esterne.
- Usare ref DOM per focus, scroll, misurazioni o integrazione imperativa inevitabile.
- Non usare una ref al posto dello stato per dati mostrati nell'interfaccia: una modifica a `ref.current` non provoca un render.
- Non leggere o scrivere `ref.current` durante il render, salvo inizializzazione prevedibile e stabile consentita da React.
- Non manipolare manualmente nodi DOM che React gestisce quando JSX, props o stato possono descrivere lo stesso risultato.
- Esporre tramite ref soltanto una piccola API imperativa quando un componente deve controllare un figlio; non esporre l'intero nodo senza necessità.

### Estrarre custom Hook con uno scopo

- Estrarre un custom Hook per riusare logica stateful o una sincronizzazione, non per condividere lo stesso stato tra istanze.
- Dare al Hook un'API focalizzata sul caso d'uso e nascondere i dettagli dell'escape hatch.
- Mantenere ogni chiamata indipendente, salvo uso esplicito di una sorgente esterna condivisa.
- Non usare il custom Hook per aggirare dipendenze, Rules of Hooks o problemi di progettazione.

## Prestazioni

- Correggere prima correttezza e chiarezza. Non aggiungere `useMemo`, `useCallback` o `memo` per abitudine.
- Misurare il problema e ottimizzare il collo di bottiglia osservato.
- Evitare Effects che aggiornano stato senza necessità: spesso sono la causa primaria di catene di render.
- Mantenere locali gli stati transitori e preferire children/composizione per limitare la propagazione dei render.
- Preservare le ottimizzazioni già motivate dal progetto, senza rimuoverle soltanto per uniformità stilistica.

## Revisione e risultato

Controllare prima di concludere:

- Il render è puro e deterministico?
- Ogni valore di stato è una sorgente di verità necessaria?
- Ogni Effect sincronizza davvero un sistema esterno?
- Cleanup e dipendenze descrivono correttamente quella sincronizzazione?
- Eventi, dati derivati e sincronizzazioni sono separati?
- Le ref contengono soltanto dati non visuali o accessi imperativi inevitabili?
- Componenti e Hook hanno API piccole, nomi chiari e responsabilità coerenti?
- Liste, aggiornamenti immutabili e transizioni asincrone restano corretti?
- Le modifiche sono coperte dalle verifiche disponibili?

Quando correggere codice esistente, preservare il comportamento richiesto e mostrare sinteticamente perché la nuova struttura è più sicura. Se un escape hatch rimane, documentarne la necessità nella spiegazione finale invece di presentarlo come una soluzione ordinaria.
