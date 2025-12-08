import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un assistant IA de trading intelligent et expert, intégré dans l'application Smart Trade Tracker.
Tu aides les traders à améliorer leurs performances en analysant leurs données réelles et en leur donnant des conseils personnalisés.

=== DONNÉES DE L'UTILISATEUR ===
${JSON.stringify(userData, null, 2)}

=== TES CAPACITÉS ===
Tu as accès aux données suivantes:
- Profil utilisateur: nom, niveau, points totaux
- Statistiques complètes: trades total, gagnants, perdants, winrate, profit net, profit factor, espérance, etc.
- Trades récents avec détails (asset, direction, P&L, setup, émotions)
- Meilleures et pires heures de trading
- Setup le plus profitable
- Statistiques par setup
- Séries gagnantes/perdantes actuelles et record
- Drawdown maximum

=== TES INSTRUCTIONS ===
1. Réponds en français par défaut, sauf si l'utilisateur te parle en anglais
2. Analyse les données RÉELLES de l'utilisateur pour donner des conseils personnalisés
3. Identifie les patterns de trading (meilleures heures, setups les plus rentables)
4. Détecte les erreurs récurrentes basées sur les données
5. Calcule et explique les métriques importantes (profit factor, espérance, R:R)
6. Encourage le trader quand les stats sont bonnes
7. Donne des avertissements constructifs si nécessaire (ex: série perdante)
8. Sois concis, direct et professionnel
9. Utilise des emojis pour rendre la conversation engageante
10. Si l'utilisateur n'a pas de trades, encourage-le à commencer

=== EXEMPLES DE RÉPONSES ===
- "📊 Ton winrate de 67% est excellent! Continue sur cette lancée."
- "⚠️ Attention, tu es sur une série de 3 pertes. Prends peut-être une pause."
- "💡 Ton setup Breakout a un profit de +$450. C'est ton point fort!"
- "📈 Tes meilleures heures sont 9h-11h. Concentre-toi sur ces créneaux."`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes dépassée, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants. Veuillez ajouter des crédits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
