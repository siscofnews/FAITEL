import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar as CalendarIcon,
    Plus,
    Trash2,
    Save,
    Loader2,
    Download,
    Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { UnitSelector } from "@/components/worship/UnitSelector";
import { SmartMemberSelect } from "@/components/worship/SmartMemberSelect";
import { WorshipScheduleService, WorshipSchedule, AssignmentRole } from "@/services/WorshipScheduleService";
import { useSchedulePermissions } from "@/hooks/useSchedulePermissions";

interface ScheduleFormProps {
    initialData?: any; // If editing
    defaultChurchId: string;
}

export function ScheduleForm({ defaultChurchId, initialData }: ScheduleFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [assignmentRoles, setAssignmentRoles] = useState<AssignmentRole[]>([]);

    // Header State
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedUnit, setSelectedUnit] = useState<{ type: string, id: string | null }>({ type: 'church', id: defaultChurchId });
    const [serviceTypeId, setServiceTypeId] = useState<string>("");

    // Permissions Hook
    // Uses selectedUnit.id (if available) or falls back to defaultChurchId
    const activeChurchId = selectedUnit.id || defaultChurchId;
    const { data: permissions, isLoading: isLoadingPermissions } = useSchedulePermissions(activeChurchId);

    // Assignments State (Map of roleId -> Array of {memberId, customName})
    const [assignments, setAssignments] = useState<Record<string, { member_id?: string, custom_name?: string }[]>>({});

    // Financials State
    const [tithes, setTithes] = useState<string>("");
    const [offerings, setOfferings] = useState<string>("");

    useEffect(() => {
        loadMetadata();
    }, []);

    // Hydrate from initialData (Edit Mode)
    useEffect(() => {
        if (initialData) {
            if (initialData.date) setDate(new Date(initialData.date));

            // Determine unit type
            if (initialData.cell_id) {
                setSelectedUnit({ type: 'cell', id: initialData.cell_id });
            } else if (initialData.church_id) {
                setSelectedUnit({ type: 'church', id: initialData.church_id });
            }

            if (initialData.service_type_id) setServiceTypeId(initialData.service_type_id);
            if (initialData.tithes_value) setTithes(String(initialData.tithes_value).replace('.', ','));
            if (initialData.offerings_value) setOfferings(String(initialData.offerings_value).replace('.', ','));

            if (initialData.assignments && Array.isArray(initialData.assignments)) {
                const newAssignments: Record<string, any[]> = {};
                initialData.assignments.forEach((a: any) => {
                    const rid = a.assignment_role_id;
                    if (!newAssignments[rid]) newAssignments[rid] = [];
                    newAssignments[rid].push({
                        member_id: a.member_id,
                        custom_name: a.custom_name
                    });
                });
                setAssignments(newAssignments);
            }
        }
    }, [initialData]);

    const loadMetadata = async () => {
        try {
            const [types, roles] = await Promise.all([
                WorshipScheduleService.getServiceTypes(),
                WorshipScheduleService.getAssignmentRoles()
            ]);
            setServiceTypes(types || []);
            setAssignmentRoles(roles || []);
        } catch (error) {
            console.error("Error loading metadata", error);
            toast.error("Erro ao carregar dados iniciais.");
        }
    };

    const handleAssignmentChange = (roleId: string, index: number, field: 'member_id' | 'custom_name', value: string | null) => {
        if (!permissions?.can_edit_scale) {
            toast.error("Você não tem permissão para editar a escala.");
            return;
        }
        setAssignments(prev => {
            const roleAssignments = prev[roleId] ? [...prev[roleId]] : [];
            if (!roleAssignments[index]) roleAssignments[index] = {};

            roleAssignments[index] = { ...roleAssignments[index], [field]: value };
            return { ...prev, [roleId]: roleAssignments };
        });
    };

    const addAssignmentSlot = (roleId: string) => {
        setAssignments(prev => {
            const current = prev[roleId] || [];
            return { ...prev, [roleId]: [...current, {}] };
        });
    };

    const removeAssignmentSlot = (roleId: string, index: number) => {
        setAssignments(prev => {
            const current = prev[roleId] || [];
            const updated = current.filter((_, i) => i !== index);
            return { ...prev, [roleId]: updated };
        });
    };

    const calculateTotal = () => {
        const t = parseFloat(tithes.replace(',', '.') || '0');
        const o = parseFloat(offerings.replace(',', '.') || '0');
        return (t + o).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!permissions?.can_edit_scale) {
            toast.error("Sem permissão para salvar.");
            return;
        }

        if (!selectedUnit.id || !date || !serviceTypeId) {
            toast.error("Preencha os campos obrigatórios do cabeçalho.");
            return;
        }

        setIsLoading(true);
        try {
            // Create Schedule
            const scheduleData: Partial<WorshipSchedule> = {
                church_id: selectedUnit.type === 'church' ? selectedUnit.id : defaultChurchId,
                cell_id: selectedUnit.type === 'cell' ? selectedUnit.id : null,
                date: format(date, 'yyyy-MM-dd'),
                service_type_id: serviceTypeId,
                tithes_value: parseFloat(tithes.replace(',', '.') || '0'),
                offerings_value: parseFloat(offerings.replace(',', '.') || '0'),
                status: 'published'
            };

            const newSchedule = await WorshipScheduleService.createSchedule(scheduleData);

            // Create Assignments
            const assignmentsToInsert: any[] = [];
            Object.entries(assignments).forEach(([roleId, slots]) => {
                slots.forEach(slot => {
                    if (slot.member_id || slot.custom_name) {
                        assignmentsToInsert.push({
                            worship_schedule_id: newSchedule.id,
                            assignment_role_id: roleId,
                            member_id: slot.member_id || null,
                            custom_name: slot.custom_name || null
                        });
                    }
                });
            });

            if (assignmentsToInsert.length > 0) {
                await WorshipScheduleService.createAssignments(assignmentsToInsert);
            }

            toast.success("Escala salva com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar escala.");
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleByName = (name: string) => assignmentRoles.find(r => r.name.toLowerCase() === name.toLowerCase());

    const mainOrderRoleNames = [
        "Dirigente",
        "Leitura da Palavra",
        "Oportunidade",
        "Oração Oferta e Dízimos",
        "Pregador",
        "Avisos",
        "Bênção Apostólica"
    ];

    const renderRoleRow = (roleName: string, categoryPermission: boolean = true) => {
        const role = getRoleByName(roleName);
        if (!role) return null;

        const isDisabled = !categoryPermission || !permissions?.can_edit_scale;

        // Show skeleton related to the row if crucial data is missing? 
        // No, assignmentRoles are loaded. Only permissions affect "isDisabled".
        // If permissions are loading, default to disabled (safe).

        return (
            <div key={role.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 mb-4">
                <Label className="md:text-right font-semibold text-muted-foreground uppercase text-xs tracking-wider">
                    {role.name}
                </Label>
                <div className="md:col-span-3">
                    {role.is_multiple ? (
                        <div>
                            {(assignments[role.id] || []).map((slot, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <div className="flex-1">
                                        <SmartMemberSelect churchId={defaultChurchId}
                                            value={slot.member_id}
                                            onChange={(mid, custom) => {
                                                if (!isDisabled) {
                                                    handleAssignmentChange(role.id, index, 'member_id', mid);
                                                    if (custom) handleAssignmentChange(role.id, index, 'custom_name', custom);
                                                }
                                            }}
                                            allowCustom
                                            disabled={isDisabled}
                                        />
                                    </div>
                                    {!isDisabled && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAssignmentSlot(role.id, index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            {!isDisabled && (
                                <Button type="button" variant="outline" size="sm" onClick={() => addAssignmentSlot(role.id)}>
                                    <Plus className="h-3 w-3 mr-1" /> Adicionar
                                </Button>
                            )}
                        </div>
                    ) : (
                        <SmartMemberSelect churchId={defaultChurchId}
                            value={assignments[role.id]?.[0]?.member_id}
                            onChange={(mid, custom) => {
                                if (!isDisabled) {
                                    handleAssignmentChange(role.id, 0, 'member_id', mid);
                                    if (custom) handleAssignmentChange(role.id, 0, 'custom_name', custom);
                                }
                            }}
                            allowCustom
                            disabled={isDisabled}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">

            {/* Header */}
            <Card>
                <CardHeader className="bg-muted/50 py-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Cabeçalho da Escala</CardTitle>
                        {isLoadingPermissions && <span className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Verificando permissões...</span>}
                    </div>
                    {permissions && !permissions.can_edit_scale && (
                        <CardDescription className="flex items-center text-amber-600 gap-2">
                            <Lock className="w-3 h-3" /> Modo apenas leitura
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <UnitSelector
                        defaultChurchId={defaultChurchId}
                        onUnitChange={(type, id, cellId) => setSelectedUnit({ type, id: cellId || id })}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label>Data do Culto</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={permissions ? !permissions.can_edit_scale : true}
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <Label>Tipo de Culto</Label>
                            <Select
                                value={serviceTypeId}
                                onValueChange={setServiceTypeId}
                                disabled={permissions ? !permissions.can_edit_scale : true}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {serviceTypes.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Areas - Show Loading if no permissions yet */}
            {!permissions ? (
                <div className="space-y-4">
                    <Card className="h-64 flex items-center justify-center border-dashed">
                        <div className="text-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                            <p>Verificando acesso e permissões...</p>
                        </div>
                    </Card>
                </div>
            ) : (
                <>
                    {/* Main Order of Service */}
                    {(permissions.can_view_scale) ? (
                        <Card className="border-t-4 border-t-primary">
                            <CardHeader className="bg-primary/5 py-4">
                                <CardTitle className="text-lg text-primary">Ordem do Culto (Liturgia)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {renderRoleRow("Dirigente")}
                                {renderRoleRow("Leitura da Palavra")}

                                {/* Special Hymns Section */}
                                <div className="bg-muted/30 p-4 rounded-md my-6 border border-dashed border-primary/20">
                                    <div className="mb-4 flex justify-between items-center">
                                        <div>
                                            <Label className="text-primary font-bold uppercase tracking-wide">Ministério de Louvor</Label>
                                            <p className="text-xs text-muted-foreground">Adicione os Links e os Músicos</p>
                                        </div>
                                        {permissions && !permissions.can_edit_worship && <Lock className="w-4 h-4 text-muted-foreground" />}
                                    </div>

                                    {permissions.can_edit_worship && (
                                        <div className="space-y-2 mb-4">
                                            <Input placeholder="Link do Hino 1 (YouTube)" />
                                            <Input placeholder="Link do Hino 2 (YouTube)" />
                                            <Input placeholder="Link do Hino 3 (YouTube)" />
                                        </div>
                                    )}

                                    {renderRoleRow("Músicos", permissions.can_edit_worship)}
                                    {renderRoleRow("Líder de Louvor", permissions.can_edit_worship)}
                                </div>

                                {renderRoleRow("Oportunidade")}
                                {renderRoleRow("Oração Oferta e Dízimos")}
                                {renderRoleRow("Pregador")}
                                {renderRoleRow("Avisos")}
                                {renderRoleRow("Bênção Apostólica")}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg">Você não tem permissão para ver a escala (Liturgia).</div>
                    )}

                    {/* Other Roles / Support */}
                    {permissions?.can_edit_departments && (
                        <Card>
                            <CardHeader className="bg-slate-50 py-4">
                                <CardTitle className="text-lg text-slate-700">Apoio & Logística</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {assignmentRoles
                                    .filter(r => !mainOrderRoleNames.includes(r.name) && !['Músicos', 'Líder de Louvor'].includes(r.name))
                                    .map(role => renderRoleRow(role.name))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Financials Section */}
                    {(permissions?.can_view_financial || permissions?.can_edit_financial) && (
                        <Card>
                            <CardHeader className="bg-green-50 py-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg text-green-800">Financeiro (Previsão ou Realizado)</CardTitle>
                                {!permissions?.can_edit_financial && <Lock className="w-4 h-4 text-green-800" />}
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <Label>Dízimos (R$)</Label>
                                        <Input
                                            placeholder="0,00"
                                            value={tithes}
                                            onChange={e => setTithes(e.target.value)}
                                            disabled={!permissions?.can_edit_financial}
                                        />
                                    </div>
                                    <div>
                                        <Label>Ofertas (R$)</Label>
                                        <Input
                                            placeholder="0,00"
                                            value={offerings}
                                            onChange={e => setOfferings(e.target.value)}
                                            disabled={!permissions?.can_edit_financial}
                                        />
                                    </div>
                                    <div>
                                        <Label>Soma Automática</Label>
                                        <div className="text-2xl font-bold text-green-700 mt-1">
                                            {calculateTotal()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-10 flex justify-center gap-4 shadow-2xl">
                <Button variant="outline" type="button">Cancelar</Button>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar PDF</Button>

                {permissions?.can_edit_scale && (
                    <Button type="submit" variant="default" disabled={isLoading} className="min-w-[200px] bg-green-600 hover:bg-green-700">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Escala
                    </Button>
                )}
            </div>

        </form>
    );
}
