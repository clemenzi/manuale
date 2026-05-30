import { Button } from "#/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { sql } from "@codemirror/lang-sql";
import CodeMirror from "@uiw/react-codemirror";
import { Plus, Play } from "lucide-react";
import { useCallback, useState } from "react";

const SQL_EDITOR_EXTENSIONS = [sql()];

type SQLiteEditorProps = {
  onExecute: (code: string) => void;
};

export function SQLiteEditor({ onExecute }: SQLiteEditorProps) {
  const [activeBufferId, setActiveBufferId] = useState("0");
  const [buffers, setBuffers] = useState<string[]>([""]);

  const addBuffer = useCallback(() => {
    setBuffers((prev) => {
      setActiveBufferId(String(prev.length));
      return [...prev, ""];
    });
  }, []);

  const handleExecute = useCallback(() => {
    onExecute(buffers[Number(activeBufferId)] ?? "");
  }, [activeBufferId, buffers, onExecute]);

  const handleActiveBufferChange = useCallback((value: string) => {
    setActiveBufferId(value);
  }, []);

  const updateBuffer = useCallback((index: number, value: string) => {
    setBuffers((prev) => {
      const newBuffers = [...prev];
      newBuffers[index] = value;
      return newBuffers;
    });
  }, []);

  return (
    <Tabs
      value={activeBufferId}
      onValueChange={handleActiveBufferChange}
      className="h-full min-h-0 gap-0 overflow-hidden"
    >
      <header className="flex min-h-10 shrink-0 items-center justify-between gap-2 border-b px-2">
        <TabsList
          variant="line"
          className="min-w-0 flex-1 justify-start overflow-x-auto overflow-y-hidden rounded-none p-0 [scrollbar-gutter:stable]"
        >
          {buffers.map((_, i) => (
            <TabsTrigger key={i} value={String(i)} className="flex-none">
              <span className="truncate">Buffer #{i + 1}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex shrink-0 items-center gap-1">
          <Button aria-label="Nuovo buffer SQL" variant="ghost" size="sm" onClick={addBuffer}>
            <Plus />
          </Button>

          <Button type="button" size="sm" onClick={handleExecute}>
            <Play />
            Esegui
          </Button>
        </div>
      </header>

      {buffers.map((buffer, i) => (
        <TabsContent key={i} value={String(i)} className="min-h-0 overflow-hidden">
          <CodeMirror
            className="h-full min-h-0 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
            extensions={SQL_EDITOR_EXTENSIONS}
            height="100%"
            value={buffer}
            onChange={(value) => updateBuffer(i, value)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
