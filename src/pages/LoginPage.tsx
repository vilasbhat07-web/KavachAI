import React, { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Unable to sign in.');
      return;
    }

    const destination = (location.state as { from?: string } | null)?.from || '/';
    navigate(destination, { replace: true });
  };

  return (
    <main className="login-shell min-h-screen overflow-hidden px-4 py-6 sm:px-8 lg:px-12">
      <div className="login-grid" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center lg:justify-between lg:gap-16">
        <section className="hidden max-w-xl lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="login-brand-mark"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <p className="font-mono text-sm font-bold tracking-[0.25em] text-cyan-300">KAVACHA</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Air-Gapped Industrial AI Copilot</p>
            </div>
          </div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-cyan-400">Private operations intelligence</p>
          <h1 className="max-w-lg text-5xl font-semibold tracking-tight text-white xl:text-6xl">See the signal. Prove the decision.</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">Secure local telemetry, evidence-backed reasoning, and safety validation for the equipment that keeps your plant moving.</p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            <div className="login-stat"><Activity className="h-4 w-4 text-cyan-300" /><span>Live telemetry</span></div>
            <div className="login-stat"><LockKeyhole className="h-4 w-4 text-emerald-300" /><span>Local inference</span></div>
            <div className="login-stat"><WifiOff className="h-4 w-4 text-amber-300" /><span>Air-gapped</span></div>
          </div>
        </section>

        <section className="login-card w-full max-w-md rounded-2xl border p-6 shadow-2xl sm:p-8">
          <div className="mb-8 lg:hidden">
            <p className="font-mono text-lg font-bold tracking-[0.25em] text-cyan-300">KAVACHA</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">Air-Gapped Industrial AI Copilot</p>
          </div>
          <div className="mb-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-400">Operator access</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Sign in to the command center</h2>
            <p className="mt-2 text-xs leading-5 text-slate-400">Authenticate to access plant telemetry, investigations, and local AI tools.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="login-label">Work email</span>
              <input className="login-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="operator@kavacha.ai" autoComplete="email" required />
            </label>
            <label className="block">
              <span className="login-label">Access password</span>
              <span className="relative block">
                <input className="login-input pr-11" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter access password" autoComplete="current-password" required />
                <button type="button" className="login-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Authenticating...' : 'Enter KAVACHA'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-[10px] text-slate-500">LOCAL RUNTIME · SESSION ENCRYPTION ENABLED · NO EXTERNAL MODEL CALLS</p>
        </section>
      </div>
    </main>
  );
};
