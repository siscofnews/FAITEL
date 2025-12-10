import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";

interface LogoUploadProps {
    churchId: string;
    currentLogoUrl?: string | null;
    onUploadSuccess: (url: string) => void;
}

export function LogoUpload({ churchId, currentLogoUrl, onUploadSuccess }: LogoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentLogoUrl || null);
    const { toast } = useToast();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Arquivo inválido",
                description: "Apenas imagens são permitidas (PNG, JPG, JPEG)",
                variant: "destructive",
            });
            return;
        }

        // Validar tamanho (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Arquivo muito grande",
                description: "O logo deve ter no máximo 2MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            // Upload para Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${churchId}/logo-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('church-logos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Pegar URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('church-logos')
                .getPublicUrl(fileName);

            // Atualizar banco de dados
            const { error: updateError } = await supabase
                .from('churches')
                .update({ logo_url: publicUrl })
                .eq('id', churchId);

            if (updateError) throw updateError;

            setPreview(publicUrl);
            onUploadSuccess(publicUrl);

            toast({
                title: "✅ Logo enviado!",
                description: "Logo atualizado com sucesso",
            });
        } catch (error: any) {
            console.error("Error uploading logo:", error);
            toast({
                title: "Erro ao enviar logo",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async () => {
        try {
            const { error } = await supabase
                .from('churches')
                .update({ logo_url: null })
                .eq('id', churchId);

            if (error) throw error;

            setPreview(null);
            onUploadSuccess('');

            toast({
                title: "Logo removido",
                description: "Logo foi removido com sucesso",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao remover logo",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-4">
            <Label>Logo da Igreja</Label>

            {preview ? (
                <div className="relative inline-block">
                    <img
                        src={preview}
                        alt="Logo da igreja"
                        className="h-32 w-32 object-contain border border-gray-200 rounded-lg p-2"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
            )}

            <div>
                <input
                    type="file"
                    id="logo-upload"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                />
                <Label htmlFor="logo-upload">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        asChild
                    >
                        <span className="cursor-pointer">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {preview ? 'Alterar Logo' : 'Enviar Logo'}
                                </>
                            )}
                        </span>
                    </Button>
                </Label>
            </div>

            <p className="text-xs text-muted-foreground">
                Formatos: PNG, JPG • Tamanho máximo: 2MB • Recomendado: 400x400px
            </p>
        </div>
    );
}
