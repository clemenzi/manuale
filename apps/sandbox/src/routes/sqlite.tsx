import { SQLiteEditor } from "#/components/sandboxes/sqlite/editor";
import { SQLiteExplorer } from "#/components/sandboxes/sqlite/explorer";
import { SQLiteOutput } from "#/components/sandboxes/sqlite/output";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { SQLiteProvider, useSQLite } from "#/contexts/sqlite";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { QueryExecResult } from "sql.js";

export const Route = createFileRoute("/sqlite")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SQLiteProvider>
      <SQLiteWorkbench />
    </SQLiteProvider>
  );
}

function SQLiteWorkbench() {
  const { error, execute, status } = useSQLite();
  const [output, setOutput] = useState<QueryExecResult[] | Error>();

  function handleExecute(code: string) {
    try {
      setOutput(execute(code));
    } catch (caughtError) {
      setOutput(caughtError as Error);
    }
  }

  if (status !== "ready" || error) {
    return (
      <main className="grid h-[calc(100vh-70px)] place-items-center text-sm text-muted-foreground">
        {error?.message ?? "Caricamento SQLite..."}
      </main>
    );
  }

  return (
    <main className="h-[calc(100vh-70px)]">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={68} minSize={40}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={66} minSize={35}>
              <SQLiteEditor onExecute={handleExecute} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="min-h-0 overflow-auto p-4" defaultSize={34} minSize={18}>
              <SQLiteOutput output={output} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={32} minSize={24}>
          <SQLiteExplorer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
