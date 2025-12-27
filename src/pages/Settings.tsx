import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTrades } from '@/hooks/useTrades';
import { useJournalEntries } from '@/hooks/useJournalEntries';
import { useCurrency } from '@/hooks/useCurrency';
import { usePDFExport } from '@/hooks/usePDFExport';
import { useFeedback } from '@/hooks/useFeedback';
import { useSettings } from '@/hooks/useSettings';
import { PDFExportDialog } from '@/components/PDFExportDialog';
import MTTradeImporter from '@/components/MTTradeImporter';
import { ProfileTab, TradingTab, SessionsTab, SecurityTab } from '@/components/settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, formatPriceForExport } from '@/lib/utils';
import {
  Settings as SettingsIcon,
  User,
  TrendingUp,
  Clock,
  Shield,
  LogOut,
  Trash2,
  AlertTriangle,
  Download,
  FileJson,
  FileSpreadsheet,
  RotateCcw,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
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
} from "@/components/ui/alert-dialog";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { language, t, setLanguage } = useLanguage();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { trades } = useTrades();
  const { entries: journalEntries } = useJournalEntries();
  const { currency, convertFromBase } = useCurrency();
  const { exportToPDF } = usePDFExport();
  const { triggerFeedback } = useFeedback();
  const { resetSettings } = useSettings();

  const [activeTab, setActiveTab] = useState('profile');
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleExportPDF = async (filteredTrades: any[], profileData: any, periodLabel: string) => {
    if (filteredTrades.length === 0) {
      toast.error(t('noDataToExport'));
      return;
    }
    setIsExporting(true);
    await exportToPDF(filteredTrades, profileData, periodLabel);
    setIsExporting(false);
  };

  const handleExportJSON = async () => {
    if (trades.length === 0 && journalEntries.length === 0) {
      toast.error(t('noDataToExport'));
      return;
    }
    setIsExporting(true);
    triggerFeedback('click');
    try {
      const convertedTrades = trades.map(trade => ({
        ...trade,
        entry_price: formatPriceForExport(trade.entry_price),
        exit_price: formatPriceForExport(trade.exit_price),
        stop_loss: formatPriceForExport(trade.stop_loss),
        take_profit: formatPriceForExport(trade.take_profit),
        profit_loss: trade.profit_loss ? convertFromBase(trade.profit_loss) : null,
        currency: currency,
      }));
      const exportData = {
        exportDate: new Date().toISOString(),
        currency: currency,
        profile: profile ? { nickname: profile.nickname, level: profile.level, total_points: profile.total_points } : null,
        trades: convertedTrades,
        journalEntries: journalEntries,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-trade-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerFeedback('success');
      toast.success(t('exportSuccess'));
    } catch (error) {
      triggerFeedback('error');
      toast.error(t('exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    if (trades.length === 0) {
      toast.error(t('noDataToExport'));
      return;
    }
    setIsExporting(true);
    triggerFeedback('click');
    try {
      const headers = ['Date', 'Asset', 'Direction', 'Entry Price', 'Exit Price', 'Stop Loss', 'Take Profit', 'Lot Size', `PnL (${currency})`, 'Result', 'Setup', 'Emotions', 'Notes'];
      const rows = trades.map(trade => [
        trade.trade_date, trade.asset, trade.direction,
        formatPrice(trade.entry_price), trade.exit_price ? formatPrice(trade.exit_price) : '',
        trade.stop_loss ? formatPrice(trade.stop_loss) : '', trade.take_profit ? formatPrice(trade.take_profit) : '',
        trade.lot_size, trade.profit_loss ? convertFromBase(trade.profit_loss).toFixed(2) : '',
        trade.result || '', trade.setup || '', trade.emotions || '', trade.notes?.replace(/"/g, '""') || '',
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smart-trade-tracker-trades-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerFeedback('success');
      toast.success(t('exportSuccess'));
    } catch (error) {
      triggerFeedback('error');
      toast.error(t('exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!user) return;
    setIsDeletingData(true);
    triggerFeedback('click');
    try {
      await supabase.from('trades').delete().eq('user_id', user.id);
      await supabase.from('journal_entries').delete().eq('user_id', user.id);
      await supabase.from('user_challenges').delete().eq('user_id', user.id);
      localStorage.removeItem('smart-trade-tracker-recordings');
      await supabase.from('profiles').update({ total_points: 0, level: 1 }).eq('user_id', user.id);
      await refreshProfile();
      triggerFeedback('success');
      toast.success(t('dataDeleted'));
    } catch (error) {
      triggerFeedback('error');
      toast.error(t('error'));
    } finally {
      setIsDeletingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    triggerFeedback('click');
    try {
      await handleDeleteAllData();
      await supabase.from('profiles').delete().eq('user_id', user.id);
      await signOut();
      triggerFeedback('success');
      toast.success(t('accountDeleted'));
    } catch (error) {
      triggerFeedback('error');
      toast.error(t('error'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleReset = async () => {
    await resetSettings();
    localStorage.removeItem('smart-trade-tracker-primary-color');
    document.documentElement.style.fontSize = '16px';
    document.documentElement.style.removeProperty('--primary');
    triggerFeedback('success');
    toast.success(t('interfaceReset'));
  };

  return (
    <div className="py-3 max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto pb-20">
      {/* Header compact */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
            {t('settings')}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-neon">
          <SettingsIcon className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-10 mb-4">
          <TabsTrigger value="profile" className="gap-1 text-xs px-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'fr' ? 'Profil' : 'Profile'}</span>
          </TabsTrigger>
          <TabsTrigger value="trading" className="gap-1 text-xs px-1">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Trading</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1 text-xs px-1">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1 text-xs px-1">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'fr' ? 'Sécurité' : 'Security'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-3 mt-0">
          <ProfileTab onSettingChange={() => setHasUnsavedChanges(true)} />
          
          {/* Export & Import Section */}
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t('exportData')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportJSON} disabled={isExporting}>
                <FileJson className="w-3 h-3" />
                JSON
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={handleExportCSV} disabled={isExporting}>
                <FileSpreadsheet className="w-3 h-3" />
                CSV
              </Button>
              <PDFExportDialog
                trades={trades}
                profile={profile ? { nickname: profile.nickname, level: profile.level, total_points: profile.total_points } : null}
                onExport={handleExportPDF}
                isExporting={isExporting}
              />
            </div>
          </div>

          {/* MT Importer */}
          <div className="glass-card p-3">
            <MTTradeImporter />
          </div>

          {/* Logout & Danger Zone */}
          <div className="glass-card p-3 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-9 text-sm"
              onClick={() => { triggerFeedback('click'); signOut(); }}
            >
              <LogOut className="w-4 h-4" />
              {t('signOut')}
            </Button>

            <div className="border-t border-loss/30 pt-2 mt-2">
              <div className="flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3 h-3 text-loss" />
                <span className="text-xs font-medium text-loss">{t('dangerZone')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-loss/30 text-loss hover:bg-loss/10" disabled={isDeletingData}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      {language === 'fr' ? 'Données' : 'Data'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('deleteDataConfirm')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('deleteDataDesc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllData} className="bg-loss hover:bg-loss/90">{t('deleteAll')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="h-8 text-xs" disabled={isDeletingAccount}>
                      <Trash2 className="w-3 h-3 mr-1" />
                      {language === 'fr' ? 'Compte' : 'Account'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-loss">{t('deleteAccountConfirm')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('deleteAccountDesc')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-loss hover:bg-loss/90">{t('deleteAccount')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trading" className="mt-0">
          <TradingTab onSettingChange={() => setHasUnsavedChanges(true)} />
        </TabsContent>

        <TabsContent value="sessions" className="mt-0">
          <SessionsTab onSettingChange={() => setHasUnsavedChanges(true)} />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <SecurityTab onSettingChange={() => setHasUnsavedChanges(true)} />
        </TabsContent>
      </Tabs>

      {/* Floating Reset Button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shadow-lg bg-background/95 backdrop-blur-sm border-border"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
          {t('resetDisplay')}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
