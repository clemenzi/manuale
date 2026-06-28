import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalize } from "pathe";

interface Files {
  [key: string]: string | undefined;
}

type InitialFiles = Readonly<Record<string, string | undefined>>;

function normalizeVirtualFilePath(path: string) {
  return normalize(path);
}

export type FilesChangeListener = (
  previousFiles: Readonly<Record<string, string | undefined>>,
  files: Readonly<Record<string, string | undefined>>,
) => void;

export interface VirtualFiles {
  files: Readonly<Record<string, string | undefined>>;
  create: (name: string, content: string) => void;
  clear: () => void;
  onChange: (listener: FilesChangeListener) => () => void;
  remove: (name: string) => void;
  update: (name: string, content: string) => void;
  get: (name: string) => string | undefined;
}

function createInitialFiles(initialFiles: InitialFiles): Files {
  return Object.fromEntries(
    Object.entries(initialFiles).map(([path, content]) => [
      normalizeVirtualFilePath(path),
      content,
    ]),
  );
}

export function useFiles(initialFiles: InitialFiles = {}): VirtualFiles {
  const [files, setFiles] = useState<Files>(() => createInitialFiles(initialFiles));
  const changeListenersRef = useRef(new Set<FilesChangeListener>());
  const previousFilesRef = useRef<Readonly<Record<string, string | undefined>>>(files);

  const create = useCallback((name: string, content: string) => {
    const normalizedName = normalizeVirtualFilePath(name);

    setFiles((prev) => ({ ...prev, [normalizedName]: content }));
  }, []);

  const update = useCallback((name: string, content: string) => {
    const normalizedName = normalizeVirtualFilePath(name);

    setFiles((prev) =>
      prev[normalizedName] === content ? prev : { ...prev, [normalizedName]: content },
    );
  }, []);

  const remove = useCallback((name: string) => {
    const normalizedName = normalizeVirtualFilePath(name);

    setFiles((prev) => {
      if (!(normalizedName in prev)) {
        return prev;
      }

      const nextFiles = { ...prev };
      delete nextFiles[normalizedName];

      return nextFiles;
    });
  }, []);

  const clear = useCallback(() => {
    setFiles((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  const onChange = useCallback((listener: FilesChangeListener) => {
    changeListenersRef.current.add(listener);

    return () => {
      changeListenersRef.current.delete(listener);
    };
  }, []);

  const get = useCallback(
    (name: string) => {
      return files[normalizeVirtualFilePath(name)];
    },
    [files],
  );

  useEffect(() => {
    const previousFiles = previousFilesRef.current;

    if (previousFiles === files) {
      return;
    }

    previousFilesRef.current = files;
    changeListenersRef.current.forEach((listener) => listener(previousFiles, files));
  }, [files]);

  return useMemo(
    () => ({ files, create, update, remove, clear, onChange, get }),
    [clear, create, files, get, onChange, remove, update],
  );
}
