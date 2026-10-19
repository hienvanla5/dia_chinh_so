'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gold';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  neutral: {
    container: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
  primary: {
    container: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-600',
  },
  success: {
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  warning: {
    container: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  danger: {
    container: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  info: {
    container: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  gold: {
    container: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    dot: 'bg-yellow-500',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px] font-semibold gap-1 rounded',
  md: 'px-2.5 py-0.5 text-xs font-semibold gap-1.5 rounded-full',
  lg: 'px-3 py-1 text-xs font-bold gap-2 rounded-full',
};

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  icon,
  children,
  ...props
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center border font-medium transition-colors select-none whitespace-nowrap',
        styles.container,
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                styles.dot,
              )}
            />
          )}
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', styles.dot)} />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
