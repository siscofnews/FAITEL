import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Clock, Award, CheckCircle2, GraduationCap } from "lucide-react";

// Importar imagens dos livros
import artePastorear from "@/assets/livros/arte-de-pastorear.png";
import bibliaCodigos from "@/assets/livros/biblia-codigos.png";
import equilibrioPastoral from "@/assets/livros/equilibrio-pastoral.png";
import pilaresMinisterial from "@/assets/livros/pilares-ministerial.png";

interface Disciplina {
    nome: string;
    cargaHoraria: string;
    descricao: string;
}

interface Modulo {
    id: number;
    img: string;
    title: string;
    autor?: string;
    nivel: string;
    duracao: string;
    cargaHorariaTotal: string;
    descricao: string;
    disciplinas: Disciplina[];
    certificacao: string;
}

const modulos: Modulo[] = [
    {
        id: 1,
        img: bibliaCodigos,
        title: "Módulo 1 - Teologia Média",
        autor: "Bel.Pr. Valdinei da Conceição Santos",
        nivel: "Curso Médio em Teologia",
        duracao: "16 semanas",
        cargaHorariaTotal: "200 horas",
        descricao: "Primeiro módulo do curso de Teologia Média, abordando fundamentos essenciais da fé cristã com cinco disciplinas complementares.",
        disciplinas: [
            {
                nome: "Educação Cristã",
                cargaHoraria: "40h",
                descricao: "Fundamentos e métodos de ensino cristão, pedagogia bíblica e desenvolvimento de currículos para escola dominical e ministérios de ensino."
            },
            {
                nome: "Hamartiologia",
                cargaHoraria: "40h",
                descricao: "Estudo sobre a doutrina do pecado, sua origem, natureza, consequências e a provisão divina para redenção através de Cristo."
            },
            {
                nome: "Missiologia",
                cargaHoraria: "40h",
                descricao: "Estudo da missão da igreja, estratégias de evangelização, plantação de igrejas e missões transculturais."
            },
            {
                nome: "Pneumatologia",
                cargaHoraria: "40h",
                descricao: "Doutrina do Espírito Santo, seus atributos, obras, dons espirituais e atuação na vida do crente e da igreja."
            },
            {
                nome: "Escatologia",
                cargaHoraria: "40h",
                descricao: "Estudo das últimas coisas: arrebatamento, tribulação, milênio, juízo final, céu e inferno segundo as Escrituras."
            }
        ],
        certificacao: "Certificado de Conclusão do Módulo 1 - Teologia Média"
    },
    {
        id: 2,
        img: pilaresMinisterial,
        title: "Módulo 2 - Fundamentos Ministeriais",
        autor: "Bel.Pr. Valdinei da Conceição Santos",
        nivel: "Curso Médio em Teologia",
        duracao: "14 semanas",
        cargaHorariaTotal: "160 horas",
        descricao: "Segundo módulo focado em preparação prática para o ministério cristão.",
        disciplinas: [
            {
                nome: "Homilética",
                cargaHoraria: "40h",
                descricao: "Arte e técnica da pregação expositiva, estruturação de sermões e comunicação eficaz da Palavra de Deus."
            },
            {
                nome: "Hermenêutica",
                cargaHoraria: "40h",
                descricao: "Princípios e métodos de interpretação bíblica, regras hermenêuticas e aplicação prática das Escrituras."
            },
            {
                nome: "Ética Ministerial",
                cargaHoraria: "30h",
                descricao: "Conduta e caráter do ministro do evangelho, ética pastoral e relacionamentos ministeriais saudáveis."
            },
            {
                nome: "Liturgia",
                cargaHoraria: "30h",
                descricao: "Organização e condução de cultos, celebração de ordenanças e cerimônias eclesiásticas."
            },
            {
                nome: "Aconselhamento Pastoral",
                cargaHoraria: "20h",
                descricao: "Fundamentos do aconselhamento cristão, visitação pastoral e cuidado espiritual do rebanho."
            }
        ],
        certificacao: "Certificado de Conclusão do Módulo 2 - Fundamentos Ministeriais"
    },
    {
        id: 3,
        img: equilibrioPastoral,
        title: "Módulo 3 - Teologia Sistemática",
        autor: "Bel.Pr. Valdinei da Conceição Santos",
        nivel: "Curso Médio em Teologia",
        duracao: "18 semanas",
        cargaHorariaTotal: "240 horas",
        descricao: "Terceiro módulo apresentando as principais doutrinas da fé cristã de forma sistemática.",
        disciplinas: [
            {
                nome: "Teontologia",
                cargaHoraria: "50h",
                descricao: "Estudo sobre Deus: seus atributos, natureza, trindade e revelação divina nas Escrituras."
            },
            {
                nome: "Cristologia",
                cargaHoraria: "50h",
                descricao: "Estudo sobre a pessoa e obra de Jesus Cristo: encarnação, vida, morte, ressurreição e ascensão."
            },
            {
                nome: "Soteriologia",
                cargaHoraria: "50h",
                descricao: "Doutrina da salvação: eleição, chamado, regeneração, justificação, santificação e glorificação."
            },
            {
                nome: "Eclesiologia",
                cargaHoraria: "45h",
                descricao: "Doutrina da igreja: natureza, missão, governo, disciplina e ordenanças eclesiásticas."
            },
            {
                nome: "Antropologia Teológica",
                cargaHoraria: "45h",
                descricao: "Estudo do ser humano à luz das Escrituras: criação, queda, imagem de Deus e propósito divino."
            }
        ],
        certificacao: "Certificado de Conclusão do Módulo 3 - Teologia Sistemática"
    },
    {
        id: 4,
        img: artePastorear,
        title: "Módulo 4 - Liderança e Gestão",
        autor: "Bel.Pr. Valdinei da Conceição Santos",
        nivel: "Curso Avançado - Especialização",
        duracao: "16 semanas",
        cargaHorariaTotal: "200 horas",
        descricao: "Módulo de especialização em liderança eclesiástica e administração ministerial.",
        disciplinas: [
            {
                nome: "Liderança Cristã",
                cargaHoraria: "50h",
                descricao: "Princípios bíblicos de liderança, desenvolvimento de equipes e gestão de pessoas no contexto ministerial."
            },
            {
                nome: "Gestão Eclesiástica",
                cargaHoraria: "40h",
                descricao: "Administração de recursos, finanças, patrimônio e aspectos legais da igreja local."
            },
            {
                nome: "Plantação de Igrejas",
                cargaHoraria: "40h",
                descricao: "Estratégias e práticas para implantação e desenvolvimento de novas comunidades cristãs."
            },
            {
                nome: "Discipulado",
                cargaHoraria: "40h",
                descricao: "Metodologias de formação de discípulos, mentoria espiritual e multiplicação de líderes."
            },
            {
                nome: "Família e Ministério",
                cargaHoraria: "30h",
                descricao: "Equilíbrio entre vida familiar e ministerial, cuidado com cônjuge e filhos de líderes."
            }
        ],
        certificacao: "Certificado de Especialização em Liderança e Gestão Eclesiástica"
    }
];

