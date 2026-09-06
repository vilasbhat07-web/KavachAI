import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  badge,
  action,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  noPadding = false,
}) => {
  const hasHeader = title || subtitle || badge || action;

  return (
    <div
      className={clsx(
        'rounded-lg border bg-slate-900/90 text-slate-100 border-slate-800 shadow-sm backdrop-blur-sm dark:bg-slate-900/80 dark:border-slate-800/90',
        className
      )}
    >
      {hasHeader && (
        <div
          className={clsx(
            'flex items-center justify-between border-b border-slate-800/80 px-4 py-3',
            headerClassName
          )}
        >
          <div className="flex items-center gap-2.5">
            <div>
              {title && (
                <div className="font-medium text-slate-200 tracking-tight text-sm flex items-center gap-2">
                  {title}
                  {badge}
                </div>
              )}
              {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={clsx(noPadding ? '' : 'p-4', bodyClassName)}>{children}</div>
    </div>
  );
};