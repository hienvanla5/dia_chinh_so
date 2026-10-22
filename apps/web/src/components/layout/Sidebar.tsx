'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Layers, UserCheck, Shield, Stamp, LockKeyhole, UserX, KeyRound, FileSignature, Building2, ShieldAlert } from 'lucide-react';
import { NavItem } from './NavItem';

const mainNavigation = [
  {
    href: '/',
    label: 'Tổng quan hệ thống',
    description: 'Trang thông tin nền tảng',
    icon: Layers,
  },
  {
    href: '/login',
    label: 'Cổng Định danh Số',
    description: 'Xác thực CCCD & OTP SMS',
    icon: UserCheck,
  },
  {
    href: '/jurisdiction',
    label: 'Phân quyền Địa giới',
    description: 'Mô hình 2 cấp & 34 tỉnh thành',
    icon: Shield,
  },
  {
    href: '/digital-signature',
    label: 'Ký số Phê duyệt',
    description: 'Chứng thư công vụ & SmartCA',
    icon: Stamp,
  },
  {
    href: '/session-security',
    label: 'Bảo mật Phiên & 2FA',
    description: 'Timeout 15p & Xác thực 2 lớp',
    icon: LockKeyhole,
  },
  {
    href: '/officer-lifecycle',
    label: 'Vòng đời Cán bộ',
    description: 'Điều chuyển & Bàn giao hồ sơ',
    icon: UserX,
  },
  {
    href: '/password-policy',
    label: 'Chính sách Mật khẩu',
    description: 'Độ phức tạp & Chống Brute-force',
    icon: KeyRound,
  },
  {
    href: '/delegation',
    label: 'Ủy quyền Ký duyệt',
    description: 'Cấp phó ký thay có thời hạn',
    icon: FileSignature,
  },
  {
    href: '/enterprise',
    label: 'Cổng Doanh nghiệp',
    description: 'Đất đai dự án & Phân quyền',
    icon: Building2,
  },
  {
    href: '/auth-audit',
    label: 'Giám sát & Dị thường',
    description: 'Sổ cái kiểm toán & SOC Alert',
    icon: ShieldAlert,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            Chức năng
          </p>
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                description={item.description}
                icon={item.icon}
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
