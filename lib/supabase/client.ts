 import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

 // Provide a client that syncs the session to cookies so Next.js middleware
 // can read authentication state on the server.
 export function createSupabaseClient() {
   return createClientComponentClient()
 }
