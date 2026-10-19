'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  ShieldCheck,
  KeyRound,
  Building,
  User,
  ArrowRight,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  Layers,
  Award,
} from 'lucide-react';
import { UserRole } from '@diachinhso/shared';
import {
  Button,
  ButtonCreate,
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

  // Citizen OTP 2-step flow states (DCS-01-CN-001)
  const [citizenStep, setCitizenStep] = useState<'input' | 'otp' | 'authenticated'>('input');
  const [citizenId, setCitizenId] = useState('001090012345');
  const [fullName, setFullName] = useState('Nguyễn Văn An');
  const [phone, setPhone] = useState('0912345678');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(300);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [mockOtp, setMockOtp] = useState('123456');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authResult, setAuthResult] = useState<any>(null);

  // Officer form states
  const [username, setUsername] = useState('canbo_diachinh');
  const [password, setPassword] = useState('******');
  const [role, setRole] = useState<UserRole>(UserRole.COMMUNE_OFFICER);
  const [officerSuccess, setOfficerSuccess] = useState(false);

  // Timer countdown for OTP
  useEffect(() => {
    let timer: any;
    if (citizenStep === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [citizenStep, countdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Handle Send OTP (Step 1)
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (citizenId.length !== 12 || !/^\d{12}$/.test(citizenId)) {
      setErrorMessage('Số CCCD phải gồm đúng 12 chữ số theo quy chuẩn quốc gia.');
      return;
    }

    if (!/^(0|\+84)\d{9,10}$/.test(phone)) {
      setErrorMessage('Số điện thoại không hợp lệ (10 chữ số bắt đầu bằng 0).');
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setMockOtp('123456');
      setCountdown(300);
      setCitizenStep('otp');
    }, 600);
  };

  // 2. Handle Verify OTP (Step 2)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      setErrorMessage('Mã xác thực OTP phải gồm đúng 6 chữ số.');
      return;
    }

    if (otpCode !== mockOtp) {
      setErrorMessage('Mã xác thực OTP không chính xác. Trong môi trường Sandbox, vui lòng nhập mã: 123456');
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setAuthResult({
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sandbox_token_dcs01',
        citizenId,
        fullName,
        phone,
        auditHash: 'a8f9c0e2b1d345f67890abcdef1234567890abcdef1234567890abcdef123456',
        loginTime: new Date().toLocaleTimeString('vi-VN') + ' - ' + new Date().toLocaleDateString('vi-VN'),
        wallet: {
          parcelsCount: 1,
          nationalCode: 'HN-BA-DINH.012.0045',
          address: 'Số 18 Phố Liễu Giai, Phường Cống Vị, Quận Ba Đình, Hà Nội',
          certificateNumber: 'CS 123456',
        },
      });
      setCitizenStep('authenticated');
    }, 700);
  };

  // 3. Handle Officer Login
  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerSuccess(true);
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-6">
      {/* Brand & Emblem Header */}
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
                setErrorMessage(null);
              }}
              className={`rounded-lg py-2 transition-all duration-150 ${
                tab === 'citizen'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Chủ đất (CCCD + OTP SMS)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('officer');
                setErrorMessage(null);
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
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {tab === 'citizen' ? (
            citizenStep === 'input' ? (
              // BƯỚC 1: NHẬP CCCD & SỐ ĐIỆN THOẠI
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-blue-900 text-xs leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span>Môi trường Decoupled Sandbox (DCS-01-CN-001):</span>
                  </div>
                  <p className="text-[11px] text-blue-900/90">
                    Sử dụng số CCCD 12 số và số điện thoại mô phỏng mà không phụ thuộc mạng Production C06 VNeID.
                  </p>
                </div>

                <Input
                  label="Số CCCD định danh (12 chữ số)"
                  required
                  maxLength={12}
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  placeholder="001090012345"
                  helperText="Quy chuẩn định danh cá nhân theo Luật Đất đai 2024"
                />

                <Input
                  label="Họ và tên chủ đất"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                />

                <Input
                  label="Số điện thoại nhận mã OTP"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  leadingIcon={<Smartphone className="h-4 w-4" />}
                />

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  fullWidth
                  isLoading={isSendingOtp}
                  loadingText="Đang kết nối Cổng SMS OTP..."
                  className="bg-vnred-500 hover:bg-vnred-600 shadow-md shadow-red-500/25 mt-2"
                  leftIcon={<UserCheck className="h-4 w-4" />}
                >
                  Gửi mã xác thực OTP SMS
                </Button>
              </form>
            ) : citizenStep === 'otp' ? (
              // BƯỚC 2: NHẬP MÃ OTP SMS
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-emerald-950 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Mã OTP đã được gửi đến:
                    </span>
                    <Badge variant="success" size="sm">
                      {phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-[11px]">
                    <span className="text-emerald-800">Mã Sandbox thử nghiệm:</span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(mockOtp)}
                      className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-emerald-300 hover:bg-emerald-100 transition-colors"
                    >
                      Dán nhanh: {mockOtp}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 tracking-tight">
                      Nhập mã OTP gồm 6 chữ số:
                    </label>
                    <span className="font-mono text-xs font-semibold text-rose-600">
                      Hiệu lực: {formatCountdown(countdown)}
                    </span>
                  </div>
                  <Input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="text-center font-mono text-xl tracking-widest font-black"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  fullWidth
                  isLoading={isVerifyingOtp}
                  loadingText="Đang xác thực với CSDL Quốc gia..."
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 mt-2"
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                >
                  Xác thực & Mở Ví Sổ Đỏ Số
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCitizenStep('input');
                      setOtpCode('');
                    }}
                    className="text-slate-500 hover:text-slate-800 font-medium"
                  >
                    ← Đổi số CCCD/SĐT
                  </button>

                  <button
                    type="button"
                    disabled={countdown > 240}
                    onClick={() => {
                      setCountdown(300);
                      setErrorMessage(null);
                      alert('Mã OTP mới đã được gửi lại!');
                    }}
                    className={`flex items-center gap-1 font-semibold ${
                      countdown > 240
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Gửi lại mã
                  </button>
                </div>
              </form>
            ) : (
              // BƯỚC 3: ĐÃ ĐĂNG NHẬP THÀNH CÔNG - HIỂN THỊ VÍ SỔ ĐỎ SỐ (AC-01 & AC-04)
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span className="font-bold text-emerald-950 text-sm">ĐỊNH DANH THÀNH CÔNG</span>
                    </div>
                    <Badge variant="success" dot size="sm">
                      QTD-07 Hợp lệ
                    </Badge>
                  </div>

                  <div className="space-y-1 text-slate-700 border-t border-emerald-200/60 pt-2">
                    <p>Chủ sở hữu: <strong className="text-slate-900">{authResult.fullName}</strong></p>
                    <p>Số CCCD: <span className="font-mono font-bold text-slate-900">{authResult.citizenId}</span></p>
                    <p className="text-[11px] text-slate-500">Thời điểm đăng nhập: {authResult.loginTime}</p>
                  </div>

                  {/* Mã băm kiểm toán SHA-256 (AC-04) */}
                  <div className="pt-2 border-t border-emerald-200/60">
                    <span className="text-[10px] text-slate-500 font-mono block">Mã băm kiểm toán SHA-256 (AC-04):</span>
                    <span className="font-mono text-[10px] text-slate-700 break-all bg-white p-2 rounded-lg border border-slate-200 block mt-1 select-all">
                      {authResult.auditHash}
                    </span>
                  </div>
                </div>

                {/* Tóm tắt Ví Sổ Đỏ Số */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-blue-600" />
                      Ví Sổ Đỏ Số Cá Nhân:
                    </span>
                    <Badge variant="primary" size="sm">
                      {authResult.wallet.parcelsCount} Thửa đất
                    </Badge>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 space-y-1 text-[11px]">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Mã định danh:</span>
                      <span className="font-mono text-blue-700">{authResult.wallet.nationalCode}</span>
                    </div>
                    <p className="text-slate-600 truncate">{authResult.wallet.address}</p>
                    <div className="flex justify-between text-slate-500 pt-1">
                      <span>Số phát hành GCN:</span>
                      <span className="font-mono font-bold text-slate-800">{authResult.wallet.certificateNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Link href="/parcels">
                    <Button variant="primary" size="sm" fullWidth leftIcon={<Layers className="h-4 w-4" />}>
                      Quản lý tài sản trong Ví Sổ Đỏ Số
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setCitizenStep('input');
                      setAuthResult(null);
                      setOtpCode('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1"
                  >
                    Đăng xuất Cổng Định danh
                  </button>
                </div>
              </div>
            )
          ) : (
            // TAB CÁN BỘ NGHIỆP VỤ
            <form onSubmit={handleOfficerSubmit} className="space-y-4">
              {officerSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Đăng nhập Cán bộ thành công với vai trò: {role}!
                </div>
              )}

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
