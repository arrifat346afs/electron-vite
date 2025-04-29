import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
}

const ApiKeyDebug = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      if (!window.electronAPI) {
        toast.error('Electron API is not available');
        return;
      }
      
      const keys = await window.electronAPI.getApiKeys();
      setApiKeys(keys || []);
      
      if (keys && keys.length > 0) {
        const activeKey = keys.find(key => key.isActive);
        if (activeKey) {
          toast.success(`Active API key found: ${activeKey.name}`);
        } else {
          toast.warning('No active API key found');
        }
      } else {
        toast.warning('No API keys found');
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const setActiveKey = async (id: string) => {
    setLoading(true);
    try {
      if (!window.electronAPI) {
        toast.error('Electron API is not available');
        return;
      }
      
      await window.electronAPI.setActiveApiKey(id);
      toast.success('API key set as active');
      await loadApiKeys();
    } catch (error) {
      console.error('Failed to set active API key:', error);
      toast.error('Failed to set active API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md mb-4">
      <h2 className="text-lg font-bold mb-4">API Key Debug</h2>
      
      <div className="space-y-2 mb-4">
        <p>API Keys Found: {apiKeys.length}</p>
        {apiKeys.length > 0 && (
          <div className="space-y-2">
            {apiKeys.map(key => (
              <div key={key.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-xs text-gray-500">Key: {key.key.substring(0, 5)}...{key.key.substring(key.key.length - 5)}</p>
                  <p className="text-xs text-gray-500">ID: {key.id}</p>
                  {key.isActive && <p className="text-xs text-green-500">Active</p>}
                </div>
                {!key.isActive && (
                  <Button 
                    size="sm" 
                    onClick={() => setActiveKey(key.id)}
                    disabled={loading}
                  >
                    Set Active
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button 
        onClick={loadApiKeys}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Refresh API Keys'}
      </Button>
    </div>
  );
};

export default ApiKeyDebug;
