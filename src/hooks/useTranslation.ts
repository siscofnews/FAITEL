import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

// Global translation cache
const translationCache: TranslationCache = {};

export const useTranslation = () => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const pendingTranslations = useRef<Map<string, Promise<string>>>(new Map());

  const translate = useCallback(async (text: string, targetLang?: Language): Promise<string> => {
    const lang = targetLang || language;
    
    // Return original if Portuguese (source language)
    if (lang === 'pt') {
      return text;
    }

    // Check cache first
    const cacheKey = text.trim();
    if (translationCache[cacheKey]?.[lang]) {
      return translationCache[cacheKey][lang];
    }

    // Check if translation is already pending
    const pendingKey = `${cacheKey}:${lang}`;
    if (pendingTranslations.current.has(pendingKey)) {
      return pendingTranslations.current.get(pendingKey)!;
    }

    // Create translation promise
    const translationPromise = (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: { texts: [text], targetLanguage: lang }
        });

        if (error) {
          console.error('Translation error:', error);
          return text;
        }

        const translated = data?.translations?.[0] || text;
        
        // Cache the result
        if (!translationCache[cacheKey]) {
          translationCache[cacheKey] = {};
        }
        translationCache[cacheKey][lang] = translated;
        
        return translated;
      } catch (err) {
        console.error('Translation failed:', err);
        return text;
      } finally {
        pendingTranslations.current.delete(pendingKey);
      }
    })();

    pendingTranslations.current.set(pendingKey, translationPromise);
    return translationPromise;
  }, [language]);

  const translateBatch = useCallback(async (texts: string[], targetLang?: Language): Promise<string[]> => {
    const lang = targetLang || language;
    
    // Return originals if Portuguese
    if (lang === 'pt') {
      return texts;
    }

    // Check which texts need translation
    const textsToTranslate: string[] = [];
    const indexMap: number[] = [];
    const results: string[] = new Array(texts.length);

    texts.forEach((text, index) => {
      const cacheKey = text.trim();
      if (translationCache[cacheKey]?.[lang]) {
        results[index] = translationCache[cacheKey][lang];
      } else {
        textsToTranslate.push(text);
        indexMap.push(index);
      }
    });

    // If all cached, return immediately
    if (textsToTranslate.length === 0) {
      return results;
    }

    setIsTranslating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { texts: textsToTranslate, targetLanguage: lang }
      });

      if (error) {
        console.error('Batch translation error:', error);
        if (error.message?.includes('Rate limit')) {
          toast.error('Limite de tradução excedido. Tente novamente em alguns segundos.');
        }
        // Fill with originals on error
        indexMap.forEach((origIndex, i) => {
          results[origIndex] = textsToTranslate[i];
        });
        return results;
      }

      const translations = data?.translations || textsToTranslate;
      
      // Cache and assign results
      indexMap.forEach((origIndex, i) => {
        const original = textsToTranslate[i];
        const translated = translations[i] || original;
        const cacheKey = original.trim();
        
        if (!translationCache[cacheKey]) {
          translationCache[cacheKey] = {};
        }
        translationCache[cacheKey][lang] = translated;
        results[origIndex] = translated;
      });

      return results;
    } catch (err) {
      console.error('Batch translation failed:', err);
      indexMap.forEach((origIndex, i) => {
        results[origIndex] = textsToTranslate[i];
      });
      return results;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  return {
    translate,
    translateBatch,
    isTranslating,
    language
  };
};

// Simple component wrapper for translated text
export const useTranslatedText = (text: string) => {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(text);
  const { translate } = useTranslation();

  useEffect(() => {
    if (language === 'pt') {
      setTranslated(text);
      return;
    }

    translate(text).then(setTranslated);
  }, [text, language, translate]);

  return translated;
};
