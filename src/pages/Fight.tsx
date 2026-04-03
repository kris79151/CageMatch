import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { callEdgeFunction } from '../lib/supabase';

const ALL_MODES = [
  { id: 'analysis', label: 'Analysis', credits: 2, lite: true, desc: 'Get your idea reviewed by 3 AIs at once' },
  { id: 'proposal', label: 'Proposal', credits: 2, lite: true, desc: 'Turn a rough idea into a concrete plan' },
  { id: 'translation', label: 'Translation', credits: 2, lite: true, desc: 'Rewrite for a different audience' },
  { id: 'writing', label: 'Writing', credits: 3, lite: false, desc: 'Three different takes on your piece' },
  { id: 'debate', label: 'Debate', credits: 3, lite: false, desc: 'AIs argue both sides of your question' },
  { id: 'pattern', label: 'Pattern', credits: 3, lite: false, desc: 'Find structural patterns others miss' },
  { id: 'negotiation', label: 'Negotiation', credits: 4, lite: false, desc: 'Map competing interests and find leverage' },
  { id: 'simulation', label: 'Simulation', credits: 5, lite: false, desc: 'Run your scenario forward — what actually happens?' },
  { id: 'red-team', label: 'Red Team', credits: 5, lite: false, desc: 'Find every way this fails' },
  { id: 'stress-test', label: 'Stress Test', credits: 5, lite: false, desc: 'Push every assumption to its breaking point' },
];

interface FightResponse {
  model: string;
  model_id: string;
  response: string;
}

