import { createFileRoute } from "@tanstack/react-router";
import { EditorCode } from "#/components/editor/code";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { EditorProvider, useEditor } from "#/contexts/editor";
import { SQLiteProvider, useSQLite } from "#/contexts/sqlite";
import { useEffect } from "react";
import { EditorOutput } from "#/components/editor/output";
import { SQLiteExplorer } from "#/components/editor/runtimes/sqlite/explorer";
import type { QueryExecResult, SqlValue } from "sql.js";

export const Route = createFileRoute("/sqlite")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SQLiteProvider>
      <EditorProvider>
        <SQLiteWorkbench />
      </EditorProvider>
    </SQLiteProvider>
  );
}

function SQLiteWorkbench() {
  const { files, buffers, output } = useEditor();
  const { execute } = useSQLite();

  useEffect(() => {
    // idk why i can't use !files.get("query.sql"), it starts rendering infinitely
    if (files.get("query.sql") === undefined) {
      files.create("query.sql", "");
      buffers.add("query.sql");
    }
  }, [files]);

  const handleRun = () => {
    try {
      const out = execute(files.get("query.sql") || "");
      output.setErrors([]);
      output.setResults(toEditorResults(out));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Errore sconosciuto durante l'esecuzione della query.";

      output.setResults([]);
      output.setErrors([message]);
    }
  };

  return (
    <div className="h-[calc(100vh-70px)]">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
              <EditorCode />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
              <EditorOutput onRun={handleRun} />
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

function toEditorResults(results: QueryExecResult[]) {
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
