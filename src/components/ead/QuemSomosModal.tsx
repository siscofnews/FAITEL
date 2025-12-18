import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QuemSomosModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QuemSomosModal({ isOpen, onClose }: QuemSomosModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-blue-900 text-center">
                        Quem Somos
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    {/* Introdução */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardContent className="p-6">
                            <p className="text-lg">
                                A <strong className="text-blue-900">FAITEL – Faculdade Internacional de Líderes</strong> é uma instituição com{' '}
                                <strong className="text-purple-700">23 anos de trajetória</strong>, marcada pelo compromisso com a educação,
                                a formação teológica, acadêmica e o desenvolvimento de líderes preparados para atuar com excelência no Brasil
                                e no exterior.
                            </p>
                        </CardContent>
                    </Card>

                    {/* História */}
                    <section>
                        <h3 className="text-2xl font-bold text-blue-900 mb-4">Nossa História</h3>
                        <p className="mb-4">
                            A FAITEL foi fundada na cidade de <strong>Maceió</strong>, no estado de <strong>Alagoas</strong>, no bairro
                            Jacintinho, pelo <strong>Pastor Valdinei da Conceição Santos</strong> e pela{' '}
                            <strong>Pastora Thelma Santana Menezes Santos</strong>, que exercem a liderança institucional da faculdade.
                        </p>
                        <p>
                            Antes mesmo de sua oficialização, o Pastor Valdinei já atuava como educador, ministrando aulas e formando
                            alunos por meio de materiais de instituições reconhecidas, como <strong>EETAD</strong>, <strong>IBADEP</strong> e{' '}
                            <strong>CETADEB</strong>, experiência que contribuiu de forma decisiva para a construção da base pedagógica da FAITEL.
                        </p>
                    </section>

                    {/* Liderança */}
                    <section className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold text-blue-900 mb-4">Liderança Institucional</h3>

                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Foto do Chanceler */}
                                <div className="flex-shrink-0">
                                    <img
                                        src="/images/faitel/chanceler-valdinei-oficial.jpg"
                                        alt="Bel. Dr. Valdinei da Conceição Santos - Chanceler FAITEL"
                                        className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-lg shadow-lg border-4 border-blue-900"
                                    />
                                </div>

                                {/* Informações do Chanceler */}
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-purple-700 mb-2">
                                        Bel. Dr. Valdinei da Conceição Santos - Chanceler
                                    </h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Formado pela <strong>FATAD</strong> – Faculdade Teológica de Aracruz, no Espírito Santo</li>
                                        <li>Formação superior em <strong>Administração</strong></li>
                                        <li>Pós-graduação em <strong>Ciências da Religião</strong> pela FATIM, em Minas Gerais</li>
                                        <li>Presidente da <strong>CEMADEB</strong> – Convenção Evangélica de Ministros das Assembleias de Deus no Exterior e no Brasil</li>
                                        <li>Presidente da <strong>IADMA</strong> – Igreja Assembleia de Deus Missão Apostólica</li>
                                        <li>Presidente do <strong>SETEPOS</strong> – Seminário Evangélico Teológico para Obreiros</li>
                                        <li>Presidente do <strong>CFIDH</strong> – Conselho e Federação Investigativa dos Direitos Humanos</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Foto da Vice-Presidente */}
                                <div className="flex-shrink-0">
                                    <img
                                        src="/images/faitel/vice-presidente-thelma.jpg"
                                        alt="Bel. Pastora Thelma Santana Menezes Santos - Vice-Presidente FAITEL"
                                        className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-lg shadow-lg border-4 border-purple-700"
                                    />
                                </div>

                                {/* Informações da Vice-Presidente */}
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-purple-700 mb-2">
                                        Bel. Pastora Thelma Santana Menezes Santos - Vice-Presidente
                                    </h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li><strong>Escritora e Professora</strong></li>
                                        <li>Bacharel em <strong>Teologia</strong></li>
                                        <li>Bacharela em <strong>Direito</strong></li>
                                        <li>Vice-Presidente da <strong>FAITEL</strong> – Faculdade Internacional Teológica de Líderes</li>
                                        <li>Vice-Presidente da <strong>IADMA</strong> – Igreja Assembleia de Deus Missão Apostólica</li>
                                        <li>Vice-Presidente da <strong>CEMADEB</strong> – Convenção Evangélica de Ministros das Assembleias de Deus no Exterior e no Brasil</li>
                                    </ul>
                                    <p className="mt-3 text-gray-700">
                                        Contribui de forma estratégica para a administração, organização e fortalecimento das atividades
                                        educacionais, eclesiásticas e sociais desenvolvidas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Excelência Acadêmica */}
                    <section>
                        <h3 className="text-2xl font-bold text-blue-900 mb-4">Excelência Acadêmica</h3>
                        <div className="space-y-3">
                            <p>
                                A FAITEL conta com um <strong>corpo docente qualificado e comprometido</strong>, reconhecido pela
                                seriedade acadêmica e dedicação ao ensino.
                            </p>
                            <p>
                                Seus <strong>manuais didáticos são de autoria própria</strong>, desenvolvidos com identidade institucional
                                e qualidade pedagógica, sendo todos devidamente <strong>registrados na Agência Brasileira do ISBN</strong>,
                                garantindo legitimidade, originalidade e reconhecimento legal.
                            </p>
                        </div>
                    </section>

                    {/* Presença Internacional */}
                    <section className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold text-blue-900 mb-4">Presença Internacional</h3>
                        <p className="mb-4">
                            Ao longo de sua história, a FAITEL tem formado alunos e líderes que hoje atuam em diversas áreas,
                            contando com <strong>núcleos e polos de ensino no Brasil e no exterior</strong>.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-bold text-purple-700 mb-2">🇧🇷 Brasil</h4>
                                <p>Polos e núcleos em diversos estados brasileiros</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-purple-700 mb-2">🌍 Exterior</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>🇫🇷 França</li>
                                    <li>🇵🇹 Portugal</li>
                                    <li>🇧🇪 Bélgica</li>
                                    <li>🇩🇪 Alemanha</li>
                                    <li>🇲🇿 Moçambique (África)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Missão */}
                    <section className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg border-l-4 border-purple-700">
                        <h3 className="text-2xl font-bold text-blue-900 mb-4">Nossa Missão</h3>
                        <p className="text-lg italic">
                            Com uma história construída sobre <strong>princípios cristãos</strong>,{' '}
                            <strong>excelência acadêmica</strong> e <strong>compromisso social</strong>, a FAITEL segue avançando
                            e expandindo, mantendo sua missão de formar líderes preparados para servir à sociedade, à igreja e às
                            nações, com <strong>ética, conhecimento e propósito</strong>.
                        </p>
                    </section>

                    {/* Estatísticas */}
                    <section>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <div className="text-3xl font-bold text-blue-900">23</div>
                                <div className="text-sm text-gray-700">Anos de História</div>
                            </div>
                            <div className="bg-purple-100 p-4 rounded-lg">
                                <div className="text-3xl font-bold text-purple-900">5</div>
                                <div className="text-sm text-gray-700">Países</div>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg">
                                <div className="text-3xl font-bold text-green-900">50+</div>
                                <div className="text-sm text-gray-700">Manuais Próprios</div>
                            </div>
                            <div className="bg-yellow-100 p-4 rounded-lg">
                                <div className="text-3xl font-bold text-yellow-900">100%</div>
                                <div className="text-sm text-gray-700">ISBN Registrado</div>
                            </div>
                        </div>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
