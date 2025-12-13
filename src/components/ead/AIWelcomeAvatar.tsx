import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, Play } from "lucide-react";

export function AIWelcomeAvatar({ avatarUrl, name = 'Chanceler', primary = '#003399', secondary = '#FFCC00' }: { avatarUrl?: string|null; name?: string; primary?: string; secondary?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const script = `Bem-vindo à FAITEL. É uma alegria receber você para uma jornada de estudo e conhecimento da Bíblia. Que este curso fortaleça sua fé e amplie sua compreensão das Escrituras.`;
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
  const initials = (name||'FAITEL').split(' ').filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase();
  return (
    <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/20 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-4" style={{ borderColor: secondary }} />
          ) : (
            <div className="h-20 w-20 rounded-full flex items-center justify-center text-white text-xl font-bold border-4" style={{ background: primary, borderColor: secondary }}>{initials}</div>
          )}
          <div className="absolute -bottom-1 left-1 right-1 h-2 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full animate-pulse" />
        </div>
        <div>
          <div className="text-white font-semibold">{name}</div>
          <div className="text-white/70 text-xs">Mensagem de boas‑vindas gerada por IA</div>
          <div className="mt-2 flex gap-2">
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
    </div>
  );
}

