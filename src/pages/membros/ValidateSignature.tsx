import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export default function ValidateSignature() {
  const [params] = useSearchParams();
  const memberId = params.get("member") || "";
  const type = (params.get("type") || "member") as 'member'|'convention'|'student';
  const [row, setRow] = useState<any>(null);
  useEffect(() => { (async () => {
    const { data } = await supabase.from('credential_numbers').select('*').eq('member_id', memberId).eq('type', type).maybeSingle();
    setRow(data||null);
  })(); }, [memberId, type]);
  const ok = !!row?.signature_url && !!row?.signed_at;
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-[420px]">
        <CardContent className="p-6">
          {ok ? (
            <div className="space-y-2">
              <div className="font-bold text-lg">Assinatura verificada</div>
              <div className="text-sm">Número: {row.number}</div>
              <div className="text-xs text-muted-foreground">Assinada em {new Date(row.signed_at).toLocaleString('pt-BR')}</div>
              <img src={row.signature_url} className="w-40 h-24 object-cover rounded" />
              <Badge>Válida</Badge>
            </div>
          ) : (
            <div>Assinatura não encontrada</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

