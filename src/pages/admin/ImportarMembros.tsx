import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ImportarMembros() {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = lines[0].split(',').map(h=>h.trim());
    const records = lines.slice(1).map(line => {
      const cols = line.split(',');
      const obj: any = {}; headers.forEach((h,i)=>{ obj[h]=cols[i]; });
      return obj;
    });
    setRows(records);
  };
  const importRows = async () => {
    let ok = 0;
    for (const r of rows) {
      const { data: m, error } = await supabase.from('members').insert({ full_name: r.full_name, birth_date: r.birth_date, email: r.email, phone: r.phone, church_id: r.church_id, role: r.role || null, is_tither: r.is_tither==='true', is_offeror: r.is_offeror==='true' }).select('id').single();
      if (!error && m?.id) {
        await supabase.rpc('assign_member_department', { m_id: m.id });
        await supabase.from('audit_logs').insert({ entity: 'member', entity_id: m.id, action: 'IMPORT', details: r });
        ok++;
      }
    }
    toast({ title: `Importados ${ok}/${rows.length}` });
  };
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Importação de Membros (CSV)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <input type="file" accept=".csv" onChange={(e)=>{ const f = e.target.files?.[0]; if (f) parseCSV(f); }} />
          <Button onClick={importRows} disabled={!rows.length}>Importar</Button>
          <div className="text-xs text-muted-foreground">Cabeçalhos esperados: full_name,birth_date,email,phone,church_id,role,is_tither,is_offeror</div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

