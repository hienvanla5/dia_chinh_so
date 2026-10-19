'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Bell, UserCheck, Lock } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vnred-500 text-white shadow-md shadow-red-200">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-slate-900">
              ĐỊA CHÍNH <span className="text-vnred-500">SỐ</span>
            </span>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              Luật Đất đai 2024
            </span>
          </Link>
          <p className="text-[11px] font-medium text-slate-500">
            Cơ sở Dữ liệu Thửa đất & Sổ Đỏ Số Thời Gian Thực
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick status pill */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống trực tuyến: VN-2000 PostGIS</span>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <UserCheck className="h-4 w-4" />
          <span>Đăng nhập Định danh</span>
        </Link>
      </div>
    </header>
  );
}
