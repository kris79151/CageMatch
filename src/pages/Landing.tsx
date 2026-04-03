import { Link } from 'react-router-dom';

const MODES = [
  { name: 'Analysis', desc: 'Sharp, direct breakdown of strengths and weaknesses', credits: 2, lite: true },
  { name: 'Proposal', desc: 'Turn a rough idea into a concrete plan', credits: 2, lite: true },
  { name: 'Debate', desc: 'Three models argue different positions', credits: 3, lite: false },
  { name: 'Red Team', desc: 'Find every way your idea fails', credits: 5, lite: false },
  { name: 'Simulation', desc: 'Run your scenario forward — second and third order effects', credits: 5, lite: false },
  { name: 'Translation', desc: 'Rewrite for a different audience', credits: 2, lite: true },
  { name: 'Stress Test', desc: 'Push every assumption to its limit', credits: 5, lite: false },
  { name: 'Negotiation', desc: 'Map competing interests and find leverage', credits: 4, lite: false },
  { name: 'Writing', desc: 'Three models write, edit, and revise', credits: 3, lite: false },
  { name: 'Pattern', desc: 'Find structural patterns across domains', credits: 3, lite: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <header className="border-b border-border bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple" style={{ fontFamily: 'var(--font-heading)' }}>
            Cage Match
          </h1>
          <Link to="/login" className="text-sm text-teal hover:text-teal-dark font-medium">
            Sign in
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <h2
          className="text-4xl md:text-5xl font-bold text-purple leading-tight mb-6"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Drop your idea in. Multiple AIs fight over it. You walk away with something better.
        </h2>
        <p className="text-lg text-text-light mb-8 max-w-xl mx-auto">
          Six AI models. Ten fight modes. No roles. No theater. Just honest, competing perspectives on your work.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/signup"
            className="bg-teal text-white px-6 py-3 rounded-lg font-medium text-base hover:bg-teal-dark transition-colors"
          >
            Get 3 free runs
          </Link>
          <a
            href="#modes"
            className="bg-white border border-border text-text px-6 py-3 rounded-lg font-medium text-base hover:bg-border/50 transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* Modes Grid */}
      <section id="modes" className="max-w-5xl mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold text-purple mb-8 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
          10 Fight Modes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODES.map((m) => (
            <div
              key={m.name}
              className={`bg-white rounded-lg border p-5 ${
                m.lite ? 'border-teal/30' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-text">{m.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-light">{m.credits} credits</span>
                  {m.lite && (
                    <span className="text-xs bg-teal/10 text-teal-dark px-2 py-0.5 rounded-full font-medium">
                      Lite
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-light">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-purple mb-8 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
            Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border rounded-xl p-6">
              <h4 className="text-lg font-bold text-text mb-1">Lite</h4>
              <p className="text-3xl font-bold text-teal mb-4">
                $10<span className="text-sm font-normal text-text-light">/mo</span>
              </p>
              <ul className="space-y-2 text-sm text-text-light">
                <li>30 credits/month</li>
                <li>Analysis, Proposal, Translation modes</li>
                <li>Ping-Pong sessions</li>
                <li>Share links</li>
              </ul>
            </div>
            <div className="border-2 border-teal rounded-xl p-6">
              <h4 className="text-lg font-bold text-text mb-1">Pro</h4>
              <p className="text-3xl font-bold text-teal mb-4">
                $30<span className="text-sm font-normal text-text-light">/mo</span>
              </p>
              <ul className="space-y-2 text-sm text-text-light">
                <li>150 credits/month</li>
                <li>All 10 fight modes</li>
                <li>Ping-Pong sessions</li>
                <li>Guardrails: confidence + disagreement</li>
                <li>Share links</li>
                <li>Priority support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-text-light">
        HTTA Holdings LLC. All rights reserved.
      </footer>
    </div>
  );
}
