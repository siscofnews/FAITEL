import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface NewsData {
  mundial: NewsItem[];
  cemadeb: NewsItem[];
  aguai: NewsItem[];
  secretariaMissoes: NewsItem[];
}

interface UseNewsResult {
  news: NewsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEvangelicalNews(): UseNewsResult {
  const [news, setNews] = useState<NewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setIsLoading(true);
    
    // Direct mock usage
    setNews({
        mundial: [
            {
                id: '1',
                title: 'Cristianismo cresce na Ásia',
                excerpt: 'Relatórios indicam aumento significativo de novos convertidos em países asiáticos.',
                image: 'https://images.unsplash.com/photo-1507692049790-de58293a469d?w=800&auto=format&fit=crop&q=60',
                category: 'Mundial',
                source: 'Missão Portas Abertas',
                date: new Date().toISOString(),
                url: '#'
            }
        ],
        cemadeb: [
            {
                id: '2',
                title: 'CEMADEB realiza grande batismo',
                excerpt: 'Mais de 500 novos membros foram batizados nas águas neste último domingo.',
                image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=60',
                category: 'CEMADEB',
                source: 'Secretaria CEMADEB',
                date: new Date().toISOString(),
                url: '#'
            }
        ],
        aguai: [],
        secretariaMissoes: []
    });
    setError(null);
    setIsLoading(false);

    /*
    try {
      const { data: response, error: fetchError } = await supabase.functions.invoke('fetch-evangelical-news', {
        body: { category: 'all' }
      });
      
      if (fetchError) throw fetchError;

      if (response.success) {
        setNews(response.news);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to fetch news');
      }
    } catch (err) {
      console.warn('Using offline fallback for evangelical news');
      setNews({
        mundial: [
            {
                id: '1',
                title: 'Cristianismo cresce na Ásia',
                excerpt: 'Relatórios indicam aumento significativo de novos convertidos em países asiáticos.',
                image: 'https://images.unsplash.com/photo-1507692049790-de58293a469d?w=800&auto=format&fit=crop&q=60',
                category: 'Mundial',
                source: 'Missão Portas Abertas',
                date: new Date().toISOString(),
                url: '#'
            }
        ],
        cemadeb: [
            {
                id: '2',
                title: 'CEMADEB realiza grande batismo',
                excerpt: 'Mais de 500 novos membros foram batizados nas águas neste último domingo.',
                image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=60',
                category: 'CEMADEB',
                source: 'Secretaria CEMADEB',
                date: new Date().toISOString(),
                url: '#'
            }
        ],
        aguai: [],
        secretariaMissoes: []
      });
      setError(null);
    } finally {
      setIsLoading(false);
    }
    */
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, isLoading, error, refetch: fetchNews };
}
