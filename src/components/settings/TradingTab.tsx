import React from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFeedback } from '@/hooks/useFeedback';
import { useTradeFocus } from '@/hooks/useTradeFocus';
import { useSettings, AppSettings } from '@/hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Moon,
  Sun,
  Palette,
  Languages,
  Type,
  Vibrate,
  Volume2,
  Sparkles,
  Focus,
  Target,
  Calculator,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TradingTabProps {
  onSettingChange?: () => void;
}

export const TradingTab: React.FC<TradingTabProps> = ({ onSettingChange }) => {
  const { language, setLanguage, t, languages } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { triggerFeedback } = useFeedback();
  const tradeFocus = useTradeFocus();
  const { settings, updateSetting } = useSettings();

  const [primaryColor, setPrimaryColor] = React.useState(() => {
    return localStorage.getItem('smart-trade-tracker-primary-color') || 'blue';
  });

  const handleUpdateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateSetting(key, value);
    triggerFeedback('click');
    
    if (key === 'fontSize') {
      const root = document.documentElement;
      switch (value) {
        case 'small': root.style.fontSize = '14px'; break;
        case 'standard': root.style.fontSize = '16px'; break;
        case 'large': root.style.fontSize = '18px'; break;
      }
    }
    toast.success(t('settingUpdated'));
    onSettingChange?.();
  };

  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('smart-trade-tracker-primary-color', color);
    triggerFeedback('click');
    
    const root = document.documentElement;
    const colorMap: Record<string, string> = {
      blue: '217 91% 60%', green: '142 71% 45%', red: '0 84% 60%',
      purple: '263 70% 50%', orange: '25 95% 53%', cyan: '189 94% 43%',
    };
    if (colorMap[color]) root.style.setProperty('--primary', colorMap[color]);
    toast.success(t('colorUpdated'));
    onSettingChange?.();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    triggerFeedback('click');
    toast.success(t('settingUpdated'));
    onSettingChange?.();
  };

  const colors = [
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'green', class: 'bg-green-500' },
    { id: 'red', class: 'bg-red-500' },
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'orange', class: 'bg-orange-500' },
    { id: 'cyan', class: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-3">
      {/* Theme & Color Row */}
      <div className="glass-card p-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Theme */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">{t('displayMode')}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setTheme('light'); triggerFeedback('click'); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 p-2 rounded-md border text-xs transition-all",
                  theme === 'light' ? "border-primary bg-primary/10 text-primary" : "border-border"
                )}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setTheme('dark'); triggerFeedback('click'); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 p-2 rounded-md border text-xs transition-all",
                  theme === 'dark' ? "border-primary bg-primary/10 text-primary" : "border-border"
                )}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Colors */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">{t('primaryColor')}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.id)}
                  className={cn(
                    "w-6 h-6 rounded-md transition-all",
                    color.class,
                    primaryColor === color.id ? "ring-2 ring-offset-1 ring-offset-background ring-primary scale-110" : "opacity-60 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language & Font Size Row */}
      <div className="glass-card p-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Language */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-primary flex-shrink-0" />
            <Select value={language} onValueChange={(v) => handleLanguageChange(v as Language)}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-xs">
                    {lang.flag} {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-primary flex-shrink-0" />
            <Select value={settings.fontSize} onValueChange={(v) => handleUpdateSetting('fontSize', v as AppSettings['fontSize'])}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small" className="text-xs">{language === 'fr' ? 'Petit' : 'Small'}</SelectItem>
                <SelectItem value="standard" className="text-xs">Standard</SelectItem>
                <SelectItem value="large" className="text-xs">{language === 'fr' ? 'Grand' : 'Large'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Options Toggles - Compact Row */}
      <div className="glass-card p-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
            <div className="flex items-center gap-1.5">
              <Vibrate className="w-4 h-4 text-primary" />
              <span className="text-xs">{t('vibration')}</span>
            </div>
            <Switch
              checked={settings.vibration}
              onCheckedChange={(checked) => handleUpdateSetting('vibration', checked)}
              className="scale-75"
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="text-xs">{t('sounds')}</span>
            </div>
            <Switch
              checked={settings.sounds}
              onCheckedChange={(checked) => handleUpdateSetting('sounds', checked)}
              className="scale-75"
            />
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs">{t('animations')}</span>
            </div>
            <Switch
              checked={settings.animations}
              onCheckedChange={(checked) => handleUpdateSetting('animations', checked)}
              className="scale-75"
            />
          </div>
        </div>
      </div>

      {/* Calculator Defaults - Compact */}
      <div className="glass-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">
            {language === 'fr' ? 'Paramètres calculatrice' : 'Calculator defaults'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px] text-muted-foreground">{language === 'fr' ? 'Capital' : 'Capital'}</Label>
            <Input
              type="number"
              value={settings.defaultCapital || ''}
              onChange={(e) => handleUpdateSetting('defaultCapital', e.target.value ? Number(e.target.value) : null)}
              placeholder="10000"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">{language === 'fr' ? 'Risque %' : 'Risk %'}</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.defaultRiskPercent || ''}
              onChange={(e) => handleUpdateSetting('defaultRiskPercent', e.target.value ? Number(e.target.value) : null)}
              placeholder="1"
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Focus Mode - Compact */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Focus className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">{language === 'fr' ? 'Mode Focus' : 'Focus Mode'}</span>
          </div>
          <Switch
            checked={tradeFocus.isEnabled}
            onCheckedChange={() => { tradeFocus.toggle(); triggerFeedback('click'); }}
            className="scale-75"
          />
        </div>
        
        {tradeFocus.isEnabled && (
          <div className="space-y-2 mt-2">
            <Textarea
              value={tradeFocus.tradingPlan}
              onChange={(e) => tradeFocus.setTradingPlan(e.target.value)}
              placeholder={language === 'fr' ? 'Plan de trading...' : 'Trading plan...'}
              rows={2}
              className="resize-none text-xs"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {language === 'fr' ? 'Objectif' : 'Goal'}
                </Label>
                <Input
                  value={tradeFocus.dailyGoal}
                  onChange={(e) => tradeFocus.setDailyGoal(e.target.value)}
                  placeholder="+50$"
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">{language === 'fr' ? 'Max trades' : 'Max trades'}</Label>
                <Input
                  type="number"
                  value={tradeFocus.maxTrades}
                  onChange={(e) => tradeFocus.setMaxTrades(Number(e.target.value))}
                  min={1}
                  className="h-7 text-xs"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {language === 'fr' ? 'Perte max' : 'Max loss'}
                </Label>
                <Input
                  type="number"
                  value={tradeFocus.maxLoss}
                  onChange={(e) => tradeFocus.setMaxLoss(Number(e.target.value))}
                  min={0}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingTab;
