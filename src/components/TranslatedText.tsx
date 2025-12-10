import { useEffect, useState, memo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

// Global translation cache shared across components
const globalCache: TranslationCache = {};

interface TranslatedTextProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const TranslatedText = memo(({ children, as: Component = 'span', className }: TranslatedTextProps) => {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If Portuguese (source language), use original
    if (language === 'pt') {
      setTranslated(children);
      return;
    }

    const cacheKey = children.trim();
    
    // Check cache first
    if (globalCache[cacheKey]?.[language]) {
      setTranslated(globalCache[cacheKey][language]);
      return;
    }

    // Translate
    const translateText = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: { texts: [children], targetLanguage: language }
        });

        if (error) {
          console.error('Translation error:', error);
          return;
        }

        const result = data?.translations?.[0] || children;
        
        // Cache result
        if (!globalCache[cacheKey]) {
          globalCache[cacheKey] = {};
        }
        globalCache[cacheKey][language] = result;
        
        setTranslated(result);
      } catch (err) {
        console.error('Translation failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    translateText();
  }, [children, language]);

  return (
    <Component className={`${className || ''} relative inline`}>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </span>
      )}
      <span style={{ opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.2s' }}>
        {translated}
      </span>
    </Component>
  );
});

TranslatedText.displayName = 'TranslatedText';

// Hook for translating arrays of text efficiently
export const useTranslatedArray = (texts: string[]) => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<string[]>(texts);

  useEffect(() => {
    if (language === 'pt') {
      setTranslations(texts);
      return;
    }

    // Check which need translation
    const needsTranslation: number[] = [];
    const results = [...texts];
    
    texts.forEach((text, index) => {
      const cacheKey = text.trim();
      if (globalCache[cacheKey]?.[language]) {
        results[index] = globalCache[cacheKey][language];
      } else {
        needsTranslation.push(index);
      }
    });

    if (needsTranslation.length === 0) {
      setTranslations(results);
      return;
    }

    // Batch translate uncached texts
    const translateBatch = async () => {
      const textsToTranslate = needsTranslation.map(i => texts[i]);
      
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: { texts: textsToTranslate, targetLanguage: language }
        });

        if (error) {
          console.error('Batch translation error:', error);
          setTranslations(results);
          return;
        }

        const translated = data?.translations || textsToTranslate;
        
        needsTranslation.forEach((origIndex, i) => {
          const original = texts[origIndex];
          const result = translated[i] || original;
          const cacheKey = original.trim();
          
          if (!globalCache[cacheKey]) {
            globalCache[cacheKey] = {};
          }
          globalCache[cacheKey][language] = result;
          results[origIndex] = result;
        });

        setTranslations(results);
      } catch (err) {
        console.error('Batch translation failed:', err);
        setTranslations(results);
      }
    };

    translateBatch();
  }, [texts.join('|||'), language]);

  return translations;
};
