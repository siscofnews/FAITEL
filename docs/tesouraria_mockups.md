## Painel Dashboard (Igreja)
- Cards: Entradas mês, Despesas mês, Repasse, Saldo
- Gráfico: entradas vs despesas
- Ações: Novo lançamento, Nova despesa, Fechar caixa

### React snippet
```tsx
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
export default function TreasuryDashboard({ churchId }: { churchId: string }) {
  const [totals, setTotals] = useState<any>({ entries:0, expenses:0, repass:0, balance:0 })
  useEffect(()=>{ (async()=>{
    const { data: e } = await supabase.from('church_entries').select('amount').eq('church_id', churchId)
    const { data: x } = await supabase.from('church_expenses').select('total_value').eq('church_id', churchId)
    const sE = (e||[]).reduce((a,b)=>a+Number(b.amount||0),0)
    const sX = (x||[]).reduce((a,b)=>a+Number(b.total_value||0),0)
    setTotals({ entries:sE, expenses:sX, repass:0, balance:sE-sX })
  })() },[churchId])
  return <div className='grid md:grid-cols-4 gap-4'>
    <Card><CardHeader><CardTitle>Entradas</CardTitle></CardHeader><CardContent>{totals.entries}</CardContent></Card>
    <Card><CardHeader><CardTitle>Despesas</CardTitle></CardHeader><CardContent>{totals.expenses}</CardContent></Card>
    <Card><CardHeader><CardTitle>Repasse</CardTitle></CardHeader><CardContent>{totals.repass}</CardContent></Card>
    <Card><CardHeader><CardTitle>Saldo</CardTitle></CardHeader><CardContent>{totals.balance}</CardContent></Card>
  </div>
}
```

## Formulário de Entrada
- Campos: tipo, valor, método, descrição, conta

### React snippet
```tsx
export function EntryForm({ churchId, accountId, onSaved }: any) {
  const [form, setForm] = useState({ finance_type_id:'', amount:'', payment_method:'PIX', description:'' })
  const save = async () => { await supabase.from('church_entries').insert({ church_id: churchId, account_id: accountId, ...form, amount: Number(form.amount) }); onSaved?.() }
  return <div>
    <input value={form.amount} onChange={e=>setForm({ ...form, amount: e.target.value })} />
    <select value={form.payment_method} onChange={e=>setForm({ ...form, payment_method: e.target.value as any })}><option>PIX</option><option>CARTAO</option></select>
    <button onClick={save}>Salvar</button>
  </div>
}
```

## Fechamento
- Totais, cálculo de repasse, botão fechar

### React snippet
```tsx
export function Closure({ accountId }: any) {
  const close = async () => { await supabase.rpc('calculate_repass_and_close', { account_uuid: accountId }) }
  return <button onClick={close}>Fechar caixa</button>
}
```

