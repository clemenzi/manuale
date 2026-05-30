import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

const HTML_EDITOR_EXTENSIONS = [html()];

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function Editor({ value, onChange }: Props) {
  return (
    <div className="h-full min-h-0 overflow-hidden">
      <CodeMirror
        className="h-full min-h-0 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
        value={value}
        height="100%"
        onChange={onChange}
        extensions={HTML_EDITOR_EXTENSIONS}
      />
    </div>
  );
}
