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
import { PINInput } from './PINInput';
import {
  Shield,
  Lock,
  Timer,
  Eye,
  EyeOff,
  AlertTriangle,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const SecuritySettings: React.FC = () => {
  const { language } = useLanguage();
  const { triggerFeedback } = useFeedback();
  const {
    settings,
    enterSetupMode,
    disablePin,
    toggleConfidentialMode,
    updateSettings,
    lock,
  } = useSecurity();

  const [showDisablePinDialog, setShowDisablePinDialog] = useState(false);
  const [showChangePinDialog, setShowChangePinDialog] = useState(false);
  const [pinError, setPinError] = useState(false);

  const autoLockOptions = [
    { value: '0', label: language === 'fr' ? 'Jamais' : 'Never' },
    { value: '60000', label: language === 'fr' ? '1 minute' : '1 minute' },
    { value: '300000', label: language === 'fr' ? '5 minutes' : '5 minutes' },
    { value: '900000', label: language === 'fr' ? '15 minutes' : '15 minutes' },
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
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
    }
  };

  const handleAutoLockChange = (value: string) => {
    updateSettings({ autoLockTimeout: parseInt(value) });
    triggerFeedback('click');
    toast.success(language === 'fr' ? 'Paramètre mis à jour' : 'Setting updated');
  };

  const handleConfidentialModeToggle = () => {
    toggleConfidentialMode();
    triggerFeedback('click');
    toast.success(
      settings.confidentialMode
        ? (language === 'fr' ? 'Mode confidentiel désactivé' : 'Confidential mode disabled')
        : (language === 'fr' ? 'Mode confidentiel activé' : 'Confidential mode enabled')
    );
  };

  const handleLockNow = () => {
    triggerFeedback('click');
    lock();
  };

  return (
    <div className="space-y-6">
      {/* Security Header */}
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            {language === 'fr' ? 'Sécurité' : 'Security'}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === 'fr'
            ? 'Protégez vos données de trading avec un code PIN et le verrouillage automatique'
            : 'Protect your trading data with a PIN code and automatic locking'}
        </p>
      </div>

      {/* PIN Code Section */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <KeyRound className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            {language === 'fr' ? 'Code PIN' : 'PIN Code'}
          </h3>
        </div>

        {settings.pinEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  {language === 'fr' ? 'PIN activé' : 'PIN enabled'} ({settings.pinLength} {language === 'fr' ? 'chiffres' : 'digits'})
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-trading-profit animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setShowChangePinDialog(true)}
                className="gap-2"
              >
                <KeyRound className="w-4 h-4" />
                {language === 'fr' ? 'Changer PIN' : 'Change PIN'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDisablePinDialog(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                {language === 'fr' ? 'Désactiver' : 'Disable'}
              </Button>
            </div>

            <Button
              variant="default"
              onClick={handleLockNow}
              className="w-full gap-2"
            >
              <Lock className="w-4 h-4" />
              {language === 'fr' ? 'Verrouiller maintenant' : 'Lock now'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'fr'
                ? 'Ajoutez un code PIN pour sécuriser l\'accès à votre journal de trading'
                : 'Add a PIN code to secure access to your trading journal'}
            </p>
            <Button onClick={handleEnablePin} className="w-full gap-2">
              <Lock className="w-4 h-4" />
              {language === 'fr' ? 'Activer le code PIN' : 'Enable PIN code'}
            </Button>
          </div>
        )}
      </div>

      {/* Auto-Lock Section */}
      {settings.pinEnabled && (
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <Timer className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">
              {language === 'fr' ? 'Verrouillage automatique' : 'Auto-lock'}
            </h3>
          </div>

          <Select
            value={settings.autoLockTimeout.toString()}
            onValueChange={handleAutoLockChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {autoLockOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-xs text-muted-foreground mt-2">
            {language === 'fr'
              ? 'L\'application se verrouille après une période d\'inactivité'
              : 'The app locks after a period of inactivity'}
          </p>
        </div>
      )}

      {/* Confidential Mode Section */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center gap-3 mb-4">
          {settings.confidentialMode ? (
            <EyeOff className="w-5 h-5 text-primary" />
          ) : (
            <Eye className="w-5 h-5 text-primary" />
          )}
          <h3 className="font-display font-semibold text-foreground">
            {language === 'fr' ? 'Mode confidentiel' : 'Confidential mode'}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-foreground">
              {language === 'fr' ? 'Masquer les montants' : 'Hide amounts'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {language === 'fr'
                ? 'Floute les valeurs monétaires et PnL'
                : 'Blurs monetary values and PnL'}
            </p>
          </div>
          <Switch
            checked={settings.confidentialMode}
            onCheckedChange={handleConfidentialModeToggle}
          />
        </div>
      </div>

      {/* Security Warning */}
      <div className={cn(
        "glass-card p-6 animate-fade-in",
        "bg-amber-500/5 border-amber-500/20"
      )} style={{ animationDelay: '200ms' }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">
              {language === 'fr' ? 'Conseil de sécurité' : 'Security tip'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {language === 'fr'
                ? 'Ne partagez jamais votre code PIN. Utilisez un code unique que vous n\'utilisez nulle part ailleurs.'
                : 'Never share your PIN code. Use a unique code that you don\'t use anywhere else.'}
            </p>
          </div>
        </div>
      </div>

      {/* Disable PIN Dialog */}
      <Dialog open={showDisablePinDialog} onOpenChange={setShowDisablePinDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Désactiver le code PIN' : 'Disable PIN code'}
            </DialogTitle>
            <DialogDescription>
              {language === 'fr'
                ? 'Entrez votre code PIN actuel pour le désactiver'
                : 'Enter your current PIN code to disable it'}
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

      {/* Change PIN Dialog */}
      <Dialog open={showChangePinDialog} onOpenChange={setShowChangePinDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {language === 'fr' ? 'Changer le code PIN' : 'Change PIN code'}
            </DialogTitle>
            <DialogDescription>
              {language === 'fr'
                ? 'Cette fonctionnalité sera disponible prochainement'
                : 'This feature will be available soon'}
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowChangePinDialog(false)}>
            {language === 'fr' ? 'Fermer' : 'Close'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettings;
