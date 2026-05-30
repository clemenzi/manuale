import { FolderTree } from "lucide-react";
import { useCallback, useState } from "react";
import { NewFileDialog } from "./dialogs";
import { Tree, type TreeFileSelection } from "./tree";

type ExplorerProps = {
  onFileSelect?: (file: TreeFileSelection) => void;
};

export default function Explorer({ onFileSelect }: ExplorerProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (file: TreeFileSelection) => {
      setSelectedPath(file.path);
      onFileSelect?.(file);
    },
    [onFileSelect],
  );

  const handleDialogClose = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  return (
    <aside className="flex h-full min-w-0 flex-col bg-background">
      <header className="flex min-h-10 shrink-0 items-center justify-between border-b px-2">
        <div className="flex min-w-0 items-center gap-2">
          <FolderTree className="size-4 shrink-0 text-primary" />
          <h2 className="truncate text-sm font-medium">Explorer</h2>
        </div>
        <div className="shrink-0">
          <NewFileDialog onClose={handleDialogClose} />
        </div>
      </header>
      <div className="min-h-0 flex-1">
        <Tree
          path="/www/"
          refreshKey={refreshKey}
          selectedPath={selectedPath}
          onFileSelect={handleFileSelect}
        />
      </div>
    </aside>
  );
}
