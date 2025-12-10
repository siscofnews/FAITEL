import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, User, X } from "lucide-react";

interface PhotoUploadProps {
    onPhotoUploaded: (url: string) => void;
    currentPhotoUrl?: string | null;
    required?: boolean;
    bucket?: string; // Add optional bucket prop
}

export function PhotoUpload({ onPhotoUploaded, currentPhotoUrl, required = true, bucket = 'member-photos' }: PhotoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
    const { toast } = useToast();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Arquivo inválido",
                description: "Apenas imagens são permitidas",
                variant: "destructive",
            });
            return;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Arquivo muito grande",
                description: "A foto deve ter no máximo 5MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Permitir upload sem login APENAS se for member-photos (cadastro público)
            if (!user && bucket !== 'member-photos') {
                throw new Error("Usuário não autenticado");
            }

            // Upload para Supabase Storage
            const fileExt = file.name.split('.').pop();
            // Se tiver usuário, usa ID dele. Se não, usa "public" + timestamp
            const userId = user?.id || `public_${Date.now()}`;
            const fileName = `${userId}/photo-${Date.now()}.${fileExt}`;

            console.log("Iniciando upload para bucket:", bucket, "Arquivo:", fileName);

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Pegar URL pública
            const { data: { publicUrl } } = supabase.storage
                .from(bucket) // Use dynamic bucket
                .getPublicUrl(fileName);

            setPreview(publicUrl);
            onPhotoUploaded(publicUrl);

            toast({
                title: "✅ Foto enviada!",
                description: "Foto carregada com sucesso",
            });
        } catch (error: any) {
            console.error("Error uploading photo:", error);

            // Debug: Listar buckets disponíveis para diagnosticar "Bucket not found"
            const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
            console.log("DEBUG: Buckets disponíveis:", buckets);
            if (bucketError) console.error("DEBUG: Erro ao listar buckets:", bucketError);

            toast({
                title: "Erro ao enviar foto",
                description: error.message + (error.message.includes("Bucket") ? " (Verifique o console (F12) para detalhes)" : ""),
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onPhotoUploaded('');
    };

    return (
        <div className="space-y-4">
            <Label>
                Foto {required && <span className="text-red-500">*</span>}
            </Label>

            <div className="flex items-center gap-4">
                {/* Preview da foto */}
                <div className="relative">
                    {preview ? (
                        <div className="relative">
                            <img
                                src={preview}
                                alt="Foto do membro"
                                className="h-24 w-24 object-cover rounded-full border-2 border-gray-200"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                                onClick={handleRemove}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300">
                            <User className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Botões de upload */}
                <div className="flex flex-col gap-2">
                    <input
                        type="file"
                        id="photo-upload-file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="hidden"
                    />
                    <Label htmlFor="photo-upload-file">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
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
                                        Escolher Arquivo
                                    </>
                                )}
                            </span>
                        </Button>
                    </Label>

                    {/* Captura de câmera (funciona melhor em mobile) */}
                    <input
                        type="file"
                        id="photo-capture-camera"
                        accept="image/*"
                        capture="user"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="hidden"
                    />
                    <Label htmlFor="photo-capture-camera">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            asChild
                        >
                            <span className="cursor-pointer">
                                <Camera className="mr-2 h-4 w-4" />
                                Tirar Selfie
                            </span>
                        </Button>
                    </Label>
                </div>
            </div>

            <p className="text-xs text-muted-foreground">
                {required && "Foto obrigatória • "}
                Tire uma selfie ou faça upload • Máximo 5MB
            </p>
        </div>
    );
}
