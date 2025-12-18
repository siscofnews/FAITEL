import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BibliotecaFAITEL from "@/components/ead/BibliotecaFAITEL";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    GraduationCap,
    BookOpen,
    Users,
    Award,
    CheckCircle2,
    ArrowRight,
    Play,
    Star,
    Church,
    Heart,
    Globe,
    TrendingUp
} from "lucide-react";

export default function BachareladoTeologia() {
    const navigate = useNavigate();
    const [showVideo, setShowVideo] = useState(false);

    // Grade Curricular Profissional - 5 Áreas de Conhecimento
    const gradeCurricular = {
        "1. Estudos Bíblicos": {
            descricao: "Estudo aprofundado do Antigo e Novo Testamento, incluindo contexto histórico, línguas originais e interpretação.",
            disciplinas: [
                "Introdução ao Antigo Testamento",
                "Introdução ao Novo Testamento",
                "Línguas Bíblicas (Hebraico e Grego)",
                "Exegese e Hermenêutica (métodos de interpretação)",
                "Geografia e Arqueologia Bíblica"
            ]
        },
        "2. Teologia Sistemática e Doutrinária": {
            descricao: "Principais doutrinas cristãs de forma organizada e coerente.",
            disciplinas: [
                "Teologia Fundamental (Prolegômenos)",
                "Teontologia (Estudo de Deus)",
                "Cristologia (Estudo de Jesus Cristo)",
                "Pneumatologia (Estudo do Espírito Santo)",
                "Eclesiologia (Estudo da Igreja)",
                "Escatologia (Estudo das últimas coisas)",
                "Antropologia Teológica (Estudo do ser humano)"
            ]
        },
        "3. História da Igreja": {
            descricao: "Desenvolvimento histórico do Cristianismo ao longo dos séculos.",
            disciplinas: [
                "História da Igreja Antiga e Medieval",
                "História da Reforma e Pós-Reforma",
                "História do Cristianismo Moderno e Contemporâneo",
                "História das Religiões"
            ]
        },
        "4. Teologia Prática e Pastoral": {
            descricao: "Preparação para o exercício ministerial e aplicação da teologia na vida cotidiana.",
            disciplinas: [
                "Aconselhamento Pastoral e Cristão",
                "Educação Religiosa/Cristã",
                "Gestão e Liderança",
                "Homilética (Arte de pregar)",
                "Liturgia e Sacramentos",
                "Missiologia (Estudo da missão da Igreja)"
            ]
        },
        "5. Ciências Humanas e Outras Áreas": {
            descricao: "Disciplinas que dialogam com a teologia e a sociedade.",
            disciplinas: [
                "Filosofia",
                "Sociologia da Religião",
                "Ética",
                "Ecumenismo e Diálogo Inter-religioso"
            ]
        }
    };

    const complementos = [
        "Atividades Complementares",
        "Trabalho de Conclusão de Curso (TCC)",
        "Estágios Supervisionados em Práticas Pastorais"
    ];

    const diferenciais = [
        { icon: Award, title: "Excelência Acadêmica", description: "23 anos formando líderes cristãos" },
        { icon: Church, title: "Ênfase Bíblica e Pastoral", description: "Foco na Palavra e no ministério prático" },
        { icon: Users, title: "Corpo Docente Qualificado", description: "Mestres, doutores e pastores experientes" },
        { icon: Globe, title: "Presença Internacional", description: "Alunos em 7 países" }
    ];

    const areasAtuacao = [
        "Pastor e Líder de Igreja",
        "Missionário Transcultural",
        "Capelão (Hospitalar, Militar, Prisional)",
        "Professor de Teologia e Bíblia",
        "Conselheiro Pastoral",
        "Educador Cristão",
        "Gestor de Ministérios",
        "Pesquisador Teológico"
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <Badge className="bg-yellow-500 text-blue-900 hover:bg-yellow-400 text-sm px-4 py-1">
                                Bacharelado Reconhecido
                            </Badge>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                Bacharelado em Teologia Bíblica
                            </h1>

                            <p className="text-xl md:text-2xl text-blue-100">
                                Transforme vidas e aprofunde seus conhecimentos com a FAITEL
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    <span>Duração: 4 anos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    <span>100% EAD</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    <span>Certificação Reconhecida</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    onClick={() => navigate("/ead/matricula")}
                                    size="lg"
                                    className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold text-lg px-8"
                                >
                                    Inscreva-se Agora
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>

                                <Button
                                    onClick={() => setShowVideo(true)}
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white/10"
                                >
                                    <Play className="mr-2 h-5 w-5" />
                                    Assista ao Vídeo
                                </Button>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl blur-3xl opacity-30"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=800&fit=crop"
                                    alt="Estudante de Teologia"
                                    className="relative rounded-3xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-blue-950 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400">23</div>
                            <div className="text-sm text-blue-200">Anos de Experiência</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400">100+</div>
                            <div className="text-sm text-blue-200">Alunos Formados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400">7</div>
                            <div className="text-sm text-blue-200">Países Atendidos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400">5</div>
                            <div className="text-sm text-blue-200">Áreas de Conhecimento</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16 space-y-20">

                {/* Sobre o Curso */}
                <section id="sobre">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
                            Sobre o Curso de Bacharelado em Teologia
                        </h2>

                        <p className="text-lg text-muted-foreground leading-relaxed">
                            O curso de Teologia estuda o campo teórico investigativo da teologia, do ensino, da aprendizagem
                            e do trabalho comunitário presentes na prática profissional do teólogo, capacitando-o a exercer
                            funções de liderança e gestão nas comunidades, mobilizar pessoas em torno de projetos humanitários,
                            além de produzir e difundir conhecimento em contextos religiosos, bem como a exercer atividades
                            pastorais, evangelísticas e missionárias.
                        </p>

                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <GraduationCap className="h-7 w-7 text-blue-600" />
                                    O que você vai aprender
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    No curso de Teologia EAD da FAITEL, você é incentivado a se desenvolver em quatro dimensões
                                    fundamentais: <strong>aprender</strong>, adquirindo ferramentas para uma compreensão profunda
                                    das Escrituras; <strong>agir</strong>, aplicando o conhecimento de forma prática;
                                    <strong>conviver</strong>, colaborando com outros; e <strong>ser</strong>, integrando todos
                                    esses aspectos em uma jornada que transforma o conhecimento teológico e o ser humano em sua totalidade.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Grade Curricular */}
                <section id="disciplinas" className="bg-gray-50 dark:bg-gray-900 -mx-4 px-4 py-16">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                            Grade Curricular do Bacharelado
                        </h2>
                        <p className="text-center text-muted-foreground mb-2 max-w-3xl mx-auto">
                            Formação acadêmica completa organizada em 5 áreas de conhecimento teológico
                        </p>
                        <p className="text-center text-blue-600 dark:text-blue-400 font-semibold mb-12">
                            ⭐ Duração: 4 anos | Modalidade: 100% EAD
                        </p>

                        <div className="space-y-8">
                            {Object.entries(gradeCurricular).map(([area, conteudo], areaIdx) => (
                                <Card key={areaIdx} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-2">
                                                    {area}
                                                </h3>
                                                <p className="text-sm text-muted-foreground italic">
                                                    {conteudo.descricao}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-2 mt-4">
                                            {conteudo.disciplinas.map((disciplina, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                    <span className="text-sm">{disciplina}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Complementos do Curso */}
                        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Award className="h-5 w-5 text-blue-600" />
                                    Além das Disciplinas
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {complementos.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-blue-300 dark:border-blue-700"
                                        >
                                            <Star className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                                            <span className="text-sm font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-6 text-center">
                                <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Formação Completa e Reconhecida</h3>
                                <p className="text-muted-foreground">
                                    Um currículo abrangente que integra teoria, prática e pesquisa para uma formação teológica de excelência
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Diferenciais */}
                <section id="diferenciais">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                            Diferenciais do Bacharelado em Teologia FAITEL
                        </h2>
                        <p className="text-center text-muted-foreground mb-12">
                            Confira os diferenciais que fazem da FAITEL referência em formação teológica
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {diferenciais.map((item, idx) => (
                                <Card key={idx} className="hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6 text-center space-y-4">
                                        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <item.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Áreas de Atuação */}
                <section id="carreira" className="bg-gradient-to-r from-blue-900 to-purple-900 text-white -mx-4 px-4 py-16 rounded-3xl">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                            Sua Futura Carreira
                        </h2>
                        <p className="text-center text-blue-100 mb-12 max-w-3xl mx-auto">
                            Com o Bacharelado em Teologia da FAITEL, você estará preparado para atuar em diversas áreas ministeriais e acadêmicas
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {areasAtuacao.map((area, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 flex items-center gap-3 hover:bg-white/20 transition-colors"
                                >
                                    <Star className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                                    <span className="font-medium">{area}</span>
                                </div>
                            ))}
                        </div>

                        <Card className="mt-12 bg-white/10 backdrop-blur-sm border-white/20">
                            <CardContent className="p-8 text-center">
                                <TrendingUp className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Especialização e Pós-Graduação</h3>
                                <p className="text-blue-100 mb-6">
                                    Amplie sua formação e atue em docência e pesquisa no ensino superior
                                </p>
                                <Button
                                    onClick={() => navigate("/ead/pos-graduacao")}
                                    className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold"
                                >
                                    Conhecer Pós-Graduações
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* CTA Final */}
                <section className="text-center space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Pronto para transformar sua vida e a de outros?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Inscreva-se no Bacharelado em Teologia da FAITEL e comece sua jornada de formação ministerial hoje mesmo!
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button
                            onClick={() => navigate("/ead/matricula")}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-12 py-6"
                        >
                            Inscreva-se Agora
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>

                        <Button
                            onClick={() => navigate("/ead/contato")}
                            size="lg"
                            variant="outline"
                            className="font-bold text-lg px-12 py-6"
                        >
                            Fale com um Consultor
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>100% Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Certificação Reconhecida</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Suporte Completo</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Biblioteca FAITEL - Manuais */}
            <BibliotecaFAITEL />

            {/* Footer */}
            <footer className="bg-blue-950 text-white py-12 -mx-4 px-4 mt-20">
                <div className="container mx-auto text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <GraduationCap className="h-10 w-10 text-yellow-400" />
                        <div className="text-left">
                            <div className="text-2xl font-bold">FAITEL</div>
                            <div className="text-sm text-blue-200">Faculdade Internacional Teológica de Líderes</div>
                        </div>
                    </div>
                    <p className="text-blue-200 max-w-2xl mx-auto">
                        23 anos transformando vidas através da educação teológica de excelência
                    </p>
                    <div className="text-sm text-blue-300">
                        <strong>Diretor:</strong> Pastor Valdinei da Conceição Santos
                    </div>
                </div>
            </footer>
        </div>
    );
}
