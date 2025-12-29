import React from 'react';
import { useSecurity } from '@/contexts/SecurityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeedback } from '@/hooks/useFeedback';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const SecuritySettings: React.FC = () => {
  const { language } = useLanguage();
  const { triggerFeedback } = useFeedback();
  const {
    settings,
    toggleConfidentialMode,
  } = useSecurity();

  const handleConfidentialModeToggle = () => {
    toggleConfidentialMode();
    triggerFeedback('click');
    toast.success(
      settings.confidentialMode
        ? (language === 'fr' ? 'Mode confidentiel désactivé' : 'Confidential mode disabled')
        : (language === 'fr' ? 'Mode confidentiel activé' : 'Confidential mode enabled')
    );
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
            ? 'Protégez vos données de trading avec le mode confidentiel'
            : 'Protect your trading data with confidential mode'}
        </p>
      </div>

      {/* Confidential Mode Section */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
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
                ? 'Masque les valeurs monétaires et tailles de lot'
                : 'Hides monetary values and lot sizes'}
            </p>
          </div>
          <Switch
            checked={settings.confidentialMode}
            onCheckedChange={handleConfidentialModeToggle}
          />
        </div>
      </div>

      {/* Security Info */}
      <div className={cn(
        "glass-card p-6 animate-fade-in",
        "bg-amber-500/5 border-amber-500/20"
      )} style={{ animationDelay: '100ms' }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">
              {language === 'fr' ? 'Conseil de sécurité' : 'Security tip'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {language === 'fr'
                ? 'Activez le mode confidentiel lorsque vous utilisez l\'application en public pour masquer vos données sensibles.'
                : 'Enable confidential mode when using the app in public to hide your sensitive data.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
