import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { PageLoader } from "#/components/page-loader";
import { WorkbenchEditor } from "#/components/workbench/editor";
import { WorkbenchOutput } from "#/components/workbench/output";
import { PostgresExplorer } from "#/components/workbench/runtimes/postgres/explorer";
import { PostgresProvider, usePostgres } from "#/contexts/postgres";
import { WorkbenchProvider, useWorkbench } from "#/contexts/workbench";
import type { Results } from "@electric-sql/pglite";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const QUERY_FILE = "query.sql";

export const Route = createFileRoute("/s/postgres")({
  head: () => ({
    meta: [
      { title: "Database PostgreSQL Online Gratuito - Manuale Lab" },
      { name: "description", content: "Sandbox online gratuito per PostgreSQL con PGlite" },
      {
        name: "keywords",
        content: "PostgreSQL, Postgres, PGlite, database, online, gratuito, manuale.dev",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PostgresProvider>
      <WorkbenchProvider>
        <PostgresWorkbench />
      </WorkbenchProvider>
    </PostgresProvider>
  );
}

function PostgresWorkbench() {
  const { files, buffers, output } = useWorkbench();
  const { error, execute, resetDatabase, status } = usePostgres();

  useEffect(() => {
    if (files.get(QUERY_FILE) === undefined) {
      files.create(QUERY_FILE, "");
      buffers.add(QUERY_FILE);
    }
  }, [buffers, files]);

  const handleRun = async () => {
    try {
      const results = await execute(files.get(QUERY_FILE) || "");
      output.setErrors([]);
      output.setResults(toWorkbenchResults(results));
    } catch (caughtError) {
      output.setResults([]);
      output.setErrors([toExecutionErrorMessage(caughtError)]);
    }
  };

  if (status === "loading") {
    return <PageLoader />;
  }

  if (status === "error") {
    return (
      <main className="grid h-full min-h-0 place-items-center bg-background px-6">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTitle>Impossibile avviare PostgreSQL</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>{error?.message ?? "PGlite non si e inizializzato correttamente."}</p>
            <Button variant="outline" onClick={() => void resetDatabase()}>
              Riprova
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="h-full min-h-0 bg-background">
      <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
              <WorkbenchEditor bufferline={false} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
              <WorkbenchOutput onRun={() => void handleRun()} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
          <PostgresExplorer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

function toWorkbenchResults(results: Results[]) {
  if (results.length === 0) {
    return [{ type: "string" as const, data: "Query eseguita." }];
  }

  return results.map(toWorkbenchResult);
}

function toWorkbenchResult(result: Results) {
  if (result.rows.length > 0) {
    return {
      type: "table" as const,
      data: result.rows,
    };
  }

  if ((result.affectedRows ?? 0) > 0) {
    return {
      type: "string" as const,
      data: toAffectedRowsMessage(result.affectedRows ?? 0),
    };
  }

  const columns = result.fields.map((field) => field.name);

  return {
    type: "string" as const,
    data:
      columns.length > 0 ? `Nessuna riga restituita (${columns.join(", ")}).` : "Query eseguita.",
  };
}

function toAffectedRowsMessage(count: number) {
  return `Query eseguita. ${count === 1 ? "1 riga modificata" : `${count} righe modificate`}.`;
}

function toExecutionErrorMessage(caughtError: unknown) {
  return caughtError instanceof Error
    ? caughtError.message
    : "Errore sconosciuto durante l'esecuzione della query.";
}
