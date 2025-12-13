import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Church, Flag, GraduationCap } from "lucide-react";

export default function GlobalAdmin() {
  return (
    <MainLayout>
      <Card className="mb-4">
        <CardHeader><CardTitle>Atalhos de Criação de Matrizes</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div className="border rounded p-3">
            <div className="flex items-center gap-2 mb-2"><Church className="h-5 w-5" /><span className="font-semibold">Igreja Matriz</span></div>
            <p className="text-xs mb-3">Criar uma igreja matriz e definir o pastor presidente.</p>
            <Button variant="hero" className="w-full" onClick={()=>window.location.href='/cadastrar-igreja-admin'}>Criar Igreja Matriz</Button>
          </div>
          <div className="border rounded p-3">
            <div className="flex items-center gap-2 mb-2"><Flag className="h-5 w-5" /><span className="font-semibold">Convenção Estadual</span></div>
            <p className="text-xs mb-3">Adicionar convenções estaduais dentro de uma nacional.</p>
            <Button variant="hero" className="w-full" onClick={()=>window.location.href='/admin/convencoes/estaduais'}>Criar Conv. Estadual</Button>
          </div>
          <div className="border rounded p-3">
            <div className="flex items-center gap-2 mb-2"><GraduationCap className="h-5 w-5" /><span className="font-semibold">Faculdade (Matriz)</span></div>
            <p className="text-xs mb-3">Criar matriz EAD e depois vincular polos e núcleos.</p>
            <Button variant="hero" className="w-full" onClick={()=>window.location.href='/admin/faculdades/matriz'}>Criar Faculdade Matriz</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>SISCOF – SUPER ADMIN</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <Button onClick={()=>window.location.href='/admin/igrejas/matriz'}>Gerenciar Igrejas</Button>
          <Button onClick={()=>window.location.href='/admin/convencoes/nacionais'}>Gerenciar Convenções</Button>
          <Button onClick={()=>window.location.href='/admin/faculdades/matriz'}>Gerenciar Faculdades EAD</Button>
          <Button onClick={()=>window.location.href='/admin/planos'}>Planos e Assinaturas</Button>
          <Button onClick={()=>window.location.href='/admin/relatorios-globais'}>Relatórios Globais</Button>
          <Button onClick={()=>window.location.href='/admin/usuarios'}>Usuários</Button>
          <Button onClick={()=>window.location.href='/admin/logos'}>Logos</Button>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>Fluxos de Criação (Passo a passo)</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div className="border rounded p-3">
            <div className="flex items-center gap-2 mb-2"><Flag className="h-5 w-5" /><span className="font-semibold">Convenções</span></div>
            <div className="grid gap-2">
              <Button variant="hero" onClick={()=>window.location.href='/admin/convencoes/nacionais'}>Criar Convenção Nacional</Button>
              <Button variant="secondary" onClick={()=>window.location.href='/admin/convencoes/estaduais'}>Depois: Convenções Estaduais</Button>
              <Button variant="outline" onClick={()=>window.location.href='/admin/convencoes/coordenadorias'}>Depois: Coordenadorias</Button>
            </div>
          </div>
          <div className="border rounded p-3">
            <div className="flex items-center gap-2 mb-2"><GraduationCap className="h-5 w-5" /><span className="font-semibold">Faculdade (EAD)</span></div>
            <div className="grid gap-2">
              <Button variant="hero" onClick={()=>window.location.href='/admin/faculdades/matriz'}>Criar Faculdade Matriz</Button>
              <Button variant="secondary" onClick={()=>window.location.href='/admin/faculdades/polos'}>Depois: Polos</Button>
              <Button variant="outline" onClick={()=>window.location.href='/admin/faculdades/nucleos'}>Depois: Núcleos</Button>
            </div>
          </div>
          <div className="border rounded p-3">
            <div className="flex items-center gap-2 mb-2"><Church className="h-5 w-5" /><span className="font-semibold">Igrejas</span></div>
            <div className="grid gap-2">
              <Button variant="hero" onClick={()=>window.location.href='/cadastrar-igreja-admin'}>Criar Igreja Matriz</Button>
              <Button variant="secondary" onClick={()=>window.location.href='/admin/igrejas/sedes'}>Depois: Sedes</Button>
              <Button variant="secondary" onClick={()=>window.location.href='/admin/igrejas/subsedes'}>Depois: Subsedes</Button>
              <Button variant="secondary" onClick={()=>window.location.href='/admin/igrejas/congregacoes'}>Depois: Congregações</Button>
              <Button variant="outline" onClick={()=>window.location.href='/cadastrar-celula'}>Opcional: Células</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

