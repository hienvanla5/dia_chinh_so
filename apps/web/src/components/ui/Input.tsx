'use client';

import React, { forwardRef, useId } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onClear?: () => void;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leadingIcon,
      trailingIcon,
      onClear,
      fullWidth = true,
      disabled,
      value,
      id: customId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(error);
    const hasValue = value !== undefined && value !== null && value !== '';

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-slate-700 tracking-tight">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
              {leadingIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            value={value}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined
            }
            className={cn(
              'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 transition-colors',
              'placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              leadingIcon ? 'pl-9' : 'pl-3',
              trailingIcon || (onClear && hasValue) ? 'pr-9' : 'pr-3',
              hasError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-300 hover:border-slate-400 focus:border-blue-600 focus:ring-blue-100',
              disabled && 'bg-slate-100 text-slate-400 cursor-not-allowed hover:border-slate-300',
              className,
            )}
            {...props}
          />

          {onClear && hasValue && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              tabIndex={-1}
              aria-label="Xóa nội dung"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {trailingIcon && (!onClear || !hasValue) && (
            <div className="pointer-events-none absolute right-3 flex items-center text-slate-400">
              {trailingIcon}
            </div>
          )}
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

Input.displayName = 'Input';
