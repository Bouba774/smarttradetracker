import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  type: 'economic_event' | 'news_summary' | 'market_analysis';
  data: {
    event?: {
      name: string;
      currency: string;
      forecast: string;
      previous: string;
    };
    news?: {
      title: string;
      content: string;
    }[];
    assets?: string[];
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, data }: AnalysisRequest = await req.json();
    console.log(`Processing ${type} analysis request`, data);

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'economic_event':
        systemPrompt = `Tu es un analyste économique expert en marchés financiers. Tu analyses les événements économiques et leurs impacts potentiels sur les marchés.
Réponds TOUJOURS en JSON valide avec cette structure:
{
  "macroContext": "contexte macro-économique actuel (2-3 phrases)",
  "scenarios": {
    "aboveForecast": {
      "impact": "description de l'impact si le résultat dépasse les prévisions",
      "affectedAssets": ["SYMBOL ↑ ou ↓", ...],
      "probability": 0-100
    },
    "belowForecast": {
      "impact": "description de l'impact si le résultat est inférieur aux prévisions",
      "affectedAssets": ["SYMBOL ↑ ou ↓", ...],
      "probability": 0-100
    }
  }
}`;
        userPrompt = `Analyse cet événement économique:
- Événement: ${data.event?.name}
- Devise: ${data.event?.currency}
- Prévision: ${data.event?.forecast}
- Précédent: ${data.event?.previous}

Fournis une analyse complète des impacts potentiels.`;
        break;

      case 'news_summary':
        systemPrompt = `Tu es un analyste financier qui résume les actualités de marché de manière concise et actionnable.
Réponds TOUJOURS en JSON valide avec cette structure pour chaque news:
{
  "summaries": [
    {
      "summary": "résumé en 1-2 lignes maximum",
      "sentiment": "bullish" | "bearish" | "neutral",
      "tags": ["Risk-On" | "Risk-Off" | autres tags pertinents],
      "importance": "high" | "medium" | "low",
      "affectedAssets": ["SYMBOL", ...]
    }
  ]
}`;
        userPrompt = `Résume ces actualités financières:
${data.news?.map((n, i) => `${i + 1}. ${n.title}\n${n.content}`).join('\n\n')}`;
        break;

      case 'market_analysis':
        systemPrompt = `Tu es un analyste technique et fondamental expert. Tu fournis des analyses de marché basées sur les concepts ICT/SMC.
Réponds TOUJOURS en JSON valide avec cette structure:
{
  "assets": [
    {
      "symbol": "SYMBOL",
      "dailyBias": "bull" | "bear" | "neutral",
      "h4Bias": "bull" | "bear" | "neutral",
      "h1Bias": "bull" | "bear" | "neutral",
      "confluence": {
        "structure": true/false,
        "liquidity": true/false,
        "news": true/false
      },
      "confidence": 0-100,
      "analysis": "courte analyse (1-2 phrases)"
    }
  ],
  "riskEnvironment": "risk-on" | "risk-off" | "uncertain",
  "riskScore": 0-100
}`;
        userPrompt = `Analyse ces actifs: ${data.assets?.join(', ')}
Fournis le biais directionnel multi-timeframe et les confluences pour chaque actif.`;
        break;

      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }

    console.log("Calling Lovable AI Gateway...");

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants. Veuillez recharger votre compte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI Response received:", content.substring(0, 200) + "...");

    // Try to parse JSON from the response
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedContent = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      parsedContent = { rawContent: content };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: parsedContent,
        type 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("Error in market-analysis function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
