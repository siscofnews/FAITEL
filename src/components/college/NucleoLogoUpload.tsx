import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";

interface NucleoLogoUploadProps {
  nucleoId: string;
  currentLogoUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function NucleoLogoUpload({ nucleoId, currentLogoUrl, onUploadSuccess }: NucleoLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: "Arquivo inválido", description: "Envie PNG ou JPG", variant: "destructive" }); return; }
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Arquivo muito grande", description: "Máximo 2MB", variant: "destructive" }); return; }
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `nucleo/${nucleoId}/logo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('college-logos').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('college-logos').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('college_nucleo' as any).update({ logo_url: publicUrl }).eq('id', nucleoId);
      if (updateError) throw updateError;
      setPreview(publicUrl);
      onUploadSuccess(publicUrl);
      toast({ title: "Logo do Núcleo enviada" });
    } catch (error:any) {
      toast({ title: "Erro ao enviar logo", description: String(error?.message||''), variant: "destructive" });
    } finally { setIsUploading(false); }
  };

  const handleRemove = async () => {
    try { const { error } = await supabase.from('college_nucleo' as any).update({ logo_url: null }).eq('id', nucleoId); if (error) throw error; setPreview(null); onUploadSuccess(''); toast({ title: "Logo removida" }); } catch (error:any) { toast({ title: "Erro ao remover logo", description: String(error?.message||''), variant: "destructive" }); }
  };

  return (
    <div className="space-y-2">
      <Label>Logo do Núcleo</Label>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Logo" className="h-12 w-12 object-contain border rounded p-1" />
          <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={handleRemove}><X className="h-4 w-4" /></Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-12 h-12 border-2 border-dashed rounded"><ImageIcon className="h-6 w-6 text-muted-foreground" /></div>
      )}
      <div>
        <input type="file" id={`nucleo-logo-${nucleoId}`} accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} disabled={isUploading} className="hidden" />
        <Label htmlFor={`nucleo-logo-${nucleoId}`}>
          <Button type="button" variant="outline" disabled={isUploading} asChild>
            <span className="cursor-pointer text-xs">{isUploading ? (<><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Enviando...</>) : (<><Upload className="mr-2 h-3 w-3" /> Enviar Logo</>)}</span>
          </Button>
        </Label>
      </div>
    </div>
  );
}

