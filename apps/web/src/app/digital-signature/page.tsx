'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  UserRole,
  DossierStatus,
  FluctuationType,
  DigitalSignatureProvider,
  OcspCertificateStatus,
  PublicOfficerCertificate,
  PendingDossierForSigning,
} from '@diachinhso/shared';
import {
  FileCheck,
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Stamp,
  Fingerprint,
  HardDrive,
  CloudLightning,
  ExternalLink,
} from 'lucide-react';

// Dữ liệu chứng thư số mẫu
const MOCK_CERTIFICATES: PublicOfficerCertificate[] = [
  {
    serialNumber: 'GOV-CA-VPDKDD-001',
    subjectName: 'Nguyễn Văn An',
    subjectTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
    organization: 'Văn phòng Đăng ký Đất đai - Sở Tài nguyên và Môi trường',
    provider: DigitalSignatureProvider.GOVERNMENT_CA,
    issuer: 'Ban Cơ yếu Chính phủ - Cục Chứng thực số và Bảo mật thông tin',
    validFrom: '2024-01-01',
    validTo: '2027-12-31',
    ocspStatus: OcspCertificateStatus.VALID,
    isDefault: true,
  },
  {
    serialNumber: 'VNPT-SMARTCA-VPDKDD-002',
    subjectName: 'Trần Thị Mai',
    subjectTitle: 'Phó Giám đốc Văn phòng Đăng ký Đất đai',
    organization: 'Văn phòng Đăng ký Đất đai',
    provider: DigitalSignatureProvider.VNPT_SMARTCA,
    issuer: 'Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT-CA)',
    validFrom: '2024-06-01',
    validTo: '2026-06-01',
    ocspStatus: OcspCertificateStatus.VALID,
    isDefault: false,
  },
  {
    serialNumber: 'VIETTEL-CA-VPDKDD-003',
    subjectName: 'Lê Hoàng Nam',
    subjectTitle: 'Trưởng phòng Đăng ký và Cấp GCN',
    organization: 'Văn phòng Đăng ký Đất đai',
    provider: DigitalSignatureProvider.VIETTEL_CA,
    issuer: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel-CA)',
    validFrom: '2024-03-15',
    validTo: '2026-03-15',
    ocspStatus: OcspCertificateStatus.VALID,
    isDefault: false,
  },
  {
    serialNumber: 'USB-TOKEN-VPDKDD-005',
    subjectName: 'Nguyễn Văn An',
    subjectTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
    organization: 'Thiết bị mật mã USB Token chuyên dùng PKCS#11',
    provider: DigitalSignatureProvider.USB_TOKEN,
    issuer: 'Ban Cơ yếu Chính phủ',
    validFrom: '2024-01-01',
    validTo: '2027-12-31',
    ocspStatus: OcspCertificateStatus.VALID,
    isDefault: false,
  },
  {
    serialNumber: 'GOV-CA-REVOKED-009',
    subjectName: 'Phạm Đức Thắng (Đã chuyển công tác)',
    subjectTitle: 'Nguyên Phó Giám đốc VP ĐKĐĐ',
    organization: 'Văn phòng Đăng ký Đất đai',
    provider: DigitalSignatureProvider.GOVERNMENT_CA,
    issuer: 'Ban Cơ yếu Chính phủ',
    validFrom: '2023-01-01',
    validTo: '2025-01-01',
    ocspStatus: OcspCertificateStatus.REVOKED,
    isDefault: false,
  },
  {
    serialNumber: 'GOV-CA-EXPIRED-010',
    subjectName: 'Hoàng Minh Tuấn',
    subjectTitle: 'Nguyên Giám đốc VP ĐKĐĐ',
    organization: 'Văn phòng Đăng ký Đất đai',
    provider: DigitalSignatureProvider.GOVERNMENT_CA,
    issuer: 'Ban Cơ yếu Chính phủ',
    validFrom: '2021-01-01',
    validTo: '2023-12-31',
    ocspStatus: OcspCertificateStatus.EXPIRED,
    isDefault: false,
  },
];

