import React from 'react';
import { ArrowLeft, ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <main className="login-shell flex min-h-screen items-center justify-center px-4 py-8">
      <section className="login-card w-full max-w-md rounded-2xl border p-8 text-center shadow-2xl">
        <ShieldX className="mx-auto h-10 w-10 text-red-400" />
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em] text-red-300">Authorization boundary</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Admin access required</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">This control-plane module is restricted to authenticated KAVACHA administrators.</p>
        <button type="button" onClick={() => navigate('/')} className="login-submit mt-7">
          <ArrowLeft className="h-4 w-4" /> Return to dashboard
        </button>
      </section>
    </main>
  );
};
