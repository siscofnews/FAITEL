import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePageVisitor(pagePath: string) {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const sessionKey = `visitor_counted_${pagePath}`;
        const alreadyCounted = sessionStorage.getItem(sessionKey);

        if (!alreadyCounted) {
          // Increment daily visitor count
          await supabase.rpc('increment_visitor_count', {
            p_page_path: pagePath
          });

          // Increment hourly visitor count
          await supabase.rpc('increment_hourly_visitor_count', {
            p_page_path: pagePath
          });

          sessionStorage.setItem(sessionKey, 'true');
        }
      } catch (error) {
        console.error('Error tracking page visit:', error);
      }
    };

    trackVisit();
  }, [pagePath]);
}
