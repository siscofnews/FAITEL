import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Church, MapPin, Users, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';

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

interface NewsSectionProps {
  title: string;
  icon: 'globe' | 'church' | 'map' | 'users';
  news: NewsItem[];
  isLoading?: boolean;
  color?: string;
}

const iconMap = {
  globe: Globe,
  church: Church,
  map: MapPin,
  users: Users
};

export function NewsSection({ title, icon, news, isLoading, color = 'gold' }: NewsSectionProps) {
  const Icon = iconMap[icon];

  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 bg-${color}/10 rounded-xl`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold"><TranslatedText>{title}</TranslatedText></h2>
        </div>
        <Link 
          to="#" 
          className="text-gold hover:underline flex items-center gap-1 text-sm font-medium"
        >
          <TranslatedText>Ver mais</TranslatedText> <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {news.map((item) => (
          <Card 
            key={item.id} 
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md"
          >
            <div className="relative overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <Badge className="absolute top-3 left-3 bg-gold text-navy text-xs">
                {item.category}
              </Badge>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40">
                <ExternalLink className="h-4 w-4 text-white" />
              </button>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {item.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-gold">{item.source}</span>
                <span>{item.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
