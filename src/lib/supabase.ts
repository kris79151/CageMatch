import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gigmxautxzacndvuxhql.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
  },
});

const FUNCTION_BASE = `${supabaseUrl}/functions/v1`;

export async function callEdgeFunction(
  name: string,
  body: Record<string, unknown>,
  requireAuth = true
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
  };

  if (requireAuth) {
    let { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  let res = await fetch(`${FUNCTION_BASE}/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  // If token was stale, refresh and retry once
  if (res.status === 401 && requireAuth) {
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      res = await fetch(`${FUNCTION_BASE}/${name}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}
