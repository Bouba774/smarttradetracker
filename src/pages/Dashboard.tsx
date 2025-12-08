import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges } from '@/hooks/useChallenges';
import { useTrades } from '@/hooks/useTrades';
import StatCard from '@/components/ui/StatCard';
import GaugeChart from '@/components/ui/GaugeChart';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  Clock,
  Percent,
  Scale,
  Calendar,
  ArrowUpDown,
  FileX,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { currentLevel } = useChallenges();
  const { trades, stats, isLoading } = useTrades();

  // User profile from auth
  const userNickname = profile?.nickname || 'Trader';
  const userLevel = profile?.level || 1;
  const levelTitle = language === 'fr' ? currentLevel.title : currentLevel.titleEn;

  // Calculate real statistics from trades
  const realStats = stats || {
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    breakeven: 0,
    totalProfit: 0,
    totalLoss: 0,
    winrate: 0,
  };

  // Calculate buy/sell positions
  const buyPositions = trades.filter(t => t.direction === 'long').length;
  const sellPositions = trades.filter(t => t.direction === 'short').length;

  // Calculate net profit
  const netProfit = realStats.totalProfit - realStats.totalLoss;
  const profitFactor = realStats.totalLoss > 0 ? realStats.totalProfit / realStats.totalLoss : realStats.totalProfit > 0 ? realStats.totalProfit : 0;

  // Calculate averages
  const avgProfit = realStats.winningTrades > 0 ? realStats.totalProfit / realStats.winningTrades : 0;
  const avgLoss = realStats.losingTrades > 0 ? realStats.totalLoss / realStats.losingTrades : 0;

  // Calculate best and worst trade
  const bestTrade = trades.length > 0 
    ? Math.max(...trades.map(t => t.profit_loss || 0)) 
    : 0;
  const worstTrade = trades.length > 0 
    ? Math.min(...trades.map(t => t.profit_loss || 0)) 
    : 0;

  // Calculate R:R ratio
  const avgRR = avgLoss > 0 ? avgProfit / avgLoss : 0;

  // Calculate drawdown (simplified as max loss from peak)
  const drawdown = realStats.totalLoss;

  // Generate equity curve data from trades (with default empty chart data)
  const equityData = React.useMemo(() => {
    if (trades.length === 0) {
      return [
        { date: 'J1', value: 10000 },
        { date: 'J2', value: 10000 },
        { date: 'J3', value: 10000 },
      ];
    }
    
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );
    
    let runningTotal = 10000; // Starting capital
    return sortedTrades.slice(-10).map((trade, index) => {
      runningTotal += trade.profit_loss || 0;
      return {
        date: format(parseISO(trade.trade_date), 'dd/MM', { locale: fr }),
        value: runningTotal,
      };
    });
  }, [trades]);

  // Generate monthly data (with default empty data)
  const monthlyData = React.useMemo(() => {
    if (trades.length === 0) {
      return [
        { month: 'Jan', pnl: 0 },
        { month: 'Fév', pnl: 0 },
        { month: 'Mar', pnl: 0 },
      ];
    }
    const months: { [key: string]: number } = {};
    trades.forEach(trade => {
      const monthKey = format(parseISO(trade.trade_date), 'MMM', { locale: fr });
      months[monthKey] = (months[monthKey] || 0) + (trade.profit_loss || 0);
    });
    return Object.entries(months).map(([month, pnl]) => ({ month, pnl }));
  }, [trades]);

  // Position distribution data (always show, even with 0 values)
  const positionData = [
    { name: 'Long', value: buyPositions || 0.1, actualValue: buyPositions, color: 'hsl(var(--profit))' },
    { name: 'Short', value: sellPositions || 0.1, actualValue: sellPositions, color: 'hsl(var(--loss))' },
  ];

  // No data message component
  const NoDataMessage = () => (
    <div className="text-center py-4 px-2 bg-muted/30 rounded-lg border border-border/50 mb-4">
      <p className="text-sm text-muted-foreground">
        {language === 'fr' 
          ? "📊 Aucune donnée enregistrée pour le moment. Ajoutez vos premiers trades pour voir vos statistiques." 
          : "📊 No data recorded yet. Add your first trades to see your statistics."}
      </p>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 w-full max-w-full overflow-x-hidden">
      {/* Welcome Message */}
      <div className="glass-card p-4 sm:p-6 animate-fade-in bg-gradient-to-r from-primary/10 to-profit/10 border-primary/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-lg sm:text-2xl md:text-3xl font-bold text-foreground truncate">
              {t('welcome')} {userNickname} 👋
            </h1>
            <p className="text-primary font-display font-semibold mt-1 neon-text text-sm sm:text-base">
              {levelTitle} (Niveau {userLevel})
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 self-start sm:self-auto">
            <span className="text-xl sm:text-2xl">🏆</span>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Niveau actuel</p>
              <p className="font-display font-bold text-primary text-sm sm:text-base">{userLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Performance Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <StatCard
          title="Total Transactions"
          value={realStats.totalTrades}
          icon={Activity}
          delay={0}
        />
        <StatCard
          title="Trans. Rentables"
          value={realStats.winningTrades}
          icon={TrendingUp}
          variant="profit"
          delay={50}
        />
        <StatCard
          title="Trans. Perdantes"
          value={realStats.losingTrades}
          icon={TrendingDown}
          variant="loss"
          delay={100}
        />
        <StatCard
          title="Positions Long"
          value={buyPositions}
          icon={TrendingUp}
          variant="profit"
          delay={150}
        />
        <StatCard
          title="Positions Short"
          value={sellPositions}
          icon={TrendingDown}
          variant="loss"
          delay={200}
        />
        <StatCard
          title="Break-even"
          value={realStats.breakeven}
          icon={ArrowUpDown}
          variant="neutral"
          delay={250}
        />
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        <StatCard
          title="Bénéfice Brut"
          value={`$${realStats.totalProfit.toLocaleString()}`}
          icon={DollarSign}
          variant="profit"
          delay={300}
        />
        <StatCard
          title="Perte Brute"
          value={`$${realStats.totalLoss.toLocaleString()}`}
          icon={DollarSign}
          variant="loss"
          delay={350}
        />
        <StatCard
          title="Bénéfice Net"
          value={`$${netProfit.toLocaleString()}`}
          icon={DollarSign}
          variant={netProfit >= 0 ? 'profit' : 'loss'}
          delay={400}
        />
        <StatCard
          title="Facteur Profit"
          value={profitFactor.toFixed(2)}
          icon={Scale}
          variant={profitFactor > 1 ? 'profit' : 'loss'}
          delay={450}
        />
        <StatCard
          title={t('winrate')}
          value={`${realStats.winrate.toFixed(1)}%`}
          icon={Target}
          delay={500}
        />
        <StatCard
          title="Bénéfice Moyen"
          value={`$${avgProfit.toFixed(2)}`}
          icon={Percent}
          variant="profit"
          delay={550}
        />
      </div>

      {/* Average Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title="Perte Moyenne"
          value={`$${avgLoss.toFixed(2)}`}
          icon={Percent}
          variant="loss"
          delay={600}
        />
        <StatCard
          title="Meilleur Trade"
          value={`$${bestTrade.toLocaleString()}`}
          icon={TrendingUp}
          variant="profit"
          delay={650}
        />
        <StatCard
          title="Pire Trade"
          value={`$${worstTrade.toLocaleString()}`}
          icon={TrendingDown}
          variant="loss"
          delay={700}
        />
        <StatCard
          title="Ratio R:R Moyen"
          value={avgRR.toFixed(2)}
          icon={Scale}
          delay={750}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          title="Drawdown"
          value={`$${drawdown.toLocaleString()}`}
          icon={TrendingDown}
          variant="loss"
          delay={800}
        />
        <StatCard
          title="Total Gains"
          value={`$${realStats.totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          variant="profit"
          delay={850}
        />
        <StatCard
          title="Total Pertes"
          value={`$${realStats.totalLoss.toLocaleString()}`}
          icon={TrendingDown}
          variant="loss"
          delay={900}
        />
        <StatCard
          title="Nb Trades"
          value={realStats.totalTrades}
          icon={BarChart3}
          delay={950}
        />
      </div>

      {/* No data message */}
      {trades.length === 0 && <NoDataMessage />}

      {/* Charts Section - Always visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Equity Curve */}
        <div className="glass-card p-3 sm:p-6 animate-fade-in" style={{ animationDelay: '1000ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {t('equityCurve')}
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="glass-card p-3 sm:p-6 animate-fade-in" style={{ animationDelay: '1050ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Performance Mensuelle
          </h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((entry, index) => (
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
      </div>

      {/* Position Distribution - Always visible */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '1100ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-primary" />
            Distribution Positions
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={positionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {positionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string, props: any) => [props.payload.actualValue, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-profit" />
              <span className="text-sm text-muted-foreground">Long ({buyPositions})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-loss" />
              <span className="text-sm text-muted-foreground">Short ({sellPositions})</span>
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div className="lg:col-span-2 glass-card p-6 animate-fade-in" style={{ animationDelay: '1150ms' }}>
          <h3 className="font-display font-semibold text-foreground mb-6">
            Indicateurs de Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            <GaugeChart
              value={Math.min(100, realStats.winrate)}
              label={t('winrate')}
              variant={realStats.winrate >= 60 ? 'profit' : realStats.winrate >= 40 ? 'primary' : 'loss'}
            />
            <GaugeChart
              value={Math.min(100, profitFactor * 25)}
              label="Profit Factor"
              variant={profitFactor >= 1.5 ? 'profit' : profitFactor >= 1 ? 'primary' : 'loss'}
            />
            <GaugeChart
              value={realStats.totalTrades > 0 ? Math.min(100, (realStats.winningTrades / realStats.totalTrades) * 100) : 0}
              label="Taux Succès"
              variant="primary"
            />
            <GaugeChart
              value={Math.min(100, avgRR > 1 ? avgRR * 30 : avgRR * 20)}
              label="R:R Moyen"
              variant={avgRR >= 1.5 ? 'profit' : avgRR >= 1 ? 'primary' : 'loss'}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          Créé par un trader pour les traders. <span className="text-primary font-semibold">ALPHA FX</span>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
