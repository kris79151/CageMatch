import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface HistoryItem {
  id: string;
  prompt: string;
  mode: string;
  credits_charged: number;
  created_at: string;
  share_token: string;
  models_used: string[];
  builder_response: string;
  critic_response: string;
  wildcard_response: string;
  builder_model: string;
  critic_model: string;
  wildcard_model: string;
}

const MODEL_DISPLAY: Record<string, string> = {
  'claude-sonnet-4': 'Claude Sonnet 4',
  'gpt-4o': 'GPT-4o',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'deepseek-chat': 'DeepSeek V3',
  'grok-3': 'Grok 3',
};

export default function History() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from('ark_cage_match_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    setItems((data as HistoryItem[]) || []);
    setLoading(false);
  };

  const filtered = filterMode === 'all' ? items : items.filter((i) => i.mode === filterMode);
  const modes = [...new Set(items.map((i) => i.mode).filter(Boolean))];

  if (loading) {
    return <div className="text-text-light">Loading history...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        History
      </h2>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
            filterMode === 'all' ? 'border-teal bg-teal/10 text-teal-dark' : 'border-border text-text-light'
          }`}
        >
          All
        </button>
        {modes.map((m) => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
              filterMode === m ? 'border-teal bg-teal/10 text-teal-dark' : 'border-border text-text-light'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-text-light text-sm">No sessions yet. Run your first fight!</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-border">
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-teal/10 text-teal-dark px-2 py-0.5 rounded-full font-medium">
                      {item.mode || 'analysis'}
                    </span>
                    <span className="text-xs text-text-light">
                      {item.credits_charged} credits
                    </span>
                    <span className="text-xs text-text-light">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-text truncate">
                    {item.prompt?.slice(0, 100)}
                    {(item.prompt?.length ?? 0) > 100 ? '...' : ''}
                  </p>
                </div>
                <span className="text-text-light ml-2">{expanded === item.id ? '-' : '+'}</span>
              </button>

              {expanded === item.id && (
                <div className="border-t border-border px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { model: item.builder_model, response: item.builder_response },
                    { model: item.critic_model, response: item.critic_response },
                    { model: item.wildcard_model, response: item.wildcard_response },
                  ].map((r, i) => (
                    <div key={i}>
                      <h4 className="text-xs font-semibold text-purple mb-2">
                        {MODEL_DISPLAY[r.model] || r.model}
                      </h4>
                      <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                        {r.response}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
