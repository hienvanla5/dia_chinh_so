'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  UserRole,
  SessionStatus,
  SensitiveOperationType,
  UserSession,
  SecurityViolationAlert,
} from '@diachinhso/shared';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Clock,
  Laptop,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileSignature,
  Compass,
  Database,
  Trash2,
  LogOut,
  Search,
} from 'lucide-react';

// Dữ liệu phiên làm việc mẫu
const INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'SES-HN-ADMIN-001',
    userId: 'USR-ADMIN-001',
    username: 'admin.hanoi@diachinh.gov.vn',
    fullName: 'Nguyễn Văn An',
    role: UserRole.ADMIN,
    deviceInfo: 'Chrome 122 on Windows 11 (Máy trạm công vụ VP ĐKĐĐ)',
    ipAddress: '10.12.34.56',
    isTrustedIp: true,
    status: SessionStatus.ACTIVE,
    createdAt: '2026-10-22 16:30',
    lastActiveAt: '2026-10-22 17:05',
    expiresAt: '2026-10-22 17:20', // Còn 15 phút
    inactivityTimeoutSeconds: 900,
  },
  {
    id: 'SES-HN-REGISTRAR-002',
    userId: 'USR-REGISTRAR-002',
    username: 'tranmai.vpdkdd@diachinh.gov.vn',
    fullName: 'Trần Thị Mai',
    role: UserRole.LAND_REGISTRAR,
    deviceInfo: 'Edge 121 on Windows 10 (Máy trạm phòng ĐK&CGCN)',
    ipAddress: '10.12.34.58',
    isTrustedIp: true,
    status: SessionStatus.LOCKED, // Đã tự động khóa màn hình sau 15 phút
    createdAt: '2026-10-22 16:00',
    lastActiveAt: '2026-10-22 16:44',
    expiresAt: '2026-10-22 16:59',
    inactivityTimeoutSeconds: 900,
  },
  {
    id: 'SES-SUSPICIOUS-003',
    userId: 'USR-OFFICER-003',
    username: 'lehoangnam@diachinh.gov.vn',
    fullName: 'Lê Hoàng Nam',
    role: UserRole.COMMUNE_OFFICER,
    deviceInfo: 'Safari on iPhone (Truy cập ngoài mạng công vụ)',
    ipAddress: '198.51.100.99', // IP lạ
    isTrustedIp: false,
    status: SessionStatus.SUSPENDED_SECURITY, // Tạm khóa theo quy tắc an toàn thông tin
    createdAt: '2026-10-22 16:50',
    lastActiveAt: '2026-10-22 16:55',
    expiresAt: '2026-10-22 16:55',
    inactivityTimeoutSeconds: 900,
  },
];

// Danh sách cảnh báo an ninh mẫu
const INITIAL_ALERTS: SecurityViolationAlert[] = [
  {
    id: 'ALT-2026-001',
    sessionId: 'SES-SUSPICIOUS-003',
    username: 'lehoangnam@diachinh.gov.vn',
    ipAddress: '198.51.100.99',
    violationType: 'IP_NOT_IN_WHITELIST',
    description: 'Phát hiện đăng nhập tài khoản công chức từ địa chỉ IP ngoài mạng công vụ. Kích hoạt tạm khóa phiên bảo vệ hệ thống.',
    timestamp: '2026-10-22 16:55:12',
    auditHash: 'a7b3c2d1e0f98472918471928374619283746192837461928374619283746192',
  },
];

