'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, UserCheck, Shield, Stamp, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 shadow-xs">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vnred-500 text-white shadow-sm">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>

          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-primary-900 transition-colors font-heading">
              ĐỊA CHÍNH <span className="text-vnred-500">SỐ</span>
            </span>
            <p className="hidden md:block text-xs font-medium text-slate-500 leading-tight">
              Cơ sở Dữ liệu Thửa đất & Sổ Đỏ Số
            </p>
          </div>
        </Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Link href="/session-security">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LockKeyhole className="h-4 w-4" />}
          >
            <span>Bảo mật Phiên</span>
          </Button>
        </Link>
        <Link href="/digital-signature">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Stamp className="h-4 w-4" />}
          >
            <span>Ký số Phê duyệt</span>
          </Button>
        </Link>
        <Link href="/jurisdiction">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Shield className="h-4 w-4" />}
          >
            <span>Phân quyền Địa giới</span>
          </Button>
        </Link>
        <Link href="/login">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserCheck className="h-4 w-4" />}
          >
            <span>Cổng Định danh</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
