import { PHPProvider, usePHP } from "#/contexts/php";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EditorProvider, useEditor } from "#/contexts/editor";
import EditorExplorer from "#/components/editor/explorer";
import { EditorCode } from "#/components/editor/code";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import Preview from "#/components/editor/runtimes/php/preview";
import Request from "#/components/editor/runtimes/php/request";
import type { PHPResponse } from "@php-wasm/universal";

export const Route = createFileRoute("/php")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PHPProvider>
      <EditorProvider>
        <PHPWorkbench />
      </EditorProvider>
    </PHPProvider>
  );
}

function PHPWorkbench() {
  const { php } = usePHP();
  const { files } = useEditor();
  const [response, setResponse] = useState<PHPResponse>();

  useEffect(() => {
    const unsubscribe = files.subscribe((files) => {
      for (const [name, content] of Object.entries(files)) {
        php?.writeFile(name, content || "");
      }
    });

    return unsubscribe;
  }, [files]);

  useEffect(() => {
    php?.listFiles("/www/").map((file) => {
      files.create(file, php.readFileAsText(file));
    });
  }, [php]);

  return (
    <>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={"15%"}>
          <EditorExplorer />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={"45%"}>
          <EditorCode />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={"50%"}>
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize={"80%"}>
              <Preview onResponse={setResponse} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={"20%"}>
              {response && <Request response={response} />}
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
