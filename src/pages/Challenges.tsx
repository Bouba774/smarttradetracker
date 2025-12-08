import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges, USER_LEVELS } from '@/hooks/useChallenges';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Target,
  Flame,
  Star,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  Shield,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

const iconMap: { [key: string]: React.ElementType } = {
  Trophy,
  Target,
  Flame,
  Star,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  Shield,
};

const Challenges: React.FC = () => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const {
    challenges,
    isLoading,
    currentLevel,
    nextLevel,
    progressToNextLevel,
    totalPoints,
    syncAllChallenges
  } = useChallenges();

  const [showCongrats, setShowCongrats] = useState(false);
  const [completedChallenge, setCompletedChallenge] = useState<typeof challenges[0] | null>(null);
  const [syncedChallenges, setSyncedChallenges] = useState<Set<string>>(new Set());

  // Sync challenges on mount and when trades change
  useEffect(() => {
    if (!isLoading && challenges.length > 0) {
      syncAllChallenges();
    }
  }, [challenges.length, isLoading]);

  // Check for newly completed challenges
  useEffect(() => {
    const newlyCompleted = challenges.find(c => 
      c.isNewlyCompleted && !syncedChallenges.has(c.id)
    );
    
    if (newlyCompleted) {
      setCompletedChallenge(newlyCompleted);
      setShowCongrats(true);
      setSyncedChallenges(prev => new Set([...prev, newlyCompleted.id]));
    }
  }, [challenges, syncedChallenges]);

  const completedCount = challenges.filter(c => c.completed).length;

  const difficultyColors = {
    easy: 'bg-profit/20 text-profit border-profit/30',
    medium: 'bg-primary/20 text-primary border-primary/30',
    hard: 'bg-loss/20 text-loss border-loss/30',
    expert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  const difficultyLabels = {
    easy: { fr: 'Facile', en: 'Easy' },
    medium: { fr: 'Moyen', en: 'Medium' },
    hard: { fr: 'Difficile', en: 'Hard' },
    expert: { fr: 'Expert', en: 'Expert' },
  };

  if (isLoading) {
    return (
      <div className="py-4 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary">
          {language === 'fr' ? 'Chargement...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Congratulations Popup */}
      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="bg-background border-border text-center max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-neon">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-display text-center">
              🎉 {language === 'fr' ? 'Bravo!' : 'Congratulations!'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-lg text-foreground mb-2">
              {language === 'fr' ? 'Vous avez complété' : 'You have completed'}:
            </p>
            <p className="text-xl font-display font-bold text-primary mb-4">
              {completedChallenge && (language === 'fr' ? completedChallenge.title : completedChallenge.titleEn)}
            </p>
            <p className="text-muted-foreground">
              {completedChallenge?.reward}
            </p>
            <p className="text-profit font-bold mt-2">
              +{completedChallenge?.points} points!
            </p>
          </div>
          <Button
            onClick={() => setShowCongrats(false)}
            className="w-full bg-gradient-primary hover:opacity-90 font-display"
          >
            {language === 'fr' ? 'Continuer!' : 'Continue!'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Défis' : 'Challenges'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? 'Relevez des défis et montez en niveau' : 'Take on challenges and level up'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <Trophy className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* User Level Card */}
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Level Badge */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center shadow-neon animate-pulse-neon">
              <span className="text-4xl">{currentLevel.badge}</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              Niv. {currentLevel.level}
            </div>
          </div>

          {/* Level Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {language === 'fr' ? currentLevel.title : currentLevel.titleEn}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {totalPoints} points • {completedCount} {language === 'fr' ? 'défis complétés' : 'challenges completed'}
            </p>
            
            {nextLevel && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{language === 'fr' ? currentLevel.title : currentLevel.titleEn}</span>
                  <span>{language === 'fr' ? nextLevel.title : nextLevel.titleEn}</span>
                </div>
                <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {nextLevel.minPoints - totalPoints} {language === 'fr' ? 'points restants' : 'points remaining'}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-2xl font-bold text-profit">{completedCount}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'fr' ? 'Complétés' : 'Completed'}
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary">
                {challenges.length - completedCount}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'fr' ? 'En cours' : 'In Progress'}
              </p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">{challenges.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges by Difficulty */}
      {(['easy', 'medium', 'hard', 'expert'] as const).map((difficulty, sectionIndex) => {
        const sectionChallenges = challenges.filter(c => c.difficulty === difficulty);
        if (sectionChallenges.length === 0) return null;

        return (
          <div key={difficulty} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                difficultyColors[difficulty]
              )}>
                {difficultyLabels[difficulty][language]}
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sectionChallenges.map((challenge, index) => {
                const Icon = iconMap[challenge.icon] || Target;
                const progressPercent = (challenge.progress / challenge.target) * 100;

                return (
                  <div
                    key={challenge.id}
                    className={cn(
                      "glass-card-hover p-5 relative overflow-hidden animate-fade-in",
                      challenge.completed && "border-profit/30"
                    )}
                    style={{ animationDelay: `${(sectionIndex * 100) + (index * 50)}ms` }}
                  >
                    {/* Completed overlay */}
                    {challenge.completed && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="w-6 h-6 text-profit animate-scale-in" />
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                        challenge.completed ? "bg-profit/20" : "bg-primary/20"
                      )}>
                        <Icon className={cn(
                          "w-6 h-6",
                          challenge.completed ? "text-profit" : "text-primary"
                        )} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Info */}
                        <h3 className="font-display font-semibold text-foreground mb-1">
                          {language === 'fr' ? challenge.title : challenge.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {language === 'fr' ? challenge.description : challenge.descriptionEn}
                        </p>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {language === 'fr' ? 'Progression' : 'Progress'}
                            </span>
                            <span className={cn(
                              "font-medium",
                              challenge.completed ? "text-profit" : "text-primary"
                            )}>
                              {challenge.progress}/{challenge.target}
                            </span>
                          </div>
                          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                                challenge.completed ? "bg-profit" : "bg-gradient-primary"
                              )}
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Reward */}
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {language === 'fr' ? 'Récompense' : 'Reward'}: 
                            <span className="text-foreground ml-1">{challenge.reward}</span>
                          </p>
                          <span className="text-xs font-bold text-profit">
                            +{challenge.points} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Level Roadmap */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <h3 className="font-display font-semibold text-foreground mb-6">
          {language === 'fr' ? 'Progression des Niveaux' : 'Level Progression'}
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin">
          {USER_LEVELS.map((level, index) => {
            const isCurrentLevel = level.level === currentLevel.level;
            const isUnlocked = totalPoints >= level.minPoints;

            return (
              <React.Fragment key={level.level}>
                <div className={cn(
                  "flex flex-col items-center min-w-[80px] p-3 rounded-lg transition-all",
                  isCurrentLevel && "bg-primary/20 border border-primary/50 shadow-neon",
                  !isCurrentLevel && isUnlocked && "bg-secondary/30",
                  !isUnlocked && "opacity-50"
                )}>
                  <span className="text-2xl mb-1">{level.badge}</span>
                  <span className={cn(
                    "text-xs font-medium text-center",
                    isCurrentLevel ? "text-primary" : isUnlocked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {language === 'fr' ? level.title : level.titleEn}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {level.minPoints}pts
                  </span>
                  {!isUnlocked && (
                    <Lock className="w-3 h-3 text-muted-foreground mt-1" />
                  )}
                </div>
                {index < USER_LEVELS.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 shrink-0",
                    isUnlocked ? "bg-primary" : "bg-border"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
