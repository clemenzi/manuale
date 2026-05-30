export type FieldListItem = {
  description?: string;
  id: string;
  label: string;
  tags?: string[];
};

export type FieldListProps = {
  emptyLabel?: string;
  fields: FieldListItem[];
  title?: string;
};

export function FieldList({ emptyLabel = "Nessun elemento", fields, title }: FieldListProps) {
  return (
    <section>
      {title ? <h3 className="mb-2 text-sm font-medium">{title}</h3> : null}
      <div className="divide-y rounded-md border">
        {fields.length === 0 ? <Empty>{emptyLabel}</Empty> : null}

        {fields.map((field) => (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-2" key={field.id}>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{field.label}</p>
              {field.description ? (
                <p className="font-mono text-xs text-muted-foreground">{field.description}</p>
              ) : null}
            </div>

            {field.tags?.length ? (
              <div className="flex items-start gap-1">
                {field.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <span className="rounded border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
