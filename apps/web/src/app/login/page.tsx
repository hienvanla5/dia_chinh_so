'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserCheck, ShieldCheck, KeyRound, Building, User, ArrowRight } from 'lucide-react';
import { UserRole } from '@diachinhso/shared';

export default function LoginPage() {
  const [tab, setTab] = useState<'citizen' | 'officer'>('citizen');
  const [citizenId, setCitizenId] = useState('001090012345');
  const [fullName, setFullName] = useState('Nguyễn Văn An');
  const [phone, setPhone] = useState('0912345678');

  // Officer form
  const [username, setUsername] = useState('canbo_diachinh');
  const [password, setPassword] = useState('******');
  const [role, setRole] = useState<UserRole>(UserRole.COMMUNE_OFFICER);

  const [message, setMessage] = useState<string | null>(null);

  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Đăng nhập thành công với tư cách Chủ sử dụng đất (Môi trường Sandbox Decoupled IdP)!');
  };

  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(`Đăng nhập thành công với vai trò: ${role}!`);
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-vnred-500 text-white shadow-lg shadow-red-200">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Cổng Đăng Nhập Định Danh</h1>
        <p className="text-xs text-slate-500">
          Hệ thống Địa Chính Số - Sổ Đỏ Số & Cơ Sở Dữ Liệu Thời Gian Thực
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => { setTab('citizen'); setMessage(null); }}
            className={`rounded-lg py-2 transition ${
              tab === 'citizen' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chủ đất (CCCD Sandbox)
          </button>
          <button
            onClick={() => { setTab('officer'); setMessage(null); }}
            className={`rounded-lg py-2 transition ${
              tab === 'officer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cán bộ nghiệp vụ
          </button>
        </div>

        {message && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
            {message}
          </div>
        )}

        {tab === 'citizen' ? (
          <form onSubmit={handleCitizenSubmit} className="space-y-4 text-xs">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900 text-[11px] leading-relaxed">
              <strong>Môi trường phát triển & kiểm thử:</strong> Hệ thống sử dụng cổng định danh số Sandbox (Decoupled IdP) mô phỏng quy trình CCCD 12 số mà không cần kết nối dữ liệu thật C06 VNeID.
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Số CCCD (12 chữ số):</label>
              <input
                type="text"
                required
                maxLength={12}
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Họ và tên chủ đất:</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Số điện thoại liên kết:</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-vnred-500 py-2.5 font-bold text-white hover:bg-vnred-600 transition shadow-sm"
            >
              <UserCheck className="h-4 w-4" />
              Đăng nhập với CCCD Sandbox
            </button>
          </form>
        ) : (
          <form onSubmit={handleOfficerSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700">Vai trò Cán bộ:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value={UserRole.COMMUNE_OFFICER}>Cán bộ Địa chính xã/phường (VT-01)</option>
                <option value={UserRole.LAND_REGISTRAR}>Văn phòng Đăng ký đất đai (VT-02)</option>
                <option value={UserRole.NOTARY_BANK}>Công chứng viên & Tín dụng Ngân hàng (VT-04)</option>
                <option value={UserRole.INSPECTOR}>Thanh tra & Quản lý Quy hoạch (VT-05)</option>
                <option value={UserRole.ADMIN}>Quản trị viên Hệ thống (VT-06)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Tên đăng nhập:</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700">Mật khẩu:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 font-bold text-white hover:bg-slate-800 transition shadow-sm"
            >
              <KeyRound className="h-4 w-4" />
              Đăng nhập Cán bộ nghiệp vụ
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
