import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import GaugeChart from '@/components/ui/GaugeChart';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  Zap,
} from 'lucide-react';

// Mock data - to be replaced with real data
const EMOTION_STATS = [
  { emotion: 'Calme', wins: 75, losses: 25, trades: 45 },
  { emotion: 'Confiant', wins: 68, losses: 32, trades: 28 },
  { emotion: 'Stressé', wins: 35, losses: 65, trades: 20 },
  { emotion: 'Impulsif', wins: 25, losses: 75, trades: 12 },
];

const EMOTION_DISTRIBUTION = [
  { name: 'Calme', value: 43, color: 'hsl(var(--profit))' },
  { name: 'Confiant', value: 27, color: 'hsl(var(--primary))' },
  { name: 'Stressé', value: 19, color: 'hsl(var(--loss))' },
  { name: 'Impulsif', value: 11, color: 'hsl(30, 100%, 50%)' },
];

const WEEKLY_EMOTIONS = [
  { day: 'Lun', calme: 80, stress: 20 },
  { day: 'Mar', calme: 70, stress: 30 },
  { day: 'Mer', calme: 40, stress: 60 },
  { day: 'Jeu', calme: 85, stress: 15 },
  { day: 'Ven', calme: 55, stress: 45 },
];

const DISCIPLINE_BREAKDOWN = {
  score: 78,
  factors: [
    { name: 'Respect du plan', score: 85, icon: Target },
    { name: 'Gestion du risque', score: 80, icon: Zap },
    { name: 'Pas d\'overtrading', score: 70, icon: AlertTriangle },
    { name: 'SL toujours en place', score: 90, icon: CheckCircle2 },
    { name: 'Pas de revenge trading', score: 65, icon: TrendingDown },
  ],
};

const MENTAL_SUMMARY = {
  positives: [
    'Excellente gestion du risque cette semaine',
    'Amélioration de la patience sur les entrées',
    'Meilleur respect du plan de trading',
  ],
  negatives: [
    'Tendance au revenge trading après une perte',
    'Stress élevé les mercredis (journée chargée?)',
    'Overtrading en fin de semaine',
  ],
};

const PsychologicalAnalysis: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Analyse Psychologique' : 'Psychological Analysis'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? 'Comprenez vos émotions et leur impact' : 'Understand your emotions and their impact'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <Brain className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Discipline Score */}
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <GaugeChart
              value={DISCIPLINE_BREAKDOWN.score}
              max={100}
              label={language === 'fr' ? 'Discipline' : 'Discipline'}
              size="lg"
              variant="primary"
            />
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-display font-semibold text-foreground mb-4">
              {language === 'fr' ? 'Facteurs de Discipline' : 'Discipline Factors'}
            </h3>
            <div className="space-y-4">
              {DISCIPLINE_BREAKDOWN.factors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div key={factor.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{factor.name}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        factor.score >= 80 ? "text-profit" :
                        factor.score >= 60 ? "text-primary" : "text-loss"
                      )}>
                        {factor.score}%
                      </span>
                    </div>
                    <Progress
                      value={factor.score}
                      className={cn(
                        "h-2",
                        factor.score >= 80 ? "[&>div]:bg-profit" :
                        factor.score >= 60 ? "[&>div]:bg-primary" : "[&>div]:bg-loss"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Winrate by Emotion */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-4">
            {language === 'fr' ? 'Winrate par Émotion' : 'Winrate by Emotion'}
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EMOTION_STATS} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="emotion" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
                <Bar dataKey="wins" fill="hsl(var(--profit))" name="Gains" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-4">
            {language === 'fr' ? 'Répartition des Émotions' : 'Emotion Distribution'}
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EMOTION_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {EMOTION_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {EMOTION_DISTRIBUTION.map((emotion) => (
              <div key={emotion.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotion.color }} />
                <span className="text-xs text-muted-foreground">{emotion.name} ({emotion.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Emotion Trend */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="font-display font-semibold text-foreground mb-4">
          {language === 'fr' ? 'Tendance Émotionnelle (Semaine)' : 'Emotional Trend (Week)'}
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={WEEKLY_EMOTIONS}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="calme"
                stroke="hsl(var(--profit))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--profit))' }}
                name={language === 'fr' ? 'Calme' : 'Calm'}
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="hsl(var(--loss))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--loss))' }}
                name="Stress"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-profit" />
            <span className="text-xs text-muted-foreground">{language === 'fr' ? 'Calme' : 'Calm'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-loss" />
            <span className="text-xs text-muted-foreground">Stress</span>
          </div>
        </div>
      </div>

      {/* Emotion Performance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {EMOTION_STATS.map((stat, index) => (
          <div
            key={stat.emotion}
            className="glass-card p-4 animate-fade-in"
            style={{ animationDelay: `${250 + index * 50}ms` }}
          >
            <p className="text-sm text-muted-foreground mb-2">{stat.emotion}</p>
            <p className={cn(
              "font-display text-2xl font-bold",
              stat.wins >= 60 ? "text-profit" : stat.wins >= 40 ? "text-primary" : "text-loss"
            )}>
              {stat.wins}%
            </p>
            <p className="text-xs text-muted-foreground">{stat.trades} trades</p>
          </div>
        ))}
      </div>

      {/* Mental Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positives */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-profit/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-profit" />
            </div>
            <h3 className="font-display font-semibold text-foreground">
              {language === 'fr' ? 'Points Forts' : 'Strengths'}
            </h3>
          </div>
          <div className="space-y-3">
            {MENTAL_SUMMARY.positives.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg bg-profit/10 border border-profit/30"
              >
                <CheckCircle2 className="w-4 h-4 text-profit mt-0.5" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Negatives */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '450ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-loss/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-loss" />
            </div>
            <h3 className="font-display font-semibold text-foreground">
              {language === 'fr' ? 'Points à Améliorer' : 'Areas to Improve'}
            </h3>
          </div>
          <div className="space-y-3">
            {MENTAL_SUMMARY.negatives.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg bg-loss/10 border border-loss/30"
              >
                <AlertTriangle className="w-4 h-4 text-loss mt-0.5" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-generated Feedback */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-foreground">
            {language === 'fr' ? 'Feedback Automatique' : 'Automatic Feedback'}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-foreground">
              🧠 {language === 'fr'
                ? 'Tu performes nettement mieux quand tu es calme (+75% winrate). Prends 5 minutes de respiration avant chaque session.'
                : 'You perform significantly better when calm (+75% winrate). Take 5 minutes to breathe before each session.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-loss/10 border border-loss/30">
            <p className="text-sm text-foreground">
              ⚠️ {language === 'fr'
                ? 'Le revenge trading te coûte en moyenne 3.2% par semaine. Après une perte, fais une pause de 30 minutes.'
                : 'Revenge trading costs you an average of 3.2% per week. After a loss, take a 30-minute break.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-profit/10 border border-profit/30">
            <p className="text-sm text-foreground">
              ✓ {language === 'fr'
                ? 'Ta discipline s\'améliore (+8% ce mois). Continue sur cette lancée!'
                : 'Your discipline is improving (+8% this month). Keep up the momentum!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologicalAnalysis;
