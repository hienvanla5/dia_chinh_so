'use client';

import React from 'react';
import { Inbox, FileQuestion, SearchX, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'primary' | 'create' | 'secondary' | 'outline';
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const defaultIcon = (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-8 ring-slate-50">
      <FileQuestion className="h-7 w-7 stroke-[1.5]" />
    </div>
  );

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4">{icon || defaultIcon}</div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size="sm"
              onClick={action.onClick}
              leftIcon={action.icon}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Trạng thái trống dành riêng cho kết quả tìm kiếm không tìm thấy
 */
export function SearchEmptyState({
  searchTerm,
  onReset,
}: {
  searchTerm?: string;
  onReset?: () => void;
}) {
  return (
    <EmptyState
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-8 ring-amber-50/50">
          <SearchX className="h-7 w-7 stroke-[1.5]" />
        </div>
      }
      title="Không tìm thấy kết quả phù hợp"
      description={
        searchTerm
          ? `Không tìm thấy bản ghi nào khớp với từ khóa "${searchTerm}". Vui lòng thử tìm kiếm bằng mã định danh 15 ký tự, số tờ/thửa hoặc tên chủ sở hữu khác.`
          : 'Không có dữ liệu phù hợp với bộ lọc hiện tại. Vui lòng thử thay đổi các tiêu chí lọc.'
      }
      action={
        onReset
          ? {
              label: 'Xóa bộ lọc tìm kiếm',
              onClick: onReset,
              variant: 'outline',
            }
          : undefined
      }
    />
  );
}
