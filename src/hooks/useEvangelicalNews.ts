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
      console.error('Error fetching evangelical news:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar notícias');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { news, isLoading, error, refetch: fetchNews };
}
