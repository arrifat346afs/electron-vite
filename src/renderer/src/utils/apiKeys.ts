// API key storage and management

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
}

// In-memory storage for API keys
let apiKeys: ApiKey[] = [];

// Load API keys from localStorage on initialization
export const loadApiKeys = (): void => {
  try {
    const savedKeys = localStorage.getItem('apiKeys');
    if (savedKeys) {
      apiKeys = JSON.parse(savedKeys);
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  }
};

// Save API keys to localStorage
export const saveApiKeys = (): void => {
  try {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
  } catch (error) {
    console.error('Failed to save API keys:', error);
  }
};

// Get all API keys
export const getAllApiKeys = (): ApiKey[] => {
  return [...apiKeys];
};

// Add a new API key
export const addApiKey = (name: string, key: string): ApiKey => {
  const newKey: ApiKey = {
    id: Date.now().toString(),
    name,
    key,
    isActive: apiKeys.length === 0 // First key is active by default
  };
  
  apiKeys.push(newKey);
  saveApiKeys();
  return newKey;
};

// Update an existing API key
export const updateApiKey = (id: string, updates: Partial<ApiKey>): boolean => {
  const index = apiKeys.findIndex(key => key.id === id);
  if (index === -1) return false;
  
  apiKeys[index] = { ...apiKeys[index], ...updates };
  saveApiKeys();
  return true;
};

// Delete an API key
export const deleteApiKey = (id: string): boolean => {
  const initialLength = apiKeys.length;
  apiKeys = apiKeys.filter(key => key.id !== id);
  
  if (apiKeys.length !== initialLength) {
    saveApiKeys();
    return true;
  }
  return false;
};

// Set an API key as active
export const setActiveApiKey = (id: string): boolean => {
  const keyExists = apiKeys.some(key => key.id === id);
  if (!keyExists) return false;
  
  apiKeys = apiKeys.map(key => ({
    ...key,
    isActive: key.id === id
  }));
  
  saveApiKeys();
  return true;
};

// Get the currently active API key
export const getActiveApiKey = (): ApiKey | undefined => {
  return apiKeys.find(key => key.isActive);
};

// Initialize by loading saved keys
loadApiKeys();
