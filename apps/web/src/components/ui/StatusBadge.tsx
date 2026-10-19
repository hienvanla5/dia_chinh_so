'use client';

import React from 'react';
import { ParcelLegalStatus, DossierStatus, UserRole } from '@diachinhso/shared';
import { Badge, type BadgeSize } from './Badge';
import { Lock, CheckCircle2, AlertTriangle, ShieldAlert, Clock, UserCheck, FileCheck, Ban } from 'lucide-react';

export interface ParcelStatusBadgeProps {
  status: ParcelLegalStatus | string;
  size?: BadgeSize;
  className?: string;
}

export function ParcelStatusBadge({ status, size = 'md', className }: ParcelStatusBadgeProps) {
  switch (status) {
    case ParcelLegalStatus.AVAILABLE:
      return (
        <Badge
          variant="success"
          size={size}
          dot
          className={className}
          icon={<CheckCircle2 className="h-3 w-3 text-emerald-600" />}
        >
          Sẵn sàng giao dịch
        </Badge>
      );
    case ParcelLegalStatus.LOCKED:
      return (
        <Badge
          variant="danger"
          size={size}
          dot
          pulse
          className={className}
          icon={<Lock className="h-3 w-3 text-rose-600" />}
        >
          Đang khóa giao dịch (90p)
        </Badge>
      );
    case ParcelLegalStatus.MORTGAGED:
      return (
        <Badge
          variant="warning"
          size={size}
          dot
          className={className}
          icon={<Clock className="h-3 w-3 text-amber-600" />}
        >
          Đang thế chấp ngân hàng
        </Badge>
      );
    case ParcelLegalStatus.DISPUTED:
      return (
        <Badge
          variant="danger"
          size={size}
          dot
          className={className}
          icon={<AlertTriangle className="h-3 w-3 text-rose-600" />}
        >
          Đang tranh chấp
        </Badge>
      );
    case ParcelLegalStatus.FROZEN:
    case ParcelLegalStatus.REVOKED:
      return (
        <Badge
          variant="neutral"
          size={size}
          className={className}
          icon={<ShieldAlert className="h-3 w-3 text-slate-600" />}
        >
          {status === ParcelLegalStatus.FROZEN ? 'Bị phong tỏa' : 'Đã thu hồi'}
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size} className={className}>
          {status}
        </Badge>
      );
  }
}

export interface DossierStatusBadgeProps {
  status: DossierStatus | string;
  size?: BadgeSize;
  className?: string;
}

export function DossierStatusBadge({ status, size = 'md', className }: DossierStatusBadgeProps) {
  switch (status) {
    case DossierStatus.DRAFT:
      return (
        <Badge variant="neutral" size={size} className={className}>
          Bản nháp
        </Badge>
      );
    case DossierStatus.SUBMITTED:
      return (
        <Badge variant="info" size={size} dot className={className}>
          Đã nộp trực tuyến
        </Badge>
      );
    case DossierStatus.COMMUNE_VERIFIED:
      return (
        <Badge variant="primary" size={size} dot className={className}>
          Xã đã xác minh
        </Badge>
      );
    case DossierStatus.APPRAISED:
      return (
        <Badge variant="primary" size={size} dot className={className}>
          VPĐKĐĐ đã thẩm định
        </Badge>
      );
    case DossierStatus.TAX_PENDING:
      return (
        <Badge variant="warning" size={size} dot className={className}>
          Chờ nộp thuế
        </Badge>
      );
    case DossierStatus.TAX_PAID:
      return (
        <Badge variant="success" size={size} dot className={className}>
          Đã nộp thuế
        </Badge>
      );
    case DossierStatus.SIGNED:
      return (
        <Badge variant="success" size={size} dot className={className}>
          Đã ký số Sổ Đỏ Số
        </Badge>
      );
    case DossierStatus.COMPLETED:
      return (
        <Badge variant="success" size={size} dot className={className}>
          Đã trả kết quả
        </Badge>
      );
    case DossierStatus.REJECTED:
      return (
        <Badge variant="danger" size={size} icon={<Ban className="h-3 w-3" />} className={className}>
          Từ chối tiếp nhận
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size} className={className}>
          {status}
        </Badge>
      );
  }
}

export interface RoleBadgeProps {
  role: UserRole | string;
  size?: BadgeSize;
  className?: string;
}

export function RoleBadge({ role, size = 'sm', className }: RoleBadgeProps) {
  switch (role) {
    case UserRole.COMMUNE_OFFICER:
      return (
        <Badge variant="primary" size={size} className={className}>
          Cán bộ Địa chính Xã
        </Badge>
      );
    case UserRole.LAND_REGISTRAR:
      return (
        <Badge variant="primary" size={size} className={className}>
          Cán bộ VPĐKĐĐ
        </Badge>
      );
    case UserRole.NOTARY_BANK:
      return (
        <Badge variant="warning" size={size} className={className}>
          Công chứng / Ngân hàng
        </Badge>
      );
    case UserRole.LAND_USER:
      return (
        <Badge variant="neutral" size={size} className={className}>
          Chủ sử dụng đất
        </Badge>
      );
    case UserRole.INSPECTOR:
      return (
        <Badge variant="gold" size={size} className={className}>
          Thanh tra & Quy hoạch
        </Badge>
      );
    case UserRole.ADMIN:
      return (
        <Badge variant="danger" size={size} className={className}>
          Quản trị Hệ thống
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size} className={className}>
          {role}
        </Badge>
      );
  }
}
