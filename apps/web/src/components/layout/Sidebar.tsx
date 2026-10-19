'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  Map,
  Layers,
  FileText,
  Lock,
  Award,
  ShieldCheck,
  Building2,
  FileCheck2,
  Users,
} from 'lucide-react';
import { NavItem } from './NavItem';
import { Badge } from '@/components/ui/Badge';

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
          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Chức năng Cốt lõi
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

        {/* 6 Personas (Đề án 06) Reference */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              6 Vai trò Phân quyền
            </p>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Đề án 06
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-[11px]">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span>Phân quyền RBAC chuẩn:</span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1.5 pl-1">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                <span className="font-semibold text-slate-700">VT-01:</span> Cán bộ Địa chính Xã
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                <span className="font-semibold text-slate-700">VT-02:</span> VP Đăng ký đất đai
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                <span className="font-semibold text-slate-700">VT-03:</span> Người sử dụng đất
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                <span className="font-semibold text-slate-700">VT-04:</span> Công chứng & Ngân hàng
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                <span className="font-semibold text-slate-700">VT-05:</span> Thanh tra & Quy hoạch
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                <span className="font-semibold text-slate-700">VT-06:</span> Quản trị Hệ thống
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 rounded-lg bg-blue-50/60 p-2.5 text-blue-900 border border-blue-100">
          <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
          <div className="text-[10px] leading-tight">
            <span className="font-bold block">Tuân thủ Luật Đất đai 2024</span>
            <span className="text-blue-600/90">Luật số 31/2024/QH15</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
