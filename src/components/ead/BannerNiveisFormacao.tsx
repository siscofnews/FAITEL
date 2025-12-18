import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, GraduationCap, Award } from "lucide-react";

export default function BannerNiveisFormacao() {
    const niveis = [
        {
            titulo: "NÍVEL DE BASE",
            subtitulo: "PRESENCIAL E A DISTÂNCIA - EAD",
            duracao: "14 meses",
            cor: "from-yellow-600 to-yellow-700",
            disciplinas: [
                "BIBLIOLOGIA",
                "EDUCAÇÃO CRISTÃ",
                "ADMINISTRAÇÃO E LIDERANÇA",
                "PETITS PROPHÈTES",
                "LA TRINITÉ",
                "EVANGELIZAÇÃO",
                "ECCLESIOLOGIA / MISSIOLOGIA",
                "LIVRES HISTORIQUES",
                "ÉTHIQUE CHRÉTIENNE",
                "THÉOLOGIE DU SÉDUCTEUR",
                "PENTATEUQUE",
                "LIVRES POÉTIQUES",
                "GRANDS PROPHÈTES",
                "APOCALYPSE / ESCHATOLOGIE",
                "ÉPÎTRES PAULINIENNES ET GÉNÉRALES",
                "LES ÉVANGILES ET LES ACTES",
                "HOMILÉTIQUE / HERMÉNEUTIQUE",
                "L'HOMME, LES ANGES, LE PÉCHÉ ET LE SALUT"
            ]
        },
        {
            titulo: "NÍVEL INTERMEDIÁRIO",
            subtitulo: "PRESENCIAL E A DISTÂNCIA - EAD",
            duracao: "12 meses",
            cor: "from-orange-600 to-orange-700",
            disciplinas: [
                "GÉOGRAPHIE BIBLIQUE",
                "HÉRÉSIOLOGIE",
                "LA FAMILLE CHRÉTIENNE",
                "THÉOLOGIE SYSTÉMATIQUE I",
                "ANCIEN TESTAMENT I",
                "HERMÉNEUTIQUE",
                "ANCIEN TESTAMENT II",
                "PSYCHOLOGIE PASTORALE",
                "ANCIEN TESTAMENT II",
                "THÉOLOGIE SYSTÉMATIQUE II",
                "HOMILÉTIQUE",
                "LE PEUPLE DE DIEU ET SON HISTOIRE",
                "NOUVEAU TESTAMENT I",
                "ÉVANGÉLISATION ET DISCIPULAT",
                "RELIGIONS ET SECTES",
                "LES SEPT DISPENSATIONS",
                "NOUVEAU TESTAMENT II"
            ]
        },
        {
            titulo: "LICENCE EN THÉOLOGIE (BACHARELADO)",
            subtitulo: "PRESENCIAL E A DISTÂNCIA - EAD",
            duracao: "4 années 3 mois",
            cor: "from-yellow-500 to-yellow-600",
            disciplinas: [
                "THÉOLOGIE SYSTÉMATIQUE II",
                "THÉOLOGIE PASTORALE",
                "MISSIONS",
                "PÉDAGOGIE",
                "PÉDAGOGIE DE L'ÉDUCATION CHRÉTIENNE",
                "CULTURE BIBLIQUE",
                "RELATIONS HUMAINES",
                "MÉTHODOLOGIE DU TRAVAIL SCIENTIFIQUE",
                "SOCIOLOGIE",
                "ARCHÉOLOGIE BIBLIQUE",
                "ANTHROPOLOGIE DES MISSIONS",
                "MISSIONS URBAINES",
                "EXÉGÈSE DE L'ANCIEN TESTAMENT",
                "NOTIONS DE GREC ET D'HÉBREU",
                "TEOLOGIA CONTEMPORÂNEA",
                "PANORAMA BIBLIQUE",
                "COURANTS THÉOLOGIQUES ACTUELS",
                "DROIT ECCLÉSIASTIQUE"
            ]
        }
    ];

    return (
        <div className="w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-16 px-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
            </div>

            <div className="container mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <img
                            src="/images/logo-faitel.png"
                            alt="FAITEL Logo"
                            className="h-24 w-24"
                            onError={(e) => {
                                // Fallback se imagem não existir
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black text-yellow-400 tracking-wider">
                                FAITEL
                            </h1>
                            <p className="text-white text-sm md:text-base font-semibold uppercase tracking-wide">
                                Faculté Internationale de Théologie des Leaderships
                            </p>
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white italic mb-2">
                        Formation théologique au-delà des frontières
                    </h2>
                    <p className="text-blue-200 text-lg">
                        ✨ 25 ans au service de la formation des leaders ✨
                    </p>
                </div>

                {/* Níveis de Formação */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {niveis.map((nivel, idx) => (
                        <Card
                            key={idx}
                            className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-yellow-400"
                        >
                            {/* Header do Card */}
                            <div className={`bg-gradient-to-r ${nivel.cor} p-6 text-white text-center`}>
                                <div className="flex justify-center mb-3">
                                    {idx === 0 && <BookOpen className="h-12 w-12" />}
                                    {idx === 1 && <GraduationCap className="h-12 w-12" />}
                                    {idx === 2 && <Award className="h-12 w-12" />}
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-wide mb-2">
                                    {nivel.titulo}
                                </h3>
                                <p className="text-sm opacity-90 mb-3">
                                    {nivel.subtitulo}
                                </p>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                                    <p className="text-sm font-bold">
                                        ⏱️ {nivel.duracao}
                                    </p>
                                </div>
                            </div>

                            {/* Body do Card */}
                            <CardContent className="p-6 bg-white">
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    {nivel.disciplinas.map((disciplina, dIdx) => (
                                        <div
                                            key={dIdx}
                                            className="flex items-start gap-2 text-xs"
                                        >
                                            <span className="text-yellow-600 font-bold mt-0.5">•</span>
                                            <span className="text-gray-700 leading-tight">
                                                {disciplina}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Logos de Parcerias */}
                <div className="bg-white rounded-2xl p-6 mb-8">
                    <p className="text-center text-gray-600 text-sm mb-4 font-semibold">
                        Reconhecida por instituições internacionais
                    </p>
                    {/* Aqui você pode adicionar os logos das instituições parceiras */}
                    <div className="flex flex-wrap justify-center items-center gap-6">
                        {/* Logos placeholder - substitua pelas imagens reais */}
                        <div className="text-xs text-gray-400">CADB</div>
                        <div className="text-xs text-gray-400">CPFAM</div>
                        <div className="text-xs text-gray-400">CEPAD</div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-8 text-center">
                    <h3 className="text-3xl font-black text-blue-900 mb-4">
                        INSCRIPTIONS OUVERTES 2025
                    </h3>
                    <div className="flex flex-wrap justify-center gap-6 text-blue-900">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📞</span>
                            <span className="font-bold">+33 075952395</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🌐</span>
                            <a
                                href="https://faculdadefaitel.com.br"
                                className="font-bold hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                faculdadefaitel.com.br
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🇪🇺</span>
                            <a
                                href="https://europa.faculdadefaitel.com.br"
                                className="font-bold hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                europa.faculdadefaitel.com.br
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
