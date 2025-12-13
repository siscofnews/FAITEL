
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env')

const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    env[key.trim()] = value.trim()
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('Testing connection to:', supabaseUrl)
console.log('With key starting:', supabaseKey?.substring(0, 10))

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Tentar acessar chat_messages como sugerido pelo erro anterior
    console.log("Tentando acessar 'chat_messages'...")
    const { data, error } = await supabase.from('chat_messages').select('*').limit(1)
    
    if (error) {
      console.error('Connection failed (chat_messages):', error.message)
      console.error('Error details:', error)
      
      // Se falhar, tentar listar tabelas via rpc se existir, ou apenas informar
    } else {
      console.log('Connection successful! Data:', data)
    }

  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection()
