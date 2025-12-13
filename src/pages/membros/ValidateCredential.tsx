import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export default function ValidateCredential() {
  const [params] = useSearchParams();
  const memberId = params.get("member") || "";
  const token = params.get("token") || "";
  const [member, setMember] = useState<any>(null);
  const [valid, setValid] = useState(false);
  useEffect(() => { (async () => {
    if (!memberId || !token || btoa(memberId) !== token) return;
    const { data: m } = await supabase.from("members").select("*, departments(name), churches(nome_fantasia)").eq("id", memberId).maybeSingle();
    if (m) { setMember(m); setValid(true); }
  })(); }, [memberId, token]);
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-[420px]">
        <CardContent className="p-6">
          {valid && member ? (
            <div className="space-y-2">
              <div className="font-bold text-lg">Credencial válida</div>
              <div>{member.full_name}</div>
              <div className="text-sm">{member.role || "Membro"} • {member.departments?.name || "Departamento"}</div>
              <div className="text-xs text-muted-foreground">{member.churches?.nome_fantasia || "Igreja"}</div>
              <Badge variant={member.is_active ? "default" : "destructive"}>{member.is_active ? "Ativo" : "Inativo"}</Badge>
            </div>
          ) : (
            <div>Credencial inválida</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

