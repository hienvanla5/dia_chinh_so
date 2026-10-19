'use client';

import React, { forwardRef } from 'react';
import { Loader2, Plus, Pencil, Trash2, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'create'
  | 'edit'
  | 'delete'
  | 'danger'
  | 'view'
  | 'search'
  | 'outline'
  | 'ghost';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-900 text-white hover:bg-primary-800 active:bg-primary-950 focus-visible:ring-primary-500 shadow-sm shadow-blue-900/20',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 focus-visible:ring-slate-400',
  create:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500 shadow-sm shadow-emerald-600/25',
  edit:
    'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 focus-visible:ring-amber-500 shadow-sm shadow-amber-600/25',
  delete:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-sm shadow-rose-600/25',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 shadow-sm shadow-rose-600/25',
  view:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus-visible:ring-slate-400 shadow-xs',
  search:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500 shadow-sm shadow-blue-600/25',
  outline:
    'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs gap-1 rounded',
  sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-base font-semibold gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    // Default icons for semantic actions if not explicitly provided
    let defaultLeftIcon = leftIcon;
    if (!defaultLeftIcon && !isLoading) {
      if (variant === 'create') defaultLeftIcon = <Plus className="h-4 w-4 stroke-[2.5]" />;
      else if (variant === 'edit') defaultLeftIcon = <Pencil className="h-3.5 w-3.5" />;
      else if (variant === 'delete' || variant === 'danger') defaultLeftIcon = <Trash2 className="h-3.5 w-3.5" />;
      else if (variant === 'view') defaultLeftIcon = <Eye className="h-3.5 w-3.5" />;
      else if (variant === 'search') defaultLeftIcon = <Search className="h-3.5 w-3.5" />;
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {defaultLeftIcon && <span className="inline-flex shrink-0">{defaultLeftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

/**
 * Nút Tạo mới tiêu chuẩn (Màu xanh lục pháp lý, icon Plus)
 */
export const ButtonCreate = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  ({ children = 'Tạo mới', ...props }, ref) => {
    return (
      <Button ref={ref} variant="create" {...props}>
        {children}
      </Button>
    );
  },
);
ButtonCreate.displayName = 'ButtonCreate';

/**
 * Nút Chỉnh sửa tiêu chuẩn (Màu vàng hổ phách, icon Pencil)
 */
export const ButtonEdit = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  ({ children = 'Chỉnh sửa', ...props }, ref) => {
    return (
      <Button ref={ref} variant="edit" {...props}>
        {children}
      </Button>
    );
  },
);
ButtonEdit.displayName = 'ButtonEdit';

/**
 * Nút Xóa tiêu chuẩn (Màu đỏ cảnh báo, icon Trash2)
 */
export const ButtonDelete = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  ({ children = 'Xóa', ...props }, ref) => {
    return (
      <Button ref={ref} variant="delete" {...props}>
        {children}
      </Button>
    );
  },
);
ButtonDelete.displayName = 'ButtonDelete';

/**
 * Nút Xem chi tiết tiêu chuẩn (Viền xám nhẹ, icon Eye)
 */
export const ButtonView = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  ({ children = 'Chi tiết', ...props }, ref) => {
    return (
      <Button ref={ref} variant="view" {...props}>
        {children}
      </Button>
    );
  },
);
ButtonView.displayName = 'ButtonView';

/**
 * Nút Tìm kiếm tiêu chuẩn (Màu xanh công vụ, icon Search)
 */
export const ButtonSearch = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  ({ children = 'Tìm kiếm', ...props }, ref) => {
    return (
      <Button ref={ref} variant="search" {...props}>
        {children}
      </Button>
    );
  },
);
ButtonSearch.displayName = 'ButtonSearch';
