import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use defaults
const getAllowedOrigin = (origin: string): string => {
  const allowedOrigins = [
    'https://sfdudueswogeusuofbbi.lovableproject.com',
    'https://smarttradetracker.app',
    'https://www.smarttradetracker.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  if (allowedOrigins.includes(origin)) {
    return origin;
  }
  return 'https://sfdudueswogeusuofbbi.lovableproject.com';
};

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

interface ConnectRequest {
  action: 'connect' | 'disconnect' | 'sync' | 'list' | 'stats' | 'metrics';
  accountId?: string;
  metaApiAccountId?: string;
  startTime?: string;
  endTime?: string;
}

// MetaStats API base URL
const METASTATS_API_BASE = 'https://metastats-api-v1.new-york.agiliumtrade.ai';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const METASTATS_TOKEN = Deno.env.get('METASTATS_API_TOKEN');
    if (!METASTATS_TOKEN) {
      console.error('METASTATS_API_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'MetaStats API token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ConnectRequest = await req.json();
    const { action } = body;

    console.log(`MetaStats action: ${action} for user: ${user.id}`);

    // Get account metrics from MetaStats
    if (action === 'metrics') {
      const { metaApiAccountId } = body;
      
      if (!metaApiAccountId) {
        return new Response(
          JSON.stringify({ error: 'MetaApi account ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Fetching metrics for account ${metaApiAccountId}`);

      const metricsResponse = await fetch(
        `${METASTATS_API_BASE}/users/current/accounts/${metaApiAccountId}/metrics`,
        {
          headers: { 'auth-token': METASTATS_TOKEN },
        }
      );

      if (!metricsResponse.ok) {
        const errorText = await metricsResponse.text();
        console.error('MetaStats metrics error:', metricsResponse.status, errorText);
        
        // Handle 202 - processing
        if (metricsResponse.status === 202) {
          return new Response(
            JSON.stringify({ 
              processing: true, 
              message: 'Metrics are being calculated, please try again in a few seconds' 
            }),
            { 
              status: 202, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to fetch metrics', details: errorText }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const metrics = await metricsResponse.json();
      console.log('Metrics fetched successfully');

      return new Response(
        JSON.stringify({ success: true, metrics }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get historical trades from MetaStats
    if (action === 'sync') {
      const { metaApiAccountId, startTime, endTime } = body;
      
      if (!metaApiAccountId) {
        return new Response(
          JSON.stringify({ error: 'MetaApi account ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Default to last 90 days if not specified
      const start = startTime || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 23);
      const end = endTime || new Date().toISOString().replace('T', ' ').slice(0, 23);

      console.log(`Fetching trades for account ${metaApiAccountId} from ${start} to ${end}`);

      const tradesResponse = await fetch(
        `${METASTATS_API_BASE}/users/current/accounts/${metaApiAccountId}/historical-trades/${encodeURIComponent(start)}/${encodeURIComponent(end)}?updateHistory=true`,
        {
          headers: { 'auth-token': METASTATS_TOKEN },
        }
      );

      if (!tradesResponse.ok) {
        const errorText = await tradesResponse.text();
        console.error('MetaStats trades error:', tradesResponse.status, errorText);
        
        // Handle 202 - processing
        if (tradesResponse.status === 202) {
          return new Response(
            JSON.stringify({ 
              processing: true, 
              message: 'Trades are being processed, please try again in a few seconds' 
            }),
            { 
              status: 202, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to fetch trades', details: errorText }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tradesData = await tradesResponse.json();
      const historicalTrades = tradesData.trades || [];
      console.log(`Fetched ${historicalTrades.length} historical trades`);

      // Process and insert trades
      const tradesToInsert = [];
      for (const trade of historicalTrades) {
        const direction = trade.type === 'DEAL_TYPE_BUY' ? 'long' : 'short';
        let result: 'win' | 'loss' | 'breakeven' = 'breakeven';
        
        if (trade.profit > 0) result = 'win';
        else if (trade.profit < 0) result = 'loss';

        tradesToInsert.push({
          user_id: user.id,
          asset: trade.symbol,
          direction,
          entry_price: trade.openPrice || 0,
          exit_price: trade.closePrice || trade.openPrice || 0,
          lot_size: trade.volume || 0.01,
          profit_loss: trade.profit || 0,
          result,
          trade_date: trade.openTime || trade.closeTime,
          duration_seconds: trade.durationInMinutes ? trade.durationInMinutes * 60 : null,
          notes: `Imported from MetaTrader - Position #${trade.positionId}`,
        });
      }

      if (tradesToInsert.length > 0) {
        // Check for existing trades to avoid duplicates
        const { data: existingTrades } = await supabase
          .from('trades')
          .select('notes')
          .eq('user_id', user.id)
          .like('notes', 'Imported from MetaTrader%');

        const existingPositions = new Set(
          existingTrades?.map(t => {
            const match = t.notes?.match(/Position #(\d+)/);
            return match ? match[1] : null;
          }).filter(Boolean) || []
        );

        const newTrades = tradesToInsert.filter(t => {
          const match = t.notes.match(/Position #(\d+)/);
          return match ? !existingPositions.has(match[1]) : true;
        });

        if (newTrades.length > 0) {
          const { error: insertError } = await supabase
            .from('trades')
            .insert(newTrades);

          if (insertError) {
            console.error('Trade insert error:', insertError);
          } else {
            console.log(`Inserted ${newTrades.length} new trades`);
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          tradesFound: historicalTrades.length,
          tradesImported: tradesToInsert.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get open trades from MetaStats
    if (action === 'stats') {
      const { metaApiAccountId } = body;
      
      if (!metaApiAccountId) {
        return new Response(
          JSON.stringify({ error: 'MetaApi account ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Fetching open trades for account ${metaApiAccountId}`);

      const openTradesResponse = await fetch(
        `${METASTATS_API_BASE}/users/current/accounts/${metaApiAccountId}/open-trades`,
        {
          headers: { 'auth-token': METASTATS_TOKEN },
        }
      );

      if (!openTradesResponse.ok) {
        const errorText = await openTradesResponse.text();
        console.error('MetaStats open trades error:', openTradesResponse.status, errorText);
        
        // Handle 202 - processing
        if (openTradesResponse.status === 202) {
          return new Response(
            JSON.stringify({ 
              processing: true, 
              message: 'Data is being processed, please try again in a few seconds' 
            }),
            { 
              status: 202, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Failed to fetch open trades', details: errorText }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const openTrades = await openTradesResponse.json();
      console.log('Open trades fetched successfully');

      return new Response(
        JSON.stringify({ success: true, openTrades }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List saved MT accounts
    if (action === 'list') {
      const { data: accounts, error: listError } = await supabase
        .from('mt_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listError) {
        console.error('List error:', listError);
        return new Response(
          JSON.stringify({ error: 'Failed to list accounts' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ accounts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Connect (save) a new MT account reference
    if (action === 'connect') {
      const { metaApiAccountId } = body;
      
      if (!metaApiAccountId) {
        return new Response(
          JSON.stringify({ error: 'MetaApi account ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify account exists in MetaStats by fetching metrics
      console.log(`Verifying account ${metaApiAccountId} exists`);
      
      const verifyResponse = await fetch(
        `${METASTATS_API_BASE}/users/current/accounts/${metaApiAccountId}/metrics`,
        {
          headers: { 'auth-token': METASTATS_TOKEN },
        }
      );

      if (!verifyResponse.ok && verifyResponse.status !== 202) {
        return new Response(
          JSON.stringify({ error: 'Account not found or not accessible' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Save to database
      const { data: mtAccount, error: insertError } = await supabase
        .from('mt_accounts')
        .insert({
          user_id: user.id,
          account_name: `MT Account ${metaApiAccountId.slice(0, 8)}`,
          platform: 'MT5',
          server: 'MetaStats',
          login: metaApiAccountId,
          metaapi_account_id: metaApiAccountId,
          is_connected: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, account: mtAccount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Disconnect (remove) a saved MT account
    if (action === 'disconnect') {
      const { accountId } = body;
      
      if (!accountId) {
        return new Response(
          JSON.stringify({ error: 'Account ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: deleteError } = await supabase
        .from('mt_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to disconnect account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Edge function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
