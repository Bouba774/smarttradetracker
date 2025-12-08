import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  FileText,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Award,
  AlertTriangle,
} from 'lucide-react';

// Mock data - to be replaced with real data
const MOCK_WEEKLY_DATA = {
  winrate: 68,
  pnl: 1245.50,
  totalTrades: 23,
  winningTrades: 16,
  losingTrades: 7,
  bestSetup: 'Breakout',
  bestAsset: 'EUR/USD',
  dominantEmotion: 'Calme',
  bestDay: { day: 'Mardi', pnl: 450 },
  worstDay: { day: 'Vendredi', pnl: -120 },
  avgRR: 2.3,
  disciplineScore: 82,
};

const MOCK_DAILY_PNL = [
  { day: 'Lun', pnl: 320 },
  { day: 'Mar', pnl: 450 },
  { day: 'Mer', pnl: -85 },
  { day: 'Jeu', pnl: 280 },
  { day: 'Ven', pnl: -120 },
  { day: 'Sam', pnl: 200 },
  { day: 'Dim', pnl: 200.50 },
];

const MOCK_MONTHLY_DATA = [
  { month: 'Sep', pnl: 2340 },
  { month: 'Oct', pnl: -580 },
  { month: 'Nov', pnl: 1890 },
  { month: 'Déc', pnl: 1245 },
];

const MOCK_EMOTION_DATA = [
  { name: 'Calme', value: 45, color: 'hsl(var(--profit))' },
  { name: 'Confiant', value: 25, color: 'hsl(var(--primary))' },
  { name: 'Stressé', value: 20, color: 'hsl(var(--loss))' },
  { name: 'Impulsif', value: 10, color: 'hsl(30, 100%, 50%)' },
];

const MOCK_PSYCHOLOGICAL_EVOLUTION = [
  { month: 'Oct', discipline: 65, emotions: 55, quality: 60 },
  { month: 'Nov', discipline: 72, emotions: 68, quality: 70 },
  { month: 'Déc', discipline: 82, emotions: 75, quality: 78 },
];

type ViewMode = 'week' | 'month';

