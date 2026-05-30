import { FileExplorer, type FileExplorerProps } from "#/components/workbench/file-explorer";
import {
  joinTreePath,
  type FileTreeEntry,
  type FileTreeSelection,
} from "#/components/workbench/file-tree";
import { usePHP } from "#/contexts/php";
import { SiPhp } from "@icons-pack/react-simple-icons";
import { useCallback, useState } from "react";
import { NewFileDialog } from "./dialogs";

type ExplorerProps = {
  onFileSelect?: (file: FileTreeSelection) => void;
};

export default function Explorer({ onFileSelect }: ExplorerProps) {
  const { php, version } = usePHP();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const readEntries = useCallback<NonNullable<FileExplorerProps["readEntries"]>>(
    (path) => {
      void version;

      if (!php) {
        return [];
      }

      return php.listFiles(path).map<FileTreeEntry>((name) => {
        const entryPath = joinTreePath(path, name);

        return {
          name,
          path: entryPath,
          isDirectory: php.isDir(entryPath),
        };
      });
    },
    [php, version],
  );

  const handleFileSelect = useCallback(
    (file: FileTreeSelection) => {
      setSelectedPath(file.path);
      onFileSelect?.(file);
    },
    [onFileSelect],
  );

  const handleDialogClose = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  return (
    <FileExplorer
      actions={<NewFileDialog onClose={handleDialogClose} />}
      emptyLabel="Nessun file nella cartella"
      getFileIcon={(file) =>
        file.name.endsWith(".php") ? (
          <SiPhp className="size-4 shrink-0 text-primary/80" />
        ) : undefined
      }
      path="/www/"
      readEntries={readEntries}
      refreshKey={refreshKey}
      selectedPath={selectedPath}
      title="Explorer"
      treeLabel="File PHP"
      onFileSelect={handleFileSelect}
    />
  );
}
