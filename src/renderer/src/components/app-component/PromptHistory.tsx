import { useState } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import PromptHistoryCard from "./PromptHistoryCard";
import PromptHistoryActions from "./PromptHistoryActions";
import PromptViewDialog from "./PromptViewDialog";
import PromptDeleteDialog from "./PromptDeleteDialog";
import PromptDeleteAllDialog from "./PromptDeleteAllDialog";
import PromptExportDialog from "./PromptExportDialog";
import { usePromptHistory } from "../../hooks/usePromptHistory";
import { FileSearch } from "lucide-react";

const PromptHistory = () => {
  const {
    history,
    selectedPrompts,
    selectAll,
    handleCopy,
    handleDelete,
    handleDeleteAll,
    togglePromptSelection,
    handleSelectAll,
    exportPrompts,
    handleBrowseExportPath,
  } = usePromptHistory();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");

  const handleViewPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    setPromptDialogOpen(true);
  };

  const confirmDelete = (url: string) => {
    setSelectedUrl(url);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUrl) return;
    await handleDelete(selectedUrl);
    setSelectedUrl(null);
    setDeleteDialogOpen(false);
  };

  const confirmDeleteAll = () => {
    setDeleteAllDialogOpen(true);
  };

  const handleConfirmDeleteAll = async () => {
    await handleDeleteAll();
    setDeleteAllDialogOpen(false);
  };

  const openExportDialog = () => {
    setExportDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Prompt History</h2>
        <PromptHistoryActions
          onExport={openExportDialog}
          onSelectAll={handleSelectAll}
          onDeleteAll={confirmDeleteAll}
          selectAll={selectAll}
        />
      </div>
      <ScrollArea className="w-full h-full whitespace-nowrap rounded-md border">
        <div className="flex w-max space-x-4 p-4 min-h-[100px]">
          {history.length === 0 ? (
            <div className="flex w-full h-full gap-5">
              {" "}
              <div className="m-auto flex flex-col items-center justify-center text-center text-muted-foreground border p-4 rounded-lg">
                <FileSearch className="w-12 h-12 mb-4 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-700">No Prompts Yet</h2>
              </div>
              {" "}
              <div className="m-auto flex flex-col items-center justify-center text-center text-muted-foreground border p-4 rounded-lg">
                <FileSearch className="w-12 h-12 mb-4 text-gray-700" />
                <h2 className="text-xl font-semibold text-gray-700">No Prompts Yet</h2>
                
              </div>
            </div>
          ) : (
            history.map((item, index) => (
              <PromptHistoryCard
                key={index}
                item={item}
                index={index}
                isSelected={selectedPrompts.has(item.url)}
                onToggleSelection={togglePromptSelection}
                onView={handleViewPrompt}
                onCopy={handleCopy}
                onDelete={confirmDelete}
              />
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <PromptDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      {/* Delete All Confirmation Dialog */}
      <PromptDeleteAllDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
        onConfirm={handleConfirmDeleteAll}
        hasDeleteAllFunction={
          typeof window.electronAPI.deleteAllPrompts === "function"
        }
      />

      {/* View Prompt Dialog */}
      <PromptViewDialog
        open={promptDialogOpen}
        onOpenChange={setPromptDialogOpen}
        prompt={selectedPrompt}
        onCopy={handleCopy}
      />

      {/* Export Dialog */}
      <PromptExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={exportPrompts}
        onBrowse={handleBrowseExportPath}
        selectedCount={selectedPrompts.size}
        totalCount={history.length}
      />
    </div>
  );
};

export default PromptHistory;
