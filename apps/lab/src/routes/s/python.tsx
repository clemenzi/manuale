import { WorkbenchEditor } from "#/components/workbench/editor";
import { WorkbenchOutput } from "#/components/workbench/output";
import { PageLoader } from "#/components/page-loader";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "#/components/ui/resizable";
import {
  PythonProvider,
  usePython,
  usePythonFileSync,
  type PythonExecutionResult,
} from "#/contexts/python";
import { WorkbenchProvider, useWorkbench } from "#/contexts/workbench";
import { createFileRoute } from "@tanstack/react-router";
import { RuntimeError } from "#/components/runtime-error";

const PYTHON_FILE = "main.py";

const DEFAULT_CONTENT = `nome = "MANUALE LAB"

for numero in range(1, 4):
    print(f"{numero}. Ciao da Python su WebAssembly, {nome}!")
`;

export const Route = createFileRoute("/s/python")({
  head: () => ({
    meta: [
      { title: "Sandbox Python Gratuita - Manuale Lab" },
      { name: "description", content: "Sandbox online gratuita per Python" },
      { name: "keywords", content: "Python, sandbox, online, gratuita, manuale.dev" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PythonProvider>
      <WorkbenchProvider
        initialActiveBuffer={PYTHON_FILE}
        initialBuffers={[PYTHON_FILE]}
        initialFiles={{ [PYTHON_FILE]: DEFAULT_CONTENT }}
      >
        <PythonWorkbench />
      </WorkbenchProvider>
    </PythonProvider>
  );
}

function PythonWorkbench() {
  const { files, output } = useWorkbench();
  const { error, execute, resetEnvironment, status } = usePython();

  usePythonFileSync(files);

  const handleRun = async () => {
    let result: PythonExecutionResult;

    try {
      result = await execute(files.get(PYTHON_FILE) ?? "", {
        filename: PYTHON_FILE,
      });
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Errore sconosciuto durante l'esecuzione del codice.";

      output.setResults([]);
      output.setErrors([message]);
      return;
    }

    if (result.exitCode !== 0) {
      output.setResults([]);
      output.setErrors([result.stderr || "Errore sconosciuto durante l'esecuzione del codice."]);
      return;
    }

    output.setErrors([]);
    output.setResults([
      {
        type: "string",
        data: formatPythonOutput(result),
      },
    ]);
  };

  if (status === "loading") {
    return <PageLoader />;
  }

  if (status === "error") {
    return (
      <RuntimeError
        error={error}
        fallbackMessage="Python non si è inizializzato correttamente."
        title="Impossibile avviare Python"
        onRetry={resetEnvironment}
      />
    );
  }

  return (
    <main className="h-full min-h-0 bg-background">
      <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"58%"}>
          <WorkbenchEditor bufferline={false} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel className="min-h-0 overflow-hidden" defaultSize={"42%"}>
          <WorkbenchOutput onRun={handleRun} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

function formatPythonOutput(result: PythonExecutionResult) {
  const outputChunks = [result.stdout, result.stderr].filter(Boolean);

  if (outputChunks.length > 0) {
    return outputChunks.join("\n");
  }

  if (result.result !== undefined && result.result !== null) {
    return String(result.result);
  }

  return "Programma eseguito.";
}
