'use client';

import React, { useState } from 'react';
import {
  FileText,
  Send,
  CheckCircle2,
  Clock,
  Upload,
  AlertCircle,
  FileCheck2,
  FolderOpen,
} from 'lucide-react';
import { FluctuationType, DossierStatus } from '@diachinhso/shared';
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
  DossierStatusBadge,
  EmptyState,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';

const initialDossiers = [
  {
    id: 'd-1',
    code: 'HS-2026-894120',
    parcelCode: 'HN-BA-DINH.012.0045',
    fluctuationType: FluctuationType.TRANSFER,
    applicant: 'Nguyễn Văn An',
    submittedAt: '18/10/2026',
    status: DossierStatus.APPRAISED,
    slaRemaining: '3 ngày',
  },
  {
    id: 'd-2',
    code: 'HS-2026-673194',
    parcelCode: 'HN-BA-DINH.012.0046',
    fluctuationType: FluctuationType.MORTGAGE,
    applicant: 'Trần Thị Mai',
    submittedAt: '19/10/2026',
    status: DossierStatus.COMMUNE_VERIFIED,
    slaRemaining: 'Trong ngày',
  },
];

const fluctuationTypeLabels: Record<FluctuationType, string> = {
  [FluctuationType.TRANSFER]: 'Chuyển nhượng quyền sử dụng đất',
  [FluctuationType.DONATION]: 'Tặng cho quyền sử dụng đất',
  [FluctuationType.INHERITANCE]: 'Thừa kế quyền sử dụng đất',
  [FluctuationType.SUBDIVISION]: 'Tách thửa đất',
  [FluctuationType.MERGE]: 'Hợp thửa đất',
  [FluctuationType.PURPOSE_CHANGE]: 'Chuyển mục đích sử dụng đất',
  [FluctuationType.MORTGAGE]: 'Đăng ký thế chấp bảo đảm',
  [FluctuationType.RELEASE_MORTGAGE]: 'Xóa đăng ký thế chấp (Giải chấp)',
};

