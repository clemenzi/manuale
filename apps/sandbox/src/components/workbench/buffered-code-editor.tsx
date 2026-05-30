import { Button } from "#/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Plus, Play } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CodeEditor, type CodeEditorProps } from "./code-editor";

export type CodeBuffer = {
  id: string;
  label: string;
  value: string;
};

export type BufferedCodeEditorProps = Omit<CodeEditorProps, "value" | "onChange"> & {
  addBufferLabel?: string;
  buffers?: CodeBuffer[];
  executeLabel?: string;
  executeIcon?: ReactNode;
  newBuffer?: (index: number) => CodeBuffer;
  onBuffersChange?: (buffers: CodeBuffer[]) => void;
  onExecute?: (code: string, buffer: CodeBuffer) => void;
  renderBufferLabel?: (buffer: CodeBuffer, index: number) => ReactNode;
};

function createDefaultBuffer(index: number): CodeBuffer {
  return {
    id: String(index),
    label: `Buffer #${index + 1}`,
    value: "",
  };
}

export function BufferedCodeEditor({
  addBufferLabel = "Nuovo buffer",
  buffers: controlledBuffers,
  executeLabel = "Esegui",
  executeIcon = <Play />,
  newBuffer = createDefaultBuffer,
  onBuffersChange,
  onExecute,
  renderBufferLabel,
  ...editorProps
}: BufferedCodeEditorProps) {
  const [uncontrolledBuffers, setUncontrolledBuffers] = useState<CodeBuffer[]>(() => [
    newBuffer(0),
  ]);
  const [activeBufferId, setActiveBufferId] = useState(() => uncontrolledBuffers[0]?.id ?? "0");
  const buffers = controlledBuffers ?? uncontrolledBuffers;
  const activeBuffer = useMemo(
    () => buffers.find((buffer) => buffer.id === activeBufferId) ?? buffers[0],
    [activeBufferId, buffers],
  );

  const setBuffers = useCallback(
    (nextBuffers: CodeBuffer[] | ((currentBuffers: CodeBuffer[]) => CodeBuffer[])) => {
      const resolvedBuffers =
        typeof nextBuffers === "function" ? nextBuffers(buffers) : nextBuffers;

      if (!controlledBuffers) {
        setUncontrolledBuffers(resolvedBuffers);
      }

      onBuffersChange?.(resolvedBuffers);
    },
    [buffers, controlledBuffers, onBuffersChange],
  );

  const addBuffer = useCallback(() => {
    const nextBuffer = newBuffer(buffers.length);
    setBuffers((currentBuffers) => [...currentBuffers, nextBuffer]);
    setActiveBufferId(nextBuffer.id);
  }, [buffers.length, newBuffer, setBuffers]);

  const updateBuffer = useCallback(
    (bufferId: string, value: string) => {
      setBuffers((currentBuffers) =>
        currentBuffers.map((buffer) => (buffer.id === bufferId ? { ...buffer, value } : buffer)),
      );
    },
    [setBuffers],
  );

  const handleExecute = useCallback(() => {
    if (!activeBuffer) {
      return;
    }

    onExecute?.(activeBuffer.value, activeBuffer);
  }, [activeBuffer, onExecute]);

  return (
    <Tabs
      value={activeBuffer?.id}
      onValueChange={setActiveBufferId}
      className="h-full min-h-0 gap-0 overflow-hidden"
    >
      <header className="flex min-h-10 shrink-0 items-center justify-between gap-2 border-b px-2">
        <TabsList
          variant="line"
          className="min-w-0 flex-1 justify-start overflow-x-auto overflow-y-hidden rounded-none p-0 [scrollbar-gutter:stable]"
        >
          {buffers.map((buffer, index) => (
            <TabsTrigger key={buffer.id} value={buffer.id} className="flex-none">
              <span className="truncate">{renderBufferLabel?.(buffer, index) ?? buffer.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex shrink-0 items-center gap-1">
          <Button aria-label={addBufferLabel} variant="ghost" size="sm" onClick={addBuffer}>
            <Plus />
          </Button>

          {onExecute ? (
            <Button type="button" size="sm" onClick={handleExecute}>
              {executeIcon}
              {executeLabel}
            </Button>
          ) : null}
        </div>
      </header>

      {buffers.map((buffer) => (
        <TabsContent key={buffer.id} value={buffer.id} className="min-h-0 overflow-hidden">
          <CodeEditor
            {...editorProps}
            value={buffer.value}
            onChange={(value) => updateBuffer(buffer.id, value)}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
