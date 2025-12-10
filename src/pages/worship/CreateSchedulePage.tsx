import { useState, useEffect } from "react";
import { ScheduleForm } from "@/components/worship/ScheduleForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function CreateSchedulePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch churches the user has access to
    const { data: churches, isLoading } = useQuery({
        queryKey: ["user-churches-for-schedule", user?.id],
        queryFn: async () => {
            if (!user) return [];
            // TODO: This should ideally use a 'permissions' or 'user_roles' check, 
            // but for now we look for churches where the user is linked (e.g. pastor/admin)
            // OR simply fetch all if super_admin.
            // Simplified: Fetch APPROVED churches.
            const { data, error } = await supabase
                .from("churches")
                .select("id, nome_fantasia")
                .eq("is_approved", true)
                .limit(1); // For now, just getting one to default. In real hierarchy, we'd list them.

            if (error) throw error;
            return data || [];
        },
        enabled: !!user,
    });

    const defaultChurchId = churches?.[0]?.id;

    if (isLoading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    }

    if (!defaultChurchId) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-destructive">Acesso Negado ou Nenhuma Igreja Encontrada</h2>
                    <p>Você precisa estar vinculado a uma igreja para criar escalas.</p>
                    <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-4">Voltar</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate("/escalas")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <h1 className="text-2xl font-bold">Criar Nova Escala</h1>
            </div>

            <ScheduleForm defaultChurchId={defaultChurchId} />
        </div>
    );
}
