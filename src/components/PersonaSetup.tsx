import { useState } from 'react';
import { useAuth } from '../lib/auth';

const PERSONA_PRESETS = [
  { label: 'Research / Academic', profession: 'researcher' },
  { label: 'Startup / Business', profession: 'founder' },
  { label: 'Content Creation', profession: 'creator' },
  { label: 'Consulting / Strategy', profession: 'consultant' },
  { label: 'Therapy / Clinical Work', profession: 'therapist' },
  { label: 'Product / Tech', profession: 'pm' },
  { label: 'Education', profession: 'educator' },
  { label: 'Just exploring', profession: 'general' },
];

const TEST_TYPES = ['Ideas', 'Plans', 'Writing', 'Strategies', 'Assumptions', 'All of it'];

interface Props {
  onDone: () => void;
}

export default function PersonaSetup({ onDone }: Props) {
  const { updatePersona } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleTest = (t: string) => {
    setSelectedTests((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSave = async () => {
    if (!selectedPreset) return;
    setSaving(true);

    const preset = PERSONA_PRESETS.find((p) => p.label === selectedPreset);
    const tests = selectedTests.length > 0 ? selectedTests.join(', ') : 'general topics';

    const contextBlock = [
      `The user identifies as: ${selectedPreset}.`,
      description ? `They describe their work as: ${description}.` : '',
      `They primarily want to pressure-test: ${tests}.`,
      `Tailor responses accordingly. Be direct and specific to their context.`,
    ]
      .filter(Boolean)
      .join(' ');

    await updatePersona(preset?.label || selectedPreset, contextBlock);
    setSaving(false);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-purple mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          Quick setup — 30 seconds
        </h2>

        {/* Question 1 */}
        <div className="mb-6">
          <p className="font-medium text-text mb-3">What are you using Cage Match for?</p>
          <div className="grid grid-cols-2 gap-2">
            {PERSONA_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSelectedPreset(p.label)}
                className={`py-3 px-4 rounded-lg text-sm font-medium text-left transition-all border ${
                  selectedPreset === p.label
                    ? 'border-teal bg-teal/10 text-teal-dark'
                    : 'border-border hover:border-teal/50 text-text'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div className="mb-6">
          <p className="font-medium text-text mb-2">Describe your work in one sentence (optional)</p>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. I'm a travel agent building my own business"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-teal"
          />
        </div>

        {/* Question 3 */}
        <div className="mb-6">
          <p className="font-medium text-text mb-3">What do you mostly want to pressure-test?</p>
          <div className="flex flex-wrap gap-2">
            {TEST_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleTest(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedTests.includes(t)
                    ? 'border-teal bg-teal/10 text-teal-dark'
                    : 'border-border hover:border-teal/50 text-text-light'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!selectedPreset || saving}
            className="flex-1 bg-teal text-white py-2.5 px-4 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onDone}
            className="text-sm text-text-light hover:text-text transition-colors px-4"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
