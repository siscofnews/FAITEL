import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, GraduationCap } from "lucide-react";

export default function ContatoFAITEL() {
    return (
        <footer className="bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white py-20">
            <div className="container mx-auto px-4">
                {/* Header do Footer */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <GraduationCap className="h-16 w-16 text-yellow-400" />
                        <div className="text-left">
                            <h2 className="text-4xl font-bold text-white">FAITEL</h2>
                            <p className="text-blue-200 text-lg">Faculdade Internacional Teológica de Líderes</p>
                        </div>
                    </div>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Desde 1999 transformando vidas através da educação teológica de excelência
                    </p>
                </div>

                {/* Grid de Informações */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {/* Contatos Administrativos */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
                        <CardContent className="p-6">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                                <Phone className="h-6 w-6" />
                                Contatos
                            </h3>

                            <div className="space-y-4">
                                {/* Presidente */}
                                <div className="pb-4 border-b border-white/10">
                                    <p className="text-sm text-blue-200 mb-2">👤 Presidente</p>
                                    <div className="space-y-2">
                                        <a href="tel:+5571983384883" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                                            <Phone className="h-4 w-4" />
                                            <span className="font-semibold">(71) 98338-4883</span>
                                        </a>
                                        <a href="mailto:pr.vcsantos@gmail.com" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-sm">pr.vcsantos@gmail.com</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Secretaria */}
                                <div className="pb-4 border-b border-white/10">
                                    <p className="text-sm text-blue-200 mb-2">📋 Secretaria</p>
                                    <a href="mailto:faiteloficial@gmail.com" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">faiteloficial@gmail.com</span>
                                    </a>
                                </div>

                                {/* Tesouraria */}
                                <div>
                                    <p className="text-sm text-blue-200 mb-2">💰 Tesouraria</p>
                                    <div className="space-y-2">
                                        <a href="tel:+5571996822782" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                                            <Phone className="h-4 w-4" />
                                            <span className="font-semibold">(71) 99682-2782</span>
                                        </a>
                                        <a href="tel:+5575991018395" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                                            <Phone className="h-4 w-4" />
                                            <span className="font-semibold">(75) 99101-8395</span>
                                        </a>
                                        <a href="mailto:faitelalunos@gmail.com" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-sm">faitelalunos@gmail.com</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endereço */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
                        <CardContent className="p-6">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                                <MapPin className="h-6 w-6" />
                                Localização
                            </h3>

                            <div className="space-y-3 text-white">
                                <p className="flex items-start gap-2">
                                    <MapPin className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="block text-yellow-400 mb-1">Endereço:</strong>
                                        BA 099, km 90 da linha verde, nº 01<br />
                                        Bairro: Comunidade Limoeiro<br />
                                        Cidade: Entre Rios - BA<br />
                                        CEP: 48.180-000
                                    </span>
                                </p>

                                <Button
                                    className="w-full mt-4 bg-yellow-400 text-blue-900 hover:bg-yellow-500"
                                    onClick={() => window.open('https://maps.google.com/?q=BA 099, km 90, Entre Rios, BA', '_blank')}
                                >
                                    Ver no Mapa
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Horário de Atendimento */}
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all">
                        <CardContent className="p-6">
                            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                                <Clock className="h-6 w-6" />
                                Atendimento
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-blue-200 text-sm mb-2">Secretaria</p>
                                    <div className="space-y-1 text-white">
                                        <p className="font-semibold">Segunda a Sexta</p>
                                        <p className="text-sm">8h às 18h</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-blue-200 text-sm mb-2">WhatsApp</p>
                                    <div className="space-y-1 text-white">
                                        <p className="font-semibold">Disponível 24/7</p>
                                        <p className="text-sm">Respondemos em até 2h úteis</p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                                    onClick={() => window.open('https://wa.me/5571983384883', '_blank')}
                                >
                                    Falar no WhatsApp
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-12 border-y border-white/10">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-yellow-400 mb-2">23+</div>
                        <div className="text-blue-200">Anos de Experiência</div>
                    </div>
                    <div className="text-center">
                        <div className="text-5xl font-bold text-yellow-400 mb-2">1000+</div>
                        <div className="text-blue-200">Alunos Formados</div>
                    </div>
                    <div className="text-center">
                        <div className="text-5xl font-bold text-yellow-400 mb-2">7</div>
                        <div className="text-blue-200">Países Atendidos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-5xl font-bold text-yellow-400 mb-2">100%</div>
                        <div className="text-blue-200">Online</div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-blue-200 text-sm mb-2">
                        © 2025 FAITEL - Faculdade Internacional Teológica de Líderes
                    </p>
                    <p className="text-blue-300 text-xs">
                        Todos os direitos reservados | Desde 1999 formando líderes
                    </p>
                </div>
            </div>
        </footer>
    );
}
