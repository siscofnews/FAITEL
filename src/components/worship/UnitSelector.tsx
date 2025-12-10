import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface UnitSelectorProps {
    onUnitChange: (unitType: string, unitId: string | null, cellId: string | null) => void;
    defaultChurchId: string;
}

interface ChurchOption {
    id: string;
    name: string;
    level: string;
}

interface CellOption {
    id: string;
    name: string;
}

export function UnitSelector({ onUnitChange, defaultChurchId }: UnitSelectorProps) {
    const [loading, setLoading] = useState(true);
    const [rootChurch, setRootChurch] = useState<ChurchOption | null>(null);
    const [childChurches, setChildChurches] = useState<ChurchOption[]>([]);
    const [cells, setCells] = useState<CellOption[]>([]);

    // Selection State
    // We combine everything into a single "Target Unit" selector for better UX in hierarchy
    // Values: "root|<id>", "church|<id>", "cell|<id>"
    const [selectedValue, setSelectedValue] = useState<string>("");

    useEffect(() => {
        if (defaultChurchId) {
            loadHierarchy();
        }
    }, [defaultChurchId]);

    const loadHierarchy = async () => {
        setLoading(true);
        try {
            // 1. Get Root Church (My Church)
            const { data: myChurch } = await supabase
                .from("churches")
                .select("id, nome_fantasia, nivel")
                .eq("id", defaultChurchId)
                .single();

            if (myChurch) {
                setRootChurch({
                    id: myChurch.id,
                    name: myChurch.nome_fantasia,
                    level: myChurch.nivel
                });
                // Default selection: My Church
                const initialVal = `root|${myChurch.id}`;
                setSelectedValue(initialVal);
                // Notify parent immediately
                onUnitChange("church", myChurch.id, null);
            }

            // 2. Get Child Churches (Direct children only for now, or recursive if needed? 
            // PROMPT says "Sede vê Subsedes". Usually direct children is 1 level down.
            // Let's fetch direct children.)
            const { data: children } = await supabase
                .from("churches")
                .select("id, nome_fantasia, nivel")
                .eq("parent_church_id", defaultChurchId);

            if (children) {
                setChildChurches(children.map(c => ({
                    id: c.id,
                    name: c.nome_fantasia,
                    level: c.nivel
                })));
            }

            // 3. Get Cells (of My Church)
            // Does strictly hierarchy mean I can see cells of my child churches? 
            // Usually "Congregação pode ver suas células". 
            // Let's stick to "My Cells" for the dropdown, unless user traverses to a child church.
            // For simpler UX, we only show "My Cells" or "My Child Churches".
            // If I select a Child Church, ideally I should see ITS cells? 
            // For now, let's implement: "Schedule for..."
            // - Me
            // - My Cells
            // - My Direct Child Churches
            const { data: myCells } = await supabase
                .from("cells")
                .select("id, name")
                .eq("church_id", defaultChurchId)
                .eq("is_active", true);

            if (myCells) {
                setCells(myCells.map(c => ({ id: c.id, name: c.name })));
            }

        } catch (error) {
            console.error("Error loading hierarchy", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChange = (val: string) => {
        setSelectedValue(val);
        const [type, id] = val.split("|");

        if (type === "root") {
            onUnitChange("church", id, null);
        } else if (type === "church") {
            onUnitChange("church", id, null);
        } else if (type === "cell") {
            // validating parent church is defaultChurchId
            onUnitChange("cell", defaultChurchId, id);
        }
    };

    if (loading) return <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Carregando unidades...</div>;
    if (!rootChurch) return null;

    return (
        <div className="space-y-2">
            <Label>Unidade da Escala (Hierarquia)</Label>
            <Select value={selectedValue} onValueChange={handleSelectionChange}>
                <SelectTrigger className="w-full md:w-[400px]">
                    <SelectValue placeholder="Selecione a unidade..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Minha Unidade</SelectLabel>
                        <SelectItem value={`root|${rootChurch.id}`} className="font-semibold">
                            {rootChurch.name} ({rootChurch.level})
                        </SelectItem>
                    </SelectGroup>

                    {cells.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Minhas Células</SelectLabel>
                            {cells.map(cell => (
                                <SelectItem key={cell.id} value={`cell|${cell.id}`}>
                                    📄 Célula: {cell.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}

                    {childChurches.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Unidades Filhas</SelectLabel>
                            {childChurches.map(child => (
                                <SelectItem key={child.id} value={`church|${child.id}`}>
                                    ⛪ {child.name} ({child.level})
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
                Visualizando apenas unidades subordinadas (Hierarquia descendente).
            </p>
        </div>
    );
}
