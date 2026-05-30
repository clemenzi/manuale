import { BufferedCodeEditor } from "#/components/workbench/buffered-code-editor";
import { sql } from "@codemirror/lang-sql";

const SQL_EDITOR_EXTENSIONS = [sql()];

type SQLiteEditorProps = {
  onExecute: (code: string) => void;
};

export function SQLiteEditor({ onExecute }: SQLiteEditorProps) {
  return (
    <BufferedCodeEditor
      addBufferLabel="Nuovo buffer SQL"
      extensions={SQL_EDITOR_EXTENSIONS}
      onExecute={onExecute}
    />
  );
}
