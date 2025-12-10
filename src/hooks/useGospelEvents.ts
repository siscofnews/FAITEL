import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GospelEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  state: string;
  country: string;
  image: string;
  source: string;
  type: string;
  url: string;
}

interface GospelEventsResponse {
  events: GospelEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  nextUpdate: string | null;
  refetch: () => void;
}

const CACHE_KEY = 'gospel_events_cache';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export const useGospelEvents = (region: 'all' | 'brazil' | 'international' = 'all'): GospelEventsResponse => {
  const [events, setEvents] = useState<GospelEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);

  const fetchEvents = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    // Check cache first
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          const cacheAge = Date.now() - new Date(parsedCache.timestamp).getTime();
          
          if (cacheAge < CACHE_DURATION) {
            setEvents(parsedCache.events);
            setLastUpdated(parsedCache.updatedAt);
            setNextUpdate(parsedCache.nextUpdate);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }
    }

    try {
      const { data, error: fetchError } = await supabase.functions.invoke('fetch-gospel-events', {
        body: { region }
      });

      if (fetchError) {
        throw fetchError;
      }

      if (data?.success && data?.events) {
        setEvents(data.events);
        setLastUpdated(data.updatedAt);
        setNextUpdate(data.nextUpdate);
        
        // Cache the results
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          events: data.events,
          updatedAt: data.updatedAt,
          nextUpdate: data.nextUpdate,
          timestamp: new Date().toISOString()
        }));
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching gospel events:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      
      // Try to use cached data on error
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          setEvents(parsedCache.events);
          setLastUpdated(parsedCache.updatedAt);
        } catch (e) {
          setEvents([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchEvents();

    // Auto-refresh every 6 hours
    const refreshInterval = setInterval(() => {
      fetchEvents(true);
    }, CACHE_DURATION);

    return () => clearInterval(refreshInterval);
  }, [fetchEvents]);

  return { 
    events, 
    isLoading, 
    error, 
    lastUpdated, 
    nextUpdate,
    refetch: () => fetchEvents(true) 
  };
};