// Dữ liệu hồ sơ địa chính mẫu
const INITIAL_DOSSIERS: PendingDossierForSigning[] = [
  {
    id: 'DOSSIER-2026-HN-001',
    dossierCode: 'HS-2026-001-HN',
    parcelId: 'PARCEL-HN-001',
    parcelNationalCode: '01001-0012-0045',
    applicantName: 'Trần Văn Hoàng',
    applicantCitizenId: '001090123456',
    fluctuationType: FluctuationType.TRANSFER,
    status: DossierStatus.APPRAISED,
    submittedAt: '2026-10-20 08:30',
    communeName: 'Phường Điện Biên',
    provinceName: 'Thành phố Hà Nội',
    isParcelLocked: false,
  },
  {
    id: 'DOSSIER-2026-HCM-002',
    dossierCode: 'HS-2026-002-HCM',
    parcelId: 'PARCEL-HCM-002',
    parcelNationalCode: '79001-0005-0118',
    applicantName: 'Lê Thị Thu',
    applicantCitizenId: '079192000001',
    fluctuationType: FluctuationType.DONATION,
    status: DossierStatus.APPRAISED,
    submittedAt: '2026-10-21 09:15',
    communeName: 'Phường Bến Nghé',
    provinceName: 'Thành phố Hồ Chí Minh',
    isParcelLocked: false,
  },
  {
    id: 'DOSSIER-2026-DN-003',
    dossierCode: 'HS-2026-003-DN',
    parcelId: 'PARCEL-DN-003',
    parcelNationalCode: '48001-0008-0092',
    applicantName: 'Nguyễn Quốc Cường',
    applicantCitizenId: '048085002233',
    fluctuationType: FluctuationType.INHERITANCE,
    status: DossierStatus.APPRAISED,
    submittedAt: '2026-10-21 14:00',
    communeName: 'Phường Hải Châu 1',
    provinceName: 'Thành phố Đà Nẵng',
    isParcelLocked: true, // Thửa đất có tranh chấp
  },
  {
    id: 'DOSSIER-2026-HP-004',
    dossierCode: 'HS-2026-004-HP',
    parcelId: 'PARCEL-HP-004',
    parcelNationalCode: '31001-0010-0077',
    applicantName: 'Vũ Thị Minh',
    applicantCitizenId: '031190001122',
    fluctuationType: FluctuationType.MORTGAGE,
    status: DossierStatus.APPRAISED,
    submittedAt: '2026-10-22 08:00',
    communeName: 'Phường Minh Khai',
    provinceName: 'Thành phố Hải Phòng',
    isParcelLocked: true, // Đang bị khóa 90 phút
  },
];

