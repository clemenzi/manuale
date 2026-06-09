import { useState, type MouseEvent } from "react";
import type { NodeRendererProps } from "react-arborist";
import type { WorkbenchFileTreeNode } from ".";
import { Button, buttonVariants } from "#/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Folder02Icon, MoreVertical, Pen, Trash } from "@hugeicons/core-free-icons";
import FileIcon from "../icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils.ts";

type FileTreeNodeProps = NodeRendererProps<WorkbenchFileTreeNode> & {
  onDeleteOpen: (path: string) => void;
  onRenameOpen: (path: string) => void;
};

export function FileTreeNode({
  dragHandle,
  node,
  onDeleteOpen,
  onRenameOpen,
  style,
}: FileTreeNodeProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (node.isInternal) {
      node.toggle();
      return;
    }

    node.activate();
  };

  const handleOpenRename = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuOpen(false);
    window.setTimeout(() => onRenameOpen(node.data.path), 0);
  };

  const handleOpenDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuOpen(false);
    window.setTimeout(() => onDeleteOpen(node.data.path), 0);
  };

  return (
    <div ref={dragHandle} style={style}>
      <div className="group flex w-full items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          onClick={handleClick}
          className="min-w-0 flex-1 justify-start"
        >
          {node.isInternal ? (
            node.isOpen ? (
              <HugeiconsIcon icon={Folder02Icon} />
            ) : (
              <HugeiconsIcon icon={Folder01Icon} />
            )
          ) : (
            <FileIcon name={node.data.name} />
          )}

          <span className="truncate">{node.data.name}</span>
        </Button>
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "shrink-0 opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
            )}
          >
            <HugeiconsIcon icon={MoreVertical} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleOpenRename}>
                <HugeiconsIcon icon={Pen} />
                Rinomina
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenDelete} variant="destructive">
                <HugeiconsIcon icon={Trash} />
                Cancella
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
