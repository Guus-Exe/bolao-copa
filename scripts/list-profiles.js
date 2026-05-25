
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltando variáveis de ambiente no .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, is_admin, is_paid');

  if (error) {
    console.error("Erro ao carregar perfis:", error.message);
    return;
  }

  console.log("=== PERFIS NO BANCO ===");
  profiles.forEach(p => {
    console.log(`ID: ${p.id} | Username: ${p.username} | Admin: ${p.is_admin} | Paid: ${p.is_paid}`);
  });
}

main();
