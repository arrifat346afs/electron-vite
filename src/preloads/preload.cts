import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    deletePrompt: (url: string) => ipcRenderer.invoke('delete-prompt', url), // New Prompt History operation
    // URL operations
    storeUrl: (url: string) => ipcRenderer.invoke('store-url', url),
    getUrls: () => ipcRenderer.invoke('get-urls'),
    deleteUrl: (id: string) => ipcRenderer.invoke('delete-url', id),
    updateUrl: (id: string, data: any) => ipcRenderer.invoke('update-url', id, data),
    setSelectedUrl: (id: string) => ipcRenderer.invoke('set-selected-url', id),

    // API key operations
    storeApiKey: (name: string, key: string) => ipcRenderer.invoke('store-api-key', name, key),
    getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
    deleteApiKey: (id: string) => ipcRenderer.invoke('delete-api-key', id),
    updateApiKey: (id: string, data: any) => ipcRenderer.invoke('update-api-key', id, data),
    setActiveApiKey: (id: string) => ipcRenderer.invoke('set-active-api-key', id),

    // LangChain operations
    generatePrompt: (url: string) => ipcRenderer.invoke('generate-prompt', url),
    extractDescription: (url: string) => ipcRenderer.invoke('extract-description', url),

    // New Prompt History operations
    storePrompt: (url: string, prompt: string) => ipcRenderer.invoke('store-prompt', url, prompt),
    getPromptHistory: () => ipcRenderer.invoke('get-prompt-history'),
    getPromptForUrl: (url: string) => ipcRenderer.invoke('get-prompt-for-url', url),
    deleteAllPrompts: () => ipcRenderer.invoke('delete-all-prompts'),

    // File operations
    saveFile: (fileName: string, content: string) => ipcRenderer.invoke('save-file', fileName, content),

    // Export operations
    selectExportPath: () => ipcRenderer.invoke('select-export-path'),
    saveFileToPath: (filePath: string, content: string) => ipcRenderer.invoke('save-file-to-path', filePath, content),

    // Path operations
    joinPaths: (directory: string, filename: string) => ipcRenderer.invoke('join-paths', directory, filename),
  }
);

// Log when preload script has loaded
console.log('Preload script loaded');
console.log('Exposing electronAPI to window');

// Log the exposed API for debugging
console.log('Exposed API methods:', Object.keys({
  deletePrompt: (url: string) => ipcRenderer.invoke('delete-prompt', url),
  storeUrl: (url: string) => ipcRenderer.invoke('store-url', url),
  getUrls: () => ipcRenderer.invoke('get-urls'),
  deleteUrl: (id: string) => ipcRenderer.invoke('delete-url', id),
  updateUrl: (id: string, data: any) => ipcRenderer.invoke('update-url', id, data),
  setSelectedUrl: (id: string) => ipcRenderer.invoke('set-selected-url', id),
  storeApiKey: (name: string, key: string) => ipcRenderer.invoke('store-api-key', name, key),
  getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
  deleteApiKey: (id: string) => ipcRenderer.invoke('delete-api-key', id),
  updateApiKey: (id: string, data: any) => ipcRenderer.invoke('update-api-key', id, data),
  setActiveApiKey: (id: string) => ipcRenderer.invoke('set-active-api-key', id),
  generatePrompt: (url: string) => ipcRenderer.invoke('generate-prompt', url),
  extractDescription: (url: string) => ipcRenderer.invoke('extract-description', url),
  storePrompt: (url: string, prompt: string) => ipcRenderer.invoke('store-prompt', url, prompt),
  getPromptHistory: () => ipcRenderer.invoke('get-prompt-history'),
  getPromptForUrl: (url: string) => ipcRenderer.invoke('get-prompt-for-url', url),
  deleteAllPrompts: () => ipcRenderer.invoke('delete-all-prompts'),
  saveFile: (fileName: string, content: string) => ipcRenderer.invoke('save-file', fileName, content),
  selectExportPath: () => ipcRenderer.invoke('select-export-path'),
  saveFileToPath: (filePath: string, content: string) => ipcRenderer.invoke('save-file-to-path', filePath, content),
  joinPaths: (directory: string, filename: string) => ipcRenderer.invoke('join-paths', directory, filename),
}));

// Add a debug function to check if the preload script is working
contextBridge.exposeInMainWorld('preloadDebug', {
  ping: () => 'pong',
  getTime: () => new Date().toISOString()
});
