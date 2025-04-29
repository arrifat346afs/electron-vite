import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";

interface PromptViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  onCopy: (prompt: string) => void;
}

const PromptViewDialog = ({
  open,
  onOpenChange,
  prompt,
  onCopy,
}: PromptViewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Prompt Details</DialogTitle>
          <DialogDescription>Full prompt content</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 mt-2 max-h-[50vh]">
          <div className="whitespace-pre-wrap p-4 bg-muted rounded-md">
            {prompt}
          </div>
        </ScrollArea>
        <div className="flex flex-wrap justify-end gap-2 mt-4">
          <Button onClick={() => onCopy(prompt)}>
            <Copy className="w-4 h-4 mr-2" /> Copy
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptViewDialog;
