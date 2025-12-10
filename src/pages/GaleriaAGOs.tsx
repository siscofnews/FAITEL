import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Camera, 
  ChevronLeft, 
  ChevronRight, 
  Image, 
  MapPin, 
  X,
  ZoomIn 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageSelector } from "@/components/LanguageSelector";
import logoSiscof from "@/assets/logo-siscof.png";
import logoCemadeb from "@/assets/logo-cemadeb.png";

// AGO Photos imports
import agoCemadeb1 from "@/assets/ago/ago-cemadeb-1.jpg";
import agoCemadeb2 from "@/assets/ago/ago-cemadeb-2.jpg";
import agoCemadeb3 from "@/assets/ago/ago-cemadeb-3.jpg";
import agoCemadeb4 from "@/assets/ago/ago-cemadeb-4.jpg";
import agoCemadeb5 from "@/assets/ago/ago-cemadeb-5.jpg";
import agoCemadeb6 from "@/assets/ago/ago-cemadeb-6.jpg";
import agoCemadeb7 from "@/assets/ago/ago-cemadeb-7.jpg";
import agoCemadeb8 from "@/assets/ago/ago-cemadeb-8.jpg";
import agoCemadeb9 from "@/assets/ago/ago-cemadeb-9.jpg";
import agoCemadeb10 from "@/assets/ago/ago-cemadeb-10.jpg";
import agoCemadeb11 from "@/assets/ago/ago-cemadeb-11.jpg";
import agoCemadeb12 from "@/assets/ago/ago-cemadeb-12.jpg";
import agoCemadeb13 from "@/assets/ago/ago-cemadeb-13.jpg";
import agoCemadeb14 from "@/assets/ago/ago-cemadeb-14.jpg";

interface AGOPhoto {
  src: string;
  title: string;
  description: string;
}

interface AGOEdition {
  edition: string;
  year: string;
  theme: string;
  location: string;
  photos: AGOPhoto[];
}

const agoEditions: AGOEdition[] = [
  {
    edition: "30ª AGO",
    year: "2025",
    theme: "Expansão Internacional",
    location: "Bahia, Brasil",
    photos: [
      {
        src: agoCemadeb1,
        title: "Juventude em Oração",
        description: "Jovens da CEMADEB em momento de oração e consagração"
      },
      {
        src: agoCemadeb2,
        title: "Plenário Lotado",
        description: "Vista panorâmica do plenário durante a assembleia"
      },
      {
        src: agoCemadeb3,
        title: "Confraternização",
        description: "Pastores e líderes em momento de comunhão"
      },
      {
        src: agoCemadeb4,
        title: "Consagração Ministerial",
        description: "Momento solene de imposição de mãos"
      },
      {
        src: agoCemadeb5,
        title: "Reunião de Obreiros",
        description: "Pastores e obreiros durante os trabalhos"
      }
    ]
  },
  {
    edition: "5ª AGO",
    year: "2022",
    theme: "Filhinhos, é Já a Última Hora",
    location: "Entre Rios, Bahia",
    photos: [
      {
        src: agoCemadeb8,
        title: "Preparação do Evento",
        description: "Palco preparado para a 5ª Assembleia Geral Ordinária"
      },
      {
        src: agoCemadeb6,
        title: "Louvor e Adoração",
        description: "Multidão em momento de louvor durante a AGO"
      },
      {
        src: agoCemadeb9,
        title: "Plenário Geral",
        description: "Delegados e participantes durante os trabalhos"
      },
      {
        src: agoCemadeb12,
        title: "Mesa Diretora",
        description: "Diretoria conduzindo os trabalhos da assembleia"
      },
      {
        src: agoCemadeb13,
        title: "Pastores Reunidos",
        description: "Líderes ministeriais durante sessão plenária"
      }
    ]
  },
  {
    edition: "3ª AGO",
    year: "2019",
    theme: "A Fidelidade do Obreiro",
    location: "Bahia, Brasil",
    photos: [
      {
        src: agoCemadeb10,
        title: "Formatura FAITEL",
        description: "Cerimônia de formatura durante a 3ª AGO"
      },
      {
        src: agoCemadeb11,
        title: "Turma de Formandos",
        description: "Formandos em teologia com suas becas"
      }
    ]
  },
  {
    edition: "Formaturas e Eventos",
    year: "Diversos",
    theme: "Formação Teológica",
    location: "Bahia, Brasil",
    photos: [
      {
        src: agoCemadeb14,
        title: "Formatura SETEPOS",
        description: "Turma de formandos do Seminário Evangélico para Obreiros"
      },
      {
        src: agoCemadeb7,
        title: "Delegados CEMADEB",
        description: "Representantes e delegados em evento ministerial"
      }
    ]
  }
];

