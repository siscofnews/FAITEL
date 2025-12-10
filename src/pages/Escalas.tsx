import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { UnitSelector } from "@/components/worship/UnitSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Escalas() {
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
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Escalas de Culto</h1>
            <p className="text-muted-foreground mt-1">Gerencie as escalas litúrgicas e de louvor</p>
          </div>
          <Button onClick={() => navigate("/escalas/novo")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Escala
          </Button>
        </div>

        <UnitSelector
          onUnitChange={(type, id, cellId) => handleUnitChange(type, cellId || id)}
          defaultChurchId="881c40d9-7d96-4f62-9df1-28941fa71c31"
        />

        <Card>
          <CardHeader>
            <CardTitle>Próximos Cultos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-center py-12 border-dashed border-2 rounded-lg">
              <Calendar className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p className="text-lg font-medium">Nenhuma escala encontrada</p>
              <p className="text-sm">Selecione uma unidade acima ou crie uma nova escala.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
