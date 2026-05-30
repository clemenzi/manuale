import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { usePHP } from "#/contexts/php";
import { FileAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";

const PHP_WORKDIR = "/www";

function normalizeFilePath(fileName: string) {
  const parts = fileName.trim().split("/").filter(Boolean);

  if (parts.length === 0 || parts.some((part) => part === "." || part === "..")) {
    return null;
  }

  return `${PHP_WORKDIR}/${parts.join("/")}`;
}

function ensureParentDirectory(php: NonNullable<ReturnType<typeof usePHP>["php"]>, path: string) {
  const parentPath = path.split("/").slice(0, -1).join("/") || "/";

  if (parentPath !== "/" && !php.isDir(parentPath)) {
    php.mkdir(parentPath);
  }
}

export function NewFileDialog({ onClose }: { onClose?: () => void }) {
  const { php } = usePHP();
  const [fileName, setFileName] = useState("");

  const handleCreate = useCallback(() => {
    if (!php) {
      return;
    }

    const filePath = normalizeFilePath(fileName);

    if (!filePath) {
      return;
    }

    ensureParentDirectory(php, filePath);
    php.writeFile(filePath, "<?php\n\n?>");
    setFileName("");
    onClose?.();
  }, [fileName, onClose, php]);

  const handleFileNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  }, []);

  return (
    <Dialog>
      <DialogTrigger
        render={<Button aria-label="Crea un nuovo file" size="icon-sm" variant="ghost" />}
      >
        <HugeiconsIcon icon={FileAddIcon} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuovo File</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="link"
              placeholder="index.php, rotta/index.php, rotta.php"
              value={fileName}
              onChange={handleFileNameChange}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" onClick={handleCreate} />}>
            Crea File
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
