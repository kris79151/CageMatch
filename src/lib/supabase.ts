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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
  };

  if (requireAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${FUNCTION_BASE}/${name}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}
