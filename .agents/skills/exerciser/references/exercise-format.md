# Formato esercizi

Se stai creando una pagina dedicata agli esercizi, usa una struttura minima come questa:

````mdx
---
title: Esercizi Python
description: Esercizi pratici su Python.
---

### Esercizio 1

[Consegna breve e concreta]

<details>
<summary>Soluzione spiegata</summary>

[Spiega l'idea in 1-3 frasi.]

```python
# soluzione completa
```
````

[Spiega cosa fa il codice in modo semplice.]

</details>
```

Dopo il frontmatter, vai direttamente al primo esercizio.
Non inserire introduzioni, testi di benvenuto o sezioni come `## Esercizi` se la pagina contiene solo esercizi.

Se invece stai aggiungendo esercizi dentro una guida esistente, usa una sezione finale come questa:

````mdx
## Esercizi

### Esercizio 1

[Consegna breve e concreta]

<details>
<summary>Soluzione spiegata</summary>

[Spiega l'idea in 1-3 frasi.]

```python
# oppure php, java, cpp, sql
```
````

[Spiega cosa fa il codice in modo semplice.]

</details>
```

## Regole

- Usa titoli semplici: `Esercizio 1`, `Esercizio 2`, `Esercizio 3`.
- Se il file e una pagina dedicata agli esercizi, il titolo della pagina deve nominare chiaramente il linguaggio: `Esercizi Python`, `Esercizi PHP`, `Esercizi Java` e cosi via.
- Ogni consegna deve chiedere una sola abilita principale.
- Usa consegne brevi, dirette, in forma di elenco di problemi.
- La consegna deve restare generale: spiega il risultato da ottenere, non i nomi delle variabili o ogni passaggio interno della soluzione.
- Ogni soluzione deve essere completa e funzionante rispetto alla consegna.
- La soluzione deve mostrare sempre il codice completo: programma completo, funzione completa, query completa o markup completo, secondo il caso.
- Non limitarti mai al "pezzo da aggiungere" o alla "riga corretta" se il lettore ha bisogno di vedere tutto insieme.
- Ogni spiegazione deve chiarire sia l'idea sia i passaggi del codice.
- Se utile, prima del codice inserisci un piccolo indizio.
- Non usare `<details>` vuoti o con sola soluzione senza spiegazione.

## Come valutare la qualita di una consegna

Una buona consegna:

- dice chiaramente cosa leggere, calcolare, stampare o restituire
- resta breve e asciutta
- allena un concetto preciso della pagina
- permette di capire se il risultato e corretto

Una consegna debole:

- e troppo generica
- oppure e troppo specifica e detta quasi tutta la soluzione
- chiede piu concetti nuovi insieme
- dipende da dettagli non ancora spiegati
- non rende chiaro cosa deve succedere alla fine

## Progressione consigliata

1. Un esercizio su un singolo concetto semplice.
2. Un esercizio sullo stesso concetto, ma leggermente piu impegnativo.
3. Un esercizio che chiede ancora un concetto singolo, ma con una richiesta meno immediata.
4. Un esercizio che mette insieme due concetti gia spiegati.
5. Solo nelle sezioni piu avanti, un esercizio che combina piu passaggi o piu concetti gia studiati.

Quando costruisci la serie di esercizi, usa questa progressione:

- prima esercizi su un solo concetto
- poi esercizi sullo stesso concetto in forma piu impegnativa
- poi esercizi che combinano concetti gia noti

## Adattamento per linguaggio

- `python`: usa `python` nei fence e nomi semplici come `nome`, `eta`, `totale`.
- `php`: usa `php` nei fence e segui lo stile della pagina con `$variabili`.
- `java`: usa `java` nei fence; se la pagina mostra solo frammenti, evita di aggiungere boilerplate inutile.
- `java`: se l'esercizio richiede un programma eseguibile, mostra comunque il codice completo necessario, non solo il blocco interno.
- `cpp`: usa `cpp` nei fence; resta coerente con `std::cout`, `cin` e include mostrati nella guida.
- `cpp`: se serve per capire o compilare la soluzione, includi anche `#include`, `main()` e il resto della struttura minima.
- `sql`: usa `sql` nei fence e tabelle piccole con colonne intuitive.
