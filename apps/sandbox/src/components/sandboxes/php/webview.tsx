import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { usePHP } from "#/contexts/php";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import { Table, TableBody, TableCell, TableRow } from "#/components/ui/table";
import { ArrowRight01Icon, Loading03Icon, ServerStack01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PHPRequestHandler, PHPResponse, type HTTPMethod } from "@php-wasm/universal";
import { useCallback, useEffect, useState } from "react";

const PHP_DEFAULT_URL = "/index.php";

export function Webview() {
  const { php } = usePHP();
  const [method, setMethod] = useState<HTTPMethod>("GET");
  const [url, setUrl] = useState(PHP_DEFAULT_URL);
  const [response, setResponse] = useState<PHPResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMethodChange = useCallback((value: HTTPMethod | null) => {
    if (value) {
      setMethod(value);
    }
  }, []);

  const handleUrlChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!php) return;

      const handler = new PHPRequestHandler({ phpFactory: async () => php });
      const requestUrl = url.trim() || "/";

      (async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
          const response = await handler.request({
            method,
            url: requestUrl,
          });

          setResponse(response);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "Richiesta non riuscita");
        } finally {
          setIsLoading(false);
        }
      })();
    },
    [method, php, url],
  );

  useEffect(() => {
    if (!php || response || isLoading) {
      return;
    }

    handleSubmit();
  }, [handleSubmit, isLoading, php, response]);

  const isSuccess = response ? response.httpStatusCode < 400 : false;

  return (
    <div className="h-full bg-muted/20">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={74} minSize={38} className="min-h-0">
          <form
            className="grid min-w-0 grid-cols-[5.75rem_minmax(0,1fr)_2rem] items-center gap-1.5 border-b bg-muted/20 p-1"
            onSubmit={handleSubmit}
          >
            <Select value={method} onValueChange={handleMethodChange}>
              <SelectTrigger className="w-full bg-background" size="sm">
                <SelectValue placeholder="METHOD" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Input
              className="h-8 flex-1 bg-background font-mono text-sm"
              placeholder="/"
              value={url}
              onChange={handleUrlChange}
            />

            <Button
              type="submit"
              size="icon-sm"
              disabled={!php || isLoading}
              aria-label="Invia request"
            >
              {isLoading ? (
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
              ) : (
                <HugeiconsIcon icon={ArrowRight01Icon} />
              )}
            </Button>
          </form>

          <iframe
            title="PHP webview"
            srcDoc={response?.text}
            className="h-full w-full flex-1 overflow-auto bg-white"
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={26} minSize={16} className="min-h-0">
          <Card className="h-full gap-0 rounded-none py-0">
            <CardContent className="min-h-0 flex-1 overflow-auto p-0">
              {errorMessage ? (
                <div className="m-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : response ? (
                <>
                  <div className="flex h-8 items-center justify-between border-b bg-muted/20 px-2">
                    <span
                      className="rounded-md border px-2 py-0.5 font-mono text-xs data-[is-success=true]:border-emerald-500/25 data-[is-success=true]:bg-emerald-500/10 data-[is-success=true]:text-emerald-700 data-[is-success=false]:border-red-500/25 data-[is-success=false]:bg-red-500/10 data-[is-success=false]:text-red-700"
                      data-is-success={isSuccess}
                    >
                      {response.httpStatusCode}
                    </span>
                    <span className="truncate pl-3 font-mono text-xs text-muted-foreground">
                      {url || "/"}
                    </span>
                  </div>

                  <Table>
                    <TableBody>
                      {Object.entries(response.headers ?? {}).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="w-[38%] max-w-0 truncate py-1.5 pl-2 pr-3 font-mono text-xs font-medium uppercase text-muted-foreground">
                            {key}
                          </TableCell>
                          <TableCell className="min-w-0 wrap-break-words py-1.5 pl-3 pr-2 text-right font-mono text-xs whitespace-normal">
                            {String(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="m-2 flex h-[calc(100%-1rem)] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 text-muted-foreground">
                  <HugeiconsIcon icon={ServerStack01Icon} className="size-7" />
                  <p className="text-sm">Nessuna risposta</p>
                </div>
              )}
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
