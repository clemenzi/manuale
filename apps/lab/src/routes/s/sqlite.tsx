import { createFileRoute } from "@tanstack/react-router";
import { PageLoader } from "#/components/page-loader";
import { WorkbenchEditor } from "#/components/workbench/editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { WorkbenchProvider, useWorkbench } from "#/contexts/workbench";
import { SQLiteProvider, useSQLite } from "#/contexts/sqlite";
import { useEffect } from "react";
import { WorkbenchOutput } from "#/components/workbench/output";
import { SQLiteExplorer } from "#/components/workbench/runtimes/sqlite/explorer";
import type { QueryExecResult, SqlValue } from "sql.js";

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
      <WorkbenchProvider>
        <SQLiteWorkbench />
      </WorkbenchProvider>
    </SQLiteProvider>
  );
}

function SQLiteWorkbench() {
  const { files, buffers, output } = useWorkbench();
  const { execute, status } = useSQLite();
  const { create, get } = files;
  const { add } = buffers;

  useEffect(() => {
    // idk why i can't use !files.get("query.sql"), it starts rendering infinitely
    if (get("query.sql") === undefined) {
      create("query.sql", "");
      add("query.sql");
    }
  }, [add, create, get]);

  const handleRun = () => {
    try {
      const out = execute(files.get("query.sql") || "");
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

  return (
    <div className="h-[calc(100vh-70px)]">
      <ResizablePanelGroup orientation="horizontal">
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
    </div>
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
