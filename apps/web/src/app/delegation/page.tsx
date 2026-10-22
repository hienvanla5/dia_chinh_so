'use client';

import React, { useState } from 'react';
import {
  FileSignature,
  FileCheck2,
  Calendar,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  Stamp,
  Ban,
  PlusCircle,
  FileText,
  History,
  ShieldCheck,
} from 'lucide-react';
import {
  Button,
  ButtonCreate,
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
  DelegationScope,
  DelegationStatus,
  DelegationDocument,
} from '@diachinhso/shared';

const initialDelegations: DelegationDocument[] = [
  {
    id: 'DEL-2026-001',
    documentNumber: 'QĐ-UQ-2026/015/VPDKDD-HN',
    title: 'Ủy quyền giải quyết và ký số phê duyệt Giấy chứng nhận quyền sử dụng đất trong thời gian Giám đốc đi công tác',
    delegatorId: 'OFF-HN-VPDK-LEAD',
    delegatorName: 'Trần Đình Trọng',
    delegatorTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
    delegateeId: 'OFF-HN-VPDK-001',
    delegateeName: 'Lê Văn Cường',
    delegateeTitle: 'Phó Giám đốc Văn phòng Đăng ký Đất đai',
    signingPrefix: 'KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC',
    scope: DelegationScope.APPROVE_CERTIFICATE,
    startDate: '2026-10-20T00:00:00.000Z',
    endDate: '2026-10-30T23:59:59.000Z',
    status: DelegationStatus.ACTIVE,
    notes: 'Ký thay phê duyệt hồ sơ cấp mới và cấp đổi Sổ Đỏ Số',
    auditHash: '5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f',
    createdAt: '2026-10-20T08:00:00.000Z',
  },
  {
    id: 'DEL-2026-002',
    documentNumber: 'QĐ-UQ-2026/009/VPDKDD-HCM',
    title: 'Ủy quyền ký xác nhận trích lục địa chính và hồ sơ chuyển nhượng',
    delegatorId: 'OFF-HCM-VPDK-LEAD',
    delegatorName: 'Nguyễn Văn Minh',
    delegatorTitle: 'Giám đốc Văn phòng Đăng ký Đất đai TP.HCM',
    delegateeId: 'OFF-HCM-VPDK-001',
    delegateeName: 'Đỗ Quốc Tuấn',
    delegateeTitle: 'Phó Giám đốc Văn phòng Đăng ký Đất đai TP.HCM',
    signingPrefix: 'KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC',
    scope: DelegationScope.SIGN_TRANSFER,
    startDate: '2026-10-01T00:00:00.000Z',
    endDate: '2026-10-15T23:59:59.000Z',
    status: DelegationStatus.EXPIRED,
    notes: 'Thời hạn ủy quyền đã kết thúc an toàn',
    auditHash: '4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e',
    createdAt: '2026-10-01T08:00:00.000Z',
  },
];

const deputyOfficers = [
  { id: 'OFF-HN-VPDK-001', name: 'Lê Văn Cường', title: 'Phó Giám đốc VP ĐKĐĐ TP. Hà Nội' },
  { id: 'OFF-HN-VPDK-002', name: 'Phạm Thị Dung', title: 'Trưởng phòng Thẩm định hồ sơ' },
  { id: 'OFF-HCM-VPDK-001', name: 'Đỗ Quốc Tuấn', title: 'Phó Giám đốc VP ĐKĐĐ TP. Hồ Chí Minh' },
];

