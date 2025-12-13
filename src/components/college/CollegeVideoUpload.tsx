import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Film, X } from "lucide-react";

interface CollegeVideoUploadProps {
  matrizId: string;
  currentVideoUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function CollegeVideoUpload({ matrizId, currentVideoUrl, onUploadSuccess }: CollegeVideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewName, setPreviewName] = useState<string | null>(currentVideoUrl ? currentVideoUrl.split('/').pop() || 'video.mp4' : null);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { toast({ title: "Arquivo inválido", description: "Envie um vídeo (MP4 recomendado)", variant: "destructive" }); return; }
    if (file.size > 200 * 1024 * 1024) { toast({ title: "Arquivo muito grande", description: "Máximo 200MB", variant: "destructive" }); return; }
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${matrizId}/institutional-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('college-videos').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('college-videos').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('college_matriz' as any).update({ institutional_video_url: publicUrl }).eq('id', matrizId);
      if (updateError) throw updateError;
      setPreviewName(file.name);
      onUploadSuccess(publicUrl);
      toast({ title: "Vídeo enviado" });
      setIsTranscoding(true);
      const start = Date.now();
      const poll = async () => {
        try {
          const { data } = await supabase.from('college_matriz' as any).select('institutional_video_sd_url,institutional_video_hd_url').eq('id', matrizId).maybeSingle();
          if (data?.institutional_video_sd_url || data?.institutional_video_hd_url) {
            setIsTranscoding(false);
            toast({ title: "Transcodificação concluída" });
            return;
          }
        } catch {}
        if (Date.now() - start < 5 * 60 * 1000) setTimeout(poll, 5000);
        else setIsTranscoding(false);
      };
      setTimeout(poll, 5000);
    } catch (error: any) {
      toast({ title: "Erro ao enviar vídeo", description: String(error?.message||''), variant: "destructive" });
    } finally { setIsUploading(false); }
  };

  const handleRemove = async () => {
    try {
      const { error } = await supabase.from('college_matriz' as any).update({ institutional_video_url: null }).eq('id', matrizId);
      if (error) throw error;
      setPreviewName(null);
      onUploadSuccess('');
      toast({ title: "Vídeo removido" });
    } catch (error: any) {
      toast({ title: "Erro ao remover vídeo", description: String(error?.message||''), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-2">
      <Label>Vídeo MP4</Label>
      <div className="flex items-center gap-2">
        {previewName ? (
          <div className="flex items-center gap-2 text-xs bg-white/50 px-2 py-1 rounded border">
            <Film className="w-4 h-4" />
            <span className="truncate max-w-[140px]" title={previewName}>{previewName}</span>
            <Button type="button" variant="destructive" size="icon" className="h-6 w-6" onClick={handleRemove}><X className="h-4 w-4" /></Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-white/90">
            <Film className="w-4 h-4" />
            <span>Nenhum vídeo</span>
          </div>
        )}
        <input type="file" id={`college-video-${matrizId}`} accept="video/mp4,video/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
        <Label htmlFor={`college-video-${matrizId}`}>
          <Button type="button" variant="outline" disabled={isUploading} asChild>
            <span className="cursor-pointer text-xs">{isUploading ? (<><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Enviando...</>) : (<><Upload className="mr-2 h-3 w-3" /> Enviar Vídeo</>)}</span>
          </Button>
        </Label>
      </div>
      {isTranscoding && (<div className="text-xs text-muted-foreground">Transcodificando…</div>)}
    </div>
  );
}

