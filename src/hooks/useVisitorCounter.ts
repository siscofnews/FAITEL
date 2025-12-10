import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useVisitorCounter(pagePath: string = '/') {
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const incrementAndFetch = async () => {
      try {
        // Check if already counted in this session
        const sessionKey = `visitor_counted_${pagePath}`;
        const alreadyCounted = sessionStorage.getItem(sessionKey);

        if (!alreadyCounted) {
          // Increment visitor count (daily)
          const { data, error } = await supabase.rpc('increment_visitor_count', {
            p_page_path: pagePath
          });

          // Also increment hourly count
          await supabase.rpc('increment_hourly_visitor_count', {
            p_page_path: pagePath
          });

          if (!error && data) {
            setVisitorCount(data);
            sessionStorage.setItem(sessionKey, 'true');
          }
        } else {
          // Just fetch current count
          const { data, error } = await supabase.rpc('get_total_visitors', {
            p_page_path: pagePath
          });

          if (!error && data) {
            setVisitorCount(data);
          }
        }
      } catch (error) {
        console.error('Error with visitor counter:', error);
      } finally {
        setIsLoading(false);
      }
    };

    incrementAndFetch();
  }, [pagePath]);

  return { visitorCount, isLoading };
}
