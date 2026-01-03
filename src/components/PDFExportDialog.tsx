import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useFeedback } from '@/hooks/useFeedback';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, CalendarIcon, Download, Filter, EyeOff, Eye, Settings2, BarChart3, Table, User, TrendingUp, Clock, Target } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths, isWithinInterval } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { calculateStats } from '@/lib/pdfExport/statistics';

interface Trade {
  id: string;
  trade_date: string;
  asset: string;
  direction: string;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  lot_size: number;
  profit_loss: number | null;
  result: string | null;
  setup: string | null;
  emotions: string | null;
  notes?: string | null;
}

interface ProfileData {
  nickname: string;
  level: number | null;
  total_points: number | null;
}

export interface PDFExportOptions {
  confidentialMode: boolean;
  sections: PDFSections;
}

export interface PDFSections {
  header: boolean;
  profile: boolean;
  statistics: boolean;
  additionalStats: boolean;
  performanceChart: boolean;
  tradeHistory: boolean;
}

interface PDFExportDialogProps {
  trades: Trade[];
  profile: ProfileData | null;
  onExport: (trades: Trade[], profile: ProfileData | null, periodLabel: string, options: PDFExportOptions) => Promise<void>;
  isExporting?: boolean;
  compact?: boolean;
}

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'last7days' | 'last30days' | 'custom';

