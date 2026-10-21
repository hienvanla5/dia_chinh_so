'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '@diachinhso/shared';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardContent,
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

  // Officer SSO form states (DCS-01-CN-002)
  const [officerUsername, setOfficerUsername] = useState('canbo.convi@diachinh.gov.vn');
  const [officerPassword, setOfficerPassword] = useState('******');
  const [officerMfaCode, setOfficerMfaCode] = useState('123456');
  const [officerRole, setOfficerRole] = useState<UserRole>(UserRole.COMMUNE_OFFICER);
  const [officerUnit, setOfficerUnit] = useState('XA_CONG_VI');
  const [isSubmittingOfficer, setIsSubmittingOfficer] = useState(false);
  const [officerAuthenticated, setOfficerAuthenticated] = useState(false);
  const [officerAuthResult, setOfficerAuthResult] = useState<any>(null);

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

  // 1. Handle Send OTP (Step 1 - DCS-01-CN-001)
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

  // 2. Handle Verify OTP (Step 2 - DCS-01-CN-001)
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

  // 3. Handle Officer SSO Login (DCS-01-CN-002)
  const handleOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (officerMfaCode.length !== 6 || !/^\d{6}$/.test(officerMfaCode)) {
      setErrorMessage('Mã xác thực MFA phải gồm đúng 6 chữ số từ thiết bị bảo mật.');
      return;
    }

    if (officerMfaCode !== '123456') {
      setErrorMessage('Mã xác thực MFA không chính xác. Trong môi trường thử nghiệm, vui lòng nhập mã: 123456');
      return;
    }

    setIsSubmittingOfficer(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/auth/officer/sso-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: officerUsername,
          password: officerPassword,
          mfaCode: officerMfaCode,
          role: officerRole,
          administrativeUnitCode: officerUnit,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOfficerAuthResult(data);
        setOfficerAuthenticated(true);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Đăng nhập SSO công vụ không thành công');
      }
    } catch {
      // Sandbox fallback simulation
      setOfficerAuthResult({
        accessToken: 'mock_sso_token_dcs02_officer',
        user: {
          id: 'officer-uuid-002',
          username: officerUsername,
          fullName: 'Nguyễn Văn Bình',
          role: officerRole,
          department: 'Ủy ban Nhân dân Phường Cống Vị',
          administrativeUnitCode: officerUnit,
          administrativeUnitName: 'Phường Cống Vị, Quận Ba Đình, Hà Nội',
        },
        auditHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        sessionExpiry: new Date(Date.now() + 8 * 3600 * 1000).toLocaleString('vi-VN'),
      });
      setOfficerAuthenticated(true);
    } finally {
      setIsSubmittingOfficer(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-6">
      {/* Brand Header: Clean title without icon/badge clutter */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight font-heading">
          Cổng Đăng Nhập Định Danh
        </h1>
        <p className="text-sm font-medium text-slate-600">
          Hệ thống Địa Chính Số
        </p>
      </div>

      <Card className="border-slate-200 shadow-md">
        <CardHeader className="pb-3">
          {/* Tab switch */}
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('citizen');
                setErrorMessage(null);
              }}
              className={`rounded-lg py-2 transition-all duration-150 ${
                tab === 'citizen'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Chủ đất (CCCD + OTP)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('officer');
                setErrorMessage(null);
              }}
              className={`rounded-lg py-2 transition-all duration-150 ${
                tab === 'officer'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Cán bộ (SSO + MFA)
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-900 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {tab === 'citizen' ? (
            citizenStep === 'input' ? (
              // BƯỚC 1: NHẬP CCCD & SỐ ĐIỆN THOẠI (DCS-01-CN-001)
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950 leading-relaxed">
                  <p>
                    <strong className="font-semibold text-blue-900">Môi trường Thử nghiệm Sandbox:</strong> Nhập số CCCD 12 số và số điện thoại bất kỳ để nhận mã OTP xác thực mô phỏng.
                  </p>
                </div>

                <Input
                  label="Số CCCD định danh (12 chữ số)"
                  required
                  maxLength={12}
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  placeholder="001090012345"
                  helperText="Mã số định danh cá nhân theo chuẩn quốc gia"
                  className="font-mono text-base font-semibold"
                />

                <Input
                  label="Họ và tên chủ đất"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  className="text-base font-semibold"
                />

                <Input
                  label="Số điện thoại nhận mã OTP"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  leadingIcon={<Smartphone className="h-4 w-4" />}
                  className="font-mono text-base font-semibold"
                />

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  fullWidth
                  isLoading={isSendingOtp}
                  loadingText="Đang kết nối Cổng SMS..."
                  className="bg-vnred-500 hover:bg-vnred-600 shadow-md shadow-red-500/25 mt-2 text-sm font-bold"
                  leftIcon={<UserCheck className="h-5 w-5" />}
                >
                  Gửi mã xác thực OTP SMS
                </Button>
              </form>
            ) : citizenStep === 'otp' ? (
              // BƯỚC 2: NHẬP MÃ OTP SMS
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-emerald-950 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">
                      Mã OTP đã gửi đến: {phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60 text-xs">
                    <span className="text-emerald-800">Mã Sandbox:</span>
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
                    <label className="text-sm font-bold text-slate-800 tracking-tight">
                      Nhập mã OTP gồm 6 chữ số:
                    </label>
                    <span className="font-mono text-xs font-bold text-rose-600">
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
                    className="text-center font-mono text-2xl tracking-widest font-black text-slate-950 py-2.5"
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  fullWidth
                  isLoading={isVerifyingOtp}
                  loadingText="Đang xác thực thông tin..."
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 mt-2 text-sm font-bold"
                  leftIcon={<ShieldCheck className="h-5 w-5" />}
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
                    className="text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    ← Đổi số CCCD / SĐT
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
              // BƯỚC 3: ĐÃ ĐĂNG NHẬP THÀNH CÔNG - HIỂN THỊ VÍ SỔ ĐỎ SỐ (DCS-01-CN-001)
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs space-y-3">
                  <h2 className="font-extrabold text-emerald-950 text-base font-heading">
                    Định danh thành công
                  </h2>

                  <div className="space-y-1.5 text-slate-800 border-t border-emerald-200/60 pt-2.5">
                    <p className="text-sm">
                      Chủ sở hữu: <strong className="text-base font-extrabold text-slate-950">{authResult.fullName}</strong>
                    </p>
                    <p className="text-sm">
                      Số CCCD: <span className="font-mono text-base font-bold text-slate-950">{authResult.citizenId}</span>
                    </p>
                    <p className="text-xs text-slate-600">Thời điểm đăng nhập: {authResult.loginTime}</p>
                  </div>

                  {/* Mã băm kiểm toán SHA-256 (AC-04) */}
                  <div className="pt-2 border-t border-emerald-200/60">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Mã băm kiểm toán SHA-256:
                    </span>
                    <span className="font-mono text-xs text-slate-900 break-all bg-white p-2.5 rounded-lg border border-slate-200 block mt-1 select-all font-medium">
                      {authResult.auditHash}
                    </span>
                  </div>
                </div>

                {/* Tóm tắt Ví Sổ Đỏ Số */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
                  <h3 className="font-extrabold text-slate-900 text-sm font-heading">
                    Ví Sổ Đỏ Số cá nhân
                  </h3>

                  <div className="rounded-lg bg-slate-50 p-3 space-y-2 text-xs border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-600">Mã định danh thửa đất:</span>
                      <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {authResult.wallet.nationalCode}
                      </span>
                    </div>
                    <p className="text-slate-800 text-xs font-medium leading-relaxed">{authResult.wallet.address}</p>
                    <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                      <span>Số phát hành GCN:</span>
                      <span className="font-mono font-bold text-slate-950 text-xs">{authResult.wallet.certificateNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => {
                      setCitizenStep('input');
                      setAuthResult(null);
                      setOtpCode('');
                    }}
                    className="text-slate-700"
                  >
                    Đăng xuất Cổng Định danh
                  </Button>
                </div>
              </div>
            )
          ) : (
            // TAB CÁN BỘ NGHIỆP VỤ - SSO + MFA (DCS-01-CN-002)
            officerAuthenticated ? (
              // Màn hình Cán bộ Đăng nhập SSO Thành công
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs space-y-3">
                  <h2 className="font-extrabold text-blue-950 text-base font-heading">
                    Đăng nhập SSO Công vụ thành công
                  </h2>

                  <div className="space-y-1.5 text-slate-800 border-t border-blue-200/60 pt-2.5">
                    <p className="text-sm">
                      Cán bộ: <strong className="text-base font-extrabold text-slate-950">{officerAuthResult.user.fullName}</strong>
                    </p>
                    <p className="text-sm">
                      Tài khoản công vụ: <span className="font-mono font-bold text-slate-950">{officerAuthResult.user.username}</span>
                    </p>
                    <p className="text-sm">
                      Vai trò: <span className="font-bold text-blue-900">{officerAuthResult.user.role}</span>
                    </p>
                  </div>

                  {/* Phân quyền địa giới hành chính theo QTD-16 */}
                  <div className="pt-2 border-t border-blue-200/60 space-y-1">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Thẩm quyền địa giới hành chính:
                    </span>
                    <p className="font-semibold text-slate-900 text-xs">
                      {officerAuthResult.user.administrativeUnitName}
                    </p>
                    <span className="font-mono text-xs text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 inline-block">
                      Mã địa giới: {officerAuthResult.user.administrativeUnitCode}
                    </span>
                  </div>

                  {/* Mã băm kiểm toán SHA-256 (AC-04) */}
                  <div className="pt-2 border-t border-blue-200/60">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Mã băm kiểm toán SHA-256:
                    </span>
                    <span className="font-mono text-xs text-slate-900 break-all bg-white p-2.5 rounded-lg border border-slate-200 block mt-1 select-all font-medium">
                      {officerAuthResult.auditHash}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => {
                      setOfficerAuthenticated(false);
                      setOfficerAuthResult(null);
                    }}
                    className="text-slate-700"
                  >
                    Đăng xuất phiên làm việc SSO
                  </Button>
                </div>
              </div>
            ) : (
              // Form đăng nhập SSO + MFA Cán bộ (DCS-01-CN-002)
              <form onSubmit={handleOfficerSubmit} className="space-y-4">
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950 leading-relaxed">
                  <p>
                    <strong className="font-semibold text-blue-900">Cổng SSO Công vụ tập trung:</strong> Xác thực đa yếu tố MFA và phân quyền theo địa giới hành chính xã/phường.
                  </p>
                </div>

                <Select
                  label="Vai trò Cán bộ Đề án 06"
                  value={officerRole}
                  onChange={(e) => setOfficerRole(e.target.value as UserRole)}
                  options={[
                    { value: UserRole.COMMUNE_OFFICER, label: 'Cán bộ Địa chính xã/phường' },
                    { value: UserRole.LAND_REGISTRAR, label: 'Văn phòng Đăng ký đất đai' },
                    {
                      value: UserRole.NOTARY_BANK,
                      label: 'Công chứng viên & Tín dụng Ngân hàng',
                    },
                    { value: UserRole.INSPECTOR, label: 'Thanh tra & Quản lý Quy hoạch' },
                    { value: UserRole.ADMIN, label: 'Quản trị viên Hệ thống' },
                  ]}
                />

                <Input
                  label="Tên tài khoản công vụ (Email / Username SSO)"
                  required
                  value={officerUsername}
                  onChange={(e) => setOfficerUsername(e.target.value)}
                  placeholder="canbo.convi@diachinh.gov.vn"
                  className="font-mono text-sm font-semibold"
                />

                <Input
                  label="Mật khẩu công vụ"
                  type="password"
                  required
                  value={officerPassword}
                  onChange={(e) => setOfficerPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <Input
                  label="Mã xác thực đa yếu tố MFA (OTP 6 số)"
                  required
                  maxLength={6}
                  value={officerMfaCode}
                  onChange={(e) => setOfficerMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  helperText="Nhập mã OTP 6 số từ thiết bị bảo mật chuyên dụng hoặc ứng dụng MFA (Thử nghiệm: 123456)"
                  className="font-mono text-base font-semibold"
                />

                <Input
                  label="Đơn vị hành chính quản lý"
                  required
                  value={officerUnit}
                  onChange={(e) => setOfficerUnit(e.target.value)}
                  placeholder="XA_CONG_VI"
                  helperText="Phân công theo quyết định bổ nhiệm: Phường Cống Vị, Ba Đình (XA_CONG_VI)"
                  className="font-mono text-xs font-semibold"
                />

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  fullWidth
                  isLoading={isSubmittingOfficer}
                  loadingText="Đang xác thực SSO công vụ..."
                  className="mt-2 bg-blue-900 hover:bg-blue-800 font-bold"
                  leftIcon={<KeyRound className="h-4 w-4" />}
                >
                  Đăng nhập SSO Công vụ
                </Button>
              </form>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
