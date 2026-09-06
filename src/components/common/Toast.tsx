import React from 'react';
import { useToast, ToastItem } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    info: <Info className="h-4 w-4 text-cyan-400 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
    critical: <AlertOctagon className="h-4 w-4 text-red-400 shrink-0" />,
  };

  const borders = {
    info: 'border-cyan-800 bg-slate-900 text-cyan-100',
    success: 'border-emerald-800 bg-slate-900 text-emerald-100',
    warning: 'border-amber-800 bg-slate-900 text-amber-100',
    critical: 'border-red-800 bg-slate-900 text-red-100 shadow-lg shadow-red-950/50',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast: ToastItem) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all duration-200 ${borders[toast.type]}`}
        >
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold tracking-wide uppercase font-mono">
              {toast.title}
            </div>
            {toast.message && (
              <div className="text-xs text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </div>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};