export default function GaleriaAGOs() {
  const [selectedImage, setSelectedImage] = useState<{ edition: number; photo: number } | null>(null);
  const [activeTab, setActiveTab] = useState("todas");

  const allPhotos = agoEditions.flatMap((edition, editionIndex) => 
    edition.photos.map((photo, photoIndex) => ({
      ...photo,
      editionIndex,
      photoIndex,
      editionName: edition.edition,
      year: edition.year
    }))
  );

  const openLightbox = (editionIndex: number, photoIndex: number) => {
    setSelectedImage({ edition: editionIndex, photo: photoIndex });
  };

  const closeLightbox = () => setSelectedImage(null);

  const getCurrentFlatIndex = () => {
    if (!selectedImage) return 0;
    let index = 0;
    for (let i = 0; i < selectedImage.edition; i++) {
      index += agoEditions[i].photos.length;
    }
    return index + selectedImage.photo;
  };

  const navigateFlat = (direction: "prev" | "next") => {
    const currentFlat = getCurrentFlatIndex();
    const totalPhotos = allPhotos.length;
    const newFlat = direction === "next" 
      ? (currentFlat + 1) % totalPhotos 
      : (currentFlat - 1 + totalPhotos) % totalPhotos;
    
    const photo = allPhotos[newFlat];
    setSelectedImage({ edition: photo.editionIndex, photo: photo.photoIndex });
  };

  const currentPhoto = selectedImage 
    ? agoEditions[selectedImage.edition].photos[selectedImage.photo] 
    : null;

  const currentEdition = selectedImage 
    ? agoEditions[selectedImage.edition] 
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy text-white py-4 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoSiscof} alt="SISCOF" className="w-10 h-10 object-contain" />
              <div>
                <span className="text-gold font-bold">SISCOF</span>
                <span className="text-white font-bold">News</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Link to="/">
                <Button variant="ghost" className="text-white hover:text-gold hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-navy via-navy-light to-navy text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[size:40px_40px]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center gap-4 mb-6">
            <img src={logoCemadeb} alt="CEMADEB" className="h-20 object-contain drop-shadow-lg" />
          </div>
          <Badge className="bg-gold text-navy mb-4 text-sm px-4 py-1">
            <Camera className="h-4 w-4 mr-2 inline" />
            Galeria Oficial
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Galeria de AGOs
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Registros históricos das Assembleias Gerais Ordinárias da CEMADEB - 
            Convenção Evangélica de Ministros das Assembleias de Deus no Exterior e no Brasil
          </p>
          <div className="flex justify-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-gold" />
              <span>{allPhotos.length} Fotos</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              <span>{agoEditions.length} Edições</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="todas" className="px-6">
                Todas as Fotos
              </TabsTrigger>
              {agoEditions.map((edition, index) => (
                <TabsTrigger key={index} value={`edition-${index}`} className="px-4 hidden md:inline-flex">
                  {edition.edition}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Mobile Edition Selector */}
          <div className="md:hidden mb-6">
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="todas">Todas as Fotos</option>
              {agoEditions.map((edition, index) => (
                <option key={index} value={`edition-${index}`}>
                  {edition.edition} ({edition.year})
                </option>
              ))}
            </select>
          </div>

          {/* All Photos Tab */}
          <TabsContent value="todas">
            <div className="space-y-12">
              {agoEditions.map((edition, editionIndex) => (
                <section key={editionIndex}>
                  <Card className="mb-6 border-gold/30 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-navy to-navy-light text-white">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <Badge className="bg-gold text-navy mb-2">{edition.year}</Badge>
                          <CardTitle className="text-2xl md:text-3xl">{edition.edition}</CardTitle>
                          <p className="text-white/80 mt-1 italic">"{edition.theme}"</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <MapPin className="h-4 w-4" />
                          <span>{edition.location}</span>
                          <span className="mx-2">•</span>
                          <Image className="h-4 w-4" />
                          <span>{edition.photos.length} fotos</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {edition.photos.map((photo, photoIndex) => (
                          <div
                            key={photoIndex}
                            className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
                            onClick={() => openLightbox(editionIndex, photoIndex)}
                          >
                            <img
                              src={photo.src}
                              alt={photo.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-gold/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                  <ZoomIn className="h-6 w-6 text-navy" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              ))}
            </div>
          </TabsContent>

          {/* Individual Edition Tabs */}
          {agoEditions.map((edition, editionIndex) => (
            <TabsContent key={editionIndex} value={`edition-${editionIndex}`}>
              <Card className="border-gold/30 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-navy to-navy-light text-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <Badge className="bg-gold text-navy mb-2">{edition.year}</Badge>
                      <CardTitle className="text-2xl md:text-3xl">{edition.edition}</CardTitle>
                      <p className="text-white/80 mt-1 italic">"{edition.theme}"</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <MapPin className="h-4 w-4" />
                      <span>{edition.location}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {edition.photos.map((photo, photoIndex) => (
                      <div
                        key={photoIndex}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        onClick={() => openLightbox(editionIndex, photoIndex)}
                      >
                        <img
                          src={photo.src}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <p className="text-white font-semibold">{photo.title}</p>
                            <p className="text-white/70 text-sm line-clamp-2">{photo.description}</p>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 bg-gold rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                              <ZoomIn className="h-7 w-7 text-navy" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-gold/10 to-gold/5 border-gold/30 p-8">
            <h3 className="text-2xl font-bold mb-4">Participe da Próxima AGO</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Junte-se a centenas de pastores e líderes na próxima Assembleia Geral Ordinária da CEMADEB. 
              Uma oportunidade única de comunhão, formação e crescimento ministerial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/lideranca">
                <Button className="bg-navy text-white hover:bg-navy-light">
                  Conheça Nossa Liderança
                </Button>
              </Link>
              <Link to="/cadastrar-igreja">
                <Button variant="outline" className="border-gold text-gold hover:bg-gold/10">
                  Cadastre sua Igreja
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} CEMADEB - Convenção Evangélica de Ministros das Assembleias de Deus no Exterior e no Brasil
          </p>
          <p className="text-gold text-xs mt-2">
            Todos os direitos reservados
          </p>
        </div>
      </footer>

      {/* Lightbox */}
      <Dialog open={selectedImage !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-[95vw] md:max-w-6xl p-0 bg-black/95 border-none">
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {currentPhoto && currentEdition && (
            <div className="relative">
              <div className="flex items-center justify-center min-h-[50vh] md:min-h-[70vh] p-4">
                <img
                  src={currentPhoto.src}
                  alt={currentPhoto.title}
                  className="max-h-[75vh] max-w-full object-contain rounded-lg"
                />
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => navigateFlat("prev")}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 hover:bg-gold/80 transition-colors group"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8 text-white group-hover:text-navy" />
              </button>
              <button
                onClick={() => navigateFlat("next")}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/10 hover:bg-gold/80 transition-colors group"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8 text-white group-hover:text-navy" />
              </button>

              {/* Photo Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <Badge className="bg-gold text-navy mb-2">{currentEdition.edition}</Badge>
                <h3 className="text-white text-xl font-bold">{currentPhoto.title}</h3>
                <p className="text-white/70">{currentPhoto.description}</p>
                <p className="text-white/50 text-sm mt-2">
                  {getCurrentFlatIndex() + 1} de {allPhotos.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
