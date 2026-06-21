import { PHPProvider, usePHP } from "#/contexts/php";
import { PageLoader } from "#/components/page-loader";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { WorkbenchProvider, useWorkbench } from "#/contexts/workbench";
import WorkbenchExplorer from "#/components/workbench/explorer";
import { WorkbenchEditor } from "#/components/workbench/editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import Preview from "#/components/workbench/runtimes/php/preview";
import Request from "#/components/workbench/runtimes/php/request";
import type { PHPResponse } from "@php-wasm/universal";

export const Route = createFileRoute("/s/php")({
  head: () => ({
    meta: [
      { title: "Sandbox PHP Gratuita - Manuale Lab" },
      { name: "description", content: "Sandbox online gratuita per PHP" },
      { name: "keywords", content: "PHP, sandbox, online, gratuita, manuale.dev" },
    ],
  }),
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
  const { php, status } = usePHP();
  const { files, buffers } = useWorkbench();
  const [response, setResponse] = useState<PHPResponse>();
  const hydratedPHPRef = useRef<typeof php>(null);
  const { create, subscribe } = files;
  const { add } = buffers;

  useEffect(() => {
    const unsubscribe = subscribe((nextFiles) => {
      for (const [name, content] of Object.entries(nextFiles)) {
        php?.writeFile(name, content || "");
      }
    });

    add("index.php");

    return unsubscribe;
  }, [add, php, subscribe]);

  useEffect(() => {
    if (!php || hydratedPHPRef.current === php) {
      return;
    }

    hydratedPHPRef.current = php;

    php.listFiles("/www/").forEach((file) => {
      create(file, php.readFileAsText(file));
    });
  }, [create, php]);

  if (status === "loading") {
    return <PageLoader />;
  }

  return (
    <main className="h-[calc(100vh-70px)] min-h-0 bg-background">
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
    </main>
  );
}
