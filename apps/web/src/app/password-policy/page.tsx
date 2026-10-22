'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Globe,
  Settings2,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Button,
  ButtonCreate,
  ButtonEdit,
  Input,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  EmptyState,
  Modal,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import {
  PasswordPolicyConfig,
  BlockedIpItem,
  ValidatePasswordResponse,
} from '@diachinhso/shared';

const initialPolicy: PasswordPolicyConfig = {
  minLength: 10,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordExpiryDays: 90,
  preventPasswordReuseCount: 5,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 30,
  trustedIpRanges: ['10.0.0.0/8', '192.168.1.0/24', '172.16.0.0/12'],
  updatedAt: '2026-10-18T08:00:00.000Z',
  updatedBy: 'Quản trị viên Hệ thống',
  auditHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
};

const initialBlockedIps: BlockedIpItem[] = [
  {
    id: 'BLK-IP-001',
    ipAddress: '203.0.113.45',
    failedAttempts: 6,
    targetedUsername: 'nguyen.van.a.dc',
    blockedAt: '22/10/2026 10:15:00',
    expiresAt: '22/10/2026 10:45:00',
    reason: 'Đăng nhập sai quá 5 lần liên tiếp trong 3 phút (Tấn công Brute-force)',
    isPermanent: false,
    auditHash: '8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
  },
  {
    id: 'BLK-IP-002',
    ipAddress: '198.51.100.88',
    failedAttempts: 12,
    targetedUsername: 'admin.hanoi@diachinh.gov.vn',
    blockedAt: '22/10/2026 09:50:00',
    expiresAt: '23/10/2026 09:50:00',
    reason: 'Dò quét tài khoản Quản trị viên từ địa chỉ IP ngoài danh mục cho phép',
    isPermanent: true,
    auditHash: '7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b8c7d6e5f4a3b2c1d0e9f8a7b',
  },
];

interface AuditPolicyItem {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  auditHash: string;
  timestamp: string;
}

const initialAuditLogs: AuditPolicyItem[] = [
  {
    id: 'LOG-POL-001',
    action: 'Cập nhật chính sách mật khẩu',
    performedBy: 'Quản trị viên Hệ thống',
    details: 'Thiết lập độ dài tối thiểu 10 ký tự, thời hạn đổi mật khẩu 90 ngày, khóa IP sau 5 lần sai',
    auditHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    timestamp: '18/10/2026 08:00:00',
  },
];

