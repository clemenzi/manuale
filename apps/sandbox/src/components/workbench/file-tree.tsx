import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";

export type FileTreeEntry = {
  isDirectory: boolean;
  name: string;
  path: string;
};

export type FileTreeSelection = {
  name: string;
  path: string;
};

export type FileTreeProps = {
  depth?: number;
  emptyLabel?: string;
  getFileIcon?: (file: FileTreeSelection) => ReactNode;
  locale?: string;
  path: string;
  readEntries: (path: string) => FileTreeEntry[];
  refreshKey?: number;
  selectedPath?: string | null;
  treeLabel?: string;
  onFileSelect?: (file: FileTreeSelection) => void;
};

export function normalizeTreePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return `/${path.split("/").filter(Boolean).join("/")}`;
}

export function joinTreePath(basePath: string, name: string) {
  const normalizedBasePath = normalizeTreePath(basePath);

  if (normalizedBasePath === "/") {
    return `/${name}`;
  }

  return `${normalizedBasePath}/${name}`;
}

export function sortFileTreeEntries(first: FileTreeEntry, second: FileTreeEntry, locale = "it") {
  if (first.isDirectory !== second.isDirectory) {
    return first.isDirectory ? -1 : 1;
  }

  return first.name.localeCompare(second.name, locale, { sensitivity: "base" });
}

export function FileTree({
  depth = 0,
  emptyLabel = "Nessun file nella cartella",
  getFileIcon,
  locale = "it",
  path,
  readEntries,
  refreshKey = 0,
  selectedPath,
  treeLabel = "File",
  onFileSelect,
}: FileTreeProps) {
  const normalizedPath = normalizeTreePath(path);
  const [isOpen, setIsOpen] = useState(depth === 0);
  const entries = useMemo(() => {
    void refreshKey;
    return [...readEntries(normalizedPath)].sort((first, second) =>
      sortFileTreeEntries(first, second, locale),
    );
  }, [locale, normalizedPath, readEntries, refreshKey]);
  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  return (
    <div className={cn(depth === 0 && "h-full min-h-0 overflow-auto p-2")}>
      {depth === 0 && entries.length === 0 ? <EmptyTree>{emptyLabel}</EmptyTree> : null}

      {depth > 0 ? (
        <DirectoryEntry
          depth={depth - 1}
          isOpen={isOpen}
          name={normalizedPath.split("/").at(-1) ?? normalizedPath}
          onToggle={handleToggle}
        />
      ) : null}

      {(depth === 0 || isOpen) && entries.length > 0 ? (
        <ul
          aria-label={depth === 0 ? treeLabel : undefined}
          className={cn(depth > 0 && "ml-3 border-l pl-1")}
          role={depth === 0 ? "tree" : "group"}
        >
          {entries.map((entry) =>
            entry.isDirectory ? (
              <li key={entry.path} role="none">
                <FileTree
                  depth={depth + 1}
                  emptyLabel={emptyLabel}
                  getFileIcon={getFileIcon}
                  locale={locale}
                  path={entry.path}
                  readEntries={readEntries}
                  refreshKey={refreshKey}
                  selectedPath={selectedPath}
                  treeLabel={treeLabel}
                  onFileSelect={onFileSelect}
                />
              </li>
            ) : (
              <FileEntry
                key={entry.path}
                depth={depth}
                icon={getFileIcon?.(entry) ?? <File className="size-4 shrink-0" />}
                isSelected={selectedPath === entry.path}
                name={entry.name}
                path={entry.path}
                onSelect={onFileSelect}
              />
            ),
          )}
        </ul>
      ) : null}
    </div>
  );
}

function FileEntry({
  depth,
  icon,
  isSelected,
  name,
  path,
  onSelect,
}: FileTreeSelection & {
  depth: number;
  icon: ReactNode;
  isSelected: boolean;
  onSelect?: (file: FileTreeSelection) => void;
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
        {icon}
        <span className="min-w-0 flex-1 truncate text-left">{name}</span>
      </Button>
    </li>
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

function EmptyTree({ children }: { children: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed px-3 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
