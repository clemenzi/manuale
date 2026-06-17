import { Button } from "../../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilePlusIcon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "../../ui/input";
import { useCallback, useEffect, useState } from "react";
import { useWorkbench } from "#/contexts/workbench";

export function DeleteFileDialog({
  open,
  onOpenChange,
  path,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
}) {
  const { buffers, files } = useWorkbench();

  const handleDelete = useCallback(() => {
    files.remove(path);
    buffers.remove(path);
    onOpenChange(false);
  }, [buffers, files, onOpenChange, path]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sei sicuro di voler cancellare il file?</DialogTitle>
          <DialogDescription>
            Sei sicuro di voler cancellare il file? Questa azione è irreversibile e può comportare
            la perdita dei dati.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>
            <Button variant="secondary">Annulla</Button>
          </DialogClose>
          <DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Cancella il file
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RenameFileDialog({
  open,
  onOpenChange,
  path,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
}) {
  const { files, buffers } = useWorkbench();
  const [newPath, setNewPath] = useState(path);

  useEffect(() => {
    if (open) {
      setNewPath(path);
    }
  }, [open, path]);

  const handleSubmit = useCallback(() => {
    if (newPath !== path) {
      const content = files.get(path);
      files.remove(path);
      buffers.remove(path);
      files.create(newPath, content || "");
      buffers.add(newPath);
    }
    onOpenChange(false);
  }, [newPath, onOpenChange, path, buffers, files]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renomina il file</DialogTitle>
        </DialogHeader>
        <Input autoFocus value={newPath} onChange={(e) => setNewPath(e.target.value)} />
        <DialogFooter>
          <DialogClose>
            <Button variant="secondary">Annulla</Button>
          </DialogClose>
          <DialogClose>
            <Button onClick={handleSubmit}>Rinomina</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateFileDialog() {
  const { files, buffers } = useWorkbench();
  const [path, setPath] = useState("");

  const handleSubmit = useCallback(() => {
    files.create(path, "");
    buffers.add(path);
    buffers.setActive(path);
    setPath("");
  }, [buffers, files, path]);

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={FilePlusIcon} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserisci il nome del nuovo file o cartella</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="index.php, ciao/index.php, assets/img/"
          value={path}
          onChange={(e) => setPath(e.target.value)}
        />
        <DialogFooter className="w-full">
          <DialogClose className="w-full">
            <Button type="button" className="w-full" onClick={handleSubmit}>
              Salva
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
