import { useCallback, useMemo, useState } from "react";

export interface FS {
  files: ReadonlyMap<string, string>;
  version: number;
  clear: () => void;
  deleteFile: (path: string) => void;
  exists: (path: string) => boolean;
  readEntries: (path: string) => FSEntry[];
  readFile: (path: string) => string | null;
  writeFile: (path: string, content: string) => void;
}

export type FSEntry = {
  isDirectory: boolean;
  name: string;
  path: string;
};

type FSState = {
  files: Map<string, string>;
  version: number;
};

const INITIAL_STATE: FSState = {
  files: new Map(),
  version: 0,
};

export function normalizeFSPath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return `/${path.split("/").filter(Boolean).join("/")}`;
}

function joinFSPath(basePath: string, name: string) {
  const normalizedBasePath = normalizeFSPath(basePath);

  if (normalizedBasePath === "/") {
    return `/${name}`;
  }

  return `${normalizedBasePath}/${name}`;
}

function readEntriesFromFiles(files: ReadonlyMap<string, string>, path: string) {
  const entries = new Map<string, FSEntry>();
  const normalizedPath = normalizeFSPath(path);
  const prefix = normalizedPath === "/" ? "/" : `${normalizedPath}/`;

  for (const filePath of files.keys()) {
    if (filePath === normalizedPath) {
      continue;
    }

    if (normalizedPath !== "/" && !filePath.startsWith(prefix)) {
      continue;
    }

    const relativePath = filePath.slice(prefix.length);

    if (!relativePath) {
      continue;
    }

    const [name, ...rest] = relativePath.split("/");
    const existingEntry = entries.get(name);
    const isDirectory = rest.length > 0;

    if (existingEntry?.isDirectory && !isDirectory) {
      continue;
    }

    entries.set(name, {
      name,
      path: joinFSPath(normalizedPath, name),
      isDirectory,
    });
  }

  return [...entries.values()];
}

/**
 * Creates a reactive virtual file system.
 */
export function useFS(initialFiles?: Iterable<readonly [string, string]>): FS {
  const [state, setState] = useState<FSState>(() => ({
    files: new Map(
      [...(initialFiles ?? [])].map(([path, content]) => [normalizeFSPath(path), content]),
    ),
    version: 0,
  }));

  const readFile = useCallback(
    (path: string) => state.files.get(normalizeFSPath(path)) ?? null,
    [state.files],
  );

  const exists = useCallback(
    (path: string) => state.files.has(normalizeFSPath(path)),
    [state.files],
  );

  const readEntries = useCallback(
    (path: string) => readEntriesFromFiles(state.files, path),
    [state.files],
  );

  const writeFile = useCallback((path: string, content: string) => {
    const normalizedPath = normalizeFSPath(path);

    setState((currentState) => {
      if (currentState.files.get(normalizedPath) === content) {
        return currentState;
      }

      const files = new Map(currentState.files);
      files.set(normalizedPath, content);

      return {
        files,
        version: currentState.version + 1,
      };
    });
  }, []);

  const deleteFile = useCallback((path: string) => {
    const normalizedPath = normalizeFSPath(path);

    setState((currentState) => {
      if (!currentState.files.has(normalizedPath)) {
        return currentState;
      }

      const files = new Map(currentState.files);
      files.delete(normalizedPath);

      return {
        files,
        version: currentState.version + 1,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((currentState) => {
      if (currentState.files.size === 0) {
        return currentState;
      }

      return INITIAL_STATE;
    });
  }, []);

  return useMemo(
    () => ({
      files: state.files,
      version: state.version,
      clear,
      deleteFile,
      exists,
      readEntries,
      readFile,
      writeFile,
    }),
    [clear, deleteFile, exists, readEntries, readFile, state.files, state.version, writeFile],
  );
}
