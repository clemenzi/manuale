import { FileTree, type FileTreeProps } from "#/components/workbench/file-tree";
import { FolderTree } from "lucide-react";
import type { ReactNode } from "react";

export type FileExplorerProps = FileTreeProps & {
  actions?: ReactNode;
  icon?: ReactNode;
  title?: string;
};

export function FileExplorer({
  actions,
  icon = <FolderTree className="size-4 shrink-0 text-primary" />,
  title = "Explorer",
  ...treeProps
}: FileExplorerProps) {
  return (
    <aside className="flex h-full min-w-0 flex-col bg-background">
      <header className="flex min-h-10 shrink-0 items-center justify-between border-b px-2">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <h2 className="truncate text-sm font-medium">{title}</h2>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <div className="min-h-0 flex-1">
        <FileTree {...treeProps} />
      </div>
    </aside>
  );
}
