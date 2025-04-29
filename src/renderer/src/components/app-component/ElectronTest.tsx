import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const ElectronTest = () => {
  const [isElectronAvailable, setIsElectronAvailable] = useState<boolean>(false);
  const [isPreloadDebugAvailable, setIsPreloadDebugAvailable] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string>('');
  const [timeResult, setTimeResult] = useState<string>('');

  useEffect(() => {
    // Check if Electron API is available
    setIsElectronAvailable('electronAPI' in window);
    setIsPreloadDebugAvailable('preloadDebug' in window);

    if ('preloadDebug' in window) {
      try {
        setPingResult(window.preloadDebug.ping());
        setTimeResult(window.preloadDebug.getTime());
      } catch (error) {
        console.error('Error calling preloadDebug methods:', error);
      }
    }
  }, []);

  const handleTestApiKey = async () => {
    if (!('electronAPI' in window)) {
      console.error('Electron API is not available');
      return;
    }

    try {
      const result = await window.electronAPI.storeApiKey('Test API', 'test-api-key-123');
      console.log('API key save result:', result);
      alert('API key saved successfully: ' + JSON.stringify(result));
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert('Failed to save API key: ' + String(error));
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-4">Electron API Test</h2>
      
      <div className="space-y-2 mb-4">
        <p>Electron API Available: <span className={isElectronAvailable ? 'text-green-500' : 'text-red-500'}>{isElectronAvailable ? 'Yes' : 'No'}</span></p>
        <p>Preload Debug Available: <span className={isPreloadDebugAvailable ? 'text-green-500' : 'text-red-500'}>{isPreloadDebugAvailable ? 'Yes' : 'No'}</span></p>
        {isPreloadDebugAvailable && (
          <>
            <p>Ping Result: {pingResult}</p>
            <p>Time Result: {timeResult}</p>
          </>
        )}
      </div>

      <Button 
        onClick={handleTestApiKey}
        disabled={!isElectronAvailable}
      >
        Test API Key Save
      </Button>
    </div>
  );
};

export default ElectronTest;
