import { useState } from "react";
import { format, isSameDay, isThisWeek, isThisMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, MapPin, Music, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
interface PublicSchedule {
    id: string;
    date: string;
    time: string | null;
    church: { nome_fantasia: string; cidade: string };
    service_type: { name: string };
    assignments: {
        role: { name: string };
        member: { full_name: string } | null;
        custom_name: string | null;
    }[];
}

export default function PublicSchedulePage() {
    const [filter, setFilter] = useState<'today' | 'week' | 'month'>('week');

    const { data: schedules, isLoading } = useQuery({
        queryKey: ["public-schedules"],
        queryFn: async () => {
            const now = new Date();
            // Fetch schedules from today onwards
            const { data, error } = await supabase
                .from("worship_schedules")
                .select(`
          id, date, time,
          church:churches(nome_fantasia, cidade),
          service_type:service_types(name),
          assignments:worship_assignments(
            role:assignment_roles(name),
            member:members(full_name),
            custom_name
          )
        `)
                .eq("status", "published")
                .gte("date", now.toISOString().split('T')[0])
                .order("date", { ascending: true })
                .limit(20);

            if (error) throw error;
            return data as unknown as PublicSchedule[];
        }
    });

    // Filter Logic
    const todaySchedules = schedules?.filter(s => isSameDay(parseISO(s.date), new Date())) || [];
    const weekSchedules = schedules?.filter(s => isThisWeek(parseISO(s.date))) || [];
    const monthSchedules = schedules?.filter(s => isThisMonth(parseISO(s.date))) || [];

    const renderScheduleCard = (schedule: PublicSchedule, featured: boolean = false) => {
        const mainRoles = ["Dirigente", "Pregador", "Líder de Louvor"];
        const featuredAssignments = schedule.assignments.filter(a => mainRoles.includes(a.role?.name));

        return (
            <Card key={schedule.id} className={`overflow-hidden transition-all hover:shadow-lg ${featured ? 'border-l-4 border-l-primary shadow-md' : ''}`}>
                <CardHeader className={`${featured ? 'bg-primary/5 pb-2' : 'pb-2'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="outline" className="mb-2 bg-white">{schedule.service_type?.name || "Culto"}</Badge>
                            <CardTitle className={`font-display ${featured ? 'text-2xl' : 'text-lg'}`}>
                                {schedule.church?.nome_fantasia}
                            </CardTitle>
                            <div className="flex items-center text-muted-foreground text-sm mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {schedule.church?.cidade || "Local não informado"}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex flex-col items-end">
                                <span className={`font-bold text-primary ${featured ? 'text-xl' : 'text-md'}`}>
                                    {format(parseISO(schedule.date), "dd/MM", { locale: ptBR })}
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">
                                    {format(parseISO(schedule.date), "EEEE", { locale: ptBR })}
                                </span>
                                {schedule.time && (
                                    <Badge variant="secondary" className="mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {schedule.time}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    {featuredAssignments.length > 0 ? (
                        featuredAssignments.map((a, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                {a.role.name === "Pregador" ? <User className="w-4 h-4 text-purple-500" /> :
                                    a.role.name === "Dirigente" ? <User className="w-4 h-4 text-blue-500" /> :
                                        <Music className="w-4 h-4 text-pink-500" />}
                                <span className="font-semibold text-muted-foreground">{a.role.name}:</span>
                                <span className="font-medium text-foreground">{a.member?.full_name || a.custom_name}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-muted-foreground italic">Detalhes da escala não disponíveis.</p>
                    )}
                </CardContent>
                {featured && (
                    <CardFooter className="bg-muted/30 pt-4 pb-4 flex justify-center">
                        <Button variant="default" className="w-full">Ver Escala Completa</Button>
                    </CardFooter>
                )}
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white py-12 px-4 shadow-xl">
                <div className="container mx-auto max-w-6xl">
                    <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">Escalas de Culto</h1>
                    <p className="text-blue-100 max-w-2xl text-lg">
                        Acompanhe a programação oficial das igrejas. Veja quem estará ministrando, dirigindo e louvando nos próximos cultos.
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 -mt-8">

                {/* SECTION: TODAY (Featured) */}
                {isLoading ? (
                    <Skeleton className="h-64 w-full rounded-xl" />
                ) : todaySchedules.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-1 bg-red-500 rounded-full"></div>
                            <h2 className="text-2xl font-bold bg-white px-4 py-2 rounded-lg shadow-sm">Acontece Hoje</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {todaySchedules.map(s => renderScheduleCard(s, true))}
                        </div>
                    </div>
                )}

                {/* SECTION: THIS WEEK */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800">Destaques da Semana</h2>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
                        </div>
                    ) : weekSchedules.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {weekSchedules.filter(s => !todaySchedules.find(t => t.id === s.id)).map(s => renderScheduleCard(s, false))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground p-4 bg-white rounded-lg border text-center">Nenhuma escala programada para esta semana.</p>
                    )}
                </div>

                {/* SECTION: MONTH */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-1 bg-green-500 rounded-full"></div>
                            <h2 className="text-xl font-bold text-slate-800">Próximos Cultos (Este Mês)</h2>
                        </div>
                        <Button variant="ghost">Ver Calendário Completo</Button>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <Skeleton className="h-20 w-full" />
                        ) : (
                            monthSchedules
                                .filter(s => !weekSchedules.find(w => w.id === s.id))
                                .map(s => (
                                    <div key={s.id} className="bg-white p-4 rounded-lg border hover:border-blue-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 p-3 rounded-lg text-center min-w-[60px]">
                                                <span className="block text-sm font-bold text-slate-600">{format(parseISO(s.date), "dd", { locale: ptBR })}</span>
                                                <span className="block text-xs uppercase text-slate-400">{format(parseISO(s.date), "MMM", { locale: ptBR })}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">{s.church?.nome_fantasia}</h3>
                                                <p className="text-sm text-muted-foreground">{s.service_type?.name} • {s.time || "Horário a definir"}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Detalhes</Button>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
