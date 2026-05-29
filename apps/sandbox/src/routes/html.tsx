import Editor from "#/components/sandboxes/html/editor";
import Output from "#/components/sandboxes/html/output";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const DEFAULT_CONTENT = `<!DOCTYPE html>
<html>
<head>
  <title>Manuale.dev HTML Lab</title>
  <style>
    body {
      font-family: "Inter", sans-serif;
      padding: 1rem;
    }

    h1 {
      font-size: 2rem;
      text-align: center;
    }

    p {
      font-size: 1rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>
    Ciao! Sperimenta con HTML, CSS e JS direttamente in Manuale.dev Lab!
  </h1>
  <p>
    L'unico limite è la tua creatività! Usa l'editor a sinistra per scrivere il tuo codice HTML, CSS e JS.
  </p>
</body>
</html>`;

export const Route = createFileRoute("/html")({
  component: RouteComponent,
});

function RouteComponent() {
  const [value, setValue] = useState(DEFAULT_CONTENT);

  return (
    <main className="h-[calc(100vh-70px)]">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel className="min-h-0 overflow-auto" defaultSize={34} minSize={18}>
          <Editor value={value} onChange={setValue} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel className="min-h-0 overflow-auto" defaultSize={34} minSize={18}>
          <Output value={value} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
