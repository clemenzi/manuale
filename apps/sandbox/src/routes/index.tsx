import { Card, CardHeader, CardTitle } from "#/components/ui/card";
import { SiHtml5, SiPostgresql, SiPython, SiSqlite } from "@icons-pack/react-simple-icons";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";

type SandboxCard = {
  title: string;
  category: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  to: "/" | "/sqlite";
  isAvailable: boolean;
};

const sandboxes: SandboxCard[] = [
  {
    title: "SQLite",
    category: "Database",
    icon: SiSqlite,
    to: "/sqlite",
    isAvailable: true,
  },
  {
    title: "Postgres",
    category: "Database",
    icon: SiPostgresql,
    to: "/",
    isAvailable: false,
  },
  {
    title: "Python",
    category: "Language",
    icon: SiPython,
    to: "/",
    isAvailable: false,
  },
  {
    title: "HTML (CSS & JS)",
    category: "Web",
    icon: SiHtml5,
    to: "/",
    isAvailable: false,
  },
];

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-dvh bg-muted/25 p-6 sm:p-8">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sandboxes.map((sandbox) => (
          <SandboxCard key={sandbox.title} sandbox={sandbox} />
        ))}
      </div>
    </div>
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
    <Card className="border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <Icon className="size-6" aria-hidden />
          </div>
          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
            {sandbox.isAvailable ? sandbox.category : "Presto"}
          </span>
        </div>
        <CardTitle className="text-xl font-semibold">{sandbox.title}</CardTitle>
      </CardHeader>
    </Card>
  );
}
