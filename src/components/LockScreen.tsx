import React, { useState } from 'react';
import { useSecurity } from '@/contexts/SecurityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PINInput } from './PINInput';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/version';

export const LockScreen: React.FC = () => {
  const { language } = useLanguage();
  const { 
    isLocked, 
    isSetupMode, 
    settings, 
    unlock, 
    setupPin, 
    exitSetupMode,
    failedAttempts,
    remainingAttempts 
  } = useSecurity();
  
  const [error, setError] = useState(false);
  const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = useState('');

  if (!isLocked && !isSetupMode) {
    return null;
  }

  const handleUnlock = (pin: string) => {
    const success = unlock(pin);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const handleSetup = (pin: string) => {
    if (setupStep === 'enter') {
      setFirstPin(pin);
      setSetupStep('confirm');
    } else {
      if (pin === firstPin) {
        setupPin(pin);
        setSetupStep('enter');
        setFirstPin('');
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setSetupStep('enter');
          setFirstPin('');
        }, 500);
      }
    }
  };

  const handleCancelSetup = () => {
    exitSetupMode();
    setSetupStep('enter');
    setFirstPin('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full">
        {/* Logo/Icon */}
        <div className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center",
          "bg-gradient-to-br from-primary/20 to-primary/5",
          "border border-primary/20 shadow-lg"
        )}>
          {isSetupMode ? (
            <Shield className="w-10 h-10 text-primary" />
          ) : (
            <Lock className="w-10 h-10 text-primary" />
          )}
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
          <p className="text-muted-foreground">
            {isSetupMode
              ? setupStep === 'enter'
                ? language === 'fr' ? 'Créer votre code PIN' : 'Create your PIN code'
                : language === 'fr' ? 'Confirmer votre code PIN' : 'Confirm your PIN code'
              : language === 'fr' ? 'Entrez votre code PIN' : 'Enter your PIN code'
            }
          </p>
        </div>

        {/* Error Message */}
        {failedAttempts > 0 && !isSetupMode && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-destructive/10 border border-destructive/20 text-destructive"
          )}>
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              {language === 'fr' 
                ? `${remainingAttempts} tentatives restantes`
                : `${remainingAttempts} attempts remaining`
              }
            </span>
          </div>
        )}

        {/* PIN Input */}
        <PINInput
          length={isSetupMode ? 4 : settings.pinLength}
          onComplete={isSetupMode ? handleSetup : handleUnlock}
          onCancel={isSetupMode ? handleCancelSetup : undefined}
          error={error}
          showConfirm={isSetupMode}
        />

        {/* Setup hint */}
        {isSetupMode && setupStep === 'confirm' && (
          <p className="text-sm text-muted-foreground text-center">
            {language === 'fr' 
              ? 'Entrez à nouveau le même code pour confirmer'
              : 'Enter the same code again to confirm'
            }
          </p>
        )}

        {/* Security Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground/70">
            {language === 'fr' 
              ? 'Vos données sont protégées et chiffrées'
              : 'Your data is protected and encrypted'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
