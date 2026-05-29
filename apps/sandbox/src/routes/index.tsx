import { Card, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiSqlite, SiPostgresql, SiPython, SiHtml5 } from "@icons-pack/react-simple-icons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Manuale.dev Sandboxes",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-dvh bg-muted/25 p-6 sm:p-8">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/">
          <Card className="border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                  <SiSqlite className="size-6" aria-hidden="true" />
                </div>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  Database
                </span>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold">SQLite</CardTitle>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/">
          <Card className="border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                  <SiPostgresql className="size-6" aria-hidden="true" />
                </div>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  Database
                </span>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold">Postgres</CardTitle>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/">
          <Card className="border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                  <SiPython className="size-6" aria-hidden="true" />
                </div>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  Language
                </span>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold">Python</CardTitle>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/">
          <Card className="border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
            <CardHeader className="gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
                  <SiHtml5 className="size-6" aria-hidden="true" />
                </div>
                <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  Web
                </span>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold">HTML (CSS & JS)</CardTitle>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
