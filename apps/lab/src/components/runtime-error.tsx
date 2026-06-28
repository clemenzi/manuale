import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";

type RuntimeErrorProps = {
  error: Error | null;
  fallbackMessage: string;
  onRetry: () => void | Promise<void>;
  title: string;
};

export function RuntimeError({ error, fallbackMessage, onRetry, title }: RuntimeErrorProps) {
  return (
    <main className="grid h-full min-h-0 place-items-center bg-background px-6">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{error?.message ?? fallbackMessage}</p>
          <Button variant="outline" onClick={() => void onRetry()}>
            Riprova
          </Button>
        </AlertDescription>
      </Alert>
    </main>
  );
}
