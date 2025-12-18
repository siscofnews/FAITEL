import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Award, CheckCircle2, Star, TrendingUp } from "lucide-react";

// Importar imagens dos cursos
import psicanaliseImg from "@/assets/cursos/psicanalise.jpg";
import juizArbitralImg from "@/assets/cursos/juiz-arbitral.jpg";
import lideresCelulasImg from "@/assets/cursos/lideres-celulas.jpg";
import direitosHumanosImg from "@/assets/cursos/direitos-humanos.jpg";
import gestaoIgrejaImg from "@/assets/cursos/gestao-igreja.jpg";
import capelaniaMilitarImg from "@/assets/cursos/capelania-militar.jpg";
import direitoCanonico from "@/assets/cursos/direito-canonico.jpg";
import juizPazImg from "@/assets/cursos/juiz-paz.jpg";

interface CursoProfissionalizante {
    id: number;
    imageUrl: string;
    title: string;
    subtitle: string;
    categoria: string;
    duracao: "90 dias";
    cargaHoraria: "360 horas";
    valor: string;
    descricao: string;
    objetivos: string[];
    conteudo: string[];
    diferenciais: string[];
    publicoAlvo: string;
    certificacao: string;
    cor: string;
}

const cursos: CursoProfissionalizante[] = [
    {
        id: 1,
        imageUrl: psicanaliseImg,
        title: "Psicanálise Clínica e Aconselhamento Pastoral",
        subtitle: "Formação Profissional em Atendimento Terapêutico",
        categoria: "Saúde Mental & Pastoral",
        duracao: "90 dias",
        cargaHoraria: "360 horas",
        valor: "12x de R$ 297,00",
        descricao: "Curso completo de Psicanálise Clínica aplicada ao contexto pastoral, preparando o aluno para atuar no aconselhamento de casais, famílias e indivíduos com sólida base teórica e prática.",
        objetivos: [
            "Dominar fundamentos da psicanálise freudiana e lacaniana",
            "Desenvolver habilidades de escuta e intervenção terapêutica",
            "Aplicar técnicas de aconselhamento pastoral",
            "Compreender transtornos emocionais e comportamentais",
            "Realizar atendimentos individuais e em grupo"
        ],
        conteudo: [
            "Introdução à Psicanálise",
            "Teorias da Personalidade",
            "Técnicas de Entrevista e Anamnese",
            "Aconselhamento de Casais e Famílias",
            "Psicopatologia Básica",
            "Ética Profissional",
            "Supervisão de Casos Clínicos",
            "Prática em Atendimento"
        ],
        diferenciais: [
            "Certificação reconhecida nacionalmente",
            "Material didático completo em PDF",
            "Supervisão de casos reais",
            "Acesso vitalício ao conteúdo"
        ],
        publicoAlvo: "Pastores, líderes religiosos, psicólogos, assistentes sociais e profissionais da área de saúde mental",
        certificacao: "Certificado de Conclusão em Psicanálise Clínica e Aconselhamento Pastoral - 360h",
        cor: "from-purple-600 to-purple-800"
    },
    {
        id: 2,
        imageUrl: juizArbitralImg,
        title: "Juiz Arbitral",
        subtitle: "Formação em Mediação e Arbitragem Eclesiástica",
        categoria: "Direito & Mediação",
        duracao: "90 dias",
        cargaHoraria: "360 horas",
        valor: "12x de R$ 267,00",
        descricao: "Capacitação completa para atuação como juiz arbitral eclesiástico, mediador de conflitos e conciliador em questões civis e religiosas.",
        objetivos: [
            "Compreender legislação sobre arbitragem",
            "Dominar técnicas de mediação e conciliação",
            "Conduzir processos arbitrais",
            "Resolver conflitos eclesiásticos",
            "Elaborar sentenças arbitrais"
        ],
        conteudo: [
            "introdução ao Direito Canônico",
            "Lei de Arbitragem (Lei 9.307/96)",
            "Técnicas de Mediação de Conflitos",
            "Processo Arbitral Passo a Passo",
            "Redação de Sentenças e Laudos",
            "Ética do Árbitro",
            "Prática em Casos Reais",
            "Direito Eclesiástico Comparado"
        ],
        diferenciais: [
            "Habilitação para atuar como árbitro",
            "Modelos de documentos jurídicos",
            "Certificação com validade judicial",
            "Networking com profissionais da área"
        ],
        publicoAlvo: "Advogados, pastores, líderes eclesiásticos, mediadores e profissionais do direito",
        certificacao: "Certificado de Formação em Juiz Arbitral - 360h",
        cor: "from-blue-600 to-blue-800"
    },
    {
        id: 3,
        imageUrl: lideresCelulasImg,
        title: "Formação de Líderes de Células",
        subtitle: "Formato Grupo Familiar de Crescimento",
        categoria: "Liderança & Discipulado",
        duracao: "90 dias",
        cargaHoraria: "360 horas",
        valor: "12x de R$ 247,00",
        descricao: "Programa completo de capacitação para liderança de células e grupos familiares, com metodologias comprovadas de multiplicação e crescimento saudável.",
        objetivos: [
            "Formar líderes de células eficazes",
            "Implementar sistema de células na igreja",
            "Multiplicar grupos familiares",
            "Desenvolver discípulos comprometidos",
            "Gerenciar crescimento saudável"
        ],
        conteudo: [
            "Visão e Filosofia de Células",
            "Estrutura e Dinâmica da Célula",
            "Liderança de Pequenos Grupos",
            "Plano de Multiplicação",
            "Visitação e Evangelismo Pessoal",
            "Discipulado Um a Um",
            "Gestão de Líderes",
            "Ferramentas Práticas para Células"
        ],
        diferenciais: [
            "Kit completo de material para células",
            "Planilhas de acompanhamento",
            "Videoaulas com líderes experientes",
            "Grupo exclusivo de networking"
        ],
        publicoAlvo: "Pastores, líderes de célula, supervisores, coordenadores de ministérios e multiplicadores",
        certificacao: "Certificado de Formação de Líderes de Células - 360h",
        cor: "from-green-600 to-green-800"
    },
    {
        id: 4,
        imageUrl: direitosHumanosImg,
        title: "Agentes, Defensores e Delegado em Direitos Humanos",
        subtitle: "Formação em Defesa e Promoção dos Direitos Fundamentais",
        categoria: "Direitos Humanos & Cidadania",
        duracao: "90 dias",
        cargaHoraria: "360 horas",
        valor: "12x de R$ 277,00",
        descricao: "Formação completa para atuação na defesa, promoção e fiscalização dos direitos humanos em diferentes contextos sociais e institucionais.",
        objetivos: [
            "Compreender legislação de direitos humanos",
            "Atuar na defesa de direitos fundamentais",
            "Elaborar projetos sociais",
            "Fiscalizar violações de direitos",
            "Promover educação em direitos humanos"
        ],
        conteudo: [
            "História dos Direitos Humanos",
            "Declaração Universal dos Direitos Humanos",
            "Constituição Federal e Direitos Fundamentais",
            "Grupos Vulneráveis",
            "Mecanismos de Proteção",
            "Elaboração de Denúncias",
            "Educação em Direitos Humanos",
            "Prática de Fiscalização"
        ],
        diferenciais: [
            "Certificação reconhecida por ONGs",
            "Material de apoio jurídico",
            "Visitas técnicas virtuais",
            "Carteira de identificação digital"
        ],
        publicoAlvo: "Assistentes sociais, advogados, educadores, líderes comunitários e ativistas sociais",
        certificacao: "Certificado de Agente/Defensor em Direitos Humanos - 360h",
        cor: "from-red-600 to-red-800"
    },
    {
        id: 5,
        imageUrl: gestaoIgrejaImg,
        title: "Gestão Administrativa de Igreja em Software",
        subtitle: "Modernização e Profissionalização da Gestão Eclesiástica",
        categoria: "Gestão & Tecnologia",
        duracao: "90 dias",
        cargaHoraria: "360 horas",
        valor: "12x de R$ 257,00",
        descricao: "Curso completo de administração eclesiástica com foco em ferramentas digitais, gestão financeira, secretaria, recursos humanos e tecnologia aplicada às igrejas.",
        objetivos: [
            "Modernizar a gestão da igreja",
            "Dominar softwares de gestão eclesiástica",
            "Profissionalizar a administração",
            "Implementar controles financeiros",
            "Otimizar processos administrativos"
        ],
        conteudo: [
            "Fundamentos de Gestão Eclesiástica",
            "Software SISCOF - Sistema Completo",
            "Gestão Financeira e Contábil",
            "Controle de Membros e Secretaria",
            "Planejamento Estratégico",
            "Marketing Digital para Igrejas",
            "Gestão de Recursos Humanos",
            "Segurança de Dados e LGPD"
        ],
        diferenciais: [
            "Acesso ao software SISCOF Premium",
            "Templates prontos para uso",
            "Suporte técnico por 12 meses",
            "Atualizações gratuitas"
        ],
        publicoAlvo: "Pastores, secretários de igreja, tesoureiros, administradores eclesiásticos e gestores ministeriais",
        certificacao: "Certificado de Gestão Administrativa de Igreja em Software - 360h",
        cor: "from-teal-600 to-teal-800"
    },
    {
        id: 6,
        imageUrl: capelaniaMilitarImg,
        title: "Capelania Geral Militar",
        subtitle: "Capelania Esportiva e Militar",
        categoria: "Capelania Especializada",
        duracao: "90 dias",
        cargaHoraria: "360 horas",
        valor: "12x de R$ 287,00",
        descricao: "Formação completa para atuação como capelão militar e esportivo, preparando o profissional para ministério em quartéis, hospitais militares, eventos esportivos e contextos de alto rendimento.",
        objetivos: [
            "Compreender a estrutura militar e hierarquia",
            "Desenvolver habilidades de aconselhamento em contexto militar",
            "Atuar em capelania esportiva profissional",
            "Realizar assistência religiosa em ambientes militares",
            "Ministrar apoio espiritual em situações de crise"
        ],
        conteudo: [
            "Introdução à Capelania Militar",
            "Psicologia do Soldado e Atleta",
            "Ética e Regulamentos Militares",
            "Aconselhamento em Situações de Combate",
            "Capelania Hospitalar Militar",
            "Espiritualidade no Esporte de Alto Rendimento",
            "Cerimonial e Protocolo Militar",
            "Gestão de Crises e Trauma"
        ],
        diferenciais: [
            "Certificação reconhecida pelas Forças Armadas",
            "Material didático exclusivo",
            "Videoaulas com capelães experientes",
            "Estágios supervisionados (opcional)"
        ],
        publicoAlvo: "Pastores, líderes religiosos, psicólogos, militares e profissionais que atuam no esporte",
        certificacao: "Certificado de Capelania Geral Militar - 360h",
        cor: "from-red-700 to-red-900"
    },
    {
        id: 7,
        imageUrl: direitoCanonico,
        title: "Direito Religioso Canônico",
        subtitle: "Legislação Eclesiástica e Direito Canônico",
        categoria: "Direito Eclesiástico",
        duracao: "90 dias",
        cargaHoraria: "360 horas",
        valor: "12x de R$ 297,00",
        descricao: "Curso completo de Direito Canônico aplicado ao contexto brasileiro, abordando legislação eclesiástica, autonomia religiosa, questões trabalhistas e tributárias específicas de igrejas e instituições religiosas.",
        objetivos: [
            "Dominar fundamentos do Direito Canônico",
            "Compreender legislação brasileira aplicada às igrejas",
            "Resolver questões jurídicas eclesiásticas",
            "Elaborar estatutos e regimentos internos",
            "Orientar igrejas em questões legais"
        ],
        conteudo: [
            "História do Direito Canônico",
            "Constituição Federal e Liberdade Religiosa",
            "Autonomia da Igreja e Organização Interna",
            "Direito Trabalhista Eclesiástico",
            "Questões Tributárias de Igrejas",
            "Elaboração de Estatutos",
            "Casamento Religioso com Efeitos Civis",
            "Resolução de Conflitos Eclesiásticos"
        ],
        diferenciais: [
            "Modelos de documentos jurídicos",
            "Consultoria jurídica online",
            "Material atualizado com legislação vigente",
            "Certificação reconhecida"
        ],
        publicoAlvo: "Advogados, pastores, líderes eclesiásticos, administradores de igreja e seminaristas",
        certificacao: "Certificado de Direito Religioso Canônico - 360h",
        cor: "from-amber-600 to-amber-800"
    },
    {
        id: 8,
        imageUrl: juizPazImg,
        title: "Juiz de Paz",
        subtitle: "Celebração de Casamentos Civis e Conciliação",
        categoria: "Direito Civil & Família",
        duracao: "90 dias",
        cargaHoraria: "360 horas",
        valor: "12x de R$ 257,00",
        descricao: "Curso completo para habilitação como Juiz de Paz, capacitando para celebração de casamentos civis, conciliações e mediações em conflitos familiares e comunitários.",
        objetivos: [
            "Habilitar-se para celebrar casamentos civis",
            "Dominar procedimentos de conciliação",
            "Compreender legislação de família",
            "Realizar mediações extrajudiciais",
            "Elaborar termos e atas oficiais"
        ],
        conteudo: [
            "Legislação sobre Juiz de Paz",
            "Direito de Família Brasileiro",
            "Procedimentos para Casamento Civil",
            "Técnicas de Conciliação",
            "Mediação de Conflitos Familiares",
            "Elaboração de Documentos Oficiais",
            "Ética do Juiz de Paz",
            "Prática de Celebração"
        ],
        diferenciais: [
            "Habilitação oficial para celebrar casamentos",
            "Modelos de cerimônias e discursos",
            "Certificado com validade judicial",
            "Suporte jurídico permanente"
        ],
        publicoAlvo: "Pastores, líderes comunitários, advogados, mediadores e profissionais do direito",
        certificacao: "Certificado de Juiz de Paz - 360h",
        cor: "from-blue-700 to-blue-900"
    }
];

