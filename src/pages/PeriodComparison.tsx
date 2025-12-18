import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrades } from '@/hooks/useTrades';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  GitCompare,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PeriodStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winrate: number;
  pnl: number;
  avgProfit: number;
  avgLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  disciplineScore: number;
}

const PeriodComparison: React.FC = () => {
  const { language, t } = useLanguage();
  const { trades, isLoading } = useTrades();
  const { formatAmount } = useCurrency();
  const locale = language === 'fr' ? fr : enUS;

  // Period A: Current month by default
  const [periodADate, setPeriodADate] = useState<Date>(new Date());
  const [periodAOpen, setPeriodAOpen] = useState(false);

  // Period B: Previous month by default
  const [periodBDate, setPeriodBDate] = useState<Date>(subMonths(new Date(), 1));
  const [periodBOpen, setPeriodBOpen] = useState(false);

  const periodAStart = startOfMonth(periodADate);
  const periodAEnd = endOfMonth(periodADate);
  const periodBStart = startOfMonth(periodBDate);
  const periodBEnd = endOfMonth(periodBDate);

  // Calculate stats for a period
  const calculatePeriodStats = (periodStart: Date, periodEnd: Date): PeriodStats => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winrate: 0,
        pnl: 0,
        avgProfit: 0,
        avgLoss: 0,
        profitFactor: 0,
        bestTrade: 0,
        worstTrade: 0,
        disciplineScore: 0,
      };
    }

    const periodTrades = trades.filter(trade => {
      const tradeDate = parseISO(trade.trade_date);
      return isWithinInterval(tradeDate, { start: periodStart, end: periodEnd });
    });

    if (periodTrades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winrate: 0,
        pnl: 0,
        avgProfit: 0,
        avgLoss: 0,
        profitFactor: 0,
        bestTrade: 0,
        worstTrade: 0,
        disciplineScore: 0,
      };
    }

    const winningTrades = periodTrades.filter(t => t.result === 'win');
    const losingTrades = periodTrades.filter(t => t.result === 'loss');
    const winrate = periodTrades.length > 0 
      ? Math.round((winningTrades.length / periodTrades.length) * 100) 
      : 0;
    const pnl = periodTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

    const totalProfit = winningTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0));

    const avgProfit = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    const allPnL = periodTrades.map(t => t.profit_loss || 0);
    const bestTrade = allPnL.length > 0 ? Math.max(...allPnL) : 0;
    const worstTrade = allPnL.length > 0 ? Math.min(...allPnL) : 0;

    const tradesWithSL = periodTrades.filter(t => t.stop_loss).length;
    const tradesWithTP = periodTrades.filter(t => t.take_profit).length;
    const disciplineScore = periodTrades.length > 0
      ? Math.round(((tradesWithSL + tradesWithTP) / (periodTrades.length * 2)) * 100)
      : 0;

    return {
      totalTrades: periodTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winrate,
      pnl: Math.round(pnl * 100) / 100,
      avgProfit: Math.round(avgProfit * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: profitFactor === Infinity ? 999 : Math.round(profitFactor * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      disciplineScore,
    };
  };

  const statsA = useMemo(() => calculatePeriodStats(periodAStart, periodAEnd), [trades, periodAStart, periodAEnd]);
  const statsB = useMemo(() => calculatePeriodStats(periodBStart, periodBEnd), [trades, periodBStart, periodBEnd]);

  // Calculate difference percentage
  const getDiff = (a: number, b: number, higherIsBetter: boolean = true) => {
    if (b === 0) return a > 0 ? 100 : 0;
    const diff = ((a - b) / Math.abs(b)) * 100;
    const rounded = Math.round(diff);
    return higherIsBetter ? rounded : -rounded;
  };

  // Comparison bar chart data
  const comparisonData = useMemo(() => [
    {
      metric: language === 'fr' ? 'Trades' : 'Trades',
      [format(periodADate, 'MMM yyyy', { locale })]: statsA.totalTrades,
      [format(periodBDate, 'MMM yyyy', { locale })]: statsB.totalTrades,
    },
    {
      metric: language === 'fr' ? 'Winrate %' : 'Winrate %',
      [format(periodADate, 'MMM yyyy', { locale })]: statsA.winrate,
      [format(periodBDate, 'MMM yyyy', { locale })]: statsB.winrate,
    },
    {
      metric: language === 'fr' ? 'Discipline %' : 'Discipline %',
      [format(periodADate, 'MMM yyyy', { locale })]: statsA.disciplineScore,
      [format(periodBDate, 'MMM yyyy', { locale })]: statsB.disciplineScore,
    },
  ], [statsA, statsB, periodADate, periodBDate, locale, language]);

  // Radar chart data
  const radarData = useMemo(() => {
    const maxTrades = Math.max(statsA.totalTrades, statsB.totalTrades, 1);
    const maxProfitFactor = Math.max(statsA.profitFactor, statsB.profitFactor, 1);
    
    return [
      { 
        metric: 'Winrate', 
        A: statsA.winrate, 
        B: statsB.winrate,
        fullMark: 100 
      },
      { 
        metric: language === 'fr' ? 'Volume' : 'Volume', 
        A: (statsA.totalTrades / maxTrades) * 100, 
        B: (statsB.totalTrades / maxTrades) * 100,
        fullMark: 100 
      },
      { 
        metric: 'Discipline', 
        A: statsA.disciplineScore, 
        B: statsB.disciplineScore,
        fullMark: 100 
      },
      { 
        metric: language === 'fr' ? 'Profit Factor' : 'Profit Factor', 
        A: Math.min((statsA.profitFactor / maxProfitFactor) * 100, 100), 
        B: Math.min((statsB.profitFactor / maxProfitFactor) * 100, 100),
        fullMark: 100 
      },
    ];
  }, [statsA, statsB, language]);

  const periodAKey = format(periodADate, 'MMM yyyy', { locale });
  const periodBKey = format(periodBDate, 'MMM yyyy', { locale });

  // Navigate periods
  const navigatePeriod = (period: 'A' | 'B', direction: 'prev' | 'next') => {
    const setter = period === 'A' ? setPeriodADate : setPeriodBDate;
    setter(prev => direction === 'next' ? subMonths(prev, -1) : subMonths(prev, 1));
  };

  // Stat comparison card component
  const StatComparisonCard = ({ 
    label, 
    valueA, 
    valueB, 
    formatValue = (v: number) => v.toString(),
    higherIsBetter = true,
    icon: Icon 
  }: { 
    label: string; 
    valueA: number; 
    valueB: number; 
    formatValue?: (v: number) => string;
    higherIsBetter?: boolean;
    icon: React.ElementType;
  }) => {
    const diff = getDiff(valueA, valueB, higherIsBetter);
    const isImproved = diff > 0;
    const isDeclined = diff < 0;

    return (
      <div className="glass-card p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{periodAKey}</p>
            <p className="font-display text-xl font-bold text-foreground">{formatValue(valueA)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{periodBKey}</p>
            <p className="font-display text-xl font-bold text-foreground">{formatValue(valueB)}</p>
          </div>
        </div>
        <div className={cn(
          "mt-3 pt-3 border-t border-border flex items-center gap-2",
          isImproved && "text-profit",
          isDeclined && "text-loss",
          !isImproved && !isDeclined && "text-muted-foreground"
        )}>
          {isImproved ? <ArrowUp className="w-4 h-4" /> : isDeclined ? <ArrowDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isImproved ? '+' : ''}{diff}% {language === 'fr' ? 'vs période précédente' : 'vs previous period'}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasNoData = !trades || trades.length === 0;

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t('periodComparison')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t('comparePeriods')}
          </p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <GitCompare className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Period Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Period A Selector */}
        <div className="glass-card p-4 animate-fade-in">
          <p className="text-sm font-medium text-foreground mb-3">
            {language === 'fr' ? 'Période A (actuelle)' : 'Period A (current)'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('A', 'prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Popover open={periodAOpen} onOpenChange={setPeriodAOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 gap-2 font-display">
                  <CalendarIcon className="w-4 h-4" />
                  {format(periodADate, 'MMMM yyyy', { locale })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="center">
                <Calendar
                  mode="single"
                  selected={periodADate}
                  onSelect={(date) => {
                    if (date) {
                      setPeriodADate(date);
                      setPeriodAOpen(false);
                    }
                  }}
                  locale={locale}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('A', 'next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Period B Selector */}
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <p className="text-sm font-medium text-foreground mb-3">
            {language === 'fr' ? 'Période B (comparaison)' : 'Period B (comparison)'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('B', 'prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Popover open={periodBOpen} onOpenChange={setPeriodBOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 gap-2 font-display">
                  <CalendarIcon className="w-4 h-4" />
                  {format(periodBDate, 'MMMM yyyy', { locale })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="center">
                <Calendar
                  mode="single"
                  selected={periodBDate}
                  onSelect={(date) => {
                    if (date) {
                      setPeriodBDate(date);
                      setPeriodBOpen(false);
                    }
                  }}
                  locale={locale}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" onClick={() => navigatePeriod('B', 'next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {hasNoData ? (
        <div className="glass-card p-12 text-center animate-fade-in">
          <GitCompare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            {t('noData')}
          </h3>
          <p className="text-muted-foreground">
            {t('addTradesToSeeReports')}
          </p>
        </div>
      ) : (
        <>
          {/* Key Metrics Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatComparisonCard
              label={t('totalTrades')}
              valueA={statsA.totalTrades}
              valueB={statsB.totalTrades}
              icon={Award}
            />
            <StatComparisonCard
              label={t('winrate')}
              valueA={statsA.winrate}
              valueB={statsB.winrate}
              formatValue={(v) => `${v}%`}
              icon={Target}
            />
            <StatComparisonCard
              label="PnL"
              valueA={statsA.pnl}
              valueB={statsB.pnl}
              formatValue={(v) => formatAmount(v, true)}
              icon={statsA.pnl >= statsB.pnl ? TrendingUp : TrendingDown}
            />
            <StatComparisonCard
              label={t('avgProfit')}
              valueA={statsA.avgProfit}
              valueB={statsB.avgProfit}
              formatValue={(v) => formatAmount(v, true)}
              icon={TrendingUp}
            />
            <StatComparisonCard
              label={t('avgLoss')}
              valueA={statsA.avgLoss}
              valueB={statsB.avgLoss}
              formatValue={(v) => formatAmount(v)}
              higherIsBetter={false}
              icon={TrendingDown}
            />
            <StatComparisonCard
              label={t('discipline')}
              valueA={statsA.disciplineScore}
              valueB={statsB.disciplineScore}
              formatValue={(v) => `${v}/100`}
              icon={Target}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart Comparison */}
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h3 className="font-display font-semibold text-foreground mb-4">
                {language === 'fr' ? 'Comparaison des Métriques' : 'Metrics Comparison'}
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="metric" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey={periodAKey} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey={periodBKey} fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <h3 className="font-display font-semibold text-foreground mb-4">
                {language === 'fr' ? 'Profil de Performance' : 'Performance Profile'}
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <Radar name={periodAKey} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Radar name={periodBKey} dataKey="B" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.2} />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${Math.round(value)}%`, '']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="font-display font-semibold text-foreground mb-4">
              {language === 'fr' ? 'Résumé de la Comparaison' : 'Comparison Summary'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{periodAKey}</p>
                <div className="space-y-2">
                  <p className="text-foreground">
                    <span className="text-profit font-medium">{statsA.winningTrades}</span> {language === 'fr' ? 'gains' : 'wins'} / 
                    <span className="text-loss font-medium ml-1">{statsA.losingTrades}</span> {language === 'fr' ? 'pertes' : 'losses'}
                  </p>
                  <p className={cn("text-2xl font-display font-bold", statsA.pnl >= 0 ? "text-profit" : "text-loss")}>
                    {formatAmount(statsA.pnl, true)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{periodBKey}</p>
                <div className="space-y-2">
                  <p className="text-foreground">
                    <span className="text-profit font-medium">{statsB.winningTrades}</span> {language === 'fr' ? 'gains' : 'wins'} / 
                    <span className="text-loss font-medium ml-1">{statsB.losingTrades}</span> {language === 'fr' ? 'pertes' : 'losses'}
                  </p>
                  <p className={cn("text-2xl font-display font-bold", statsB.pnl >= 0 ? "text-profit" : "text-loss")}>
                    {formatAmount(statsB.pnl, true)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PeriodComparison;
