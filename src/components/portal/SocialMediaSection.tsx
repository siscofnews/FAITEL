import { ExternalLink, GraduationCap, Church, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TranslatedText } from '@/components/TranslatedText';
import logoSiscof from '@/assets/logo-siscof.png';

const partners = [
  {
    name: 'FAITEL',
    fullName: 'Faculdade Internacional Teológica de Líderes',
    icon: GraduationCap,
    url: '#',
    color: 'from-amber-600 to-amber-400',
    description: 'Formação teológica de excelência para líderes e obreiros do Reino de Deus'
  },
  {
    name: 'SISCOF',
    fullName: 'Sistema de Gestão Eclesiástica',
    icon: Church,
    url: '/login',
    color: 'from-navy to-primary',
    description: 'Plataforma integrada para gestão de igrejas, escolas de culto e escalas litúrgicas',
    logo: logoSiscof
  },
  {
    name: 'CFIDH',
    fullName: 'Conselho e Federação Investigativa dos Direitos Humanos',
    icon: Scale,
    url: '#',
    color: 'from-emerald-600 to-emerald-400',
    description: 'Defesa e promoção dos direitos humanos em âmbito nacional e internacional'
  }
];

export const SocialMediaSection = () => {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          <TranslatedText>Nossos Parceiros</TranslatedText>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {partners.map((partner) => {
          const Icon = partner.icon;
          return (
            <Card 
              key={partner.name} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${partner.color} p-6 text-white min-h-[240px] flex flex-col`}>
                  <div className="flex items-center gap-3 mb-3">
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="h-12 w-12 object-contain bg-white rounded-lg p-1" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon className="h-7 w-7" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{partner.name}</h3>
                      <p className="text-white/80 text-xs leading-tight">{partner.fullName}</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm mb-4 flex-1">{partner.description}</p>
                  <Button
                    asChild
                    variant="secondary"
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <a 
                      href={partner.url} 
                      target={partner.url.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <TranslatedText>Saiba Mais</TranslatedText>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
