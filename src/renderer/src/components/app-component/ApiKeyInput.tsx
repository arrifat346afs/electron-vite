import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";
import { CheckIcon, Trash2Icon } from "lucide-react";
// import ElectronTest from "./ElectronTest";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
}

const ApiKeyInput = () => {
  const [selectedAI, setSelectedAI] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedKeys, setSavedKeys] = useState<ApiKey[]>([]);

  // Check if Electron API is available
  const isElectronAPIAvailable = () => {
    console.log('Window object:', typeof window);
    console.log('electronAPI in window:', 'electronAPI' in window);
    console.log('preloadDebug in window:', 'preloadDebug' in window);

    if ('preloadDebug' in window) {
      try {
        console.log('Preload debug ping:', window.preloadDebug.ping());
        console.log('Preload debug time:', window.preloadDebug.getTime());
      } catch (error) {
        console.error('Error calling preloadDebug methods:', error);
      }
    }

    return window.electronAPI !== undefined;
  };

  // Load saved API keys on component mount
  useEffect(() => {
    const loadKeys = async () => {
      if (isElectronAPIAvailable()) {
        await loadApiKeys();
      } else {
        console.error("Electron API is not available");
        toast.error("Electron API is not available. API key functionality will not work.");
      }
    };

    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApiKeys = async () => {
    if (!isElectronAPIAvailable()) {
      console.error("Cannot load API keys: Electron API is not available");
      return;
    }

    try {
      const keys = await window.electronAPI.getApiKeys();
      setSavedKeys(keys);
    } catch (error) {
      console.error("Failed to load API keys:", error);
      toast.error("Failed to load API keys");
    }
  };

  // Determine which model options to show based on selected AI provider
  const renderModelOptions = () => {
    if (selectedAI === "google") {
      return (
        <>
          <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
          <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</SelectItem>
          <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
          <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
          <SelectItem value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B</SelectItem>
        </>
      );
    } else if (selectedAI === "mistral") {
      return (
        <>
          <SelectItem value="pixtral-12b-2409">Pixtral 12b</SelectItem>
          <SelectItem value="pixtral-large-2411">Pixtral Large</SelectItem>
        </>
      );
    } else {
      // Default or empty state - show placeholder options
      return (
        <SelectItem value="no-selection" disabled>
          Select an AI provider first
        </SelectItem>
      );
    }
  };

  // Get appropriate placeholder text based on selected AI
  const getModelPlaceholder = () => {
    if (selectedAI === "google") {
      return "Select Google AI Model";
    } else if (selectedAI === "mistral") {
      return "Select Mistral AI Model";
    } else {
      return "Select AI Model";
    }
  };

  // Handle saving the API key
  const handleSaveKey = async () => {
    console.log("Save button clicked");
    console.log("Selected AI:", selectedAI);
    console.log("Selected Model:", selectedModel);
    console.log("API Key length:", apiKey.length);

    if (!selectedAI || !selectedModel || !apiKey) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Format the name as "Provider - Model"
      const name = `${selectedAI === "google" ? "Google" : "Mistral"} - ${selectedModel}`;
      console.log("Saving API key with name:", name);

      // Save the API key using the Electron API
      const result = await window.electronAPI.storeApiKey(name, apiKey);
      console.log("API key save result:", result);

      // Clear the form
      setApiKey("");

      // Reload the API keys
      await loadApiKeys();

      toast.success("API key saved successfully");
    } catch (error) {
      console.error("Failed to save API key:", error);
      toast.error("Failed to save API key: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an API key
  const handleDeleteKey = async (id: string) => {
    if (!isElectronAPIAvailable()) {
      console.error("Cannot delete API key: Electron API is not available");
      toast.error("Cannot delete API key: Electron API is not available");
      return;
    }

    setLoading(true);
    try {
      await window.electronAPI.deleteApiKey(id);
      await loadApiKeys();
      toast.success("API key deleted successfully");
    } catch (error) {
      console.error("Failed to delete API key:", error);
      toast.error("Failed to delete API key: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  // Handle setting an API key as active
  const handleSetActiveKey = async (id: string) => {
    if (!isElectronAPIAvailable()) {
      console.error("Cannot set active API key: Electron API is not available");
      toast.error("Cannot set active API key: Electron API is not available");
      return;
    }

    setLoading(true);
    try {
      await window.electronAPI.setActiveApiKey(id);
      await loadApiKeys();
      toast.success("API key set as active");
    } catch (error) {
      console.error("Failed to set active API key:", error);
      toast.error("Failed to set active API key: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 w-full">
      {/* <ElectronTest /> */}
      <div className="space-y-4 mt-4">
        <Select onValueChange={setSelectedAI}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select AI Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google AI</SelectItem>
            <SelectItem value="mistral">Mistral AI</SelectItem>
          </SelectContent>
        </Select>

        {/* Always show the model selector */}
        <Select
          onValueChange={setSelectedModel}
          disabled={!selectedAI} // Disable if no AI provider is selected
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={getModelPlaceholder()} />
          </SelectTrigger>
          <SelectContent>{renderModelOptions()}</SelectContent>
        </Select>

        <Input
          type="password"
          placeholder="Enter your API key"
          className="w-full"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <div className="flex flex-row justify-between w-full pl-5 pr-5">
          <Button
            className="w-35"
            onClick={() => handleSaveKey()}
            disabled={loading || !selectedAI || !selectedModel || !apiKey}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button
            className="w-35"
            variant="destructive"
            onClick={() => setApiKey("")}
            disabled={loading || !apiKey}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Display saved API keys */}
      {savedKeys.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Saved API Keys</h3>
          <ScrollArea className="h-40 w-full rounded-md border">
            <div className="p-2">
              {savedKeys.map((key) => (
                <div
                  key={key.id}
                  className={`flex items-center justify-between p-2 rounded-md mb-1 ${key.isActive ? 'bg-primary/20 border border-primary' : 'hover:bg-accent'}`}
                >
                  <div className="flex items-center">
                    {key.isActive && <CheckIcon className="w-4 h-4 mr-2 text-primary" />}
                    <span className="text-sm">{key.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    {!key.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActiveKey(key.id)}
                        disabled={loading}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKey(key.id)}
                      disabled={loading}
                    >
                      <Trash2Icon className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput;
