import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Source { label: string; url: string; type?: string }

export function QualityVideoPlayer({ sources, avatarUrl, brandSecondary }: { sources: Source[]; avatarUrl?: string|null; brandSecondary?: string }) {
  const [current, setCurrent] = useState<string>(()=>{
    const hd = sources.find(s=>/HD/i.test(s.label));
    return (hd?.url) || (sources[0]?.url) || '';
  });
  const currentType = useMemo(()=> sources.find(s=>s.url===current)?.type || 'video/mp4', [sources, current]);
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/30">
      <div className="relative aspect-video bg-black">
        <video className="w-full h-full" src={current} controls />
        {avatarUrl && (
          <img src={avatarUrl||''} alt="Avatar" className="absolute top-3 left-3 h-16 w-16 rounded-full object-cover border-4" style={{ borderColor: brandSecondary||'#FFCC00' }} />
        )}
        <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur px-2 py-1 rounded flex items-center gap-2">
          <Label className="text-xs text-white/80">Qualidade</Label>
          <select className="text-xs bg-transparent text-white" value={current} onChange={(e)=>setCurrent(e.target.value)}>
            {sources.map((s)=> (<option key={s.url} value={s.url}>{s.label}</option>))}
          </select>
        </div>
      </div>
    </div>
  );
}

