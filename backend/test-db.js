import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

// The asterisk character (*) is considered a special character in URLs. 
// It should be percent-encoded as %2A in the connection string.
// Let's modify the test script to handle encoding automatically.

const pass = encodeURIComponent("hatdogka143*");
const ref = "ouchlpkcrrhjxldmmgqm";
const host = "aws-1-ap-northeast-1.pooler.supabase.com";

const urls = [
  // 1. Transaction Pooler (Port 6543 - user.ref style)
  `postgresql://postgres.${ref}:${pass}@${host}:6543/postgres`,
  
  // 2. Session Pooler (Port 5432 - user.ref style)
  `postgresql://postgres.${ref}:${pass}@${host}:5432/postgres`,
  
  // 3. IPv4 compatible Transaction Pooler (port 6543 user straight)
  `postgresql://postgres:${pass}@${host}:6543/postgres`,
  
  // 4. Session Pooler (Port 5432 user straight)
  `postgresql://postgres:${pass}@${host}:5432/postgres`,
  
  // 5. Direct
  `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`
];

async function testConnection(url) {
  console.log('Testing:', url.replace(pass, '***'));
  const sql = postgres(url, { max: 1, connect_timeout: 10, ssl: 'require' });
  try {
    await sql`SELECT 1`;
    console.log('--- SUCCESS! ---');
    console.log(url.replace(pass, '***'));
    import('fs').then(fs => {
       fs.writeFileSync('.env', `PORT=5000\nDATABASE_URL=${url}\n`);
    });
    return true;
  } catch (err) {
    console.error('FAILED:', err.message);
    return false;
  } finally {
    try { await sql.end() } catch(e){}
  }
}

async function run() {
  for (const url of urls) {
     const ok = await testConnection(url);
     if (ok) process.exit(0);
  }
  process.exit(1);
}

run();
