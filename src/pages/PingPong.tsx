import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { callEdgeFunction } from '../lib/supabase';

const MODEL_POOL = [
  { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5' },
  { id: 'claude-opus-4-5', name: 'Claude Opus 4.5' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'deepseek-chat', name: 'DeepSeek V3' },
  { id: 'grok-3', name: 'Grok 3' },
];

interface Round {
  round: number;
  builder?: { model: string; display: string; response: string };
  responders?: { model: string; display: string; response: string }[];
}

export default function PingPong() {
  const { cmUser, refreshCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [builderModel, setBuilderModel] = useState('claude-sonnet-4-5');
  const [responderModels, setResponderModels] = useState<string[]>(['gpt-4o']);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [maxRounds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState('');

  const toggleResponder = (id: string) => {
    setResponderModels((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const handleStart = async () => {
    if (!prompt.trim()) return;
    setError('');
    setLoading(true);

    try {
      const data = await callEdgeFunction('cage-match-ping-pong', {
        action: 'start',
        prompt,
        builder_model: builderModel,
        responder_models: responderModels,
      });

      setSessionId(data.session_id);
      setShareToken(data.share_token);
      setCurrentRound(1);
      setRounds([
        {
          round: 1,
          builder: data.builder,
        },
      ]);
      await refreshCredits();
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleNextRound = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');

    try {
      const data = await callEdgeFunction('cage-match-ping-pong', {
        action: 'next_round',
        session_id: sessionId,
      });

      setCurrentRound(data.round);
      setRounds((prev) => [
        ...prev,
        {
          round: data.round,
          responders: data.responders,
          builder: data.builder,
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to get next round');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      const data = await callEdgeFunction('cage-match-ping-pong', {
        action: 'finish',
        session_id: sessionId,
      });
      setFinished(true);
      setShareToken(data.share_token);
    } catch (err: any) {
      setError(err.message || 'Failed to finish');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFinal = () => {
    const lastRound = rounds[rounds.length - 1];
    if (lastRound?.builder) {
      navigator.clipboard.writeText(lastRound.builder.response);
    }
  };

  const handleShare = () => {
    if (!shareToken) return;
    navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
  };

  // Setup phase
  if (!sessionId) {
    return (
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-purple mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Ping-Pong
        </h2>
        <p className="text-sm text-text-light mb-6">
          One AI builds. Others critique. The builder revises. Up to 5 rounds. 8 credits.
        </p>

        {/* Step 1 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-2">
            Step 1: Describe your idea
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What do you want built, refined, or pressure-tested?"
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-teal bg-white"
          />
        </div>

        {/* Step 2 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-2">
            Step 2: Pick your Builder
          </label>
          <select
            value={builderModel}
            onChange={(e) => setBuilderModel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-teal bg-white"
          >
            {MODEL_POOL.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 3 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-2">
            Step 3: Pick Responders (1-2)
          </label>
          <div className="flex flex-wrap gap-2">
            {MODEL_POOL.filter((m) => m.id !== builderModel).map((m) => (
              <button
                key={m.id}
                onClick={() => toggleResponder(m.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all border ${
                  responderModels.includes(m.id)
                    ? 'border-teal bg-teal/10 text-teal-dark'
                    : 'border-border hover:border-teal/50 text-text'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        <div className="text-sm text-text-light mb-3">
          Credits: <span className="font-semibold text-teal">{cmUser?.credits_remaining ?? 0}</span> remaining (this costs 8)
        </div>

        <button
          onClick={handleStart}
          disabled={loading || !prompt.trim() || responderModels.length === 0}
          className="w-full bg-teal text-white py-3 rounded-lg font-bold text-lg hover:bg-teal-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Starting...' : 'FIGHT'}
        </button>
      </div>
    );
  }

  // Session in progress
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple" style={{ fontFamily: 'var(--font-heading)' }}>
          Ping-Pong — Round {currentRound} of {maxRounds}
        </h2>
        <span className="text-sm text-text-light">
          {finished ? 'Complete' : 'In progress'}
        </span>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger text-sm rounded-lg p-3 mb-4">{error}</div>
      )}

      {/* Round thread */}
      <div className="space-y-4">
        {rounds.map((round) => (
          <div key={round.round} className="space-y-3">
            <h3 className="text-sm font-semibold text-purple-light">Round {round.round}</h3>

            {/* Builder response */}
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

            {/* Responder responses */}
            {round.responders?.map((r, i) => (
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

      {/* Actions */}
      {!finished && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleNextRound}
            disabled={loading || currentRound >= maxRounds}
            className="flex-1 bg-teal text-white py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Get Feedback + Revise'}
          </button>
          <button
            onClick={handleFinish}
            disabled={loading}
            className="bg-purple text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-light transition-colors disabled:opacity-50"
          >
            Finish
          </button>
        </div>
      )}

      {finished && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCopyFinal}
            className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-border/50 transition-colors"
          >
            Copy Final Spec
          </button>
          <button
            onClick={handleShare}
            className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-border/50 transition-colors"
          >
            Share
          </button>
        </div>
      )}
    </div>
  );
}
