import { useFiles, type VirtualFiles } from "#/hooks/files";
import { normalize } from "pathe";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

type TableResult = {
  type: "table";
  data: Record<string, unknown>[];
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
    setResults: (results: WorkbenchOutputResult[]) => void;
  };
};

export const WorkbenchContext = createContext<WorkbenchContextProps | null>(null);

type WorkbenchProviderProps = {
  children: ReactNode;
  initialActiveBuffer?: string;
  initialBuffers?: string[];
  initialFiles?: Readonly<Record<string, string | undefined>>;
};

type BufferState = {
  active: string;
  list: string[];
};

type BufferAction =
  | { type: "add"; path: string }
  | { type: "remove"; path: string }
  | { type: "set-active"; path: string };

type InitialBufferState = Pick<WorkbenchProviderProps, "initialActiveBuffer" | "initialBuffers">;

function normalizeBufferPath(path: string) {
  return normalize(path);
}

function ensureBufferListIncludes(list: string[], path: string) {
  return list.includes(path) ? list : [...list, path];
}

function getNextActiveBuffer(
  activePath: string,
  removedPath: string,
  remainingBuffers: string[],
  removedIndex: number,
) {
  if (activePath !== removedPath) {
    return activePath;
  }

  return remainingBuffers[removedIndex] ?? remainingBuffers[removedIndex - 1] ?? "";
}

function createInitialBufferState({
  initialActiveBuffer,
  initialBuffers = [],
}: InitialBufferState): BufferState {
  const list = [...new Set(initialBuffers.map(normalizeBufferPath))];
  const active = initialActiveBuffer ? normalizeBufferPath(initialActiveBuffer) : (list[0] ?? "");

  return {
    active,
    list: active ? ensureBufferListIncludes(list, active) : list,
  };
}

function bufferReducer(state: BufferState, action: BufferAction): BufferState {
  switch (action.type) {
    case "add": {
      const path = normalizeBufferPath(action.path);
      const nextList = ensureBufferListIncludes(state.list, path);

      return {
        active: state.active || path,
        list: nextList,
      };
    }
    case "remove": {
      const path = normalizeBufferPath(action.path);
      const removedIndex = state.list.indexOf(path);

      if (removedIndex === -1) {
        return state;
      }

      const nextList = state.list.filter((bufferPath) => bufferPath !== path);

      return {
        active: getNextActiveBuffer(state.active, path, nextList, removedIndex),
        list: nextList,
      };
    }
    case "set-active": {
      const path = normalizeBufferPath(action.path);

      return {
        active: path,
        list: ensureBufferListIncludes(state.list, path),
      };
    }
    default: {
      return state;
    }
  }
}

export function WorkbenchProvider({
  children,
  initialActiveBuffer,
  initialBuffers,
  initialFiles,
}: WorkbenchProviderProps) {
  const files = useFiles(initialFiles);
  const [bufferState, dispatchBuffer] = useReducer(
    bufferReducer,
    { initialActiveBuffer, initialBuffers },
    createInitialBufferState,
  );
  const [outputErrors, setOutputErrors] = useState<string[]>([]);
  const [outputResults, setOutputResults] = useState<WorkbenchContextProps["output"]["results"]>(
    [],
  );

  const addBuffer = useCallback((path: string) => {
    dispatchBuffer({ type: "add", path });
  }, []);

  const removeBuffer = useCallback((path: string) => {
    dispatchBuffer({ type: "remove", path });
  }, []);

  const setCurrentActiveBuffer = useCallback((path: string) => {
    dispatchBuffer({ type: "set-active", path });
  }, []);

  const buffers = useMemo(
    () => ({
      active: bufferState.active,
      list: bufferState.list,
      add: addBuffer,
      remove: removeBuffer,
      setActive: setCurrentActiveBuffer,
    }),
    [addBuffer, bufferState.active, bufferState.list, removeBuffer, setCurrentActiveBuffer],
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
