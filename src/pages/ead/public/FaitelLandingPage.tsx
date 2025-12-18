import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Users, Award, Menu, X, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BibliotecaFAITEL from "@/components/ead/BibliotecaFAITEL";
import CursosProfissionalizantes from "@/components/ead/CursosProfissionalizantes";
import VitrineSECC from "@/components/ead/VitrineSECC";
import ContatoFAITEL from "@/components/ead/ContatoFAITEL";
import GraduationGallery from "@/components/ead/GraduationGallery";
import bannerInscricoes from "@/assets/banners/faitel-inscricoes.png";
import bibliologiaImg from "@/assets/cursos-destaque/bibliologia.png";
import teologiaModuloCapa from "@/assets/livros/teologia-modulo1.jpg";
import cristologiaCapa from "@/assets/livros/cristologia-capa.jpg";
import cristologiaVerso from "@/assets/livros/cristologia-verso.jpg";

export default function FaitelLandingPage() {
    const navigate = useNavigate();
    const [faculdade, setFaculdade] = useState<any>(null);
    const [cursos, setCursos] = useState<any[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openBook, setOpenBook] = useState<{ title:string; images:string[] }|null>(null);
    const forceStatic = true;

    useEffect(() => {
        fetchFaculdadeData();
        fetchCursos();
    }, []);

    const fetchFaculdadeData = async () => {
        const { data } = await supabase
            .from('ead_faculdades')
            .select('*')
            .eq('status', 'ativo')
            .limit(1)
            .single();

        setFaculdade(data);
    };

    const fetchCursos = async () => {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .eq('is_active', true)
            .limit(6);

        setCursos(data || []);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header/Menu */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            {faculdade?.logo_url ? (
                                <img src={faculdade.logo_url} alt="FAITEL" className="h-14 w-auto" />
                            ) : (
                                <GraduationCap className="w-10 h-10 text-primary" />
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {faculdade?.nome_fantasia || 'FAITEL'}
                                </h1>
                                <p className="text-xs text-gray-600">Educação Teológica Online</p>
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#inicio" className="text-gray-700 hover:text-primary font-medium">
                                Início
                            </a>
                            <a href="#cursos" className="text-gray-700 hover:text-primary font-medium">
                                Cursos
                            </a>
                            <a href="#sobre" className="text-gray-700 hover:text-primary font-medium">
                                Sobre
                            </a>
                            <a href="#contato" className="text-gray-700 hover:text-primary font-medium">
                                Contato
                            </a>
                            <a href="#vestibular" className="text-gray-700 hover:text-primary font-medium">
                                Vestibular
                            </a>
                            <a href="#ead" className="text-gray-700 hover:text-primary font-medium">
                                EAD
                            </a>
                            <Button onClick={() => navigate('/login')}>
                                Área do Aluno
                            </Button>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden pb-4 space-y-2">
                            <a href="#inicio" className="block py-2 text-gray-700 hover:text-primary">
                                Início
                            </a>
                            <a href="#cursos" className="block py-2 text-gray-700 hover:text-primary">
                                Cursos
                            </a>
                            <a href="#sobre" className="block py-2 text-gray-700 hover:text-primary">
                                Sobre
                            </a>
                            <a href="#contato" className="block py-2 text-gray-700 hover:text-primary">
                                Contato
                            </a>
                            <Button onClick={() => navigate('/login')} className="w-full mt-2">
                                Área do Aluno
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {/* Barra de Navegação (estilo desejado) */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 sticky top-0 z-40 shadow">
              <div className="container mx-auto px-4 h-12 flex items-center justify-between">
                <nav className="flex items-center gap-6 text-white text-sm font-bold">
                  <a className="hover:text-yellow-300" onClick={()=>window.scrollTo({ top: 0, behavior: 'smooth' })}>HOME</a>
                  <div className="relative group">
                    <button className="hover:text-yellow-300">VESTIBULAR <span className="opacity-70">›</span></button>
                    <div className="absolute left-0 top-full hidden group-hover:block bg-blue-900 text-white shadow-lg rounded-b w-64 py-2">
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/vestibular-online-2026', '_blank')}>VESTIBULAR ONLINE 2026</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/vestibular-agendado-2026', '_blank')}>VESTIBULAR AGENDADO 2026</a>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="hover:text-yellow-300">EAD <span className="opacity-70">›</span></button>
                    <div className="absolute left-0 top-full hidden group-hover:block bg-blue-900 text-white shadow-lg rounded-b w-64 py-2">
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>navigate('/login')}>ACESSE SUA SALA</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://wa.me/5571983384883?text=Olá, preciso de atendimento', '_blank')}>FAQ DE ATENDIMENTO</a>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="hover:text-yellow-300">BIBLIOTECA <span className="opacity-70">›</span></button>
                    <div className="absolute left-0 top-full hidden group-hover:block bg-blue-900 text-white shadow-lg rounded-b w-64 py-2">
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>document.getElementById('biblioteca')?.scrollIntoView({ behavior: 'smooth' })}>GUIA E LINK</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/abnt-colecao', '_blank')}>ABNT COLEÇÃO</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' })}>GALERIA DE FORMATURA</a>
                    </div>
                  </div>
                  <a className="hover:text-yellow-300" onClick={()=>window.open('https://wa.me/5571983384883?text=Olá, preciso de atendimento', '_blank')}>FAQ DE ATENDIMENTO</a>
                  <div className="relative group">
                    <button className="hover:text-yellow-300">INSTITUCIONAL <span className="opacity-70">›</span></button>
                    <div className="absolute left-0 top-full hidden group-hover:block bg-blue-900 text-white shadow-lg rounded-b w-64 py-2">
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/missao-visao', '_blank')}>MISSÃO, VISÃO E VALORES</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/regimento', '_blank')}>REGIMENTO</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/ouvidoria', '_blank')}>OUVIDORIA</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/adm-academica', '_blank')}>ADMINISTRAÇÃO ACADÊMICA</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/cpa', '_blank')}>CPA</a>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="hover:text-yellow-300">ENSINO <span className="opacity-70">›</span></button>
                    <div className="absolute left-0 top-full hidden group-hover:block bg-blue-900 text-white shadow-lg rounded-b w-64 py-2">
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>document.getElementById('bacharelado')?.scrollIntoView({ behavior: 'smooth' })}>BACHARELADO EM TEOLOGIA</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/graduacao', '_blank')}>GRADUAÇÃO</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/graduacao-ead', '_blank')}>GRADUAÇÃO EAD</a>
                      <a className="block px-4 py-2 hover:bg-blue-800" onClick={()=>window.open('https://faitel.edu.br/pos-graduacao', '_blank')}>PÓS GRADUAÇÃO</a>
                    </div>
                  </div>
                  <a className="hover:text-yellow-300" onClick={()=>navigate('/login')}>ACESSO <span className="opacity-70">›</span></a>
                  <a className="hover:text-yellow-300" onClick={()=>window.open('mailto:siscofnews@gmail.com')}>CONTATO</a>
                </nav>
                <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-bold">INSCREVA-SE</Button>
              </div>
            </div>


            {/* Carousel de Banners Rotativo Automático */}
            <section id="inicio" className="relative overflow-hidden">
                <div className="relative h-[200px] md:h-[280px]">
                    {/* Banner Real - FAITEL Inscrições Abertas */}
                    <div
                        className="absolute inset-0 transition-opacity duration-1000"
                        style={{
                            backgroundImage: `url(${bannerInscricoes})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Button size="lg" className="bg-yellow-400 text-blue-900 hover:bg-yellow-500 font-bold text-xl px-12 py-6 shadow-2xl">
                                INSCREVA-SE AGORA!
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes carousel-fade {
                    0%, 30% { opacity: 1; }
                    35%, 95% { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}</style>

            {/* Hero Section */}
            <section id="inicio" className="py-20 px-4">
                <div className="container mx-auto text-center max-w-4xl">
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Transforme Sua Vocação em
                        <span className="text-primary block mt-2">Ministério Profissional</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Estude teologia de forma prática, acessível e com certificação reconhecida.
                        100% online, no seu ritmo, com professores qualificados.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/login')}>
                            Comece Agora Gratuitamente
                            <ChevronRight className="ml-2" />
                        </Button>
                        <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                            Conheça os Cursos
                        </Button>
                    </div>
                </div>
            </section>

            {/* Portal Access Buttons */}
            <section className="py-12 px-4 bg-white border-y-4 border-blue-600">
              <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Acesso aos Portais
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Portal do Aluno */}
                        <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-500 overflow-hidden group cursor-pointer"
                            onClick={() => navigate('/login?portal=aluno')}>
                            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white">
                                <GraduationCap className="h-16 w-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-2xl font-bold text-center mb-2">Portal do Aluno</h3>
                                <p className="text-center text-blue-100 text-sm">Acesse suas aulas e materiais</p>
                            </div>
                            <CardContent className="p-6 text-center">
                                <p className="text-gray-600 mb-4">
                                    Acompanhe seu progresso, assista aulas e baixe certificados
                                </p>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    Entrar como Aluno
                                    <ChevronRight className="ml-2" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Portal do Professor */}
                        <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-500 overflow-hidden group cursor-pointer"
                            onClick={() => navigate('/login?portal=professor')}>
                            <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 text-white">
                                <Users className="h-16 w-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-2xl font-bold text-center mb-2">Portal do Professor</h3>
                                <p className="text-center text-green-100 text-sm">Gerencie suas turmas</p>
                            </div>
                            <CardContent className="p-6 text-center">
                                <p className="text-gray-600 mb-4">
                                    Publique conteúdo, acompanhe alunos e gerencie avaliações
                                </p>
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    Entrar como Professor
                                    <ChevronRight className="ml-2" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Portal do Administrador */}
                        <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-purple-500 overflow-hidden group cursor-pointer"
                            onClick={() => navigate('/login?portal=admin')}>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-6 text-white">
                                <Award className="h-16 w-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-2xl font-bold text-center mb-2">Portal Administrativo</h3>
                                <p className="text-center text-purple-100 text-sm">Gestão completa da plataforma</p>
                            </div>
                            <CardContent className="p-6 text-center">
                                <p className="text-gray-600 mb-4">
                                    Gerencie faculdade, cursos, professores e alunos
                                </p>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                    Entrar como Admin
                                    <ChevronRight className="ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
              </div>
            </section>

            {/* Bacharelado em Teologia */}
            <section id="bacharelado" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
              <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">Bacharelado em Teologia</h2>
                  <p className="text-gray-600">Formação Teológica Completa e Interconfessional</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white shadow border text-center">
                    <p className="text-2xl font-bold">36 meses</p>
                    <p className="text-sm text-gray-600">Duração</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white shadow border text-center">
                    <p className="text-2xl font-bold">EAD</p>
                    <p className="text-sm text-gray-600">A Distância</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white shadow border text-center">
                    <p className="text-2xl font-bold">2900 h</p>
                    <p className="text-sm text-gray-600">Carga Horária</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white shadow border text-center">
                    <p className="text-2xl font-bold">Nota 5</p>
                    <p className="text-sm text-gray-600">MEC</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow border p-6">
                    <h3 className="text-xl font-bold mb-3">Sobre o Bacharelado em Teologia</h3>
                    <p className="text-gray-700 mb-3">O curso de Teologia da FAITEL estuda o campo teórico investigativo da teologia, do ensino, da aprendizagem e do trabalho comunitário presentes na prática profissional do teólogo.</p>
                    <p className="text-gray-700 mb-3">Nossa formação capacita você a exercer funções de liderança e gestão nas comunidades, mobilizar pessoas em torno de projetos humanitários, além de produzir e difundir conhecimento em contextos religiosos.</p>
                    <p className="text-gray-700">Com um corpo docente composto por mestres, doutores e pós-doutores, você terá acesso a um ensino de excelência reconhecido pelo MEC com nota máxima.</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow border p-6">
                    <h3 className="text-xl font-bold mb-3">O que você vai aprender</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>Teologia Bíblica do Antigo e Novo Testamento</li>
                      <li>Línguas bíblicas (Hebraico e Grego)</li>
                      <li>Hermenêutica e Exegese Bíblica</li>
                      <li>Teologia Sistemática completa</li>
                      <li>História da Igreja</li>
                      <li>Homilética e Comunicação</li>
                      <li>Liderança e Gestão Eclesiástica</li>
                      <li>Aconselhamento Pastoral</li>
                      <li>Missões e Evangelização</li>
                      <li>Ética Cristã e Teologia Pública</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 bg-white rounded-2xl shadow border p-6">
                  <h3 className="text-xl font-bold mb-3">Metodologia</h3>
                  <p className="text-gray-700">O curso possui modalidade EAD com uma aula ao vivo semanal, permitindo que você estude com flexibilidade enquanto mantém interação direta com professores e colegas. Também realizamos estágio supervisionado em práticas pastorais para aliar teoria e prática.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button onClick={()=>navigate('/login')} className="text-lg">Inscreva-se</Button>
                    <Button variant="outline" className="text-lg" onClick={()=>window.open('https://faitel.edu.br/graduacao-ead', '_blank')}>Saiba mais</Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-primary text-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold mb-2">500+</div>
                            <div className="text-primary-foreground/80">Alunos Formados</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">20+</div>
                            <div className="text-primary-foreground/80">Cursos Disponíveis</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">15+</div>
                            <div className="text-primary-foreground/80">Professores Doutores</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">100%</div>
                            <div className="text-primary-foreground/80">Online e Flexível</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cursos em Destaque */}
            <section id="cursos" className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Cursos em Destaque
                        </h2>
                        <p className="text-lg text-gray-600">
                            Escolha o curso ideal para sua jornada ministerial
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {!forceStatic && cursos.length > 0 ? (
                            cursos.map((curso) => {
                                const lower = (curso.title || '').toLowerCase();
                                const lowerDesc = (curso.description || '').toLowerCase();
                                const pickFallback = () => {
                                  if (lower.includes('cristologia')) return cristologiaCapa;
                                  if (lower.includes('teologia') || lowerDesc.includes('teologia')) return teologiaModuloCapa;
                                  return bibliologiaImg;
                                };
                                const cover = curso.cover_url || pickFallback();
                                return (
                                    <Card key={curso.id} className="hover:shadow-xl transition-shadow overflow-hidden group" onClick={()=>{
                                      const imgs = cover===cristologiaCapa ? [cristologiaCapa, cristologiaVerso] : [cover];
                                      setOpenBook({ title: curso.title, images: imgs });
                                    }}>
                                        <div className="h-48 bg-white flex items-center justify-center overflow-hidden">
                                            <img
                                              src={cover}
                                              alt={curso.title}
                                              className="max-h-full w-auto object-contain"
                                              loading="lazy"
                                              onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = pickFallback(); }}
                                            />
                                        </div>
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold mb-2">{curso.title}</h3>
                                            <p className="text-gray-600 mb-4 line-clamp-2">
                                                {curso.description || 'Curso completo de teologia com certificação'}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">
                                                    {curso.duration || '6 meses'}
                                                </span>
                                                <Button variant="ghost" size="sm">
                                                    Saiba Mais →
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            // Cursos de exemplo com imagens
                            <>
                                {[
                                    {
                                        title: 'Bibliologia - Curso Básico em Teologia',
                                        desc: 'Curso completo sobre os pilares do cristianismo, ideal para novos convertidos e membros que desejam aprofundar sua fé',
                                        img: bibliologiaImg,
                                        duration: '6 meses'
                                    },
                                    {
                                        title: 'Teologia - Módulo 1',
                                        desc: 'Curso completo de teologia com certificação',
                                        img: teologiaModuloCapa,
                                        duration: '6 meses'
                                    },
                                    {
                                        title: 'Cristologia',
                                        desc: 'Matéria do Básico e Médio em Teologia (Ciclo I) – Frente e Verso disponíveis',
                                        img: cristologiaCapa,
                                        duration: '6 meses'
                                    }
                                ].map((curso, i) => (
                                    <Card key={i} className="hover:shadow-xl transition-shadow overflow-hidden group" onClick={()=>{
                                      const lowerT = curso.title.toLowerCase();
                                      const imgs = lowerT.includes('cristologia') ? [cristologiaCapa, cristologiaVerso] : lowerT.includes('bibliologia') ? [bibliologiaImg] : lowerT.includes('teologia') ? [teologiaModuloCapa] : [curso.img||bibliologiaImg];
                                      setOpenBook({ title: curso.title, images: imgs });
                                    }}>
                                        <div className="h-48 bg-white flex items-center justify-center overflow-hidden">
                                            {curso.img ? (
                                                <img
                                                    src={curso.img}
                                                    alt={curso.title}
                                                    className="max-h-full w-auto object-contain"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                                                    <BookOpen className="w-20 h-20 text-white opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-bold mb-2">{curso.title}</h3>
                                            <p className="text-gray-600 mb-4">{curso.desc}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">{curso.duration}</span>
                                                <Button variant="ghost" size="sm">
                                                    Saiba Mais →
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="text-center mt-12">
                        <Button size="lg" variant="outline">
                            Ver Todos os Cursos
                        </Button>
                    </div>
                </div>
            </section>

            <Dialog open={!!openBook} onOpenChange={(v)=>{ if(!v) setOpenBook(null); }}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>{openBook?.title}</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4">
                  {openBook?.images.map((src,i)=>(
                    <div key={i} className="bg-white flex items-center justify-center overflow-hidden rounded">
                      <img src={src} alt={`Capa ${i+1}`} className="max-h-[70vh] w-auto object-contain" />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Diferenciais */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Por que Estudar na FAITEL?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Certificação Reconhecida</h3>
                            <p className="text-gray-600">
                                Diplomas válidos e reconhecidos para atuação ministerial
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Professores Qualificados</h3>
                            <p className="text-gray-600">
                                Corpo docente com mestrado e doutorado em teologia
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Flexibilidade Total</h3>
                            <p className="text-gray-600">
                                Estude no seu ritmo, onde e quando quiser
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-primary text-white">
                <div className="container mx-auto text-center max-w-3xl">
                    <h2 className="text-4xl font-bold mb-6">
                        Pronto para Começar Sua Jornada?
                    </h2>
                    <p className="text-xl mb-8 text-primary-foreground/90">
                        Matricule-se hoje e ganhe acesso imediato a todos os cursos
                    </p>
                    <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                        Fazer Matrícula Agora
                    </Button>
                </div>
            </section>

            {/* Cursos Profissionalizantes */}
            <CursosProfissionalizantes />

            {/* Vitrine SECC - Revistas Trimestrais */}
            <VitrineSECC />

            {/* Biblioteca FAITEL */}
            <BibliotecaFAITEL />

            {/* Galeria de Formatura */}
            <GraduationGallery />

            {/* Contato e Footer */}
            <ContatoFAITEL />
        </div>
    );
}
