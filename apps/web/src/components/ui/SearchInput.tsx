'use client';

import React, { forwardRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  shortcut?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      placeholder = 'Tìm kiếm dữ liệu thửa đất, GCN, chủ sở hữu...',
      value,
      onChange,
      onClear,
      isLoading = false,
      size = 'md',
      shortcut,
      ...props
    },
    ref,
  ) => {
    const hasValue = value !== undefined && value !== null && value !== '';

    const sizeClasses = {
      sm: 'h-8 text-xs pl-8 pr-7',
      md: 'h-10 text-sm pl-9 pr-8',
      lg: 'h-12 text-base pl-11 pr-10',
    };

    const iconSizes = {
      sm: 'h-3.5 w-3.5 left-2.5',
      md: 'h-4 w-4 left-3',
      lg: 'h-5 w-5 left-3.5',
    };

    return (
      <div className="relative flex items-center w-full">
        <div className={cn('pointer-events-none absolute text-slate-400 flex items-center', iconSizes[size])}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-slate-300 bg-white text-slate-900 transition-colors',
            'placeholder:text-slate-400',
            'hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100',
            sizeClasses[size],
            hasValue && 'pr-9',
            className,
          )}
          {...props}
        />

        {hasValue && onClear && !isLoading && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {shortcut && !hasValue && (
          <kbd className="hidden sm:inline-flex pointer-events-none absolute right-2.5 h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500">
            {shortcut}
          </kbd>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
