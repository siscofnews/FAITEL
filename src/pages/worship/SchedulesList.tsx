import { useState } from "react";
import { UnitSelector } from "@/components/worship/UnitSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SchedulesList() {
    const navigate = useNavigate();
    const [selectedUnit, setSelectedUnit] = useState<{
        type: string;
        id: string | null;
    }>({ type: "church", id: null });

    const handleUnitChange = (type: string, id: string | null) => {
        setSelectedUnit({ type, id });
        // TODO: Fetch schedules for this unit
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Escala de Cultos</h1>
                <Button onClick={() => navigate("/escalas/novo")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Escala
                </Button>
            </div>

            <UnitSelector
                onUnitChange={(type, id, cellId) => handleUnitChange(type, cellId || id)}
                defaultChurchId="881c40d9-7d96-4f62-9df1-28941fa71c31" // TODO: dynamic
            />

            <Card>
                <CardHeader>
                    <CardTitle>Próximos Cultos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground text-center py-8">
                        <Calendar className="mx-auto h-12 w-12 opacity-20 mb-2" />
                        <p>Nenhuma escala encontrada para esta unidade.</p>
                        <p className="text-sm">Selecione uma unidade acima ou crie uma nova escala.</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
