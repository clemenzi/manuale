import { EditorCode } from "#/components/editor/code";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { EditorProvider, useEditor } from "#/contexts/editor";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import Preview from "#/components/editor/runtimes/html/preview";

const DEFAULT_CONTENT = `<!DOCTYPE html>
<html>
<head>
  <title>Manuale.dev HTML Sandbox</title>
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
    L'unico limite è la tua creatività! Usa l'editor a sinistra per scrivere il tuo codice HTML, CSS e JS.
  </p>
</body>
</html>`;

export const Route = createFileRoute("/html")({
  component() {
    return (
      <EditorProvider>
        <RouteComponent />
      </EditorProvider>
    );
  },
});

function RouteComponent() {
  const { files, buffers } = useEditor();

  useEffect(() => {
    if (files.get("index.html") === undefined) {
      files.create("index.html", DEFAULT_CONTENT);
      buffers.add("index.html");
    }
  }, [files]);

  return (
    <main className="h-[calc(100vh-70px)] min-h-0">
      <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={"50%"} className="min-h-0">
          <EditorCode />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={"50%"} className="min-h-0">
          <Preview />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
