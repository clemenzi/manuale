import { PHPProvider, usePHP } from "#/contexts/php";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WorkbenchProvider, useWorkbench } from "#/contexts/workbench";
import WorkbenchExplorer from "#/components/workbench/explorer";
import { WorkbenchEditor } from "#/components/workbench/editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import Preview from "#/components/workbench/runtimes/php/preview";
import Request from "#/components/workbench/runtimes/php/request";
import type { PHPResponse } from "@php-wasm/universal";

export const Route = createFileRoute("/php")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PHPProvider>
      <WorkbenchProvider>
        <PHPWorkbench />
      </WorkbenchProvider>
    </PHPProvider>
  );
}

function PHPWorkbench() {
  const { php } = usePHP();
  const { files } = useWorkbench();
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
          <WorkbenchExplorer />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={"45%"}>
          <WorkbenchEditor />
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
