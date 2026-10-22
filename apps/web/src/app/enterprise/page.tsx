'use client';

import React, { useState } from 'react';
import {
  Building,
  Building2,
  FileText,
  UserPlus,
  Users,
  MapPin,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Stamp,
  Layers,
  ArrowRight,
  Trash2,
  Lock,
  Phone,
  Mail,
  Scale,
  Calendar,
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
  EnterpriseAccount,
  EnterpriseStaffPermission,
  EnterpriseStaffMember,
  EnterpriseProjectParcel,
} from '@diachinhso/shared';

const mockEnterpriseData: EnterpriseAccount = {
  id: 'ENT-0101234567',
  taxId: '0101234567',
  enterpriseName: 'Tập đoàn Đầu tư Địa ốc Thủ Đô',
  representativeName: 'Hoàng Minh Đức',
  representativeCitizenId: '001085000123',
  headquartersAddress: 'Số 18, Phố Tràng Tiền, TP. Hà Nội',
  phoneNumber: '02439876543',
  email: 'phapche@thudoland.vn',
  digitalCertificateSerial: 'CA-ENT-THUDO-8899',
  projectParcels: [
    {
      parcelId: 'PAR-HN-001',
      nationalCode: '01-001-015-0010',
      projectName: 'Khu Đô Thị Sinh Thái Sông Hồng',
      areaM2: 45000,
      purposeCode: 'TMD',
      location: 'Xã/Phường Hàng Bạc, TP. Hà Nội',
      landAllocationDecision: 'QĐ-1245/QĐ-UBND ngày 12/03/2024',
      landUseTerm: 'Đến 12/03/2074 (50 năm)',
      certificateNumber: 'GCN-DN-2024-001',
      status: 'ALLOCATED',
    },
    {
      parcelId: 'PAR-HN-002',
      nationalCode: '01-002-008-0055',
      projectName: 'Tòa Nhà Phức Hợp Văn Phòng Thương Mại Thủ Đô',
      areaM2: 12000,
      purposeCode: 'SKC',
      location: 'TP. Hà Nội',
      landAllocationDecision: 'QĐ-889/QĐ-UBND ngày 05/08/2023',
      landUseTerm: 'Đến 05/08/2063 (Thuê đất trả tiền 1 lần)',
      certificateNumber: 'GCN-DN-2023-045',
      status: 'LEASED',
    },
  ],
  staffMembers: [
    {
      id: 'STF-001',
      fullName: 'Phan Thu Thảo',
      citizenId: '001192000888',
      email: 'thao.pt@thudoland.vn',
      phoneNumber: '0912988776',
      department: 'Ban Pháp chế & Phát triển Dự án',
      position: 'Trưởng ban Pháp chế',
      permissions: [
        EnterpriseStaffPermission.SUBMIT_DOSSIER,
        EnterpriseStaffPermission.VIEW_PARCELS,
        EnterpriseStaffPermission.SUPPLEMENT_DOCS,
      ],
      status: 'ACTIVE',
      assignedAt: '10/01/2026',
    },
    {
      id: 'STF-002',
      fullName: 'Vũ Tuấn Kiệt',
      citizenId: '001195000999',
      email: 'kiet.vt@thudoland.vn',
      phoneNumber: '0912988777',
      department: 'Phòng Tài chính Kế toán',
      position: 'Chuyên viên Kế toán Thuế',
      permissions: [
        EnterpriseStaffPermission.VIEW_PARCELS,
        EnterpriseStaffPermission.MANAGE_PAYMENTS,
      ],
      status: 'ACTIVE',
      assignedAt: '15/02/2026',
    },
  ],
};

