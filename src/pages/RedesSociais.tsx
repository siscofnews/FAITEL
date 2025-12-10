import { Link } from "react-router-dom";
import { ArrowLeft, Facebook, Instagram, Youtube, Twitter, MessageCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const socialMedia = [
  {
    name: "Facebook",
    icon: Facebook,
    description: "Siga nossa página no Facebook para receber notícias e atualizações diárias sobre o mundo evangélico.",
    followers: "50.000+ seguidores",
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700"
  },
  {
    name: "Instagram",
    icon: Instagram,
    description: "Acompanhe nosso Instagram para conteúdos visuais, stories e lives exclusivas.",
    followers: "35.000+ seguidores",
    color: "bg-gradient-to-r from-purple-600 to-pink-600",
    hoverColor: "hover:opacity-90"
  },
  {
    name: "YouTube",
    icon: Youtube,
    description: "Inscreva-se em nosso canal para assistir pregações, louvores e estudos bíblicos.",
    followers: "20.000+ inscritos",
    color: "bg-red-600",
    hoverColor: "hover:bg-red-700"
  },
  {
    name: "Twitter/X",
    icon: Twitter,
    description: "Siga-nos no Twitter para atualizações rápidas e debates sobre temas relevantes.",
    followers: "15.000+ seguidores",
    color: "bg-sky-500",
    hoverColor: "hover:bg-sky-600"
  }
];

const contacts = [
  {
    type: "WhatsApp",
    icon: MessageCircle,
    numbers: [
      "+55 71 98338-4883",
      "+55 71 99682-2782",
      "+55 75 99101-8395",
      "+55 75 99704-0153",
      "+55 75 99843-6345"
    ]
  },
  {
    type: "E-mail",
    icon: Mail,
    emails: [
      "siscofnews@gmail.com",
      "pr.vcsantos@gmail.com"
    ]
  }
];

export default function RedesSociais() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Portal
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            Nossas <span className="text-gold">Redes Sociais</span>
          </h1>
          <p className="text-white/70 mt-2">
            Conecte-se conosco nas redes sociais e fique por dentro de tudo
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Social Media Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy mb-6">Siga-nos nas Redes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {socialMedia.map((social) => (
              <Card key={social.name} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={`${social.color} p-8 flex items-center justify-center`}>
                      <social.icon className="h-12 w-12 text-white" />
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold text-navy mb-2">{social.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{social.description}</p>
                      <p className="text-gold font-semibold text-sm mb-4">{social.followers}</p>
                      <Button variant="outline" size="sm" className="border-navy text-navy hover:bg-navy hover:text-white">
                        Em breve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-navy mb-6">Entre em Contato</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* WhatsApp */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-navy">WhatsApp</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Entre em contato conosco pelo WhatsApp para atendimento rápido e personalizado.
                </p>
                <div className="space-y-2">
                  {contacts[0].numbers.map((number) => (
                    <a
                      key={number}
                      href={`https://wa.me/${number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-600 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {number}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-navy" />
                  </div>
                  <h3 className="text-xl font-bold text-navy">E-mail</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Envie-nos um e-mail para dúvidas, sugestões ou parcerias.
                </p>
                <div className="space-y-2">
                  {contacts[1].emails.map((email) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {email}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section>
          <Card className="bg-gradient-to-r from-navy to-navy/90 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Receba Nossas Novidades
              </h2>
              <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                Cadastre-se para receber notícias, eventos e conteúdos exclusivos diretamente no seu e-mail.
              </p>
              <Link to="/login">
                <Button variant="gold" size="lg">
                  Cadastre-se Agora
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
