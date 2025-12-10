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

export const useExternalNews = (source: 'all' | 'jmnoticia' | 'fuxicogospel' = 'all') => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase.functions.invoke('fetch-external-news', {
          body: { source }
        });

        if (fetchError) {
          throw fetchError;
        }

        if (data?.success && data?.news) {
          setNews(data.news);
        } else {
          setNews([]);
        }
      } catch (err) {
        console.error('Error fetching external news:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar notícias');
        setNews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [source]);

  return { news, isLoading, error };
};
