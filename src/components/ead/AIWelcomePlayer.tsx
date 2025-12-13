import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, Play } from "lucide-react";

export function AIWelcomePlayer({ primary = "#003399", secondary = "#FFCC00" }: { primary?: string; secondary?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const script = `Bem-vindo à FAITEL. É uma alegria receber você para uma jornada de estudo e conhecimento da Bíblia. Que este curso fortaleça sua fé, amplie sua compreensão das Escrituras e te conduza em sabedoria. Conte com nossos professores e com a nossa plataforma para avançar com excelência.`;
  useEffect(()=>{
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(script);
    u.lang = 'pt-BR';
    u.rate = 1.0;
    u.pitch = 1.0;
    u.onstart = ()=> setSpeaking(true);
    u.onend = ()=> { setSpeaking(false); setPaused(false); };
    u.onerror = ()=> { setSpeaking(false); setPaused(false); };
    utterRef.current = u;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return ()=> { window.speechSynthesis.cancel(); };
  },[]);
  const togglePause = () => {
    if (!('speechSynthesis' in window)) return;
    if (!speaking) return;
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };
  const replay = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(script);
    u.lang = 'pt-BR';
    u.rate = 1.0;
    u.pitch = 1.0;
    u.onstart = ()=> setSpeaking(true);
    u.onend = ()=> { setSpeaking(false); setPaused(false); };
    u.onerror = ()=> { setSpeaking(false); setPaused(false); };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  };
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
      <div className="aspect-video" style={{ background: `radial-gradient(closest-side, ${secondary} 0%, ${primary} 40%, #0a1f5f 100%)` }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="text-white text-2xl font-bold mb-2">Boas‑vindas ao estudo da Bíblia</div>
            <div className="text-white/80 text-sm mb-4">Mensagem gerada por IA com áudio em português</div>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" onClick={togglePause} className="bg-white/10 text-white border-white/30">
                {paused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                {paused ? 'Retomar' : 'Pausar'}
              </Button>
              <Button variant="outline" onClick={replay} className="bg-white/10 text-white border-white/30">
                <Volume2 className="w-4 h-4 mr-1" />
                Reproduzir
              </Button>
            </div>
          </div>
        </div>
        <style>{`
          .pulse-ring::before { content: ''; position: absolute; inset: -40px; border-radius: 50%; background: ${secondary}; filter: blur(40px); opacity: .2; animation: pulse 6s infinite alternate; }
          @keyframes pulse { from { transform: scale(1) } to { transform: scale(1.05) } }
        `}</style>
      </div>
    </div>
  );
}

