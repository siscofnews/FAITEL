import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";

interface CollegeLogoUploadProps {
  matrizId: string;
  currentLogoUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function CollegeLogoUpload({ matrizId, currentLogoUrl, onUploadSuccess }: CollegeLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Arquivo inválido", description: "Envie PNG ou JPG", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 2MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${matrizId}/logo-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('college-logos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('college-logos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('college_matriz' as any)
        .update({ logo_url: publicUrl })
        .eq('id', matrizId);
      if (updateError) throw updateError;

      setPreview(publicUrl);
      onUploadSuccess(publicUrl);
      toast({ title: "✅ Logo enviada", description: "Aplicada à matriz" });
    } catch (error: any) {
      // Fallback demo: salvar em localStorage
      try {
        const key = 'demo_college_matriz';
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = list.findIndex((r: any) => r.id === matrizId);
        if (idx >= 0) { list[idx].logo_url = 'local-preview'; localStorage.setItem(key, JSON.stringify(list)); }
      } catch {}
      toast({ title: "Erro ao enviar logo", description: String(error?.message || 'Falha no provedor'), variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const { error } = await supabase
        .from('college_matriz' as any)
        .update({ logo_url: null })
        .eq('id', matrizId);
      if (error) throw error;
      setPreview(null);
      onUploadSuccess('');
      toast({ title: "Logo removida" });
    } catch (error: any) {
      toast({ title: "Erro ao remover logo", description: String(error?.message || ''), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-2">
      <Label>Logo</Label>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Logo da faculdade" className="h-16 w-16 object-contain border rounded p-1" />
          <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-16 h-16 border-2 border-dashed rounded">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div>
        <input type="file" id={`college-logo-${matrizId}`} accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} disabled={isUploading} className="hidden" />
        <Label htmlFor={`college-logo-${matrizId}`}>
          <Button type="button" variant="outline" disabled={isUploading} asChild>
            <span className="cursor-pointer text-xs">
              {isUploading ? (<><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Enviando...</>) : (<><Upload className="mr-2 h-3 w-3" /> {preview ? 'Alterar Logo' : 'Enviar Logo'}</>)}
            </span>
          </Button>
        </Label>
      </div>
    </div>
  );
}

