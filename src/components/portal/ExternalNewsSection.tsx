import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useExternalNews } from '@/hooks/useExternalNews';
import { TranslatedText } from '@/components/TranslatedText';

export const ExternalNewsSection = () => {
  const { news, isLoading, error } = useExternalNews('all');

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="h-6 w-6 text-gold" />
          <h2 className="text-2xl font-bold text-foreground"><TranslatedText>Notícias Externas</TranslatedText></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (error || news.length === 0) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="h-6 w-6 text-gold" />
          <h2 className="text-2xl font-bold text-foreground"><TranslatedText>Notícias Externas</TranslatedText></h2>
        </div>
        <Card className="p-8 text-center">
          <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {error || <TranslatedText>Carregando notícias dos parceiros...</TranslatedText>}
          </p>
        </Card>
      </section>
    );
  }

  // Group news by source
  const jmNews = news.filter(n => n.source === 'JM Notícia');
  const fuxicoNews = news.filter(n => n.source === 'Fuxico Gospel');

  return (
    <section className="py-8 space-y-8">
      {/* JM Notícia Section */}
      {jmNews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-foreground">JM Notícia</h2>
            </div>
            <a 
              href="https://jmnoticia.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
            >
              <TranslatedText>Ver mais</TranslatedText> <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jmNews.slice(0, 6).map((item) => (
              <NewsCard key={item.id} item={item} accentColor="blue" />
            ))}
          </div>
        </div>
      )}

      {/* Fuxico Gospel Section */}
      {fuxicoNews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-foreground">Fuxico Gospel</h2>
            </div>
            <a 
              href="https://fuxicogospel.com.br/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-purple-500 hover:text-purple-600 flex items-center gap-1"
            >
              <TranslatedText>Ver mais</TranslatedText> <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fuxicoNews.slice(0, 6).map((item) => (
              <NewsCard key={item.id} item={item} accentColor="purple" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

interface NewsCardProps {
  item: {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    category: string;
    source: string;
    date: string;
    url: string;
  };
  accentColor: 'blue' | 'purple';
}

const NewsCard = ({ item, accentColor }: NewsCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500 hover:border-blue-500/50',
    purple: 'bg-purple-500 hover:border-purple-500/50'
  };

  return (
    <a 
      href={item.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className={`overflow-hidden h-full transition-all duration-300 hover:shadow-lg ${colorClasses[accentColor]}`}>
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Badge className={`absolute bottom-2 left-2 ${colorClasses[accentColor].split(' ')[0]} text-white`}>
            {item.source}
          </Badge>
        </div>
        <CardContent className="p-4 bg-card">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{item.date}</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
};