export default function Fight() {
  const { cmUser, refreshCredits } = useAuth();
  const [mode, setMode] = useState('analysis');
  const [prompt, setPrompt] = useState('');
  const [fighting, setFighting] = useState(false);
  const [responses, setResponses] = useState<FightResponse[] | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [lockRotation, setLockRotation] = useState(false);
  const [lockedModels, setLockedModels] = useState<string[] | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const tier = cmUser?.tier ?? 'free';
  const isFree = tier === 'free';
  const isLite = tier === 'lite';
  const isPro = tier === 'pro';
  const creditsRemaining = cmUser?.credits_remaining ?? 0;
  const freeRuns = cmUser?.free_runs_remaining ?? 0;
  const freeTrialExhausted = isFree && freeRuns <= 0;

  const handleFight = async () => {
    if (!prompt.trim()) return;

    if (freeTrialExhausted) {
      setShowUpgradeModal(true);
      return;
    }

    setError('');
    setFighting(true);
    setResponses(null);
    setShareToken(null);

    try {
      const payload: Record<string, unknown> = { prompt, mode };
      if (lockRotation && lockedModels) {
        payload.locked_models = lockedModels;
      }

      const data = await callEdgeFunction('cage-match-fight', payload);
      setResponses(data.responses);
      setShareToken(data.share_token);

      if (data.models_used) {
        setLockedModels(data.models_used);
      }

      await refreshCredits();
    } catch (err: any) {
      if (err.message === 'Insufficient credits') {
        if (isFree) {
          setShowUpgradeModal(true);
        } else {
          setError('Insufficient credits. Top up in Settings.');
        }
      } else {
        setError(err.message || 'Fight failed');
      }
    } finally {
      setFighting(false);
    }
  };

  const handleCopyAll = () => {
    if (!responses) return;
    const md = responses
      .map((r) => `## ${r.model}\n\n${r.response}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
  };

  const selectedMode = ALL_MODES.find((m) => m.id === mode);

  return (
    <div>
      {/* Upgrade modal (Fix 4) */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}

      {/* Mode selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
        {ALL_MODES.map((m) => {
          // Free trial = full Pro access. Lite = lite modes only. Pro = all.
          const locked = isLite && !m.lite;
          return (
            <button
              key={m.id}
              onClick={() => !locked && setMode(m.id)}
              disabled={locked}
              className={`group relative px-3 py-2.5 rounded-lg text-left transition-all border ${
                mode === m.id
                  ? 'border-teal bg-teal/10'
                  : locked
                  ? 'border-border bg-border/20 cursor-not-allowed'
                  : 'border-border hover:border-teal/50'
              }`}
              title={locked ? 'Upgrade to Pro' : `${m.credits} credits`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-medium ${
                  mode === m.id ? 'text-teal-dark' : locked ? 'text-text-light/50' : 'text-text'
                }`}>
                  {m.label}
                </span>
                {locked && (
                  <svg className="w-3.5 h-3.5 text-text-light/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </div>
              <div className={`text-xs mt-0.5 leading-tight ${
                locked ? 'text-text-light/40' : 'text-text-light'
              }`}>
                {m.desc}
              </div>
              {locked && (
                <div className="absolute inset-x-0 -bottom-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                  <div className="bg-purple text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                    Upgrade to Pro
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Credit display (Fix 2) */}
      <div className="text-sm text-text-light mb-4">
        This fight costs <span className="font-semibold text-teal">{selectedMode?.credits}</span> credits.{' '}
        {isFree ? (
          <>You have <span className="font-semibold text-teal">{freeRuns}</span> free run{freeRuns !== 1 ? 's' : ''} remaining.</>
        ) : (
          <>You have <span className="font-semibold text-teal">{creditsRemaining}</span> credits remaining.</>
        )}
      </div>

      {/* Low credits warning banner (Fix 3) */}
      {isFree && freeRuns === 1 && (
        <div className="bg-purple/5 border border-purple/20 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between">
          <span className="text-sm text-text">
            1 free run left — upgrade to keep going
          </span>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="text-sm font-medium text-teal hover:text-teal-dark transition-colors"
          >
            Upgrade →
          </button>
        </div>
      )}

      {/* Prompt */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Drop your idea, plan, or question here..."
        rows={6}
        className="w-full px-4 py-3 rounded-lg border border-border text-sm resize-y focus:outline-none focus:border-teal bg-white"
      />

      {error && (
        <div className="bg-danger/10 text-danger text-sm rounded-lg p-3 mt-3">{error}</div>
      )}

      {/* Fight button */}
      <button
        onClick={handleFight}
        disabled={fighting || !prompt.trim()}
        className="mt-4 w-full bg-teal text-white py-3 rounded-lg font-bold text-lg hover:bg-teal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {fighting ? 'Fighting...' : 'FIGHT'}
      </button>

      {/* Responses */}
      {responses && (
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {responses.map((r, i) => (
              <div key={i} className="bg-white rounded-lg border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-purple">{r.model}</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(r.response);
                    }}
                    className="text-xs text-text-light hover:text-teal transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                  {r.response}
                </div>
              </div>
            ))}
          </div>

          {/* Actions bar */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={handleCopyAll}
              className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-border/50 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy All'}
            </button>
            <button
              onClick={handleShare}
              className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-border/50 transition-colors"
            >
              Share
            </button>
            <label className="flex items-center gap-2 text-sm text-text-light ml-auto">
              <input
                type="checkbox"
                checked={lockRotation}
                onChange={(e) => setLockRotation(e.target.checked)}
                className="rounded"
              />
              Lock rotation
            </label>
          </div>

          {/* Guardrails (Pro only) */}
          {isPro && responses.length === 3 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-border">
              <h4 className="text-sm font-semibold text-purple mb-2">Guardrails</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-light">Disagreement score: </span>
                  <span className="font-medium text-text">
                    {calculateDisagreement(responses)}
                  </span>
                </div>
                <div>
                  <span className="text-text-light">Confidence variance: </span>
                  <span className="font-medium text-text">
                    {calculateConfidence(responses)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isPro && (
            <div className="mt-4 p-4 bg-border/30 rounded-lg border border-border flex items-center gap-2 text-sm text-text-light">
              <span>Guardrails (confidence mismatch + disagreement score)</span>
              <span className="text-xs bg-purple/10 text-purple px-2 py-0.5 rounded-full font-medium ml-auto">
                Pro feature
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Upgrade Modal (Fix 4) ─────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-xl mx-4 p-8 relative">
        {/* X close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-light hover:text-text text-xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <h2
          className="text-2xl font-bold text-purple mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          You've used your 3 free runs
        </h2>
        <p className="text-sm text-text-light mb-6">Pick a plan to keep going</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Lite */}
          <div className="border border-border rounded-xl p-5">
            <h3 className="text-lg font-bold text-text mb-1">Lite</h3>
            <p className="text-2xl font-bold text-teal mb-3">
              $10<span className="text-sm font-normal text-text-light">/mo</span>
            </p>
            <ul className="space-y-1.5 text-sm text-text-light mb-4">
              <li>30 credits</li>
              <li>Analysis, Proposal, Ping-Pong</li>
            </ul>
            <button className="w-full bg-teal text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors">
              Get started
            </button>
          </div>

          {/* Pro */}
          <div className="border-2 border-teal rounded-xl p-5">
            <h3 className="text-lg font-bold text-text mb-1">Pro</h3>
            <p className="text-2xl font-bold text-teal mb-3">
              $30<span className="text-sm font-normal text-text-light">/mo</span>
            </p>
            <ul className="space-y-1.5 text-sm text-text-light mb-4">
              <li>150 credits</li>
              <li>All 10 modes + guardrails</li>
            </ul>
            <button className="w-full bg-teal text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors">
              Get started
            </button>
          </div>
        </div>

        <p className="text-xs text-text-light text-center">
          Not ready yet?{' '}
          <button className="text-teal hover:text-teal-dark font-medium">
            Top up credits
          </button>
          {' '} — $0.20 each, minimum 10
        </p>
      </div>
    </div>
  );
}

// ─── Guardrails Heuristics ──────────────────────────────────────────────

function calculateDisagreement(responses: FightResponse[]): string {
  const lengths = responses.map((r) => r.response.length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.abs(l - avgLen), 0) / lengths.length;
  const score = Math.min(100, Math.round((variance / avgLen) * 100));
  if (score < 20) return 'Low — models broadly agree';
  if (score < 50) return 'Medium — some divergence';
  return 'High — significant disagreement';
}

function calculateConfidence(responses: FightResponse[]): string {
  const hedgeWords = ['perhaps', 'maybe', 'might', 'could', 'possibly', 'uncertain', 'it depends'];
  const scores = responses.map((r) => {
    const lower = r.response.toLowerCase();
    return hedgeWords.filter((w) => lower.includes(w)).length;
  });
  const maxHedge = Math.max(...scores);
  const minHedge = Math.min(...scores);
  const diff = maxHedge - minHedge;
  if (diff <= 1) return 'Low — similar confidence levels';
  if (diff <= 3) return 'Medium — some confidence mismatch';
  return 'High — significant confidence gap';
}
