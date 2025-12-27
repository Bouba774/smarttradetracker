import React, { useState } from 'react';
import { useSecurity } from '@/contexts/SecurityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeedback } from '@/hooks/useFeedback';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PINInput } from '@/components/PINInput';
import {
  Shield,
  Lock,
  Timer,
  Eye,
  EyeOff,
  KeyRound,
  Trash2,
  Fingerprint,
  History,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SecurityTabProps {
  onSettingChange?: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ onSettingChange }) => {
  const { language } = useLanguage();
  const { triggerFeedback } = useFeedback();
  const {
    settings,
    enterSetupMode,
    disablePin,
    toggleConfidentialMode,
    toggleBiometric,
    updateSettings,
    lock,
    attemptHistory,
    clearAttemptHistory,
    biometricAvailable,
  } = useSecurity();

  const [showDisablePinDialog, setShowDisablePinDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [pinError, setPinError] = useState(false);

  const autoLockOptions = [
    { value: '0', label: language === 'fr' ? 'Jamais' : 'Never' },
    { value: '60000', label: '1 min' },
    { value: '300000', label: '5 min' },
    { value: '900000', label: '15 min' },
  ];

  const handleEnablePin = () => {
    triggerFeedback('click');
    enterSetupMode();
  };

  const handleDisablePin = (pin: string) => {
    const success = disablePin(pin);
    if (success) {
      setShowDisablePinDialog(false);
      triggerFeedback('success');
      toast.success(language === 'fr' ? 'Code PIN désactivé' : 'PIN code disabled');
      onSettingChange?.();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  const handleAutoLockChange = (value: string) => {
    updateSettings({ autoLockTimeout: parseInt(value) });
    triggerFeedback('click');
    toast.success(language === 'fr' ? 'Paramètre mis à jour' : 'Setting updated');
    onSettingChange?.();
  };

  const handleConfidentialModeToggle = () => {
    toggleConfidentialMode();
    triggerFeedback('click');
    toast.success(
      settings.confidentialMode
        ? (language === 'fr' ? 'Mode confidentiel désactivé' : 'Confidential mode disabled')
        : (language === 'fr' ? 'Mode confidentiel activé' : 'Confidential mode enabled')
    );
    onSettingChange?.();
  };

  const handleBiometricToggle = () => {
    triggerFeedback('click');
    toggleBiometric();
    onSettingChange?.();
  };

  const formatAttemptDate = (timestamp: number) => {
    return format(new Date(timestamp), 'dd/MM HH:mm', {
      locale: language === 'fr' ? fr : enUS,
    });
  };

  return (
    <div className="space-y-3">
      {/* PIN Section */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{language === 'fr' ? 'Code PIN' : 'PIN Code'}</span>
          </div>
          {settings.pinEnabled ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-profit animate-pulse" />
              <span className="text-xs text-muted-foreground">{settings.pinLength} digits</span>
            </div>
          ) : null}
        </div>

        {settings.pinEnabled ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => lock()}>
              <Lock className="w-3 h-3" />
              {language === 'fr' ? 'Verrouiller' : 'Lock now'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 text-destructive hover:text-destructive"
              onClick={() => setShowDisablePinDialog(true)}
            >
              <Trash2 className="w-3 h-3" />
              {language === 'fr' ? 'Désactiver' : 'Disable'}
            </Button>
          </div>
        ) : (
          <Button onClick={handleEnablePin} size="sm" className="w-full h-8 text-xs gap-1">
            <Lock className="w-3 h-3" />
            {language === 'fr' ? 'Activer le code PIN' : 'Enable PIN code'}
          </Button>
        )}
      </div>

      {/* Biometric & Auto-lock Row */}
      {settings.pinEnabled && (
        <div className="glass-card p-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Biometric */}
            <div className="p-2 rounded-md bg-secondary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <span className="text-xs">{language === 'fr' ? 'Biométrie' : 'Biometric'}</span>
                </div>
                <Switch
                  checked={settings.biometricEnabled}
                  onCheckedChange={handleBiometricToggle}
                  disabled={!biometricAvailable}
                  className="scale-75"
                />
              </div>
            </div>

            {/* Auto-lock */}
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary flex-shrink-0" />
              <Select
                value={settings.autoLockTimeout.toString()}
                onValueChange={handleAutoLockChange}
              >
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {autoLockOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Confidential Mode */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.confidentialMode ? (
              <EyeOff className="w-4 h-4 text-primary" />
            ) : (
              <Eye className="w-4 h-4 text-primary" />
            )}
            <div>
              <p className="text-sm font-medium">{language === 'fr' ? 'Mode confidentiel' : 'Confidential mode'}</p>
              <p className="text-[10px] text-muted-foreground">
                {language === 'fr' ? 'Masque les montants' : 'Hides amounts'}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.confidentialMode}
            onCheckedChange={handleConfidentialModeToggle}
            className="scale-75"
          />
        </div>
      </div>

      {/* Access History - Compact */}
      {settings.pinEnabled && attemptHistory.length > 0 && (
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{language === 'fr' ? 'Historique' : 'History'}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowHistoryDialog(true)}>
              {language === 'fr' ? 'Voir tout' : 'View all'}
            </Button>
          </div>
          
          <div className="space-y-1.5">
            {attemptHistory.slice(-2).reverse().map((attempt, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded text-xs",
                  attempt.success ? "bg-profit/10" : "bg-destructive/10"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {attempt.success ? (
                    <CheckCircle className="w-3 h-3 text-profit" />
                  ) : (
                    <XCircle className="w-3 h-3 text-destructive" />
                  )}
                  <span className="text-muted-foreground">{formatAttemptDate(attempt.timestamp)}</span>
                </div>
                {attempt.device && (
                  <span className="text-[10px] text-muted-foreground">{attempt.device.browser}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Center Link */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm">{language === 'fr' ? 'Centre de confidentialité' : 'Privacy Center'}</span>
          </div>
          <a
            href="/privacy-center"
            className="text-xs text-primary hover:underline"
          >
            {language === 'fr' ? 'Accéder' : 'Access'}
          </a>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showDisablePinDialog} onOpenChange={setShowDisablePinDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{language === 'fr' ? 'Désactiver le code PIN' : 'Disable PIN code'}</DialogTitle>
            <DialogDescription>
              {language === 'fr' ? 'Entrez votre code PIN actuel' : 'Enter your current PIN code'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            <PINInput
              length={settings.pinLength}
              onComplete={handleDisablePin}
              onCancel={() => setShowDisablePinDialog(false)}
              error={pinError}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'fr' ? 'Historique des accès' : 'Access History'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {attemptHistory.slice().reverse().map((attempt, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-2 rounded border",
                    attempt.success ? "bg-profit/5 border-profit/20" : "bg-destructive/5 border-destructive/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {attempt.success ? <CheckCircle className="w-4 h-4 text-profit" /> : <XCircle className="w-4 h-4 text-destructive" />}
                    <span className="text-sm">{formatAttemptDate(attempt.timestamp)}</span>
                  </div>
                  {attempt.device && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Smartphone className="w-3 h-3" />
                      <span>{attempt.device.browser}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => { clearAttemptHistory(); setShowHistoryDialog(false); }}>
              {language === 'fr' ? 'Effacer' : 'Clear'}
            </Button>
            <Button size="sm" onClick={() => setShowHistoryDialog(false)}>
              {language === 'fr' ? 'Fermer' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityTab;
