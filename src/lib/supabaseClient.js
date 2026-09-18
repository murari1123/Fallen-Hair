/* ============================================
   FALLEN HAIR — Supabase Client
   Public client using the publishable (anon) key.
   All security is enforced by Row Level Security
   policies on the Supabase database.

   NEVER import or use a service_role key here.
   ============================================ */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)

/* Dedicated isolated client for public visitor enquiry submissions.
   Guarantees that public form submissions ALWAYS operate under the 'anon' role
   and never inherit or attach authenticated admin sessions stored in localStorage. */
export const supabasePublic = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)

