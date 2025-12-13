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

      // Mock data directly
      setNews([
          {
            id: '1',
            title: 'Convenção Geral das Assembleias de Deus no Brasil define data da próxima AGO',
            excerpt: 'A liderança da CGADB se reuniu para definir os detalhes da próxima Assembleia Geral Ordinária que acontecerá em São Paulo.',
            image: 'https://images.unsplash.com/photo-1544928147-79a79476e6a3?w=800&auto=format&fit=crop&q=60',
            category: 'Brasil',
            source: 'JM Notícia',
            date: new Date().toISOString(),
            url: '#'
          },
          {
            id: '2',
            title: 'Avanço missionário na África alcança milhares de vidas',
            excerpt: 'Missionários relatam grande avivamento e conversões em massa em aldeias remotas do continente africano.',
            image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=60',
            category: 'Missões',
            source: 'Gospel Prime',
            date: new Date().toISOString(),
            url: '#'
          },
          {
            id: '3',
            title: 'Igreja inaugura novo templo com capacidade para 5 mil pessoas',
            excerpt: 'A inauguração contou com a presença de lideranças evangélicas de todo o país e um grande culto de gratidão.',
            image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60',
            category: 'Igreja',
            source: 'Fuxico Gospel',
            date: new Date().toISOString(),
            url: '#'
          }
      ]);
      setIsLoading(false);

      /*
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
         console.warn('Using offline fallback for external news');
         // Mock data for offline mode
         setNews([
           // ... (same mock data as above)
         ]);
         setError(null);
      } finally {
        setIsLoading(false);
      }
      */
    };

    fetchNews();
  }, [source]);

  return { news, isLoading, error };
};
