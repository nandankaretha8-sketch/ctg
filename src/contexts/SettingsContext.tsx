import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import settingsService from '@/services/settingsService';

interface Settings {
  logo?: string;
  favicon?: string;
  mentorPhoto?: string;
  siteName?: string;
  siteDescription?: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      // Silent error handling for settings
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Update favicon when settings change
  useEffect(() => {
    if (settings.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.favicon;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = settings.favicon;
        document.head.appendChild(newLink);
      }
    }
  }, [settings.favicon]);

  // Update document title and meta tags when site name changes
  useEffect(() => {
    if (settings.siteName) {
      const title = `${settings.siteName} - Trading Challenge Platform`;
      document.title = title;
      
      // Update meta tags
      const metaTitle = document.querySelector('meta[property="og:title"]');
      if (metaTitle) {
        metaTitle.setAttribute('content', title);
      }
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && settings.siteDescription) {
        metaDescription.setAttribute('content', settings.siteDescription);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription && settings.siteDescription) {
        ogDescription.setAttribute('content', settings.siteDescription);
      }
      
      const metaAuthor = document.querySelector('meta[name="author"]');
      if (metaAuthor) {
        metaAuthor.setAttribute('content', settings.siteName);
      }
    }
  }, [settings.siteName, settings.siteDescription]);

  const value = {
    settings,
    loading,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};