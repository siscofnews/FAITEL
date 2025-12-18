import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Video, FileText, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ContentUploaderProps {
    lessonId: string;
    onSuccess?: () => void;
}

export default function ContentUploader({ lessonId, onSuccess }: ContentUploaderProps) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [contentType, setContentType] = useState<string>("video");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        setUploadProgress(0);
    };

    const uploadContent = async () => {
        if (!file) {
            toast({
                title: "Selecione um arquivo",
                variant: "destructive"
            });
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${lessonId}_${Date.now()}.${fileExt}`;
            let bucket = "";
            let filePath = "";

            // Determinar bucket baseado no tipo
            if (contentType === "video") {
                bucket = "lar-videos";
                filePath = `aulas/${fileName}`;
            } else {
                bucket = "documentos de leitura";
                filePath = `materiais/${fileName}`;
            }

            setUploadProgress(30);

            // Upload do arquivo
            const { error: uploadError, data } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setUploadProgress(60);

            // Obter URL pública ou privada
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setUploadProgress(80);

            // Salvar no banco de dados
            const { error: dbError } = await supabase
                .from('ead_lesson_contents')
                .insert({
                    lesson_id: lessonId,
                    tipo_conteudo: contentType,
                    titulo: file.name.replace(/\.[^/.]+$/, ""), // Remove extensão
                    url: publicUrl,
                    ordem: 1
                });

            if (dbError) throw dbError;

            setUploadProgress(100);

            toast({
                title: "Upload concluído!",
                description: `${file.name} foi enviado com sucesso.`
            });

            // Reset
            setFile(null);
            setUploadProgress(0);

            if (onSuccess) onSuccess();

        } catch (error: any) {
            toast({
                title: "Erro no upload",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = () => {
        if (!file) return <Upload className="w-12 h-12 text-gray-400" />;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) {
            return <Video className="w-12 h-12 text-blue-500" />;
        }
        if (['pdf'].includes(ext || '')) {
            return <FileText className="w-12 h-12 text-red-500" />;
        }
        return <File className="w-12 h-12 text-gray-500" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Tipo de Conteúdo */}
                <div>
                    <Label>Tipo de Conteúdo</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="video">Vídeo (MP4, AVI, MOV)</SelectItem>
                            <SelectItem value="pdf">PDF / Documento</SelectItem>
                            <SelectItem value="material_complementar">Material Complementar</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Área de Upload */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    {file ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center">
                                {getFileIcon()}
                            </div>
                            <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                            {uploading && (
                                <div className="space-y-2">
                                    <Progress value={uploadProgress} />
                                    <p className="text-sm text-muted-foreground">
                                        Enviando... {uploadProgress}%
                                    </p>
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={removeFile}
                                disabled={uploading}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Remover
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {getFileIcon()}
                            <div>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    accept={contentType === 'video' ? 'video/*' : contentType === 'pdf' ? '.pdf' : '*'}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Label htmlFor="file-upload">
                                    <Button variant="outline" asChild>
                                        <span className="cursor-pointer">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Selecionar Arquivo
                                        </span>
                                    </Button>
                                </Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {contentType === 'video' && "Formatos: MP4, AVI, MOV, MKV. Máx: 500MB"}
                                {contentType === 'pdf' && "Formato: PDF. Máx: 50MB"}
                                {contentType === 'material_complementar' && "Qualquer tipo de arquivo. Máx: 100MB"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Botão de Upload */}
                {file && !uploading && (
                    <Button onClick={uploadContent} className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Fazer Upload
                    </Button>
                )}

                {uploading && (
                    <Button disabled className="w-full">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
