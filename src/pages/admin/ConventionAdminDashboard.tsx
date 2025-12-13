import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConventionAdminDashboard() {
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Painel Convenção Nacional</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <Button onClick={()=>window.location.href='/admin/convencoes/estaduais'}>Estaduais</Button>
          <Button onClick={()=>window.location.href='/admin/convencoes/coordenadorias'}>Coordenadorias</Button>
          <Button onClick={()=>window.location.href='/tesouraria'}>Tesouraria</Button>
          <Button onClick={()=>window.location.href='/tesouraria/relatorios'}>Relatórios</Button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

