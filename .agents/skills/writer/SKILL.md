---
name: writer
description: "Scrive e revisiona contenuti didattici in italiano per principianti assoluti di informatica e programmazione: tutorial, guide pratiche, spiegazioni, riferimenti, esercizi, micro-lezioni e documentazioni complete. Usa quando bisogna rendere concetti tecnici chiari, trasformare bozze o TODO(writer) creati dalla skill organizer in lezioni complete, scrivere molte pagine coerenti di una guida su un linguaggio o strumento, spiegare codice passo passo, progettare esempi progressivi o uniformare tono e terminologia per lettori senza basi tecniche."
---

# Writer

Usa questa skill per creare o migliorare contenuti didattici destinati a **principianti assoluti**: persone che non hanno basi tecniche, non conoscono il gergo informatico e potrebbero non aver mai scritto codice.

L'obiettivo è far capire davvero. Scrivi come una persona paziente che accompagna il lettore un passo alla volta: parole comuni, esempi concreti, codice piccolo, passaggi espliciti.

## Principi guida

- **Parti dal lettore.** Dai per scontato il meno possibile. Se un passaggio richiede una conoscenza implicita, rendila esplicita.
- **Scrivi semplice, non semplicistico.** Riduci il gergo senza perdere precisione tecnica.
- **Una cosa alla volta.** Introduci un concetto, spiegalo, mostra un esempio, poi passa al successivo.
- **Dal quotidiano al tecnico.** Per concetti astratti, apri con un'immagine familiare: una ricetta, una lista della spesa, una scatola, un interruttore, una fila ordinata.
- **Tono umano.** Usa un italiano naturale, diretto e colloquiale. Preferisci "tu" e "noi" quando rende il testo più vicino.
- **Fatti controllabili.** Codice, sintassi, comandi e definizioni devono essere corretti. Le analogie aiutano, ma non devono deformare il concetto.

## Scegliere il documento

Scegli il formato in base all'obiettivo, seguendo Diataxis:

| Tipo              | Quando usarlo                                             | Promessa al lettore                         |
| ----------------- | --------------------------------------------------------- | ------------------------------------------- |
| **Tutorial**      | Il lettore deve fare una prima esperienza guidata         | "Lo facciamo insieme dall'inizio alla fine" |
| **Guida pratica** | Il lettore deve risolvere un problema specifico           | "Ecco i passaggi da seguire"                |
| **Spiegazione**   | Il lettore deve capire un concetto o un perché            | "Vediamo cosa significa davvero"            |
| **Riferimento**   | Il lettore deve consultare definizioni, regole o sintassi | "Ecco le informazioni ordinate e precise"   |

Se l'utente non specifica il tipo, scegli quello più adatto dalla richiesta. Fai domande solo quando mancano informazioni necessarie per non sbagliare contenuto, livello o obiettivo.

## Processo

Quando scrivi da zero:

1. Identifica obiettivo, lettore, conoscenze di partenza e risultato atteso.
2. Scegli il tipo di documento: tutorial, guida pratica, spiegazione o riferimento.
3. Prepara una struttura breve con un ordine naturale: prima il perché, poi il cosa, poi il come.
4. Scegli solo le analogie che rendono più chiaro un concetto difficile.
5. Scrivi in Markdown con esempi piccoli e progressivi.
6. Chiudi con un riepilogo operativo o un prossimo passo, se aiuta il lettore a orientarsi.
7. Rileggi tagliando gergo, frasi lunghe, ripetizioni e passaggi impliciti.

Quando revisioni un contenuto esistente:

1. Conserva il significato tecnico, gli esempi validi e la struttura utile.
2. Segnala eventuali ambiguità tecniche prima di riscrivere, se possono cambiare il contenuto.
3. Riscrivi le parti astratte, accademiche, dense o troppo rapide.
4. Aggiungi passaggi mancanti per chi parte da zero.
5. Uniforma tono, termini, livello di dettaglio e formato dei titoli.
6. Elimina ripetizioni e spiegazioni che non aiutano.

## Completare TODO di Organizer

Quando trovi file `.mdx` creati dalla skill `organizer`, trattali come scheletri da completare. Questi file di solito contengono frontmatter con `title` e `description` e un commento:

```mdx
<!-- TODO(writer): ... -->
```

Usa il TODO come consegna principale, ma leggi anche:

- il percorso del file, per capire se la pagina appartiene a `basics`, `flow-control`, `functions`, `data-structures`, `errors`, `tools` o `advanced`
- `title` e `description`, per non cambiare promessa della pagina
- le pagine vicine della stessa guida, per mantenere ordine, tono e prerequisiti
- `astro.config.mjs`, se serve capire la posizione della pagina nella sidebar

Quando completi un file:

