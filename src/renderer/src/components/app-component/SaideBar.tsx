import { useState } from "react";
import { Input } from "../ui/input";
import { Edit2Icon, Trash2Icon, LinkIcon, KeyIcon } from "lucide-react";
import ApiKeyInput from "./ApiKeyInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useUrl } from "../../contexts/UrlContext";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { generatePromptFromUrl } from '../../utils/langchain/operations';

const SaideBar = () => {
  const { urls, addUrl, updateUrl, deleteUrl, selectedUrl, setSelectedUrl } =
    useUrl();
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [, setGeneratedPrompts] = useState<Record<string, string>>({});
  const [promptLength, setPromptLength] = useState<'short' | 'medium' | 'long'>('short');
  const handleUrlSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const newUrl = event.currentTarget.value.trim();
      if (newUrl) {
        if (editIndex !== null) {
          updateUrl(editIndex, newUrl);
          setEditIndex(null);
        } else {
          addUrl(newUrl);
        }
        event.currentTarget.value = "";
      }
    }
  };

  const sendDataToAI = async () => {
    if (urls.length === 0) {
      toast.error("No URLs to process");
      return;
    }

    setProcessing(new Set(urls));

    toast.info(`Processing ${urls.length} URLs...`, {
      style: {
        border: '1px solid #6C2DC7',
        backgroundColor: 'black',
        color: 'white'
      }
    });

    try {
      for (const url of urls) {
        try {
          // Generate prompt using LangChain
          const prompt = await generatePromptFromUrl(url, promptLength);

          // Store the generated prompt
          await window.electronAPI.storePrompt(url, prompt);

          // Update local state
          setGeneratedPrompts(prev => ({
            ...prev,
            [url]: prompt
          }));

          // Dispatch custom event to notify PromptHistory component
          window.dispatchEvent(new Event('prompt-updated'));

          toast.success(`Processed: ${url}`, {
            description: prompt.substring(0, 100) + "...",
            style: {
              border: '1px solid #6C2DC7',
              backgroundColor: 'black',
              color: 'white'
            }
          });

          // Remove URL from processing set
          setProcessing(prev => {
            const next = new Set(prev);
            next.delete(url);
            return next;
          });

        } catch (error) {
          console.error('Error processing URL:', error);

          // Create a more detailed error message
          let errorMessage = 'An unknown error occurred';
          if (error instanceof Error) {
            errorMessage = error.message;
          }

          // Check for specific error types
          if (errorMessage.includes('No API keys found')) {
            errorMessage = 'No API keys found. Please add an API key first.';
          } else if (errorMessage.includes('No active API key found')) {
            errorMessage = 'No active API key found. Please set an API key as active.';
          } else if (errorMessage.includes('Electron API is not available')) {
            errorMessage = 'Electron API is not available. Please restart the application.';
          }

          toast.error(`Failed to process: ${url}`, {
            description: errorMessage,
            duration: 5000
          });
        }
      }
    } finally {
      setProcessing(new Set());
    }
  };

  const handleButtonClick = {
    sendDataToAI,
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
  };

  const handleDelete = (index: number) => {
    deleteUrl(index);
  };

  const handleSelectUrl = (url: string) => {
    setSelectedUrl(url);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <Tabs defaultValue="urls" className="w-full h-full">
        <TabsList className="w-full mb-4 grid grid-cols-2 bg-zinc-900 rounded-lg border-b">
          <TabsTrigger
            value="urls"
            className="flex items-center justify-center gap-2 rounded-lg  data-[state=active]:!bg-black data-[state=active]:!text-white"
          >
            <LinkIcon className="w-4 h-4" />
            URLs
          </TabsTrigger>
          <TabsTrigger
            value="apiKeys"
            className="flex items-center justify-center gap-2 rounded-lg data-[state=active]:!bg-black data-[state=active]:!text-white"
          >
            <KeyIcon className="w-4 h-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="urls" className="flex-1 overflow-hidden">
          <div className="flex flex-col w-full h-full p-2">
            {/* url input  */}
            <Input
              placeholder="Enter URL"
              className="w-full mb-2"
              onKeyDown={handleUrlSubmit}
              defaultValue={editIndex !== null ? urls[editIndex] : ""}
            />
            {/* vertical scrolling url list */}
            <ScrollArea className="flex-1 w-full rounded-md border">
              <div className="w-[calc(100%-80px)] px-2">
                {urls.map((url, index) => (
                  <div
                    key={index}
                    className={`mb-1 p-2 rounded flex items-center text-xs cursor-pointer ${
                      selectedUrl === url
                        ? "bg-primary/20 border border-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    } ${processing.has(url) ? 'opacity-50' : ''}`}
                    onClick={() => handleSelectUrl(url)}
                  >
                    <div className="w-[calc(100%-80px)] overflow-hidden">
                      <span className="block truncate">
                        {url}
                        {processing.has(url) && " (Processing...)"}
                      </span>
                    </div>
                    <div className="w-[80px] flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          if (!processing.has(url)) {
                            e.stopPropagation();
                            handleEdit(index);
                          }
                        }}
                        className={`flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent ${processing.has(url) ? 'opacity-50' : ''}`}
                      >
                        <Edit2Icon className="w-4 h-4 text-gray-500 hover:text-blue-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          if (!processing.has(url)) {
                            e.stopPropagation();
                            handleDelete(index);
                          }
                        }}
                        className={`flex items-center justify-center w-8 h-8 rounded-full hover:bg-accent ${processing.has(url) ? 'opacity-50' : ''}`}
                      >
                        <Trash2Icon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex w-full justify-center p-4">
              <Button
                onClick={handleButtonClick.sendDataToAI}
                className="w-full"
                disabled={processing.size > 0 || urls.length === 0}
              >
                {processing.size > 0 ? `Processing (${processing.size} remaining)...` : 'Generate Prompts'}
              </Button>
            </div>
            <div className="flex justify-between p-2">
              <Button
                variant={promptLength === 'short' ? 'default' : 'outline'}
                onClick={() => setPromptLength('short')}
                className={`${promptLength === 'short' ? 'bg-primary text-white' : ''} `}
              >
                Short
              </Button>
              <Button
                variant={promptLength === 'medium' ? 'default' : 'outline'}
                onClick={() => setPromptLength('medium')}
                className={`${promptLength === 'medium' ? 'bg-primary text-white' : ''}`}
              >
                Medium
              </Button>
              <Button
                variant={promptLength === 'long' ? 'default' : 'outline'}
                onClick={() => setPromptLength('long')}
                className={`${promptLength === 'long' ? 'bg-primary text-white' : ''}`}
              >
                Long
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="apiKeys" className="flex-1 overflow-hidden">
          <ApiKeyInput />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SaideBar;
