'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserCheck, ShieldCheck, KeyRound, Building, User, ArrowRight } from 'lucide-react';
import { UserRole } from '@diachinhso/shared';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from '@/components/ui';

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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-vnred-500 to-vnred-700 text-white shadow-lg shadow-red-500/25 ring-4 ring-red-100">
          <ShieldCheck className="h-8 w-8 text-gold-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cổng Đăng Nhập Định Danh</h1>
        <p className="text-xs text-slate-500">
          Hệ thống Địa Chính Số - Sổ Đỏ Số & CSDL Thửa Đất Thời Gian Thực
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          {/* Tab switch */}
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab('citizen');
                setMessage(null);
              }}
              className={`rounded-lg py-2 transition-all duration-150 ${
                tab === 'citizen'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Chủ đất (CCCD Sandbox)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('officer');
                setMessage(null);
              }}
              className={`rounded-lg py-2 transition-all duration-150 ${
                tab === 'officer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cán bộ nghiệp vụ
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {message && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-medium">
              {message}
            </div>
          )}

          {tab === 'citizen' ? (
            <form onSubmit={handleCitizenSubmit} className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-blue-900 text-xs leading-relaxed">
                <span className="font-bold block text-blue-950">Môi trường Decoupled Sandbox:</span>
                Hệ thống sử dụng cổng định danh số Sandbox mô phỏng CCCD 12 số không phụ thuộc mạng thật C06 VNeID.
              </div>

              <Input
                label="Số CCCD định danh (12 chữ số)"
                required
                maxLength={12}
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                placeholder="001090012345"
              />

              <Input
                label="Họ và tên chủ đất"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
              />

              <Input
                label="Số điện thoại liên kết OTP"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                fullWidth
                className="bg-vnred-500 hover:bg-vnred-600 shadow-md shadow-red-500/25 mt-2"
                leftIcon={<UserCheck className="h-4 w-4" />}
              >
                Đăng nhập với CCCD Sandbox
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOfficerSubmit} className="space-y-4">
              <Select
                label="Vai trò Cán bộ Đề án 06"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                options={[
                  { value: UserRole.COMMUNE_OFFICER, label: 'Cán bộ Địa chính xã/phường (VT-01)' },
                  { value: UserRole.LAND_REGISTRAR, label: 'Văn phòng Đăng ký đất đai (VT-02)' },
                  {
                    value: UserRole.NOTARY_BANK,
                    label: 'Công chứng viên & Tín dụng Ngân hàng (VT-04)',
                  },
                  { value: UserRole.INSPECTOR, label: 'Thanh tra & Quản lý Quy hoạch (VT-05)' },
                  { value: UserRole.ADMIN, label: 'Quản trị viên Hệ thống (VT-06)' },
                ]}
              />

              <Input
                label="Tên tài khoản công vụ"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="canbo_diachinh"
              />

              <Input
                label="Mật khẩu bảo mật"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                fullWidth
                className="mt-2"
                leftIcon={<KeyRound className="h-4 w-4" />}
              >
                Đăng nhập Cán bộ nghiệp vụ
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
