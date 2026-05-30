import { cn } from "#/lib/utils";
import { Database } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export type EntityExplorerItem = {
  id: string;
  label: string;
  meta?: ReactNode;
};

export type EntityExplorerProps<TItem extends EntityExplorerItem> = {
  emptyLabel?: string;
  icon?: ReactNode;
  items: TItem[];
  navLabel?: string;
  renderDetails: (item: TItem | null) => ReactNode;
  renderItemIcon?: (item: TItem) => ReactNode;
  selectedId: string | null;
  selectPrompt?: string;
  title?: string;
  onSelectedIdChange: (id: string | null) => void;
};

export function EntityExplorer<TItem extends EntityExplorerItem>({
  emptyLabel = "Nessun elemento",
  icon = <Database className="size-4 text-primary" />,
  items,
  navLabel = "Elementi",
  renderDetails,
  renderItemIcon,
  selectedId,
  selectPrompt = "Seleziona un elemento",
  title = "Explorer",
  onSelectedIdChange,
}: EntityExplorerProps<TItem>) {
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId || !items.some((item) => item.id === selectedId)) {
      const nextSelectedId = items[0]?.id ?? null;

      if (selectedId !== nextSelectedId) {
        onSelectedIdChange(nextSelectedId);
      }
    }
  }, [items, onSelectedIdChange, selectedId]);

  return (
    <aside className="flex h-full min-w-0 flex-col bg-background">
      <header className="flex shrink-0 items-center border-b px-2.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <h2 className="truncate text-sm font-medium">{title}</h2>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[180px_minmax(0,1fr)]">
        <nav aria-label={navLabel} className="min-h-0 overflow-auto border-r p-2">
          {items.length === 0 ? (
            <Empty>{emptyLabel}</Empty>
          ) : (
            items.map((item) => (
              <button
                aria-pressed={item.id === selectedId}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
                  item.id === selectedId && "bg-muted font-medium",
                )}
                key={item.id}
                type="button"
                onClick={() => onSelectedIdChange(item.id)}
              >
                {renderItemIcon?.(item)}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.meta ? (
                  <span className="text-xs text-muted-foreground">{item.meta}</span>
                ) : null}
              </button>
            ))
          )}
        </nav>

        <div className="min-h-0 overflow-auto p-3">
          {selectedItem ? renderDetails(selectedItem) : <Empty>{selectPrompt}</Empty>}
        </div>
      </div>
    </aside>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
