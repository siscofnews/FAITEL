import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GraduationCap, Download, Search, CheckCircle, Home, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
    id: string;
    certificate_number: string;
    qr_code: string;
    student_name: string;
    course_name: string;
    final_grade: number;
    issued_date: string;
    duration_hours: number | null;
    is_valid: boolean;
    pdf_url: string | null;
}

export default function Certificados() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchNumber, setSearchNumber] = useState("");
    const [validatingCertificate, setValidatingCertificate] = useState<Certificate | null>(null);

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("student_certificates")
                .select("*")
                .order("issued_date", { ascending: false });

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

    const validateCertificate = async () => {
        if (!searchNumber.trim()) {
            toast({
                title: "Digite um número de certificado",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data, error } = await supabase
                .from("student_certificates")
                .eq("certificate_number", searchNumber.trim().toUpperCase())
                .single();

            if (error || !data) {
                toast({
                    title: "Certificado não encontrado",
                    description: "Verifique o número e tente novamente",
                    variant: "destructive",
                });
                setValidatingCertificate(null);
                return;
            }

            setValidatingCertificate(data);
            toast({
                title: data.is_valid ? "Certificado válido!" : "Certificado revogado",
                description: data.is_valid
                    ? "Este certificado é autêntico"
                    : "Este certificado foi revogado",
                variant: data.is_valid ? "default" : "destructive",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao validar",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <Award className="h-8 w-8 text-amber-500" />
                                Meus Certificados
                            </h1>
                            <p className="text-gray-600 mt-1">Certificados de conclusão de cursos</p>
                        </div>
                        <Button onClick={() => navigate("/dashboard")} variant="outline">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Certificate Validation */}
                <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Validar Certificado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Digite o número do certificado (ex: CERT-00000001)"
                                value={searchNumber}
                                onChange={(e) => setSearchNumber(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && validateCertificate()}
                            />
                            <Button onClick={validateCertificate}>
                                <Search className="h-4 w-4 mr-2" />
                                Validar
                            </Button>
                        </div>

                        {validatingCertificate && (
                            <div className="mt-4 p-4 bg-white rounded-lg border">
                                <div className="flex items-start gap-4">
                                    {validatingCertificate.is_valid ? (
                                        <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <div className="h-8 w-8 flex-shrink-0 text-red-500">❌</div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{validatingCertificate.student_name}</h3>
                                        <p className="text-gray-600">{validatingCertificate.course_name}</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p>
                                                <span className="font-semibold">Número:</span>{" "}
                                                {validatingCertificate.certificate_number}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Emissão:</span>{" "}
                                                {new Date(validatingCertificate.issued_date).toLocaleDateString()}
                                            </p>
                                            <p>
                                                <span className="font-semibold">Nota Final:</span>{" "}
                                                {validatingCertificate.final_grade}
                                            </p>
                                            {validatingCertificate.duration_hours && (
                                                <p>
                                                    <span className="font-semibold">Carga Horária:</span>{" "}
                                                    {validatingCertificate.duration_hours}h
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* My Certificates */}
                <h2 className="text-2xl font-bold mb-4">Meus Certificados</h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
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
                        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold mb-2">Nenhum certificado ainda</h3>
                        <p className="text-gray-600 mb-4">
                            Complete um curso para receber seu primeiro certificado
                        </p>
                        <Button onClick={() => navigate("/escola-culto")}>
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Explorar Cursos
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert) => (
                            <Card
                                key={cert.id}
                                className="hover:shadow-lg transition-shadow border-2 border-amber-100"
                            >
                                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                                    <div className="flex items-start justify-between mb-2">
                                        <GraduationCap className="h-8 w-8 text-amber-600" />
                                        {cert.is_valid ? (
                                            <Badge className="bg-green-500">Válido</Badge>
                                        ) : (
                                            <Badge variant="destructive">Revogado</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">{cert.course_name}</CardTitle>
                                    <p className="text-sm text-gray-600">{cert.student_name}</p>
                                </CardHeader>

                                <CardContent className="pt-4">
                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Número:</span>
                                            <span className="font-mono font-semibold">
                                                {cert.certificate_number}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Emissão:</span>
                                            <span>{new Date(cert.issued_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nota Final:</span>
                                            <span className="font-semibold">{cert.final_grade}</span>
                                        </div>
                                        {cert.duration_hours && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Carga Horária:</span>
                                                <span>{cert.duration_hours}h</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button className="w-full" variant="outline" disabled={!cert.pdf_url}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Baixar PDF
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