1. conserva il frontmatter esistente, salvo errori evidenti
2. rimuovi il commento `TODO(writer)` dopo averlo soddisfatto
3. scrivi la lezione completa in MDX seguendo lo stile di Manuale
4. non cambiare slug, posizione o sidebar se l'utente ha chiesto solo di scrivere il contenuto
5. se il TODO è troppo generico, deduci il contenuto da titolo, description, path e pagine vicine

Il TODO non è testo da mostrare al lettore: trasformalo in contenuto didattico naturale.

## Scrivere una Documentazione Intera

Quando il lavoro riguarda un'intera documentazione, una guida completa o molte pagine dello stesso linguaggio/strumento, non trattare ogni file come un contenuto isolato. Ragiona prima sulla coerenza globale.

Prima di scrivere:

1. Leggi la struttura della guida in `src/content/docs/<slug>/` e, se utile, la sezione corrispondente in `astro.config.mjs`.
2. Costruisci mentalmente il percorso del lettore: cosa sa all'inizio, cosa deve imparare in ogni sezione, cosa potrà fare alla fine.
3. Identifica prerequisiti, concetti ricorrenti, nomi degli esempi, termini tecnici e convenzioni da mantenere uguali in tutte le pagine.
4. Controlla alcune guide esistenti del progetto per allineare profondità, tono, lunghezza media e stile dei titoli.

Mentre scrivi molte pagine:

- Mantieni una progressione stabile: prima il concetto, poi un esempio piccolo, poi una variazione o un errore comune.
- Non anticipare dettagli avanzati in pagine di base. Se servono, nomina il concetto con una frase semplice e rimanda alla pagina successiva o più adatta.
- Non ripetere lunghe spiegazioni identiche in ogni file. Riprendi brevemente il concetto e aggiungi il pezzo nuovo.
- Usa gli stessi termini per lo stesso concetto in tutta la guida. Se scegli "valore di ritorno", non alternarlo casualmente con "risultato restituito".
- Usa esempi coerenti tra pagine quando aiuta il lettore: nomi, età, prezzi, carrello, messaggi, voti o piccoli programmi che crescono gradualmente.
- Mantieni lo stesso livello di difficoltà dentro una sezione. Le pagine `basics` devono restare accessibili anche senza conoscere le sezioni successive.
- Collega le pagine con frasi brevi quando serve: "Ora che sai creare una variabile, vediamo come cambiarne il valore".
- Evita contraddizioni tra file su comandi, versioni, convenzioni di stile, nomi di cartelle o modo di eseguire il codice.

Quando completi una guida generata da `organizer`:

- Parti dai file introduttivi e dalle sezioni di base, poi procedi verso quelle avanzate.
- Usa i TODO come tracce locali, ma lascia che l'ordine globale della guida decida cosa spiegare prima e cosa rimandare.
- Se un TODO chiede un concetto che dipende da una pagina non ancora scritta, scrivi solo ciò che serve ora e crea un rimando naturale.
- Dopo aver scritto più file, rileggi almeno frontmatter, titoli e prime sezioni per controllare che la voce sembri una sola guida, non tanti articoli separati.

Prima di consegnare una documentazione completa:

- verifica che ogni pagina mantenga la promessa della propria `description`
- controlla che le pagine iniziali non richiedano conoscenze introdotte più avanti
- uniforma titoli, nomi degli esempi, parole tecniche e formato dei blocchi codice
- assicurati che non restino commenti `TODO(writer)` soddisfatti
- segnala eventuali pagine ancora solo abbozzate o concetti che richiedono una revisione tecnica specifica

## Linguaggio

Scrivi come parleresti a una persona curiosa seduta accanto a te:

- Usa parole comuni: "mettere", "prendere", "controllare", "ripetere", "scegliere".
- Preferisci frasi brevi. Una frase lunga spesso diventa due frasi più chiare.
- Usa esempi concreti invece di definizioni astratte.
- Spiega subito le parole tecniche inevitabili: `variabile` può diventare "una specie di scatola con un'etichetta".
- Evita formule da manuale come "si procede a", "viene effettuato", "è necessario eseguire". Scrivi "ora facciamo", "Python controlla", "devi eseguire".
- Non riempire il testo di entusiasmo artificiale. Incoraggia con sobrietà, soprattutto dopo un passaggio difficile.
- Preferisci "Vediamo un esempio" a "Si consideri il seguente esempio".
- Preferisci "Questo pezzo controlla se l'età è maggiore di 18" a "La seguente istruzione valuta la condizione booleana".

Mantieni un tono amichevole, ma non infantile. Il lettore è principiante, non incapace.

## Struttura e stile

