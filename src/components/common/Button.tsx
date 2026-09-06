import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded border focus:outline-none focus:ring-1 focus:ring-cyan-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  const variants = {
    primary:
      'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-sm shadow-cyan-900/30 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-slate-950 dark:font-semibold',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 dark:text-slate-200',
    danger:
      'bg-red-700/80 hover:bg-red-600 text-white border-red-600 shadow-sm shadow-red-950/40 dark:bg-red-600/80 dark:hover:bg-red-500',
    outline:
      'bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600 dark:hover:bg-slate-800/60 dark:text-slate-300',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1 gap-1.5 font-mono',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};