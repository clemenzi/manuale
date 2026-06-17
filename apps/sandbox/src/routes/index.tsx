import { Button } from "#/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import {
  ArrowRight02Icon,
  ArrowUpRight03Icon,
  CodeIcon,
  ComputerTerminal01Icon,
  EngineIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SiHtml5, SiPhp, SiPostgresql, SiPython, SiSqlite } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 sm:px-8 lg:py-14">
        <section>
          <h1 className="text-8xl font-bold font-logo">
            Prova subito,
            <br />
            senza installare nulla.
          </h1>
          <p className="text-xl">
            Catapultati direttamente in un ambiente di sviluppo pronto da usare per provare
            linguaggi e tool di programmazione.
          </p>
          <div className="flex gap-4 pt-4">
            <Link to="/s/python">
              <Button size="lg">Inizia subito con Python</Button>
            </Link>
            <a href="#langs">
              <Button size="lg" variant="secondary">
                Esplora gli altri linguaggi
              </Button>
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-5xl font-logo">Tutto locale*, nessuna configurazione necessaria.</h2>
          <p className="text-xl">
            MANUALE LAB ti permette di provare linguaggi e tool di programmazione senza installare
            nulla. La maggior parte dei linguaggi e tool supportati funzionano direttamente nel{" "}
            <span className="font-bold">browser</span>.
          </p>
          <div className="flex items-center justify-between w-full py-12">
            <div className="border p-4 rounded flex flex-col items-center justify-center">
              <HugeiconsIcon icon={CodeIcon} size="60%" />
              <span className="text-lg font-semibold">Il tuo codice</span>
            </div>
            <HugeiconsIcon icon={ArrowRight02Icon} size="10%" />
            <div className="border p-4 rounded flex flex-col items-center justify-center">
              <HugeiconsIcon icon={EngineIcon} size="60%" />
              <span className="text-lg font-semibold">Runtime del linguaggio</span>
            </div>
            <HugeiconsIcon icon={ArrowRight02Icon} size="10%" />
            <div className="border p-4 rounded flex flex-col items-center justify-center">
              <HugeiconsIcon icon={ComputerTerminal01Icon} size="60%" />
              <span className="text-lg font-semibold">Risultato del codice</span>
            </div>
          </div>
          <span className="text-foreground/60 text-xs">
            *Alcuni linguaggi e tool possono usare server esterni per eseguire il codice.
          </span>
        </section>

        <section>
          <h2 className="text-5xl font-logo" id="langs">
            SCEGLI IL LINGUAGGIO CON CUI PROVARE
          </h2>
          <p className="text-xl">
            Scegli tra la nostra rosa di linguaggi e tool di programmazione.
          </p>
          <div className="py-12 grid grid-cols-3 gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SiPython />
                  <span>Python</span>
                </CardTitle>
                <CardDescription>Prova codice Python.</CardDescription>
                <CardAction>
                  <Link to="/s/python">
                    <Button>
                      Apri l'editor
                      <HugeiconsIcon icon={ArrowUpRight03Icon} />
                    </Button>
                  </Link>
                </CardAction>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SiSqlite />
                  <span>SQLite</span>
                </CardTitle>
                <CardDescription>Usa un db SQLite.</CardDescription>
                <CardAction>
                  <Link to="/s/sqlite">
                    <Button>
                      Apri l'editor
                      <HugeiconsIcon icon={ArrowUpRight03Icon} />
                    </Button>
                  </Link>
                </CardAction>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SiPostgresql />
                  <span>PostgreSQL</span>
                </CardTitle>
                <CardDescription>Usa un db PostgreSQL.</CardDescription>
                <CardAction>
                  <Link to="/s/postgres">
                    <Button>
                      Apri l'editor
                      <HugeiconsIcon icon={ArrowUpRight03Icon} />
                    </Button>
                  </Link>
                </CardAction>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SiPhp />
                  <span>PHP</span>
                </CardTitle>
                <CardDescription>Prova codice PHP.</CardDescription>
                <CardAction>
                  <Link to="/s/php">
                    <Button>
                      Apri l'editor
                      <HugeiconsIcon icon={ArrowUpRight03Icon} />
                    </Button>
                  </Link>
                </CardAction>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SiHtml5 />
                  <span>HTML (CSS, JS)</span>
                </CardTitle>
                <CardDescription>Crea la tua pagina web</CardDescription>
                <CardAction>
                  <Link to="/s/html">
                    <Button>
                      Apri l'editor
                      <HugeiconsIcon icon={ArrowUpRight03Icon} />
                    </Button>
                  </Link>
                </CardAction>
              </CardHeader>
            </Card>
          </div>
        </section>
        <footer>
          <p>&copy; {new Date().getFullYear()} MANUALE LAB. Tutti i diritti riservati.</p>
        </footer>
      </div>
    </main>
  );
}
