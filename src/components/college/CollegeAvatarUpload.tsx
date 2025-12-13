import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";

interface CollegeAvatarUploadProps {
  matrizId: string;
  currentAvatarUrl?: string | null;
  onUploadSuccess: (url: string) => void;
}

export function CollegeAvatarUpload({ matrizId, currentAvatarUrl, onUploadSuccess }: CollegeAvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const { toast } = useToast();
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: "Arquivo inválido", description: "Envie PNG ou JPG", variant: "destructive" }); return; }
    if (file.size > 3 * 1024 * 1024) { toast({ title: "Arquivo muito grande", description: "Máximo 3MB", variant: "destructive" }); return; }
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${matrizId}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('college-avatars').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('college-avatars').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('college_matriz' as any).update({ chancellor_avatar_url: publicUrl }).eq('id', matrizId);
      if (updateError) throw updateError;
      setPreview(publicUrl);
      onUploadSuccess(publicUrl);
      toast({ title: "Avatar enviado" });
    } catch (error: any) {
      toast({ title: "Erro ao enviar avatar", description: String(error?.message||''), variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };
  const handleRemove = async () => {
    try {
      const { error } = await supabase.from('college_matriz' as any).update({ chancellor_avatar_url: null }).eq('id', matrizId);
      if (error) throw error;
      setPreview(null);
      onUploadSuccess('');
      toast({ title: "Avatar removido" });
    } catch (error: any) {
      toast({ title: "Erro ao remover avatar", description: String(error?.message||''), variant: "destructive" });
    }
  };
  return (
    <div className="space-y-2">
      <Label>Avatar do Chanceler</Label>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Avatar" className="h-16 w-16 object-cover rounded-full border" />
          <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={handleRemove}><X className="h-4 w-4" /></Button>
        </div>
      ) : (
        <div className="flex items-center justify-center w-16 h-16 border-2 border-dashed rounded-full"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
      )}
      <div>
        <input type="file" id={`college-avatar-${matrizId}`} accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} disabled={isUploading} className="hidden" />
        <Label htmlFor={`college-avatar-${matrizId}`}>
          <Button type="button" variant="outline" disabled={isUploading} asChild>
            <span className="cursor-pointer text-xs">{isUploading ? (<><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Enviando...</>) : (<><Upload className="mr-2 h-3 w-3" /> Escolher Avatar</>)}
            </span>
          </Button>
        </Label>
      </div>
    </div>
  );
}

