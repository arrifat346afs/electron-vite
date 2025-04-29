import { createContext, useContext, useState, ReactNode } from 'react';

interface UrlContextType {
  urls: string[];
  setUrls: React.Dispatch<React.SetStateAction<string[]>>;
  selectedUrl: string | null;
  setSelectedUrl: React.Dispatch<React.SetStateAction<string | null>>;
  addUrl: (url: string) => void;
  updateUrl: (index: number, newUrl: string) => void;
  deleteUrl: (index: number) => void;
}

const UrlContext = createContext<UrlContextType | undefined>(undefined);

export function UrlProvider({ children }: { children: ReactNode }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const addUrl = (url: string) => {
    setUrls(prevUrls => [...prevUrls, url]);
  };

  const updateUrl = (index: number, newUrl: string) => {
    setUrls(prevUrls => prevUrls.map((url, i) => i === index ? newUrl : url));
  };

  const deleteUrl = (index: number) => {
    setUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    // If the deleted URL was selected, clear the selection
    if (selectedUrl === urls[index]) {
      setSelectedUrl(null);
    }
  };

  return (
    <UrlContext.Provider value={{ 
      urls, 
      setUrls, 
      selectedUrl, 
      setSelectedUrl,
      addUrl,
      updateUrl,
      deleteUrl
    }}>
      {children}
    </UrlContext.Provider>
  );
}

export function useUrl() {
  const context = useContext(UrlContext);
  if (context === undefined) {
    throw new Error('useUrl must be used within a UrlProvider');
  }
  return context;
}
