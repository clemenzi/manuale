import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalize } from "pathe";

interface Files {
  [key: string]: string | undefined;
}

export type FilesChangeListener = (
  previousFiles: Readonly<Record<string, string | undefined>>,
  files: Readonly<Record<string, string | undefined>>,
) => void;

export type FilesListener = (files: Readonly<Record<string, string | undefined>>) => void;

export interface VirtualFiles {
  files: Readonly<Record<string, string | undefined>>;
  create: (name: string, content: string) => void;
  clear: () => void;
  onChange: (listener: FilesChangeListener) => () => void;
  remove: (name: string) => void;
  subscribe: (listener: FilesListener) => () => void;
  update: (name: string, content: string) => void;
  get: (name: string) => string | undefined;
}

export function useFiles(): VirtualFiles {
  const [files, setFiles] = useState<Files>({});
  const changeListenersRef = useRef(new Set<FilesChangeListener>());
  const previousFilesRef = useRef<Readonly<Record<string, string | undefined>>>(files);

  const create = useCallback((name: string, content: string) => {
    const normalizedName = normalize(name);

    setFiles((prev) => ({ ...prev, [normalizedName]: content }));
  }, []);

  const update = useCallback((name: string, content: string) => {
    const normalizedName = normalize(name);

    setFiles((prev) =>
      prev[normalizedName] === content ? prev : { ...prev, [normalizedName]: content },
    );
  }, []);

  const remove = useCallback((name: string) => {
    const normalizedName = normalize(name);

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
      const normalizedName = normalize(name);

      if (Object.hasOwn(files, normalizedName)) {
        return files[normalizedName];
      }

      for (const [fileName, content] of Object.entries(files)) {
        if (normalize(fileName) === normalizedName) {
          return content;
        }
      }

      return undefined;
    },
    [files],
  );

  const subscribe = useCallback(
    (listener: FilesListener) => {
      return onChange((_, nextFiles) => {
        listener(nextFiles);
      });
    },
    [onChange],
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
    () => ({ files, create, update, remove, clear, onChange, subscribe, get }),
    [clear, create, files, onChange, remove, subscribe, update, get],
  );
}