export default function PasswordPolicyPage() {
  const [policy, setPolicy] = useState<PasswordPolicyConfig>(initialPolicy);
  const [blockedIps, setBlockedIps] = useState<BlockedIpItem[]>(initialBlockedIps);
  const [auditLogs, setAuditLogs] = useState<AuditPolicyItem[]>(initialAuditLogs);

  // Form State
  const [minLength, setMinLength] = useState(policy.minLength);
  const [requireUppercase, setRequireUppercase] = useState(policy.requireUppercase);
  const [requireLowercase, setRequireLowercase] = useState(policy.requireLowercase);
  const [requireNumbers, setRequireNumbers] = useState(policy.requireNumbers);
  const [requireSpecialChars, setRequireSpecialChars] = useState(policy.requireSpecialChars);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(policy.passwordExpiryDays);
  const [preventPasswordReuseCount, setPreventPasswordReuseCount] = useState(policy.preventPasswordReuseCount);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(policy.maxFailedAttempts);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(policy.lockoutDurationMinutes);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Interactive Password Tester State
  const [testPassword, setTestPassword] = useState('');
  const [showTestPassword, setShowTestPassword] = useState(false);
  const [testResult, setTestResult] = useState<ValidatePasswordResponse | null>(null);

  // Modal mở khóa IP
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState<BlockedIpItem | null>(null);
  const [unblockReason, setUnblockReason] = useState('');
  const [isUnblocking, setIsUnblocking] = useState(false);

  // Xử lý kiểm tra mật khẩu trực tiếp
  const handleTestPassword = (pwd: string) => {
    setTestPassword(pwd);
    if (!pwd) {
      setTestResult(null);
      return;
    }

    const errors: string[] = [];
    let score = 0;

    if (pwd.length >= minLength) {
      score += 25;
      if (pwd.length >= 14) score += 10;
    } else {
      errors.push(`Độ dài tối thiểu ${minLength} ký tự (hiện có ${pwd.length})`);
    }

    if (/[A-Z]/.test(pwd)) {
      score += 20;
    } else if (requireUppercase) {
      errors.push('Thiếu ký tự chữ in hoa (A-Z)');
    }

    if (/[a-z]/.test(pwd)) {
      score += 15;
    } else if (requireLowercase) {
      errors.push('Thiếu ký tự chữ in thường (a-z)');
    }

    if (/\d/.test(pwd)) {
      score += 15;
    } else if (requireNumbers) {
      errors.push('Thiếu chữ số (0-9)');
    }

    if (/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\]/.test(pwd)) {
      score += 20;
    } else if (requireSpecialChars) {
      errors.push('Thiếu ký tự đặc biệt (!@#$%^&*...)');
    }

    let strength: 'VERY_WEAK' | 'WEAK' | 'MEDIUM' | 'STRONG' | 'VERY_STRONG';
    if (score >= 90 && errors.length === 0) strength = 'VERY_STRONG';
    else if (score >= 75 && errors.length === 0) strength = 'STRONG';
    else if (score >= 50) strength = 'MEDIUM';
    else if (score >= 30) strength = 'WEAK';
    else strength = 'VERY_WEAK';

    setTestResult({
      valid: errors.length === 0,
      score: Math.min(100, score),
      strength,
      errors,
    });
  };

  // Lưu cấu hình chính sách
  const handleSavePolicy = () => {
    if (minLength < 8 || minLength > 32) {
      alert('Độ dài tối thiểu của mật khẩu phải từ 8 đến 32 ký tự.');
      return;
    }
    if (maxFailedAttempts < 3 || maxFailedAttempts > 10) {
      alert('Số lần đăng nhập sai tối đa phải từ 3 đến 10 lần.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const fakeAuditHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const updated: PasswordPolicyConfig = {
        minLength,
        requireUppercase,
        requireLowercase,
        requireNumbers,
        requireSpecialChars,
        passwordExpiryDays,
        preventPasswordReuseCount,
        maxFailedAttempts,
        lockoutDurationMinutes,
        trustedIpRanges: policy.trustedIpRanges,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Quản trị viên Hệ thống',
        auditHash: fakeAuditHash,
      };

      setPolicy(updated);
      setAuditLogs(prev => [
        {
          id: `LOG-POL-${Date.now()}`,
          action: 'Cập nhật chính sách mật khẩu',
          performedBy: 'Quản trị viên Hệ thống',
          details: `Độ dài tối thiểu: ${minLength}, Thử sai tối đa: ${maxFailedAttempts}, Khóa IP: ${lockoutDurationMinutes} phút`,
          auditHash: fakeAuditHash,
          timestamp: new Date().toLocaleString('vi-VN'),
        },
        ...prev,
      ]);

      setIsSaving(false);
      setSaveSuccessMsg('Chính sách mật khẩu và cấu hình chống brute-force đã được cập nhật thành công trên toàn hệ thống.');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    }, 600);
  };

  // Mở modal mở khóa IP
  const handleOpenUnblockModal = (item: BlockedIpItem) => {
    setSelectedIp(item);
    setUnblockReason('');
    setIsUnblockModalOpen(true);
  };

  // Xác nhận mở khóa IP
  const handleConfirmUnblock = () => {
    if (!selectedIp || !unblockReason) {
      alert('Vui lòng nhập lý do mở khóa địa chỉ IP.');
      return;
    }

    setIsUnblocking(true);

    setTimeout(() => {
      const fakeAuditHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      setBlockedIps(prev => prev.filter(b => b.id !== selectedIp.id));
      setAuditLogs(prev => [
        {
          id: `LOG-POL-${Date.now()}`,
          action: 'Mở khóa địa chỉ IP',
          performedBy: 'Quản trị viên Hệ thống',
          details: `Mở khóa IP ${selectedIp.ipAddress}. Lý do: ${unblockReason}`,
          auditHash: fakeAuditHash,
          timestamp: new Date().toLocaleString('vi-VN'),
        },
        ...prev,
      ]);

      setIsUnblocking(false);
      setIsUnblockModalOpen(false);
      setSaveSuccessMsg(`Đã mở khóa thành công địa chỉ IP ${selectedIp.ipAddress}.`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chính Sách Mật Khẩu & Chống Tấn Công Dò Quét"
        description="Thiết lập tiêu chuẩn an toàn mật khẩu công vụ OWASP ASVS và cơ chế tự động khóa IP ngăn chặn xâm nhập trái phép"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Quản trị hệ thống' },
          { label: 'Chính sách mật khẩu & Chống dò quét' },
        ]}
      />

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-3 text-emerald-900 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-semibold text-sm">{saveSuccessMsg}</p>
        </div>
      )}

      {/* Thẻ thống kê cấu hình */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary-800">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase">Độ dài tối thiểu</p>
              <p className="text-3xl font-extrabold text-slate-950 mt-1">{policy.minLength} ký tự</p>
              <p className="text-xs text-slate-700 mt-1">Đầy đủ 4 nhóm ký tự</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-full">
              <KeyRound className="w-6 h-6 text-slate-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase">Hạn đổi mật khẩu</p>
              <p className="text-3xl font-extrabold text-blue-950 mt-1">{policy.passwordExpiryDays} ngày</p>
              <p className="text-xs text-blue-800 mt-1">Không trùng {policy.preventPasswordReuseCount} lần cũ</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase">Thử sai tối đa</p>
              <p className="text-3xl font-extrabold text-amber-950 mt-1">{policy.maxFailedAttempts} lần</p>
              <p className="text-xs text-amber-800 mt-1">Khóa trong {policy.lockoutDurationMinutes} phút</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-amber-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase">IP đang bị chặn</p>
              <p className="text-3xl font-extrabold text-red-950 mt-1">{blockedIps.length} địa chỉ</p>
              <p className="text-xs text-red-800 mt-1">Tự động phát hiện bất thường</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <ShieldAlert className="w-6 h-6 text-red-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Cấu Hình Chính Sách Mật Khẩu (2 cột) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-slate-700" />
                <div>
                  <CardTitle>Thiết Lập Chính Sách Độ Phức Tạp & Vòng Đời Mật Khẩu</CardTitle>
                  <CardDescription>
                    Áp dụng đồng bộ cho tất cả các tài khoản công vụ khi đăng nhập hoặc cập nhật mật khẩu
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Độ dài tối thiểu của mật khẩu (8 - 32 ký tự)"
                  type="number"
                  min={8}
                  max={32}
                  value={minLength}
                  onChange={e => setMinLength(parseInt(e.target.value) || 8)}
                  helperText="Khuyến nghị tối thiểu từ 10 đến 12 ký tự"
                />
                <Input
                  label="Thời hạn đổi mật khẩu bắt buộc (ngày)"
                  type="number"
                  min={15}
                  max={365}
                  value={passwordExpiryDays}
                  onChange={e => setPasswordExpiryDays(parseInt(e.target.value) || 90)}
                  helperText="Hệ thống sẽ nhắc nhở cán bộ đổi trước 7 ngày"
                />
              </div>

              {/* Ràng buộc nhóm ký tự */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                <p className="text-xs font-bold uppercase text-slate-700">Quy tắc cấu thành ký tự bắt buộc</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 text-sm text-slate-900 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireUppercase}
                      onChange={e => setRequireUppercase(e.target.checked)}
                      className="w-4 h-4 text-primary-800 rounded border-slate-300 focus:ring-primary-700"
                    />
                    <span>Chữ in hoa (A-Z)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-sm text-slate-900 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireLowercase}
                      onChange={e => setRequireLowercase(e.target.checked)}
                      className="w-4 h-4 text-primary-800 rounded border-slate-300 focus:ring-primary-700"
                    />
                    <span>Chữ in thường (a-z)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-sm text-slate-900 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireNumbers}
                      onChange={e => setRequireNumbers(e.target.checked)}
                      className="w-4 h-4 text-primary-800 rounded border-slate-300 focus:ring-primary-700"
                    />
                    <span>Ký tự số (0-9)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-sm text-slate-900 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requireSpecialChars}
                      onChange={e => setRequireSpecialChars(e.target.checked)}
                      className="w-4 h-4 text-primary-800 rounded border-slate-300 focus:ring-primary-700"
                    />
                    <span>Ký tự đặc biệt (!@#$%^&*...)</span>
                  </label>
                </div>
              </div>

              {/* Cấu hình chống Brute-Force */}
              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <p className="text-xs font-bold uppercase text-amber-900">
                    Cơ chế ngăn chặn tấn công dò quét (Brute-Force & Rate Limiting)
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Số lần đăng nhập sai tối đa cho phép"
                    type="number"
                    min={3}
                    max={10}
                    value={maxFailedAttempts}
                    onChange={e => setMaxFailedAttempts(parseInt(e.target.value) || 5)}
                    helperText="Tự động khóa sau số lần nhập sai liên tiếp"
                  />
                  <Input
                    label="Thời gian khóa tài khoản & chặn IP (phút)"
                    type="number"
                    min={5}
                    max={1440}
                    value={lockoutDurationMinutes}
                    onChange={e => setLockoutDurationMinutes(parseInt(e.target.value) || 30)}
                    helperText="Tự động mở khóa sau khi hết thời gian chờ"
                  />
                </div>
                <Input
                  label="Số mật khẩu cũ không được tái sử dụng"
                  type="number"
                  min={1}
                  max={24}
                  value={preventPasswordReuseCount}
                  onChange={e => setPreventPasswordReuseCount(parseInt(e.target.value) || 5)}
                  helperText="Ngăn ngừa cán bộ đặt lại mật khẩu đã sử dụng trước đó"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-slate-50 border-t border-slate-200">
              <div className="text-xs text-slate-700">
                Cập nhật lần cuối: <span className="font-semibold">{new Date(policy.updatedAt).toLocaleDateString('vi-VN')}</span> bởi{' '}
                <span className="font-semibold">{policy.updatedBy}</span>
              </div>
              <Button
                variant="primary"
                onClick={handleSavePolicy}
                isLoading={isSaving}
              >
                Lưu cấu hình chính sách
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Công Cụ Kiểm Tra Độ Mạnh Mật Khẩu (1 cột) */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-slate-700" />
                  <div>
                    <CardTitle>Công Cụ Thử Nghiệm Mật Khẩu</CardTitle>
                    <CardDescription>
                      Đánh giá thời gian thực độ mạnh mật khẩu theo chính sách đang áp dụng
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    label="Nhập mật khẩu thử nghiệm"
                    type={showTestPassword ? 'text' : 'password'}
                    placeholder="Nhập chuỗi mật khẩu cần kiểm tra..."
                    value={testPassword}
                    onChange={e => handleTestPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTestPassword(!showTestPassword)}
                    className="absolute right-3 top-9 text-slate-500 hover:text-slate-800"
                  >
                    {showTestPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {testResult && (
                  <div className="space-y-3 pt-2">
                    {/* Thanh điểm */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span>Điểm an toàn:</span>
                        <span className="font-bold">{testResult.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            testResult.score >= 80
                              ? 'bg-emerald-600'
                              : testResult.score >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${testResult.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Mức độ đánh giá */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg">
                      <span className="text-xs text-slate-700">Đánh giá chung:</span>
                      {testResult.valid ? (
                        <Badge variant="success">Hợp lệ ({testResult.strength})</Badge>
                      ) : (
                        <Badge variant="danger">Chưa đạt chuẩn ({testResult.strength})</Badge>
                      )}
                    </div>

                    {/* Danh sách lỗi nếu có */}
                    {testResult.errors.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1.5 text-xs text-red-900">
                        <p className="font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          Tiêu chí chưa thỏa mãn:
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {testResult.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {testResult.valid && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Mật khẩu đáp ứng đầy đủ tiêu chuẩn an toàn thông tin cấp độ công vụ!</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700">
              Mẹo: Mật khẩu mạnh nên có cụm từ dài, kết hợp cả chữ in hoa, chữ thường, số và ký tự đặc biệt.
            </div>
          </Card>
        </div>
      </div>

      {/* Bảng Danh Sách Địa Chỉ IP Đang Bị Khóa (Blocked IPs) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Danh Sách Địa Chỉ IP Bị Khóa Tự Động (Chống Brute-Force)</CardTitle>
              <CardDescription>
                Các địa chỉ IP vượt quá số lần thử đăng nhập sai hoặc cố gắng dò quét tài khoản công vụ
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Đang làm mới danh sách IP bị chặn')}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Địa chỉ IP</th>
                  <th className="px-4 py-3">Tài khoản nhắm tới</th>
                  <th className="px-4 py-3 text-center">Số lần thử sai</th>
                  <th className="px-4 py-3">Lý do khóa</th>
                  <th className="px-4 py-3">Thời gian hết hạn</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {blockedIps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8">
                      <EmptyState
                        title="Không có địa chỉ IP nào bị khóa"
                        description="Hệ thống đang hoạt động an toàn và không phát hiện dấu hiệu dò quét bất thường"
                      />
                    </td>
                  </tr>
                ) : (
                  blockedIps.map(ip => (
                    <tr key={ip.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-red-700">
                          <Globe className="w-3.5 h-3.5" />
                          {ip.ipAddress}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {ip.targetedUsername}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-900">
                          {ip.failedAttempts} lần
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-800">
                        {ip.reason}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {ip.isPermanent ? (
                          <Badge variant="danger">Vĩnh viễn (Ngoại lai)</Badge>
                        ) : (
                          ip.expiresAt
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenUnblockModal(ip)}
                        >
                          <Unlock className="w-3.5 h-3.5 mr-1 text-slate-700" />
                          Mở khóa IP
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nhật ký kiểm toán thay đổi cấu hình bảo mật */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <div>
              <CardTitle>Nhật Ký Kiểm Toán Thay Đổi Cấu Hình Bảo Mật</CardTitle>
              <CardDescription>
                Theo dõi bất biến mọi thay đổi chính sách bảo mật kèm mã băm SHA-256
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Thời điểm</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Người thực hiện</th>
                  <th className="px-4 py-3">Nội dung chi tiết</th>
                  <th className="px-4 py-3">Mã băm kiểm toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-700 font-medium">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-950">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-800">
                      {log.performedBy}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-800">
                      {log.details}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {log.auditHash.substring(0, 16)}...
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Mở Khóa IP */}
      <Modal
        isOpen={isUnblockModalOpen}
        onClose={() => !isUnblocking && setIsUnblockModalOpen(false)}
        title="Mở Khóa Thủ Công Cho Địa Chỉ IP"
        description="Quản trị viên xác minh nguyên nhân và gỡ bỏ địa chỉ IP khỏi danh sách hạn chế truy cập"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsUnblockModalOpen(false)}
              disabled={isUnblocking}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmUnblock}
              isLoading={isUnblocking}
            >
              Xác nhận mở khóa
            </Button>
          </div>
        }
      >
        {selectedIp && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-xs text-blue-900 space-y-1">
              <p>
                Địa chỉ IP: <strong>{selectedIp.ipAddress}</strong>
              </p>
              <p>
                Tài khoản nhắm tới: <strong>{selectedIp.targetedUsername}</strong>
              </p>
              <p>
                Lý do bị khóa: <strong>{selectedIp.reason}</strong>
              </p>
            </div>

            <Input
              label="Lý do mở khóa địa chỉ IP"
              placeholder="VD: Cán bộ xác nhận quên mật khẩu, đã cấp lại thông tin qua kênh chính thức"
              value={unblockReason}
              onChange={e => setUnblockReason(e.target.value)}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
