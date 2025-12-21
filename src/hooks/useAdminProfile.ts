import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/contexts/AdminContext';

export interface AdminUserProfile {
  id: string;
  user_id: string;
  nickname: string;
  bio: string | null;
  trading_style: string | null;
  avatar_url: string | null;
  level: number | null;
  total_points: number | null;
  weekly_objective_trades: number | null;
  monthly_objective_profit: number | null;
  created_at: string;
  updated_at: string;
}

export const useAdminProfile = () => {
  const { selectedUser, isAdminVerified } = useAdmin();

  const profileQuery = useQuery({
    queryKey: ['admin-profile', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', selectedUser.id)
        .maybeSingle();

      if (error) throw error;
      return data as AdminUserProfile | null;
    },
    enabled: !!selectedUser && isAdminVerified
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    refetch: profileQuery.refetch
  };
};
