import { Button } from "../ui/button";
import { FileDown, Check, Trash2 } from "lucide-react";

interface PromptHistoryActionsProps {
  onExport: () => void;
  onSelectAll: () => void;
  onDeleteAll: () => void;
  selectAll: boolean;
}

const PromptHistoryActions = ({
  onExport,
  onSelectAll,
  onDeleteAll,
  selectAll,
}: PromptHistoryActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        className="flex items-center gap-1"
        title="Export prompts"
      >
        <FileDown className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
        className="flex items-center gap-1"
        title={selectAll ? "Deselect all" : "Select all"}
      >
        <Check className="w-4 h-4" />
        <span className="hidden sm:inline">{selectAll ? "Deselect All" : "Select All"}</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDeleteAll}
        className="flex items-center gap-1"
        title="Delete all prompts"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Delete All</span>
      </Button>
    </div>
  );
};

export default PromptHistoryActions;