export default function EnterpriseIdpPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [enterprise, setEnterprise] = useState<EnterpriseAccount>(mockEnterpriseData);
  const [taxIdInput, setTaxIdInput] = useState('0101234567');
  const [authMethod, setAuthMethod] = useState<'DIGITAL_SIGNATURE' | 'REPRESENTATIVE_OTP'>('DIGITAL_SIGNATURE');
  const [otpInput, setOtpInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'PARCELS' | 'STAFF'>('PARCELS');

  // Modal Thêm Nhân viên
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [staffFullName, setStaffFullName] = useState('');
  const [staffCitizenId, setStaffCitizenId] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDept, setStaffDept] = useState('');
  const [staffPos, setStaffPos] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<EnterpriseStaffPermission[]>([
    EnterpriseStaffPermission.VIEW_PARCELS,
    EnterpriseStaffPermission.SUBMIT_DOSSIER,
  ]);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxIdInput) {
      alert('Vui lòng nhập mã số thuế doanh nghiệp.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsLoggedIn(true);
      setSuccessMsg('Đăng nhập Cổng Định danh Doanh nghiệp thành công!');
      setTimeout(() => setSuccessMsg(null), 5000);
    }, 600);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setTaxIdInput('');
    setOtpInput('');
  };

  const handleTogglePermission = (perm: EnterpriseStaffPermission) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleAddStaff = () => {
    if (!staffFullName || !staffCitizenId || !staffEmail || !staffDept || !staffPos) {
      alert('Vui lòng điền đầy đủ thông tin nhân viên.');
      return;
    }

    if (staffCitizenId.length !== 12 || !/^\d{12}$/.test(staffCitizenId)) {
      alert('Số CCCD của nhân viên phải gồm đúng 12 chữ số.');
      return;
    }

    if (selectedPermissions.length === 0) {
      alert('Vui lòng phân công ít nhất một quyền hạn.');
      return;
    }

    setIsSavingStaff(true);
    setTimeout(() => {
      const newStaff: EnterpriseStaffMember = {
        id: `STF-${Date.now()}`,
        fullName: staffFullName,
        citizenId: staffCitizenId,
        email: staffEmail,
        phoneNumber: staffPhone || 'Chưa cập nhật',
        department: staffDept,
        position: staffPos,
        permissions: selectedPermissions,
        status: 'ACTIVE',
        assignedAt: new Date().toLocaleDateString('vi-VN'),
      };

      setEnterprise(prev => ({
        ...prev,
        staffMembers: [newStaff, ...prev.staffMembers],
      }));

      setIsSavingStaff(false);
      setIsAddStaffModalOpen(false);
      setSuccessMsg(`Đã phân quyền thành công cho nhân viên ${staffFullName}.`);
      setTimeout(() => setSuccessMsg(null), 5000);

      // Reset form
      setStaffFullName('');
      setStaffCitizenId('');
      setStaffEmail('');
      setStaffPhone('');
      setStaffDept('');
      setStaffPos('');
    }, 500);
  };

  const handleRemoveStaff = (staffId: string) => {
    if (confirm('Bạn có chắc chắn muốn thu hồi quyền truy cập của nhân viên này?')) {
      setEnterprise(prev => ({
        ...prev,
        staffMembers: prev.staffMembers.filter(s => s.id !== staffId),
      }));
      setSuccessMsg('Đã thu hồi quyền truy cập của nhân viên.');
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const renderPermissionBadge = (perm: EnterpriseStaffPermission) => {
    switch (perm) {
      case EnterpriseStaffPermission.SUBMIT_DOSSIER:
        return <Badge variant="primary">Nộp hồ sơ dự án</Badge>;
      case EnterpriseStaffPermission.VIEW_PARCELS:
        return <Badge variant="neutral">Tra cứu thửa đất</Badge>;
      case EnterpriseStaffPermission.SUPPLEMENT_DOCS:
        return <Badge variant="warning">Bổ sung tài liệu</Badge>;
      case EnterpriseStaffPermission.MANAGE_PAYMENTS:
        return <Badge variant="success">Nghĩa vụ tài chính</Badge>;
      default:
        return null;
    }
  };

  // Nếu chưa đăng nhập: Hiển thị form đăng nhập doanh nghiệp
  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-6">
        <PageHeader
          title="Cổng Định Danh Doanh Nghiệp"
          description="Đăng nhập tài khoản tổ chức sử dụng đất bằng Mã số thuế và Chữ ký số doanh nghiệp"
        />

        <Card className="border-t-4 border-t-primary-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-800" />
              <div>
                <CardTitle>Đăng Nhập Tài Khoản Tổ Chức</CardTitle>
                <CardDescription>
                  Dành cho Doanh nghiệp, Tập đoàn, Hợp tác xã thực hiện thủ tục đất đai dự án
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Mã số thuế doanh nghiệp (10 hoặc 13 chữ số)"
                placeholder="VD: 0101234567"
                value={taxIdInput}
                onChange={e => setTaxIdInput(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-700">
                  Phương thức xác thực doanh nghiệp
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('DIGITAL_SIGNATURE')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      authMethod === 'DIGITAL_SIGNATURE'
                        ? 'border-primary-800 bg-primary-50/50 ring-2 ring-primary-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <Stamp className="w-4 h-4 text-primary-800" />
                      Chữ ký số Doanh nghiệp
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">SmartCA / USB Token</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('REPRESENTATIVE_OTP')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      authMethod === 'REPRESENTATIVE_OTP'
                        ? 'border-primary-800 bg-primary-50/50 ring-2 ring-primary-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                      <Lock className="w-4 h-4 text-primary-800" />
                      OTP Người đại diện
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">Xác thực CCCD đại diện</p>
                  </button>
                </div>
              </div>

              {authMethod === 'DIGITAL_SIGNATURE' ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 space-y-1">
                  <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Đã phát hiện thiết bị ký số doanh nghiệp
                  </p>
                  <p>Chứng thư số: CA-ENT-THUDO-8899 (Hạn dùng: Đến 2028)</p>
                </div>
              ) : (
                <Input
                  label="Mã OTP gửi về SĐT Người đại diện pháp luật"
                  placeholder="Nhập 6 số OTP (Thử nghiệm: 123456)"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  required
                />
              )}

              <Button
                variant="primary"
                type="submit"
                className="w-full"
                isLoading={isLoggingIn}
              >
                Xác thực & Đăng nhập Doanh nghiệp
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Khi đã đăng nhập: Portal Quản Trị Đất Đai Doanh Nghiệp
  const totalArea = enterprise.projectParcels.reduce((sum, p) => sum + p.areaM2, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Cổng Thông Tin Đất Đai Doanh Nghiệp"
          description={`Tài khoản tổ chức: ${enterprise.enterpriseName} (Mã số thuế: ${enterprise.taxId})`}
          breadcrumbs={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Doanh nghiệp sử dụng đất' },
          ]}
        />
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1 text-slate-600" />
          Đăng xuất
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-3 text-emerald-900 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="font-semibold text-sm">{successMsg}</p>
        </div>
      )}

      {/* Thẻ thông tin doanh nghiệp */}
      <Card className="bg-gradient-to-r from-slate-900 to-primary-950 text-white border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-6 h-6 text-gold-400" />
                <h2 className="text-xl font-extrabold tracking-wide">{enterprise.enterpriseName}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300">
                <p>Mã số thuế: <strong className="text-white font-mono">{enterprise.taxId}</strong></p>
                <p>Người đại diện: <strong className="text-white">{enterprise.representativeName}</strong></p>
                <p>Trụ sở: <strong className="text-white">{enterprise.headquartersAddress}</strong></p>
                <p>Email liên hệ: <strong className="text-white">{enterprise.email}</strong></p>
              </div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-center border border-white/20">
              <p className="text-xs uppercase font-semibold text-slate-300">Tổng quỹ đất dự án</p>
              <p className="text-2xl font-extrabold text-gold-400 mt-0.5">
                {(totalArea / 10000).toFixed(2)} ha
              </p>
              <p className="text-[11px] text-slate-300">{totalArea.toLocaleString('vi-VN')} m²</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thống kê & Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('PARCELS')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'PARCELS'
              ? 'border-primary-800 text-primary-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Danh Mục Thửa Đất Dự Án ({enterprise.projectParcels.length})
        </button>
        <button
          onClick={() => setActiveTab('STAFF')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'STAFF'
              ? 'border-primary-800 text-primary-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Phân Quyền Nhân Sự Phụ Trách ({enterprise.staffMembers.length})
        </button>
      </div>

      {/* Tab 1: Danh mục Thửa đất dự án */}
      {activeTab === 'PARCELS' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Danh Mục Thửa Đất Dự Án Đang Giao / Thuê</CardTitle>
                <CardDescription>
                  Dữ liệu đồng bộ trực tiếp từ Hệ thống Cơ sở dữ liệu Đất đai Quốc gia VN-2000
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-sm text-slate-800">
                <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Mã thửa quốc gia</th>
                    <th className="px-4 py-3">Tên dự án</th>
                    <th className="px-4 py-3">Vị trí địa giới</th>
                    <th className="px-4 py-3 text-right">Diện tích</th>
                    <th className="px-4 py-3">Căn cứ pháp lý & Thời hạn</th>
                    <th className="px-4 py-3 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {enterprise.projectParcels.map(parcel => (
                    <tr key={parcel.parcelId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-950">
                        {parcel.nationalCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-950">{parcel.projectName}</div>
                        <div className="text-xs text-slate-700">Mục đích: <span className="font-semibold">{parcel.purposeCode}</span></div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-800">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {parcel.location}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-950">
                        {parcel.areaM2.toLocaleString('vi-VN')} m²
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-800">
                        <div className="font-semibold text-slate-900">{parcel.landAllocationDecision}</div>
                        <div className="text-slate-600 mt-0.5">{parcel.landUseTerm}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="success">
                          {parcel.status === 'ALLOCATED' ? 'Đã giao đất' : 'Đang thuê đất'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Phân quyền nhân viên */}
      {activeTab === 'STAFF' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Danh Sách Nhân Sự Được Ủy Quyền Xử Lý Hồ Sơ</CardTitle>
                <CardDescription>
                  Cấp quyền truy cập cho nhân viên pháp chế, kế toán phụ trách từng thủ tục đất đai dự án
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddStaffModalOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Phân Quyền Nhân Viên
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-sm text-slate-800">
                <thead className="bg-slate-100 text-xs uppercase font-bold text-slate-900 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Họ và tên</th>
                    <th className="px-4 py-3">CCCD & Liên hệ</th>
                    <th className="px-4 py-3">Phòng ban & Chức vụ</th>
                    <th className="px-4 py-3">Quyền hạn được giao</th>
                    <th className="px-4 py-3">Ngày phân quyền</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {enterprise.staffMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8">
                        <EmptyState
                          title="Chưa có nhân viên nào được phân quyền"
                          description="Người đại diện theo pháp luật có thể phân quyền cho nhân viên phụ trách hồ sơ dự án"
                        />
                      </td>
                    </tr>
                  ) : (
                    enterprise.staffMembers.map(staff => (
                      <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-extrabold text-slate-950">
                          {staff.fullName}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-mono font-bold text-slate-900">{staff.citizenId}</div>
                          <div className="text-slate-600 mt-0.5">{staff.email}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-semibold text-slate-900">{staff.position}</div>
                          <div className="text-slate-600">{staff.department}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {staff.permissions.map(p => (
                              <React.Fragment key={p}>
                                {renderPermissionBadge(p)}
                              </React.Fragment>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {staff.assignedAt}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveStaff(staff.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Thu hồi quyền
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
      )}

      {/* Modal Phân Quyền Nhân Viên */}
      <Modal
        isOpen={isAddStaffModalOpen}
        onClose={() => !isSavingStaff && setIsAddStaffModalOpen(false)}
        title="Phân Quyền Nhân Sự Phụ Trách Hồ Sơ Đất Đai Dự Án"
        description="Chỉ định quyền hạn cụ thể cho cán bộ nhân viên đại diện doanh nghiệp nộp và xử lý hồ sơ trực tuyến"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddStaffModalOpen(false)}
              disabled={isSavingStaff}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleAddStaff}
              isLoading={isSavingStaff}
            >
              Xác nhận phân quyền
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Họ và tên nhân viên"
              placeholder="VD: Ngô Quốc Bảo"
              value={staffFullName}
              onChange={e => setStaffFullName(e.target.value)}
              required
            />
            <Input
              label="Số CCCD nhân viên (12 số)"
              placeholder="VD: 001099000777"
              value={staffCitizenId}
              onChange={e => setStaffCitizenId(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Địa chỉ email công vụ"
              placeholder="VD: bao.nq@thudoland.vn"
              value={staffEmail}
              onChange={e => setStaffEmail(e.target.value)}
              required
            />
            <Input
              label="Số điện thoại"
              placeholder="VD: 0988776655"
              value={staffPhone}
              onChange={e => setStaffPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phòng ban"
              placeholder="VD: Ban Pháp chế & Đầu tư"
              value={staffDept}
              onChange={e => setStaffDept(e.target.value)}
              required
            />
            <Input
              label="Chức danh"
              placeholder="VD: Chuyên viên Pháp chế"
              value={staffPos}
              onChange={e => setStaffPos(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
            <p className="text-xs font-bold uppercase text-slate-700">Các quyền hạn được cấp phép</p>
            <div className="space-y-2">
              {[
                { perm: EnterpriseStaffPermission.SUBMIT_DOSSIER, label: 'Nộp hồ sơ thủ tục đất đai dự án (Giao/thuê đất, chuyển mục đích)' },
                { perm: EnterpriseStaffPermission.VIEW_PARCELS, label: 'Tra cứu CSDL thửa đất dự án và Giấy chứng nhận điện tử' },
                { perm: EnterpriseStaffPermission.SUPPLEMENT_DOCS, label: 'Bổ sung hồ sơ tài liệu theo yêu cầu của cơ quan quản lý' },
                { perm: EnterpriseStaffPermission.MANAGE_PAYMENTS, label: 'Quản lý nghĩa vụ tài chính và nộp thuế/tiền thuê đất trực tuyến' },
              ].map(item => (
                <label key={item.perm} className="flex items-center gap-2.5 text-xs text-slate-900 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(item.perm)}
                    onChange={() => handleTogglePermission(item.perm)}
                    className="w-4 h-4 text-primary-800 rounded border-slate-300 focus:ring-primary-700"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
