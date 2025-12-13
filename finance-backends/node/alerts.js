const { createClient } = require('@supabase/supabase-js')

async function main() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  const { data: alerts } = await supabase.from('finance_alerts').select('*').eq('status','pending').order('created_at',{ascending:true}).limit(200)
  const { data: ccEmails } = await supabase.from('cost_center_notifications').select('*')
  const emailByCC = new Map((ccEmails||[]).map(e=>[(e.cost_center_id||'sem'), e.email]))
  for (const a of (alerts||[])) {
    const email = emailByCC.get(a.cost_center_id||'sem') || process.env.DEFAULT_ALERT_EMAIL
    const subject = `Alerta Meta ${a.nature} ${a.period_label} (${Math.round(a.pct)}%)`
    const body = `Entidade: ${a.entity} ${a.entity_id}\nCentro: ${a.cost_center_id||'sem'}\nAno: ${a.year}\nTarget: ${a.target_amount}\nActual: ${a.actual_amount}\nPct: ${a.pct}`
    console.log('SEND', email, subject)
    await supabase.from('finance_alerts').update({ status: 'sent', email_to: email }).eq('id', a.id)
  }
}

main()

