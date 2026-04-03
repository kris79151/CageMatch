import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import ResearchOptInModal from './ResearchOptInModal';
import PersonaSetup from './PersonaSetup';
import { useState, useEffect } from 'react';

export default function AppLayout() {
  const { cmUser, signOut, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [showOptIn, setShowOptIn] = useState(false);
  const [showPersona, setShowPersona] = useState(false);

  useEffect(() => {
    if (cmUser && !cmUser.onboarding_completed) {
      setShowOptIn(true);
    }
  }, [cmUser]);

  const handleOptInDone = (_opted: boolean) => {
    setShowOptIn(false);
    if (cmUser && !cmUser.persona_configured) {
      setShowPersona(true);
    } else {
      completeOnboarding();
    }
  };

  const handlePersonaDone = () => {
    setShowPersona(false);
    completeOnboarding();
  };

  const isFree = cmUser?.tier === 'free';
  const freeRuns = cmUser?.free_runs_remaining ?? 0;

  const nav = [
    { to: '/app', label: 'Fight', end: true },
    { to: '/app/ping-pong', label: 'Ping-Pong' },
    { to: '/app/history', label: 'History' },
    { to: '/app/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {showOptIn && <ResearchOptInModal onDone={handleOptInDone} />}
      {showPersona && <PersonaSetup onDone={handlePersonaDone} />}

      <header className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-purple" style={{ fontFamily: 'var(--font-heading)' }}>
              Cage Match
            </h1>
            <nav className="flex gap-1">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal/10 text-teal-dark'
                        : 'text-text-light hover:text-text hover:bg-border/50'
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {cmUser && (
              <span className="text-sm text-text-light">
                {isFree ? (
                  <><span className="font-semibold text-teal">{freeRuns}</span> free run{freeRuns !== 1 ? 's' : ''} remaining</>
                ) : (
                  <><span className="font-semibold text-teal">{cmUser.credits_remaining}</span> credits</>
                )}
              </span>
            )}
            <button
              onClick={() => { signOut(); navigate('/'); }}
              className="text-sm text-text-light hover:text-danger transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
