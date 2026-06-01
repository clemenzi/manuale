import { useFS, type FS } from "#/hooks/fs";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type EditorContextProps = {
  fs: FS;
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
  const fs = useFS();
  const [activeBuffer, setActiveBuffer] = useState<string>("");
  const [bufferList, setBufferList] = useState<string[]>([]);

  const addBuffer = useCallback((path: string) => {
    setBufferList((list) => (list.includes(path) ? list : [...list, path]));
    setActiveBuffer((active) => active || path);
  }, []);

  const removeBuffer = useCallback((path: string) => {
    setBufferList((list) => {
      const removedIndex = list.indexOf(path);

      if (removedIndex === -1) {
        return list;
      }

      const nextList = list.filter((p) => p !== path);

      setActiveBuffer((active) =>
        active === path ? (nextList[removedIndex] ?? nextList[removedIndex - 1] ?? "") : active,
      );

      return nextList;
    });
  }, []);

  const setCurrentActiveBuffer = useCallback((path: string) => {
    setActiveBuffer(path);
    setBufferList((list) => (list.includes(path) ? list : [...list, path]));
  }, []);

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
      fs,
      buffers,
    }),
    [buffers, fs],
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