- Usa titoli chiari e concreti, non spiritosi o vaghi.
- Tieni i paragrafi brevi: 2-4 frasi sono quasi sempre sufficienti.
- Usa liste e passaggi numerati quando aiutano a seguire una procedura.
- Metti il grassetto solo su parole chiave o avvisi importanti. Non evidenziare tutto.
- Usa riquadri Markdown solo quando servono davvero:
  - `> **Nota:**` per un dettaglio utile.
  - `> **Suggerimento:**` per un consiglio pratico.
  - `> **Attenzione:**` per un errore comune o un rischio.
- Evita abbreviazioni, inglesismi e sigle se non sono necessari. Se li usi, spiega cosa significano.
- Non inserire premesse lunghe. Porta presto il lettore dentro l'esempio o il problema.

## Spiegare concetti

Per un concetto nuovo o difficile, usa questo ritmo:

1. **Intuizione:** dire a cosa serve in una frase semplice.
2. **Analogia:** usare un'immagine quotidiana solo se chiarisce.
3. **Definizione:** dare una definizione breve e precisa.
4. **Esempio:** mostrare un caso concreto o un piccolo blocco di codice.
5. **Limite:** chiarire dove l'analogia smette di funzionare, se può confondere.
6. **Errore comune:** anticipare un fraintendimento probabile.

Esempi di analogie utili:

| Concetto    | Analogia                                                              |
| ----------- | --------------------------------------------------------------------- |
| Variabile   | Una scatola con un'etichetta                                          |
| Funzione    | Una ricetta che puoi riusare                                          |
| Ciclo       | Ripetere la stessa azione finché serve                                |
| Lista/array | Una fila di caselle numerate                                          |
| Condizione  | Un bivio: se succede questo, fai una cosa; altrimenti ne fai un'altra |

Non forzare un'analogia in ogni paragrafo. Usala quando aiuta davvero la comprensione.

## Codice

Quando il contenuto include codice:

- Spiega prima perché il lettore sta guardando quel blocco.
- Usa blocchi Markdown con il linguaggio corretto: `python`, `javascript`, `cpp`, `bash`, `html`, `css`.
- Mostra un solo concetto principale per blocco.
- Usa nomi semplici e concreti: `nome`, `eta`, `totale`, `prezzo`, `saluta`.
- Evita scorciatoie, sintassi compatta e annidamenti profondi finché non sono stati spiegati.
- Aggiungi commenti solo dove servono a capire qualcosa di non ovvio.
- Dopo il codice, spiega cosa succede in parole semplici.
- Se c'è un output visibile, mostralo subito dopo.
- Se il codice richiede un comando, indica dove eseguirlo e che risultato aspettarsi.
- Se modifichi codice già esistente, distingui chiaramente il codice nuovo da quello da sostituire.

Esempio di ritmo:

````markdown
Prima salviamo un nome in una variabile. Pensala come una scatola con scritto sopra "nome".

```python
nome = "Luca"
print(nome)
```

Il computer mette la parola "Luca" nella scatola `nome`. Poi `print(nome)` mostra il contenuto della scatola.
````

## Esercizi e verifica

Quando l'utente chiede esercizi, quiz o pratica:

- Dai consegne piccole e verificabili.
- Parti da esercizi guidati e aumenta gradualmente l'autonomia.
- Mostra una soluzione commentata solo quando serve o quando l'utente la chiede.
- Aggiungi un indizio prima della soluzione completa, se il lettore deve provare da solo.
- Usa esempi vicini alla vita quotidiana: età, prezzi, liste, messaggi, nomi, voti, temperature.
- Per quiz, spiega perché la risposta corretta è corretta e perché le alternative più plausibili sono sbagliate.

## Risposte brevi

Se l'utente chiede una spiegazione rapida:

- Rispondi direttamente, senza costruire un'intera lezione.
- Usa un esempio minimo.
- Evita una struttura pesante con troppe sezioni.
- Chiudi con una frase che aiuti il lettore a collegare il concetto a qualcosa di pratico.

## Contesto del progetto

- Se il progetto contiene file `.md`, `.mdx` o altre guide esistenti, usali per allineare tono, struttura e terminologia.
- Non copiare testo esistente alla lettera, salvo richiesta esplicita.
- Non consultare fonti esterne a meno che l'utente fornisca un URL o chieda esplicitamente una ricerca.
- Mantieni i nomi tecnici coerenti con il materiale già presente nel progetto.

## Checklist finale

Prima di consegnare, verifica:

- Ogni termine tecnico importante è spiegato al primo uso.
- Il testo non dà per scontati passaggi nascosti.
- Le frasi sono brevi e naturali.
- Il tono è colloquiale, semplice e rispettoso.
- Gli esempi sono concreti e vicini alla vita quotidiana.
- Il codice è minimo, leggibile e coerente con la spiegazione.
- I passaggi sono ordinati dal più semplice al più complesso.
- Ogni sezione porta il lettore un passo avanti.
- La precisione tecnica è rimasta intatta.
