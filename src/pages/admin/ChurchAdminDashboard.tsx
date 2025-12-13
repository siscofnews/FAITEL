import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ChurchAdminDashboard() {
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Painel Igreja Matriz</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <Button onClick={()=>window.location.href='/admin/igrejas/sedes'}>Sedes</Button>
          <Button onClick={()=>window.location.href='/admin/igrejas/subsedes'}>Subsedes</Button>
          <Button onClick={()=>window.location.href='/admin/igrejas/congregacoes'}>Congregações</Button>
          <Button>Patrimônio</Button>
          <Button>Membros</Button>
          <Button onClick={()=>window.location.href='/tesouraria'}>Tesouraria</Button>
          <Button onClick={()=>window.location.href='/tesouraria/relatorios'}>Relatórios Mensais</Button>
          <Button onClick={()=>window.location.href='/tesouraria/consolidacao'}>Consolidação</Button>
          <Button>Configurações</Button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

