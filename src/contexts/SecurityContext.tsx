import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SecuritySettings {
  confidentialMode: boolean;
}

interface SecurityContextType {
  settings: SecuritySettings;
  isLoading: boolean;
  toggleConfidentialMode: () => Promise<void>;
  updateSettings: (updates: Partial<SecuritySettings>) => Promise<void>;
}

const defaultSettings: SecuritySettings = {
  confidentialMode: false,
};

const SecurityContext = createContext<SecurityContextType | null>(null);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const isSavingRef = useRef(false);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: userSettingsData, error: userSettingsError } = await supabase
          .from('user_settings')
          .select('confidential_mode')
          .eq('user_id', user.id)
          .single();

        if (userSettingsError && userSettingsError.code !== 'PGRST116') {
          console.error('Error loading user settings:', userSettingsError);
        }

        const dbSettings: SecuritySettings = {
          confidentialMode: userSettingsData?.confidential_mode ?? false,
        };
        setSettings(dbSettings);

        // Ensure default record exists
        if (!userSettingsData) {
          await supabase
            .from('user_settings')
            .upsert({
              user_id: user.id,
              confidential_mode: false,
            }, { onConflict: 'user_id' });
        }
      } catch (e) {
        console.error('Error loading security settings:', e);
      }

      setIsLoading(false);
    };

    loadSettings();
  }, [user]);

  // Save settings to database
  const saveSettingsToDb = useCallback(async (newSettings: SecuritySettings) => {
    if (!user || isSavingRef.current) return;
    
    isSavingRef.current = true;
    try {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          confidential_mode: newSettings.confidentialMode,
        }, { onConflict: 'user_id' });

      if (settingsError) {
        console.error('Error saving user settings:', settingsError);
      }
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      isSavingRef.current = false;
    }
  }, [user]);

  const toggleConfidentialMode = useCallback(async () => {
    const newSettings = {
      ...settings,
      confidentialMode: !settings.confidentialMode,
    };
    setSettings(newSettings);
    await saveSettingsToDb(newSettings);
  }, [settings, saveSettingsToDb]);

  const updateSettings = useCallback(async (updates: Partial<SecuritySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettingsToDb(newSettings);
  }, [settings, saveSettingsToDb]);

  return (
    <SecurityContext.Provider
      value={{
        settings,
        isLoading,
        toggleConfidentialMode,
        updateSettings,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
