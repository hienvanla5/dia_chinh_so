'use client';

import React, { useState } from 'react';
import {
  FilePlus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Layers,
  FileText,
  ShieldCheck,
  Building2,
  Lock,
  QrCode,
  Hash,
  Compass,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LandPurposeCode, ParcelLegalStatus } from '@diachinhso/shared';

interface ParcelDisplay {
  id: string;
  nationalCode: string;
  communeCode: string;
  communeName: string;
  provinceCode: string;
  provinceName: string;
  sheetNumber: number;
  parcelNumber: number;
  area: number;
  purposeCode: string;
  purposeName: string;
  address: string;
  legalStatus: string;
  surveyDocumentNumber: string;
  ownerName?: string;
  ownerCitizenId?: string;
  auditHash: string;
  createdAt: string;
}

export default function ParcelsPage() {
  // Danh sách thửa đất mẫu ban đầu
  const [parcels, setParcels] = useState<ParcelDisplay[]>([
    {
      id: 'PARCEL-HN-001',
      nationalCode: '01001-0012-0045',
      communeCode: '01001',
      communeName: 'Phường Điện Biên',
      provinceCode: 'TINH_HN',
      provinceName: 'Thành phố Hà Nội',
      sheetNumber: 12,
      parcelNumber: 45,
      area: 125.8,
      purposeCode: 'ODT',
      purposeName: 'Đất ở tại đô thị',
      address: 'Số 15 Điện Biên Phủ, Phường Điện Biên',
      legalStatus: 'AVAILABLE',
      surveyDocumentNumber: 'TĐ-2026/012/VPĐK-HN',
      ownerName: 'Trần Văn Hoàng',
      ownerCitizenId: '001090123456',
      auditHash: 'a710296e8c4b92f7d1a5e30894b1592c68f1234567890abcdef1234567890abc1',
      createdAt: '2026-10-15T08:00:00.000Z',
    },
    {
      id: 'PARCEL-HN-002',
      nationalCode: '01001-0012-0046',
      communeCode: '01001',
      communeName: 'Phường Điện Biên',
      provinceCode: 'TINH_HN',
      provinceName: 'Thành phố Hà Nội',
      sheetNumber: 12,
      parcelNumber: 46,
      area: 98.4,
      purposeCode: 'ODT',
      purposeName: 'Đất ở tại đô thị',
      address: 'Số 17 Điện Biên Phủ, Phường Điện Biên',
      legalStatus: 'LOCKED',
      surveyDocumentNumber: 'TĐ-2026/013/VPĐK-HN',
      ownerName: 'Lê Thị Thu',
      ownerCitizenId: '001092654321',
      auditHash: 'b821397f9d5c03a8e2b6f2603d9a234567890bcdef1234567890abcdef123456',
      createdAt: '2026-10-16T09:30:00.000Z',
    },
    {
      id: 'PARCEL-HCM-001',
      nationalCode: '79001-0005-0018',
      communeCode: '79001',
      communeName: 'Phường Bến Nghé',
      provinceCode: 'TINH_HCM',
      provinceName: 'Thành phố Hồ Chí Minh',
      sheetNumber: 5,
      parcelNumber: 18,
      area: 250.0,
      purposeCode: 'TMD',
      purposeName: 'Đất thương mại, dịch vụ',
      address: 'Số 45 Lê Duẩn, Phường Bến Nghé',
      legalStatus: 'AVAILABLE',
      surveyDocumentNumber: 'TĐ-2026/088/VPĐK-HCM',
      ownerName: 'Tập đoàn Đầu tư Bất động sản Sài Gòn',
      ownerCitizenId: '079080001234',
      auditHash: 'c932408a0e6d14b9f3c7a3714e0b34567890cdef1234567890abcdef12345678',
      createdAt: '2026-10-18T14:15:00.000Z',
    },
  ]);

  // Bộ lọc
  const [filterCommune, setFilterCommune] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Trạng thái modal khai báo thửa mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<ParcelDisplay | null>(null);

  // Form fields khai báo
  const [formCommuneCode, setFormCommuneCode] = useState('01001');
  const [formProvinceCode, setFormProvinceCode] = useState('TINH_HN');
  const [formSheetNumber, setFormSheetNumber] = useState('15');
  const [formParcelNumber, setFormParcelNumber] = useState('88');
  const [formArea, setFormArea] = useState('142.5');
  const [formPurposeCode, setFormPurposeCode] = useState('ODT');
  const [formAddress, setFormAddress] = useState('Số 98 Hoàng Diệu, Phường Điện Biên');
  const [formSurveyDoc, setFormSurveyDoc] = useState('TĐ-2026/099/VPĐK-HN');
  const [formOwnerName, setFormOwnerName] = useState('Nguyễn Văn Minh');
  const [formOwnerCccd, setFormOwnerCccd] = useState('001095112233');
  const [formNotes, setFormNotes] = useState('Thửa đất mới trích đo địa chính theo quy chuẩn 2024');

  // Đỉnh tọa độ VN-2000
  const [p1x, setP1x] = useState('2325500.1');
  const [p1y, setP1y] = useState('589200.2');
  const [p2x, setP2x] = useState('2325515.5');
  const [p2y, setP2y] = useState('589215.8');
  const [p3x, setP3x] = useState('2325505.2');
  const [p3y, setP3y] = useState('589230.1');
  const [p4x, setP4x] = useState('2325490.0');
  const [p4y, setP4y] = useState('589214.5');

  // Trạng thái modal Công cụ Mã định danh quốc gia
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<'GENERATE' | 'VALIDATE'>('GENERATE');

  // State sinh mã
  const [genCommuneCode, setGenCommuneCode] = useState('01001');
  const [genSheetNumber, setGenSheetNumber] = useState('15');
  const [genParcelNumber, setGenParcelNumber] = useState('88');
  const [genBranchSuffix, setGenBranchSuffix] = useState('00');
  const [genCentroidX, setGenCentroidX] = useState('2325505');
  const [genCentroidY, setGenCentroidY] = useState('589215');
  const [generatedResult, setGeneratedResult] = useState<{
    nationalCode: string;
    shortCode: string;
    spatialUid: string;
    checksum: string;
    isUnique: boolean;
    qrPayload: string;
    auditHash: string;
  } | null>(null);

  // State kiểm tra mã
  const [valCodeInput, setValCodeInput] = useState('01001-0012-0045');
  const [valResult, setValResult] = useState<{
    isValid: boolean;
    isRegistered: boolean;
    commune?: string;
    sheet?: number;
    parcel?: number;
    branch?: string;
    message: string;
  } | null>(null);

  // Xử lý bộ lọc danh sách
  const filteredParcels = parcels.filter(p => {
    const matchCommune = filterCommune === 'ALL' || p.communeCode === filterCommune;
    const matchStatus = filterStatus === 'ALL' || p.legalStatus === filterStatus;
    const matchSearch =
      p.nationalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.ownerName && p.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(p.sheetNumber).includes(searchTerm) ||
      String(p.parcelNumber).includes(searchTerm);
    return matchCommune && matchStatus && matchSearch;
  });

  // Mở modal khai báo
  const handleOpenModal = () => {
    setErrorMessage(null);
    setSuccessResult(null);
    setIsModalOpen(true);
  };

  // Mở modal mã định danh
  const handleOpenCodeModal = () => {
    setIsCodeModalOpen(true);
  };

  // Xử lý sinh mã định danh
  const handleGenerateCode = () => {
    const s = parseInt(genSheetNumber, 10);
    const p = parseInt(genParcelNumber, 10);
    if (isNaN(s) || s <= 0 || isNaN(p) || p <= 0) {
      alert('Số tờ và số thửa phải là số nguyên dương lớn hơn 0');
      return;
    }

    const sheetStr4 = String(s).padStart(4, '0');
    const parcelStr5 = String(p).padStart(5, '0');
    const parcelStr4 = String(p).padStart(4, '0');
    const branch = genBranchSuffix || '00';

    const nationalCode = `${genCommuneCode}-${sheetStr4}-${parcelStr5}-${branch}`;
    const shortCode = `${genCommuneCode}-${sheetStr4}-${parcelStr4}`;
    const cX = Math.round(parseFloat(genCentroidX) || 2325505);
    const cY = Math.round(parseFloat(genCentroidY) || 589215);
    const spatialUid = `VN-3405-${genCommuneCode}-X${cX}-Y${cY}`;

    const combinedDigits = `${genCommuneCode}${sheetStr4}${parcelStr4}`.replace(/\D/g, '');
    let sum = 0;
    for (let i = 0; i < combinedDigits.length; i++) {
      sum += parseInt(combinedDigits[i], 10) * ((i % 8) + 2);
    }
    const checksum = String(sum % 11);

    const isUnique = !parcels.some(
      item => item.nationalCode === nationalCode || item.nationalCode === shortCode
    );

    const qrPayload = `DCS:VN:${nationalCode}:${spatialUid}:CS${checksum}`;
    const mockHash = `sha256_${Date.now()}_${Math.random().toString(36).substring(2, 10)}b821397f9d5c03a8e2b6f26`;

    setGeneratedResult({
      nationalCode,
      shortCode,
      spatialUid,
      checksum,
      isUnique,
      qrPayload,
      auditHash: mockHash,
    });
  };

  // Xử lý thẩm tra mã định danh
  const handleValidateCode = () => {
    const clean = valCodeInput.trim();
    const regex = /^(?:(\d{2})-)?(\d{5})-(\d{4})-(\d{4,5})(?:-(\d{2}))?$/;
    const match = clean.match(regex);

    if (!match) {
      setValResult({
        isValid: false,
        isRegistered: false,
        message: 'Định dạng mã không đúng quy chuẩn quốc gia: [MãXã]-[SốTờ]-[SốThửa]',
      });
      return;
    }

    const [, , commune, sheet, parcel, branch] = match;
    const isRegistered = parcels.some(
      p => p.nationalCode === clean || p.nationalCode.startsWith(`${commune}-${sheet}-${parcel.padStart(4, '0')}`)
    );

    setValResult({
      isValid: true,
      isRegistered,
      commune,
      sheet: parseInt(sheet, 10),
      parcel: parseInt(parcel, 10),
      branch: branch || '00',
      message: isRegistered
        ? 'Mã định danh thửa đất hợp lệ và đã được xác lập trong CSDL Địa chính Quốc gia.'
        : 'Mã định danh thửa đất hợp lệ về cấu trúc nhưng chưa được đăng ký trong CSDL.',
    });
  };

  // Submit khai báo
  const handleDeclareSubmit = () => {
    setErrorMessage(null);

    const sheet = parseInt(formSheetNumber, 10);
    const parcelNum = parseInt(formParcelNumber, 10);
    const areaVal = parseFloat(formArea);

    if (isNaN(sheet) || sheet <= 0 || isNaN(parcelNum) || parcelNum <= 0) {
      setErrorMessage('Số tờ bản đồ và số thửa đất phải là số nguyên dương lớn hơn 0.');
      return;
    }

    if (isNaN(areaVal) || areaVal <= 0) {
      setErrorMessage('Diện tích thửa đất phải là số thực lớn hơn 0 m2.');
      return;
    }

    if (!formAddress.trim() || formAddress.length < 5) {
      setErrorMessage('Địa chỉ thửa đất phải có tối thiểu 5 ký tự.');
      return;
    }

    if (!formSurveyDoc.trim()) {
      setErrorMessage('Số hiệu hồ sơ đo đạc / trích đo địa chính không được để trống.');
      return;
    }

    const newNationalCode = `${formCommuneCode}-${String(sheet).padStart(4, '0')}-${String(parcelNum).padStart(4, '0')}`;
    const duplicate = parcels.some(
      p =>
        p.nationalCode === newNationalCode ||
        (p.communeCode === formCommuneCode && p.sheetNumber === sheet && p.parcelNumber === parcelNum),
    );

    if (duplicate) {
      setErrorMessage(
        `Xung đột định danh: Mã thửa đất '${newNationalCode}' (Tờ ${sheet}, Thửa ${parcelNum}) đã tồn tại trên địa bàn xã. Vui lòng kiểm tra lại hồ sơ gốc!`,
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const now = new Date().toISOString();
      const mockAuditHash = `sha256_${Date.now()}_${Math.random().toString(36).substring(2, 12)}4b1592c68f1234567890abcdef`;

      const purposeMap: Record<string, string> = {
        ODT: 'Đất ở tại đô thị',
        ONT: 'Đất ở tại nông thôn',
        TMD: 'Đất thương mại, dịch vụ',
        LUC: 'Đất chuyên trồng lúa nước',
        CLN: 'Đất trồng cây lâu năm',
        SKC: 'Đất cơ sở sản xuất phi nông nghiệp',
      };

      const newParcel: ParcelDisplay = {
        id: `PARCEL-HN-${String(parcels.length + 1).padStart(3, '0')}`,
        nationalCode: newNationalCode,
        communeCode: formCommuneCode,
        communeName: formCommuneCode === '01001' ? 'Phường Điện Biên' : 'Phường Cống Vị',
        provinceCode: formProvinceCode,
        provinceName: 'Thành phố Hà Nội',
        sheetNumber: sheet,
        parcelNumber: parcelNum,
        area: areaVal,
        purposeCode: formPurposeCode,
        purposeName: purposeMap[formPurposeCode] || 'Đất sử dụng hợp pháp',
        address: formAddress,
        legalStatus: 'PENDING_APPRAISAL',
        surveyDocumentNumber: formSurveyDoc,
        ownerName: formOwnerName || undefined,
        ownerCitizenId: formOwnerCccd || undefined,
        auditHash: mockAuditHash,
        createdAt: now,
      };

      setParcels(prev => [newParcel, ...prev]);
      setSuccessResult(newParcel);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khai báo & Quản lý Thuộc tính Thửa đất"
        description="Tạo lập cơ sở dữ liệu thửa đất mới hình thành và theo dõi hồ sơ thẩm định địa chính"
      />

      {/* 4 Thẻ KPI chỉ số */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tổng số thửa quản lý
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{parcels.length}</h3>
            </div>
            <div className="p-2.5 bg-primary-50 rounded-lg text-primary-800">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Dữ liệu địa chính đồng bộ</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Chờ VPĐKĐĐ thẩm định
              </p>
              <h3 className="text-2xl font-extrabold text-amber-700 mt-1">
                {parcels.filter(p => p.legalStatus === 'PENDING_APPRAISAL').length}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg text-amber-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">Hồ sơ mới khai báo</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sẵn sàng giao dịch
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-700 mt-1">
                {parcels.filter(p => p.legalStatus === 'AVAILABLE').length}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2">Đã được phê duyệt pháp lý</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Đang khóa / Tranh chấp
              </p>
              <h3 className="text-2xl font-extrabold text-rose-700 mt-1">
                {parcels.filter(p => p.legalStatus === 'LOCKED' || p.legalStatus === 'DISPUTED').length}
              </h3>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-rose-600 mt-2">Đang có phiên khóa công chứng/thế chấp</p>
        </Card>
      </div>

      {/* Thanh công cụ tìm kiếm, lọc và CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-3.5 rounded-lg border border-slate-200">
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto items-center">
          <div className="w-48">
            <Select
              value={filterCommune}
              onChange={e => setFilterCommune(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tất cả xã/phường' },
                { value: '01001', label: 'Phường Điện Biên (Hà Nội)' },
                { value: '79001', label: 'Phường Bến Nghé (TP.HCM)' },
              ]}
            />
          </div>

          <div className="w-48">
            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'AVAILABLE', label: 'Bình thường (Sẵn sàng)' },
                { value: 'PENDING_APPRAISAL', label: 'Chờ VPĐKĐĐ thẩm định' },
                { value: 'LOCKED', label: 'Đang khóa giao dịch' },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <div className="w-full sm:w-56">
            <Input
              placeholder="Tìm theo mã thửa, địa chỉ, chủ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleOpenCodeModal}>
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Mã định danh quốc gia
          </Button>
          <Button variant="primary" onClick={handleOpenModal}>
            <FilePlus className="w-4 h-4 mr-1.5" />
            Khai báo thửa mới
          </Button>
        </div>
      </div>

      {/* Bảng danh sách thửa đất */}
      {filteredParcels.length === 0 ? (
        <EmptyState
          title="Không tìm thấy thửa đất nào"
          description="Không có bản ghi thửa đất nào khớp với bộ lọc hoặc từ khóa tìm kiếm đã chọn."
        />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold">
              <tr>
                <th className="px-3.5 py-3 text-left">Mã thửa quốc gia</th>
                <th className="px-3.5 py-3 text-left">Số tờ / Số thửa</th>
                <th className="px-3.5 py-3 text-left">Diện tích</th>
                <th className="px-3.5 py-3 text-left">Loại đất (Mục đích)</th>
                <th className="px-3.5 py-3 text-left">Địa chỉ thửa đất</th>
                <th className="px-3.5 py-3 text-left">Chủ sử dụng đất</th>
                <th className="px-3.5 py-3 text-left">Trạng thái pháp lý</th>
                <th className="px-3.5 py-3 text-left">Mã băm kiểm toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredParcels.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2.5 font-bold font-mono text-primary-950 whitespace-nowrap">
                    {p.nationalCode}
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">Tờ {p.sheetNumber}</span> / Thửa {p.parcelNumber}
                  </td>
                  <td className="px-3.5 py-2.5 font-bold text-slate-950 whitespace-nowrap">
                    {p.area.toLocaleString('vi-VN')} m²
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded bg-slate-100 text-slate-800 mr-1.5 font-mono">
                      {p.purposeCode}
                    </span>
                    <span className="text-xs text-slate-700">{p.purposeName}</span>
                  </td>
                  <td className="px-3.5 py-2.5 text-xs text-slate-700 max-w-xs truncate" title={p.address}>
                    {p.address}
                  </td>
                  <td className="px-3.5 py-2.5 text-xs">
                    {p.ownerName ? (
                      <div>
                        <div className="font-semibold text-slate-900">{p.ownerName}</div>
                        {p.ownerCitizenId && <div className="text-slate-500 font-mono">{p.ownerCitizenId}</div>}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa xác lập chủ</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    {p.legalStatus === 'AVAILABLE' && <Badge variant="success">Sẵn sàng giao dịch</Badge>}
                    {p.legalStatus === 'PENDING_APPRAISAL' && (
                      <Badge variant="warning">Chờ VPĐKĐĐ thẩm định</Badge>
                    )}
                    {p.legalStatus === 'LOCKED' && <Badge variant="danger">Đang khóa giao dịch</Badge>}
                    {p.legalStatus === 'DISPUTED' && <Badge variant="danger">Tranh chấp ranh giới</Badge>}
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-600 max-w-xs truncate" title={p.auditHash}>
                    {p.auditHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Công cụ Mã định danh quốc gia (DCS-02-CN-002) */}
      {isCodeModalOpen && (
        <Modal
          isOpen={isCodeModalOpen}
          onClose={() => setIsCodeModalOpen(false)}
          title="Công cụ Mã định danh Thửa đất Quốc gia"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  codeTab === 'GENERATE'
                    ? 'border-primary-800 text-primary-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
                onClick={() => setCodeTab('GENERATE')}
              >
                Sinh mã định danh tự động
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                  codeTab === 'VALIDATE'
                    ? 'border-primary-800 text-primary-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
                onClick={() => setCodeTab('VALIDATE')}
              >
                Thẩm tra & Đối soát mã
              </button>
            </div>

            {codeTab === 'GENERATE' ? (
              <div className="space-y-3.5 pt-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hệ thống tự động sinh Mã định danh quốc gia duy nhất dựa trên mã hành chính, số tờ, số thửa và tọa độ không gian địa lý.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mã đơn vị hành chính xã:</label>
                    <Input
                      value={genCommuneCode}
                      onChange={e => setGenCommuneCode(e.target.value)}
                      placeholder="01001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số tờ bản đồ:</label>
                    <Input
                      type="number"
                      value={genSheetNumber}
                      onChange={e => setGenSheetNumber(e.target.value)}
                      placeholder="15"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số thửa đất:</label>
                    <Input
                      type="number"
                      value={genParcelNumber}
                      onChange={e => setGenParcelNumber(e.target.value)}
                      placeholder="88"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hậu tố phân nhánh:</label>
                    <Input
                      value={genBranchSuffix}
                      onChange={e => setGenBranchSuffix(e.target.value)}
                      placeholder="00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tọa độ tâm X (Bắc VN-2000):</label>
                    <Input
                      value={genCentroidX}
                      onChange={e => setGenCentroidX(e.target.value)}
                      placeholder="2325505"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tọa độ tâm Y (Đông VN-2000):</label>
                    <Input
                      value={genCentroidY}
                      onChange={e => setGenCentroidY(e.target.value)}
                      placeholder="589215"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="primary" size="sm" onClick={handleGenerateCode}>
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Thực hiện sinh mã định danh
                  </Button>
                </div>

                {generatedResult && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Kết quả sinh mã định danh:</span>
                      {generatedResult.isUnique ? (
                        <Badge variant="success">Duy nhất toàn quốc</Badge>
                      ) : (
                        <Badge variant="danger">Đã tồn tại trong CSDL</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Mã định danh chuẩn mở rộng:</span>
                        <span className="font-mono font-extrabold text-base text-primary-950">
                          {generatedResult.nationalCode}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Mã định danh rút gọn:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {generatedResult.shortCode}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Mã định danh không gian địa lý:</span>
                        <span className="font-mono font-bold text-emerald-800">
                          {generatedResult.spatialUid}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Mã kiểm tra Mod-11:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {generatedResult.checksum}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Dữ liệu mã QR xác thực:</span>
                        <span className="font-mono text-[11px] text-slate-700 break-all">
                          {generatedResult.qrPayload}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Mã băm kiểm toán SHA-256:</span>
                        <span className="font-mono text-[11px] text-slate-600 break-all">
                          {generatedResult.auditHash}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3.5 pt-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nhập mã định danh thửa đất để thẩm tra tính chuẩn hóa cấu trúc và kiểm tra sự tồn tại trong CSDL Đất đai Quốc gia.
                </p>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={valCodeInput}
                      onChange={e => setValCodeInput(e.target.value)}
                      placeholder="Ví dụ: 01001-0012-0045"
                    />
                  </div>
                  <Button variant="primary" size="sm" onClick={handleValidateCode}>
                    <Search className="w-4 h-4 mr-1.5" />
                    Thẩm tra
                  </Button>
                </div>

                {valResult && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Kết quả thẩm tra:</span>
                      {valResult.isValid ? (
                        <Badge variant="success">Cấu trúc hợp chuẩn</Badge>
                      ) : (
                        <Badge variant="danger">Cấu trúc không hợp chuẩn</Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-800 font-medium">{valResult.message}</p>

                    {valResult.isValid && (
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded border border-slate-200">
                        <div>
                          <span className="text-slate-500 block">Mã đơn vị xã:</span>
                          <span className="font-bold text-slate-900">{valResult.commune}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Số tờ / Số thửa:</span>
                          <span className="font-bold text-slate-900">
                            Tờ {valResult.sheet}, Thửa {valResult.parcel}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Hậu tố phân nhánh:</span>
                          <span className="font-bold text-slate-900">{valResult.branch}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Trạng thái CSDL:</span>
                          {valResult.isRegistered ? (
                            <span className="font-bold text-emerald-700">Đã đăng ký trong CSDL</span>
                          ) : (
                            <span className="font-bold text-amber-700">Chưa ghi nhận</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsCodeModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Khai báo thuộc tính thửa đất mới */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Khai báo thông tin thuộc tính thửa đất mới"
        >
          {successResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Khai báo thửa đất mới thành công!</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Hồ sơ thuộc tính thửa đất đã được tiếp nhận và lưu ở trạng thái{' '}
                  <strong className="text-emerald-900">Chờ thẩm định tại Chi nhánh Văn phòng Đăng ký Đất đai</strong> theo đúng quy định.
                </p>
                <div className="bg-white p-3 rounded border border-emerald-200 text-xs space-y-1 mt-2">
                  <p><strong>Mã định danh quốc gia:</strong> <span className="font-mono text-primary-900 font-bold">{successResult.nationalCode}</span></p>
                  <p><strong>Số tờ / Số thửa:</strong> Tờ {successResult.sheetNumber}, Thửa {successResult.parcelNumber}</p>
                  <p><strong>Diện tích:</strong> {successResult.area} m² ({successResult.purposeName})</p>
                  <p><strong>Địa chỉ:</strong> {successResult.address}</p>
                  <p className="font-mono text-[11px] truncate"><strong>Mã băm kiểm toán:</strong> {successResult.auditHash}</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Hoàn tất & Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị hành chính cấp xã:</label>
                  <Select
                    value={formCommuneCode}
                    onChange={e => setFormCommuneCode(e.target.value)}
                    options={[
                      { value: '01001', label: 'Phường Điện Biên (Thành phố Hà Nội)' },
                      { value: '01002', label: 'Phường Cống Vị (Thành phố Hà Nội)' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mục đích sử dụng đất (Luật Đất đai 2024):</label>
                  <Select
                    value={formPurposeCode}
                    onChange={e => setFormPurposeCode(e.target.value)}
                    options={[
                      { value: 'ODT', label: 'ODT - Đất ở tại đô thị' },
                      { value: 'ONT', label: 'ONT - Đất ở tại nông thôn' },
                      { value: 'TMD', label: 'TMD - Đất thương mại, dịch vụ' },
                      { value: 'LUC', label: 'LUC - Đất chuyên trồng lúa nước' },
                      { value: 'CLN', label: 'CLN - Đất trồng cây lâu năm' },
                      { value: 'SKC', label: 'SKC - Đất sản xuất phi nông nghiệp' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số tờ bản đồ địa chính:</label>
                  <Input
                    type="number"
                    value={formSheetNumber}
                    onChange={e => setFormSheetNumber(e.target.value)}
                    placeholder="Ví dụ: 15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số thứ tự thửa đất:</label>
                  <Input
                    type="number"
                    value={formParcelNumber}
                    onChange={e => setFormParcelNumber(e.target.value)}
                    placeholder="Ví dụ: 88"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diện tích thửa đất (m²):</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formArea}
                    onChange={e => setFormArea(e.target.value)}
                    placeholder="Ví dụ: 142.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số hiệu văn bản đo đạc / trích đo:</label>
                  <Input
                    value={formSurveyDoc}
                    onChange={e => setFormSurveyDoc(e.target.value)}
                    placeholder="Ví dụ: TĐ-2026/099/VPĐK-HN"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ chi tiết thửa đất:</label>
                <Input
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  placeholder="Số nhà, ngõ/đường, khu phố/thôn xóm..."
                />
              </div>

              {/* Tọa độ VN-2000 */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Tọa độ đỉnh ranh giới thửa đất (Hệ VN-2000):</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-600 block">Đỉnh 1 (X - Bắc, Y - Đông):</label>
                    <div className="flex gap-1.5">
                      <Input value={p1x} onChange={e => setP1x(e.target.value)} placeholder="X" />
                      <Input value={p1y} onChange={e => setP1y(e.target.value)} placeholder="Y" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block">Đỉnh 2 (X - Bắc, Y - Đông):</label>
                    <div className="flex gap-1.5">
                      <Input value={p2x} onChange={e => setP2x(e.target.value)} placeholder="X" />
                      <Input value={p2y} onChange={e => setP2y(e.target.value)} placeholder="Y" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block">Đỉnh 3 (X - Bắc, Y - Đông):</label>
                    <div className="flex gap-1.5">
                      <Input value={p3x} onChange={e => setP3x(e.target.value)} placeholder="X" />
                      <Input value={p3y} onChange={e => setP3y(e.target.value)} placeholder="Y" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block">Đỉnh 4 (X - Bắc, Y - Đông):</label>
                    <div className="flex gap-1.5">
                      <Input value={p4x} onChange={e => setP4x(e.target.value)} placeholder="X" />
                      <Input value={p4y} onChange={e => setP4y(e.target.value)} placeholder="Y" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chủ sử dụng đất sơ bộ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên chủ sử dụng đất (nếu có):</label>
                  <Input
                    value={formOwnerName}
                    onChange={e => setFormOwnerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số CCCD chủ sử dụng đất (12 số):</label>
                  <Input
                    value={formOwnerCccd}
                    onChange={e => setFormOwnerCccd(e.target.value)}
                    placeholder="001095112233"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </Button>
                <Button variant="primary" size="sm" onClick={handleDeclareSubmit} isLoading={isSubmitting}>
                  Xác nhận khai báo
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
