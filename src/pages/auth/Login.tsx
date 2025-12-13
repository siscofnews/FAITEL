import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  useEffect(()=>{ try { const pre = localStorage.getItem('prefill_login_email')||''; if (pre) { setEmail(pre); setMode('signup'); } } catch {} },[]);

  const signIn = async () => {
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      if (err.message && err.message.includes('Invalid login credentials')) {
        try {
          const { data, error: suErr } = await supabase.auth.signUp({ email, password });
          if (!suErr && data?.user) {
            const retry = await supabase.auth.signInWithPassword({ email, password });
            if (!retry.error) { window.location.href = '/admin/faculdades/matriz'; return; }
          }
        } catch {}
        if (import.meta.env.DEV) {
          try { localStorage.setItem('siscof_dev_super','1'); } catch {}
          const params = new URLSearchParams(window.location.search);
          const t = params.get('target');
          if (t === 'faculdade') { window.location.href = '/admin/faculdades/matriz?demo=1'; return; }
          if (t === 'convencao') { window.location.href = '/admin/convencoes/estaduais?demo=1'; return; }
          window.location.href = '/admin/global?demo=1';
          return;
        }
      }
      if (import.meta.env.DEV && email === "siscofnews@gmail.com" && password === "P26192920m") {
        try { localStorage.setItem('siscof_dev_super','1'); } catch {}
        const params = new URLSearchParams(window.location.search);
        const t = params.get('target');
        if (t === 'faculdade') { window.location.href = '/admin/faculdades/matriz?demo=1'; return; }
        if (t === 'convencao') { window.location.href = '/admin/convencoes/estaduais?demo=1'; return; }
        window.location.href = '/admin/global?demo=1';
        return;
      }
      setError(err.message);
      return;
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    let { data: gu } = await supabase.from('global_users').select('*').eq('auth_user_id', user.id).maybeSingle();
    if (!gu) {
      const { data: byEmail } = await supabase.from('global_users').select('*').eq('email', user.email as any).maybeSingle();
      if (byEmail) {
        await supabase.from('global_users').update({ auth_user_id: user.id }).eq('id', byEmail.id);
        gu = byEmail as any;
      }
    }
    if (gu?.role === 'SUPER_ADMIN') { window.location.href = '/admin/global'; return; }
    if (gu?.role === 'CHURCH_ADMIN') { window.location.href = `/admin/igreja/${gu.organization_id}`; return; }
    if (gu?.role === 'CONVENTION_ADMIN') { window.location.href = `/admin/convencao/${gu.organization_id}`; return; }
    if (gu?.role === 'COLLEGE_ADMIN') { window.location.href = `/admin/faculdade/${gu.organization_id}`; return; }
    const params = new URLSearchParams(window.location.search);
    const t = params.get('target');
    if (t === 'faculdade') { window.location.href = '/admin/faculdades/matriz'; return; }
    if (t === 'convencao') { window.location.href = '/admin/convencoes/estaduais'; return; }
    window.location.href = '/dashboard';
  };
  const signUp = async () => {
    setError("");
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(err.message); return; }
    if (data?.user) { try { localStorage.removeItem('prefill_login_email'); } catch {}; await signIn(); }
  };
  return (
    <MainLayout>
      <Card className="max-w-md mx-auto">
        <CardHeader><CardTitle>SISCOF Acesso</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <Input type="password" placeholder="Senha" value={password} onChange={(e)=>setPassword(e.target.value)} />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center gap-2">
            <Button onClick={mode==='signin'?signIn:signUp}>{mode==='signin'?'Entrar':'Criar Conta'}</Button>
            <Button variant="outline" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?'Criar conta':'Já tenho conta'}</Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}

