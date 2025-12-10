import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  source: string;
  date: string;
  url: string;
}

async function fetchJMNoticia(): Promise<NewsItem[]> {
  try {
    console.log('Fetching news from jmnoticia.com.br...');
    const response = await fetch('https://jmnoticia.com.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('JM Noticia fetch failed:', response.status);
      return [];
    }

    const html = await response.text();
    const news: NewsItem[] = [];
    
    // Extract article titles and links using regex
    const articleRegex = /<article[^>]*>[\s\S]*?<h\d[^>]*class="[^"]*entry-title[^"]*"[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
    const imageRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;
    
    let match;
    let count = 0;
    
    // Simple extraction of links and titles
    const linkRegex = /<a[^>]*href="(https:\/\/jmnoticia\.com\.br\/[^"]*)"[^>]*>([^<]+)<\/a>/gi;
    
    while ((match = linkRegex.exec(html)) !== null && count < 6) {
      const url = match[1];
      const title = match[2].trim();
      
      // Skip navigation links and short titles
      if (title.length > 20 && !url.includes('/categoria/') && !url.includes('/author/')) {
        news.push({
          id: `jm-${count}`,
          title: title,
          excerpt: title.substring(0, 100) + '...',
          image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400',
          category: 'Notícias',
          source: 'JM Notícia',
          date: new Date().toLocaleDateString('pt-BR'),
          url: url
        });
        count++;
      }
    }

    console.log(`Found ${news.length} articles from JM Noticia`);
    return news;
  } catch (error) {
    console.error('Error fetching JM Noticia:', error);
    return [];
  }
}

async function fetchFuxicoGospel(): Promise<NewsItem[]> {
  try {
    console.log('Fetching news from fuxicogospel.com.br...');
    const response = await fetch('https://fuxicogospel.com.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('Fuxico Gospel fetch failed:', response.status);
      return [];
    }

    const html = await response.text();
    const news: NewsItem[] = [];
    
    // Simple extraction of links and titles
    const linkRegex = /<a[^>]*href="(https:\/\/fuxicogospel\.com\.br\/[^"]*)"[^>]*title="([^"]*)"[^>]*>/gi;
    
    let match;
    let count = 0;
    
    while ((match = linkRegex.exec(html)) !== null && count < 6) {
      const url = match[1];
      const title = match[2].trim();
      
      if (title.length > 10 && !url.includes('/categoria/') && !url.includes('/tag/')) {
        news.push({
          id: `fuxico-${count}`,
          title: title,
          excerpt: title.substring(0, 100) + '...',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          category: 'Gospel',
          source: 'Fuxico Gospel',
          date: new Date().toLocaleDateString('pt-BR'),
          url: url
        });
        count++;
      }
    }

    // Fallback: try another pattern
    if (news.length === 0) {
      const altRegex = /<h\d[^>]*>\s*<a[^>]*href="(https:\/\/fuxicogospel\.com\.br\/[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      while ((match = altRegex.exec(html)) !== null && count < 6) {
        const url = match[1];
        const title = match[2].trim();
        
        if (title.length > 10) {
          news.push({
            id: `fuxico-${count}`,
            title: title,
            excerpt: title.substring(0, 100) + '...',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            category: 'Gospel',
            source: 'Fuxico Gospel',
            date: new Date().toLocaleDateString('pt-BR'),
            url: url
          });
          count++;
        }
      }
    }

    console.log(`Found ${news.length} articles from Fuxico Gospel`);
    return news;
  } catch (error) {
    console.error('Error fetching Fuxico Gospel:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source } = await req.json().catch(() => ({ source: 'all' }));
    
    let news: NewsItem[] = [];

    if (source === 'jmnoticia' || source === 'all') {
      const jmNews = await fetchJMNoticia();
      news = [...news, ...jmNews];
    }

    if (source === 'fuxicogospel' || source === 'all') {
      const fuxicoNews = await fetchFuxicoGospel();
      news = [...news, ...fuxicoNews];
    }

    console.log(`Total news fetched: ${news.length}`);

    return new Response(JSON.stringify({
      success: true,
      news,
      updatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in fetch-external-news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      news: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
