'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  UserX,
  UserCheck,
  ArrowRightLeft,
  FileText,
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Info,
  Scale,
  Users,
} from 'lucide-react';
import {
  Button,
  ButtonCreate,
  ButtonEdit,
  ButtonSearch,
  Input,
  SearchInput,
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
  UserRole,
  OfficerAccountStatus,
  DeactivationReasonType,
  OfficerAccountItem,
} from '@diachinhso/shared';

// Dữ liệu cán bộ công vụ ban đầu
const initialOfficers: OfficerAccountItem[] = [
  {
    id: 'OFF-HN-001',
    officerCode: 'CB-HN-001',
    username: 'nguyen.van.a.dc',
    fullName: 'Nguyễn Văn An',
    email: 'an.nv@hanoi.gov.vn',
    phoneNumber: '0912345678',
    role: UserRole.COMMUNE_OFFICER,
    administrativeUnitCode: 'XA_HANG_BAC',
    administrativeUnitName: 'Xã/Phường Hàng Bạc, TP. Hà Nội',
    department: 'Bộ phận Địa chính - Xây dựng cơ sở',
    status: OfficerAccountStatus.ACTIVE,
    pendingDossierCount: 4,
    lastActiveAt: '12 phút trước',
  },
  {
    id: 'OFF-HN-002',
    officerCode: 'CB-HN-002',
    username: 'tran.thi.b.dc',
    fullName: 'Trần Thị Bích',
    email: 'bich.tt@hanoi.gov.vn',
    phoneNumber: '0912345679',
    role: UserRole.COMMUNE_OFFICER,
    administrativeUnitCode: 'XA_HANG_BAC',
    administrativeUnitName: 'Xã/Phường Hàng Bạc, TP. Hà Nội',
    department: 'Bộ phận Địa chính - Xây dựng cơ sở',
    status: OfficerAccountStatus.ACTIVE,
    pendingDossierCount: 2,
    lastActiveAt: '30 phút trước',
  },
  {
    id: 'OFF-HN-VPDK-001',
    officerCode: 'CB-HN-VPDK-001',
    username: 'le.van.c.dkdd',
    fullName: 'Lê Văn Cường',
    email: 'cuong.lv@hanoi.gov.vn',
    phoneNumber: '0912345680',
    role: UserRole.LAND_REGISTRAR,
    administrativeUnitCode: 'TINH_HN',
    administrativeUnitName: 'Thành phố Hà Nội',
    department: 'Văn phòng Đăng ký Đất đai - Phòng Đăng ký và Cấp GCN',
    status: OfficerAccountStatus.ACTIVE,
    pendingDossierCount: 6,
    lastActiveAt: '5 phút trước',
  },
  {
    id: 'OFF-HN-VPDK-002',
    officerCode: 'CB-HN-VPDK-002',
    username: 'pham.thi.d.dkdd',
    fullName: 'Phạm Thị Dung',
    email: 'dung.pt@hanoi.gov.vn',
    phoneNumber: '0912345681',
    role: UserRole.LAND_REGISTRAR,
    administrativeUnitCode: 'TINH_HN',
    administrativeUnitName: 'Thành phố Hà Nội',
    department: 'Văn phòng Đăng ký Đất đai - Phòng Thẩm định hồ sơ',
    status: OfficerAccountStatus.ACTIVE,
    pendingDossierCount: 1,
    lastActiveAt: '18 phút trước',
  },
  {
    id: 'OFF-HCM-001',
    officerCode: 'CB-HCM-001',
    username: 'hoang.van.e.dc',
    fullName: 'Hoàng Văn Em',
    email: 'em.hv@tphcm.gov.vn',
    phoneNumber: '0987654321',
    role: UserRole.COMMUNE_OFFICER,
    administrativeUnitCode: 'XA_BEN_NGHE',
    administrativeUnitName: 'Xã/Phường Bến Nghé, TP. Hồ Chí Minh',
    department: 'Bộ phận Tiếp nhận và Trả kết quả địa chính',
    status: OfficerAccountStatus.ACTIVE,
    pendingDossierCount: 5,
    lastActiveAt: '45 phút trước',
  },
  {
    id: 'OFF-HCM-002',
    officerCode: 'CB-HCM-002',
    username: 'dang.thi.f.dc',
    fullName: 'Đặng Thị Phương',
    email: 'phuong.dt@tphcm.gov.vn',
    phoneNumber: '0987654322',
    role: UserRole.COMMUNE_OFFICER,
    administrativeUnitCode: 'XA_BEN_NGHE',
    administrativeUnitName: 'Xã/Phường Bến Nghé, TP. Hồ Chí Minh',
    department: 'Bộ phận Địa chính - Xây dựng cơ sở',
    status: OfficerAccountStatus.ACTIVE,
    pendingDossierCount: 3,
    lastActiveAt: '22 phút trước',
  },
  {
    id: 'OFF-NB-001',
    officerCode: 'CB-NB-001',
    username: 'do.van.g.dc',
    fullName: 'Đỗ Văn Giang',
    email: 'giang.dv@ninhbinh.gov.vn',
    phoneNumber: '0933333333',
    role: UserRole.COMMUNE_OFFICER,
    administrativeUnitCode: 'XA_VAN_GIANG',
    administrativeUnitName: 'Xã/Phường Vân Giang, Tỉnh Ninh Bình',
    department: 'Bộ phận Địa chính',
    status: OfficerAccountStatus.TRANSFERRED,
    pendingDossierCount: 0,
    lastActiveAt: '3 ngày trước',
    deactivationInfo: {
      decisionNumber: 'QĐ-2026/112/UBND-NB',
      decisionDate: '2026-10-15',
      issuingAuthority: 'UBND Tỉnh Ninh Bình',
      reasonType: DeactivationReasonType.TRANSFER,
      reasonDetail: 'Điều động cán bộ sang Trung tâm Phát triển Quỹ đất tỉnh',
      deactivatedAt: '2026-10-15T08:30:00.000Z',
      deactivatedByAdminId: 'ADMIN-SYS-001',
      transfereeOfficerId: 'OFF-NB-002',
      transfereeOfficerName: 'Vũ Thị Hoa',
      reassignedDossierCount: 7,
      auditHash: '3ab789d2c145e68f00112233445566778899aabbccddeeff0011223344556677',
    },
  },
];

