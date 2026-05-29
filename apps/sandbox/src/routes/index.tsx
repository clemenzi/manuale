import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { SiHtml5, SiPhp, SiPostgresql, SiPython, SiSqlite } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Clock3 } from "lucide-react";
import type { ComponentType } from "react";

type SandboxCard = {
  title: string;
  category: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  to: "/" | "/sqlite" | "/html";
  isAvailable: boolean;
};

const sandboxes: SandboxCard[] = [
  {
    title: "SQLite",
    category: "Database",
    description:
      "Interroga dati reali, leggi le tabelle e vedi subito cosa restituisce ogni query.",
    icon: SiSqlite,
    to: "/sqlite",
    isAvailable: true,
  },
  {
    title: "Postgres",
    category: "Database",
    description: "Prepara schemi, relazioni e join come in un database usato nei progetti veri.",
    icon: SiPostgresql,
    to: "/",
    isAvailable: false,
  },
  {
    title: "Python",
    category: "Language",
    description:
      "Scrivi piccoli script, prova idee al volo e capisci il risultato passo dopo passo.",
    icon: SiPython,
    to: "/",
    isAvailable: false,
  },
  {
    title: "HTML (CSS & JS)",
    category: "Web",
    description: "Componi markup, stile e interazioni in una pagina che cambia mentre lavori.",
    icon: SiHtml5,
    to: "/html",
    isAvailable: true,
  },
  {
    title: "PHP",
    category: "Language",
    description: "Allena logica server, template e form con esempi brevi, leggibili e guidati.",
    icon: SiPhp,
    to: "/",
    isAvailable: false,
  },
];

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 sm:px-8 lg:py-14">
        <section className="border-y border-border py-10">
          <div className="max-w-3xl">
            <h1 className="font-heading text-5xl leading-[0.95] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
              Impara facendo, senza configurare nulla.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Apri un ambiente, scrivi codice vero e osserva subito cosa succede. I sandbox di
              Manuale.dev trasformano esercizi, query e pagine web in pratica immediata.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#environments" className={cn(buttonVariants({ size: "lg" }), "gap-2 px-4")}>
                Scegli un sandbox
                <ArrowDown className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </section>

        <section id="environments" className="grid scroll-mt-8 gap-4 sm:grid-cols-2">
          {sandboxes.map((sandbox) => (
            <SandboxCard key={sandbox.title} sandbox={sandbox} />
          ))}
        </section>
      </div>
    </main>
  );
}

function SandboxCard({ sandbox }: { sandbox: SandboxCard }) {
  const card = <SandboxCardContent sandbox={sandbox} />;

  if (!sandbox.isAvailable) {
    return <div className="opacity-70">{card}</div>;
  }

  return <Link to={sandbox.to}>{card}</Link>;
}

function SandboxCardContent({ sandbox }: { sandbox: SandboxCard }) {
  const Icon = sandbox.icon;

  return (
    <Card
      className={cn(
        "h-full border-border bg-card py-5 shadow-xs transition-all duration-200",
        sandbox.isAvailable
          ? "hover:-translate-y-1 hover:border-primary/35 hover:shadow-md"
          : "bg-muted/40 opacity-75",
      )}
    >
      <CardHeader className="gap-4 px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-12 items-center justify-center bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="size-6" aria-hidden />
          </div>
          <span className="border border-border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
            {sandbox.category}
          </span>
        </div>
        <div>
          <CardTitle className="text-xl font-semibold text-card-foreground">
            {sandbox.title}
          </CardTitle>
          <CardDescription className="mt-2 leading-6">{sandbox.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div className="h-px bg-border" />
      </CardContent>
      <CardFooter className="px-5">
        {sandbox.isAvailable ? (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full justify-between bg-background",
            )}
          >
            Inizia
            <ArrowRight className="size-4" aria-hidden />
          </span>
        ) : (
          <span className="inline-flex h-8 w-full items-center justify-between border border-border bg-secondary px-2.5 text-sm font-medium text-muted-foreground">
            In preparazione
            <Clock3 className="size-4" aria-hidden />
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
