const { createClient } = require('@supabase/supabase-js')

const url = process.env.SUPABASE_URL || ''
const key = process.env.SUPABASE_KEY || ''

let supabase = null
if (url && key) {
  supabase = createClient(url, key)
}

function getSupabase() {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase
}

module.exports = getSupabase
