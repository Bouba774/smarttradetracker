import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DeviceInfo {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  deviceVendor: string;
  deviceModel: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  userAgent: string;
  isMobile: boolean;
}

const parseUserAgent = (ua: string): Partial<DeviceInfo> => {
  const result: Partial<DeviceInfo> = {
    userAgent: ua,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
  };

  // Detect browser
  if (ua.includes('Firefox/')) {
    result.browserName = 'Firefox';
    result.browserVersion = ua.match(/Firefox\/(\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    result.browserName = 'Edge';
    result.browserVersion = ua.match(/Edg\/(\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    result.browserName = 'Chrome';
    result.browserVersion = ua.match(/Chrome\/(\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    result.browserName = 'Safari';
    result.browserVersion = ua.match(/Version\/(\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    result.browserName = 'Opera';
    result.browserVersion = ua.match(/(?:Opera|OPR)\/(\d+\.?\d*)/)?.[1] || '';
  } else {
    result.browserName = 'Unknown';
    result.browserVersion = '';
  }

  // Detect OS
  if (ua.includes('Windows NT 10')) {
    result.osName = 'Windows';
    result.osVersion = '10/11';
  } else if (ua.includes('Windows NT')) {
    result.osName = 'Windows';
    result.osVersion = ua.match(/Windows NT (\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('Mac OS X')) {
    result.osName = 'macOS';
    result.osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (ua.includes('Android')) {
    result.osName = 'Android';
    result.osVersion = ua.match(/Android (\d+\.?\d*)/)?.[1] || '';
  } else if (ua.includes('iPhone OS') || ua.includes('iPad')) {
    result.osName = 'iOS';
    result.osVersion = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (ua.includes('Linux')) {
    result.osName = 'Linux';
    result.osVersion = '';
  } else {
    result.osName = 'Unknown';
    result.osVersion = '';
  }

  // Detect device type and vendor
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  
  result.isMobile = isMobile;
  result.deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // Detect device vendor and model
  if (ua.includes('iPhone')) {
    result.deviceVendor = 'Apple';
    result.deviceModel = 'iPhone';
  } else if (ua.includes('iPad')) {
    result.deviceVendor = 'Apple';
    result.deviceModel = 'iPad';
  } else if (ua.includes('Macintosh')) {
    result.deviceVendor = 'Apple';
    result.deviceModel = 'Mac';
  } else if (ua.includes('Samsung')) {
    result.deviceVendor = 'Samsung';
    const model = ua.match(/Samsung[;\s]*(SM-[A-Z0-9]+|Galaxy[^;)]+)/i);
    result.deviceModel = model?.[1] || 'Samsung Device';
  } else if (ua.includes('Huawei') || ua.includes('HUAWEI')) {
    result.deviceVendor = 'Huawei';
    result.deviceModel = ua.match(/(?:Huawei|HUAWEI)[;\s]*([^;)]+)/i)?.[1] || 'Huawei Device';
  } else if (ua.includes('Xiaomi') || ua.includes('Redmi')) {
    result.deviceVendor = 'Xiaomi';
    result.deviceModel = ua.match(/(?:Xiaomi|Redmi)[;\s]*([^;)]+)/i)?.[1] || 'Xiaomi Device';
  } else if (ua.includes('OPPO')) {
    result.deviceVendor = 'OPPO';
    result.deviceModel = ua.match(/OPPO[;\s]*([^;)]+)/i)?.[1] || 'OPPO Device';
  } else if (ua.includes('Vivo') || ua.includes('vivo')) {
    result.deviceVendor = 'Vivo';
    result.deviceModel = ua.match(/(?:Vivo|vivo)[;\s]*([^;)]+)/i)?.[1] || 'Vivo Device';
  } else if (ua.includes('OnePlus')) {
    result.deviceVendor = 'OnePlus';
    result.deviceModel = ua.match(/OnePlus[;\s]*([^;)]+)/i)?.[1] || 'OnePlus Device';
  } else if (ua.includes('Pixel')) {
    result.deviceVendor = 'Google';
    result.deviceModel = ua.match(/Pixel[^;)]*/i)?.[0] || 'Pixel';
  } else if (result.deviceType === 'desktop') {
    result.deviceVendor = 'PC';
    result.deviceModel = result.osName === 'Windows' ? 'Windows PC' : result.osName === 'Linux' ? 'Linux PC' : 'Desktop';
  } else {
    result.deviceVendor = 'Unknown';
    result.deviceModel = 'Unknown Device';
  }

  return result;
};

export const useSessionTracking = () => {
  const { user } = useAuth();
  const hasTracked = useRef(false);
  const currentSessionId = useRef<string | null>(null);

  useEffect(() => {
    const trackSession = async () => {
      if (!user || hasTracked.current) return;

      try {
        hasTracked.current = true;
        
        const deviceInfo = parseUserAgent(navigator.userAgent);

        console.log('Tracking session with device info:', deviceInfo);

        const { data, error } = await supabase.functions.invoke('track-session', {
          body: { deviceInfo }
        });

        if (error) {
          console.error('Error tracking session:', error);
          hasTracked.current = false; // Allow retry
          return;
        }

        if (data?.sessionId) {
          currentSessionId.current = data.sessionId;
          console.log('Session tracked:', data.sessionId);
        }
      } catch (err) {
        console.error('Failed to track session:', err);
        hasTracked.current = false;
      }
    };

    trackSession();

    // Reset tracking when user logs out
    return () => {
      if (!user) {
        hasTracked.current = false;
        currentSessionId.current = null;
      }
    };
  }, [user]);

  // Update session end time when page is closed
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentSessionId.current && user) {
        // Use sendBeacon for reliable data sending on page close
        const updateData = {
          session_end: new Date().toISOString()
        };
        
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_sessions?id=eq.${currentSessionId.current}`,
          JSON.stringify(updateData)
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  return { sessionId: currentSessionId.current };
};