export default function DigitalSignaturePage() {
  const [dossiers, setDossiers] = useState<PendingDossierForSigning[]>(INITIAL_DOSSIERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SIGNED' | 'LOCKED'>('ALL');

  // Modal ký số state
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<PendingDossierForSigning | null>(null);
  const [selectedCertSerial, setSelectedCertSerial] = useState<string>('GOV-CA-VPDKDD-001');
  const [signingReason, setSigningReason] = useState('Phê duyệt hồ sơ địa chính và ban hành kết quả thủ tục hành chính');
  const [pinCode, setPinCode] = useState('123456');
  const [isSigning, setIsSigning] = useState(false);
  const [signingStep, setSigningStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal kết quả thành công state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [signedResult, setSignedResult] = useState<{
    dossierCode: string;
    signerName: string;
    signerTitle: string;
    certSerial: string;
    provider: string;
    timestamp: string;
    auditHash: string;
    signatureValue: string;
  } | null>(null);

  // Trạng thái xác minh chữ ký số
  const [verifyStatus, setVerifyStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

  const selectedCert = MOCK_CERTIFICATES.find((c) => c.serialNumber === selectedCertSerial);

  // Mở modal ký số
  const handleOpenSignModal = (dossier: PendingDossierForSigning) => {
    setSelectedDossier(dossier);
    setErrorMessage(null);
    setSigningStep(0);
    setIsSignModalOpen(true);
  };

  // Thực hiện ký số phê duyệt
  const handleExecuteSigning = async () => {
    if (!selectedDossier || !selectedCert) return;

    setErrorMessage(null);
    setIsSigning(true);
    setSigningStep(1); // Bước 1: Kiểm tra OCSP

    try {
      // Giả lập độ trễ kiểm tra trực tuyến OCSP
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Kiểm tra ràng buộc tình trạng thửa đất
      if (selectedDossier.isParcelLocked) {
        throw new Error(
          `Từ chối ký số: Thửa đất '${selectedDossier.parcelNationalCode}' đang trong tình trạng tranh chấp ranh giới hoặc bị khóa giao dịch thời gian thực (90 phút).`,
        );
      }

      // Kiểm tra trạng thái OCSP của chứng thư số
      if (selectedCert.ocspStatus === OcspCertificateStatus.REVOKED) {
        throw new Error(
          'Từ chối ký số: Chứng thư số công vụ đã bị thu hồi trực tuyến qua giao thức OCSP của Ban Cơ yếu Chính phủ.',
        );
      }
      if (selectedCert.ocspStatus === OcspCertificateStatus.EXPIRED) {
        throw new Error('Từ chối ký số: Chứng thư số công vụ đã hết hạn sử dụng.');
      }

      setSigningStep(2); // Bước 2: Ký mật mã PAdES
      await new Promise((resolve) => setTimeout(resolve, 600));

      setSigningStep(3); // Bước 3: Đóng dấu thời gian TSA
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSigningStep(4); // Bước 4: Lưu nhật ký kiểm toán SHA-256
      await new Promise((resolve) => setTimeout(resolve, 400));

      const now = new Date().toISOString();
      const mockAuditHash = 'e8c4b92f7d1a5e30894b1592c68f1234567890abcdef1234567890abcdef1234';
      const mockSignature = `SIG_PADES_RSA2048_${mockAuditHash.substring(0, 32)}`;

      // Cập nhật danh sách hồ sơ tại local state
      setDossiers((prev) =>
        prev.map((d) => (d.id === selectedDossier.id ? { ...d, status: DossierStatus.SIGNED } : d)),
      );

      setSignedResult({
        dossierCode: selectedDossier.dossierCode,
        signerName: selectedCert.subjectName,
        signerTitle: selectedCert.subjectTitle,
        certSerial: selectedCert.serialNumber,
        provider: selectedCert.issuer,
        timestamp: now,
        auditHash: mockAuditHash,
        signatureValue: mockSignature,
      });

      setIsSignModalOpen(false);
      setIsResultModalOpen(true);
      setVerifyStatus(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quá trình ký số gặp lỗi không xác định.');
    } finally {
      setIsSigning(false);
    }
  };

  // Xác minh chữ ký số trực tuyến
  const handleVerifySignature = () => {
    setVerifyStatus({
      tested: true,
      valid: true,
      message: 'Chữ ký số toàn vẹn, hợp pháp. Dấu thời gian TSA và chứng thực trực tuyến OCSP hợp lệ 100%.',
    });
  };

  // Lọc danh sách hồ sơ
  const filteredDossiers = dossiers.filter((d) => {
    const matchesSearch =
      d.dossierCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.applicantCitizenId.includes(searchTerm) ||
      d.parcelNationalCode.includes(searchTerm);

    if (!matchesSearch) return false;

    if (statusFilter === 'PENDING') return d.status === DossierStatus.APPRAISED && !d.isParcelLocked;
    if (statusFilter === 'SIGNED') return d.status === DossierStatus.SIGNED;
    if (statusFilter === 'LOCKED') return d.isParcelLocked;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner tiêu đề trang trang trọng */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading tracking-tight">
            Ký Số Chuyên Dùng Công Vụ & SmartCA
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Hệ thống ký số phê duyệt hồ sơ địa chính và cấp Giấy chứng nhận điện tử dành cho Văn phòng Đăng ký Đất đai
          </p>
        </div>

        {/* Khối thống kê chỉ số nghiệp vụ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Hồ sơ chờ ký duyệt</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950 font-heading">
                    {dossiers.filter((d) => d.status === DossierStatus.APPRAISED && !d.isParcelLocked).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-900 flex items-center justify-center">
                  <FileCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Đã ký số phê duyệt</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-600 font-heading">
                    {dossiers.filter((d) => d.status === DossierStatus.SIGNED).length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Stamp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Chứng thư số công vụ</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950 font-heading">4</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <KeyRound className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Kiểm tra OCSP & TSA</p>
                  <p className="mt-2 text-base font-extrabold text-emerald-600 font-heading flex items-center gap-1.5">
                    <CheckCircle2 className="h-5 w-5" /> Trực tuyến 100%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bảng Danh Sách Hồ Sơ Địa Chính */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-extrabold text-slate-950">
                  Danh Sách Hồ Sơ Chờ Phê Duyệt
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">
                  Hồ sơ dịch vụ công đã qua thẩm định của Văn phòng Đăng ký Đất đai, sẵn sàng ký số
                </CardDescription>
              </div>

              {/* Bộ lọc và tìm kiếm */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo mã hồ sơ, người nộp, CCCD..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
                >
                  <option value="ALL">Tất cả hồ sơ</option>
                  <option value="PENDING">Chờ ký duyệt</option>
                  <option value="SIGNED">Đã ký số</option>
                  <option value="LOCKED">Thửa đất bị khóa / Tranh chấp</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredDossiers.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="Không tìm thấy hồ sơ phù hợp"
                  description="Không có hồ sơ nào khớp với điều kiện tìm kiếm hiện tại."
                  action={{
                    label: 'Xóa bộ lọc',
                    onClick: () => { setSearchTerm(''); setStatusFilter('ALL'); },
                    variant: 'outline',
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <th className="py-3.5 px-4">Mã Hồ Sơ</th>
                      <th className="py-3.5 px-4">Thửa Đất & Địa Bàn</th>
                      <th className="py-3.5 px-4">Người Nộp & Loại Biến Động</th>
                      <th className="py-3.5 px-4">Tình Trạng Đất Đai</th>
                      <th className="py-3.5 px-4">Trạng Thái Hồ Sơ</th>
                      <th className="py-3.5 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredDossiers.map((dossier) => (
                      <tr key={dossier.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-950 font-heading">{dossier.dossierCode}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{dossier.submittedAt}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-900 font-heading">{dossier.parcelNationalCode}</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {dossier.communeName}, {dossier.provinceName}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{dossier.applicantName}</p>
                          <p className="text-xs text-slate-500 font-mono">CCCD: {dossier.applicantCitizenId}</p>
                          <div className="mt-1">
                            <Badge variant="neutral" size="sm">
                              {dossier.fluctuationType === FluctuationType.TRANSFER && 'Chuyển nhượng quyền sử dụng đất'}
                              {dossier.fluctuationType === FluctuationType.DONATION && 'Tặng cho quyền sử dụng đất'}
                              {dossier.fluctuationType === FluctuationType.INHERITANCE && 'Thừa kế quyền sử dụng đất'}
                              {dossier.fluctuationType === FluctuationType.MORTGAGE && 'Đăng ký thế chấp quyền sử dụng đất'}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {dossier.isParcelLocked ? (
                            <Badge variant="danger" size="sm" dot pulse icon={<Lock className="h-3 w-3" />}>
                              Khóa giao dịch / Tranh chấp
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm" dot icon={<CheckCircle2 className="h-3 w-3" />}>
                              Sẵn sàng giao dịch
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {dossier.status === DossierStatus.SIGNED ? (
                            <Badge variant="success" size="md" icon={<Stamp className="h-3.5 w-3.5" />}>
                              Đã ký số phê duyệt
                            </Badge>
                          ) : (
                            <Badge variant="primary" size="md" dot>
                              Chờ ký số phê duyệt
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {dossier.status === DossierStatus.SIGNED ? (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<ExternalLink className="h-3.5 w-3.5" />}
                              onClick={() => {
                                setSignedResult({
                                  dossierCode: dossier.dossierCode,
                                  signerName: 'Nguyễn Văn An',
                                  signerTitle: 'Giám đốc Văn phòng Đăng ký Đất đai',
                                  certSerial: 'GOV-CA-VPDKDD-001',
                                  provider: 'Ban Cơ yếu Chính phủ',
                                  timestamp: dossier.submittedAt,
                                  auditHash: 'e8c4b92f7d1a5e30894b1592c68f1234567890abcdef1234567890abcdef1234',
                                  signatureValue: 'SIG_PADES_RSA2048_e8c4b92f7d1a5e30894b1592c68f1234',
                                });
                                setIsResultModalOpen(true);
                                setVerifyStatus(null);
                              }}
                            >
                              Xem chứng nhận số
                            </Button>
                          ) : (
                            <Button
                              variant={dossier.isParcelLocked ? 'outline' : 'primary'}
                              size="sm"
                              leftIcon={<Stamp className="h-4 w-4" />}
                              onClick={() => handleOpenSignModal(dossier)}
                            >
                              Ký số phê duyệt
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
      </main>

      {/* MODAL KÝ SỐ PHÊ DUYỆT */}
      {isSignModalOpen && selectedDossier && (
        <Modal
          isOpen={isSignModalOpen}
          onClose={() => !isSigning && setIsSignModalOpen(false)}
          title="Ký Số Phê Duyệt Hồ Sơ Địa Chính"
          size="lg"
        >
          <div className="space-y-5">
            {/* Cảnh báo lỗi nếu có */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
                <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Không thể thực hiện ký số</p>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Thông tin hồ sơ được chọn */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Mã hồ sơ:</span>
                  <p className="font-extrabold text-slate-900 font-heading">{selectedDossier.dossierCode}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Mã thửa đất:</span>
                  <p className="font-extrabold text-slate-900 font-heading">{selectedDossier.parcelNationalCode}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Người nộp:</span>
                  <p className="font-semibold text-slate-800">{selectedDossier.applicantName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Tình trạng đất:</span>
                  <div>
                    {selectedDossier.isParcelLocked ? (
                      <Badge variant="danger" size="sm" dot>
                        Khóa giao dịch / Tranh chấp
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm" dot>
                        Hợp lệ để ký duyệt
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lựa chọn Chứng thư số */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Chọn Chứng Thư Số Chuyên Dùng / SmartCA:
              </label>
              <select
                value={selectedCertSerial}
                onChange={(e) => setSelectedCertSerial(e.target.value)}
                disabled={isSigning}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900 font-medium"
              >
                {MOCK_CERTIFICATES.map((cert) => (
                  <option key={cert.serialNumber} value={cert.serialNumber}>
                    {cert.subjectName} - {cert.subjectTitle} ({cert.provider})
                    {cert.ocspStatus === OcspCertificateStatus.REVOKED && ' [ĐÃ THU HỒI]'}
                    {cert.ocspStatus === OcspCertificateStatus.EXPIRED && ' [HẾT HẠN]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Chi tiết chứng thư & Kiểm tra trực tuyến OCSP */}
            {selectedCert && (
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CloudLightning className="h-4 w-4 text-primary-900" />
                    Trạng thái trực tuyến OCSP:
                  </span>
                  <div>
                    {selectedCert.ocspStatus === OcspCertificateStatus.VALID && (
                      <Badge variant="success" size="sm" dot icon={<CheckCircle2 className="h-3 w-3" />}>
                        Hợp lệ & Sẵn sàng ký số
                      </Badge>
                    )}
                    {selectedCert.ocspStatus === OcspCertificateStatus.REVOKED && (
                      <Badge variant="danger" size="sm" dot icon={<XCircle className="h-3 w-3" />}>
                        Đã bị thu hồi (Không thể ký)
                      </Badge>
                    )}
                    {selectedCert.ocspStatus === OcspCertificateStatus.EXPIRED && (
                      <Badge variant="warning" size="sm" dot icon={<Clock className="h-3 w-3" />}>
                        Đã hết hạn sử dụng
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">Cơ quan cấp chứng thực:</span>
                    <p className="font-medium text-slate-900">{selectedCert.issuer}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold">Thời hạn hiệu lực:</span>
                    <p className="font-medium text-slate-900">
                      {selectedCert.validFrom} đến {selectedCert.validTo}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lý do phê duyệt */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Nội dung / Lý do phê duyệt:
              </label>
              <input
                type="text"
                value={signingReason}
                onChange={(e) => setSigningReason(e.target.value)}
                disabled={isSigning}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
              />
            </div>

            {/* Mã PIN ký số bảo mật */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mã PIN bảo mật chữ ký số (SmartCA / USB Token):
              </label>
              <input
                type="password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                disabled={isSigning}
                placeholder="Nhập 6 chữ số..."
                maxLength={6}
                className="w-full max-w-[200px] px-3 py-2 text-sm font-mono tracking-widest rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
              />
            </div>

            {/* Thanh tiến trình ký số khi đang thực hiện */}
            {isSigning && (
              <div className="p-4 bg-primary-50/70 border border-primary-200/80 rounded-xl space-y-2">
                <p className="text-xs font-extrabold text-primary-950 uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary-900" />
                  Đang thực thi quy trình ký số bảo mật:
                </p>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p className={signingStep >= 1 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                    ✓ Bước 1: Kiểm tra trực tuyến danh sách thu hồi qua giao thức OCSP
                  </p>
                  <p className={signingStep >= 2 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                    ✓ Bước 2: Ký số mật mã theo chuẩn tài liệu PAdES (SHA-256 with RSA)
                  </p>
                  <p className={signingStep >= 3 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                    ✓ Bước 3: Đóng dấu thời gian TSA từ Cục Chứng thực số Ban Cơ yếu
                  </p>
                  <p className={signingStep >= 4 ? 'font-bold text-emerald-700' : 'text-slate-400'}>
                    ✓ Bước 4: Tạo mã băm kiểm toán bất biến SHA-256 lưu CSDL quốc gia
                  </p>
                </div>
              </div>
            )}

            {/* Nút hành động trong Modal */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" disabled={isSigning} onClick={() => setIsSignModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSigning}
                leftIcon={<Stamp className="h-4 w-4" />}
                onClick={handleExecuteSigning}
              >
                Xác nhận Ký số Phê duyệt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL KẾT QUẢ KÝ DUYỆT THÀNH CÔNG */}
      {isResultModalOpen && signedResult && (
        <Modal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          title="Kết Quả Phê Duyệt Văn Bản Điện Tử"
          size="lg"
        >
          <div className="space-y-5">
            {/* Con dấu số trang trọng */}
            <div className="p-6 bg-vnred-50/50 border-2 border-dashed border-vnred-300 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-vnred-500 text-white flex items-center justify-center shadow-md">
                <Stamp className="h-9 w-9" />
              </div>
              <h3 className="mt-3 text-lg font-extrabold text-vnred-600 font-heading tracking-wide uppercase">
                Văn Phòng Đăng Ký Đất Đai
              </h3>
              <p className="text-xs font-extrabold text-slate-800 tracking-wider uppercase mt-0.5">
                Đã Ký Số Phê Duyệt Điện Tử
              </p>
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p>
                  Người ký: <span className="font-bold text-slate-900">{signedResult.signerName}</span>
                </p>
                <p>
                  Chức vụ: <span className="font-semibold text-slate-900">{signedResult.signerTitle}</span>
                </p>
                <p>
                  Dấu thời gian TSA: <span className="font-mono text-slate-900">{signedResult.timestamp}</span>
                </p>
              </div>
            </div>

            {/* Bảng chi tiết mã băm kiểm toán */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase">Mã băm kiểm toán SHA-256:</span>
                <p className="font-mono text-slate-900 font-bold break-all bg-white p-2 rounded border border-slate-200 mt-1">
                  {signedResult.auditHash}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase">Số serial chứng thư số:</span>
                <p className="font-mono text-slate-900 font-semibold mt-0.5">{signedResult.certSerial}</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase">Nhà cung cấp chứng thực:</span>
                <p className="text-slate-900 font-medium mt-0.5">{signedResult.provider}</p>
              </div>
            </div>

            {/* Trạng thái xác minh */}
            {verifyStatus && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{verifyStatus.message}</span>
              </div>
            )}

            {/* Nút hành động */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
                onClick={handleVerifySignature}
              >
                Xác minh chữ ký số trực tuyến
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsResultModalOpen(false)}>
                Đóng thông báo
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
