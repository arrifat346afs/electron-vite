import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface PromptHistoryItem {
  url: string;
  prompt: string;
  timestamp: number;
}

export const usePromptHistory = () => {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    // Load history when component mounts
    loadHistory();

    // Add event listener for prompt updates
    const handlePromptUpdate = () => {
      loadHistory();
    };

    // Listen for the custom event
    window.addEventListener("prompt-updated", handlePromptUpdate);

    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener("prompt-updated", handlePromptUpdate);
    };
  }, []);

  const loadHistory = async () => {
    try {
      const promptHistory = await window.electronAPI.getPromptHistory();
      setHistory(promptHistory);
    } catch (error) {
      console.error("Failed to load prompt history:", error);
      toast.error("Failed to load prompt history");
    }
  };

  const handleCopy = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("Prompt copied to clipboard");
    } catch (err) {
      toast.error(`Failed to copy prompt: ${err}`);
    }
  };

  const handleDelete = async (url: string) => {
    try {
      const success = await window.electronAPI.deletePrompt(url);
      if (success) {
        setHistory(history.filter((item) => item.url !== url));
        // Also remove from selected prompts if it was selected
        if (selectedPrompts.has(url)) {
          const newSelectedPrompts = new Set(selectedPrompts);
          newSelectedPrompts.delete(url);
          setSelectedPrompts(newSelectedPrompts);
        }
        toast.success("Prompt deleted from history");
      } else {
        toast.error("Prompt not found in history");
      }
    } catch (error) {
      console.error("Failed to delete prompt:", error);
      toast.error("Failed to delete prompt");
    }
  };

  const handleDeleteAll = async () => {
    try {
      // Check if the deleteAllPrompts function exists
      if (typeof window.electronAPI.deleteAllPrompts === 'function') {
        // Use the Electron API function if available
        const success = await window.electronAPI.deleteAllPrompts();
        if (success) {
          setHistory([]);
          setSelectedPrompts(new Set());
          setSelectAll(false);
          toast.success("All prompts deleted from history");
        } else {
          toast.error("Failed to delete prompts");
        }
      } else {
        // Fallback implementation - delete each prompt individually
        console.log("deleteAllPrompts function not available, using fallback");
        let allDeleted = true;

        // Create a copy of the history array to avoid modification during iteration
        const historyToDelete = [...history];

        for (const item of historyToDelete) {
          try {
            const success = await window.electronAPI.deletePrompt(item.url);
            if (!success) {
              allDeleted = false;
              console.error(`Failed to delete prompt for URL: ${item.url}`);
            }
          } catch (err) {
            allDeleted = false;
            console.error(`Error deleting prompt for URL: ${item.url}`, err);
          }
        }

        if (allDeleted) {
          setHistory([]);
          setSelectedPrompts(new Set());
          setSelectAll(false);
          toast.success("All prompts deleted from history");
        } else {
          // Refresh the history to show what's left
          await loadHistory();
          toast.warning("Some prompts could not be deleted. Please restart the app to use the improved delete all function.");
        }
      }
    } catch (error) {
      console.error("Failed to delete all prompts:", error);
      toast.error("Failed to delete all prompts");
    }
  };

  const togglePromptSelection = (url: string) => {
    setSelectedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(url)) {
        newSet.delete(url);
      } else {
        newSet.add(url);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // If all are selected, deselect all
      setSelectedPrompts(new Set());
    } else {
      // Select all prompts
      const allUrls = history.map(item => item.url);
      setSelectedPrompts(new Set(allUrls));
    }
    setSelectAll(!selectAll);
  };

  const exportPrompts = async (exportFileName: string, exportPath: string) => {
    try {
      // Get prompts to export
      let promptsToExport = history;

      // Filter by selected prompts if any are selected
      if (selectedPrompts.size > 0) {
        promptsToExport = promptsToExport.filter(item =>
          selectedPrompts.has(item.url)
        );
      }

      if (promptsToExport.length === 0) {
        toast.error("No prompts to export");
        return false;
      }

      // Format the export content - only prompts, one per line, no extra line gaps
      // Process each prompt to ensure it doesn't have trailing newlines
      const processedPrompts = promptsToExport.map(item => {
        // Trim any leading/trailing whitespace and ensure no trailing newlines
        return item.prompt.trim();
      });

      // Join all prompts with a single newline character
      const exportContent = processedPrompts.join('\n');

      // Check if we have a path and Electron API is available
      if (exportPath && window.electronAPI && typeof window.electronAPI.saveFileToPath === 'function') {
        // Use Electron to save to the selected path
        const fileName = `${exportFileName}.txt`;
        // Use proper path joining to ensure correct path separators
        let fullPath;
        try {
          if (window.electronAPI.joinPaths) {
            fullPath = await window.electronAPI.joinPaths(exportPath, fileName);
            console.log('Path joined using electronAPI.joinPaths:', fullPath);
          } else {
            // Fallback for Windows - replace forward slashes with backslashes
            fullPath = `${exportPath.replace(/[/\\]/g, '\\')}\\${fileName}`;
            console.log('Path joined using fallback method:', fullPath);
          }
        } catch (error) {
          console.error('Error joining paths:', error);
          // Another fallback using platform-specific separator
          fullPath = `${exportPath}\\${fileName}`;
          console.log('Using emergency fallback path:', fullPath);
        }

        const result = await window.electronAPI.saveFileToPath(fullPath, exportContent);
        if (result && result.success) {
          toast.success(`Prompts exported to ${fullPath}`);
          return true;
        } else {
          toast.error(`Failed to export prompts: ${result?.message || 'Unknown error'}`);
          return false;
        }
      } else {
        // Fallback to browser download if no path selected or Electron API unavailable
        // Create a blob with the content
        const blob = new Blob([exportContent], { type: 'text/plain' });

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportFileName}.txt`;

        // Append to the document, click it, and remove it
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up the URL object
        URL.revokeObjectURL(url);

        toast.success("Prompts exported successfully");
        return true;
      }
    } catch (error) {
      console.error("Failed to export prompts:", error);
      toast.error(`Export error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };

  const handleBrowseExportPath = async () => {
    try {
      if (!window.electronAPI || typeof window.electronAPI.selectExportPath !== 'function') {
        console.error('selectExportPath function is not available in electronAPI');
        toast.error('Browse functionality is not available');
        return null;
      }

      const result = await window.electronAPI.selectExportPath();
      if (result && result.success && result.path) {
        return result.path;
      }
      return null;
    } catch (error) {
      console.error('Failed to browse for export path:', error);
      toast.error(`Failed to select path: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  return {
    history,
    selectedPrompts,
    selectAll,
    loadHistory,
    handleCopy,
    handleDelete,
    handleDeleteAll,
    togglePromptSelection,
    handleSelectAll,
    exportPrompts,
    handleBrowseExportPath
  };
};
