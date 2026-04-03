import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gigmxautxzacndvuxhql.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FUNCTION_BASE = `${supabaseUrl}/functions/v1`;

export async function callEdgeFunction(
  name: string,
  body: Record<string, unknown>,
  requireAuth = true
) {
  // Send anon key as Authorization so the Supabase gateway accepts the request.
  // The project uses ES256 user tokens which the gateway rejects as Authorization.
  // Pass the user token in the request body instead — edge functions validate it
  // via supabase.auth.getUser() which works with any algorithm.
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
  };

  if (requireAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    body = { ...body, _access_token: session.access_token };
  }

  const res = await fetch(`${FUNCTION_BASE}/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}
