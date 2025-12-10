import { Calendar, MapPin, Clock, Globe, RefreshCw, ChevronRight, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGospelEvents } from "@/hooks/useGospelEvents";
import { TranslatedText } from "@/components/TranslatedText";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eventTypes = [
  { value: "all", label: "Todos os Tipos" },
  { value: "Conferência", label: "Conferência" },
  { value: "Show", label: "Show" },
  { value: "Congresso", label: "Congresso" },
  { value: "Festival", label: "Festival" },
  { value: "Summit", label: "Summit" },
  { value: "Worship", label: "Worship" },
];

const regions = [
  { value: "all", label: "Todas as Regiões" },
  { value: "Brasil", label: "🇧🇷 Brasil" },
  { value: "Estados Unidos", label: "🇺🇸 Estados Unidos" },
  { value: "Austrália", label: "🇦🇺 Austrália" },
  { value: "Reino Unido", label: "🇬🇧 Reino Unido" },
  { value: "Nigéria", label: "🇳🇬 Nigéria" },
];

export const GospelEventsSection = () => {
  const { events, isLoading, error, lastUpdated, refetch } = useGospelEvents('all');
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesType = selectedType === "all" || event.type === selectedType;
      const matchesRegion = selectedRegion === "all" || event.country === selectedRegion;
      return matchesType && matchesRegion;
    });
  }, [events, selectedType, selectedRegion]);

  const brazilEvents = filteredEvents.filter(e => e.country === 'Brasil').slice(0, 6);
  const internationalEvents = filteredEvents.filter(e => e.country !== 'Brasil').slice(0, 5);

  if (error && events.length === 0) {
    return (
      <section className="mb-12">
        <div className="text-center py-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">
            <TranslatedText>Não foi possível carregar os eventos. Tentando novamente...</TranslatedText>
          </p>
          <Button variant="outline" onClick={refetch} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            <TranslatedText>Tentar novamente</TranslatedText>
          </Button>
        </div>
      </section>
    );
  }


  return (
    <section className="mb-12">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-1 h-8 bg-gold rounded-full"></span>
            <Globe className="h-6 w-6 text-gold" />
            <TranslatedText>Eventos Gospel ao Redor do Mundo</TranslatedText>
          </h2>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <RefreshCw className="h-3 w-3" />
              <TranslatedText>Atualizado automaticamente a cada 6 horas</TranslatedText>
              <span>• Última atualização: {new Date(lastUpdated).toLocaleString('pt-BR')}</span>
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Tipo de Evento" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Filter by Region */}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Link to="/eventos-iadma">
            <Button variant="outline" size="sm" className="text-gold hover:text-gold">
              <TranslatedText>Ver todos</TranslatedText>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* No results message */}
      {!isLoading && filteredEvents.length === 0 && (
        <div className="text-center py-8 bg-muted/50 rounded-lg mb-8">
          <p className="text-muted-foreground">
            <TranslatedText>Nenhum evento encontrado com os filtros selecionados.</TranslatedText>
          </p>
          <Button 
            variant="link" 
            onClick={() => { setSelectedType("all"); setSelectedRegion("all"); }}
            className="mt-2"
          >
            <TranslatedText>Limpar filtros</TranslatedText>
          </Button>
        </div>
      )}

      {/* Brazil Events */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-green-600">🇧🇷</span>
          <TranslatedText>Eventos no Brasil</TranslatedText>
        </h3>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brazilEvents.map((event) => (
              <Card 
                key={event.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                    {event.type}
                  </Badge>
                  <Badge className="absolute top-3 right-3 bg-white/90 text-foreground text-xs">
                    {event.source}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                    {event.title}
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gold" />
                      <span>{event.date}</span>
                      <Clock className="h-3 w-3 text-gold ml-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gold" />
                      <span>{event.city}, {event.state}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* International Events */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <TranslatedText>Eventos Internacionais</TranslatedText>
        </h3>
        
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <CardContent className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {internationalEvents.map((event) => (
              <Card 
                key={event.id} 
                className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-xs">
                    {event.country}
                  </Badge>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-gold transition-colors">
                    {event.title}
                  </h4>
                  <div className="text-xs text-muted-foreground">
                    <span>{event.date}</span> • <span>{event.city}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
