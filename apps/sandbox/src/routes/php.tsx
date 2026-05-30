import { PHPProvider, usePHP } from "#/contexts/php";
import { createFileRoute } from "@tanstack/react-router";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import Explorer from "#/components/sandboxes/php/explorer";
import type { TreeFileSelection } from "#/components/sandboxes/php/tree";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useState } from "react";
import { php as phpLang } from "@codemirror/lang-php";
import { Webview } from "#/components/sandboxes/php/webview";

const PHP_EDITOR_EXTENSIONS = [phpLang()];
const PHP_ENTRYPOINT: TreeFileSelection = {
  name: "index.php",
  path: "/www/index.php",
};

export const Route = createFileRoute("/php")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PHPProvider>
      <PHPWorkbench />
    </PHPProvider>
  );
}

function PHPWorkbench() {
  const { php } = usePHP();
  const [selectedFile, setSelectedFile] = useState<TreeFileSelection | null>(null);
  const [editorValue, setEditorValue] = useState("");

  useEffect(() => {
    if (!php || selectedFile) {
      return;
    }

    setSelectedFile(PHP_ENTRYPOINT);
    setEditorValue(php.readFileAsText(PHP_ENTRYPOINT.path));
  }, [php, selectedFile]);

  const handleFileSelect = useCallback(
    (file: TreeFileSelection) => {
      setSelectedFile(file);
      setEditorValue(php?.readFileAsText(file.path) ?? "");
    },
    [php],
  );

  const handleEditorChange = useCallback(
    (value: string) => {
      setEditorValue(value);

      if (!php || !selectedFile) {
        return;
      }

      php.writeFile(selectedFile.path, value);
    },
    [php, selectedFile],
  );

  return (
    <main className="h-[calc(100vh-70px)]">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize={"12%"}>
          <Explorer onFileSelect={handleFileSelect} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <div className="flex h-full min-h-0 flex-col">
            {selectedFile ? (
              <>
                <header className="flex min-h-10 items-center border-b px-2 text-sm">
                  {selectedFile.path}
                </header>
                <CodeMirror
                  className="h-full min-h-0 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
                  editable={selectedFile !== null}
                  height="100%"
                  value={editorValue}
                  onChange={handleEditorChange}
                  extensions={PHP_EDITOR_EXTENSIONS}
                />
              </>
            ) : (
              <p className="text-sm text-gray-500">No file selected</p>
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={"50%"}>
          <Webview />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
