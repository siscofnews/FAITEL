import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Award, CheckCircle2, GraduationCap } from "lucide-react";

// Importar imagens das revistas
import jovensRomanos from "@/assets/revistas/jovens-romanos.jpg";
import adultosRomanos from "@/assets/revistas/adultos-romanos.jpg";
import criancasRomanos from "@/assets/revistas/criancas-romanos.jpg";
import adultosCompacta from "@/assets/revistas/adultos-compacta.jpg";
import discipulado from "@/assets/revistas/discipulado.jpg";

interface RevistaEBD {
    id: number;
    imageUrl: string;
    title: string;
    publicoAlvo: string;
    tema: string;
    trimestre: string;
    ano: string;
    serie?: string;
    faixaEtaria?: string;
    descricao: string;
    conteudo: string[];
    objetivos: string[];
    diferenciais: string[];
    cor: string;
}

const revistas: RevistaEBD[] = [
    {
        id: 1,
        imageUrl: jovensRomanos,
        title: "Escola Bíblica & Jovens",
        publicoAlvo: "Adolescentes & Jovens",
        tema: "Romanos: Fé e Atitude Jovem",
        trimestre: "1º Trimestre",
        ano: "2026",
        descricao: "Revista trimestral desenvolvida especialmente para adolescentes e jovens, explorando o livro de Romanos com uma linguagem atual e dinâmica, abordando temas relevantes para a juventude cristã contemporânea.",
        conteudo: [
            "Lição 1: Introdução ao Livro de Romanos",
            "Lição 2: O Evangelho do Poder de Deus",
            "Lição 3: A Justiça de Deus Revelada",
            "Lição 4: Fé que Transforma Vidas",
            "Lição 5: Justificação pela Fé",
            "Lição 6: Paz com Deus",
            "Lição 7: Vida no Espírito",
            "Lição 8: Eleição e Misericórdia",
            "Lição 9: Vida Prática do Cristão",
            "Lição 10: Amor e Relacionamentos",
            "Lição 11: Submissão às Autoridades",
            "Lição 12: Unidade na Diversidade",
            "Lição 13: Revisão e Aplicação"
        ],
        objetivos: [
            "Apresentar o livro de Romanos de forma relevante para jovens",
            "Desenvolver fé sólida baseada nas Escrituras",
            "Incentivar atitudes cristãs no dia a dia",
            "Promover discussões e reflexões em grupo",
            "Aplicar princípios bíblicos à realidade jovem"
        ],
        diferenciais: [
            "Linguagem jovem e contemporânea",
            "Recursos multimídia e QR codes",
            "Atividades interativas",
            "Aplicação prática para o século XXI"
        ],
        cor: "from-cyan-500 to-blue-700"
    },
    {
        id: 2,
        imageUrl: adultosRomanos,
        title: "Escola Bíblica de Adultos",
        publicoAlvo: "Adultos",
        tema: "Carta aos Romanos",
        serie: "Série Cartas de Paulo",
        trimestre: "1º Trimestre",
        ano: "2026",
        descricao: "Estudo aprofundado da Carta aos Romanos para adultos, explorando as doutrinas fundamentais da fé cristã, com análise exegética e aplicação contemporânea dos ensinamentos paulinos.",
        conteudo: [
            "Contexto Histórico de Romanos",
            "A Universalidade do Pecado",
            "A Justiça de Deus pela Fé",
            "Abraão: Exemplo de Fé",
            "Justificação e Suas Consequências",
            "Graça Abundante",
            "Livres do Pecado",
            "A Lei e o Pecado",
            "Vida no Espírito Santo",
            "Eleição e Soberania de Deus",
            "A Salvação de Israel",
            "Sacrifício Vivo",
            "Amor Fraternal e Deveres Cristãos"
        ],
        objetivos: [
            "Compreender as doutrinas fundamentais de Romanos",
            "Aprofundar conhecimento teológico",
            "Aplicar ensinamentos paulinos na vida diária",
            "Fortalecer a fé através do estudo",
            "Desenvolver maturidade espiritual"
        ],
        diferenciais: [
            "Estudo teológico aprofundado",
            "Comentários exegéticos",
            "Material do professor incluído",
            "Subsídios para preparação de aulas"
        ],
        cor: "from-amber-600 to-orange-800"
    },
    {
        id: 3,
        imageUrl: criancasRomanos,
        title: "Escola Bíblica - Aventura em Romanos",
        publicoAlvo: "Crianças",
        faixaEtaria: "7-11 anos",
        tema: "Carta aos Romanos",
        serie: "Aventura com Paulo",
        trimestre: "1º Trimestre",
        ano: "2026",
        descricao: "Material lúdico e educativo para crianças de 7 a 11 anos, apresentando o livro de Romanos de forma acessível e divertida, com histórias, atividades e ilustrações coloridas.",
        conteudo: [
            "Paulo Escreve uma Carta Especial",
            "Todos Precisam de Jesus",
            "Deus Nos Ama Muito",
            "A Fé de Abraão",
            "Jesus Nos Salva",
            "O Amor de Deus é Grande",
            "Vivendo com Jesus",
            "O Espírito Santo nos Ajuda",
            "Deus Tem um Plano",
            "Servindo a Deus",
            "Amar uns aos Outros",
            "Obedecendo com Alegria",
            "Somos uma Família"
        ],
        objetivos: [
            "Introduzir conceitos bíblicos de forma lúdica",
            "Desenvolver amor pela Palavra de Deus",
            "Ensinar valores cristãos",
            "Estimular criatividade e participação",
            "Formar base sólida de fé desde cedo"
        ],
        diferenciais: [
            "Ilustrações coloridas e atrativas",
            "Atividades para colorir e recortar",
            "Jogos educativos",
            "Versículos decorados com músicas"
        ],
        cor: "from-green-400 to-teal-600"
    },
    {
        id: 4,
        imageUrl: adultosCompacta,
        title: "Escola Bíblica Adultos - Compacta",
        publicoAlvo: "Adultos",
        tema: "Carta aos Romanos",
        serie: "Série Cartas de Paulo",
        trimestre: "1º Trimestre",
        ano: "2026",
        descricao: "Versão compacta da revista de adultos, ideal para células e grupos pequenos, mantendo a qualidade do conteúdo em formato prático e econômico.",
        conteudo: [
            "Introdução à Epístola",
            "Pecado Universal",
            "Justificação pela Fé",
            "A Fé de Abraão",
            "Paz com Deus",
            "Graça Abundante",
            "Santificação",
            "Vida no Espírito",
            "Eleição Divina",
            "Misericórdia de Deus",
            "Culto Racional",
            "Amor Prático",
            "Conclusão"
        ],
        objetivos: [
            "Facilitar estudo em grupos pequenos",
            "Oferecer conteúdo de qualidade em formato compacto",
            "Promover discussões em células",
            "Acessibilidade financeira",
            "Praticidade no transporte e manuseio"
        ],
        diferenciais: [
            "Formato compacto e prático",
            "Preço acessível",
            "Ideal para células e pequenos grupos",
            "Conteúdo completo resumido"
        ],
        cor: "from-slate-600 to-slate-800"
    },
    {
        id: 5,
        imageUrl: discipulado,
        title: "Discipulado - 2º Ciclo",
        publicoAlvo: "Novos Decididos",
        tema: "Escola Bíblica - Formação de Discípulos",
        serie: "Ciclo de Discipulado",
        trimestre: "Anual",
        ano: "2026",
        descricao: "Material especial para discipulado de novos convertidos, apresentando fundamentos da fé cristã de forma progressiva e sistemática, ideal para acompanhamento individual ou em grupos.",
        conteudo: [
            "Bem-vindo à Família de Deus",
            "Conhecendo a Bíblia",
            "A Oração: Conversando com Deus",
            "O Batismo nas Águas",
            "A Santa Ceia",
            "O Dízimo e as Ofertas",
            "Vida em Santidade",
            "O Espírito Santo",
            "Dons Espirituais",
            "Evangelismo Pessoal",
            "A Igreja Local",
            "Servindo no Reino",
            "Crescimento Espiritual"
        ],
        objetivos: [
            "Fundamentar novos convertidos na fé",
            "Ensinar doutrinas básicas",
            "Integrar à vida da igreja",
            "Desenvolver vida devocional",
            "Preparar para o serviço cristão"
        ],
        diferenciais: [
            "Metodologia progressiva",
            "Acompanhamento personalizado",
            "Material do discipulador incluído",
            "Certificado de conclusão"
        ],
        cor: "from-blue-500 to-indigo-700"
    }
];

