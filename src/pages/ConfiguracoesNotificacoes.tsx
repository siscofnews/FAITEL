import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Mail, MessageSquare, Save, Clock } from "lucide-react";

export default function ConfiguracoesNotificacoes() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState({
        whatsapp: "",
        email: "",
        notify_new_classes: true,
        notify_evaluations: true,
        notify_enrollment_status: true,
        notify_new_content: true,
        days_before_class: 1,
        days_before_evaluation: 3,
        preferred_time: "09:00:00"
    });

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("notification_preferences")
                .select("*")
                .eq("student_id", user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setPreferences({
                    whatsapp: data.whatsapp || "",
                    email: data.email || "",
                    notify_new_classes: data.notify_new_classes,
                    notify_evaluations: data.notify_evaluations,
                    notify_enrollment_status: data.notify_enrollment_status,
                    notify_new_content: data.notify_new_content,
                    days_before_class: data.days_before_class,
                    days_before_evaluation: data.days_before_evaluation,
                    preferred_time: data.preferred_time || "09:00:00"
                });
            }
        } catch (error: any) {
            console.error("Erro ao carregar preferências:", error);
            toast({
                title: "Erro ao carregar preferências",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { error } = await supabase
                .from("notification_preferences")
                .upsert({
                    student_id: user.id,
                    ...preferences
                }, {
                    onConflict: 'student_id'
                });

            if (error) throw error;

            toast({
                title: "Preferências salvas!",
                description: "Suas configurações de notificação foram atualizadas.",
            });
        } catch (error: any) {
            console.error("Erro ao salvar preferências:", error);
            toast({
                title: "Erro ao salvar preferências",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Configurações de Notificações
                    </h1>
                    <p className="text-lg md:text-xl mt-3 text-slate-600 font-medium">
                        Personalize como você recebe lembretes e avisos
                    </p>
                </div>

                {/* Contatos */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <MessageSquare className="w-6 h-6 text-indigo-600" />
                            Informações de Contato
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="whatsapp" className="text-base font-semibold">
                                WhatsApp (com código do país)
                            </Label>
                            <Input
                                id="whatsapp"
                                value={preferences.whatsapp}
                                onChange={(e) => setPreferences(prev => ({ ...prev, whatsapp: e.target.value }))}
                                placeholder="+55 11 98765-4321"
                                className="text-base"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-base font-semibold">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={preferences.email}
                                onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="seu@email.com"
                                className="text-base"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Preferências de Notificação */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Bell className="w-6 h-6 text-purple-600" />
                            O que você deseja receber?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                    <Label htmlFor="notify_new_classes" className="text-base font-semibold cursor-pointer">
                                        Novas Aulas Disponíveis
                                    </Label>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Receba alerta quando uma nova aula for publicada
                                    </p>
                                </div>
                                <Switch
                                    id="notify_new_classes"
                                    checked={preferences.notify_new_classes}
                                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notify_new_classes: checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                                <div>
                                    <Label htmlFor="notify_evaluations" className="text-base font-semibold cursor-pointer">
                                        Avaliações e Provas
                                    </Label>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Lembretes de provas e trabalhos próximos
                                    </p>
                                </div>
                                <Switch
                                    id="notify_evaluations"
                                    checked={preferences.notify_evaluations}
                                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notify_evaluations: checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                                <div>
                                    <Label htmlFor="notify_enrollment_status" className="text-base font-semibold cursor-pointer">
                                        Status de Matrícula
                                    </Label>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Avisos sobre aprovação/rejeição de matrículas
                                    </p>
                                </div>
                                <Switch
                                    id="notify_enrollment_status"
                                    checked={preferences.notify_enrollment_status}
                                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notify_enrollment_status: checked }))}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                                <div>
                                    <Label htmlFor="notify_new_content" className="text-base font-semibold cursor-pointer">
                                        Novo Conteúdo
                                    </Label>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Notificações de materiais e recursos adicionados
                                    </p>
                                </div>
                                <Switch
                                    id="notify_new_content"
                                    checked={preferences.notify_new_content}
                                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notify_new_content: checked }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Antecedência */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <Clock className="w-6 h-6 text-emerald-600" />
                            Antecedência dos Lembretes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Lembrar de aulas com quantos dias de antecedência?
                            </Label>
                            <Select
                                value={preferences.days_before_class.toString()}
                                onValueChange={(value) => setPreferences(prev => ({ ...prev, days_before_class: parseInt(value) }))}
                            >
                                <SelectTrigger className="text-base">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">No mesmo dia</SelectItem>
                                    <SelectItem value="1">1 dia antes</SelectItem>
                                    <SelectItem value="2">2 dias antes</SelectItem>
                                    <SelectItem value="3">3 dias antes</SelectItem>
                                    <SelectItem value="7">1 semana antes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Lembrar de avaliações com quantos dias de antecedência?
                            </Label>
                            <Select
                                value={preferences.days_before_evaluation.toString()}
                                onValueChange={(value) => setPreferences(prev => ({ ...prev, days_before_evaluation: parseInt(value) }))}
                            >
                                <SelectTrigger className="text-base">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 dia antes</SelectItem>
                                    <SelectItem value="2">2 dias antes</SelectItem>
                                    <SelectItem value="3">3 dias antes</SelectItem>
                                    <SelectItem value="7">1 semana antes</SelectItem>
                                    <SelectItem value="14">2 semanas antes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Horário preferido para receber notificações
                            </Label>
                            <Input
                                type="time"
                                value={preferences.preferred_time}
                                onChange={(e) => setPreferences(prev => ({ ...prev, preferred_time: e.target.value }))}
                                className="text-base"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Botão Salvar */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        size="lg"
                        className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl shadow-xl"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {saving ? "Salvando..." : "Salvar Configurações"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
