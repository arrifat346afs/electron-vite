/* eslint-disable @typescript-eslint/no-explicit-any */
interface ElectronAPI {
  deletePrompt(url: string): unknown;
  // URL operations
  storeUrl: (url: string) => Promise<any>;
  getUrls: () => Promise<string[]>;
  deleteUrl: (id: string) => Promise<boolean>;
  updateUrl: (id: string, data: any) => Promise<boolean>;
  setSelectedUrl: (id: string) => Promise<boolean>;

  // API key operations
  storeApiKey: (name: string, key: string) => Promise<any>;
  getApiKeys: () => Promise<any[]>;
  deleteApiKey: (id: string) => Promise<boolean>;
  updateApiKey: (id: string, data: any) => Promise<boolean>;
  setActiveApiKey: (id: string) => Promise<boolean>;

  // LangChain operations
  generatePrompt: (url: string) => Promise<string>;
  extractDescription: (url: string) => Promise<string>;

  // Prompt History operations
  storePrompt: (url: string, prompt: string) => Promise<boolean>;
  getPromptHistory: () => Promise<any[]>;
  getPromptForUrl: (url: string) => Promise<string | null>;
  deleteAllPrompts: () => Promise<boolean>;

  // File operations
  saveFile: (fileName: string, content: string) => Promise<{
    success: boolean;
    message?: string;
    filePath?: string
  }>;

  // Export operations
  selectExportPath: () => Promise<{
    success: boolean;
    path?: string;
    message?: string;
  }>;

  saveFileToPath: (filePath: string, content: string) => Promise<{
    success: boolean;
    message?: string;
  }>;

  // Path operations
  joinPaths: (directory: string, filename: string) => Promise<string>;
}

interface PreloadDebug {
  ping: () => string;
  getTime: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    preloadDebug: PreloadDebug;
  }
}

export {};
