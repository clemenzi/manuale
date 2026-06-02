import type { PHPResponse } from "@php-wasm/universal";
import { Badge } from "@/components/ui/badge";
import { cn } from "#/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

const STATUS_CODES: Record<string, string> = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "103": "Early Hints",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a Teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Too Early",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required",
};

export default function Request({ response }: { response: PHPResponse }) {
  const { errors, httpStatusCode, bytes, exitCode, headers } = response;

  return (
    <div className="p-2 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              httpStatusCode >= 200 && httpStatusCode < 300
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "",
              httpStatusCode >= 400 && httpStatusCode < 500
                ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                : "",
              httpStatusCode >= 500
                ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                : "",
            )}
            variant="outline"
          >
            {httpStatusCode}
          </Badge>

          <span className="text-sm text-foreground">{STATUS_CODES[httpStatusCode.toString()]}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={"outline"}>{bytes.length} bytes</Badge>
          <Badge variant={exitCode !== 0 ? "destructive" : "secondary"}>
            Codice di uscita: {exitCode}
          </Badge>
        </div>
      </div>

      {errors && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} />
          <AlertTitle>Errore della richiesta! PHP ha restituito un errore.</AlertTitle>
          <AlertDescription>{errors}</AlertDescription>
        </Alert>
      )}

      {headers && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(headers).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
