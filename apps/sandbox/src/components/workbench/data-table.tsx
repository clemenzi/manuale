import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { cn } from "#/lib/utils";
import type { ReactNode } from "react";

export type DataTableProps<TValue = unknown> = {
  bordered?: boolean;
  columns: string[];
  emptyLabel?: string;
  renderValue?: (value: TValue, rowIndex: number, columnIndex: number) => ReactNode;
  rowNumberHeading?: string;
  rows: TValue[][];
  title?: string;
};

export function DataTable<TValue = unknown>({
  bordered = true,
  columns,
  emptyLabel = "Nessun dato",
  renderValue = (value) => String(value ?? ""),
  rowNumberHeading,
  rows,
  title,
}: DataTableProps<TValue>) {
  return (
    <section>
      {title ? <h3 className="mb-2 text-sm font-medium">{title}</h3> : null}
      <div className={cn(bordered && "overflow-hidden rounded-md border")}>
        {columns.length === 0 ? (
          <Empty>{emptyLabel}</Empty>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                {rowNumberHeading ? (
                  <TableHead className="w-10 text-muted-foreground">{rowNumberHeading}</TableHead>
                ) : null}
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="h-16 text-center text-muted-foreground"
                    colSpan={columns.length + (rowNumberHeading ? 1 : 0)}
                  >
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {rowNumberHeading ? (
                      <TableCell className="text-xs text-muted-foreground">
                        {rowIndex + 1}
                      </TableCell>
                    ) : null}
                    {columns.map((column, columnIndex) => (
                      <TableCell
                        className="max-w-80 overflow-hidden text-ellipsis"
                        key={`${rowIndex}-${column}-${columnIndex}`}
                      >
                        {renderValue(row[columnIndex] as TValue, rowIndex, columnIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

function Empty({ children }: { children: string }) {
  return (
    <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
