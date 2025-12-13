import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MotivationalData {
  message: string;
  date: string;
  dayOfWeek: string;
  isLoading: boolean;
  error: string | null;
}

export function useMotivationalMessage() {
  const [data, setData] = useState<MotivationalData>({
    message: '',
    date: '',
    dayOfWeek: '',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchMessage = async () => {
      // Mock data directly to avoid API errors in local dev without backend
      setData({
        message: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento. Em todos os seus caminhos, reconheça-o, e ele endireitará as suas veredas. - Provérbios 3:5-6',
        date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
        dayOfWeek: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
        isLoading: false,
        error: null
      });

      /* 
      // Original API call logic - disabled for local dev without valid API keys
      try {
        const { data: response, error } = await supabase.functions.invoke('generate-motivational');
        
        if (error) throw error;

        setData({
          message: response.message,
          date: response.date,
          dayOfWeek: response.dayOfWeek,
          isLoading: false,
          error: null
        });
      } catch (err) {
        console.warn('Using offline fallback for motivational message');
        setData({
          message: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento. Em todos os seus caminhos, reconheça-o, e ele endireitará as suas veredas. - Provérbios 3:5-6',
          date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
          dayOfWeek: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
          isLoading: false,
          error: null
        });
      }
      */
    };

    fetchMessage();
  }, []);

  return data;
}
