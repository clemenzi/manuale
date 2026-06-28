import { createFileRoute } from "@tanstack/react-router";
import { PageLoader } from "#/components/page-loader";
import { WorkbenchEditor } from "#/components/workbench/editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { WorkbenchProvider, useWorkbench } from "#/contexts/workbench";
import { SQLiteProvider, useSQLite } from "#/contexts/sqlite";
import { WorkbenchOutput } from "#/components/workbench/output";
import { SQLiteExplorer } from "#/components/workbench/runtimes/sqlite/explorer";
import type { QueryExecResult, SqlValue } from "sql.js";
import { RuntimeError } from "#/components/runtime-error";

export const Route = createFileRoute("/s/sqlite")({
  head: () => ({
    meta: [
      { title: "Database SQLite Online Gratuito - Manuale Lab" },
      { name: "description", content: "Sandbox online gratuito per SQLite" },
      { name: "keywords", content: "SQLite, database, online, gratuito, manuale.dev" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SQLiteProvider>
      <WorkbenchProvider
        initialActiveBuffer="query.sql"
        initialBuffers={["query.sql"]}
        initialFiles={{ "query.sql": "" }}
      >
        <SQLiteWorkbench />
      </WorkbenchProvider>
    </SQLiteProvider>
  );
}

function SQLiteWorkbench() {
  const { files, output } = useWorkbench();
  const { error, execute, resetDatabase, status } = useSQLite();

  const handleRun = () => {
    try {
      const out = execute(files.get("query.sql") ?? "");
      output.setErrors([]);
      output.setResults(toWorkbenchResults(out));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Errore sconosciuto durante l'esecuzione della query.";

      output.setResults([]);
      output.setErrors([message]);
    }
  };

  if (status === "loading") {
    return <PageLoader />;
  }

  if (status === "error") {
    return (
      <RuntimeError
        error={error}
        fallbackMessage="SQLite non si è inizializzato correttamente."
        title="Impossibile avviare SQLite"
        onRetry={resetDatabase}
      />
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
              <WorkbenchOutput onRun={handleRun} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
          <SQLiteExplorer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

function toWorkbenchResults(results: QueryExecResult[]) {
  if (results.length === 0) {
    return [{ type: "string" as const, data: "Query eseguita." }];
  }

  return results.map((result) => {
    const rows = result.values.map((row) =>
      Object.fromEntries(
        result.columns.map((column, index) => [column, row[index] satisfies SqlValue]),
      ),
    );

    if (rows.length === 0) {
      return {
        type: "string" as const,
        data: `Nessuna riga restituita${result.columns.length > 0 ? ` (${result.columns.join(", ")})` : ""}.`,
      };
    }

    return {
      type: "table" as const,
      data: rows,
    };
  });
}