export const PDFExportDialog: React.FC<PDFExportDialogProps> = ({
  trades,
  profile,
  onExport,
  isExporting = false,
  compact = false,
}) => {
  const { language } = useLanguage();
  const { triggerFeedback } = useFeedback();
  const { getCurrencySymbol, convertFromBase, decimals } = useCurrency();
  const locale = language === 'fr' ? fr : enUS;
  
  const [open, setOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const [confidentialMode, setConfidentialMode] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  // Sections toggles
  const [sections, setSections] = useState<PDFSections>({
    header: true,
    profile: true,
    statistics: true,
    additionalStats: true,
    performanceChart: true,
    tradeHistory: true,
  });

  const toggleSection = (key: keyof PDFSections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredTrades = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate: Date;
    let endDate: Date = today;

    switch (periodFilter) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        endDate = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'last7days':
        startDate = subDays(today, 7);
        break;
      case 'last30days':
        startDate = subDays(today, 30);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          return trades;
        }
        break;
      default:
        return trades;
    }

    return trades.filter(trade => {
      const tradeDate = new Date(trade.trade_date);
      return isWithinInterval(tradeDate, { start: startDate, end: endDate });
    });
  }, [trades, periodFilter, customStartDate, customEndDate]);

  const stats = useMemo(() => calculateStats(filteredTrades), [filteredTrades]);

  const getPeriodLabel = (): string => {
    const today = new Date();
    
    switch (periodFilter) {
      case 'today':
        return format(today, 'dd MMMM yyyy', { locale });
      case 'week':
        return `${format(startOfWeek(today, { weekStartsOn: 1 }), 'dd MMM', { locale })} - ${format(endOfWeek(today, { weekStartsOn: 1 }), 'dd MMM yyyy', { locale })}`;
      case 'month':
        return format(today, 'MMMM yyyy', { locale });
      case 'last7days':
        return language === 'fr' ? 'Derniers 7 jours' : 'Last 7 days';
      case 'last30days':
        return language === 'fr' ? 'Derniers 30 jours' : 'Last 30 days';
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, 'dd MMM yyyy', { locale })} - ${format(customEndDate, 'dd MMM yyyy', { locale })}`;
        }
        return language === 'fr' ? 'Toutes les données' : 'All data';
      default:
        return language === 'fr' ? 'Toutes les données' : 'All data';
    }
  };

  const handleExport = async () => {
    triggerFeedback('click');
    await onExport(filteredTrades, profile, getPeriodLabel(), { confidentialMode, sections });
    setOpen(false);
  };

  const periodOptions = [
    { value: 'all', label: language === 'fr' ? 'Toutes les données' : 'All data' },
    { value: 'today', label: language === 'fr' ? "Aujourd'hui" : 'Today' },
    { value: 'week', label: language === 'fr' ? 'Cette semaine' : 'This week' },
    { value: 'month', label: language === 'fr' ? 'Ce mois' : 'This month' },
    { value: 'last7days', label: language === 'fr' ? 'Derniers 7 jours' : 'Last 7 days' },
    { value: 'last30days', label: language === 'fr' ? 'Derniers 30 jours' : 'Last 30 days' },
    { value: 'custom', label: language === 'fr' ? 'Période personnalisée' : 'Custom period' },
  ];

  const sectionItems = [
    { key: 'header' as const, icon: FileText, label: language === 'fr' ? 'En-tête & Logo' : 'Header & Logo' },
    { key: 'profile' as const, icon: User, label: language === 'fr' ? 'Infos Profil' : 'Profile Info' },
    { key: 'statistics' as const, icon: BarChart3, label: language === 'fr' ? 'Statistiques principales' : 'Main Statistics' },
    { key: 'additionalStats' as const, icon: Target, label: language === 'fr' ? 'Stats additionnelles' : 'Additional Stats' },
    { key: 'performanceChart' as const, icon: TrendingUp, label: language === 'fr' ? 'Graphique performance' : 'Performance Chart' },
    { key: 'tradeHistory' as const, icon: Table, label: language === 'fr' ? 'Historique trades' : 'Trade History' },
  ];

  const formatAmount = (value: number) => {
    if (confidentialMode) return '****';
    const converted = convertFromBase(value);
    return `${getCurrencySymbol()}${converted.toFixed(decimals)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            compact ? "flex-1 justify-center gap-2 h-10" : "w-full justify-start gap-3 h-12"
          )}
          disabled={isExporting}
        >
          <FileText className={cn(compact ? "w-4 h-4" : "w-5 h-5", "text-loss")} />
          {compact ? 'PDF' : (language === 'fr' ? 'Exporter en PDF' : 'Export to PDF')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {language === 'fr' ? 'Export PDF' : 'PDF Export'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[60vh]">
          {/* Left: Options */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {/* Period Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {language === 'fr' ? 'Période' : 'Period'}
                </Label>
                <Select value={periodFilter} onValueChange={(val) => setPeriodFilter(val as PeriodFilter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {periodFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{language === 'fr' ? 'Date de début' : 'Start date'}</Label>
                    <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !customStartDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customStartDate ? format(customStartDate, 'dd/MM/yyyy') : language === 'fr' ? 'Choisir' : 'Select'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={(date) => {
                            setCustomStartDate(date);
                            setStartCalendarOpen(false);
                          }}
                          initialFocus
                          locale={locale}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'fr' ? 'Date de fin' : 'End date'}</Label>
                    <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !customEndDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customEndDate ? format(customEndDate, 'dd/MM/yyyy') : language === 'fr' ? 'Choisir' : 'Select'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={(date) => {
                            setCustomEndDate(date);
                            setEndCalendarOpen(false);
                          }}
                          initialFocus
                          locale={locale}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <Separator />

              {/* Sections Toggle */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  {language === 'fr' ? 'Sections à inclure' : 'Sections to include'}
                </Label>
                <div className="space-y-2">
                  {sectionItems.map((item) => (
                    <div
                      key={item.key}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                        sections[item.key] ? "bg-primary/10" : "bg-muted/50 opacity-60"
                      )}
                      onClick={() => toggleSection(item.key)}
                    >
                      <Checkbox
                        checked={sections[item.key]}
                        onCheckedChange={() => toggleSection(item.key)}
                      />
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Confidential Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {language === 'fr' ? 'Mode confidentiel' : 'Confidential mode'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'fr' ? 'Masquer les montants (****)' : 'Hide amounts (****)'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={confidentialMode}
                  onCheckedChange={setConfidentialMode}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Right: Visual Preview */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {language === 'fr' ? 'Aperçu' : 'Preview'}
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs"
              >
                {showPreview ? (language === 'fr' ? 'Masquer' : 'Hide') : (language === 'fr' ? 'Afficher' : 'Show')}
              </Button>
            </div>

            {showPreview && (
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-lg border overflow-hidden shadow-inner">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-2 text-[10px] scale-[0.85] origin-top-left w-[118%]">
                    {/* Mini PDF Preview */}
                    {sections.header && (
                      <div className="bg-slate-900 text-white p-2 rounded-t flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-[8px] font-bold">
                            STT
                          </div>
                          <div>
                            <p className="font-bold text-[10px]">Smart Trade Tracker</p>
                            <p className="text-[8px] text-slate-400">
                              {language === 'fr' ? 'Rapport de Performance' : 'Performance Report'}
                            </p>
                          </div>
                        </div>
                        {confidentialMode && (
                          <span className="bg-yellow-500 text-black text-[6px] px-1 py-0.5 rounded font-bold">
                            {language === 'fr' ? 'CONFIDENTIEL' : 'CONFIDENTIAL'}
                          </span>
                        )}
                      </div>
                    )}

                    {sections.profile && profile && (
                      <div className="text-right text-[8px] text-muted-foreground">
                        Level {profile.level || 1} • {profile.total_points || 0} pts
                      </div>
                    )}

                    <div className="bg-muted/30 rounded px-2 py-1 text-[8px]">
                      <span className="text-muted-foreground">{language === 'fr' ? 'Période:' : 'Period:'}</span>{' '}
                      <span className="font-medium">{getPeriodLabel()}</span>
                    </div>

                    {sections.statistics && (
                      <div className="space-y-1">
                        <p className="font-bold text-[9px]">{language === 'fr' ? 'Statistiques' : 'Statistics'}</p>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { label: 'Trades', value: stats.totalTrades },
                            { label: 'Winrate', value: `${stats.winrate}%`, win: stats.winrate >= 50 },
                            { label: 'PF', value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2), win: stats.profitFactor >= 1 },
                            { label: 'PnL', value: formatAmount(stats.totalPnL), win: stats.totalPnL >= 0 },
                            { label: language === 'fr' ? 'Meilleur' : 'Best', value: formatAmount(stats.bestTrade), win: true },
                            { label: language === 'fr' ? 'Pire' : 'Worst', value: formatAmount(stats.worstTrade), win: false },
                          ].map((stat, i) => (
                            <div key={i} className="bg-muted/50 rounded p-1">
                              <p className="text-[7px] text-muted-foreground">{stat.label}</p>
                              <p className={cn(
                                "text-[9px] font-bold",
                                typeof stat.win === 'boolean' ? (stat.win ? "text-profit" : "text-loss") : ""
                              )}>
                                {stat.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sections.additionalStats && (
                      <div className="flex gap-2 text-[7px] text-muted-foreground">
                        <span>Avg Lot: {confidentialMode ? '****' : stats.avgLotSize.toFixed(2)}</span>
                        <span>•</span>
                        <span>Wins: {stats.winningTrades}</span>
                        <span>•</span>
                        <span>Losses: {stats.losingTrades}</span>
                      </div>
                    )}

                    {sections.performanceChart && (
                      <div className="bg-muted/30 rounded p-2">
                        <p className="text-[8px] text-muted-foreground mb-1">{language === 'fr' ? 'Distribution' : 'Distribution'}</p>
                        <div className="flex h-4 rounded overflow-hidden">
                          <div 
                            className="bg-profit" 
                            style={{ width: `${stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0}%` }} 
                          />
                          <div 
                            className="bg-muted" 
                            style={{ width: `${stats.totalTrades > 0 ? (stats.breakeven / stats.totalTrades) * 100 : 0}%` }} 
                          />
                          <div 
                            className="bg-loss" 
                            style={{ width: `${stats.totalTrades > 0 ? (stats.losingTrades / stats.totalTrades) * 100 : 0}%` }} 
                          />
                        </div>
                      </div>
                    )}

                    {sections.tradeHistory && (
                      <div className="space-y-1">
                        <p className="font-bold text-[9px]">{language === 'fr' ? 'Historique' : 'History'}</p>
                        <div className="border rounded overflow-hidden">
                          <div className="bg-slate-900 text-white grid grid-cols-5 gap-1 p-1 text-[7px]">
                            <span>Date</span>
                            <span>Asset</span>
                            <span>Dir</span>
                            <span>Lot</span>
                            <span>PnL</span>
                          </div>
                          {filteredTrades.slice(0, 3).map((trade, i) => (
                            <div key={i} className="grid grid-cols-5 gap-1 p-1 text-[7px] border-t">
                              <span>{format(new Date(trade.trade_date), 'dd/MM')}</span>
                              <span className="truncate">{trade.asset}</span>
                              <span>{trade.direction[0].toUpperCase()}</span>
                              <span>{confidentialMode ? '****' : trade.lot_size}</span>
                              <span className={trade.result === 'win' ? 'text-profit' : trade.result === 'loss' ? 'text-loss' : ''}>
                                {formatAmount(trade.profit_loss || 0)}
                              </span>
                            </div>
                          ))}
                          {filteredTrades.length > 3 && (
                            <div className="text-center text-[7px] text-muted-foreground py-1 border-t">
                              +{filteredTrades.length - 3} {language === 'fr' ? 'autres' : 'more'}...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Export Summary */}
            <div className="mt-3 p-2 bg-muted/50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'fr' ? 'Trades:' : 'Trades:'}</span>
                <span className="font-medium">{filteredTrades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'fr' ? 'Sections:' : 'Sections:'}</span>
                <span className="font-medium">{Object.values(sections).filter(Boolean).length}/6</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || filteredTrades.length === 0}
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? (language === 'fr' ? 'Export...' : 'Exporting...') : (language === 'fr' ? 'Exporter' : 'Export')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFExportDialog;