export default function DelegationPage() {
  const [delegations, setDelegations] = useState<DelegationDocument[]>(initialDelegations);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal Tạo Văn bản Ủy quyền
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');
  const [title, setTitle] = useState('');
  const [delegateeId, setDelegateeId] = useState('OFF-HN-VPDK-001');
  const [scope, setScope] = useState<DelegationScope>(DelegationScope.APPROVE_CERTIFICATE);
  const [startDate, setStartDate] = useState('2026-10-22');
  const [endDate, setEndDate] = useState('2026-10-29');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Thu Hồi Ủy Quyền
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedDelegation, setSelectedDelegation] = useState<DelegationDocument | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);

  // Modal Mô phỏng Ký thay KT. Giám đốc
  const [isSigningSimulatorOpen, setIsSigningSimulatorOpen] = useState(false);
  const [signingSuccess, setSigningSuccess] = useState(false);

  const filteredDelegations = delegations.filter(d => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  const handleCreateDelegation = () => {
    if (!documentNumber || !title || !startDate || !endDate) {
      alert('Vui lòng nhập đầy đủ số văn bản, trích yếu và thời gian ủy quyền.');
      return;
    }

    if (new Date(startDate).getTime() >= new Date(endDate).getTime()) {
      alert('Thời điểm kết thúc ủy quyền phải sau thời điểm bắt đầu.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const selectedDeputy = deputyOfficers.find(o => o.id === delegateeId);
      const fakeAuditHash = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const newDel: DelegationDocument = {
        id: `DEL-${Date.now()}`,
        documentNumber,
        title,
        delegatorId: 'OFF-HN-VPDK-LEAD',
        delegatorName: 'Trần Đình Trọng',
        delegatorTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
        delegateeId,
        delegateeName: selectedDeputy?.name || 'Cán bộ cấp phó',
        delegateeTitle: selectedDeputy?.title || 'Phó Giám đốc',
        signingPrefix: 'KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC',
        scope,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status: DelegationStatus.ACTIVE,
        notes,
        auditHash: fakeAuditHash,
        createdAt: new Date().toISOString(),
      };

      setDelegations(prev => [newDel, ...prev]);
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      setSuccessMsg(`Đã thiết lập văn bản ủy quyền ${documentNumber} cho đồng chí ${newDel.delegateeName} thành công.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }, 600);
  };

  const handleConfirmRevoke = () => {
    if (!selectedDelegation || !revokeReason) {
      alert('Vui lòng nhập lý do thu hồi văn bản ủy quyền.');
      return;
    }

    setIsRevoking(true);

    setTimeout(() => {
      setDelegations(prev =>
        prev.map(d => {
          if (d.id === selectedDelegation.id) {
            return {
              ...d,
              status: DelegationStatus.REVOKED,
              revocationReason: revokeReason,
              revokedAt: new Date().toISOString(),
              revokedBy: 'Trần Đình Trọng (Giám đốc)',
            };
          }
          return d;
        })
      );

      setIsRevoking(false);
      setIsRevokeModalOpen(false);
      setSuccessMsg(`Đã thu hồi văn bản ủy quyền ${selectedDelegation.documentNumber} trước thời hạn.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }, 500);
  };

  const renderStatusBadge = (status: DelegationStatus) => {
    switch (status) {
      case DelegationStatus.ACTIVE:
        return <Badge variant="success">Đang hiệu lực</Badge>;
      case DelegationStatus.PENDING:
        return <Badge variant="warning">Chưa đến hạn</Badge>;
      case DelegationStatus.EXPIRED:
        return <Badge variant="neutral">Đã hết hạn</Badge>;
      case DelegationStatus.REVOKED:
        return <Badge variant="danger">Đã thu hồi</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderScopeName = (scope: DelegationScope) => {
    switch (scope) {
      case DelegationScope.APPROVE_CERTIFICATE:
        return 'Ký duyệt Giấy chứng nhận (Sổ Đỏ Số)';
      case DelegationScope.SIGN_TRANSFER:
        return 'Ký biến động chuyển nhượng / thế chấp';
      case DelegationScope.SIGN_SURVEY_EXTRACT:
        return 'Ký trích lục bản đồ địa chính';
      case DelegationScope.ALL_DOSSIERS:
        return 'Toàn bộ thẩm quyền giải quyết hồ sơ';
      default:
        return scope;
    }
  };

  const activeCount = delegations.filter(d => d.status === DelegationStatus.ACTIVE).length;
  const expiredCount = delegations.filter(d => d.status === DelegationStatus.EXPIRED).length;
  const revokedCount = delegations.filter(d => d.status === DelegationStatus.REVOKED).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Ủy Quyền Ký Duyệt Hồ Sơ Có Thời Hạn"
        description="Thiết lập thẩm quyền ký thay điện tử cho cấp phó khi Lãnh đạo đi công tác, đảm bảo tính liên tục của thủ tục hành chính đất đai"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Văn phòng Đăng ký Đất đai' },
          { label: 'Quản lý ủy quyền' },
        ]}
      />

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-3 text-emerald-900 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-semibold text-sm">{successMsg}</p>
        </div>
      )}

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-700">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase">Tổng văn bản ủy quyền</p>
              <p className="text-3xl font-extrabold text-slate-950 mt-1">{delegations.length}</p>
              <p className="text-xs text-slate-800 mt-1">Đã ban hành trên hệ thống</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-full">
              <FileSignature className="w-6 h-6 text-slate-800" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase">Đang có hiệu lực</p>
              <p className="text-3xl font-extrabold text-emerald-950 mt-1">{activeCount}</p>
              <p className="text-xs text-emerald-800 mt-1">Cấp phó được ký thay</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase">Đã hết thời hạn</p>
              <p className="text-3xl font-extrabold text-blue-950 mt-1">{expiredCount}</p>
              <p className="text-xs text-blue-800 mt-1">Tự động thu hồi quyền</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="w-6 h-6 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase">Thu hồi trước hạn</p>
              <p className="text-3xl font-extrabold text-red-950 mt-1">{revokedCount}</p>
              <p className="text-xs text-red-800 mt-1">Chấm dứt hiệu lực chủ động</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Ban className="w-6 h-6 text-red-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danh sách văn bản ủy quyền */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Danh Mục Quyết Định Ủy Quyền Ký Phê Duyệt</CardTitle>
              <CardDescription>
                Quy định rõ phạm vi ký duyệt, chức danh ký thay và thời gian có hiệu lực pháp lý
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSigningSuccess(false);
                  setIsSigningSimulatorOpen(true);
                }}
              >
                <Stamp className="w-4 h-4 mr-1 text-slate-700" />
                Thử nghiệm Ký thay (KT. Giám đốc)
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Ban hành Ủy quyền mới
              </Button>
            </div>
          </div>
          {/* Bộ lọc trạng thái */}
          <div className="pt-3 max-w-xs">
            <Select
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: DelegationStatus.ACTIVE, label: 'Đang hiệu lực' },
                { value: DelegationStatus.EXPIRED, label: 'Đã hết hạn' },
                { value: DelegationStatus.REVOKED, label: 'Đã thu hồi' },
              ]}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-sm text-slate-800">
              <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Số quyết định</th>
                  <th className="px-4 py-3">Trích yếu nội dung</th>
                  <th className="px-4 py-3">Người ủy quyền & Người nhận</th>
                  <th className="px-4 py-3">Phạm vi nghiệp vụ</th>
                  <th className="px-4 py-3">Thời hạn hiệu lực</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredDelegations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8">
                      <EmptyState
                        title="Không có văn bản ủy quyền nào"
                        description="Chưa có quyết định ủy quyền nào phù hợp với bộ lọc hiện tại"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredDelegations.map(del => (
                    <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {del.documentNumber}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-xs">
                        <div className="font-semibold text-slate-950 line-clamp-2">{del.title}</div>
                        {del.notes && <div className="text-slate-700 italic mt-0.5">{del.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div>
                          <span className="text-slate-700">Ủy quyền: </span>
                          <span className="font-bold text-slate-950">{del.delegatorName}</span>
                        </div>
                        <div className="mt-0.5 text-blue-700 font-bold">
                          <span>Nhận: </span>
                          <span>{del.delegateeName}</span> ({del.delegateeTitle})
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">
                        {renderScopeName(del.scope)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-800">
                        <div>{new Date(del.startDate).toLocaleDateString('vi-VN')}</div>
                        <div className="text-slate-700">đến {new Date(del.endDate).toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {renderStatusBadge(del.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {del.status === DelegationStatus.ACTIVE && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedDelegation(del);
                              setRevokeReason('');
                              setIsRevokeModalOpen(true);
                            }}
                          >
                            <Ban className="w-3.5 h-3.5 mr-1" />
                            Thu hồi
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

      {/* Modal Ban Hành Văn Bản Ủy Quyền Mới */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="Ban Hành Quyết Định Ủy Quyền Ký Duyệt Hồ Sơ"
        description="Chỉ định cấp phó ký thay Lãnh đạo Văn phòng Đăng ký Đất đai trong khoảng thời gian xác định"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateDelegation}
              isLoading={isSubmitting}
            >
              Ký duyệt & Ban hành ủy quyền
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Số quyết định ủy quyền"
            placeholder="VD: QĐ-UQ-2026/020/VPDKDD-HN"
            value={documentNumber}
            onChange={e => setDocumentNumber(e.target.value)}
            required
          />

          <Input
            label="Trích yếu nội dung ủy quyền"
            placeholder="VD: Ủy quyền ký duyệt Giấy chứng nhận quyền sử dụng đất trong thời gian Giám đốc đi công tác"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <Select
            label="Cán bộ được ủy quyền ký thay (Cấp phó)"
            options={deputyOfficers.map(o => ({
              value: o.id,
              label: `${o.name} - ${o.title}`,
            }))}
            value={delegateeId}
            onChange={e => setDelegateeId(e.target.value)}
            required
          />

          <Select
            label="Phạm vi nghiệp vụ được ký thay"
            options={[
              { value: DelegationScope.APPROVE_CERTIFICATE, label: 'Ký duyệt Giấy chứng nhận (Sổ Đỏ Số)' },
              { value: DelegationScope.SIGN_TRANSFER, label: 'Ký biến động chuyển nhượng / thế chấp' },
              { value: DelegationScope.SIGN_SURVEY_EXTRACT, label: 'Ký trích lục bản đồ địa chính' },
              { value: DelegationScope.ALL_DOSSIERS, label: 'Toàn bộ thẩm quyền giải quyết hồ sơ địa chính' },
            ]}
            value={scope}
            onChange={e => setScope(e.target.value as DelegationScope)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Thời điểm bắt đầu"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Thời điểm kết thúc"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Ghi chú thêm"
            placeholder="VD: Áp dụng trên địa bàn toàn thành phố"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800">
            Tiêu đề ký số phát hành: <strong>KT. GIÁM ĐỐC - PHÓ GIÁM ĐỐC</strong>. Chứng thư số công vụ của cán bộ được ủy quyền sẽ được kiểm tra hiệu lực tự động khi ký.
          </div>
        </div>
      </Modal>

      {/* Modal Thu Hồi Ủy Quyền Trước Thời Hạn */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => !isRevoking && setIsRevokeModalOpen(false)}
        title="Thu Hồi Quyết Định Ủy Quyền Trước Thời Hạn"
        description="Chấm dứt ngay lập tức thẩm quyền ký thay khi Lãnh đạo cấp trưởng trở lại vị trí làm việc"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsRevokeModalOpen(false)}
              disabled={isRevoking}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmRevoke}
              isLoading={isRevoking}
            >
              Xác nhận thu hồi quyền
            </Button>
          </div>
        }
      >
        {selectedDelegation && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 space-y-1">
              <p>
                Số văn bản: <strong>{selectedDelegation.documentNumber}</strong>
              </p>
              <p>
                Cán bộ nhận ủy quyền: <strong>{selectedDelegation.delegateeName}</strong> ({selectedDelegation.delegateeTitle})
              </p>
            </div>

            <Input
              label="Lý do thu hồi ủy quyền"
              placeholder="VD: Giám đốc đã hoàn thành chuyến công tác sớm hơn dự kiến và trở lại trực tiếp điều hành"
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              required
            />
          </div>
        )}
      </Modal>

      {/* Modal Thử Nghiệm Ký Thay Duyệt Hồ Sơ */}
      <Modal
        isOpen={isSigningSimulatorOpen}
        onClose={() => setIsSigningSimulatorOpen(false)}
        title="Mô Phỏng Ký Phê Duyệt Hồ Sơ Theo Văn Bản Ủy Quyền"
        description="Kiểm tra cách thức hệ thống áp dụng tiêu đề 'KT. GIÁM ĐỐC' và con dấu số khi cấp phó thực hiện phê duyệt"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsSigningSimulatorOpen(false)}>
              Đóng
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Cán bộ thực hiện:</span>
              <span className="font-bold text-slate-900">Lê Văn Cường (Phó Giám đốc)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Căn cứ pháp lý:</span>
              <span className="font-semibold text-slate-900">QĐ-UQ-2026/015/VPDKDD-HN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Trạng thái ủy quyền:</span>
              <Badge variant="success">Đang hiệu lực</Badge>
            </div>
          </div>

          {/* Bản xem trước con dấu chữ ký số điện tử */}
          <div className="border-2 border-dashed border-red-300 rounded-xl p-5 bg-red-50/40 text-center space-y-2">
            <p className="text-xs uppercase font-extrabold text-red-800 tracking-wider">
              VĂN PHÒNG ĐĂNG KÝ ĐẤT ĐAI
            </p>
            <p className="text-sm font-extrabold text-red-900 uppercase">
              KT. GIÁM ĐỐC<br />PHÓ GIÁM ĐỐC
            </p>
            <div className="py-2">
              <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded font-bold text-xs border border-red-300">
                LÊ VĂN CƯỜNG
              </span>
            </div>
            <p className="text-[11px] text-red-700">
              Ký bằng Chứng thư số chuyên dùng công vụ Ban Cơ yếu Chính phủ<br />
              Dấu thời gian TSA RFC 3161: {new Date().toLocaleString('vi-VN')}
            </p>
          </div>

          {!signingSuccess ? (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setSigningSuccess(true)}
            >
              <Stamp className="w-4 h-4 mr-2" />
              Thực hiện Ký Duyệt Hồ Sơ Thử Nghiệm
            </Button>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Hồ sơ đã được phê duyệt thành công với tư cách ký thay Lãnh đạo! Văn bản điện tử có đầy đủ giá trị pháp lý.</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
