import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AIWelcomeAvatar } from "@/components/ead/AIWelcomeAvatar";
import { QualityVideoPlayer } from "@/components/ead/QualityVideoPlayer";
import { MainLayout } from "@/components/layout/MainLayout";
import { GraduationCap, ShieldCheck, PlayCircle, Zap, ExternalLink } from "lucide-react";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [brand, setBrand] = useState<{ name:string; chancellor?:string|null; logo?:string|null; avatar?:string|null; primary:string; secondary:string }>({ name:'FAITEL', chancellor:'', logo:'', avatar:'', primary:'#003399', secondary:'#FFCC00' });
  const [videoUrl, setVideoUrl] = useState<string>("https://www.youtube.com/embed/AGjmBe6b0zw");
  const [welcomeText, setWelcomeText] = useState<string>("Bem-vindo(a) à FAITEL. É uma alegria receber você para uma jornada de estudo e conhecimento da Bíblia.");
  const [channelUrl, setChannelUrl] = useState<string>("");
  const [videoSd, setVideoSd] = useState<string>("");
  const [videoHd, setVideoHd] = useState<string>("");
  useEffect(()=>{
    (async()=>{
      try {
        const params = new URLSearchParams(window.location.search);
        const fid = params.get('fid');
        if (fid) {
          const { data } = await supabase.from('college_matriz' as any).select('*').eq('id', fid).maybeSingle();
          if (data) { setBrand({ name: data.fantasy_name || data.legal_name || data.name || 'Faculdade', chancellor: data.chancellor_president || '', logo: data.logo_url, avatar: data.chancellor_avatar_url || data.logo_url, primary: data.brand_primary_color || '#003399', secondary: data.brand_secondary_color || '#FFCC00' }); if (data.institutional_video_url) { const u = data.institutional_video_url.includes('watch?v=') ? `https://www.youtube.com/embed/${data.institutional_video_url.split('watch?v=')[1]}` : data.institutional_video_url; setVideoUrl(u); } setVideoSd((data as any).institutional_video_sd_url||''); setVideoHd((data as any).institutional_video_hd_url||''); if ((data as any).youtube_channel_url) setChannelUrl((data as any).youtube_channel_url); }
        } else {
          const { data } = await supabase.from('college_matriz' as any).select('*').order('name').limit(1).maybeSingle();
          if (data) { setBrand({ name: data.fantasy_name || data.legal_name || data.name || 'Faculdade', chancellor: data.chancellor_president || '', logo: data.logo_url, avatar: data.chancellor_avatar_url || data.logo_url, primary: data.brand_primary_color || '#003399', secondary: data.brand_secondary_color || '#FFCC00' }); if (data.institutional_video_url) { const u = data.institutional_video_url.includes('watch?v=') ? `https://www.youtube.com/embed/${data.institutional_video_url.split('watch?v=')[1]}` : data.institutional_video_url; setVideoUrl(u); } setVideoSd((data as any).institutional_video_sd_url||''); setVideoHd((data as any).institutional_video_hd_url||''); if ((data as any).youtube_channel_url) setChannelUrl((data as any).youtube_channel_url); }
          else {
            try { const demo = JSON.parse(localStorage.getItem('demo_college_matriz')||'[]'); if (demo[0]) { setBrand({ name: demo[0].fantasy_name || demo[0].legal_name || demo[0].name || 'Faculdade', chancellor: demo[0].chancellor_president || '', logo: demo[0].logo_url, avatar: demo[0].chancellor_avatar_url || demo[0].logo_url, primary: demo[0].brand_primary_color || '#003399', secondary: demo[0].brand_secondary_color || '#FFCC00' }); if (demo[0].institutional_video_url) { const u = demo[0].institutional_video_url.includes('watch?v=') ? `https://www.youtube.com/embed/${demo[0].institutional_video_url.split('watch?v=')[1]}` : demo[0].institutional_video_url; setVideoUrl(u); } setVideoSd(demo[0].institutional_video_sd_url||''); setVideoHd(demo[0].institutional_video_hd_url||''); if (demo[0].youtube_channel_url) setChannelUrl(demo[0].youtube_channel_url); } } catch {}
          }
        try {
          const { data: tpl } = await supabase.from('welcome_email_templates' as any).select('*').eq('target_type','GLOBAL').maybeSingle();
          if (tpl?.template) setWelcomeText(tpl.template.replace(/\{\{student_name\}\}/g,'Aluno').replace(/\{\{course_name\}\}/g,'Curso'));
        } catch {}
        }
      } catch {}
    })();
  },[]);
  const heroStyle = useMemo(()=>({ background: `linear-gradient(135deg, ${brand.primary} 0%, #0a2fa0 60%)` }),[brand]);

  const signIn = async () => {
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      if (import.meta.env.DEV) {
        try { localStorage.setItem('ead_demo_student','1'); } catch {}
        window.location.href = '/ead/aluno?demo=1';
        return;
      }
      setError(err.message);
      return;
    }
    window.location.href = '/ead/aluno';
  };

  return (
    <MainLayout>
      <section className="relative overflow-hidden text-white" style={heroStyle}>
        <div className="absolute -top-32 -left-24 w-[700px] h-[700px] rounded-full blur-3xl opacity-30 animate-float" style={{ background: brand.secondary }} />
        <div className="absolute -bottom-24 -right-24 w-[700px] h-[700px] rounded-full blur-3xl opacity-30 animate-float-delayed" style={{ background: brand.primary }} />
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {brand.logo ? (<img src={brand.logo||''} alt="Logo" className="h-10 w-10 object-contain rounded-full ring-2 ring-white/50" />) : null}
                <Badge className="bg-white/20 text-white border-white/30">{brand.name}</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Estude com desempenho
                <span className="block bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">e uma experiência premium</span>
              </h1>
              <p className="text-lg text-white/80 mb-8">Videos, certificados, comunidade e avaliações em uma plataforma rápida, segura e com a sua marca.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur hover:bg-white/20 transition">
                  <PlayCircle className="w-6 h-6" />
                  <span className="text-sm">Aulas em vídeo fluídas</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur hover:bg-white/20 transition">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="text-sm">Certificados emitidos</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur hover:bg-white/20 transition">
                  <GraduationCap className="w-6 h-6" />
                  <span className="text-sm">Matrículas simples</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur hover:bg-white/20 transition">
                  <Zap className="w-6 h-6" />
                  <span className="text-sm">Acesso imediato</span>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/10 p-3 text-center animate-bounce-slow">
                  <div className="text-2xl font-bold">4K</div>
                  <div className="text-xs text-white/70">Vídeos</div>
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-center animate-bounce-slow delay-150">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-xs text-white/70">Certificados</div>
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-center animate-bounce-slow delay-300">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-xs text-white/70">Disponível</div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <AIWelcomeAvatar avatarUrl={(brand as any).avatar} name={brand.chancellor || brand.name} primary={brand.primary} secondary={brand.secondary} />
                {videoUrl.includes('youtube') || videoUrl.includes('vimeo') ? (
                  <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/30">
                    <div className="relative aspect-video bg-black">
                      <iframe className="w-full h-full" src={videoUrl} title="Boas‑vindas FAITEL" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      {brand.avatar && (
                        <img src={brand.avatar||''} alt="Avatar" className="absolute top-3 left-3 h-16 w-16 rounded-full object-cover border-4" style={{ borderColor: brand.secondary }} />
                      )}
                    </div>
                  </div>
                ) : (
                  <QualityVideoPlayer sources={[
                    ...(videoHd ? [{ label:'HD', url: videoHd }] : []),
                    ...(videoSd ? [{ label:'SD', url: videoSd }] : []),
                    { label:'Original', url: videoUrl }
                  ]} avatarUrl={(brand as any).avatar} brandSecondary={brand.secondary} />
                )}
                {channelUrl && (
                  <a href={channelUrl} target="_blank" rel="noreferrer" className="inline-block">
                    <Button style={{ background: brand.secondary }} className="mt-2">
                      <ExternalLink className="w-4 h-4 mr-2" /> Canal FAITEL
                    </Button>
                  </a>
                )}
                <div className="text-white/90 text-sm">{welcomeText}</div>
              </div>
              <Card className="bg-white shadow-2xl border-0 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Entrar na Área do Aluno</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                  <Input type="password" placeholder="Senha" value={password} onChange={(e)=>setPassword(e.target.value)} />
                  {error && <div className="text-sm text-red-600">{error}</div>}
                  <Button className="w-full" style={{ background: brand.secondary }} onClick={signIn}>Entrar</Button>
                  <div className="text-xs text-center text-muted-foreground">Esqueceu a senha? Use recuperar senha no portal.</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes float { 0% { transform: translateY(0px) } 50% { transform: translateY(-15px) } 100% { transform: translateY(0px) } }
          .animate-float { animation: float 6s ease-in-out infinite }
          .animate-float-delayed { animation: float 8s ease-in-out infinite }
          @keyframes bounceSlow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
          .animate-bounce-slow { animation: bounceSlow 4s ease-in-out infinite }
          .delay-150 { animation-delay: .15s }
          .delay-300 { animation-delay: .3s }
        `}</style>
      </section>
      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold mb-2">Comunidades por curso</div>
            <div className="text-sm text-muted-foreground">Troque ideias e tire dúvidas com colegas e professores.</div>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold mb-2">Provas e avaliações</div>
            <div className="text-sm text-muted-foreground">Quizzes, testes e notas consolidadas em um só lugar.</div>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold mb-2">Certificados personalizados</div>
            <div className="text-sm text-muted-foreground">Emissão com o seu nome e a marca da faculdade.</div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

