import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedback } from '@/hooks/useFeedback';
import { useSettings } from '@/hooks/useSettings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES, getCurrencyLabel } from '@/data/currencies';
import { ProfilePhotoUploader } from '@/components/ProfilePhotoUploader';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  User,
  Mail,
  Coins,
  Trophy,
  Calendar,
  Edit3,
  Check,
  X,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAdminRole } from '@/hooks/useAdminRole';

interface ProfileTabProps {
  onSettingChange?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onSettingChange }) => {
  const { language, t } = useLanguage();
  const { user, profile, refreshProfile, updateProfile } = useAuth();
  const { triggerFeedback } = useFeedback();
  const { settings, updateSetting } = useSettings();
  const { isAdmin } = useAdminRole();
  const navigate = useNavigate();

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isSavingNickname, setIsSavingNickname] = useState(false);

  const getLevelTitle = (level: number) => {
    const titles = ['beginner', 'intermediate', 'analyst', 'pro', 'expert', 'legend'];
    const index = Math.min(level - 1, 5);
    return t(titles[index]);
  };

  const handleSaveNickname = async () => {
    if (!newNickname.trim()) {
      toast.error(language === 'fr' ? 'Le pseudo ne peut pas être vide' : 'Nickname cannot be empty');
      return;
    }
    setIsSavingNickname(true);
    triggerFeedback('click');
    const { error } = await updateProfile({ nickname: newNickname.trim() });
    setIsSavingNickname(false);
    if (error) {
      triggerFeedback('error');
      toast.error(language === 'fr' ? 'Erreur lors de la mise à jour' : 'Update error');
    } else {
      triggerFeedback('success');
      toast.success(language === 'fr' ? 'Pseudo mis à jour!' : 'Nickname updated!');
      setIsEditingNickname(false);
      onSettingChange?.();
    }
  };

  const handleCurrencyChange = (value: string) => {
    updateSetting('currency', value);
    triggerFeedback('click');
    toast.success(t('settingUpdated'));
    onSettingChange?.();
  };

  const userLevel = profile?.level || 1;
  const userTitle = getLevelTitle(userLevel);
  const totalPoints = profile?.total_points || 0;

  return (
    <div className="space-y-3">
      {/* Compact Profile Card */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          {/* Avatar compact */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-16 h-16 border-2 border-primary/30">
              <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
                {profile?.nickname?.charAt(0)?.toUpperCase() || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
              {userLevel}
            </div>
          </div>

          {/* Info utilisateur */}
          <div className="flex-1 min-w-0">
            {isEditingNickname ? (
              <div className="flex items-center gap-1">
                <Input
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder={profile?.nickname || 'Trader'}
                  className="h-8 text-sm font-bold"
                  autoFocus
                  disabled={isSavingNickname}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-profit" onClick={handleSaveNickname} disabled={isSavingNickname}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-loss" onClick={() => setIsEditingNickname(false)} disabled={isSavingNickname}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-foreground truncate">{profile?.nickname || 'Trader'}</h3>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setNewNickname(profile?.nickname || ''); setIsEditingNickname(true); }}>
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
              <Mail className="w-3 h-3" />
              <span className="truncate">{user?.email}</span>
            </div>
            {user?.created_at && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(new Date(user.created_at), 'd MMM yyyy', { locale: language === 'fr' ? fr : enUS })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Level & Points - Compact */}
      <div className="glass-card p-3 bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <div>
              <p className="font-bold text-sm text-foreground">{userTitle}</p>
              <p className="text-xs text-muted-foreground">{t('level')} {userLevel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => isAdmin && navigate('/admin-verify')}
              className={isAdmin ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
            >
              <Star className="w-4 h-4 text-yellow-500" />
            </button>
            <span className="text-muted-foreground">{totalPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Currency Selection - Compact */}
      <div className="glass-card p-3">
        <div className="flex items-center gap-3">
          <Coins className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {language === 'fr' ? 'Devise' : 'Currency'}
            </p>
          </div>
          <Select value={settings.currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code} className="text-xs">
                  {currency.code} - {currency.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Change Photo - Compact */}
      <div className="glass-card p-3">
        <ProfilePhotoUploader
          currentAvatarUrl={profile?.avatar_url}
          nickname={profile?.nickname}
          onPhotoUpdated={() => { refreshProfile(); onSettingChange?.(); }}
        />
      </div>
    </div>
  );
};

export default ProfileTab;