export default function CursosProfissionalizantes() {
    const [selectedCurso, setSelectedCurso] = useState<CursoProfissionalizante | null>(null);

    return (
        <div className="w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-20 px-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge className="mb-4 text-lg px-6 py-2 bg-yellow-400 text-blue-900 hover:bg-yellow-500">
                        Cursos Profissionalizantes
                    </Badge>
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Formações Especializadas
                    </h2>
                    <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-4">
                        Cursos individuais com certificação reconhecida
                    </p>
                    <div className="flex justify-center gap-6 flex-wrap text-lg">
                        <div className="flex items-center gap-2">
                            <Clock className="h-6 w-6 text-blue-600" />
                            <span className="font-semibold text-gray-700">90 dias</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-green-600" />
                            <span className="font-semibold text-gray-700">360 horas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="h-6 w-6 text-purple-600" />
                            <span className="font-semibold text-gray-700">Certificado Reconhecido</span>
                        </div>
                    </div>
                </div>

                {/* Grade de Cursos */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
                    {cursos.map((curso) => (
                        <Card
                            key={curso.id}
                            className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer group relative"
                            onClick={() => setSelectedCurso(curso)}
                        >
                            {/* Badge de Destaque */}
                            <div className="absolute top-4 right-4 z-10">
                                <Badge className="bg-yellow-400 text-blue-900 font-bold">
                                    <Star className="h-3 w-3 mr-1" />
                                    Destaque
                                </Badge>
                            </div>

                            {/* Imagem */}
                            <div className="relative h-96 overflow-hidden">
                                <img
                                    src={curso.imageUrl}
                                    alt={curso.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                                        Ver Detalhes →
                                    </Button>
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <CardContent className="p-5">
                                <Badge className={`mb-3 bg-gradient-to-r ${curso.cor} text-white`}>
                                    {curso.categoria}
                                </Badge>
                                <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[56px]">
                                    {curso.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {curso.subtitle}
                                </p>

                                <div className="flex items-center justify-between text-sm border-t pt-3">
                                    <div className="flex items-center gap-1 text-blue-600">
                                        <Clock className="h-4 w-4" />
                                        <span className="font-semibold">{curso.duracao}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-600">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="font-semibold">{curso.cargaHoraria}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* CTA Final */}
                <Card className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white border-0">
                    <CardContent className="p-12 text-center">
                        <TrendingUp className="h-20 w-20 mx-auto mb-6 text-yellow-400" />
                        <h3 className="text-4xl font-bold mb-4">Invista em Sua Formação Profissional</h3>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Escolha um dos nossos cursos profissionalizantes e transforme sua carreira em apenas 90 dias!
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-bold text-lg px-12 py-6">
                                Matricular-se Agora
                            </Button>
                            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-12 py-6">
                                Baixar Catálogo (PDF)
                            </Button>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/20">
                            <div className="grid md:grid-cols-4 gap-6">
                                <div>
                                    <div className="text-yellow-400 font-bold text-3xl">90 dias</div>
                                    <div className="text-blue-200 text-sm">Conclusão rápida</div>
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-bold text-3xl">360h</div>
                                    <div className="text-blue-200 text-sm">Carga horária</div>
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-bold text-3xl">100% Online</div>
                                    <div className="text-blue-200 text-sm">Estude de casa</div>
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-bold text-3xl">Certificado</div>
                                    <div className="text-blue-200 text-sm">Reconhecido</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal de Detalhes */}
                <Dialog open={selectedCurso !== null} onOpenChange={() => setSelectedCurso(null)}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        {selectedCurso && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-start gap-4 mb-4">
                                        <Badge className={`bg-gradient-to-r ${selectedCurso.cor} text-white text-sm px-4 py-2`}>
                                            {selectedCurso.categoria}
                                        </Badge>
                                        <Badge className="bg-yellow-400 text-blue-900 text-sm px-4 py-2">
                                            <Star className="h-4 w-4 mr-1" />
                                            Curso Profissionalizante
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-4xl font-bold text-gray-900">
                                        {selectedCurso.title}
                                    </DialogTitle>
                                    <p className="text-xl text-gray-600 mt-2">{selectedCurso.subtitle}</p>
                                </DialogHeader>

                                <div className="grid md:grid-cols-5 gap-8 mt-6">
                                    {/* Coluna da Imagem */}
                                    <div className="md:col-span-2">
                                        <img
                                            src={selectedCurso.imageUrl}
                                            alt={selectedCurso.title}
                                            className="w-full rounded-xl shadow-2xl mb-6"
                                        />

                                        {/* Info Box */}
                                        <div className="space-y-3">
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="h-5 w-5 text-blue-600" />
                                                    <span className="font-bold text-gray-900">Duração</span>
                                                </div>
                                                <p className="text-2xl font-bold text-blue-600">{selectedCurso.duracao}</p>
                                            </div>

                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <BookOpen className="h-5 w-5 text-green-600" />
                                                    <span className="font-bold text-gray-900">Carga Horária</span>
                                                </div>
                                                <p className="text-2xl font-bold text-green-600">{selectedCurso.cargaHoraria}</p>
                                            </div>

                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Award className="h-5 w-5 text-purple-600" />
                                                    <span className="font-bold text-gray-900">Investimento</span>
                                                </div>
                                                <p className="text-2xl font-bold text-purple-600">{selectedCurso.valor}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coluna de Conteúdo */}
                                    <div className="md:col-span-3 space-y-6">
                                        {/* Descrição */}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Sobre o Curso</h3>
                                            <p className="text-gray-700 leading-relaxed text-lg">{selectedCurso.descricao}</p>
                                        </div>

                                        {/* Público Alvo */}
                                        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                            <h4 className="font-bold text-yellow-900 mb-2">👥 Público-Alvo</h4>
                                            <p className="text-yellow-800">{selectedCurso.publicoAlvo}</p>
                                        </div>

                                        {/* Objetivos */}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Objetivos do Curso</h3>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {selectedCurso.objetivos.map((obj, idx) => (
                                                    <div key={idx} className="flex items-start gap-2">
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-700">{obj}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Conteúdo Programático */}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">📚 Conteúdo Programático</h3>
                                            <div className="grid md:grid-cols-2 gap-2">
                                                {selectedCurso.conteudo.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-sm text-gray-800">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Diferenciais */}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">⭐ Diferenciais</h3>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {selectedCurso.diferenciais.map((dif, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                                        <Star className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                        <span className="text-gray-800 font-medium">{dif}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Certificação */}
                                        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-400">
                                            <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2 text-lg">
                                                <Award className="h-6 w-6" />
                                                Certificação
                                            </h4>
                                            <p className="text-yellow-900 font-semibold">{selectedCurso.certificacao}</p>
                                        </div>

                                        {/* Botões de Ação */}
                                        <div className="flex gap-4">
                                            <Button className={`flex-1 bg-gradient-to-r ${selectedCurso.cor} hover:opacity-90 text-white font-bold text-lg py-7`}>
                                                Matricular Agora
                                            </Button>
                                            <Button variant="outline" className="flex-1 border-2 font-bold text-lg py-7">
                                                Mais Informações
                                            </Button>
                                        </div>
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
