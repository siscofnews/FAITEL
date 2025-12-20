import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CollegeAdminDashboard() {
    return (
        <MainLayout>
            <Card>
                <CardHeader><CardTitle>Painel Faculdade Matriz</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-3">
                    <Button onClick={() => window.location.href = '/admin/faculdades/polos'}>Polos</Button>
                    <Button onClick={() => window.location.href = '/admin/faculdades/nucleos'}>Núcleos</Button>
                    <Button onClick={() => window.location.href = '/ead/admin/cursos'}>Cursos</Button>
                    <Button onClick={() => window.location.href = '/ead/admin/professores'}>Professores</Button>
                    <Button onClick={() => window.location.href = '/ead/admin/alunos'}>Alunos</Button>
                    <Button onClick={() => window.location.href = '/ead/admin/modulos'}>Módulos</Button>
                    <Button onClick={() => window.location.href = '/ead/admin/banco-questoes'}>Banco de Questões</Button>
                    <Button onClick={() => window.location.href = '/ead/relatorios/academicos'}>Relatórios Acadêmicos</Button>
                    <Button onClick={() => window.location.href = '/ead/admin/financeiro'}>Financeiro</Button>
                    <Button onClick={() => window.location.href = '/ead/admin/configuracoes'}>Configurações</Button>
                </CardContent>
            </Card>
        </MainLayout>
    );
}
