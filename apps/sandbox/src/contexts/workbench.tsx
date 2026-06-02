import { useFiles, type VirtualFiles } from "#/hooks/files";
import { normalize } from "pathe";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type TableResult = {
  type: "table";
  data: Record<string, any>[];
};

type StringOutput = {
  type: "string";
  data: string;
};

type WorkbenchOutputResult = TableResult | StringOutput;

type WorkbenchContextProps = {
  files: VirtualFiles;
  buffers: {
    active: string;
    list: string[];
    add: (path: string) => void;
    remove: (path: string) => void;
    setActive: (path: string) => void;
  };
  output: {
    errors: string[];
    results: WorkbenchOutputResult[];
    setErrors: (errors: string[]) => void;
    setResults: (errors: WorkbenchOutputResult[]) => void;
  };
};

export const WorkbenchContext = createContext<WorkbenchContextProps | null>(null);

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const files = useFiles();
  const [activeBuffer, setActiveBuffer] = useState<string>("");
  const [bufferList, setBufferList] = useState<string[]>([]);
  const [outputErrors, setOutputErrors] = useState<string[]>([]);
  const [outputResults, setOutputResults] = useState<WorkbenchContextProps["output"]["results"]>(
    [],
  );

  const normalizeBufferPath = useCallback((path: string) => normalize(path), []);

  const addBuffer = useCallback(
    (path: string) => {
      const normalizedPath = normalizeBufferPath(path);

      setBufferList((list) => (list.includes(normalizedPath) ? list : [...list, normalizedPath]));
      setActiveBuffer((active) => active || normalizedPath);
    },
    [normalizeBufferPath],
  );

  const removeBuffer = useCallback(
    (path: string) => {
      const normalizedPath = normalizeBufferPath(path);

      setBufferList((list) => {
        const removedIndex = list.indexOf(normalizedPath);

        if (removedIndex === -1) {
          return list;
        }

        const nextList = list.filter((p) => p !== normalizedPath);

        setActiveBuffer((active) =>
          active === normalizedPath
            ? (nextList[removedIndex] ?? nextList[removedIndex - 1] ?? "")
            : active,
        );

        return nextList;
      });
    },
    [normalizeBufferPath],
  );

  const setCurrentActiveBuffer = useCallback(
    (path: string) => {
      const normalizedPath = normalizeBufferPath(path);

      setActiveBuffer(normalizedPath);
      setBufferList((list) => (list.includes(normalizedPath) ? list : [...list, normalizedPath]));
    },
    [normalizeBufferPath],
  );

  const buffers = useMemo(
    () => ({
      active: activeBuffer,
      list: bufferList,
      add: addBuffer,
      remove: removeBuffer,
      setActive: setCurrentActiveBuffer,
    }),
    [activeBuffer, addBuffer, bufferList, removeBuffer, setCurrentActiveBuffer],
  );

  const output = useMemo(
    () => ({
      errors: outputErrors,
      setErrors: setOutputErrors,
      results: outputResults,
      setResults: setOutputResults,
    }),
    [outputErrors, setOutputErrors, outputResults, setOutputResults],
  );

  const value = useMemo(
    () => ({
      files,
      buffers,
      output,
    }),
    [buffers, files, output],
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbench() {
  const context = useContext(WorkbenchContext);

  if (context === null) {
    throw new Error("useWorkbench must be used within a WorkbenchProvider");
  }

  return context;
}
