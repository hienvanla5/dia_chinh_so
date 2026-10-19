'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

export interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: BadgeVariant;
  isActive?: boolean;
  description?: string;
  onClick?: () => void;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  badgeVariant = 'danger',
  isActive = false,
  description,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary-900 text-white shadow-sm shadow-blue-900/20 font-semibold'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon
          className={cn(
            'h-5 w-5 shrink-0 transition-colors',
            isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900',
          )}
        />
        <div className="truncate">
          <span className="block truncate leading-snug">{label}</span>
          {description && (
            <span
              className={cn(
                'block text-xs font-normal truncate mt-0.5',
                isActive ? 'text-blue-100' : 'text-slate-500',
              )}
            >
              {description}
            </span>
          )}
        </div>
      </div>

      {badge !== undefined && (
        <Badge
          variant={isActive ? 'neutral' : badgeVariant}
          size="sm"
          className={cn('ml-2 shrink-0', isActive && 'bg-white/20 text-white border-transparent')}
        >
          {badge}
        </Badge>
      )}
    </Link>
  );
}
