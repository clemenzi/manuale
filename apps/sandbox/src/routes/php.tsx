import { PHPProvider, usePHP } from "#/contexts/php";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { EditorProvider, useEditor } from "#/contexts/editor";
import EditorExplorer from "#/components/editor/explorer";
import { EditorCode } from "#/components/editor/code";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import Preview from "#/components/sandboxes/php/preview";

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
  const { fs, buffers } = useEditor();
  const { files, writeFile } = fs;
  const { add: addBuffer } = buffers;
  const hasSyncedInitialPHPFiles = useRef(false);

  useEffect(() => {
    if (!php || hasSyncedInitialPHPFiles.current) {
      return;
    }

    hasSyncedInitialPHPFiles.current = true;

    php.listFiles("/www").forEach((name) => {
      const entryPath = `/www/${name}`;
      writeFile(entryPath, php.readFileAsText(entryPath));
    });

    addBuffer("/www/index.php");
  }, [addBuffer, php, writeFile]);

  useEffect(() => {
    if (!php || !hasSyncedInitialPHPFiles.current) {
      return;
    }

    for (const [path, content] of files) {
      php.writeFile(path, content);
    }
  }, [files, php]);

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
              <Preview />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={"20%"}>request analyzer</ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
