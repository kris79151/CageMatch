import { useState } from 'react';
import { useAuth } from '../lib/auth';
import PersonaSetup from '../components/PersonaSetup';

export default function Settings() {
  const { cmUser, updateOptIn } = useAuth();
  const [showPersonaEditor, setShowPersonaEditor] = useState(false);

  if (!cmUser) return <div className="text-text-light">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-purple mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Settings
      </h2>

      {/* Tier + Credits */}
      <div className="bg-white rounded-lg border border-border p-5 mb-4">
        <h3 className="text-sm font-semibold text-text mb-3">Subscription</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-light">Current tier: </span>
            <span className="font-medium text-text capitalize">{cmUser.tier}</span>
          </div>
          <div>
            <span className="text-text-light">Credits remaining: </span>
            <span className="font-semibold text-teal">{cmUser.credits_remaining}</span>
            <span className="text-text-light"> / {cmUser.credits_monthly}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {cmUser.tier === 'free' && (
            <button className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors">
              Upgrade to Lite — $10/mo
            </button>
          )}
          {cmUser.tier === 'lite' && (
            <button className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors">
              Upgrade to Pro — $30/mo
            </button>
          )}
          <button className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-border/50 transition-colors">
            Buy credits
          </button>
        </div>
      </div>

      {/* Research Opt-In */}
      <div className="bg-white rounded-lg border border-border p-5 mb-4">
        <h3 className="text-sm font-semibold text-text mb-3">Research</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={cmUser.research_opted_in}
            onChange={(e) => updateOptIn(e.target.checked)}
            className="rounded"
          />
          <div>
            <span className="text-sm text-text">Contribute to structural AI research</span>
            <p className="text-xs text-text-light mt-0.5">
              We analyze the geometry of AI responses, not the content of your prompts.
            </p>
          </div>
        </label>
      </div>

      {/* Persona */}
      <div className="bg-white rounded-lg border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text">Persona</h3>
          <button
            onClick={() => setShowPersonaEditor(true)}
            className="text-sm text-teal hover:text-teal-dark font-medium"
          >
            {cmUser.persona_configured ? 'Edit' : 'Set up'}
          </button>
        </div>
        {cmUser.persona_configured ? (
          <div>
            <div className="text-sm font-medium text-text mb-1">
              {cmUser.persona_label || 'Custom'}
            </div>
            <p className="text-xs text-text-light leading-relaxed">
              {cmUser.persona_context}
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-light">
            No persona configured. Set one up to get sharper, more relevant responses.
          </p>
        )}
      </div>

      {showPersonaEditor && (
        <PersonaSetup onDone={() => setShowPersonaEditor(false)} />
      )}
    </div>
  );
}
