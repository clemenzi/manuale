import { useEditor } from "#/contexts/editor";

export default function Preview() {
  const { files } = useEditor();

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden p-1.5">
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-white">
        <iframe
          srcDoc={files.get("index.html")}
          title="Preview"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