interface AuditItem {
  id: string;
  officerName: string;
  decisionNumber: string;
  reasonText: string;
  transfereeText: string;
  reassignedCount: number;
  auditHash: string;
  timestamp: string;
}

const initialAuditLogs: AuditItem[] = [
  {
    id: 'LOG-001',
    officerName: 'Đỗ Văn Giang',
    decisionNumber: 'QĐ-2026/112/UBND-NB',
    reasonText: 'Điều chuyển công tác sang đơn vị khác',
    transfereeText: 'Vũ Thị Hoa',
    reassignedCount: 7,
    auditHash: '3ab789d2c145e68f00112233445566778899aabbccddeeff0011223344556677',
    timestamp: '15/10/2026 08:30:00',
  },
];

export default function OfficerLifecyclePage() {
  const [officers, setOfficers] = useState<OfficerAccountItem[]>(initialOfficers);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>(initialAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal điều chuyển / vô hiệu hóa
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerAccountItem | null>(null);
  const [decisionNumber, setDecisionNumber] = useState('');
  const [decisionDate, setDecisionDate] = useState('2026-10-22');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [reasonType, setReasonType] = useState<DeactivationReasonType>(DeactivationReasonType.TRANSFER);
  const [reasonDetail, setReasonDetail] = useState('');
  const [transfereeOfficerId, setTransfereeOfficerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Modal khôi phục tài khoản
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [reinstatementDecisionNumber, setReinstatementDecisionNumber] = useState('');
  const [reinstatementReason, setReinstatementReason] = useState('');

  // Lọc danh sách cán bộ
  const filteredOfficers = officers.filter(officer => {
    const matchesSearch =
      searchTerm === '' ||
      officer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.officerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.administrativeUnitName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || officer.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || officer.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Danh sách cán bộ đủ điều kiện nhận bàn giao khi mở modal
  const eligibleTransferees = selectedOfficer
    ? officers.filter(
        o =>
          o.id !== selectedOfficer.id &&
          o.status === OfficerAccountStatus.ACTIVE &&
          (o.administrativeUnitCode === selectedOfficer.administrativeUnitCode || o.role === selectedOfficer.role)
      )
    : [];

  // Mở modal điều chuyển
  const handleOpenDeactivateModal = (officer: OfficerAccountItem) => {
    setSelectedOfficer(officer);
    setDecisionNumber('');
    setDecisionDate(new Date().toISOString().split('T')[0]);
    setIssuingAuthority(
      officer.role === UserRole.COMMUNE_OFFICER ? 'UBND Cấp Xã / Phường' : 'Sở Tài nguyên và Môi trường'
    );
    setReasonType(DeactivationReasonType.TRANSFER);
    setReasonDetail('');
    setTransfereeOfficerId('');
    setIsDeactivateModalOpen(true);
  };

  // Mở modal khôi phục
  const handleOpenReactivateModal = (officer: OfficerAccountItem) => {
    setSelectedOfficer(officer);
    setReinstatementDecisionNumber('');
    setReinstatementReason('');
    setIsReactivateModalOpen(true);
  };

  // Xử lý xác nhận điều chuyển / vô hiệu hóa
  const handleConfirmDeactivation = () => {
    if (!selectedOfficer || !decisionNumber || !decisionDate || !issuingAuthority || !reasonDetail) {
      alert('Vui lòng nhập đầy đủ số quyết định, ngày ban hành, cơ quan ban hành và lý do.');
      return;
    }

    if (selectedOfficer.pendingDossierCount > 0 && !transfereeOfficerId) {
      alert(
        `Cán bộ hiện đang nắm giữ ${selectedOfficer.pendingDossierCount} hồ sơ địa chính. Vui lòng chỉ định cán bộ tiếp nhận bàn giao trước khi thu hồi quyền.`
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      let newStatus: OfficerAccountStatus;
      let reasonText = '';

      switch (reasonType) {
        case DeactivationReasonType.TRANSFER:
          newStatus = OfficerAccountStatus.TRANSFERRED;
          reasonText = 'Điều chuyển công tác sang đơn vị khác';
          break;
        case DeactivationReasonType.DISCIPLINE:
          newStatus = OfficerAccountStatus.SUSPENDED_DISCIPLINE;
          reasonText = 'Đình chỉ công tác do kỷ luật';
          break;
        case DeactivationReasonType.DISMISSAL:
          newStatus = OfficerAccountStatus.DISMISSED;
          reasonText = 'Miễn nhiệm chức vụ';
          break;
        case DeactivationReasonType.RESIGNATION:
          newStatus = OfficerAccountStatus.RESIGNED;
          reasonText = 'Thôi việc / Nghỉ chế độ';
          break;
      }

      const transferee = officers.find(o => o.id === transfereeOfficerId);
      const reassignedCount = selectedOfficer.pendingDossierCount;
      const fakeAuditHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      // Cập nhật danh sách cán bộ
      setOfficers(prev =>
        prev.map(o => {
          if (o.id === selectedOfficer.id) {
            return {
              ...o,
              status: newStatus,
              pendingDossierCount: 0,
              deactivationInfo: {
                decisionNumber,
                decisionDate,
                issuingAuthority,
                reasonType,
                reasonDetail,
                deactivatedAt: new Date().toISOString(),
                deactivatedByAdminId: 'ADMIN-SYS-001',
                transfereeOfficerId,
                transfereeOfficerName: transferee?.fullName,
                reassignedDossierCount: reassignedCount,
                auditHash: fakeAuditHash,
              },
            };
          }
          if (transferee && o.id === transferee.id) {
            return {
              ...o,
              pendingDossierCount: o.pendingDossierCount + reassignedCount,
            };
          }
          return o;
        })
      );

      // Thêm log kiểm toán
      setAuditLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          officerName: selectedOfficer.fullName,
          decisionNumber,
          reasonText,
          transfereeText: transferee?.fullName || 'Không có',
          reassignedCount,
          auditHash: fakeAuditHash,
          timestamp: new Date().toLocaleString('vi-VN'),
        },
        ...prev,
      ]);

      setIsSubmitting(false);
      setIsDeactivateModalOpen(false);
      setActionSuccessMessage(
        `Đã vô hiệu hóa tài khoản cán bộ '${selectedOfficer.fullName}' thành công theo Quyết định ${decisionNumber}. Bàn giao ${reassignedCount} hồ sơ cho cán bộ tiếp nhận.`
      );

      setTimeout(() => setActionSuccessMessage(null), 6000);
    }, 600);
  };

  // Xử lý xác nhận khôi phục tài khoản
  const handleConfirmReactivation = () => {
    if (!selectedOfficer || !reinstatementDecisionNumber || !reinstatementReason) {
      alert('Vui lòng nhập đầy đủ số quyết định tiếp nhận và lý do.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const fakeAuditHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      setOfficers(prev =>
        prev.map(o => {
          if (o.id === selectedOfficer.id) {
            const updated = { ...o, status: OfficerAccountStatus.ACTIVE };
            delete updated.deactivationInfo;
            return updated;
          }
          return o;
        })
      );

      setAuditLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          officerName: selectedOfficer.fullName,
          decisionNumber: reinstatementDecisionNumber,
          reasonText: 'Khôi phục tài khoản công vụ hoạt động trở lại',
          transfereeText: 'Không áp dụng',
          reassignedCount: 0,
          auditHash: fakeAuditHash,
          timestamp: new Date().toLocaleString('vi-VN'),
        },
        ...prev,
      ]);

      setIsSubmitting(false);
      setIsReactivateModalOpen(false);
      setActionSuccessMessage(
        `Đã khôi phục hoạt động cho cán bộ '${selectedOfficer.fullName}' theo Quyết định ${reinstatementDecisionNumber}.`
      );
      setTimeout(() => setActionSuccessMessage(null), 6000);
    }, 600);
  };

  // Hiển thị badge trạng thái
  const renderStatusBadge = (status: OfficerAccountStatus) => {
    switch (status) {
      case OfficerAccountStatus.ACTIVE:
        return <Badge variant="success">Đang công tác</Badge>;
      case OfficerAccountStatus.TRANSFERRED:
        return <Badge variant="neutral">Đã điều chuyển</Badge>;
      case OfficerAccountStatus.SUSPENDED_DISCIPLINE:
        return <Badge variant="danger">Đình chỉ kỷ luật</Badge>;
      case OfficerAccountStatus.DISMISSED:
        return <Badge variant="danger">Miễn nhiệm</Badge>;
      case OfficerAccountStatus.RESIGNED:
        return <Badge variant="neutral">Thôi việc / Nghỉ</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Hiển thị vai trò
  const renderRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.COMMUNE_OFFICER:
        return 'Cán bộ Địa chính cấp xã/phường';
      case UserRole.LAND_REGISTRAR:
        return 'Cán bộ Văn phòng Đăng ký Đất đai';
      case UserRole.ADMIN:
        return 'Quản trị viên Hệ thống';
      case UserRole.INSPECTOR:
        return 'Thanh tra viên Đất đai';
      default:
        return role;
    }
  };

  // Thống kê nhanh
  const totalOfficers = officers.length;
  const activeCount = officers.filter(o => o.status === OfficerAccountStatus.ACTIVE).length;
  const transferredCount = officers.filter(o => o.status === OfficerAccountStatus.TRANSFERRED).length;
  const suspendedCount = officers.filter(
    o => o.status === OfficerAccountStatus.SUSPENDED_DISCIPLINE || o.status === OfficerAccountStatus.DISMISSED
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Vòng Đời & Điều Chuyển Cán Bộ Công Vụ"
        description="Thu hồi quyền truy cập, chấm dứt phiên làm việc tức thì và bàn giao hồ sơ địa chính dở dang khi cán bộ nhận quyết định điều chuyển hoặc thôi việc"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Quản trị hệ thống' },
          { label: 'Vòng đời cán bộ công vụ' },
        ]}
      />

      {/* Thông báo thao tác thành công */}
      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-3 text-emerald-900 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-semibold text-sm">{actionSuccessMessage}</p>
        </div>
      )}

      {/* Thẻ thống kê nhân sự */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-700">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase">Tổng số cán bộ</p>
              <p className="text-3xl font-extrabold text-slate-950 mt-1">{totalOfficers}</p>
              <p className="text-xs text-slate-800 mt-1">Được cấp quyền nghiệp vụ</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-full">
              <Users className="w-6 h-6 text-slate-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase">Đang công tác</p>
              <p className="text-3xl font-extrabold text-emerald-950 mt-1">{activeCount}</p>
              <p className="text-xs text-emerald-800 mt-1">Đủ thẩm quyền xử lý hồ sơ</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <UserCheck className="w-6 h-6 text-emerald-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase">Đã điều chuyển</p>
              <p className="text-3xl font-extrabold text-blue-950 mt-1">{transferredCount}</p>
              <p className="text-xs text-blue-800 mt-1">Đã bàn giao toàn bộ hồ sơ</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ArrowRightLeft className="w-6 h-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase">Đình chỉ / Miễn nhiệm</p>
              <p className="text-3xl font-extrabold text-red-950 mt-1">{suspendedCount}</p>
              <p className="text-xs text-red-800 mt-1">Tài khoản bị khóa vô hiệu</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <UserX className="w-6 h-6 text-red-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng danh sách cán bộ công vụ */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Danh Sách Cán Bộ Quản Lý Địa Chính</CardTitle>
              <CardDescription>
                Theo dõi thẩm quyền công tác, số lượng hồ sơ địa chính đang phụ trách và thực hiện thủ tục điều chuyển
              </CardDescription>
            </div>
          </div>
          {/* Thanh tìm kiếm và bộ lọc */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <SearchInput
              placeholder="Tìm theo tên cán bộ, mã số, cơ quan..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
            <Select
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: OfficerAccountStatus.ACTIVE, label: 'Đang công tác' },
                { value: OfficerAccountStatus.TRANSFERRED, label: 'Đã điều chuyển' },
                { value: OfficerAccountStatus.SUSPENDED_DISCIPLINE, label: 'Đình chỉ kỷ luật' },
                { value: OfficerAccountStatus.DISMISSED, label: 'Miễn nhiệm' },
                { value: OfficerAccountStatus.RESIGNED, label: 'Thôi việc / Nghỉ' },
              ]}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            />
            <Select
              options={[
                { value: 'ALL', label: 'Tất cả vị trí vai trò' },
                { value: UserRole.COMMUNE_OFFICER, label: 'Cán bộ Địa chính cấp xã/phường' },
                { value: UserRole.LAND_REGISTRAR, label: 'Cán bộ Văn phòng Đăng ký Đất đai' },
              ]}
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Mã cán bộ</th>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Vị trí & Đơn vị công tác</th>
                  <th className="px-4 py-3 text-center">Hồ sơ dở dang</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredOfficers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8">
                      <EmptyState
                        title="Không tìm thấy cán bộ phù hợp"
                        description="Vui lòng thử thay đổi từ khóa tìm kiếm hoặc làm mới bộ lọc phân quyền"
                        action={{
                          label: 'Làm mới bộ lọc',
                          onClick: () => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                            setRoleFilter('ALL');
                          },
                          variant: 'outline',
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredOfficers.map(officer => (
                    <tr key={officer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {officer.officerCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-950">{officer.fullName}</div>
                        <div className="text-xs text-slate-700">{officer.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{renderRoleName(officer.role)}</div>
                        <div className="text-xs text-slate-700 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {officer.administrativeUnitName}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {officer.pendingDossierCount > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900">
                            {officer.pendingDossierCount} hồ sơ
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Không có</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {renderStatusBadge(officer.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {officer.status === OfficerAccountStatus.ACTIVE ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenDeactivateModal(officer)}
                          >
                            <UserX className="w-3.5 h-3.5 mr-1" />
                            Điều chuyển / Khóa
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReactivateModal(officer)}
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            Khôi phục quyền
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nhật ký kiểm toán điều chuyển và thu hồi quyền */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <div>
              <CardTitle>Nhật Ký Kiểm Toán Thu Hồi Quyền & Bàn Giao Hồ Sơ</CardTitle>
              <CardDescription>
                Lưu vết bất biến toàn bộ các quyết định điều chuyển, miễn nhiệm kèm mã băm bảo mật thời gian thực
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
                  <th className="px-4 py-3">Cán bộ liên quan</th>
                  <th className="px-4 py-3">Số quyết định</th>
                  <th className="px-4 py-3">Nội dung quyết định</th>
                  <th className="px-4 py-3">Cán bộ tiếp nhận bàn giao</th>
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
                      {log.officerName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-semibold text-xs text-slate-900 border border-slate-300">
                        {log.decisionNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-800">
                      {log.reasonText}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                      {log.transfereeText !== 'Không có' && log.transfereeText !== 'Không áp dụng' ? (
                        <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>{log.transfereeText} ({log.reassignedCount} hồ sơ)</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-normal">{log.transfereeText}</span>
                      )}
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

      {/* Modal Điều Chuyển & Vô Hiệu Hóa Tài Khoản */}
      <Modal
        isOpen={isDeactivateModalOpen}
        onClose={() => !isSubmitting && setIsDeactivateModalOpen(false)}
        title="Thực Hiện Quyết Định Điều Chuyển / Vô Hiệu Hóa Tài Khoản"
        description="Thu hồi quyền truy cập hệ thống công vụ ngay lập tức và phân công cán bộ thay thế tiếp nhận hồ sơ đang xử lý dở dang"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeactivateModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeactivation}
              isLoading={isSubmitting}
            >
              Xác nhận thu hồi quyền & Bàn giao
            </Button>
          </div>
        }
      >
        {selectedOfficer && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Cán bộ bị thu hồi quyền: {selectedOfficer.fullName} ({selectedOfficer.officerCode})
              </div>
              <p>
                Đơn vị công tác hiện tại: <strong>{selectedOfficer.administrativeUnitName}</strong>
              </p>
              {selectedOfficer.pendingDossierCount > 0 ? (
                <p className="text-red-700 font-extrabold">
                  ⚠️ Cán bộ này đang phụ trách {selectedOfficer.pendingDossierCount} hồ sơ địa chính chưa hoàn tất. Bạn bắt buộc phải chọn một cán bộ cùng thẩm quyền để tiếp nhận bàn giao.
                </p>
              ) : (
                <p className="text-emerald-700 font-medium">
                  Cán bộ hiện không nắm giữ hồ sơ dở dang. Quyền truy cập sẽ được thu hồi ngay lập tức.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Số quyết định hành chính"
                placeholder="VD: QĐ-2026/045/UBND"
                value={decisionNumber}
                onChange={e => setDecisionNumber(e.target.value)}
                required
              />
              <Input
                label="Ngày ban hành quyết định"
                type="date"
                value={decisionDate}
                onChange={e => setDecisionDate(e.target.value)}
                required
              />
            </div>

            <Input
              label="Cơ quan ban hành quyết định"
              placeholder="VD: UBND Thành phố Hà Nội"
              value={issuingAuthority}
              onChange={e => setIssuingAuthority(e.target.value)}
              required
            />

            <Select
              label="Căn cứ thu hồi quyền"
              options={[
                { value: DeactivationReasonType.TRANSFER, label: 'Điều chuyển công tác sang đơn vị khác' },
                { value: DeactivationReasonType.DISCIPLINE, label: 'Kỷ luật / Đình chỉ công tác tạm thời' },
                { value: DeactivationReasonType.DISMISSAL, label: 'Miễn nhiệm chức vụ' },
                { value: DeactivationReasonType.RESIGNATION, label: 'Thôi việc / Nghỉ hưu theo chế độ' },
              ]}
              value={reasonType}
              onChange={e => setReasonType(e.target.value as DeactivationReasonType)}
            />

            <Input
              label="Lý do chi tiết & Căn cứ điều động"
              placeholder="VD: Điều động cán bộ sang Trung tâm Phát triển Quỹ đất theo đề án luân chuyển"
              value={reasonDetail}
              onChange={e => setReasonDetail(e.target.value)}
              required
            />

            {selectedOfficer.pendingDossierCount > 0 && (
              <Select
                label={`Chỉ định cán bộ tiếp nhận bàn giao (${selectedOfficer.pendingDossierCount} hồ sơ)`}
                options={[
                  { value: '', label: '-- Chọn cán bộ tiếp nhận cùng thẩm quyền --' },
                  ...eligibleTransferees.map(o => ({
                    value: o.id,
                    label: `${o.fullName} (${o.officerCode}) - Đang giữ ${o.pendingDossierCount} hồ sơ`,
                  })),
                ]}
                value={transfereeOfficerId}
                onChange={e => setTransfereeOfficerId(e.target.value)}
                required
              />
            )}
          </div>
        )}
      </Modal>

      {/* Modal Khôi Phục Quyền Công Vụ */}
      <Modal
        isOpen={isReactivateModalOpen}
        onClose={() => !isSubmitting && setIsReactivateModalOpen(false)}
        title="Khôi Phục Quyền Công Vụ Cho Cán Bộ"
        description="Cấp lại thẩm quyền truy cập hệ thống khi cán bộ hết thời hạn đình chỉ hoặc có quyết định điều động tiếp nhận trở lại"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsReactivateModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmReactivation}
              isLoading={isSubmitting}
            >
              Xác nhận khôi phục tài khoản
            </Button>
          </div>
        }
      >
        {selectedOfficer && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-xs text-blue-900 space-y-1">
              <div className="font-bold">
                Cán bộ được khôi phục: {selectedOfficer.fullName} ({selectedOfficer.officerCode})
              </div>
              <p>Đơn vị: {selectedOfficer.administrativeUnitName}</p>
              <p>Trạng thái hiện tại: {renderStatusBadge(selectedOfficer.status)}</p>
            </div>

            <Input
              label="Số quyết định tiếp nhận / Khôi phục"
              placeholder="VD: QĐ-2026/999/UBND-TIEP-NHAN"
              value={reinstatementDecisionNumber}
              onChange={e => setReinstatementDecisionNumber(e.target.value)}
              required
            />

            <Input
              label="Lý do & Căn cứ khôi phục hoạt động"
              placeholder="VD: Hết thời hạn đình chỉ công tác, trở lại vị trí làm việc bình thường"
              value={reinstatementReason}
              onChange={e => setReinstatementReason(e.target.value)}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
