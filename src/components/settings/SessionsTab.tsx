import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useSessionSettings, 
  DEFAULT_SESSION_SETTINGS,
  SessionMode,
  ClassicSessions,
  KillzoneSessions,
  SessionRange 
} from '@/hooks/useSessionSettings';
import { Label } from '@/components/ui/label';
import { Clock, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SessionsTabProps {
  onSettingChange?: () => void;
}

export const SessionsTab: React.FC<SessionsTabProps> = ({ onSettingChange }) => {
  const { language } = useLanguage();
  const { settings, saveSettings } = useSessionSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  const classicSessions: { key: keyof ClassicSessions; label: string; color: string }[] = [
    { key: 'sydney', label: 'Sydney', color: 'bg-purple-500' },
    { key: 'tokyo', label: 'Tokyo', color: 'bg-yellow-500' },
    { key: 'london', label: language === 'fr' ? 'Londres' : 'London', color: 'bg-blue-500' },
    { key: 'newYork', label: 'New York', color: 'bg-green-500' },
  ];

  const killzoneSessions: { key: keyof KillzoneSessions; label: string; color: string }[] = [
    { key: 'asia', label: language === 'fr' ? 'Asie' : 'Asia', color: 'bg-yellow-500' },
    { key: 'london', label: language === 'fr' ? 'Londres' : 'London', color: 'bg-blue-500' },
    { key: 'newYork', label: 'NY', color: 'bg-green-500' },
    { key: 'londonClose', label: 'LDN Close', color: 'bg-orange-500' },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  const handleModeChange = (mode: SessionMode) => {
    const newSettings = { ...localSettings, mode };
    setLocalSettings(newSettings);
    saveSettings(newSettings);
    onSettingChange?.();
  };

  const updateClassicRange = (session: keyof ClassicSessions, field: 'start' | 'end', value: number) => {
    const newSettings = {
      ...localSettings,
      classic: {
        ...localSettings.classic,
        [session]: {
          ...localSettings.classic[session],
          [field]: value,
        },
      },
    };
    setLocalSettings(newSettings);
    saveSettings(newSettings);
    onSettingChange?.();
  };

  const updateKillzoneRange = (session: keyof KillzoneSessions, field: 'start' | 'end', value: number) => {
    const newSettings = {
      ...localSettings,
      killzones: {
        ...localSettings.killzones,
        [session]: {
          ...localSettings.killzones[session],
          [field]: value,
        },
      },
    };
    setLocalSettings(newSettings);
    saveSettings(newSettings);
    onSettingChange?.();
  };

  const renderSessionCard = (
    session: { key: string; label: string; color: string },
    range: SessionRange,
    onChange: (field: 'start' | 'end', value: number) => void
  ) => (
    <div key={session.key} className="p-2 rounded-lg border border-border bg-secondary/20">
      <div className="flex items-center gap-1.5 mb-2">
        <div className={cn("w-2 h-2 rounded-full", session.color)} />
        <span className="text-xs font-medium">{session.label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Select
          value={range.start.toString()}
          onValueChange={(value) => onChange('start', parseInt(value))}
        >
          <SelectTrigger className="h-7 text-[10px] flex-1 px-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour.toString()} className="text-xs">
                {formatHour(hour)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground text-xs">→</span>
        <Select
          value={range.end.toString()}
          onValueChange={(value) => onChange('end', parseInt(value))}
        >
          <SelectTrigger className="h-7 text-[10px] flex-1 px-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {hours.map((hour) => (
              <SelectItem key={hour} value={hour.toString()} className="text-xs">
                {formatHour(hour)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Info Card */}
      <div className="glass-card p-3 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted-foreground">
            {language === 'fr' 
              ? 'Horaires basés sur New York Time (EST/EDT)' 
              : 'Times are based on New York Time (EST/EDT)'}
          </p>
        </div>
      </div>

      {/* Session Mode Tabs */}
      <Tabs 
        value={localSettings.mode} 
        onValueChange={(v) => handleModeChange(v as SessionMode)}
      >
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="classic" className="gap-1.5 text-xs h-7">
            <TrendingUp className="w-3 h-3" />
            {language === 'fr' ? 'Classique' : 'Classic'}
          </TabsTrigger>
          <TabsTrigger value="killzones" className="gap-1.5 text-xs h-7">
            <Zap className="w-3 h-3" />
            ICT Killzones
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="classic" className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            {classicSessions.map((session) => 
              renderSessionCard(
                session,
                localSettings.classic[session.key],
                (field, value) => updateClassicRange(session.key, field, value)
              )
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="killzones" className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            {killzoneSessions.map((session) => 
              renderSessionCard(
                session,
                localSettings.killzones[session.key],
                (field, value) => updateKillzoneRange(session.key, field, value)
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionsTab;