const Reports: React.FC = () => {
  const { language, t } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;
  
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const periodStart = viewMode === 'week' 
    ? startOfWeek(selectedDate, { weekStartsOn: 1 })
    : startOfMonth(selectedDate);
  const periodEnd = viewMode === 'week'
    ? endOfWeek(selectedDate, { weekStartsOn: 1 })
    : endOfMonth(selectedDate);

  const navigatePeriod = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setSelectedDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        return newDate;
      });
    } else {
      setSelectedDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const formatPeriod = () => {
    if (viewMode === 'week') {
      return `${format(periodStart, 'd MMM', { locale })} - ${format(periodEnd, 'd MMM yyyy', { locale })}`;
    }
    return format(selectedDate, 'MMMM yyyy', { locale });
  };

  const data = MOCK_WEEKLY_DATA;

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {language === 'fr' ? 'Rapports' : 'Reports'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'fr' ? 'Analyse de vos performances' : 'Performance analysis'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <FileText className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Period Selector */}
      <div className="glass-card p-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-lg bg-secondary/50">
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={cn(viewMode === 'week' && 'bg-primary text-primary-foreground')}
            >
              {language === 'fr' ? 'Semaine' : 'Week'}
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className={cn(viewMode === 'month' && 'bg-primary text-primary-foreground')}
            >
              {language === 'fr' ? 'Mois' : 'Month'}
            </Button>
          </div>

          {/* Period Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px] gap-2 font-display">
                  <CalendarIcon className="w-4 h-4" />
                  {formatPeriod()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  locale={locale}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={() => navigatePeriod('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Winrate</span>
          </div>
          <p className="font-display text-2xl font-bold text-profit">{data.winrate}%</p>
        </div>
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-profit" />
            <span className="text-xs text-muted-foreground">PnL</span>
          </div>
          <p className={cn(
            "font-display text-2xl font-bold",
            data.pnl >= 0 ? "text-profit" : "text-loss"
          )}>
            {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(2)}$
          </p>
        </div>
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Trades</span>
          </div>
          <p className="font-display text-2xl font-bold text-foreground">{data.totalTrades}</p>
          <p className="text-xs text-muted-foreground">
            <span className="text-profit">{data.winningTrades}W</span> / <span className="text-loss">{data.losingTrades}L</span>
          </p>
        </div>
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Discipline</span>
          </div>
          <p className="font-display text-2xl font-bold text-primary">{data.disciplineScore}/100</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily PnL */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-4">
            {language === 'fr' ? 'PnL Journalier' : 'Daily PnL'}
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_DAILY_PNL}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value}$`, 'PnL']}
                />
                <Bar 
                  dataKey="pnl" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-4">
            {language === 'fr' ? 'Répartition Émotionnelle' : 'Emotion Distribution'}
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_EMOTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {MOCK_EMOTION_DATA.map((entry, index) => (
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
            {MOCK_EMOTION_DATA.map((emotion) => (
              <div key={emotion.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotion.color }} />
                <span className="text-xs text-muted-foreground">{emotion.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best/Worst Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-profit" />
            <span className="text-sm font-medium text-foreground">
              {language === 'fr' ? 'Meilleur Jour' : 'Best Day'}
            </span>
          </div>
          <p className="font-display text-lg font-bold text-profit">{data.bestDay.day}</p>
          <p className="text-sm text-muted-foreground">+{data.bestDay.pnl}$</p>
        </div>
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-loss" />
            <span className="text-sm font-medium text-foreground">
              {language === 'fr' ? 'Pire Jour' : 'Worst Day'}
            </span>
          </div>
          <p className="font-display text-lg font-bold text-loss">{data.worstDay.day}</p>
          <p className="text-sm text-muted-foreground">{data.worstDay.pnl}$</p>
        </div>
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {language === 'fr' ? 'Meilleur Setup' : 'Best Setup'}
            </span>
          </div>
          <p className="font-display text-lg font-bold text-primary">{data.bestSetup}</p>
          <p className="text-sm text-muted-foreground">{data.bestAsset}</p>
        </div>
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '450ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {language === 'fr' ? 'Émotion Dominante' : 'Dominant Emotion'}
            </span>
          </div>
          <p className="font-display text-lg font-bold text-foreground">{data.dominantEmotion}</p>
          <p className="text-sm text-muted-foreground">R:R {data.avgRR}</p>
        </div>
      </div>

      {/* Monthly Performance (visible in month view) */}
      {viewMode === 'month' && (
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-4">
            {language === 'fr' ? 'Performance Mensuelle' : 'Monthly Performance'}
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value}$`, 'PnL']}
                />
                <Bar 
                  dataKey="pnl" 
                  radius={[4, 4, 0, 0]}
                >
                  {MOCK_MONTHLY_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Psychological Evolution (3 months) */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '550ms' }}>
        <h3 className="font-display font-semibold text-foreground mb-4">
          {language === 'fr' ? 'Évolution Psychologique (3 derniers mois)' : 'Psychological Evolution (Last 3 Months)'}
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_PSYCHOLOGICAL_EVOLUTION}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="discipline" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Discipline" />
              <Line type="monotone" dataKey="emotions" stroke="hsl(var(--profit))" strokeWidth={2} dot={{ fill: 'hsl(var(--profit))' }} name="Émotions" />
              <Line type="monotone" dataKey="quality" stroke="hsl(30, 100%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(30, 100%, 50%)' }} name="Qualité" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Discipline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-profit" />
            <span className="text-xs text-muted-foreground">Émotions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(30, 100%, 50%)' }} />
            <span className="text-xs text-muted-foreground">Qualité</span>
          </div>
        </div>
      </div>

      {/* Automatic Insights */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-foreground">
            {language === 'fr' ? 'Conseils Automatiques' : 'Automatic Insights'}
          </h3>
        </div>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-profit/10 border border-profit/30">
            <p className="text-sm text-profit">
              ✓ {language === 'fr' ? 'Tu performes mieux entre 9h et 11h. Concentre-toi sur cette période.' : 'You perform best between 9am and 11am. Focus on this period.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-primary">
              💡 {language === 'fr' ? 'Le setup "Breakout" est ton plus rentable cette semaine.' : 'The "Breakout" setup is your most profitable this week.'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-loss/10 border border-loss/30">
            <p className="text-sm text-loss">
              ⚠ {language === 'fr' ? 'Évite de trader quand tu es stressé. Tu perds 65% de ces trades.' : 'Avoid trading when stressed. You lose 65% of those trades.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