export default function BibliotecaFAITEL() {
    const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null);

    return (
        <div className="w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <GraduationCap className="h-16 w-16 text-blue-600" />
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                                Biblioteca FAITEL
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Faculdade Internacional Teológica de Líderes
                            </p>
                        </div>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Manuais de Estudo Autodidático com múltiplas disciplinas por módulo
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold mt-2 text-lg">
                        📚 Clique em qualquer módulo para ver todas as disciplinas incluídas
                    </p>
                </div>

                {/* Grade de Módulos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    {modulos.map((modulo) => (
                        <Card
                            key={modulo.id}
                            className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
                            onClick={() => setSelectedModulo(modulo)}
                        >
                            <div className="relative">
                                <img
                                    src={modulo.img}
                                    alt={modulo.title}
                                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 px-6 py-3 rounded-full">
                                        <span className="text-sm font-bold text-blue-900">📖 Ver Disciplinas</span>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-bold text-sm mb-1">{modulo.title}</h3>
                                <p className="text-xs text-gray-600 mb-2">{modulo.nivel}</p>
                                <p className="text-xs text-blue-600 font-semibold">{modulo.disciplinas.length} disciplinas</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* CTA Section */}
                <Card className="bg-gradient-to-r from-blue-900 to-blue-800 text-white border-0">
                    <CardContent className="p-8 text-center">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                        <h3 className="text-3xl font-bold mb-4">Kit Completo de Módulos</h3>
                        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                            Adquira o kit completo com todos os módulos do Curso Básico, Médio ou Especialização!
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-bold">
                                Ver Kits Completos
                            </Button>
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                Catálogo Completo (PDF)
                            </Button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/20">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-yellow-400 font-bold text-2xl">15%</div>
                                    <div className="text-blue-200 text-sm">Desconto no kit</div>
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-bold text-2xl">4 Módulos</div>
                                    <div className="text-blue-200 text-sm">20+ disciplinas</div>
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-bold text-2xl">Digital</div>
                                    <div className="text-blue-200 text-sm">+ Versão impressa</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal de Detalhes do Módulo */}
                <Dialog open={selectedModulo !== null} onOpenChange={() => setSelectedModulo(null)}>
                    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                        {selectedModulo && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-bold text-blue-900">
                                        {selectedModulo.title}
                                    </DialogTitle>
                                    {selectedModulo.autor && (
                                        <p className="text-lg text-gray-700 mt-2">
                                            <span className="font-semibold">✍️ Autor:</span> {selectedModulo.autor}
                                        </p>
                                    )}
                                    <p className="text-lg text-gray-600">{selectedModulo.nivel}</p>
                                </DialogHeader>

                                <div className="grid md:grid-cols-3 gap-6 mt-6">
                                    {/* Imagem do Módulo */}
                                    <div className="md:col-span-1">
                                        <img
                                            src={selectedModulo.img}
                                            alt={selectedModulo.title}
                                            className="w-full rounded-lg shadow-xl mb-4"
                                        />
                                        <div className="space-y-3">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-blue-600" />
                                                    <span className="font-semibold">Duração: {selectedModulo.duracao}</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-green-50 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <BookOpen className="h-4 w-4 text-green-600" />
                                                    <span className="font-semibold">CH Total: {selectedModulo.cargaHorariaTotal}</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-purple-50 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Award className="h-4 w-4 text-purple-600" />
                                                    <span className="font-semibold">{selectedModulo.disciplinas.length} Disciplinas</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Informações Detalhadas */}
                                    <div className="md:col-span-2 space-y-6">
                                        {/* Descrição */}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">Sobre o Módulo</h3>
                                            <p className="text-gray-700 leading-relaxed">{selectedModulo.descricao}</p>
                                        </div>

                                        {/* Disciplinas */}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                                Disciplinas Incluídas ({selectedModulo.disciplinas.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedModulo.disciplinas.map((disciplina, idx) => (
                                                    <Card key={idx} className="border-l-4 border-blue-600 hover:shadow-md transition-shadow">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                                    <h4 className="font-bold text-lg text-gray-900">{disciplina.nome}</h4>
                                                                </div>
                                                                <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                                                                    {disciplina.cargaHoraria}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 text-sm pl-7">{disciplina.descricao}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Certificação */}
                                        <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-400">
                                            <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2 text-lg">
                                                <Award className="h-6 w-6" />
                                                Certificação
                                            </h4>
                                            <p className="text-sm text-yellow-900 font-semibold">{selectedModulo.certificacao}</p>
                                        </div>

                                        {/* Botão de Matrícula */}
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-6">
                                            Matricular-se Neste Módulo
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
