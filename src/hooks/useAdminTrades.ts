import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';
import { Trade } from './useTrades';

export const useAdminTrades = () => {
  const { selectedUser, isAdminVerified } = useAdmin();

  const tradesQuery = useQuery({
    queryKey: ['admin-trades', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return [];
      
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', selectedUser.id)
        .order('trade_date', { ascending: false });

      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!selectedUser && isAdminVerified
  });

  // Calculate statistics
  const stats = tradesQuery.data ? {
    totalTrades: tradesQuery.data.length,
    winningTrades: tradesQuery.data.filter(t => t.result === 'win').length,
    losingTrades: tradesQuery.data.filter(t => t.result === 'loss').length,
    breakeven: tradesQuery.data.filter(t => t.result === 'breakeven').length,
    totalProfit: tradesQuery.data
      .filter(t => t.profit_loss && t.profit_loss > 0)
      .reduce((sum, t) => sum + (t.profit_loss || 0), 0),
    totalLoss: tradesQuery.data
      .filter(t => t.profit_loss && t.profit_loss < 0)
      .reduce((sum, t) => sum + Math.abs(t.profit_loss || 0), 0),
    winrate: tradesQuery.data.length > 0 
      ? (tradesQuery.data.filter(t => t.result === 'win').length / 
         tradesQuery.data.filter(t => t.result !== 'pending').length) * 100 
      : 0
  } : null;

  return {
    trades: tradesQuery.data || [],
    isLoading: tradesQuery.isLoading,
    error: tradesQuery.error,
    stats,
    refetch: tradesQuery.refetch
  };
};
