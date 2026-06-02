import { useEditor } from "#/contexts/editor";
import { useCallback, useMemo, useState } from "react";
import { Tree } from "react-arborist";
import { CreateFileDialog, DeleteFileDialog, RenameFileDialog } from "./dialogs";
import { FileTreeNode } from "./node";

export type EditorFileTreeNode = {
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
  const { files, buffers } = useEditor();
  const [deletingPath, setDeletingPath] = useState<string>();
  const [renamingPath, setRenamingPath] = useState<string>();
  const [selectedPath, setSelectedPath] = useState<string>();
  const treeData = useMemo(() => buildFileTree(files.files, rootPath), [files.files, rootPath]);
  const treeHeight = useMemo(() => {
    const nodeCount = countTreeNodes(treeData);

    return Math.min(Math.max(nodeCount * ROW_HEIGHT, MIN_TREE_HEIGHT), MAX_TREE_HEIGHT);
  }, [treeData]);
  const handleActivate = useCallback(
    (node: { data: EditorFileTreeNode }) => {
      if (node.data.isDirectory) {
        return;
      }

      const content = files.files[node.data.path];

      if (content === undefined) {
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
    [buffers, files.files, onFileSelect],
  );
  const handleRenameOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setRenamingPath(undefined);
    }
  }, []);
  const handleDeleteOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDeletingPath(undefined);
    }
  }, []);

  return (
    <div className="bg-accent w-full h-[calc(100vh-70px)]">
      <div className="flex justify-between items-center border-b p-2">
        <span className="font-bold">Explorer</span>

        <div className="flex items-center">
          <CreateFileDialog />
        </div>
      </div>
      <div className="p-0.5">
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
            {(props) => (
              <FileTreeNode
                {...props}
                onDeleteOpen={setDeletingPath}
                onRenameOpen={setRenamingPath}
              />
            )}
          </Tree>
        ) : null}
      </div>
      {deletingPath ? (
        <DeleteFileDialog open onOpenChange={handleDeleteOpenChange} path={deletingPath} />
      ) : null}
      {renamingPath ? (
        <RenameFileDialog open onOpenChange={handleRenameOpenChange} path={renamingPath} />
      ) : null}
    </div>
  );
}

type FilesRecord = Readonly<Record<string, string | undefined>>;

type FileTreeDraftNode = {
  children?: FileTreeDraftNode[];
  id: string;
  isDirectory: boolean;
  name: string;
  normalizedPath: string;
  path: string;
};

function buildFileTree(files: FilesRecord, rootPath: string): EditorFileTreeNode[] {
  const normalizedRootPath = normalizeFilePath(rootPath);
  const root = createDirectoryNode("", normalizedRootPath);

  for (const path of Object.keys(files)) {
    if (files[path] === undefined) {
      continue;
    }

    const normalizedPath = normalizeFilePath(path);
    const relativePath = getRelativePath(normalizedPath, normalizedRootPath);

    if (relativePath === null || relativePath === "") {
      continue;
    }

    addFileNode(root, path, relativePath);
  }

  return sortTree(root.children);
}

function addFileNode(parent: FileTreeDraftNode, originalPath: string, relativePath: string) {
  const segments = relativePath.split("/").filter(Boolean);
  const isExplicitDirectory = originalPath.endsWith("/");
  let currentParent = parent;

  segments.forEach((segment, index) => {
    const isLastSegment = index === segments.length - 1;
    const isFile = isLastSegment && !isExplicitDirectory;

    if (isFile) {
      currentParent.children?.push({
        id: originalPath,
        isDirectory: false,
        name: segment,
        normalizedPath: normalizeFilePath(originalPath),
        path: originalPath,
      });
      return;
    }

    const path = joinFilePath(currentParent.normalizedPath, segment);
    let directory = currentParent.children?.find(
      (child): child is FileTreeDraftNode => child.isDirectory && child.normalizedPath === path,
    );

    if (!directory) {
      directory = createDirectoryNode(
        segment,
        path,
        isLastSegment && isExplicitDirectory ? originalPath : path,
      );
      currentParent.children?.push(directory);
    }

    currentParent = directory;
  });
}

function createDirectoryNode(
  name: string,
  normalizedPath: string,
  path = normalizedPath,
): FileTreeDraftNode {
  return {
    children: [],
    id: path,
    isDirectory: true,
    name,
    normalizedPath,
    path,
  };
}

function sortTree(nodes: FileTreeDraftNode[] = []): EditorFileTreeNode[] {
  return [...nodes].sort(sortEntries).map(toFileTreeNode);
}

function toFileTreeNode(node: FileTreeDraftNode): EditorFileTreeNode {
  return {
    children: node.isDirectory ? sortTree(node.children) : undefined,
    id: node.id,
    isDirectory: node.isDirectory,
    name: node.name,
    path: node.path,
  };
}

function sortEntries(first: EditorFileTreeNode, second: EditorFileTreeNode) {
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

function normalizeFilePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return `/${path.split("/").filter(Boolean).join("/")}`;
}

function joinFilePath(basePath: string, name: string) {
  return basePath === "/" ? `/${name}` : `${basePath}/${name}`;
}

function getRelativePath(path: string, rootPath: string) {
  if (rootPath === "/") {
    return path.slice(1);
  }

  if (path === rootPath) {
    return "";
  }

  const rootPrefix = `${rootPath}/`;

  return path.startsWith(rootPrefix) ? path.slice(rootPrefix.length) : null;
}