export default function DossiersPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [dossiers, setDossiers] = useState(initialDossiers);
  const [parcelCode, setParcelCode] = useState('');
  const [fluctuationType, setFluctuationType] = useState<FluctuationType>(FluctuationType.TRANSFER);
  const [applicantName, setApplicantName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newDossier = {
        id: 'd-' + (dossiers.length + 1),
        code: `HS-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        parcelCode,
        fluctuationType,
        applicant: applicantName,
        submittedAt: new Date().toLocaleDateString('vi-VN'),
        status: DossierStatus.SUBMITTED,
        slaRemaining: '5 ngày',
      };
      setDossiers([newDossier, ...dossiers]);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setActiveTab('list');
        setParcelCode('');
        setApplicantName('');
        setCitizenId('');
        setPhoneNumber('');
      }, 1500);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cổng Dịch Vụ Công Biến Động Đất Đai"
        description="Nộp hồ sơ trực tuyến theo quy trình dịch vụ công toàn trình cấp độ 4 theo Luật Đất đai 2024, liên thông 4 bước giữa UBND Xã, VP Đăng ký đất đai và Cơ quan Thuế."
        badge={
          <Badge variant="primary" size="md">
            {dossiers.length} Hồ sơ đang xử lý
          </Badge>
        }
        breadcrumbs={[
          { label: 'Dịch vụ công', href: '/dossiers' },
          { label: 'Hồ sơ biến động' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'list' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('list')}
            >
              Danh sách Hồ sơ
            </Button>
            <ButtonCreate
              size="sm"
              onClick={() => setActiveTab('create')}
            >
              Nộp hồ sơ mới
            </ButtonCreate>
          </div>
        }
      />

      {activeTab === 'list' ? (
        dossiers.length === 0 ? (
          <EmptyState
            icon={
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50">
                <FolderOpen className="h-7 w-7 stroke-[1.5]" />
              </div>
            }
            title="Chưa có hồ sơ biến động nào được nộp"
            description="Bạn có thể nộp hồ sơ trực tuyến mới để thực hiện thủ tục chuyển nhượng, tặng cho, thừa kế hoặc thế chấp quyền sử dụng đất."
            action={{
              label: 'Nộp hồ sơ trực tuyến ngay',
              onClick: () => setActiveTab('create'),
              variant: 'create',
            }}
          />
        ) : (
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Mã hồ sơ</th>
                    <th className="p-4">Thửa đất liên quan</th>
                    <th className="p-4">Loại biến động</th>
                    <th className="p-4">Người nộp hồ sơ</th>
                    <th className="p-4">Ngày tiếp nhận</th>
                    <th className="p-4">Trạng thái xử lý</th>
                    <th className="p-4 text-right">Thời hạn SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dossiers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-blue-600">{item.code}</td>
                      <td className="p-4 font-mono font-semibold text-slate-800">
                        {item.parcelCode}
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {fluctuationTypeLabels[item.fluctuationType] || item.fluctuationType}
                      </td>
                      <td className="p-4 font-medium text-slate-900">{item.applicant}</td>
                      <td className="p-4 text-slate-500">{item.submittedAt}</td>
                      <td className="p-4">
                        <DossierStatusBadge status={item.status} />
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.slaRemaining}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <Card className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Nộp Hồ Sơ Biến Động Đất Đai Trực Tuyến</CardTitle>
              <CardDescription>
                Khai báo thông tin thửa đất và các bên liên quan để hệ thống tự động kiểm tra quy hoạch và khóa bảo lưu phiên giao dịch.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-3">
              {isSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Nộp hồ sơ thành công! Hồ sơ đã được đồng bộ trực tuyến lên CSDL Quốc gia.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Mã định danh thửa đất quốc gia"
                  required
                  value={parcelCode}
                  onChange={(e) => setParcelCode(e.target.value)}
                  placeholder="VD: HN-BA-DINH.012.0045"
                  helperText="Nhập mã 15 ký tự trên Giấy chứng nhận"
                />

                <Select
                  label="Loại biến động đất đai"
                  required
                  value={fluctuationType}
                  onChange={(e) => setFluctuationType(e.target.value as FluctuationType)}
                  options={[
                    { value: FluctuationType.TRANSFER, label: 'Chuyển nhượng quyền sử dụng đất' },
                    { value: FluctuationType.DONATION, label: 'Tặng cho quyền sử dụng đất' },
                    { value: FluctuationType.INHERITANCE, label: 'Thừa kế quyền sử dụng đất' },
                    { value: FluctuationType.SUBDIVISION, label: 'Tách thửa đất' },
                    { value: FluctuationType.MERGE, label: 'Hợp thửa đất' },
                    { value: FluctuationType.MORTGAGE, label: 'Đăng ký thế chấp bảo đảm tín dụng' },
                  ]}
                />

                <Input
                  label="Họ và tên người nộp hồ sơ"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                />

                <Input
                  label="Số CCCD định danh (12 chữ số)"
                  required
                  maxLength={12}
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  placeholder="001090012345"
                  helperText="Xác thực tự động qua Sandbox Cổng Dân cư"
                />

                <Input
                  label="Số điện thoại liên hệ"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0912345678"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 tracking-tight mb-1.5">
                    Tài liệu đính kèm (Hợp đồng, GCN)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center text-xs text-slate-500 hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer transition-colors">
                    <Upload className="h-4 w-4 mx-auto text-slate-400 mb-1" />
                    <span>Tải lên bản scan Hợp đồng / Giấy tờ pháp lý (PDF, JPG)</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 flex justify-between">
              <Button
                variant="outline"
                size="md"
                onClick={() => setActiveTab('list')}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Đang gửi hồ sơ..."
                leftIcon={<Send className="h-4 w-4" />}
              >
                Nộp hồ sơ trực tuyến
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
