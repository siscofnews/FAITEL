import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Award, Download, CheckCircle, Calendar, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Certificados() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { data: member } = await supabase
                .from("members")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!member) throw new Error("Membro não encontrado");

            const { data, error } = await supabase
                .from("certificates")
                .select(`
          *,
          course:courses (name, category),
          class:classes (name)
        `)
                .eq("student_id", member.id)
                .eq("is_valid", true)
                .order("issued_at", { ascending: false });

            if (error) throw error;
            setCertificates(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar certificados",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (cert: any) => {
        toast({
            title: "Download em breve",
            description: "A funcionalidade de download será implementada em breve.",
        });
    };

    const handleValidate = (certNumber: string) => {
        toast({
            title: "Validar Certificado",
            description: `Certificado: ${certNumber} - Válido!`,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-purple-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Meus Certificados</h1>
                            <p className="text-sm text-gray-600">Certificados digitais conquistados</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate("/")} variant="outline" size="sm">
                        <Home className="h-4 w-4 mr-2" />
                        Home
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Total de Certificados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">{certificates.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Cursos Concluídos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{certificates.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Horas Certificadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {certificates.reduce((sum, c) => sum + (c.total_hours || 0), 0)}h
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Certificates List */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Certificados Emitidos</h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardHeader>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : certificates.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-xl font-semibold mb-2">Nenhum certificado emitido</h3>
                            <p className="text-gray-600 mb-4">
                                Complete seus cursos para receber certificados digitais
                            </p>
                            <Button onClick={() => navigate("/escola-culto")}>
                                Ver Cursos Disponíveis
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificates.map((cert) => (
                                <Card
                                    key={cert.id}
                                    className="hover:shadow-lg transition-shadow border-2 border-purple-100"
                                >
                                    <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <Badge className="bg-white text-purple-600 mb-2">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Certificado Válido
                                                </Badge>
                                                <CardTitle className="text-xl mt-2">
                                                    {cert.course_name}
                                                </CardTitle>
                                                <CardDescription className="text-purple-100 mt-1">
                                                    {cert.church_name}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="pt-6 space-y-4">
                                        {/* Certificate Info */}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Aluno:</span>
                                                <span className="font-medium">{cert.student_name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Número:</span>
                                                <span className="font-mono font-medium">{cert.certificate_number}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Conclusão:</span>
                                                <span className="font-medium">
                                                    {new Date(cert.completion_date).toLocaleDateString("pt-BR")}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Carga Horária:</span>
                                                <span className="font-medium">{cert.total_hours}h</span>
                                            </div>
                                            {cert.final_grade && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Nota Final:</span>
                                                    <span className="font-medium text-green-600">{cert.final_grade}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Professor:</span>
                                                <span className="font-medium">{cert.teacher_name || "N/A"}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t">
                                            <Button
                                                onClick={() => handleDownload(cert)}
                                                className="flex-1"
                                                variant="default"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Baixar PDF
                                            </Button>
                                            <Button
                                                onClick={() => handleValidate(cert.certificate_number)}
                                                variant="outline"
                                            >
                                                <QrCode className="h-4 w-4 mr-2" />
                                                Validar
                                            </Button>
                                        </div>

                                        {/* Issued Date */}
                                        <div className="text-xs text-gray-500 flex items-center gap-1 justify-center pt-2">
                                            <Calendar className="h-3 w-3" />
                                            Emitido em {new Date(cert.issued_at).toLocaleDateString("pt-BR")}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Card */}
                {certificates.length > 0 && (
                    <Card className="mt-8 bg-purple-50 border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-900">
                                <QrCode className="h-5 w-5" />
                                Sobre os Certificados
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-purple-800">
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Todos os certificados possuem código único de validação</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Você pode validar a autenticidade através do QR Code</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Os certificados são emitidos automaticamente ao concluir o curso</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>PDF disponível para download a qualquer momento</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
