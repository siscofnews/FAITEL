import { Phone, ShoppingCart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TranslatedText } from "@/components/TranslatedText";

import livroArtePastorear from "@/assets/livros/arte-de-pastorear.png";
import livroPilares from "@/assets/livros/pilares-ministerial.png";
import livroEquilibrio from "@/assets/livros/equilibrio-pastoral.png";
import livroBibliaCodigos from "@/assets/livros/biblia-codigos.png";

const books = [
  {
    id: 1,
    title: "A Arte de Pastorear",
    author: "Valdinei da Conceição Santos",
    image: livroArtePastorear,
    description: "Um guia essencial para pastores e líderes sobre a arte de cuidar do rebanho de Deus."
  },
  {
    id: 2,
    title: "Pilares de uma Vida Ministerial Bem Sucedida",
    author: "Pr. Valdinei Santos",
    image: livroPilares,
    description: "Fundamentos bíblicos para construir um ministério sólido e duradouro."
  },
  {
    id: 3,
    title: "Equilíbrio Pastoral e Ministerial",
    author: "Valdinei da Conceição Santos",
    image: livroEquilibrio,
    description: "Como manter a saúde emocional, espiritual e familiar no ministério."
  },
  {
    id: 4,
    title: "A Bíblia e Seus Códigos",
    author: "Valdinei da Conceição Santos",
    image: livroBibliaCodigos,
    description: "Descubra os mistérios e revelações escondidas nas Escrituras Sagradas."
  }
];

export function BooksSection() {
  const phoneNumber = "5575991018395";
  const whatsappMessage = "Olá! Gostaria de adquirir um dos livros do Pastor Valdinei Santos.";

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-gold" />
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              <TranslatedText>Livros</TranslatedText> <span className="text-gold"><TranslatedText>Autorais</TranslatedText></span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <TranslatedText>Obras do Pastor Valdinei da Conceição Santos para edificação da Igreja e crescimento ministerial</TranslatedText>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {books.map((book) => (
            <Card key={book.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-navy text-lg mb-1 line-clamp-2 group-hover:text-gold transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-gold font-medium mb-2">{book.author}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {book.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-navy to-navy/90 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-white">
            <ShoppingCart className="h-10 w-10 text-gold flex-shrink-0" />
            <div>
              <h3 className="text-xl md:text-2xl font-bold"><TranslatedText>Adquira seus livros!</TranslatedText></h3>
              <p className="text-white/70 text-sm md:text-base">
                <TranslatedText>Entre em contato pelo WhatsApp para fazer seu pedido</TranslatedText>
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="gold" size="lg" className="gap-2 text-lg">
              <Phone className="h-5 w-5" />
              (75) 99101-8395
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
