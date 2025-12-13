import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Props = { role: string; children: any };

export default function RoleGuard({ role, children }: Props) {
  const [ok, setOk] = useState<boolean>(false);
  useEffect(()=>{ (async()=>{
    const { data: sessionData } = await supabase.auth.getSession(); const uid = sessionData.session?.user?.id; if (!uid) { setOk(false); return; }
    const { data } = await supabase.from('ead_roles').select('role').eq('user_id', uid).limit(1);
    const r = (data||[])[0]?.role; setOk(r===role || role==='ANY');
  })(); },[]);
  if (!ok) return null;
  return children;
}