export default function VitrineSECC() {
    const [selectedRevista, setSelectedRevista] = useState<RevistaEBD | null>(null);

    return (
        <div className="w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 px-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge className="mb-4 text-lg px-6 py-2 bg-blue-600 text-white hover:bg-blue-700">
                        SECC - Secretaria de Educação Continuada Cristã
                    </Badge>
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Revistas Trimestrais EBD
                    </h2>
                    <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-4">
                        Material de qualidade para Escola Bíblica Dominical
                    </p>
                    <div className="flex justify-center gap-6 flex-wrap text-lg mt-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-blue-600" />
                            <span className="font-semibold text-gray-700">Publicação Trimestral</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-green-600" />
                            <span className="font-semibold text-gray-700">13 Lições</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award className="h-6 w-6 text-purple-600" />
                            <span className="font-semibold text-gray-700">WST Gráfica e Editora</span>
                        </div>
                    </div>
                </div>

                {/* Grade de Revistas */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
                    {revistas.map((revista) => (
                        <Card
                            key={revista.id}
                            className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer group relative"
                            onClick={() => setSelectedRevista(revista)}
                        >
                            {/* Imagem */}
                            <div className="relative h-96 overflow-hidden">
                                <img
                                    src={revista.imageUrl}
                                    alt={revista.title}
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
                                <Badge className={`mb-3 bg-gradient-to-r ${revista.cor} text-white`}>
                                    {revista.publicoAlvo}
                                </Badge>
                                <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[56px]">
                                    {revista.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                    {revista.tema}
                                </p>

                                <div className="flex items-center justify-between text-sm border-t pt-3">
                                    <div className="flex items-center gap-1 text-blue-600">
                                        <Calendar className="h-4 w-4" />
                                        <span className="font-semibold">{revista.trimestre}</span>
                                    </div>
                                    <div className="text-gray-600 font-semibold">{revista.ano}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* CTA Final */}
                <Card className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white border-0">
                    <CardContent className="p-12 text-center">
                        <GraduationCap className="h-20 w-20 mx-auto mb-6 text-yellow-400" />
                        <h3 className="text-4xl font-bold mb-4">Material Completo para sua EBD</h3>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            Adquira as revistas trimestrais e fortaleça o ensino na sua igreja!
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-bold text-lg px-12 py-6">
                                Solicitar Orçamento
                            </Button>
                            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-12 py-6">
                                Catálogo Completo
                            </Button>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/20">
                            <div className="grid md:grid-cols-4 gap-6">
                                <div>
                                    <div className="text-yellow-400 font-bold text-3xl">5</div>
                                    <div className="text-blue-200 text-sm">Faixas etárias</div>
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-bold text-3xl">13</div>
                                    <div className="text-blue-200 text-sm">Lições por trimestre</div>
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-bold text-3xl">4x</div>
                                    <div className="text-blue-200 text-sm">Edições por ano</div>
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-bold text-3xl">WST</div>
                                    <div className="text-blue-200 text-sm">Gráfica e Editora</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Modal de Detalhes */}
                <Dialog open={selectedRevista !== null} onOpenChange={() => setSelectedRevista(null)}>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        {selectedRevista && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-start gap-4 mb-4">
                                        <Badge className={`bg-gradient-to-r ${selectedRevista.cor} text-white text-sm px-4 py-2`}>
                                            {selectedRevista.publicoAlvo}
                                        </Badge>
                                        <Badge className="bg-blue-600 text-white text-sm px-4 py-2">
                                            {selectedRevista.trimestre} - {selectedRevista.ano}
                                        </Badge>
                                    </div>
                                    <DialogTitle className="text-4xl font-bold text-gray-900">
                                        {selectedRevista.title}
                                    </DialogTitle>
                                    <p className="text-xl text-gray-600 mt-2">{selectedRevista.tema}</p>
                                    {selectedRevista.serie && (
                                        <p className="text-lg text-blue-600 font-semibold mt-1">{selectedRevista.serie}</p>
                                    )}
                                    {selectedRevista.faixaEtaria && (
                                        <p className="text-md text-gray-700 mt-1">Faixa Etária: {selectedRevista.faixaEtaria}</p>
                                    )}
                                </DialogHeader>

                                <div className="grid md:grid-cols-5 gap-8 mt-6">
                                    {/* Coluna da Imagem */}
                                    <div className="md:col-span-2">
                                        <img
                                            src={selectedRevista.imageUrl}
                                            alt={selectedRevista.title}
                                            className="w-full rounded-xl shadow-2xl mb-6"
                                        />

                                        {/* Info Box */}
                                        <div className="space-y-3">
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                    <span className="font-bold text-gray-900">Período</span>
                                                </div>
                                                <p className="text-2xl font-bold text-blue-600">{selectedRevista.trimestre} {selectedRevista.ano}</p>
                                            </div>

                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <BookOpen className="h-5 w-5 text-green-600" />
                                                    <span className="font-bold text-gray-900">Lições</span>
                                                </div>
                                                <p className="text-2xl font-bold text-green-600">13 Estudos</p>
                                            </div>

                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Award className="h-5 w-5 text-purple-600" />
                                                    <span className="font-bold text-gray-900">Editora</span>
                                                </div>
                                                <p className="text-lg font-bold text-purple-600">WST Gráfica e Editora</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coluna de Conteúdo */}
                                    <div className="md:col-span-3 space-y-6">
                                        {/* Descrição */}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Sobre a Revista</h3>
                                            <p className="text-gray-700 leading-relaxed text-lg">{selectedRevista.descricao}</p>
                                        </div>

                                        {/* Objetivos */}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Objetivos de Aprendizado</h3>
                                            <div className="grid md:grid-cols-2 gap-3">
                                                {selectedRevista.objetivos.map((obj, idx) => (
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
                                            <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                                {selectedRevista.conteudo.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
                                                {selectedRevista.diferenciais.map((dif, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                                        <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                                        <span className="text-gray-800 font-medium">{dif}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Botões de Ação */}
                                        <div className="flex gap-4 pt-4">
                                            <Button className={`flex-1 bg-gradient-to-r ${selectedRevista.cor} hover:opacity-90 text-white font-bold text-lg py-7`}>
                                                Solicitar Orçamento
                                            </Button>
                                            <Button variant="outline" className="flex-1 border-2 font-bold text-lg py-7">
                                                Baixar Amostra
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
