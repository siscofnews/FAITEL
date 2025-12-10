import { useMotivationalMessage } from '@/hooks/useMotivationalMessage';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Sparkles, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TranslatedText } from '@/components/TranslatedText';
import { useLanguage } from '@/contexts/LanguageContext';
import diretoresImg from '@/assets/diretores.jpg';

export function DirectorWord() {
  const { message, date, dayOfWeek, isLoading } = useMotivationalMessage();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-gold/10 via-gold/5 to-transparent border-gold/20 overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gold/10 via-gold/5 to-transparent border-gold/20 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="p-6 md:p-8 relative z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gold rounded-full shadow-lg">
            <Quote className="h-6 w-6 text-navy" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-navy flex items-center gap-2">
              <TranslatedText>Palavra dos Diretores</TranslatedText>
              <Sparkles className="h-4 w-4 text-gold animate-pulse" />
            </h3>
            <p className="text-sm text-muted-foreground capitalize">
              {dayOfWeek}, {date}
            </p>
          </div>
        </div>

        <blockquote className="text-lg md:text-xl text-foreground/90 leading-relaxed italic font-serif mb-6">
          "<TranslatedText>{message}</TranslatedText>"
        </blockquote>

        <div className="mt-6 pt-6 border-t border-gold/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img 
              src={diretoresImg} 
              alt="Pastor Valdinei e Pastora Thelma" 
              className="w-24 h-24 rounded-full object-cover border-4 border-gold shadow-lg"
            />
            <div className="flex-1">
              <p className="font-bold text-navy text-lg">Pr. Valdinei da Conceição Santos</p>
              <p className="font-semibold text-navy">Pra. Thelma Santana Menezes Santos</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                <TranslatedText>Diretores do SISCOF • Presidentes da IADMA e CEMADEB</TranslatedText><br />
                <TranslatedText>Diretores Fundadores da FAITEL • Diretores da CFIDH</TranslatedText><br />
                <TranslatedText>Diretores do SETEPOS e SECC</TranslatedText>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-1 text-xs text-gold">
          <RefreshCw className="h-3 w-3" />
          <TranslatedText>Mensagem gerada por IA</TranslatedText>
        </div>
      </CardContent>
    </Card>
  );
}
