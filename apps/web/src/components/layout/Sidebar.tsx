'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Map,
  Layers,
  FileText,
  Lock,
  Award,
  ShieldAlert,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Tổng quan hệ thống', icon: Layers },
  { href: '/map', label: 'Bản đồ số GIS (VN-2000)', icon: Map },
  { href: '/parcels', label: 'Dữ liệu Thửa đất', icon: FileText },
  { href: '/locks', label: 'Khóa giao dịch thời gian thực', icon: Lock, badge: 'Hot' },
  { href: '/dossiers', label: 'Dịch vụ công biến động', icon: FileText },
  { href: '/certificates', label: 'Sổ Đỏ Số & QR Code', icon: Award },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white p-4">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Chức năng cốt lõi
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Vai trò phân quyền
        </p>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800">6 Vai trò Đề án 06:</div>
          <div className="text-[11px] text-slate-500">
            • VT-01: Địa chính xã/phường<br />
            • VT-02: VP Đăng ký đất đai<br />
            • VT-03: Chủ sử dụng đất<br />
            • VT-04: Công chứng & Ngân hàng<br />
            • VT-05: Thanh tra & Quy hoạch<br />
            • VT-06: Quản trị hệ thống
          </div>
        </div>
      </div>
    </aside>
  );
}
