import { useState, useEffect } from "react";
import { useUrl } from "../../contexts/UrlContext";
import { LoadingSpinner } from "../ui/loading-spinner";
import { EyeOff } from "lucide-react";

const UrlPrevew = () => {
  const { selectedUrl } = useUrl();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUrl) {
      setLoading(true);
      setError(null);

      // In a real implementation, you would fetch the preview data here
      // For now, we'll just simulate a loading state
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedUrl]);

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full p-4 gap-3 overflow-hidden">
        <h2 className="text-lg font-semibold mb-2">URL Preview</h2>

        <div className="border flex flex-col w-full h-full p-4 items-center justify-center border-zinc-700 rounded-lg overflow-hidden">
          <p className="text-sm text-muted-foreground">Loading preview ...</p>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full h-full p-4 items-center justify-center text-red-500 overflow-hidden">
        <h2 className="text-lg font-semibold mb-2">URL Preview</h2>
        <div className="border flex flex-col w-full h-full p-4 items-center justify-center border-zinc-700 rounded-lg overflow-hidden">
          <p>Error loading preview: {error}</p>
        </div>
      </div>
    );
  }

  // If no URL is selected, show the EyeOff icon
  if (!selectedUrl) {
    return (
      <div className="flex flex-col w-full h-full p-4 overflow-hidden">
        <h2 className="text-lg font-semibold mb-2">URL Preview</h2>

        <div className="rounded-lg h-full w-full overflow-hidden">
          <div className="border h-full border-zinc-700 rounded-lg overflow-hidden flex flex-col items-center justify-center">
            <EyeOff className="w-12 h-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No preview available</p>
            <p className="text-xs text-muted-foreground">Select a URL to view its preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full p-4 overflow-hidden">
      <h2 className="text-lg font-semibold mb-2">URL Preview</h2>

      <div className="rounded-lg h-full w-full overflow-hidden">
        <div className="border h-full border-zinc-700 rounded-lg overflow-hidden">
          <img
            src={selectedUrl}
            className="w-full h-full object-contain"
            alt="URL Preview"
            onError={(e) => {
              // If image fails to load, try iframe as fallback
              const target = e.target as HTMLImageElement;
              const iframe = document.createElement("iframe");
              iframe.src = selectedUrl;
              iframe.className = "w-full h-full border-0";
              iframe.title = "URL Preview";
              iframe.sandbox.add("allow-same-origin");
              target.parentNode?.replaceChild(iframe, target);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UrlPrevew;
