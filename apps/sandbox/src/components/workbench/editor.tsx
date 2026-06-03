import { useWorkbench } from "#/contexts/workbench";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { getLanguageFromPath } from "#/lib/utils";
import Editor from "@monaco-editor/react";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { X } from "@hugeicons/core-free-icons";
import { useCallback } from "react";
import FileIcon from "./icon";
import { useTheme } from "#/contexts/theme";

export function WorkbenchEditor({ bufferline }: { bufferline?: boolean }) {
  const { files, buffers } = useWorkbench();
  const { theme } = useTheme();

  const handleChange = useCallback(
    (path: string, value?: string) => {
      files.update(path, value ?? "");
    },
    [files.update],
  );

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <Tabs
        value={buffers.active}
        onValueChange={buffers.setActive}
        className="h-full min-h-0 gap-0 overflow-hidden"
      >
        <TabsList
          variant="line"
          className="min-h-10 shrink-0 justify-start overflow-x-auto overflow-y-hidden rounded-none border-b px-2 [scrollbar-gutter:stable] data-[bufferline=false]:hidden"
          data-bufferline={bufferline}
        >
          {buffers.list.map((buffer) => (
            <TabsTrigger key={buffer} value={buffer} className="flex-none">
              <FileIcon name={buffer} />
              <span className="truncate">{buffer}</span>
              {buffers.active === buffer && (
                <Button
                  variant="ghost"
                  size={"icon-xs"}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    buffers.remove(buffer);
                  }}
                >
                  <HugeiconsIcon icon={X} />
                </Button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {buffers.active &&
          buffers.list.map((buffer) => (
            <TabsContent key={buffer} value={buffer} className="min-h-0 overflow-hidden">
              <Editor
                height="100%"
                language={getLanguageFromPath(buffer)}
                value={files.get(buffer)}
                onChange={(value) => handleChange(buffer, value)}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  automaticLayout: true,
                }}
              />
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}
