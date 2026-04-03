import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { callEdgeFunction } from '../lib/supabase';

interface FightData {
  type: 'fight';
  prompt: string;
  mode: string;
  created_at: string;
  responses: { model: string; response: string }[];
}

interface PingPongData {
  type: 'ping-pong';
  prompt: string;
  builder_model: string;
  responder_models: string[];
  rounds: any[];
  current_round: number;
  max_rounds: number;
  status: string;
  created_at: string;
}

type ShareData = FightData | PingPongData;

export default function ShareView() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    callEdgeFunction('cage-match-share', { share_token: token }, false)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text-light">Loading shared session...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger mb-4">{error || 'Session not found'}</p>
          <Link to="/" className="text-teal hover:text-teal-dark text-sm font-medium">
            Go to Cage Match
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple" style={{ fontFamily: 'var(--font-heading)' }}>
            Cage Match
          </h1>
          <Link to="/signup" className="text-sm text-teal hover:text-teal-dark font-medium">
            Try it free
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-teal/10 text-teal-dark px-2 py-0.5 rounded-full font-medium">
              {data.type === 'fight' ? data.mode : 'ping-pong'}
            </span>
            <span className="text-xs text-text-light">
              {new Date(data.created_at).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-text">{data.prompt}</h2>
        </div>

        {data.type === 'fight' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.responses.map((r, i) => (
              <div key={i} className="bg-white rounded-lg border border-border p-5">
                <h3 className="text-sm font-semibold text-purple mb-3">{r.model}</h3>
                <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                  {r.response}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.type === 'ping-pong' && (
          <div className="space-y-4">
            {data.rounds.map((round: any, ri: number) => (
              <div key={ri} className="space-y-3">
                <h3 className="text-sm font-semibold text-purple-light">Round {round.round}</h3>
                {round.builder && (
                  <div className="bg-white rounded-lg border border-teal/30 p-5">
                    <div className="text-xs text-teal font-medium mb-2">
                      Builder: {round.builder.display || round.builder.model}
                    </div>
                    <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {round.builder.response}
                    </div>
                  </div>
                )}
                {round.responders?.map((r: any, i: number) => (
                  <div key={i} className="bg-white rounded-lg border border-purple/20 p-5">
                    <div className="text-xs text-purple font-medium mb-2">
                      Responder: {r.display || r.model}
                    </div>
                    <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                      {r.response}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
