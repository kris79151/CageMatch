import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase, callEdgeFunction } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

interface CagMatchUser {
  id: string;
  auth_user_id: string;
  email: string;
  tier: string;
  free_runs_remaining: number;
  credits_remaining: number;
  credits_monthly: number;
  research_opted_in: boolean;
  persona_configured: boolean;
  onboarding_completed: boolean;
  persona_label: string | null;
  persona_context: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  cmUser: CagMatchUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  updateOptIn: (opted: boolean) => Promise<void>;
  updatePersona: (label: string, context: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [cmUser, setCmUser] = useState<CagMatchUser | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  async function fetchCmUser() {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const data = await callEdgeFunction('cage-match-credits', { action: 'balance' });
      setCmUser((prev) => prev ? { ...prev, ...data } : data);
    } catch (err) {
      console.error('[CageMatch] fetchCmUser failed:', err);
    } finally {
      fetchingRef.current = false;
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Don't call fetchCmUser here — onAuthStateChange INITIAL_SESSION handles it
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Skip token refresh events to prevent loop:
      // fetchCmUser -> 401 -> refreshSession -> TOKEN_REFRESHED -> fetchCmUser -> loop
      if (event === 'TOKEN_REFRESHED') return;
      if (s?.user) fetchCmUser();
      else setCmUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCmUser(null);
  };

  const refreshCredits = async () => {
    await fetchCmUser();
  };

  const updateOptIn = async (opted: boolean) => {
    await callEdgeFunction('cage-match-credits', {
      action: 'update_opt_in',
      research_opted_in: opted,
    });
    setCmUser((prev) => prev ? { ...prev, research_opted_in: opted } : prev);
  };

  const updatePersona = async (label: string, context: string) => {
    await callEdgeFunction('cage-match-credits', {
      action: 'update_persona',
      persona_label: label,
      persona_context: context,
    });
    setCmUser((prev) =>
      prev ? { ...prev, persona_label: label, persona_context: context, persona_configured: true } : prev
    );
  };

  const completeOnboarding = async () => {
    await callEdgeFunction('cage-match-credits', { action: 'complete_onboarding' });
    setCmUser((prev) => prev ? { ...prev, onboarding_completed: true } : prev);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, cmUser, loading, signUp, signIn, signOut, refreshCredits, updateOptIn, updatePersona, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
