const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  const email = process.env.SEED_SUPER_ADMIN_EMAIL
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD
  if (!url || !key || !email || !password) { console.error('Missing env'); process.exit(1) }
  const supabase = createClient(url, key)
  const { data: userRes, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) { console.error(error); process.exit(1) }
  const uid = userRes.user.id
  await supabase.from('global_users').upsert({ auth_user_id: uid, email, role: 'SUPER_ADMIN' }, { onConflict: 'auth_user_id' })
  console.log('Super admin created', email)
}

main()

