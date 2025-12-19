const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  currency: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  previous: string;
  forecast: string;
  actual: string;
}

const currencyToCountry: Record<string, string> = {
  'USD': 'US',
  'EUR': 'EU',
  'GBP': 'GB',
  'JPY': 'JP',
  'AUD': 'AU',
  'NZD': 'NZ',
  'CAD': 'CA',
  'CHF': 'CH',
  'CNY': 'CN',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get requested date from body
    let requestedDate = '';
    try {
      const body = await req.json();
      requestedDate = body.date || '';
    } catch {
      // No body or invalid JSON
    }

    // Build the ForexFactory URL with date parameter
    let url = 'https://www.forexfactory.com/calendar';
    if (requestedDate) {
      // ForexFactory uses format like ?day=dec19.2024
      const date = new Date(requestedDate);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      url = `https://www.forexfactory.com/calendar?day=${month}${day}.${year}`;
    }

    console.log('Scraping ForexFactory calendar:', url);

    // Scrape the ForexFactory calendar page with HTML format for better parsing
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['html', 'markdown'],
        onlyMainContent: true,
        waitFor: 5000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Failed to scrape ForexFactory' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the scraped content to extract economic events
    const html = data.data?.html || data.html || '';
    const markdown = data.data?.markdown || data.markdown || '';
    
    console.log('HTML length:', html.length);
    console.log('Markdown length:', markdown.length);
    
    const events = parseForexFactoryHTML(html, markdown);

    console.log(`Parsed ${events.length} economic events`);

    return new Response(
      JSON.stringify({ success: true, events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping ForexFactory:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseForexFactoryHTML(html: string, markdown: string): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  
  // Try to extract events from HTML first (more structured)
  // Look for calendar table rows with class patterns like "calendar__row"
  
  // Pattern to match table rows with event data
  const rowPattern = /<tr[^>]*class="[^"]*calendar__row[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = html.match(rowPattern) || [];
  
  console.log(`Found ${rows.length} calendar rows in HTML`);
  
  let currentTime = '';
  
  for (const row of rows) {
    try {
      // Extract time - look for calendar__time class
      const timeMatch = row.match(/<td[^>]*class="[^"]*calendar__time[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
      if (timeMatch) {
        const timeText = timeMatch[1].replace(/<[^>]+>/g, '').trim();
        if (timeText && timeText !== '&nbsp;') {
          currentTime = timeText;
        }
      }
      
      // Extract currency - look for calendar__currency class
      const currencyMatch = row.match(/<td[^>]*class="[^"]*calendar__currency[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
      const currency = currencyMatch ? currencyMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      if (!currency || !currencyToCountry[currency]) {
        continue;
      }
      
      // Extract impact - look for impact icon classes
      let impact: 'high' | 'medium' | 'low' = 'low';
      if (row.includes('icon--ff-impact-red') || row.includes('high')) {
        impact = 'high';
      } else if (row.includes('icon--ff-impact-ora') || row.includes('medium')) {
        impact = 'medium';
      } else if (row.includes('icon--ff-impact-yel') || row.includes('low')) {
        impact = 'low';
      }
      
      // Extract event name - look for calendar__event class
      const eventMatch = row.match(/<td[^>]*class="[^"]*calendar__event[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
      let eventName = '';
      if (eventMatch) {
        // Get the span with event title
        const titleMatch = eventMatch[1].match(/<span[^>]*class="[^"]*calendar__event-title[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
        eventName = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : eventMatch[1].replace(/<[^>]+>/g, '').trim();
      }
      
      if (!eventName) {
        continue;
      }
      
      // Extract previous value
      const prevMatch = row.match(/<td[^>]*class="[^"]*calendar__previous[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
      const previous = prevMatch ? prevMatch[1].replace(/<[^>]+>/g, '').trim() || '-' : '-';
      
      // Extract forecast value
      const forecastMatch = row.match(/<td[^>]*class="[^"]*calendar__forecast[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
      const forecast = forecastMatch ? forecastMatch[1].replace(/<[^>]+>/g, '').trim() || '-' : '-';
      
      // Extract actual value
      const actualMatch = row.match(/<td[^>]*class="[^"]*calendar__actual[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
      const actual = actualMatch ? actualMatch[1].replace(/<[^>]+>/g, '').trim() || '-' : '-';
      
      events.push({
        id: `event-${events.length + 1}`,
        time: currentTime || 'All Day',
        country: currencyToCountry[currency] || currency,
        currency: currency,
        event: eventName.substring(0, 100),
        impact,
        previous: previous.replace(/&nbsp;/g, '').trim() || '-',
        forecast: forecast.replace(/&nbsp;/g, '').trim() || '-',
        actual: actual.replace(/&nbsp;/g, '').trim() || '-',
      });
    } catch (e) {
      console.error('Error parsing row:', e);
    }
  }
  
  // If HTML parsing didn't work, try fallback markdown parsing
  if (events.length === 0 && markdown) {
    console.log('HTML parsing returned no events, trying markdown fallback');
    return parseForexFactoryMarkdown(markdown);
  }
  
  return events.slice(0, 30);
}

function parseForexFactoryMarkdown(markdown: string): EconomicEvent[] {
  const events: EconomicEvent[] = [];
  const lines = markdown.split('\n');
  
  let currentTime = '';
  let currentCurrency = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for time patterns
    const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(am|pm)?)/i);
    if (timeMatch) {
      currentTime = timeMatch[1];
    }
    
    // Look for currency codes
    const currencyMatch = line.match(/\b(USD|EUR|GBP|JPY|AUD|NZD|CAD|CHF|CNY)\b/);
    if (currencyMatch) {
      currentCurrency = currencyMatch[1];
    }
    
    // Look for event indicators
    if (line.length > 10 && currentCurrency) {
      const highImpactKeywords = ['Non-Farm', 'NFP', 'Interest Rate', 'CPI', 'GDP', 'FOMC', 'ECB', 'BOE', 'BOJ', 'Fed', 'Employment Change', 'Unemployment Rate', 'Retail Sales'];
      const mediumImpactKeywords = ['PMI', 'Employment', 'Trade Balance', 'Housing', 'Consumer Confidence', 'Manufacturing', 'Services'];
      
      const hasIndicator = highImpactKeywords.some(k => line.toLowerCase().includes(k.toLowerCase())) || 
                          mediumImpactKeywords.some(k => line.toLowerCase().includes(k.toLowerCase())) ||
                          line.match(/\b(Index|Rate|Balance|Sales|Output|Orders|Confidence)\b/i);
      
      if (hasIndicator) {
        let impact: 'high' | 'medium' | 'low' = 'low';
        if (highImpactKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
          impact = 'high';
        } else if (mediumImpactKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
          impact = 'medium';
        }
        
        const valueMatches = line.match(/-?\d+\.?\d*%?/g) || [];
        
        events.push({
          id: `event-${events.length + 1}`,
          time: currentTime || 'All Day',
          country: currencyToCountry[currentCurrency] || currentCurrency,
          currency: currentCurrency,
          event: line.substring(0, 100).replace(/[|*#]/g, '').trim(),
          impact,
          previous: valueMatches[0] || '-',
          forecast: valueMatches[1] || '-',
          actual: valueMatches[2] || '-',
        });
        
        currentCurrency = '';
      }
    }
  }
  
  return events.slice(0, 30);
}
