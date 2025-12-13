import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { loadAgendaPublicaCemadeb } from "@/wiring/agenda";

export default function AgendaPublicaCemadeb() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const data = await loadAgendaPublicaCemadeb();
        setEventos(data);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calendar className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-gray-800">Agenda Pública CEMADEB</h1>
          </div>
          <p className="text-gray-600">Eventos publicados da CEMADEB</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {isLoading ? (
            <Card><CardContent className="p-6">Carregando...</CardContent></Card>
          ) : error ? (
            <Card><CardContent className="p-6 text-destructive">Erro ao carregar eventos. Verifique a conexão.</CardContent></Card>
          ) : eventos.length === 0 ? (
            <Card><CardContent className="p-6">Nenhum evento publicado.</CardContent></Card>
          ) : (
            eventos.map((ev) => (
              <Card key={ev.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{ev.nome_evento || ev.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{format(parseISO(ev.data_inicio), "dd/MM/yyyy", { locale: ptBR })}</Badge>
                    {ev.local && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.local}</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm">Detalhes</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