export default function SessionSecurityPage() {
  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS);
  const [alerts, setAlerts] = useState<SecurityViolationAlert[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<'sessions' | 'stepup' | 'alerts'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal mở khóa màn hình
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockSessionId, setUnlockSessionId] = useState<string | null>(null);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockFailedCount, setUnlockFailedCount] = useState(0);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Thao tác nhạy cảm & Step-Up 2FA Challenge state
  const [selectedOperation, setSelectedOperation] = useState<SensitiveOperationType>(
    SensitiveOperationType.APPROVE_CERTIFICATE,
  );
  const [targetEntityId, setTargetEntityId] = useState('GCN-2026-001245');
  const [is2FaModalOpen, setIs2FaModalOpen] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState('123456');
  const [isVerifying2Fa, setIsVerifying2Fa] = useState(false);
  const [twoFaFailedCount, setTwoFaFailedCount] = useState(0);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);

  // Modal kết quả Step-Up Token thành công
  const [stepUpTokenResult, setStepUpTokenResult] = useState<{
    token: string;
    operation: string;
    expiresAt: string;
    auditHash: string;
  } | null>(null);

  // Xử lý mở modal mở khóa
  const handleOpenUnlockModal = (sessionId: string) => {
    setUnlockSessionId(sessionId);
    setUnlockPin('');
    setUnlockError(null);
    setIsUnlockModalOpen(true);
  };

  // Thực hiện mở khóa màn hình
  const handleExecuteUnlock = () => {
    if (!unlockSessionId) return;

    const session = sessions.find((s) => s.id === unlockSessionId);
    if (!session) return;

    if (session.status === SessionStatus.SUSPENDED_SECURITY) {
      setUnlockError('Phiên làm việc đã bị tạm khóa an ninh thông tin. Vui lòng liên hệ Quản trị viên để mở lại.');
      return;
    }

    if (unlockPin === '123456' || unlockPin === 'admin123') {
      // Mở khóa thành công -> làm mới 15 phút
      setSessions((prev) =>
        prev.map((s) =>
          s.id === unlockSessionId
            ? {
                ...s,
                status: SessionStatus.ACTIVE,
                lastActiveAt: new Date().toLocaleTimeString('vi-VN'),
                expiresAt: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('vi-VN'),
              }
            : s,
        ),
      );
      setIsUnlockModalOpen(false);
      setUnlockFailedCount(0);
    } else {
      const nextFail = unlockFailedCount + 1;
      setUnlockFailedCount(nextFail);

      if (nextFail >= 3) {
        // Tạm khóa theo quy tắc an toàn thông tin
        setSessions((prev) =>
          prev.map((s) => (s.id === unlockSessionId ? { ...s, status: SessionStatus.SUSPENDED_SECURITY } : s)),
        );
        const newAlert: SecurityViolationAlert = {
          id: `ALT-${Date.now()}`,
          sessionId: unlockSessionId,
          username: session.username,
          ipAddress: session.ipAddress,
          violationType: 'FAILED_2FA_ATTEMPTS',
          description: `Tài khoản '${session.username}' bị tạm khóa phiên làm việc do nhập sai mã mở khóa quá 3 lần liên tiếp.`,
          timestamp: new Date().toLocaleString('vi-VN'),
          auditHash: 'f4e2d1c0b9a876543210fedcba9876543210fedcba9876543210fedcba987654',
        };
        setAlerts((prev) => [newAlert, ...prev]);
        setUnlockError('Tài khoản bị tạm khóa do nhập sai mã xác thực quá 3 lần liên tiếp theo quy định an toàn thông tin.');
      } else {
        setUnlockError(`Mã mở khóa không chính xác. Bạn còn ${3 - nextFail} lần thử trước khi phiên bị khóa.`);
      }
    }
  };

  // Khóa màn hình thủ công
  const handleLockScreen = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: SessionStatus.LOCKED } : s)),
    );
  };

  // Chấm dứt phiên làm việc
  const handleTerminateSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: SessionStatus.TERMINATED } : s)),
    );
  };

  // Kích hoạt thử thách 2FA nâng cao
  const handleTrigger2FaChallenge = () => {
    setTwoFaError(null);
    setTwoFaCode('123456');
    setTwoFaFailedCount(0);
    setIs2FaModalOpen(true);
  };

  // Xác thực mã 2FA nâng cao
  const handleVerify2Fa = async () => {
    setIsVerifying2Fa(true);
    setTwoFaError(null);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (twoFaCode === '123456') {
      const now = new Date();
      const expiry = new Date(now.getTime() + 5 * 60 * 1000);
      setStepUpTokenResult({
        token: `STEPUP_TOKEN_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        operation:
          selectedOperation === SensitiveOperationType.APPROVE_CERTIFICATE
            ? 'Ký số phê duyệt cấp Sổ Đỏ Số'
            : selectedOperation === SensitiveOperationType.ALTER_PARCEL_BOUNDARY
            ? 'Hiệu chỉnh tọa độ ranh giới thửa đất'
            : selectedOperation === SensitiveOperationType.BULK_DATA_EXPORT
            ? 'Trích xuất dữ liệu CSDL thửa đất hàng loạt'
            : 'Thu hồi Giấy chứng nhận / Hủy hồ sơ',
        expiresAt: expiry.toLocaleTimeString('vi-VN'),
        auditHash: '3a8f9c1b2d4e6f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708',
      });
      setIs2FaModalOpen(false);
      setIsVerifying2Fa(false);
    } else {
      const nextFail = twoFaFailedCount + 1;
      setTwoFaFailedCount(nextFail);
      setIsVerifying2Fa(false);

      if (nextFail >= 3) {
        setTwoFaError('Phiên làm việc đã bị tạm khóa do xác thực 2FA sai quá 3 lần liên tiếp theo quy định an toàn thông tin.');
        // Khóa phiên admin
        setSessions((prev) =>
          prev.map((s) => (s.id === 'SES-HN-ADMIN-001' ? { ...s, status: SessionStatus.SUSPENDED_SECURITY } : s)),
        );
      } else {
        setTwoFaError(`Mã xác thực 2FA không chính xác. Bạn còn ${3 - nextFail} lần thử.`);
      }
    }
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ipAddress.includes(searchTerm) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Banner tiêu đề trang trang trọng */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading tracking-tight">
          Quản Lý Phiên Làm Việc & Bảo Mật Xác Thực 2FA
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
          Kiểm soát thời gian phiên (tự động khóa sau 15 phút), giám sát an toàn thông tin và yêu cầu xác thực 2 lớp nâng cao cho thao tác nhạy cảm
        </p>
      </div>

      {/* Thẻ thống kê chỉ số bảo mật */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Phiên đang hoạt động</p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-600 font-heading">
                  {sessions.filter((s) => s.status === SessionStatus.ACTIVE).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Laptop className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tạm khóa màn hình (15p)</p>
                <p className="mt-2 text-3xl font-extrabold text-amber-600 font-heading">
                  {sessions.filter((s) => s.status === SessionStatus.LOCKED).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Lock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Khóa an ninh thông tin</p>
                <p className="mt-2 text-3xl font-extrabold text-rose-600 font-heading">
                  {sessions.filter((s) => s.status === SessionStatus.SUSPENDED_SECURITY).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quy chuẩn bảo vệ phiên</p>
                <p className="mt-2 text-base font-extrabold text-primary-900 font-heading flex items-center gap-1.5">
                  <Clock className="h-5 w-5" /> 15 phút (900s)
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-900 flex items-center justify-center">
                <KeyRound className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thanh tab chuyển đổi chức năng */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 pt-1 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Laptop className="h-4 w-4" />
          <span>Giám sát phiên làm việc</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stepup')}
          className={`pb-3 pt-1 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'stepup'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Thử nghiệm xác thực 2FA nâng cao</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 pt-1 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'border-primary-900 text-primary-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Nhật ký cảnh báo an ninh ({alerts.length})</span>
        </button>
      </div>

      {/* TAB 1: GIÁM SÁT PHIÊN LÀM VIỆC */}
      {activeTab === 'sessions' && (
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-extrabold text-slate-950">
                  Danh Sách Phiên Đăng Nhập Cán Bộ
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">
                  Kiểm soát thời gian tồn tại phiên, địa chỉ IP và trạng thái khóa an toàn
                </CardDescription>
              </div>

              <div className="relative min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tài khoản, họ tên, IP..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredSessions.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="Không tìm thấy phiên làm việc phù hợp"
                  description="Không có phiên đăng nhập nào khớp với điều kiện tìm kiếm."
                  action={{
                    label: 'Xóa tìm kiếm',
                    onClick: () => setSearchTerm(''),
                    variant: 'outline',
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <th className="py-3.5 px-4">Cán Bộ & Tài Khoản</th>
                      <th className="py-3.5 px-4">Thiết Bị & Địa Chỉ IP</th>
                      <th className="py-3.5 px-4">Trạng Thái Phiên</th>
                      <th className="py-3.5 px-4">Thời Gian & Hết Hạn</th>
                      <th className="py-3.5 px-4 text-right">Thao Tác Bảo Mật</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredSessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-950 font-heading">{s.fullName}</p>
                          <p className="text-xs text-slate-600 font-mono mt-0.5">{s.username}</p>
                          <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {s.role === UserRole.ADMIN && 'Quản trị viên Hệ thống'}
                            {s.role === UserRole.LAND_REGISTRAR && 'Văn phòng Đăng ký Đất đai'}
                            {s.role === UserRole.COMMUNE_OFFICER && 'Cán bộ Địa chính xã/phường'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-xs text-slate-900 font-medium">{s.deviceInfo}</p>
                          <p className="text-xs text-slate-500 font-mono mt-1 flex items-center gap-1.5">
                            IP: {s.ipAddress}
                            {s.isTrustedIp ? (
                              <Badge variant="success" size="sm">
                                Mạng công vụ
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="sm">
                                Ngoài mạng công vụ
                              </Badge>
                            )}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          {s.status === SessionStatus.ACTIVE && (
                            <Badge variant="success" size="md" dot icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                              Đang hoạt động
                            </Badge>
                          )}
                          {s.status === SessionStatus.LOCKED && (
                            <Badge variant="warning" size="md" dot icon={<Lock className="h-3.5 w-3.5" />}>
                              Đã khóa màn hình (15p)
                            </Badge>
                          )}
                          {s.status === SessionStatus.SUSPENDED_SECURITY && (
                            <Badge variant="danger" size="md" dot pulse icon={<ShieldAlert className="h-3.5 w-3.5" />}>
                              Khóa an ninh thông tin
                            </Badge>
                          )}
                          {s.status === SessionStatus.TERMINATED && (
                            <Badge variant="neutral" size="md">
                              Đã chấm dứt
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-xs text-slate-600">Đăng nhập: {s.createdAt}</p>
                          <p className="text-xs font-semibold text-slate-900 mt-0.5">
                            Hết hạn: <span className="font-mono">{s.expiresAt}</span>
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {s.status === SessionStatus.ACTIVE && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Lock className="h-3.5 w-3.5" />}
                              onClick={() => handleLockScreen(s.id)}
                            >
                              Khóa màn hình
                            </Button>
                          )}

                          {s.status === SessionStatus.LOCKED && (
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Unlock className="h-3.5 w-3.5" />}
                              onClick={() => handleOpenUnlockModal(s.id)}
                            >
                              Mở khóa phiên
                            </Button>
                          )}

                          {s.status !== SessionStatus.TERMINATED && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<LogOut className="h-3.5 w-3.5 text-rose-600" />}
                              onClick={() => handleTerminateSession(s.id)}
                            >
                              Chấm dứt
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: THỬ NGHIỆM XÁC THỰC 2FA NÂNG CAO CHO THAO TÁC NHẠY CẢM */}
      {activeTab === 'stepup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg font-extrabold text-slate-950">
                Thực Hiện Thao Tác Nghiệp Vụ Nhạy Cảm
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Theo tiêu chuẩn an toàn thông tin, các thao tác nhạy cảm bắt buộc phải trải qua bước xác thực 2 lớp (Step-Up 2FA) trước khi hệ thống chấp thuận
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Chọn Loại Thao Tác Nhạy Cảm Cần Thực Hiện:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedOperation(SensitiveOperationType.APPROVE_CERTIFICATE)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      selectedOperation === SensitiveOperationType.APPROVE_CERTIFICATE
                        ? 'border-primary-900 bg-primary-50/40 text-primary-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <FileSignature className="h-5 w-5 text-primary-900 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Ký duyệt cấp Sổ Đỏ Số</p>
                      <p className="text-xs text-slate-500 mt-0.5">Phê duyệt ban hành Giấy chứng nhận quyền sử dụng đất số</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedOperation(SensitiveOperationType.ALTER_PARCEL_BOUNDARY)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      selectedOperation === SensitiveOperationType.ALTER_PARCEL_BOUNDARY
                        ? 'border-primary-900 bg-primary-50/40 text-primary-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <Compass className="h-5 w-5 text-primary-900 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Hiệu chỉnh ranh giới đất</p>
                      <p className="text-xs text-slate-500 mt-0.5">Thay đổi tọa độ đỉnh ranh giới VN-2000 hoặc diện tích thửa</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedOperation(SensitiveOperationType.BULK_DATA_EXPORT)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      selectedOperation === SensitiveOperationType.BULK_DATA_EXPORT
                        ? 'border-primary-900 bg-primary-50/40 text-primary-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <Database className="h-5 w-5 text-primary-900 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Trích xuất CSDL hàng loạt</p>
                      <p className="text-xs text-slate-500 mt-0.5">Xuất khẩu thông tin hồ sơ địa chính vượt định mức thông thường</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedOperation(SensitiveOperationType.REVOKE_DOCUMENT)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      selectedOperation === SensitiveOperationType.REVOKE_DOCUMENT
                        ? 'border-primary-900 bg-primary-50/40 text-primary-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <Trash2 className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Thu hồi Giấy chứng nhận</p>
                      <p className="text-xs text-slate-500 mt-0.5">Thu hồi sổ đỏ hoặc hủy bỏ hồ sơ địa chính do vi phạm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Mã đối tượng mục tiêu tác động:
                </label>
                <input
                  type="text"
                  value={targetEntityId}
                  onChange={(e) => setTargetEntityId(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  onClick={handleTrigger2FaChallenge}
                >
                  Yêu cầu Xác thực 2FA & Thực hiện Thao tác
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cột thông tin Token ủy quyền */}
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-950">
                Ủy Quyền Thao Tác (Step-Up Token)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {stepUpTokenResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs font-extrabold text-emerald-800 uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Ủy quyền thành công (5 phút)
                    </p>
                    <p className="text-xs text-slate-700 mt-2">
                      Thao tác: <span className="font-bold text-slate-900">{stepUpTokenResult.operation}</span>
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Hết hạn vào: <span className="font-mono font-bold text-slate-900">{stepUpTokenResult.expiresAt}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase text-slate-500">Mã Token ủy quyền:</span>
                    <p className="font-mono text-xs p-2 rounded bg-slate-100 text-slate-900 break-all border border-slate-200">
                      {stepUpTokenResult.token}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase text-slate-500">Mã băm kiểm toán SHA-256:</span>
                    <p className="font-mono text-xs p-2 rounded bg-slate-100 text-slate-900 break-all border border-slate-200">
                      {stepUpTokenResult.auditHash}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 space-y-2">
                  <KeyRound className="h-8 w-8 mx-auto text-slate-400 stroke-1" />
                  <p className="text-xs">Chưa có phiên ủy quyền nào đang mở.</p>
                  <p className="text-xs text-slate-400">
                    Vui lòng chọn thao tác nhạy cảm và hoàn tất xác thực 2FA để nhận Step-Up Token.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: NHẬT KÝ CẢNH BÁO AN NINH THÔNG TIN (QTD-22) */}
      {activeTab === 'alerts' && (
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-lg font-extrabold text-slate-950">
              Nhật Ký Cảnh Báo Vi Phạm An Toàn Thông Tin
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Ghi nhận các sự kiện truy cập bất thường từ IP lạ hoặc nhập sai mã xác thực quá ngưỡng quy định
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {alerts.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="Không có sự cố an ninh"
                  description="Hệ thống đang hoạt động an toàn, không ghi nhận vi phạm an ninh thông tin."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {alerts.map((alt) => (
                  <div key={alt.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="font-extrabold text-slate-950 font-heading text-sm">
                          {alt.violationType === 'IP_NOT_IN_WHITELIST' && 'Đăng nhập từ IP ngoài mạng công vụ'}
                          {alt.violationType === 'FAILED_2FA_ATTEMPTS' && 'Nhập sai mã xác thực quá 3 lần liên tiếp'}
                          {alt.violationType === 'RATE_LIMIT_EXCEEDED' && 'Tần suất trích xuất vượt quá 50 thửa/phút'}
                        </p>
                        <span className="text-xs text-slate-500 font-mono">{alt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{alt.description}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 font-mono">
                        <span>Tài khoản: <strong className="text-slate-800">{alt.username}</strong></span>
                        <span>IP: <strong className="text-slate-800">{alt.ipAddress}</strong></span>
                        <span>Mã băm SHA-256: {alt.auditHash.substring(0, 16)}...</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL MỞ KHÓA MÀN HÌNH */}
      {isUnlockModalOpen && (
        <Modal
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
          title="Mở Khóa Màn Hình Làm Việc"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Màn hình làm việc đã được tự động khóa sau 15 phút không tương tác để bảo vệ an toàn thông tin. Vui lòng nhập mã PIN hoặc mã xác thực để tiếp tục.
            </p>

            {unlockError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{unlockError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mã PIN / Mật khẩu công vụ (Mẫu thử nghiệm: 123456):
              </label>
              <input
                type="password"
                value={unlockPin}
                onChange={(e) => setUnlockPin(e.target.value)}
                placeholder="Nhập 6 chữ số..."
                maxLength={6}
                className="w-full px-3 py-2 text-sm font-mono tracking-widest text-center rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsUnlockModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" size="sm" leftIcon={<Unlock className="h-4 w-4" />} onClick={handleExecuteUnlock}>
                Mở khóa phiên
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL THỬ THÁCH XÁC THỰC 2FA NÂNG CAO */}
      {is2FaModalOpen && (
        <Modal
          isOpen={is2FaModalOpen}
          onClose={() => !isVerifying2Fa && setIs2FaModalOpen(false)}
          title="Xác Thực 2 Lớp (Step-Up 2FA Challenge)"
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-primary-50/70 border border-primary-200/80 rounded-xl text-xs text-primary-950 space-y-1">
              <p className="font-bold">Thao tác nhạy cảm yêu cầu xác thực 2FA:</p>
              <p className="text-slate-700">
                Thao tác: <strong className="text-slate-900">{selectedOperation}</strong>
              </p>
              <p className="text-slate-700">
                Thời gian hiệu lực mã: <strong className="text-slate-900">5 phút (300 giây)</strong>
              </p>
            </div>

            {twoFaError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{twoFaError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Nhập mã xác thực TOTP / OTP SMS (Mẫu: 123456):
              </label>
              <input
                type="text"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value)}
                maxLength={6}
                disabled={isVerifying2Fa}
                placeholder="123456"
                className="w-full px-3 py-2 text-base font-mono tracking-widest text-center font-extrabold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" disabled={isVerifying2Fa} onClick={() => setIs2FaModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isVerifying2Fa}
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                onClick={handleVerify2Fa}
              >
                Xác thực 2FA
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
