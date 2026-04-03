import { useAuth } from '../lib/auth';

interface Props {
  onDone: (opted: boolean) => void;
}

export default function ResearchOptInModal({ onDone }: Props) {
  const { updateOptIn } = useAuth();

  const handleChoice = async (opted: boolean) => {
    await updateOptIn(opted);
    onDone(opted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg mx-4 p-8">
        <h2 className="text-2xl font-bold text-purple mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          This tool contributes to structural AI research
        </h2>
        <div className="space-y-3 text-sm text-text leading-relaxed">
          <p>
            Your prompts and AI responses are logged. We analyze the structure of how the AIs
            responded — not the content of your plans. We don't read your ideas. We look at the
            geometry.
          </p>
          <p>
            This research is conducted by HTTA Holdings LLC under three provisional USPTO patents.
            No personally identifiable information is tied to the analysis.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => handleChoice(true)}
            className="flex-1 bg-teal text-white py-2.5 px-4 rounded-lg font-medium hover:bg-teal-dark transition-colors"
          >
            I agree
          </button>
          <button
            onClick={() => handleChoice(false)}
            className="flex-1 bg-border text-text py-2.5 px-4 rounded-lg font-medium hover:bg-border/80 transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
