import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function TreasuryClosure() {
  const [accountId, setAccountId] = useState<string>("");
  const close = async () => { if (!accountId) return; await supabase.rpc('calculate_repass_and_close', { account_uuid: accountId }); };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Fechamento de Caixa</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <input value={accountId} onChange={(e)=>setAccountId(e.target.value)} placeholder="ID da conta" />
          <Button onClick={close}>Fechar caixa</Button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

