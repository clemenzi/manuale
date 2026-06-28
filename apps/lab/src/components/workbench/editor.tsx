import { useWorkbench } from "#/contexts/workbench";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { getLanguageFromPath } from "#/lib/utils";
import { ensureWorkbenchIntellisense } from "#/lib/monaco-intellisense";
import Editor from "@monaco-editor/react";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { X } from "@hugeicons/core-free-icons";
import FileIcon from "./icon";
import { useTheme } from "#/contexts/theme";

export function WorkbenchEditor({ bufferline }: { bufferline?: boolean }) {
  const { files, buffers } = useWorkbench();
  const { resolvedTheme } = useTheme();

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <Tabs
        value={buffers.active}
        onValueChange={buffers.setActive}
        className="h-full min-h-0 gap-0 overflow-hidden"
      >
        {bufferline !== false ? (
          <TabsList
            variant="line"
            className="shrink-0 justify-start overflow-x-auto overflow-y-hidden rounded-none border-b px-2 [scrollbar-gutter:stable]"
          >
            {buffers.list.map((buffer) => (
              <div key={buffer} className="relative flex-none">
                <TabsTrigger value={buffer} className="flex-none pr-8">
                  <FileIcon name={buffer} />
                  <span className="truncate">{buffer}</span>
                </TabsTrigger>
                {buffers.active === buffer ? (
                  <Button
                    aria-label={`Chiudi ${buffer}`}
                    className="absolute top-1/2 right-1 z-10 -translate-y-1/2"
                    size="icon-xs"
                    variant="ghost"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      buffers.remove(buffer);
                    }}
                  >
                    <HugeiconsIcon icon={X} />
                  </Button>
                ) : null}
              </div>
            ))}
          </TabsList>
        ) : null}

        {buffers.active &&
          buffers.list.map((buffer) => (
            <TabsContent key={buffer} value={buffer} className="min-h-0 overflow-hidden">
              <Editor
                height="100%"
                beforeMount={ensureWorkbenchIntellisense}
                language={getLanguageFromPath(buffer)}
                path={buffer}
                value={files.get(buffer)}
                onChange={(value: string | undefined) => files.update(buffer, value ?? "")}
                theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                options={{
                  automaticLayout: true,
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  tabCompletion: "on",
                }}
              />
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}
