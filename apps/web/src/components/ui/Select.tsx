'use client';

import React, { forwardRef, useId } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options,
      placeholder,
      fullWidth = true,
      disabled,
      id: customId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(error);

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-slate-700 tracking-tight">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            className={cn(
              'h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-9 text-sm text-slate-900 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              hasError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-blue-100',
              disabled && 'bg-slate-100 text-slate-400 cursor-not-allowed hover:border-slate-300',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute right-3 flex items-center text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {hasError ? (
          <div id={`${id}-error`} className="flex items-center gap-1 text-xs text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p id={`${id}-helper`} className="text-[11px] text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
