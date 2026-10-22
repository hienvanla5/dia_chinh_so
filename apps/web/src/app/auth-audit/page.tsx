'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  RefreshCw,
  Search,
  History,
  Globe,
  Activity,
  ShieldCheck,
  Cpu,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

// Types nội bộ cho giao diện
interface AuditLogView {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  authMethod: string;
  clientIp: string;
  location: string;
  status: 'SUCCESS' | 'FAILED' | 'CHALLENGED' | 'BLOCKED';
  isAnomaly: boolean;
  anomalyType?: string;
  failureReason?: string;
  previousHash: string;
  auditHash: string;
}

interface AlertView {
  id: string;
  timestamp: string;
  detectionType: string;
  detectionTypeName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  targetActorId: string;
  targetActorName: string;
  targetActorRole: string;
  clientIp: string;
  detectedLocation: string;
  details: string;
  recommendedAction: string;
  isAccountLocked: boolean;
  requiresStepUp: boolean;
  auditHash: string;
}

export default function AuthAuditPage() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'chain' | 'simulate'>('alerts');

  // Dữ liệu mẫu danh sách cảnh báo an ninh
  const [alerts, setAlerts] = useState<AlertView[]>([
    {
      id: 'ALT-2026-0003',
      timestamp: '2026-10-22T09:05:45.000Z',
      detectionType: 'IMPOSSIBLE_TRAVEL',
      detectionTypeName: 'Di chuyển bất khả thi',
      severity: 'CRITICAL',
      status: 'NEW',
      targetActorId: 'CB-HN-VPDK-001',
      targetActorName: 'Lê Hoàng Nam',
      targetActorRole: 'Lãnh đạo Văn phòng ĐKĐĐ',
      clientIp: '42.112.50.88',
      detectedLocation: 'Thành phố Hồ Chí Minh, Việt Nam',
      details: 'Đăng nhập từ TP. Hồ Chí Minh chỉ sau 35 phút từ phiên đăng nhập tại Hà Nội (khoảng cách ~1.150 km)',
      recommendedAction: 'Khóa tài khoản khẩn cấp, hủy phiên công vụ hiện tại và thông báo đến Cục An toàn thông tin',
      isAccountLocked: true,
      requiresStepUp: true,
      auditHash: 'e63ab9450a112f4cd918ea4561b0c953a812347bcdf9a0184b42318764fe0911',
    },
    {
      id: 'ALT-2026-0006',
      timestamp: '2026-10-22T10:12:00.000Z',
      detectionType: 'BRUTE_FORCE_BURST',
      detectionTypeName: 'Thử sai dồn dập (Brute-Force)',
      severity: 'HIGH',
      status: 'NEW',
      targetActorId: 'UNKNOWN-SCANNER',
      targetActorName: 'Địa chỉ quét lạ',
      targetActorRole: 'Công dân / Người sử dụng đất',
      clientIp: '198.51.100.222',
      detectedLocation: 'Quốc tế / Proxy, Hoa Kỳ',
      details: 'Tấn công dò quét Brute-Force liên tiếp vượt ngưỡng 5 lần thử sai trong 2 phút',
      recommendedAction: 'Chặn địa chỉ IP tại WAF/Firewall trong 30 phút và khóa tạm thời tài khoản đích',
      isAccountLocked: true,
      requiresStepUp: true,
      auditHash: '39a184bbcd59a0184b42318764fe0911e63ab9450a112f4cd918ea4561b0c953',
    },
    {
      id: 'ALT-2026-0004',
      timestamp: '2026-10-22T01:20:10.000Z',
      detectionType: 'OFF_HOURS_ACCESS',
      detectionTypeName: 'Đăng nhập ngoài giờ công vụ',
      severity: 'MEDIUM',
      status: 'INVESTIGATING',
      targetActorId: 'CB-DB-001',
      targetActorName: 'Phạm Đức Huy',
      targetActorRole: 'Cán bộ Địa chính xã/phường',
      clientIp: '171.244.10.45',
      detectedLocation: 'Thành phố Hà Nội, Việt Nam',
      details: 'Cán bộ đăng nhập vào lúc 01:20 sáng ngoài giờ hành chính quy chuẩn',
      recommendedAction: 'Yêu cầu xác thực 2 lớp qua SmartCA hoặc gửi thông báo cảnh báo đến lãnh đạo đơn vị',
      isAccountLocked: false,
      requiresStepUp: true,
      auditHash: 'a0184b42318764fe0911e63ab9450a112f4cd918ea4561b0c95339a184bbcd59',
    },
  ]);

  // Sổ cái kiểm toán chuỗi băm bất biến
  const [auditLogs, setAuditLogs] = useState<AuditLogView[]>([
    {
      id: 'LOG-2026-0006',
      timestamp: '2026-10-22T10:12:00.000Z',
      actorId: 'UNKNOWN-SCANNER',
      actorName: 'Không xác định',
      actorRole: 'Công dân',
      authMethod: 'Cổng Định danh Số',
      clientIp: '198.51.100.222',
      location: 'Hoa Kỳ (Proxy)',
      status: 'BLOCKED',
      isAnomaly: true,
      anomalyType: 'Thử sai dồn dập',
      failureReason: 'Tấn công dò quét Brute-Force liên tiếp',
      previousHash: '5e3a8901b0f124c89a71234bce091845112f4cd918ea4561b0c953a812347bcd',
      auditHash: '73088d5c60105fe237482910abcdef1234567890abcdef1234567890abcdef12',
    },
    {
      id: 'LOG-2026-0005',
      timestamp: '2026-10-22T09:45:00.000Z',
      actorId: '0101234567',
      actorName: 'Tập đoàn Đầu tư Phát triển Đô thị Thủ Đô',
      actorRole: 'Doanh nghiệp',
      authMethod: 'USB Token Doanh nghiệp',
      clientIp: '118.70.190.5',
      location: 'Thành phố Hà Nội',
      status: 'SUCCESS',
      isAnomaly: false,
      previousHash: '2c89a71234bce091845112f4cd918ea4561b0c953a812347bcd5e3a8901b0f124',
      auditHash: '5e3a8901b0f124c89a71234bce091845112f4cd918ea4561b0c953a812347bcd',
    },
    {
      id: 'LOG-2026-0004',
      timestamp: '2026-10-22T01:20:10.000Z',
      actorId: 'CB-DB-001',
      actorName: 'Phạm Đức Huy',
      actorRole: 'Cán bộ Địa chính',
      authMethod: 'SSO Công vụ',
      clientIp: '171.244.10.45',
      location: 'Thành phố Hà Nội',
      status: 'CHALLENGED',
      isAnomaly: true,
      anomalyType: 'Ngoài giờ công vụ',
      failureReason: 'Đăng nhập ngoài giờ hành chính (01:20 AM)',
      previousHash: '112f4cd918ea4561b0c953a812347bcd5e3a8901b0f1242c89a71234bce091845',
      auditHash: '2c89a71234bce091845112f4cd918ea4561b0c953a812347bcd5e3a8901b0f124',
    },
    {
      id: 'LOG-2026-0003',
      timestamp: '2026-10-22T09:05:45.000Z',
      actorId: 'CB-HN-VPDK-001',
      actorName: 'Lê Hoàng Nam',
      actorRole: 'Văn phòng ĐKĐĐ',
      authMethod: 'SSO Công vụ',
      clientIp: '42.112.50.88',
      location: 'Thành phố Hồ Chí Minh',
      status: 'BLOCKED',
      isAnomaly: true,
      anomalyType: 'Di chuyển bất khả thi',
      failureReason: 'Di chuyển bất khả thi giữa Hà Nội và TP.HCM trong 35 phút',
      previousHash: '918ea4561b0c953a812347bcd5e3a8901b0f1242c89a71234bce091845112f4cd',
      auditHash: '112f4cd918ea4561b0c953a812347bcd5e3a8901b0f1242c89a71234bce091845',
    },
    {
      id: 'LOG-2026-0002',
      timestamp: '2026-10-22T08:30:12.000Z',
      actorId: 'CB-HN-VPDK-001',
      actorName: 'Lê Hoàng Nam',
      actorRole: 'Văn phòng ĐKĐĐ',
      authMethod: 'SSO Công vụ',
      clientIp: '10.15.20.101',
      location: 'Thành phố Hà Nội',
      status: 'SUCCESS',
      isAnomaly: false,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      auditHash: '918ea4561b0c953a812347bcd5e3a8901b0f1242c89a71234bce091845112f4cd',
    },
    {
      id: 'LOG-2026-0001',
      timestamp: '2026-10-22T08:15:30.000Z',
      actorId: '001090123456',
      actorName: 'Nguyễn Văn Hùng',
      actorRole: 'Công dân',
      authMethod: 'Cổng Định danh Số',
      clientIp: '113.190.234.12',
      location: 'Thành phố Hà Nội',
      status: 'SUCCESS',
      isAnomaly: false,
      previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
      auditHash: '0000000000000000000000000000000000000000000000000000000000000000',
    },
  ]);

  // Bộ lọc danh sách cảnh báo
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Trạng thái modal xử lý cảnh báo
  const [selectedAlert, setSelectedAlert] = useState<AlertView | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'RESOLVE_LOCK' | 'DISMISS_FALSE_POSITIVE' | 'REQUIRE_STEP_UP'>('RESOLVE_LOCK');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionSuccessMessage, setResolutionSuccessMessage] = useState<string | null>(null);

  // Trạng thái kiểm tra chuỗi băm
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [chainVerificationResult, setChainVerificationResult] = useState<{
    isValid: boolean;
    totalLogs: number;
    message: string;
  } | null>(null);

  // Trạng thái mô phỏng
  const [simPreset, setSimPreset] = useState<'IMPOSSIBLE_TRAVEL' | 'OFF_HOURS' | 'UNTRUSTED_NET' | 'NORMAL'>('IMPOSSIBLE_TRAVEL');
  const [simActorName, setSimActorName] = useState('Trần Văn Mạnh');
  const [simActorId, setSimActorId] = useState('CB-HN-002');
  const [simLocation, setSimLocation] = useState('Thành phố Hồ Chí Minh');
  const [simIp, setSimIp] = useState('42.112.50.99');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{
    isAnomaly: boolean;
    message: string;
    alertId?: string;
  } | null>(null);

  // Xử lý bộ lọc cảnh báo
  const filteredAlerts = alerts.filter(alert => {
    const matchSeverity = filterSeverity === 'ALL' || alert.severity === filterSeverity;
    const matchSearch =
      alert.targetActorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.targetActorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.clientIp.includes(searchTerm) ||
      alert.detectionTypeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSeverity && matchSearch;
  });

  // Xử lý modal
  const handleOpenResolveModal = (alert: AlertView) => {
    setSelectedAlert(alert);
    setResolutionAction(alert.severity === 'CRITICAL' ? 'RESOLVE_LOCK' : 'REQUIRE_STEP_UP');
    setResolutionNotes('');
    setResolutionSuccessMessage(null);
  };

  const handleExecuteResolution = () => {
    if (!selectedAlert || !resolutionNotes.trim()) return;

    setIsResolving(true);
    setTimeout(() => {
      setAlerts(prev =>
        prev.map(a => {
          if (a.id === selectedAlert.id) {
            const newStatus =
              resolutionAction === 'RESOLVE_LOCK'
                ? 'RESOLVED'
                : resolutionAction === 'DISMISS_FALSE_POSITIVE'
                ? 'FALSE_POSITIVE'
                : 'INVESTIGATING';
            return {
              ...a,
              status: newStatus,
              isAccountLocked: resolutionAction === 'RESOLVE_LOCK' ? true : a.isAccountLocked,
              requiresStepUp: resolutionAction === 'REQUIRE_STEP_UP' ? true : a.requiresStepUp,
            };
          }
          return a;
        }),
      );

      const actionText =
        resolutionAction === 'RESOLVE_LOCK'
          ? 'Đã xác nhận mối đe dọa an ninh, thực hiện khóa tài khoản và hủy phiên đăng nhập.'
          : resolutionAction === 'DISMISS_FALSE_POSITIVE'
          ? 'Đã xác minh cảnh báo là báo động giả và khôi phục trạng thái hoạt động bình thường.'
          : 'Đã gắn cờ yêu cầu thử thách xác thực 2 lớp (Step-Up 2FA) bắt buộc trong lần đăng nhập kế tiếp.';

      setResolutionSuccessMessage(actionText);
      setIsResolving(false);
    }, 600);
  };

  // Xác minh chuỗi băm
  const handleVerifyChain = () => {
    setIsVerifyingChain(true);
    setTimeout(() => {
      setChainVerificationResult({
        isValid: true,
        totalLogs: auditLogs.length,
        message: `Chuỗi băm kiểm toán toàn vẹn 100%. Đã xác minh hợp lệ toàn bộ ${auditLogs.length} khối dữ liệu theo quy định lưu trữ nhật ký bất biến.`,
      });
      setIsVerifyingChain(false);
    }, 800);
  };

  // Chạy mô phỏng dị thường
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      let isAnomaly = false;
      let anomalyTypeName = '';
      let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      let message = '';
      let failureReason = '';
      let status: 'SUCCESS' | 'FAILED' | 'CHALLENGED' | 'BLOCKED' = 'SUCCESS';

      if (simPreset === 'IMPOSSIBLE_TRAVEL') {
        isAnomaly = true;
        anomalyTypeName = 'Di chuyển bất khả thi';
        severity = 'CRITICAL';
        status = 'BLOCKED';
        failureReason = 'Phát hiện đăng nhập từ TP. Hồ Chí Minh chỉ sau ít phút từ lần đăng nhập tại Hà Nội';
        message = 'Phát hiện di chuyển bất khả thi! Hệ thống đã tự động chặn đăng nhập và khóa tài khoản cán bộ.';
      } else if (simPreset === 'OFF_HOURS') {
        isAnomaly = true;
        anomalyTypeName = 'Ngoài giờ công vụ';
        severity = 'MEDIUM';
        status = 'CHALLENGED';
        failureReason = 'Đăng nhập ngoài giờ hành chính (02:30 AM)';
        message = 'Phát hiện truy cập ngoài giờ hành chính! Hệ thống đã kích hoạt thử thách xác thực 2 lớp Step-Up 2FA.';
      } else if (simPreset === 'UNTRUSTED_NET') {
        isAnomaly = true;
        anomalyTypeName = 'Mạng ngoài công vụ';
        severity = 'HIGH';
        status = 'BLOCKED';
        failureReason = 'Truy cập từ dải mạng công cộng ngoài mạng chuyên dùng CPNET';
        message = 'Phát hiện truy cập từ dải IP ngoài mạng công vụ chuyên dùng! Đăng nhập bị chặn lập tức.';
      } else {
        message = 'Đăng nhập hợp lệ trong giờ hành chính từ mạng công vụ chuyên dùng CPNET. Không phát hiện dị thường.';
      }

      const newLogId = `LOG-2026-${String(auditLogs.length + 1).padStart(4, '0')}`;
      const newAlertId = isAnomaly ? `ALT-2026-${String(alerts.length + 1).padStart(4, '0')}` : undefined;
      const prevHash = auditLogs[0].auditHash;
      const newHash = `sha256_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      // Thêm log mới
      const newLog: AuditLogView = {
        id: newLogId,
        timestamp: new Date().toISOString(),
        actorId: simActorId,
        actorName: simActorName,
        actorRole: 'Văn phòng ĐKĐĐ',
        authMethod: 'SSO Công vụ',
        clientIp: simIp,
        location: simLocation,
        status,
        isAnomaly,
        anomalyType: isAnomaly ? anomalyTypeName : undefined,
        failureReason: isAnomaly ? failureReason : undefined,
        previousHash: prevHash,
        auditHash: newHash,
      };

      setAuditLogs(prev => [newLog, ...prev]);

      if (isAnomaly && newAlertId) {
        const newAlert: AlertView = {
          id: newAlertId,
          timestamp: new Date().toISOString(),
          detectionType: simPreset,
          detectionTypeName: anomalyTypeName,
          severity,
          status: 'NEW',
          targetActorId: simActorId,
          targetActorName: simActorName,
          targetActorRole: 'Văn phòng Đăng ký Đất đai',
          clientIp: simIp,
          detectedLocation: simLocation,
          details: failureReason,
          recommendedAction: severity === 'CRITICAL' ? 'Khóa tài khoản khẩn cấp' : 'Yêu cầu xác minh bổ sung',
          isAccountLocked: severity === 'CRITICAL' || severity === 'HIGH',
          requiresStepUp: true,
          auditHash: newHash,
        };
        setAlerts(prev => [newAlert, ...prev]);
      }

      setSimResult({
        isAnomaly,
        message,
        alertId: newAlertId,
      });

      setIsSimulating(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang chuẩn mực công vụ */}
      <PageHeader
        title="Trung tâm Giám sát Xác thực & Cảnh báo Dị thường"
        description="Sổ cái kiểm toán chuỗi băm bất biến và phát hiện đăng nhập bất thường thời gian thực"
      />

      {/* 4 Thẻ chỉ số tổng quan SOC */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary-800 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Tổng sự kiện ghi nhận</span>
            <Activity className="w-5 h-5 text-primary-800" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-950">{auditLogs.length}</span>
            <span className="text-xs text-slate-700">bản ghi liên kết chuỗi</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-600 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Cảnh báo dị thường</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">
              {alerts.filter(a => a.status === 'NEW' || a.status === 'INVESTIGATING').length}
            </span>
            <span className="text-xs text-slate-700">cần thẩm tra xử lý</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Mối đe dọa nghiêm trọng</span>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700">
              {alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'NEW').length}
            </span>
            <span className="text-xs text-slate-700">tự động khóa khẩn cấp</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Toàn vẹn sổ cái kiểm toán</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-emerald-700">100% HỢP LỆ</span>
            <span className="text-xs text-slate-700">chuỗi băm SHA-256</span>
          </div>
        </Card>
      </div>

      {/* Thanh điều hướng 3 Tab */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'border-b-2 border-primary-900 text-primary-950 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Cảnh báo an ninh dị thường ({alerts.filter(a => a.status === 'NEW').length})
        </button>
        <button
          onClick={() => setActiveTab('chain')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'chain'
              ? 'border-b-2 border-primary-900 text-primary-950 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Sổ cái kiểm toán chuỗi băm ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('simulate')}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'simulate'
              ? 'border-b-2 border-primary-900 text-primary-950 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Công cụ kiểm thử dị thường
        </button>
      </div>

      {/* TAB 1: DANH SÁCH CẢNH BÁO AN NINH */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Bộ lọc và tìm kiếm */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex gap-2 w-full sm:w-auto items-center">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Mức độ nghiêm trọng:</span>
              <div className="w-44">
                <Select
                  value={filterSeverity}
                  onChange={e => setFilterSeverity(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Tất cả mức độ' },
                    { value: 'CRITICAL', label: 'Nghiêm trọng (Khẩn cấp)' },
                    { value: 'HIGH', label: 'Mức cao (Cần chặn)' },
                    { value: 'MEDIUM', label: 'Trung bình (Cần 2FA)' },
                    { value: 'LOW', label: 'Mức thấp (Theo dõi)' },
                  ]}
                />
              </div>
            </div>

            <div className="w-full sm:w-72">
              <Input
                placeholder="Tìm theo tên cán bộ, IP, loại..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Bảng danh sách cảnh báo */}
          {filteredAlerts.length === 0 ? (
            <EmptyState
              title="Không có cảnh báo phù hợp"
              description="Hiện tại không có bản ghi cảnh báo an ninh nào khớp với bộ lọc tìm kiếm đã chọn."
            />
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <Card
                  key={alert.id}
                  className={`p-4 border transition-all hover:shadow-md ${
                    alert.severity === 'CRITICAL'
                      ? 'border-rose-300 bg-rose-50/20'
                      : alert.severity === 'HIGH'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">{alert.detectionTypeName}</span>
                        {alert.severity === 'CRITICAL' && (
                          <Badge variant="danger">Khẩn cấp</Badge>
                        )}
                        {alert.severity === 'HIGH' && (
                          <Badge variant="warning">Mức cao</Badge>
                        )}
                        {alert.severity === 'MEDIUM' && (
                          <Badge variant="neutral">Trung bình</Badge>
                        )}
                        {alert.status === 'NEW' && (
                          <Badge variant="danger">Mới phát hiện</Badge>
                        )}
                        {alert.status === 'INVESTIGATING' && (
                          <Badge variant="warning">Đang điều tra</Badge>
                        )}
                        {alert.status === 'RESOLVED' && (
                          <Badge variant="success">Đã xử lý</Badge>
                        )}
                        {alert.status === 'FALSE_POSITIVE' && (
                          <Badge variant="neutral">Báo động giả</Badge>
                        )}
                      </div>

                      <p className="text-sm text-slate-800 font-medium">{alert.details}</p>

                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
                        <span><strong>Tài khoản:</strong> {alert.targetActorName} ({alert.targetActorRole})</span>
                        <span><strong>Địa chỉ IP:</strong> {alert.clientIp}</span>
                        <span><strong>Vị trí:</strong> {alert.detectedLocation}</span>
                        <span><strong>Thời gian:</strong> {new Date(alert.timestamp).toLocaleString('vi-VN')}</span>
                      </div>

                      <div className="text-xs bg-slate-100 p-2 rounded text-slate-800 font-mono flex items-center gap-2 overflow-hidden">
                        <span className="font-bold whitespace-nowrap">Mã băm kiểm toán:</span>
                        <span className="truncate">{alert.auditHash}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <Button
                        variant={alert.status === 'RESOLVED' ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleOpenResolveModal(alert)}
                      >
                        {alert.status === 'RESOLVED' ? 'Xem biên bản xử lý' : 'Xử lý cảnh báo'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SỔ CÁI KIỂM TOÁN CHUỖI BĂM */}
      {activeTab === 'chain' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-lg border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Sổ cái kiểm toán bất biến</h3>
              <p className="text-xs text-slate-600">
                Toàn bộ thao tác đăng nhập và xác thực đều được tính toán mã băm SHA-256 liên kết chuỗi
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyChain}
              isLoading={isVerifyingChain}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Kiểm tra tính toàn vẹn chuỗi
            </Button>
          </div>

          {/* Banner kết quả xác minh chuỗi */}
          {chainVerificationResult && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-900 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Xác minh toàn vẹn thành công!</p>
                <p className="text-xs text-emerald-800 mt-0.5">{chainVerificationResult.message}</p>
              </div>
            </div>
          )}

          {/* Danh sách các khối trong chuỗi */}
          <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
                <tr>
                  <th className="px-3.5 py-3 text-left">Mã khối</th>
                  <th className="px-3.5 py-3 text-left">Thời gian</th>
                  <th className="px-3.5 py-3 text-left">Tài khoản & Vai trò</th>
                  <th className="px-3.5 py-3 text-left">Phương thức</th>
                  <th className="px-3.5 py-3 text-left">IP & Địa điểm</th>
                  <th className="px-3.5 py-3 text-left">Trạng thái</th>
                  <th className="px-3.5 py-3 text-left">Mã băm SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {auditLogs.map(log => (
                  <tr key={log.id} className={log.isAnomaly ? 'bg-amber-50/30' : 'hover:bg-slate-50'}>
                    <td className="px-3.5 py-2.5 font-bold font-mono text-slate-900 whitespace-nowrap">{log.id}</td>
                    <td className="px-3.5 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <div className="text-xs text-slate-600">{log.actorRole}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-xs whitespace-nowrap">{log.authMethod}</td>
                    <td className="px-3.5 py-2.5 text-xs">
                      <div className="font-mono text-slate-900">{log.clientIp}</div>
                      <div className="text-slate-600">{log.location}</div>
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      {log.status === 'SUCCESS' && <Badge variant="success">Thành công</Badge>}
                      {log.status === 'BLOCKED' && <Badge variant="danger">Đã chặn</Badge>}
                      {log.status === 'CHALLENGED' && <Badge variant="warning">Yêu cầu 2FA</Badge>}
                      {log.status === 'FAILED' && <Badge variant="neutral">Thất bại</Badge>}
                      {log.isAnomaly && (
                        <div className="text-[10px] text-amber-700 font-bold mt-0.5">Dị thường: {log.anomalyType}</div>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] max-w-xs truncate text-slate-600" title={log.auditHash}>
                      {log.auditHash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CÔNG CỤ MÔ PHỎNG DỊ THƯỜNG */}
      {activeTab === 'simulate' && (
        <Card className="p-6 bg-white border border-slate-200 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-950">Mô phỏng sự kiện xác thực & Kiểm thử thuật toán phát hiện</h3>
            <p className="text-xs text-slate-700 mt-1">
              Chọn kịch bản kiểm thử mẫu để kích hoạt thuật toán phát hiện dị thường trong môi trường kiểm chuẩn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kịch bản kiểm thử mẫu:</label>
              <Select
                value={simPreset}
                onChange={e => {
                  const val = e.target.value as any;
                  setSimPreset(val);
                  if (val === 'IMPOSSIBLE_TRAVEL') {
                    setSimActorName('Trần Văn Mạnh');
                    setSimActorId('CB-HN-002');
                    setSimLocation('Thành phố Hồ Chí Minh');
                    setSimIp('42.112.50.99');
                  } else if (val === 'OFF_HOURS') {
                    setSimActorName('Nguyễn Văn Tuấn');
                    setSimActorId('CB-COMMUNE-003');
                    setSimLocation('Tỉnh Ninh Bình');
                    setSimIp('10.20.30.40');
                  } else if (val === 'UNTRUSTED_NET') {
                    setSimActorName('Vũ Thị Lan');
                    setSimActorId('CB-COMMUNE-004');
                    setSimLocation('Thành phố Hải Phòng');
                    setSimIp('203.162.0.100');
                  } else {
                    setSimActorName('Lê Văn Cường');
                    setSimActorId('CB-HN-VPDK-002');
                    setSimLocation('Thành phố Hà Nội');
                    setSimIp('10.15.20.102');
                  }
                }}
                options={[
                  { value: 'IMPOSSIBLE_TRAVEL', label: '1. Di chuyển bất khả thi (Hà Nội -> TP.HCM trong 15 phút)' },
                  { value: 'OFF_HOURS', label: '2. Đăng nhập ngoài giờ công vụ (02:30 sáng)' },
                  { value: 'UNTRUSTED_NET', label: '3. Đăng nhập từ mạng ngoài công vụ (IP không thuộc CPNET)' },
                  { value: 'NORMAL', label: '4. Đăng nhập bình thường trong mạng công vụ' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên cán bộ kiểm thử:</label>
              <Input
                value={simActorName}
                onChange={e => setSimActorName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa phương truy cập:</label>
              <Input
                value={simLocation}
                onChange={e => setSimLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ IP truy cập:</label>
              <Input
                value={simIp}
                onChange={e => setSimIp(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleRunSimulation}
              isLoading={isSimulating}
            >
              <Cpu className="w-4 h-4 mr-1.5" />
              Chạy kiểm thử thuật toán phát hiện
            </Button>
          </div>

          {/* Kết quả mô phỏng */}
          {simResult && (
            <div
              className={`p-4 rounded-lg border flex items-start gap-3 ${
                simResult.isAnomaly
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              {simResult.isAnomaly ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {simResult.isAnomaly ? 'Phát hiện hành vi dị thường!' : 'Xác thực an toàn hợp lệ'}
                </p>
                <p className="text-xs leading-relaxed">{simResult.message}</p>
                {simResult.alertId && (
                  <p className="text-xs font-semibold text-rose-800">
                    Mã cảnh báo đã tạo: {simResult.alertId} (Chuyển sang tab Cảnh báo để xem chi tiết)
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Modal Xử lý Cảnh báo an ninh */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title="Xử lý cảnh báo an ninh"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-800">
              <p><strong>Loại dị thường:</strong> {selectedAlert.detectionTypeName}</p>
              <p><strong>Tài khoản mục tiêu:</strong> {selectedAlert.targetActorName} ({selectedAlert.targetActorRole})</p>
              <p><strong>Địa chỉ IP:</strong> {selectedAlert.clientIp} ({selectedAlert.detectedLocation})</p>
              <p><strong>Khuyến nghị an ninh:</strong> {selectedAlert.recommendedAction}</p>
            </div>

            {resolutionSuccessMessage ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-sm flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Xử lý thành công!</p>
                  <p className="text-xs text-emerald-800 mt-0.5">{resolutionSuccessMessage}</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hành động khắc phục:</label>
                  <Select
                    value={resolutionAction}
                    onChange={e => setResolutionAction(e.target.value as any)}
                    options={[
                      { value: 'RESOLVE_LOCK', label: '1. Khóa tài khoản khẩn cấp & Hủy phiên làm việc' },
                      { value: 'REQUIRE_STEP_UP', label: '2. Yêu cầu xác thực 2 lớp (Step-Up 2FA) bắt buộc' },
                      { value: 'DISMISS_FALSE_POSITIVE', label: '3. Bác bỏ báo động giả (False Positive)' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú kiểm toán xử lý (bắt buộc):</label>
                  <textarea
                    rows={3}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary-900 focus:border-primary-900"
                    placeholder="Nhập lý do, căn cứ xác minh và kết quả trao đổi với cán bộ..."
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <Button variant="outline" size="sm" onClick={() => setSelectedAlert(null)}>
                    Đóng
                  </Button>
                  <Button
                    variant={resolutionAction === 'RESOLVE_LOCK' ? 'delete' : 'primary'}
                    size="sm"
                    onClick={handleExecuteResolution}
                    isLoading={isResolving}
                    disabled={!resolutionNotes.trim()}
                  >
                    Xác nhận thực hiện
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
