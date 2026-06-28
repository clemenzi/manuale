import { PHPProvider, usePHP } from "#/contexts/php";
import { PageLoader } from "#/components/page-loader";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WorkbenchProvider, useWorkbench } from "#/contexts/workbench";
import WorkbenchExplorer from "#/components/workbench/explorer";
import { WorkbenchEditor } from "#/components/workbench/editor";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import Preview from "#/components/workbench/runtimes/php/preview";
import Request from "#/components/workbench/runtimes/php/request";
import type { PHP, PHPResponse } from "@php-wasm/universal";
import { RuntimeError } from "#/components/runtime-error";

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
      <WorkbenchProvider initialActiveBuffer="index.php" initialBuffers={["index.php"]}>
        <PHPWorkbench />
      </WorkbenchProvider>
    </PHPProvider>
  );
}

function PHPWorkbench() {
  const { error, php, resetEnvironment, status } = usePHP();
  const { files } = useWorkbench();
  const [response, setResponse] = useState<PHPResponse>();
  const { create, onChange } = files;

  useEffect(() => {
    if (!php) {
      return;
    }

    php.listFiles("/www/").forEach((file) => {
      create(file, php.readFileAsText(file));
    });

    return onChange((previousFiles, nextFiles) => {
      syncPHPFiles(php, previousFiles, nextFiles);
    });
  }, [create, onChange, php]);

  if (status === "loading") {
    return <PageLoader />;
  }

  if (status === "error") {
    return (
      <RuntimeError
        error={error}
        fallbackMessage="PHP non si è inizializzato correttamente."
        title="Impossibile avviare PHP"
        onRetry={resetEnvironment}
      />
    );
  }

  return (
    <main className="h-full min-h-0 bg-background">
      <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"15%"}>
          <WorkbenchExplorer />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"45%"}>
          <WorkbenchEditor />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"50%"}>
          <ResizablePanelGroup orientation="vertical" className="h-full min-h-0">
            <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"80%"}>
              <Preview onResponse={setResponse} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"20%"}>
              {response && <Request response={response} />}
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

function syncPHPFiles(
  php: PHP,
  previousFiles: Readonly<Record<string, string | undefined>>,
  nextFiles: Readonly<Record<string, string | undefined>>,
) {
  for (const [path, content] of Object.entries(nextFiles)) {
    if (previousFiles[path] !== content) {
      php.writeFile(path, content ?? "");
    }
  }

  for (const path of Object.keys(previousFiles)) {
    if (!Object.hasOwn(nextFiles, path) && php.fileExists(path)) {
      php.unlink(path);
    }
  }
}
