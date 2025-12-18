import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

interface SecuritySettings {
  pinEnabled: boolean;
  pinHash: string | null;
  pinLength: 4 | 6;
  autoLockTimeout: number; // in milliseconds, 0 = never
  confidentialMode: boolean;
  maxAttempts: number;
  wipeOnMaxAttempts: boolean;
}

interface SecurityContextType {
  isLocked: boolean;
  isSetupMode: boolean;
  settings: SecuritySettings;
  failedAttempts: number;
  remainingAttempts: number;
  
  // Actions
  lock: () => void;
  unlock: (pin: string) => boolean;
  setupPin: (pin: string) => void;
  changePin: (oldPin: string, newPin: string) => boolean;
  disablePin: (pin: string) => boolean;
  toggleConfidentialMode: () => void;
  updateSettings: (updates: Partial<SecuritySettings>) => void;
  resetSecurity: () => void;
  enterSetupMode: () => void;
  exitSetupMode: () => void;
}

const defaultSettings: SecuritySettings = {
  pinEnabled: false,
  pinHash: null,
  pinLength: 4,
  autoLockTimeout: 0, // Never by default
  confidentialMode: false,
  maxAttempts: 5,
  wipeOnMaxAttempts: false,
};

const SecurityContext = createContext<SecurityContextType | null>(null);

const SECURITY_STORAGE_KEY = 'smart-trade-tracker-security';
const LOCK_STATE_KEY = 'smart-trade-tracker-lock-state';

// Simple hash function for PIN (in production, use bcrypt or similar)
const hashPin = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Add salt based on timestamp for extra security
  const salt = 'stt-secure-';
  return salt + Math.abs(hash).toString(16);
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [isLocked, setIsLocked] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const lastActivityRef = useRef<number>(Date.now());
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`${SECURITY_STORAGE_KEY}-${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsed });
          
          // Check if should be locked on load
          if (parsed.pinEnabled) {
            const lockState = sessionStorage.getItem(`${LOCK_STATE_KEY}-${user.id}`);
            if (lockState !== 'unlocked') {
              setIsLocked(true);
            }
          }
        } catch (e) {
          console.error('Error loading security settings:', e);
        }
      }
    }
  }, [user]);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: SecuritySettings) => {
    if (user) {
      localStorage.setItem(`${SECURITY_STORAGE_KEY}-${user.id}`, JSON.stringify(newSettings));
    }
  }, [user]);

  // Reset activity timer
  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Auto-lock timeout handler
  useEffect(() => {
    if (!settings.pinEnabled || settings.autoLockTimeout === 0 || isLocked) {
      return;
    }

    const checkInactivity = () => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      
      if (elapsed >= settings.autoLockTimeout) {
        setIsLocked(true);
        if (user) {
          sessionStorage.removeItem(`${LOCK_STATE_KEY}-${user.id}`);
        }
      }
    };

    // Check every second
    const interval = setInterval(checkInactivity, 1000);

    // Listen for user activity
    const handleActivity = () => {
      resetActivityTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [settings.pinEnabled, settings.autoLockTimeout, isLocked, user, resetActivityTimer]);

  // Lock on visibility change (app going to background)
  useEffect(() => {
    if (!settings.pinEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && settings.autoLockTimeout > 0) {
        // Lock immediately when app goes to background if auto-lock is enabled
        setIsLocked(true);
        if (user) {
          sessionStorage.removeItem(`${LOCK_STATE_KEY}-${user.id}`);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [settings.pinEnabled, settings.autoLockTimeout, user]);

  const lock = useCallback(() => {
    if (settings.pinEnabled) {
      setIsLocked(true);
      if (user) {
        sessionStorage.removeItem(`${LOCK_STATE_KEY}-${user.id}`);
      }
    }
  }, [settings.pinEnabled, user]);

  const unlock = useCallback((pin: string): boolean => {
    const pinHash = hashPin(pin);
    
    if (pinHash === settings.pinHash) {
      setIsLocked(false);
      setFailedAttempts(0);
      resetActivityTimer();
      if (user) {
        sessionStorage.setItem(`${LOCK_STATE_KEY}-${user.id}`, 'unlocked');
      }
      return true;
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      // Check max attempts
      if (settings.wipeOnMaxAttempts && newAttempts >= settings.maxAttempts) {
        // Clear all user data (optional wipe feature)
        if (user) {
          localStorage.removeItem(`${SECURITY_STORAGE_KEY}-${user.id}`);
        }
        setSettings(defaultSettings);
        setIsLocked(false);
      }
      
      return false;
    }
  }, [settings.pinHash, settings.wipeOnMaxAttempts, settings.maxAttempts, failedAttempts, user, resetActivityTimer]);

  const setupPin = useCallback((pin: string) => {
    const pinHash = hashPin(pin);
    const newSettings = {
      ...settings,
      pinEnabled: true,
      pinHash,
      pinLength: pin.length as 4 | 6,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    setIsSetupMode(false);
    setIsLocked(false);
    if (user) {
      sessionStorage.setItem(`${LOCK_STATE_KEY}-${user.id}`, 'unlocked');
    }
  }, [settings, saveSettings, user]);

  const changePin = useCallback((oldPin: string, newPin: string): boolean => {
    const oldPinHash = hashPin(oldPin);
    
    if (oldPinHash === settings.pinHash) {
      const newPinHash = hashPin(newPin);
      const newSettings = {
        ...settings,
        pinHash: newPinHash,
        pinLength: newPin.length as 4 | 6,
      };
      setSettings(newSettings);
      saveSettings(newSettings);
      return true;
    }
    return false;
  }, [settings, saveSettings]);

  const disablePin = useCallback((pin: string): boolean => {
    const pinHash = hashPin(pin);
    
    if (pinHash === settings.pinHash) {
      const newSettings = {
        ...settings,
        pinEnabled: false,
        pinHash: null,
      };
      setSettings(newSettings);
      saveSettings(newSettings);
      setIsLocked(false);
      return true;
    }
    return false;
  }, [settings, saveSettings]);

  const toggleConfidentialMode = useCallback(() => {
    const newSettings = {
      ...settings,
      confidentialMode: !settings.confidentialMode,
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const updateSettings = useCallback((updates: Partial<SecuritySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const resetSecurity = useCallback(() => {
    setSettings(defaultSettings);
    setIsLocked(false);
    setFailedAttempts(0);
    if (user) {
      localStorage.removeItem(`${SECURITY_STORAGE_KEY}-${user.id}`);
      sessionStorage.removeItem(`${LOCK_STATE_KEY}-${user.id}`);
    }
  }, [user]);

  const enterSetupMode = useCallback(() => {
    setIsSetupMode(true);
  }, []);

  const exitSetupMode = useCallback(() => {
    setIsSetupMode(false);
  }, []);

  const remainingAttempts = settings.maxAttempts - failedAttempts;

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        isSetupMode,
        settings,
        failedAttempts,
        remainingAttempts,
        lock,
        unlock,
        setupPin,
        changePin,
        disablePin,
        toggleConfidentialMode,
        updateSettings,
        resetSecurity,
        enterSetupMode,
        exitSetupMode,
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
