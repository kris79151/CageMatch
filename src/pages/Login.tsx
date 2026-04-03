import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-border shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-purple mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
          Sign in
        </h1>
        {error && (
          <div className="bg-danger/10 text-danger text-sm rounded-lg p-3 mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-teal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-teal"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal text-white py-2.5 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-text-light mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-teal hover:text-teal-dark font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
