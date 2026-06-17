import { useWorkbench } from "#/contexts/workbench";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "#/components/ui/tabs";
import { Play } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertTitle } from "../ui/alert";

export function WorkbenchOutput({ onRun }: { onRun?: () => void }) {
  const { output } = useWorkbench();
  const hasOutput = output.errors.length > 0 || output.results.length > 0;

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <Tabs
        defaultValue="output"
        className="flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden"
      >
        <TabsList
          variant="line"
          className="min-h-10 w-full shrink-0 items-center justify-between rounded-none border-b px-2"
        >
          <div>
            <TabsTrigger value="output">Output</TabsTrigger>
          </div>
          <div>
            <Button onClick={onRun}>
              <HugeiconsIcon icon={Play} />
              Esegui
            </Button>
          </div>
        </TabsList>
        <TabsContent value="output" className="min-h-0 flex-1 overflow-hidden p-2">
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              <div className="flex min-h-full min-w-0 flex-col gap-3 pr-1">
                {!hasOutput ? (
                  <div className="flex flex-1 items-center justify-center rounded-md border border-dashed bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
                    Esegui una query per vedere il risultato qui.
                  </div>
                ) : (
                  <>
                    {output.errors.map((error, index) => (
                      <Alert key={`${error}-${index}`} variant="destructive" className="shrink-0">
                        <AlertTitle>{error}</AlertTitle>
                      </Alert>
                    ))}

                    {output.results.map((result, index) => {
                      if (result.type === "string") {
                        return (
                          <pre
                            key={index}
                            className="overflow-auto rounded-md border bg-muted/20 p-3 text-sm whitespace-pre-wrap [scrollbar-gutter:stable]"
                          >
                            {result.data}
                          </pre>
                        );
                      }

                      const columns = Object.keys(result.data[0] ?? {});
                      const rows = result.data.map((row) => columns.map((column) => row[column]));

                      return (
                        <div
                          key={index}
                          className="min-w-0 overflow-x-auto rounded-md [scrollbar-gutter:stable]"
                        >
                          <OutputTable columns={columns} rows={rows} />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OutputTable({ columns, rows }: { columns: string[]; rows: Array<Array<unknown>> }) {
  if (columns.length === 0 || rows.length === 0) {
    return (
      <div className="rounded-md border bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
        Nessun dato
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {row.map((value, valueIndex) => (
              <TableCell key={`${columns[valueIndex]}-${rowIndex}`}>
                <span className="font-mono text-xs">{String(value ?? "NULL")}</span>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
