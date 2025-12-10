import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface MemberOption {
    id: string;
    label: string;
    role: string;
}

interface SmartMemberSelectProps {
    value?: string | null;
    onChange: (value: string | null, customName?: string) => void;
    churchId: string;
    placeholder?: string;
    allowCustom?: boolean; // If true, allows typing a name not in list (e.g. external preacher)
    disabled?: boolean;
}

export function SmartMemberSelect({
    value,
    onChange,
    churchId,
    placeholder = "Selecione...",
    allowCustom = false,
    disabled = false,
}: SmartMemberSelectProps) {
    const [open, setOpen] = useState(false);
    const [members, setMembers] = useState<MemberOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (open && members.length === 0) {
            fetchMembers();
        }
    }, [open]);

    const fetchMembers = async () => {
        setLoading(true);
        // TODO: Filter by churchId if needed, but for now fetch all to be safe or filtered by RLS
        // Assuming members table has church_id or we filter manually.
        const { data, error } = await supabase
            .from("members")
            .select("id, full_name, role")
            .order("full_name")
            .limit(100);

        if (error) {
            console.error("Error fetching members:", error);
        } else {
            const options = data.map((m) => ({
                id: m.id,
                label: m.full_name,
                role: m.role || "Sem Cargo",
            }));
            setMembers(options);
        }
        setLoading(false);
    };

    const selectedMember = members.find((m) => m.id === value);

    return (
        <div className="flex flex-col gap-1">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal"
                        disabled={disabled}
                    >
                        {selectedMember
                            ? `${selectedMember.label} – ${selectedMember.role}`
                            : value && !selectedMember // If value exists but not in list (custom name?)
                                ? value // Display the custom value if it's just a string? No, value is ID usually.
                                : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Buscar por nome ou cargo..."
                            onValueChange={setSearchTerm}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {loading ? (
                                    <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Carregando...
                                    </div>
                                ) : (
                                    <div className="py-2 px-4">
                                        <p className="text-sm text-muted-foreground">Nenhum membro encontrado.</p>
                                        {allowCustom && searchTerm && (
                                            <Button
                                                variant="secondary"
                                                className="mt-2 w-full h-8 text-xs"
                                                onClick={() => {
                                                    onChange(null, searchTerm);
                                                    setOpen(false);
                                                }}
                                            >
                                                Usar "{searchTerm}" como nome externo
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {members.map((member) => (
                                    <CommandItem
                                        key={member.id}
                                        value={`${member.label} ${member.role}`} // Searchable content
                                        onSelect={() => {
                                            onChange(member.id);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === member.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{member.label}</span>
                                            <span className="text-xs text-muted-foreground">{member.role}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
