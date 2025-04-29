import { useState, useEffect } from "react";
import { useUrl } from "../../contexts/UrlContext";
// import { LoadingSpinner } from "../ui/loading-spinner";
import { Button } from "../ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const DescriptionHolder = () => {
  const { selectedUrl } = useUrl();
  const [description, setDescription] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadPrompt = async () => {
      if (selectedUrl) {
        // setLoading(true);
        try {
          const savedPrompt = await window.electronAPI.getPromptForUrl(
            selectedUrl
          );
          if (savedPrompt) {
            setDescription(savedPrompt);
          } else {
            setDescription(null);
          }
        } catch (error) {
          console.error("Failed to load prompt:", error);
          toast.error("Failed to load prompt");
        } finally {
          // setLoading(false);
        }
      } else {
        setDescription(null);
      }
    };

    loadPrompt();
  }, [selectedUrl]);

  const handleCopy = async () => {
    if (description) {
      try {
        await navigator.clipboard.writeText(description);
        setCopied(true);
        toast.success("Prompt copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        const error = err as Error;
        toast.error(`Failed to copy prompt: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex flex-row w-full h-full p-4 overflow-hidden">
      <div className="flex flex-col justify-between items-center w-full h-full overflow-hidden">
        <div className="flex justify-between w-full mb-2">
          <h3 className="text-lg font-semibold">Prompt</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1 h-8 px-2"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>

        <div className="w-full flex-grow overflow-hidden">
          <textarea
            className="w-full h-full p-3 rounded-lg bg-background border resize-none"
            value={description || ""}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default DescriptionHolder;
