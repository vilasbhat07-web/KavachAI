import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'warning' | 'success' | 'cyan' | 'neutral' | 'purple';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  pulse = false,
  className = '',
}) => {
  const variantStyles = {
    critical: 'bg-red-950/70 text-red-400 border-red-800/60 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800/80',
    warning: 'bg-amber-950/70 text-amber-400 border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80',
    success: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80',
    cyan: 'bg-cyan-950/70 text-cyan-400 border-cyan-800/60 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800/80',
    purple: 'bg-purple-950/70 text-purple-400 border-purple-800/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80',
    neutral: 'bg-slate-800/70 text-slate-300 border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700/80',
  };

  const dotColors = {
    critical: 'bg-red-400',
    warning: 'bg-amber-400',
    success: 'bg-emerald-400',
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    neutral: 'bg-slate-400',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 leading-none font-mono font-medium',
    sm: 'text-xs px-2 py-0.5 font-mono font-medium',
    md: 'text-sm px-2.5 py-1 font-mono font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded border uppercase tracking-wider',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={clsx(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColors[variant]
            )}
          />
          <span
            className={clsx('relative inline-flex rounded-full h-1.5 w-1.5', dotColors[variant])}
          />
        </span>
      )}
      {children}
    </span>
  );
};