import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, GraduationCap, ArrowRight } from "lucide-react";

export default function BannerPosGraduacao() {
    const cursos = [
        {
            nome: "Capelania",
            horas: "360 horas",
            duracao: "8 meses",
            cor: "from-blue-600 to-blue-800"
        },
        {
            nome: "Ciências da Religião",
            horas: "360 horas",
            duracao: "8 meses",
            cor: "from-purple-600 to-purple-800"
        },
        {
            nome: "Docência em Teologia",
            horas: "360 horas",
            duracao: "6 meses",
            cor: "from-green-600 to-green-800"
        },
        {
            nome: "Missiologia",
            horas: "360 horas",
            duracao: "8 meses",
            cor: "from-orange-600 to-orange-800"
        }
    ];

    return (
        <div className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 py-12 px-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <GraduationCap className="h-10 w-10 text-yellow-400" />
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            CURSOS EM ALTA
                        </h2>
                    </div>
                    <p className="text-xl text-blue-100">
                        Pós-Graduação FAITEL - Especialize-se em 6 a 8 meses
                    </p>
                </div>

                {/* Cards dos Cursos */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {cursos.map((curso, idx) => (
                        <Card
                            key={idx}
                            className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >
                            {/* Header do Card */}
                            <div className={`bg-gradient-to-r ${curso.cor} p-6 text-white`}>
                                <p className="text-sm font-semibold uppercase tracking-wide mb-2">
                                    Pós-Graduação em
                                </p>
                                <h3 className="text-2xl font-bold leading-tight min-h-[4rem] flex items-center">
                                    {curso.nome}
                                </h3>
                            </div>

                            {/* Body do Card */}
                            <CardContent className="p-6 bg-white space-y-4">
                                {/* Horas */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Carga Horária</p>
                                        <p className="font-bold text-gray-900">{curso.horas}</p>
                                    </div>
                                </div>

                                {/* Duração */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Calendar className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Duração</p>
                                        <p className="font-bold text-gray-900">{curso.duracao}</p>
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                                {/* Botão */}
                                <Button
                                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-blue-900 font-bold"
                                    size="lg"
                                >
                                    INSCREVA-SE
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>

                            {/* Footer destacando valor */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 text-center border-t">
                                <p className="text-xs text-gray-600">
                                    ⭐ <strong>100% EAD</strong> | Certificado Reconhecido
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* CTA Final */}
                <div className="text-center space-y-4">
                    <p className="text-white text-lg">
                        📚 Todas as pós-graduações incluem <strong className="text-yellow-400">material didático completo + biblioteca virtual</strong>
                    </p>
                    <Button
                        size="lg"
                        className="bg-white text-blue-900 hover:bg-gray-100 font-bold text-lg px-12 py-6"
                    >
                        Ver Todos os Cursos de Pós-Graduação
                        <GraduationCap className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
