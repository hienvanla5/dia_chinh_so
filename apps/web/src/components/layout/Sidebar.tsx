'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Map,
  Layers,
  FileText,
  Lock,
  Award,
  FileCheck2,
} from 'lucide-react';
import { NavItem } from './NavItem';

const mainNavigation = [
  {
    href: '/',
    label: 'Tổng quan hệ thống',
    description: 'Chỉ số thời gian thực',
    icon: Layers,
  },
  {
    href: '/map',
    label: 'Bản đồ GIS VN-2000',
    description: 'Ranh giới & Lớp quy hoạch',
    icon: Map,
  },
  {
    href: '/parcels',
    label: 'Dữ liệu Thửa đất',
    description: 'Mã định danh 15 ký tự',
    icon: FileText,
  },
  {
    href: '/locks',
    label: 'Khóa giao dịch công chứng',
    description: 'Redlock 90 phút',
    icon: Lock,
    badge: 'Realtime',
    badgeVariant: 'danger' as const,
  },
  {
    href: '/dossiers',
    label: 'Dịch vụ công biến động',
    description: 'Quy trình liên thông 4 bước',
    icon: FileCheck2,
  },
  {
    href: '/certificates',
    label: 'Sổ Đỏ Số & QR Code',
    description: 'Chữ ký số SHA-256',
    icon: Award,
    badge: 'Mới',
    badgeVariant: 'success' as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        {/* Core Navigation Section */}
        <div className="space-y-1.5">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Danh mục Chức năng
          </p>
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                description={item.description}
                icon={item.icon}
                badge={item.badge}
                badgeVariant={item.badgeVariant}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
