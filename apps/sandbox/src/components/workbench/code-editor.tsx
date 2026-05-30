import { cn } from "#/lib/utils";
import CodeMirror from "@uiw/react-codemirror";
import type { ComponentProps } from "react";

type CodeMirrorProps = ComponentProps<typeof CodeMirror>;

export type CodeEditorProps = {
  className?: string;
  editable?: boolean;
  extensions?: CodeMirrorProps["extensions"];
  height?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function CodeEditor({
  className,
  editable = true,
  extensions,
  height = "100%",
  value,
  onChange,
}: CodeEditorProps) {
  return (
    <div className={cn("h-full min-h-0 overflow-hidden", className)}>
      <CodeMirror
        className="h-full min-h-0 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
        editable={editable}
        extensions={extensions}
        height={height}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
