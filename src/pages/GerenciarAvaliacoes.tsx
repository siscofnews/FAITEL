import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ArrowLeft, FileQuestion, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Evaluation {
    id: string;
    lesson_id: string;
    title: string;
    description: string;
    type: string;
    passing_grade: number;
    time_limit_minutes: number | null;
    created_at: string;
}

export default function GerenciarAvaliacoes() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "quiz",
        passing_grade: 70,
        time_limit_minutes: 0,
    });

    useEffect(() => {
        if (lessonId) {
            loadEvaluations();
        }
    }, [lessonId]);

    const loadEvaluations = async () => {
        try {
            const { data, error } = await supabase
                .from("course_evaluations")
                .select("*")
                .eq("lesson_id", lessonId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setEvaluations(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar avaliações",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const evaluationData = {
                ...formData,
                lesson_id: lessonId,
                time_limit_minutes: formData.time_limit_minutes || null,
            };

            if (editingEvaluation) {
                const { error } = await supabase
                    .from("course_evaluations")
                    .update(evaluationData)
                    .eq("id", editingEvaluation.id);

                if (error) throw error;
                toast({ title: "Avaliação atualizada!" });
            } else {
                const { error } = await supabase
                    .from("course_evaluations")
                    .insert([evaluationData]);

                if (error) throw error;
                toast({ title: "Avaliação criada!" });
            }

            setDialogOpen(false);
            resetForm();
            loadEvaluations();
        } catch (error: any) {
            toast({
                title: "Erro ao salvar avaliação",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deletar esta avaliação? As questões também serão deletadas.")) return;

        try {
            const { error } = await supabase
                .from("course_evaluations")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast({ title: "Avaliação deletada" });
            loadEvaluations();
        } catch (error: any) {
            toast({
                title: "Erro ao deletar",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (evaluation: Evaluation) => {
        setEditingEvaluation(evaluation);
        setFormData({
            title: evaluation.title,
            description: evaluation.description,
            type: evaluation.type,
            passing_grade: evaluation.passing_grade,
            time_limit_minutes: evaluation.time_limit_minutes || 0,
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            type: "quiz",
            passing_grade: 70,
            time_limit_minutes: 0,
        });
        setEditingEvaluation(null);
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            quiz: "Quiz",
            essay: "Dissertativa",
            assignment: "Trabalho",
            self_evaluation: "Auto-Avaliação",
        };
        return labels[type] || type;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(-1)}
                                className="mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <h1 className="text-3xl font-bold">Gerenciar Avaliações</h1>
                            <p className="text-gray-600">Crie provas e trabalhos para esta aula</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-600">
                        Total: <span className="font-semibold">{evaluations.length}</span> avaliações
                    </p>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Avaliação
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingEvaluation ? "Editar Avaliação" : "Criar Nova Avaliação"}
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Título *</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Quiz - Módulo 1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Descrição</label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tipo</label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="quiz">Quiz (Múltipla Escolha)</SelectItem>
                                                <SelectItem value="essay">Dissertativa</SelectItem>
                                                <SelectItem value="assignment">Trabalho</SelectItem>
                                                <SelectItem value="self_evaluation">Auto-Avaliação</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Nota Mínima (%)</label>
                                        <Input
                                            type="number"
                                            value={formData.passing_grade}
                                            onChange={(e) => setFormData({ ...formData, passing_grade: parseInt(e.target.value) })}
                                            min="0"
                                            max="100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Tempo Limite (min)
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.time_limit_minutes}
                                            onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                                            min="0"
                                            placeholder="0 = sem limite"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end pt-4">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        {editingEvaluation ? "Salvar Alterações" : "Criar Avaliação"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : evaluations.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileQuestion className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Nenhuma avaliação criada</h3>
                        <p className="text-gray-600 mb-4">Crie a primeira avaliação para esta aula</p>
                        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Avaliação
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {evaluations.map((evaluation) => (
                            <Card key={evaluation.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge>{getTypeLabel(evaluation.type)}</Badge>
                                    </div>
                                    <CardTitle className="text-lg">{evaluation.title}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex items-center gap-2">
                                            <FileQuestion className="h-4 w-4 text-gray-400" />
                                            <span>Nota mínima: {evaluation.passing_grade}%</span>
                                        </div>
                                        {evaluation.time_limit_minutes && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>Tempo: {evaluation.time_limit_minutes} minutos</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => openEditDialog(evaluation)}
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Editar
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(evaluation.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-full mt-2"
                                        onClick={() => navigate(`/avaliacao/${evaluation.id}/questoes`)}
                                    >
                                        Gerenciar Questões →
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
