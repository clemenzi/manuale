import { CodeEditor } from "#/components/workbench/code-editor";
import { html } from "@codemirror/lang-html";

const HTML_EDITOR_EXTENSIONS = [html()];

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Editor({ value, onChange }: Props) {
  return <CodeEditor value={value} onChange={onChange} extensions={HTML_EDITOR_EXTENSIONS} />;
}
