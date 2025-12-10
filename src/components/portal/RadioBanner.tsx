import { useState } from "react";
import { Radio, Play, Pause, Volume2, VolumeX, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TranslatedText } from "@/components/TranslatedText";
import radioImage from "@/assets/radio-missoes.jpg";
import encontroFe from "@/assets/encontro-de-fe.jpg";

interface RadioBannerProps {
  streamUrl?: string;
}

export function RadioBanner({ streamUrl }: RadioBannerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audio] = useState(() => {
    if (streamUrl) {
      const audioElement = new Audio(streamUrl);
      audioElement.preload = "none";
      return audioElement;
    }
    return null;
  });

  const togglePlay = () => {
    if (!audio) {
      alert("Link da rádio será adicionado em breve!");
      return;
    }
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (audio) {
      audio.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  return (
    <section className="py-8 bg-gradient-to-br from-red-600 via-red-500 to-orange-500">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Radio Principal */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Radio Image */}
            <div className="relative flex-shrink-0">
              <img 
                src={radioImage} 
                alt="Rádio Missões pelo Mundo" 
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
              />
              {isPlaying && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="text-center sm:text-left text-white">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Radio className="h-5 w-5 text-white animate-pulse" />
                <span className="text-sm font-medium uppercase tracking-wider opacity-90"><TranslatedText>Ao Vivo 24h</TranslatedText></span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                <TranslatedText>Rádio Missões pelo Mundo</TranslatedText>
              </h3>
              <p className="text-white/80 text-sm mb-4 max-w-md">
                <TranslatedText>Músicas, pregações e mensagens inspiradoras</TranslatedText>
              </p>
              
              {/* Controls */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <Button 
                  onClick={togglePlay}
                  size="lg"
                  className="bg-white text-red-600 hover:bg-white/90 font-bold gap-2 shadow-lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5" />
                      <TranslatedText>Pausar</TranslatedText>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <TranslatedText>Ouvir Agora</TranslatedText>
                    </>
                  )}
                </Button>
                
                {audio && (
                  <Button
                    onClick={toggleMute}
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Programa em Destaque */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <img 
                  src={encontroFe}
                  alt="Encontro de Fé"
                  className="w-full sm:w-48 h-32 sm:h-auto object-cover"
                />
                <div className="p-4 text-white flex-1">
                  <Badge className="bg-gold text-navy mb-2"><TranslatedText>Programa em Destaque</TranslatedText></Badge>
                  <h4 className="text-xl font-bold mb-1"><TranslatedText>Encontro de Fé</TranslatedText></h4>
                  <p className="text-white/80 text-sm mb-3">
                    <TranslatedText>Apresentador:</TranslatedText> <span className="font-semibold">Pr. Valdinei Santos</span>
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-white/90">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <TranslatedText>Sábados</TranslatedText>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      10h às 12h
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mt-2">
                    Assembleia de Deus Missão Apostólica
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
