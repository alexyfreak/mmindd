/**
 * One-off script to create your single login account in Supabase.
 * Usage:
 *   npx tsx scripts/create-user.ts
 *
 * Requires environment variables:
 *   SUPABASE_URL (management URL or same as VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard -> Settings -> API -> service_role key)
 */

const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const email = process.env.USER_EMAIL || 'me@example.com'
const password = process.env.USER_PASSWORD || 'change-me-123'

const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({ email, password, email_confirm: true }),
})

const data = await response.json()

if (response.ok) {
  console.log(`✓ User created: ${data.email} (${data.id})`)
} else {
  console.error('× Failed to create user:', data)
  process.exit(1)
}
