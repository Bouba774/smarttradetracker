import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  User,
  Camera,
  Save,
  LogOut,
  Trash2,
  Target,
  TrendingUp,
  Award,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const TRADING_STYLES = [
  { value: 'scalping', label: 'Scalping' },
  { value: 'daytrading', label: 'Day Trading' },
  { value: 'swing', label: 'Swing Trading' },
  { value: 'position', label: 'Position Trading' },
  { value: 'mixed', label: 'Mixte' },
];

const USER_LEVELS = [
  { level: 1, title: 'Débutant', badge: '🌱' },
  { level: 2, title: 'Apprenti', badge: '📚' },
  { level: 3, title: 'Trader', badge: '📊' },
  { level: 4, title: 'Confirmé', badge: '💪' },
  { level: 5, title: 'Expert', badge: '🎯' },
  { level: 6, title: 'Maître', badge: '⭐' },
  { level: 7, title: 'Champion', badge: '🏆' },
  { level: 8, title: 'Légende', badge: '👑' },
];

const Profile: React.FC = () => {
  const { language, t } = useLanguage();

  // Mock user data - to be replaced with real data
  const [profile, setProfile] = useState({
    nickname: 'TraderPro',
    photo: '',
    tradingStyle: 'daytrading',
    weeklyObjective: '5% de gains, max 3 trades/jour',
    monthlyObjective: '20% de gains, winrate > 60%',
    bio: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Mock stats
  const userStats = {
    level: 4,
    points: 650,
    challengesCompleted: 8,
    totalTrades: 142,
    memberSince: '2024-06-15',
  };

  const currentLevel = USER_LEVELS.find(l => l.level === userStats.level) || USER_LEVELS[0];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toast.success(language === 'fr' ? 'Profil mis à jour!' : 'Profile updated!');
  };

  const handleLogout = () => {
    toast.success(language === 'fr' ? 'Déconnexion...' : 'Logging out...');
  };

  const handleDeleteAccount = () => {
    toast.error(language === 'fr' ? 'Compte supprimé' : 'Account deleted');
  };

  return (
    <div className="py-4 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t('profile')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? 'Gérez vos informations' : 'Manage your information'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Profile Photo & Level Card */}
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Photo */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-secondary/50 border-2 border-primary/50 flex items-center justify-center overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {profile.nickname}
              </h2>
              <span className="text-2xl">{currentLevel.badge}</span>
            </div>
            <p className="text-primary font-medium">
              {currentLevel.title} — {language === 'fr' ? 'Niveau' : 'Level'} {userStats.level}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {userStats.points} points • {userStats.challengesCompleted} {language === 'fr' ? 'défis complétés' : 'challenges completed'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="font-display text-xl font-bold text-foreground">{userStats.totalTrades}</p>
              <p className="text-xs text-muted-foreground">Trades</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/30">
              <p className="font-display text-xl font-bold text-profit">67%</p>
              <p className="text-xs text-muted-foreground">Winrate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass-card p-6 space-y-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          {language === 'fr' ? 'Informations' : 'Information'}
        </h3>

        {/* Nickname */}
        <div className="space-y-2">
          <Label htmlFor="nickname">
            {language === 'fr' ? 'Surnom' : 'Nickname'}
          </Label>
          <Input
            id="nickname"
            value={profile.nickname}
            onChange={(e) => setProfile(prev => ({ ...prev, nickname: e.target.value }))}
            placeholder="Votre surnom"
          />
        </div>

        {/* Trading Style */}
        <div className="space-y-2">
          <Label>
            {language === 'fr' ? 'Style de Trading' : 'Trading Style'}
          </Label>
          <Select
            value={profile.tradingStyle}
            onValueChange={(value) => setProfile(prev => ({ ...prev, tradingStyle: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {TRADING_STYLES.map(style => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            placeholder={language === 'fr' ? 'Parlez de vous...' : 'Tell us about yourself...'}
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Objectives */}
      <div className="glass-card p-6 space-y-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          {language === 'fr' ? 'Objectifs' : 'Objectives'}
        </h3>

        {/* Weekly Objective */}
        <div className="space-y-2">
          <Label htmlFor="weeklyObjective" className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {language === 'fr' ? 'Objectif Hebdomadaire' : 'Weekly Objective'}
          </Label>
          <Textarea
            id="weeklyObjective"
            value={profile.weeklyObjective}
            onChange={(e) => setProfile(prev => ({ ...prev, weeklyObjective: e.target.value }))}
            placeholder={language === 'fr' ? 'Ex: 5% de gains, max 3 trades/jour' : 'E.g. 5% gains, max 3 trades/day'}
            className="min-h-[60px]"
          />
        </div>

        {/* Monthly Objective */}
        <div className="space-y-2">
          <Label htmlFor="monthlyObjective" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            {language === 'fr' ? 'Objectif Mensuel' : 'Monthly Objective'}
          </Label>
          <Textarea
            id="monthlyObjective"
            value={profile.monthlyObjective}
            onChange={(e) => setProfile(prev => ({ ...prev, monthlyObjective: e.target.value }))}
            placeholder={language === 'fr' ? 'Ex: 20% de gains, winrate > 60%' : 'E.g. 20% gains, winrate > 60%'}
            className="min-h-[60px]"
          />
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full gap-2 bg-gradient-primary hover:opacity-90 font-display"
        size="lg"
      >
        <Save className="w-5 h-5" />
        {language === 'fr' ? 'Enregistrer les modifications' : 'Save Changes'}
      </Button>

      {/* Account Actions */}
      <div className="glass-card p-6 space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h3 className="font-display font-semibold text-foreground">
          {language === 'fr' ? 'Compte' : 'Account'}
        </h3>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          {t('logout')}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-loss/30 text-loss hover:bg-loss/10 hover:text-loss"
            >
              <Trash2 className="w-4 h-4" />
              {language === 'fr' ? 'Supprimer définitivement le compte' : 'Permanently delete account'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'fr' ? 'Êtes-vous sûr?' : 'Are you sure?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === 'fr' 
                  ? 'Cette action est irréversible. Toutes vos données seront supprimées définitivement.'
                  : 'This action cannot be undone. All your data will be permanently deleted.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-loss hover:bg-loss/90"
              >
                {language === 'fr' ? 'Supprimer' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Member Info */}
      <div className="text-center text-xs text-muted-foreground py-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <p>{language === 'fr' ? 'Membre depuis' : 'Member since'} {new Date(userStats.memberSince).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  );
};

export default Profile;
