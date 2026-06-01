import { useEditor } from "#/contexts/editor";
import { normalizeFSPath, type FSEntry, type FS } from "#/hooks/fs";
import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { Tree, type NodeRendererProps } from "react-arborist";

type EditorFileTreeNode = {
  children?: EditorFileTreeNode[];
  id: string;
  isDirectory: boolean;
  name: string;
  path: string;
};

export type EditorFileSelection = {
  content: string;
  name: string;
  path: string;
};

type EditorExplorerProps = {
  onFileSelect?: (file: EditorFileSelection) => void;
  rootPath?: string;
};

const ROW_HEIGHT = 28;
const MIN_TREE_HEIGHT = ROW_HEIGHT;
const MAX_TREE_HEIGHT = 480;

export default function EditorExplorer({ onFileSelect, rootPath = "/" }: EditorExplorerProps) {
  const { fs, buffers } = useEditor();
  const [selectedPath, setSelectedPath] = useState<string>();
  const treeData = useMemo(() => buildFileTree(fs, rootPath), [fs, rootPath]);
  const treeHeight = useMemo(() => {
    const nodeCount = countTreeNodes(treeData);

    return Math.min(Math.max(nodeCount * ROW_HEIGHT, MIN_TREE_HEIGHT), MAX_TREE_HEIGHT);
  }, [treeData]);
  const handleActivate = useCallback(
    (node: { data: EditorFileTreeNode }) => {
      if (node.data.isDirectory) {
        return;
      }

      const content = fs.readFile(node.data.path);

      if (content === null) {
        return;
      }

      setSelectedPath(node.data.path);
      onFileSelect?.({
        content,
        name: node.data.name,
        path: node.data.path,
      });

      buffers.setActive(node.data.path);
    },
    [fs, onFileSelect],
  );

  return (
    <div className="bg-accent w-full h-[calc(100vh-70px)]">
      <div className="p-2">
        {treeData.length > 0 ? (
          <Tree<EditorFileTreeNode>
            data={treeData}
            disableDrag
            disableEdit
            disableMultiSelection
            height={treeHeight}
            idAccessor="id"
            indent={16}
            openByDefault
            rowHeight={ROW_HEIGHT}
            selection={selectedPath}
            width="100%"
            onActivate={handleActivate}
          >
            {FileTreeNode}
          </Tree>
        ) : null}
      </div>
    </div>
  );
}

function buildFileTree(fs: FS, rootPath: string): EditorFileTreeNode[] {
  const normalizedRootPath = normalizeFSPath(rootPath);

  return sortFSEntries(fs.readEntries(normalizedRootPath)).map((entry) =>
    toFileTreeNode(fs, entry),
  );
}

function toFileTreeNode(fs: FS, entry: FSEntry): EditorFileTreeNode {
  const children = entry.isDirectory
    ? sortFSEntries(fs.readEntries(entry.path)).map((child) => toFileTreeNode(fs, child))
    : undefined;

  return {
    children,
    id: entry.path,
    isDirectory: entry.isDirectory,
    name: entry.name,
    path: entry.path,
  };
}

function sortFSEntries(entries: FSEntry[]) {
  return [...entries].sort(sortEntries);
}

function sortEntries(first: FSEntry, second: FSEntry) {
  if (first.isDirectory !== second.isDirectory) {
    return first.isDirectory ? -1 : 1;
  }

  return first.name.localeCompare(second.name, "it", { sensitivity: "base" });
}

function countTreeNodes(nodes: EditorFileTreeNode[]): number {
  return nodes.reduce(
    (count, node) => count + 1 + (node.children ? countTreeNodes(node.children) : 0),
    0,
  );
}

function FileTreeNode({ dragHandle, node, style }: NodeRendererProps<EditorFileTreeNode>) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (node.isInternal) {
      node.toggle();
      return;
    }

    node.activate();
  };

  return (
    <div ref={dragHandle} style={style}>
      <button
        aria-expanded={node.isInternal ? node.isOpen : undefined}
        aria-selected={node.isSelected}
        type="button"
        onClick={handleClick}
      >
        {node.isInternal ? (node.isOpen ? "- " : "+ ") : ""}
        {node.data.name}
      </button>
    </div>
  );
}
