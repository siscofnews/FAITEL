import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const cellFormSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    tipo_celula: z.string().min(1, "Selecione o tipo"),
    dia_reuniao: z.string().optional(),
    horario_reuniao: z.string().optional(),
    lider_nome: z.string().optional(),
    funcao_lider: z.string().optional(),
    lider_telefone: z.string().optional(),
    lider_email: z.string().email("Email inválido").optional().or(z.literal("")),
    endereco: z.string().optional(),
});

type CellFormData = z.infer<typeof cellFormSchema>;

interface CellEditDialogProps {
    cell: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CellEditDialog({ cell, open, onOpenChange }: CellEditDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CellFormData>({
        resolver: zodResolver(cellFormSchema),
        defaultValues: {
            nome: cell.nome,
            tipo_celula: cell.tipo_celula,
            dia_reuniao: cell.dia_reuniao || "",
            horario_reuniao: cell.horario_reuniao || "",
            lider_nome: cell.lider_nome || "",
            funcao_lider: cell.funcao_lider || "",
            lider_telefone: cell.lider_telefone || "",
            lider_email: cell.lider_email || "",
            endereco: cell.endereco || "",
        },
    });

    const onSubmit = async (data: CellFormData) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("cells")
                .update({
                    nome: data.nome,
                    tipo_celula: data.tipo_celula,
                    dia_reuniao: data.dia_reuniao || null,
                    horario_reuniao: data.horario_reuniao || null,
                    lider_nome: data.lider_nome || null,
                    funcao_lider: data.funcao_lider || null,
                    lider_telefone: data.lider_telefone || null,
                    lider_email: data.lider_email || null,
                    endereco: data.endereco || null,
                })
                .eq("id", cell.id);

            if (error) throw error;

            toast({
                title: "Célula atualizada",
                description: "As informações foram salvas com sucesso.",
            });

            queryClient.invalidateQueries({ queryKey: ["church-detail"] });
            queryClient.invalidateQueries({ queryKey: ["hierarchy-tree"] });
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error updating cell:", error);
            toast({
                title: "Erro ao atualizar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Célula</DialogTitle>
                    <DialogDescription>
                        Atualize as informações da célula.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Nome da Célula</Label>
                        <Input {...register("nome")} />
                        {errors.nome && <p className="text-red-500 text-sm">{errors.nome.message}</p>}
                    </div>

                    <div>
                        <Label>Tipo</Label>
                        <Select
                            defaultValue={cell.tipo_celula}
                            onValueChange={(val) => setValue("tipo_celula", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="criancas">Crianças</SelectItem>
                                <SelectItem value="jovens">Jovens</SelectItem>
                                <SelectItem value="adolescentes">Adolescentes</SelectItem>
                                <SelectItem value="homens">Homens</SelectItem>
                                <SelectItem value="mulheres">Mulheres</SelectItem>
                                <SelectItem value="casais">Casais</SelectItem>
                                <SelectItem value="geral">Geral</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Dia de Reunião</Label>
                            <Select
                                defaultValue={cell.dia_reuniao}
                                onValueChange={(val) => setValue("dia_reuniao", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Segunda-feira">Segunda-feira</SelectItem>
                                    <SelectItem value="Terça-feira">Terça-feira</SelectItem>
                                    <SelectItem value="Quarta-feira">Quarta-feira</SelectItem>
                                    <SelectItem value="Quinta-feira">Quinta-feira</SelectItem>
                                    <SelectItem value="Sexta-feira">Sexta-feira</SelectItem>
                                    <SelectItem value="Sábado">Sábado</SelectItem>
                                    <SelectItem value="Domingo">Domingo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Horário</Label>
                            <Input type="time" {...register("horario_reuniao")} />
                        </div>
                    </div>

                    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                        <h3 className="font-semibold text-sm">Dados do Líder</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Líder</Label>
                                <Input {...register("lider_nome")} placeholder="Nome" />
                            </div>
                            <div>
                                <Label>Função</Label>
                                <Select
                                    defaultValue={cell.funcao_lider}
                                    onValueChange={(val) => setValue("funcao_lider", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Cargo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Líder">Líder</SelectItem>
                                        <SelectItem value="Co-Líder">Co-Líder</SelectItem>
                                        <SelectItem value="Anfitrião">Anfitrião</SelectItem>
                                        <SelectItem value="Secretário">Secretário</SelectItem>
                                        <SelectItem value="Tesoureiro">Tesoureiro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Telefone</Label>
                                <Input {...register("lider_telefone")} />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input {...register("lider_email")} type="email" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Endereço</Label>
                        <Input {...register("endereco")} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} variant="gold">
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Salvar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
