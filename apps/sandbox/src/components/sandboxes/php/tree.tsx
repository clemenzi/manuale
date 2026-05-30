import { Button } from "#/components/ui/button";
import { usePHP } from "#/contexts/php";
import { cn } from "#/lib/utils";
import { SiPhp } from "@icons-pack/react-simple-icons";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

type TreeEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

export type TreeFileSelection = {
  name: string;
  path: string;
};

type TreeProps = {
  path: string;
  refreshKey?: number;
  depth?: number;
  selectedPath?: string | null;
  onFileSelect?: (file: TreeFileSelection) => void;
};

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return `/${path.split("/").filter(Boolean).join("/")}`;
}

function joinPath(basePath: string, name: string) {
  const normalizedBasePath = normalizePath(basePath);

  if (normalizedBasePath === "/") {
    return `/${name}`;
  }

  return `${normalizedBasePath}/${name}`;
}

function sortTreeEntries(first: TreeEntry, second: TreeEntry) {
  if (first.isDirectory !== second.isDirectory) {
    return first.isDirectory ? -1 : 1;
  }

  return first.name.localeCompare(second.name, "it", { sensitivity: "base" });
}

function readTreeEntries(php: ReturnType<typeof usePHP>["php"], path: string): TreeEntry[] {
  if (!php) {
    return [];
  }

  return php
    .listFiles(path)
    .map((name) => {
      const entryPath = joinPath(path, name);

      return {
        name,
        path: entryPath,
        isDirectory: php.isDir(entryPath),
      };
    })
    .sort(sortTreeEntries);
}

export function FileEntry({
  path,
  name,
  depth = 0,
  isSelected = false,
  onSelect,
}: TreeFileSelection & {
  depth?: number;
  isSelected?: boolean;
  onSelect?: (file: TreeFileSelection) => void;
}) {
  const handleSelect = useCallback(() => {
    onSelect?.({ path, name });
  }, [name, onSelect, path]);

  return (
    <li role="none">
      <Button
        aria-current={isSelected ? "page" : undefined}
        className={cn(
          "h-8 w-full justify-start gap-2 px-2 font-normal",
          "text-muted-foreground hover:text-foreground",
          isSelected && "bg-muted text-foreground shadow-none",
        )}
        data-path={path}
        role="treeitem"
        size="sm"
        style={{ paddingLeft: `${depth * 0.875 + 0.5}rem` }}
        type="button"
        variant="ghost"
        onClick={handleSelect}
      >
        {name.endsWith(".php") ? <SiPhp className="size-4 shrink-0 text-primary/80" /> : null}
        <span className="min-w-0 flex-1 truncate text-left">{name}</span>
      </Button>
    </li>
  );
}

export function Tree({ path, refreshKey = 0, depth = 0, selectedPath, onFileSelect }: TreeProps) {
  const { php, version } = usePHP();
  const normalizedPath = normalizePath(path);
  const [isOpen, setIsOpen] = useState(depth === 0);
  const entries = useMemo(() => {
    void version;
    void refreshKey;
    return readTreeEntries(php, normalizedPath);
  }, [php, normalizedPath, refreshKey, version]);
  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  return (
    <div className={cn(depth === 0 && "h-full min-h-0 overflow-auto p-2")}>
      {depth === 0 && entries.length === 0 && <EmptyTree />}

      {depth > 0 && (
        <DirectoryEntry
          depth={depth - 1}
          isOpen={isOpen}
          name={normalizedPath.split("/").at(-1) ?? normalizedPath}
          onToggle={handleToggle}
        />
      )}

      {(depth === 0 || isOpen) && entries.length > 0 && (
        <ul
          aria-label={depth === 0 ? "File PHP" : undefined}
          className={cn(depth > 0 && "ml-3 border-l pl-1")}
          role={depth === 0 ? "tree" : "group"}
        >
          {entries.map((entry) =>
            entry.isDirectory ? (
              <li key={entry.path} role="none">
                <Tree
                  path={entry.path}
                  refreshKey={refreshKey}
                  depth={depth + 1}
                  selectedPath={selectedPath}
                  onFileSelect={onFileSelect}
                />
              </li>
            ) : (
              <FileEntry
                key={entry.path}
                path={entry.path}
                name={entry.name}
                depth={depth}
                isSelected={selectedPath === entry.path}
                onSelect={onFileSelect}
              />
            ),
          )}
        </ul>
      )}
    </div>
  );
}

function DirectoryEntry({
  depth,
  isOpen,
  name,
  onToggle,
}: {
  depth: number;
  isOpen: boolean;
  name: string;
  onToggle: () => void;
}) {
  const Chevron = isOpen ? ChevronDown : ChevronRight;
  const FolderIcon = isOpen ? FolderOpen : Folder;

  return (
    <Button
      aria-expanded={isOpen}
      className="h-8 w-full justify-start gap-1.5 px-2 font-medium"
      role="treeitem"
      size="sm"
      style={{ paddingLeft: `${depth * 0.875 + 0.5}rem` }}
      type="button"
      variant="ghost"
      onClick={onToggle}
    >
      <Chevron className="size-3.5 shrink-0 text-muted-foreground" />
      <FolderIcon className="size-4 shrink-0 text-amber-500" />
      <span className="min-w-0 flex-1 truncate text-left">{name}</span>
    </Button>
  );
}

function EmptyTree() {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed px-3 text-center text-sm text-muted-foreground">
      Nessun file nella cartella
    </div>
  );
}
