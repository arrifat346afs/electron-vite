import { useState } from "react";
import { Button } from "../ui/button";
import { FileDown, FolderOpen } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

interface PromptExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (fileName: string, path: string) => Promise<boolean>;
  onBrowse: () => Promise<string | null>;
  selectedCount: number;
  totalCount: number;
}

const PromptExportDialog = ({
  open,
  onOpenChange,
  onExport,
  onBrowse,
  selectedCount,
  totalCount,
}: PromptExportDialogProps) => {
  const [exportFileName, setExportFileName] = useState("prompts");
  const [exportPath, setExportPath] = useState("");

  const handleBrowse = async () => {
    const path = await onBrowse();
    if (path) {
      setExportPath(path);
    }
  };

  const handleExport = async () => {
    const success = await onExport(exportFileName, exportPath);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle>Export Prompts</DialogTitle>
          <DialogDescription>
            Enter a filename and select a location for your exported prompts.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filename" className="text-right col-span-1">Filename</Label>
            <Input
              id="filename"
              value={exportFileName}
              onChange={(e) => setExportFileName(e.target.value)}
              className="col-span-3"
              placeholder="prompts"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right col-span-1">Save to</Label>
            <div className="col-span-3 flex gap-2">
              <Input
                value={exportPath}
                readOnly
                placeholder="Select a location"
                className="flex-grow"
              />
              <Button
                variant="outline"
                onClick={handleBrowse}
                title="Browse for location"
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} prompt(s) selected for export`
              : "All prompts will be exported"}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleExport}
            className="ml-2"
            disabled={!exportFileName.trim()}
          >
            <FileDown className="w-4 h-4 mr-2" /> Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromptExportDialog;
