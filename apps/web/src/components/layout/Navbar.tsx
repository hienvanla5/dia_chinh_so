'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Bell, UserCheck, Lock, Search, Sparkles } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
      {/* Brand Identity: Quốc kỳ & Huy hiệu Địa chính */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vnred-500 to-vnred-700 text-white shadow-md shadow-red-500/20 ring-2 ring-red-100 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-6 w-6 text-gold-500 drop-shadow-xs" />
            {/* Small yellow star accent */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold-500 text-[8px] font-black text-red-700 shadow-xs">
              ★
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-primary-900 transition-colors">
                ĐỊA CHÍNH <span className="text-vnred-500">SỐ</span>
              </span>
              <span className="hidden sm:inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                Luật Đất đai 2024
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-medium text-slate-500 leading-tight">
              Cơ sở Dữ liệu Thửa đất & Sổ Đỏ Số Thời Gian Thực
            </p>
          </div>
        </Link>
      </div>

      {/* Center Search Bar */}
      <div className="hidden lg:flex items-center w-80 xl:w-96">
        <SearchInput
          placeholder="Tra cứu nhanh thửa đất, số tờ, số GCN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          size="sm"
          shortcut="Ctrl + K"
        />
      </div>

      {/* Right Actions & Status */}
      <div className="flex items-center gap-3">
        {/* Real-time System Status Pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[11px]">VN-2000 PostGIS | Khóa 90p</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          aria-label="Thông báo hệ thống"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        {/* Login Button with Citizen Sandbox */}
        <Link href="/login">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserCheck className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Cổng Định danh</span>
            <span className="sm:hidden">Đăng nhập</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
