import { WorkbenchEditor } from "#/components/workbench/editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { WorkbenchProvider, useWorkbench } from "#/contexts/workbench";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import Preview from "#/components/workbench/runtimes/html/preview";

const DEFAULT_CONTENT = `<!DOCTYPE html>
<html>
<head>
  <title>Manuale Lab - HTML Sandbox</title>
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
    Ciao! Sperimenta con HTML, CSS e JS direttamente in questo sandbox!
  </h1>
  <p>
    L'unico limite è la tua creatività! Usa il workbench a sinistra per scrivere il tuo codice HTML, CSS e JS.
  </p>
</body>
</html>`;

export const Route = createFileRoute("/s/html")({
  head: () => ({
    meta: [
      { title: "Sandbox HTML Gratuita - Manuale Lab" },
      { name: "description", content: "Sandbox online gratuita per HTML, CSS e JS" },
      { name: "keywords", content: "HTML, CSS, JS, sandbox, online, gratuita, manuale.dev" },
    ],
  }),
  component: () => {
    return (
      <WorkbenchProvider>
        <RouteComponent />
      </WorkbenchProvider>
    );
  },
});

function RouteComponent() {
  const { files, buffers } = useWorkbench();
  const { create, get } = files;
  const { add } = buffers;

  useEffect(() => {
    if (get("index.html") === undefined) {
      create("index.html", DEFAULT_CONTENT);
      add("index.html");
    }
  }, [add, create, get]);

  return (
    <main className="h-[calc(100vh-70px)] min-h-0">
      <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={"50%"} className="min-h-0">
          <WorkbenchEditor bufferline={false} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={"50%"} className="min-h-0">
          <Preview />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
