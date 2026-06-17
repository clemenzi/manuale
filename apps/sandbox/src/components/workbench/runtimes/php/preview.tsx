import { usePHP } from "#/contexts/php";
import { useCallback, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { PHPRequestHandler, PHPResponse, type HTTPMethod } from "@php-wasm/universal";
import { HugeiconsIcon } from "@hugeicons/react";
import { Navigation03Icon } from "@hugeicons/core-free-icons";

export default function Preview({ onResponse }: { onResponse?: (response: PHPResponse) => void }) {
  const { php } = usePHP();
  const [method, setMethod] = useState<HTTPMethod>("GET");
  const [url, setUrl] = useState("/index.php");
  const [body, setBody] = useState("");

  const handleMethodChange = useCallback((value: HTTPMethod | null) => {
    if (value) {
      setMethod(value);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!php) return;

    const handler = new PHPRequestHandler({
      phpFactory: async () => php,
    });

    handler.request({ url, method, body }).then((response) => {
      setBody(response.text);
      onResponse?.(response);
    });
  }, [php, url, method, body]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden p-1.5">
      <InputGroup className="min-w-0 shrink-0">
        <InputGroupAddon>
          <Select value={method} onValueChange={handleMethodChange}>
            <SelectTrigger className="border-none">
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
        </InputGroupAddon>
        <InputGroupInput
          className="min-w-0"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <InputGroupButton onClick={handleSubmit}>
          <HugeiconsIcon icon={Navigation03Icon} />
        </InputGroupButton>
      </InputGroup>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-white">
        {body ? (
          <iframe title="PHP preview" srcDoc={body} className="h-full w-full border-0" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-gray-500 flex">
              Nessun contenuto! Prova a inviare una richiesta con il bottone "
              <HugeiconsIcon icon={Navigation03Icon} width={20} height={20} />"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
