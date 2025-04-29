import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { getPreloadPath } from "../preloads/pathResolver.js";
import { isDev } from "./util.js";
import fs from 'fs';

// Store for prompts
interface PromptStore {
  [url: string]: {
    prompt: string;
    timestamp: number;
  };
}

// API key interface
interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
}

let promptStore: PromptStore = {};
let apiKeys: ApiKey[] = [];

// Load stored data when app starts
app.on("ready", () => {
  loadPromptStore();
  loadApiKeys();

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: "icon2.png",
    webPreferences: {
      preload: getPreloadPath(),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});
// IPC Handlers for API Keys
ipcMain.handle('store-api-key', (_event, name: string, key: string) => {
  const newKey: ApiKey = {
    id: Date.now().toString(),
    name,
    key,
    isActive: apiKeys.length === 0 // First key is active by default
  };

  apiKeys.push(newKey);
  saveApiKeys();
  return newKey;
});

ipcMain.handle('get-api-keys', () => {
  return apiKeys;
});

ipcMain.handle('delete-api-key', (_event, id: string) => {
  const initialLength = apiKeys.length;
  apiKeys = apiKeys.filter(key => key.id !== id);

  if (apiKeys.length !== initialLength) {
    saveApiKeys();
    return true;
  }
  return false;
});

ipcMain.handle('update-api-key', (_event, id: string, data: Partial<ApiKey>) => {
  const index = apiKeys.findIndex(key => key.id === id);
  if (index === -1) return false;

  apiKeys[index] = { ...apiKeys[index], ...data };
  saveApiKeys();
  return true;
});

ipcMain.handle('set-active-api-key', (_event, id: string) => {
  const keyExists = apiKeys.some(key => key.id === id);
  if (!keyExists) return false;

  apiKeys = apiKeys.map(key => ({
    ...key,
    isActive: key.id === id
  }));

  saveApiKeys();
  return true;
});

// IPC Handlers for Prompts
ipcMain.handle('generate-prompt', async (_event, url: string) => {
  try {
    // Get the active API key from storage
    const activeKey = apiKeys.find(key => key.isActive);

    if (!activeKey) {
      throw new Error('No active API key found');
    }

    // Fetch the webpage content or image
    const response = await fetch(url);
    const content = await response.text();

    // Store the prompt
    promptStore[url] = {
      prompt: content,
      timestamp: Date.now()
    };

    // Save to file system
    savePromptStore();

    return content;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
});

ipcMain.handle('store-prompt', async (_event, url: string, prompt: string) => {
  promptStore[url] = {
    prompt,
    timestamp: Date.now()
  };
  savePromptStore();
  return true;
});

ipcMain.handle('get-prompt-for-url', async (_event, url: string) => {
  return promptStore[url]?.prompt || null;
});

ipcMain.handle('get-prompt-history', async () => {
  return Object.entries(promptStore).map(([url, data]) => ({
    url,
    prompt: data.prompt,
    timestamp: data.timestamp
  }));
});

ipcMain.handle('delete-prompt', async (_event, url: string) => {
  if (url in promptStore) {
    delete promptStore[url];
    savePromptStore();
    return true;
  }
  return false;
});

ipcMain.handle('delete-all-prompts', async () => {
  promptStore = {};
  savePromptStore();
  return true;
});

// Helper functions
const PROMPT_STORE_PATH = path.join(app.getPath('userData'), 'promptStore.json');
const API_KEYS_PATH = path.join(app.getPath('userData'), 'apiKeys.json');

function loadPromptStore() {
  try {
    if (fs.existsSync(PROMPT_STORE_PATH)) {
      const data = fs.readFileSync(PROMPT_STORE_PATH, 'utf8');
      promptStore = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading prompt store:', error);
  }
}

function savePromptStore() {
  try {
    fs.writeFileSync(PROMPT_STORE_PATH, JSON.stringify(promptStore, null, 2));
  } catch (error) {
    console.error('Error saving prompt store:', error);
  }
}

function loadApiKeys() {
  try {
    if (fs.existsSync(API_KEYS_PATH)) {
      const data = fs.readFileSync(API_KEYS_PATH, 'utf8');
      apiKeys = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading API keys:', error);
  }
}

function saveApiKeys() {
  try {
    fs.writeFileSync(API_KEYS_PATH, JSON.stringify(apiKeys, null, 2));
  } catch (error) {
    console.error('Error saving API keys:', error);
  }
}

// File operations
ipcMain.handle('save-file', async (_event, fileName: string, content: string) => {
  try {
    // Configure save dialog options
    const options = {
      title: 'Save Exported Prompts',
      defaultPath: path.join(app.getPath('documents'), fileName),
      filters: [{ name: 'Text Files', extensions: ['txt'] }],
      properties: ['createDirectory', 'showOverwriteConfirmation'] as ('createDirectory' | 'showOverwriteConfirmation')[]
    };

    console.log('Showing save dialog with options:', options);

    // Show the save dialog to let user choose where to save
    const result = await dialog.showSaveDialog(options);
    console.log('Save dialog result:', result);

    if (result.canceled || !result.filePath) {
      console.log('Save dialog was canceled or no path selected');
      return { success: false, message: 'Save canceled' };
    }

    // Write the file
    console.log('Writing file to:', result.filePath);
    fs.writeFileSync(result.filePath, content, 'utf8');
    console.log('File written successfully');

    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('Error saving file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
});

// Select export path
ipcMain.handle('select-export-path', async () => {
  try {
    const options = {
      title: 'Select Export Location',
      properties: ['openDirectory', 'createDirectory'] as ('openDirectory' | 'createDirectory')[]
    };

    console.log('Showing directory selection dialog');
    const result = await dialog.showOpenDialog(options);
    console.log('Directory selection result:', result);

    if (result.canceled || result.filePaths.length === 0) {
      console.log('Directory selection was canceled or no directory selected');
      return { success: false, message: 'Selection canceled' };
    }

    return { success: true, path: result.filePaths[0] };
  } catch (error) {
    console.error('Error selecting export path:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
});

// Path operations
ipcMain.handle('join-paths', (_event, directory: string, filename: string) => {
  try {
    console.log('Joining paths:', directory, filename);
    const joinedPath = path.join(directory, filename);
    console.log('Joined path:', joinedPath);
    return joinedPath;
  } catch (error) {
    console.error('Error joining paths:', error);
    throw error;
  }
});

// Save file to specific path
ipcMain.handle('save-file-to-path', async (_event, filePath: string, content: string) => {
  try {
    console.log('Writing file to specified path:', filePath);

    // Ensure the directory exists
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      console.log('Creating directory:', directory);
      fs.mkdirSync(directory, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('File written successfully');

    return { success: true };
  } catch (error) {
    console.error('Error saving file to path:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
});

