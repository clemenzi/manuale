---
name: organizer
description: "Organizza nuove guide didattiche per il progetto Manuale senza scriverne il contenuto completo. Usa quando l'utente chiede di creare l'ossatura, la struttura, l'indice o le rotte di una guida, corso o sezione per un argomento come PHP, JavaScript, Git, HTML o CSS in src/content/docs: crea i file .mdx con frontmatter title/description e TODO sensati, poi aggiorna la sidebar in astro.config.mjs."
---

# Organizer

Usa questa skill per creare una nuova guida nel progetto Manuale partendo da un argomento. La skill prepara struttura, rotte e navigazione; non scrive la documentazione didattica completa.

## Obiettivo

Quando l'utente fornisce un argomento, crea una guida completa come scheletro:

- una cartella in `src/content/docs/<slug>/`
- un file `index.mdx` introduttivo
- file `.mdx` organizzati in sezioni e sottocartelle
- frontmatter con `title` e `description` coerenti per ogni rotta
- un TODO chiaro che la skill `writer` possa trasformare in contenuto completo
- un blocco sidebar in `astro.config.mjs` inserito nel posto corretto

Scrivi solo metadati e TODO. Non trasformare questa attività nella stesura dei capitoli.

## Workflow

1. Leggi `astro.config.mjs` e alcune guide esistenti in `src/content/docs` per allineare stile, slug, lingua, profondità e convenzioni.
2. Scegli uno slug breve, minuscolo e stabile per la guida: `php`, `javascript`, `git`, `html-css`.
3. Progetta una progressione sensata per principianti assoluti: introduzione, installazione/ambiente, basi, controllo del flusso, funzioni, strutture dati, file/input-output, errori, strumenti, buone pratiche, argomenti avanzati solo se necessari.
4. Crea solo le rotte davvero utili. Evita una guida enorme o sbilanciata: meglio 5-10 sezioni principali con file concreti che decine di pagine vaghe.
5. Crea i file `.mdx` con frontmatter valido e un TODO utile.
6. Aggiorna `astro.config.mjs` nella proprietà `sidebar` di Starlight.
7. Verifica che tutte le rotte citate nella sidebar esistano come file `.mdx`.

## Regole per le rotte

- Usa sempre file `.mdx`.
- Metti la guida in `src/content/docs/<slug>/`.
- Crea `src/content/docs/<slug>/index.mdx` e riferiscilo nella sidebar come `"<slug>"`.
- Per le sezioni usa sottocartelle descrittive in inglese o già coerenti con il progetto: `basics`, `flow-control`, `functions`, `data-structures`, `oop`, `errors`, `tools`, `advanced`.
- Per gli slug dei file usa kebab-case, senza accenti: `variabili-e-tipi`, `cicli-for`, `gestione-errori`.
- Non sovrascrivere file esistenti senza controllare prima il contenuto.
- Se una rotta esiste già, integra la nuova struttura intorno a quella rotta invece di duplicarla.

## Frontmatter e TODO MDX

Ogni file deve contenere almeno:

```mdx
---
title: Titolo chiaro
description: Descrizione breve e concreta della pagina.
---
```

Per `index.mdx`, puoi aggiungere `icon: BookOpen` se le guide esistenti lo fanno per le pagine introduttive.

Mantieni i titoli in italiano naturale. La description deve dire cosa imparerà o troverà il lettore in quella pagina, non ripetere solo il titolo.

Esempio per `src/content/docs/php/basics/variabili.mdx`:

```mdx
---
title: Variabili
description: Come salvare valori in PHP, dare nomi alle variabili e usarle nel codice.
---

<!-- TODO(writer): Scrivere una lezione introduttiva sulle variabili in PHP per principianti assoluti. Spiegare a cosa servono, la sintassi con $, assegnazione, lettura del valore e nomi validi. Usare esempi piccoli e progressivi. -->
```

Il TODO deve essere abbastanza specifico da guidare `writer`, ma non deve contenere già la lezione.

Quando crei il TODO:

- nomina l'argomento centrale della pagina
- indica il livello del lettore, di solito "principianti assoluti"
- cita 2-5 punti da coprire, ricavati dal titolo, dalla description e dalla posizione nella guida
- chiedi esempi piccoli e progressivi quando la pagina riguarda codice
- non inserire scalette lunghe, testo già pronto o spiegazioni complete

Formato consigliato:

```mdx
<!-- TODO(writer): Scrivere una lezione introduttiva su <argomento> per principianti assoluti. Coprire <punto 1>, <punto 2> e <punto 3>. Usare esempi piccoli e progressivi. -->
```

## Progettare una Guida

Adatta la struttura al tema. Non usare sempre gli stessi capitoli se non hanno senso.

Per un linguaggio di programmazione, di solito funziona questa progressione:

- `index.mdx`: cos'è il linguaggio e cosa si costruirà nella guida
- `basics/`: installazione, primo programma, sintassi, commenti, variabili, tipi, operatori
- `flow-control/`: condizioni, cicli, `break`/`continue`
- `functions/`: funzioni, parametri, valori di ritorno, scope
- `data-structures/`: stringhe, array/liste, mappe/dizionari, strutture equivalenti del linguaggio
- `input-output/` o `web/`: input, output, file, richieste, form o interazione tipica del linguaggio
- `errors/`: errori comuni, eccezioni, debug
- `tools/`: pacchetti, ambiente, test, buone pratiche
- `advanced/`: solo concetti che completano davvero il percorso

Per strumenti o tecnologie non-linguaggio, scegli sezioni basate sul flusso reale:

- introduzione e installazione
- concetti fondamentali
- operazioni quotidiane
- workflow pratici
- collaborazione o integrazioni
- troubleshooting
- buone pratiche

## Aggiornare astro.config.mjs

Inserisci nella lista `sidebar` un nuovo blocco top-level coerente con Python, SQL e CPP.

Preferisci `autogenerate` quando una cartella contiene pagine che possono apparire tutte nella sidebar:

```js
{
  label: "PHP",
  items: [
    "php",
    {
      label: "Le basi",
      collapsed: false,
      autogenerate: { directory: "php/basics" },
    },
    {
      label: "Controllo del flusso",
      collapsed: false,
      autogenerate: { directory: "php/flow-control" },
    },
  ],
}
```

Usa `items` espliciti quando serve un ordine preciso o quando la sezione ha sottosezioni annidate, come già accade per SQL:

```js
{
  label: "Le basi",
  collapsed: false,
  items: [
    "php/basics/installazione",
    "php/basics/primo-programma",
    "php/basics/variabili",
  ],
}
```

Regole:

- La rotta nella sidebar non deve includere `.mdx`.
- Ogni stringa della sidebar deve corrispondere a un file reale.
- Per la pagina `index.mdx`, usa solo lo slug della cartella: `"php"`, non `"php/index"`.
- Mantieni `collapsed: false` per le prime sezioni essenziali e `collapsed: true` per sezioni avanzate o consultabili.
- Non modificare sidebar di altre guide se non serve.

## Controlli Finali

Prima di consegnare:

- Esegui `rg '"<slug>|<slug>/' astro.config.mjs` per controllare le rotte aggiunte.
- Esegui `find src/content/docs/<slug> -type f | sort` per verificare i file creati.
- Esegui `pnpm run types:check` se la modifica di `astro.config.mjs` è significativa o se il progetto lo richiede.
- Controlla che ogni file `.mdx` abbia frontmatter chiuso correttamente con `---`.
- Segnala chiaramente che la guida contiene solo scheletri e metadati, non contenuto didattico completo.
