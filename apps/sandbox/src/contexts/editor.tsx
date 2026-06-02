import { useFiles, type VirtualFiles } from "#/hooks/files";
import { normalize } from "pathe";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type EditorContextProps = {
  files: VirtualFiles;
  buffers: {
    active: string;
    list: string[];
    add: (path: string) => void;
    remove: (path: string) => void;
    setActive: (path: string) => void;
  };
};

export const EditorContext = createContext<EditorContextProps | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const files = useFiles();
  const [activeBuffer, setActiveBuffer] = useState<string>("");
  const [bufferList, setBufferList] = useState<string[]>([]);

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

  const value = useMemo(
    () => ({
      files,
      buffers,
    }),
    [buffers, files],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);

  if (context === null) {
    throw new Error("useEditor must be used within an EditorProvider");
  }

  return context;
}
