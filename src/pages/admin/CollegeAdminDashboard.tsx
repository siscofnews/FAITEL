import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CollegeAdminDashboard() {
  return (
    <MainLayout>
      <Card>
        <CardHeader><CardTitle>Painel Faculdade EAD</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <Button onClick={()=>window.location.href='/admin/faculdades/polos'}>Polos</Button>
          <Button onClick={()=>window.location.href='/admin/faculdades/nucleos'}>Núcleos</Button>
          <Button>Cursos</Button>
          <Button>Alunos</Button>
          <Button onClick={()=>window.location.href='/tesouraria'}>Tesouraria EAD</Button>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

