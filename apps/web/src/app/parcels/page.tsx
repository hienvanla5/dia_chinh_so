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
  GitFork,
  Merge,
  History,
  Network,
  ArrowDown,
  ArrowRight,
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
  parentParcelId?: string;
  parentNationalCode?: string;
  mergedFromParcelIds?: string[];
  mergedFromNationalCodes?: string[];
  childParcelIds?: string[];
  isHistorical?: boolean;
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

  // Modal Khai báo thửa mới (DCS-02-CN-001)
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

  // Đỉnh VN-2000
  const [p1x, setP1x] = useState('2325500.1');
  const [p1y, setP1y] = useState('589200.2');
  const [p2x, setP2x] = useState('2325515.5');
  const [p2y, setP2y] = useState('589215.8');
  const [p3x, setP3x] = useState('2325505.2');
  const [p3y, setP3y] = useState('589230.1');
  const [p4x, setP4x] = useState('2325490.0');
  const [p4y, setP4y] = useState('589214.5');

  // Modal Công cụ Mã định danh quốc gia (DCS-02-CN-002)
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<'GENERATE' | 'VALIDATE'>('GENERATE');
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

  // Modal Tách thửa (DCS-02-CN-003)
  const [isSubdivideModalOpen, setIsSubdivideModalOpen] = useState(false);
  const [selectedParentParcel, setSelectedParentParcel] = useState<ParcelDisplay | null>(null);
  const [subDecisionNum, setSubDecisionNum] = useState('QĐ-TÁCH-2026/01/UBND');
  const [child1ParcelNum, setChild1ParcelNum] = useState('');
  const [child1Area, setChild1Area] = useState('');
  const [child1Owner, setChild1Owner] = useState('');
  const [child2ParcelNum, setChild2ParcelNum] = useState('');
  const [child2Area, setChild2Area] = useState('');
  const [child2Owner, setChild2Owner] = useState('');
  const [subError, setSubError] = useState<string | null>(null);

  // Modal Hợp thửa (DCS-02-CN-003)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [selectedMergeIds, setSelectedMergeIds] = useState<string[]>([]);
  const [mergeDecisionNum, setMergeDecisionNum] = useState('QĐ-HỢP-2026/02/UBND');
  const [mergeNewParcelNum, setMergeNewParcelNum] = useState('');
  const [mergeNewOwner, setMergeNewOwner] = useState('');
  const [mergeError, setMergeError] = useState<string | null>(null);

  // Modal Cây gia phả (DCS-02-CN-003)
  const [isLineageModalOpen, setIsLineageModalOpen] = useState(false);
  const [lineageParcel, setLineageParcel] = useState<ParcelDisplay | null>(null);

  // Lọc danh sách
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

  // Mở modal khai báo mới
  const handleOpenModal = () => {
    setErrorMessage(null);
    setSuccessResult(null);
    setIsModalOpen(true);
  };

  // Mở modal tách thửa
  const handleOpenSubdivide = (p: ParcelDisplay) => {
    setSelectedParentParcel(p);
    setSubDecisionNum(`QĐ-TÁCH-${new Date().getFullYear()}/0${parcels.length}/UBND`);
    setChild1ParcelNum(String(p.parcelNumber * 10 + 1));
    const half1 = (p.area / 2).toFixed(1);
    const half2 = (p.area - parseFloat(half1)).toFixed(1);
    setChild1Area(half1);
    setChild1Owner(p.ownerName || 'Chủ nhận thừa kế A');
    setChild2ParcelNum(String(p.parcelNumber * 10 + 2));
    setChild2Area(half2);
    setChild2Owner(p.ownerName ? `${p.ownerName} (Phần còn lại)` : 'Chủ nhận chuyển nhượng B');
    setSubError(null);
    setIsSubdivideModalOpen(true);
  };

  // Xác nhận tách thửa
  const handleConfirmSubdivide = () => {
    if (!selectedParentParcel) return;
    setSubError(null);

    const c1Num = parseInt(child1ParcelNum, 10);
    const c1A = parseFloat(child1Area);
    const c2Num = parseInt(child2ParcelNum, 10);
    const c2A = parseFloat(child2Area);

    if (isNaN(c1Num) || c1Num <= 0 || isNaN(c2Num) || c2Num <= 0) {
      setSubError('Số thửa đất con phải là số nguyên dương lớn hơn 0.');
      return;
    }

    if (c1Num === c2Num) {
      setSubError('Các thửa đất con mới hình thành không được trùng số thứ tự thửa.');
      return;
    }

    if (isNaN(c1A) || c1A < 30 || isNaN(c2A) || c2A < 30) {
      setSubError('Diện tích mỗi thửa đất mới hình thành phải đạt tối thiểu 30 m² theo quy định của UBND cấp tỉnh.');
      return;
    }

    const totalChildArea = c1A + c2A;
    if (Math.abs(totalChildArea - selectedParentParcel.area) > 0.5) {
      setSubError(
        `Tổng diện tích các thửa đất con (${totalChildArea} m²) không khớp với diện tích thửa đất gốc (${selectedParentParcel.area} m²).`
      );
      return;
    }

    const now = new Date().toISOString();
    const sheetStr = String(selectedParentParcel.sheetNumber).padStart(4, '0');

    const child1: ParcelDisplay = {
      id: `PARCEL-SUB-${Date.now()}-1`,
      nationalCode: `${selectedParentParcel.communeCode}-${sheetStr}-${String(c1Num).padStart(4, '0')}`,
      communeCode: selectedParentParcel.communeCode,
      communeName: selectedParentParcel.communeName,
      provinceCode: selectedParentParcel.provinceCode,
      provinceName: selectedParentParcel.provinceName,
      sheetNumber: selectedParentParcel.sheetNumber,
      parcelNumber: c1Num,
      area: c1A,
      purposeCode: selectedParentParcel.purposeCode,
      purposeName: selectedParentParcel.purposeName,
      address: `${selectedParentParcel.address} (Nhánh 1)`,
      legalStatus: 'AVAILABLE',
      surveyDocumentNumber: subDecisionNum,
      ownerName: child1Owner,
      auditHash: `sha256_${Date.now()}_child1_subdivision_audit`,
      createdAt: now,
      parentParcelId: selectedParentParcel.id,
      parentNationalCode: selectedParentParcel.nationalCode,
    };

    const child2: ParcelDisplay = {
      id: `PARCEL-SUB-${Date.now()}-2`,
      nationalCode: `${selectedParentParcel.communeCode}-${sheetStr}-${String(c2Num).padStart(4, '0')}`,
      communeCode: selectedParentParcel.communeCode,
      communeName: selectedParentParcel.communeName,
      provinceCode: selectedParentParcel.provinceCode,
      provinceName: selectedParentParcel.provinceName,
      sheetNumber: selectedParentParcel.sheetNumber,
      parcelNumber: c2Num,
      area: c2A,
      purposeCode: selectedParentParcel.purposeCode,
      purposeName: selectedParentParcel.purposeName,
      address: `${selectedParentParcel.address} (Nhánh 2)`,
      legalStatus: 'AVAILABLE',
      surveyDocumentNumber: subDecisionNum,
      ownerName: child2Owner,
      auditHash: `sha256_${Date.now()}_child2_subdivision_audit`,
      createdAt: now,
      parentParcelId: selectedParentParcel.id,
      parentNationalCode: selectedParentParcel.nationalCode,
    };

    // Cập nhật thửa gốc thành HISTORICAL
    setParcels(prev =>
      prev.map(item =>
        item.id === selectedParentParcel.id
          ? {
              ...item,
              legalStatus: 'HISTORICAL',
              isHistorical: true,
              childParcelIds: [child1.id, child2.id],
            }
          : item
      )
    );

    setParcels(prev => [child1, child2, ...prev]);
    setIsSubdivideModalOpen(false);
  };

  // Mở modal hợp thửa
  const handleOpenMerge = () => {
    setSelectedMergeIds([]);
    setMergeDecisionNum(`QĐ-HỢP-${new Date().getFullYear()}/0${parcels.length}/UBND`);
    setMergeNewParcelNum(String(parcels.length * 20 + 99));
    setMergeNewOwner('');
    setMergeError(null);
    setIsMergeModalOpen(true);
  };

  // Xác nhận hợp thửa
  const handleConfirmMerge = () => {
    setMergeError(null);
    if (selectedMergeIds.length < 2) {
      setMergeError('Vui lòng chọn tối thiểu 2 thửa đất thành phần để thực hiện hợp thửa.');
      return;
    }

    const selectedList = parcels.filter(p => selectedMergeIds.includes(p.id));

    // Kiểm tra cùng mục đích sử dụng (QTD-31)
    const firstPurpose = selectedList[0].purposeCode;
    const samePurpose = selectedList.every(p => p.purposeCode === firstPurpose);
    if (!samePurpose) {
      setMergeError(
        'Quy định cấm hợp thửa đất không cùng mục đích sử dụng: Các thửa đất đã chọn có mục đích khác nhau. Vui lòng chuyển mục đích sử dụng đất đồng nhất trước khi nộp hồ sơ!'
      );
      return;
    }

    // Kiểm tra cùng xã
    const firstCommune = selectedList[0].communeCode;
    const sameCommune = selectedList.every(p => p.communeCode === firstCommune);
    if (!sameCommune) {
      setMergeError('Không thể hợp các thửa đất nằm ở các đơn vị hành chính xã/phường khác nhau.');
      return;
    }

    const newNum = parseInt(mergeNewParcelNum, 10);
    if (isNaN(newNum) || newNum <= 0) {
      setMergeError('Số thứ tự thửa đất mới phải là số nguyên dương lớn hơn 0.');
      return;
    }

    const now = new Date().toISOString();
    const totalArea = selectedList.reduce((sum, p) => sum + p.area, 0);
    const sheetStr = String(selectedList[0].sheetNumber).padStart(4, '0');
    const newNationalCode = `${firstCommune}-${sheetStr}-${String(newNum).padStart(4, '0')}`;

    const mergedParcel: ParcelDisplay = {
      id: `PARCEL-MRG-${Date.now()}`,
      nationalCode: newNationalCode,
      communeCode: firstCommune,
      communeName: selectedList[0].communeName,
      provinceCode: selectedList[0].provinceCode,
      provinceName: selectedList[0].provinceName,
      sheetNumber: selectedList[0].sheetNumber,
      parcelNumber: newNum,
      area: totalArea,
      purposeCode: firstPurpose,
      purposeName: selectedList[0].purposeName,
      address: selectedList[0].address,
      legalStatus: 'AVAILABLE',
      surveyDocumentNumber: mergeDecisionNum,
      ownerName: mergeNewOwner || selectedList[0].ownerName,
      auditHash: `sha256_${Date.now()}_merged_audit`,
      createdAt: now,
      mergedFromParcelIds: selectedList.map(p => p.id),
      mergedFromNationalCodes: selectedList.map(p => p.nationalCode),
    };

    // Chuyển các thửa cũ thành HISTORICAL
    setParcels(prev =>
      prev.map(item =>
        selectedMergeIds.includes(item.id)
          ? { ...item, legalStatus: 'HISTORICAL', isHistorical: true }
          : item
      )
    );

    setParcels(prev => [mergedParcel, ...prev]);
    setIsMergeModalOpen(false);
  };

  // Mở modal cây gia phả
  const handleOpenLineage = (p: ParcelDisplay) => {
    setLineageParcel(p);
    setIsLineageModalOpen(true);
  };

  // Xử lý sinh mã định danh (DCS-02-CN-002)
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

  // Xử lý thẩm tra mã định danh (DCS-02-CN-002)
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

  // Submit khai báo mới (DCS-02-CN-001)
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
        title="Quản lý Thửa đất & Vòng đời Biến động"
        description="Theo dõi toàn diện cơ sở dữ liệu thửa đất, mã định danh quốc gia, lịch sử tách thửa và hợp thửa"
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
          <p className="text-xs text-emerald-600 mt-2">Đủ điều kiện pháp lý</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lịch sử tách / hợp
              </p>
              <h3 className="text-2xl font-extrabold text-purple-700 mt-1">
                {parcels.filter(p => p.legalStatus === 'HISTORICAL').length}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
              <History className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">Đã đóng hiệu lực lịch sử</p>
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
                { value: 'HISTORICAL', label: 'Lịch sử (Đã tách/hợp)' },
                { value: 'LOCKED', label: 'Đang khóa giao dịch' },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <div className="w-full sm:w-48">
            <Input
              placeholder="Tìm theo mã thửa, địa chỉ, chủ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleOpenMerge}>
            <Merge className="w-4 h-4 mr-1.5" />
            Hợp thửa đất
          </Button>
          <Button variant="outline" onClick={() => setIsCodeModalOpen(true)}>
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Mã định danh
          </Button>
          <Button variant="primary" onClick={handleOpenModal}>
            <FilePlus className="w-4 h-4 mr-1.5" />
            Khai báo mới
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
                <th className="px-3.5 py-3 text-left">Chủ sử dụng đất</th>
                <th className="px-3.5 py-3 text-left">Trạng thái pháp lý</th>
                <th className="px-3.5 py-3 text-left">Quan hệ vòng đời</th>
                <th className="px-3.5 py-3 text-right">Thao tác</th>
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
                    {p.legalStatus === 'HISTORICAL' && (
                      <Badge variant="neutral">Lịch sử biến động</Badge>
                    )}
                    {p.legalStatus === 'LOCKED' && <Badge variant="danger">Đang khóa giao dịch</Badge>}
                    {p.legalStatus === 'DISPUTED' && <Badge variant="danger">Tranh chấp ranh giới</Badge>}
                  </td>
                  <td className="px-3.5 py-2.5 text-xs">
                    {p.parentNationalCode && (
                      <div className="text-slate-600">
                        <span className="text-[11px] text-slate-400 block">Tách từ thửa cha:</span>
                        <span className="font-mono font-semibold">{p.parentNationalCode}</span>
                      </div>
                    )}
                    {p.mergedFromNationalCodes && p.mergedFromNationalCodes.length > 0 && (
                      <div className="text-slate-600">
                        <span className="text-[11px] text-slate-400 block">Hợp từ các thửa:</span>
                        <span className="font-mono font-semibold text-[11px]">
                          {p.mergedFromNationalCodes.join(', ')}
                        </span>
                      </div>
                    )}
                    {p.childParcelIds && p.childParcelIds.length > 0 && (
                      <div className="text-purple-700 font-semibold text-xs">
                        Đã phân nhánh {p.childParcelIds.length} thửa con
                      </div>
                    )}
                    {!p.parentNationalCode && (!p.mergedFromNationalCodes || p.mergedFromNationalCodes.length === 0) && (!p.childParcelIds || p.childParcelIds.length === 0) && (
                      <span className="text-slate-400 italic">Thửa đất gốc</span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenLineage(p)}
                        title="Xem cây phả hệ biến động"
                      >
                        <Network className="w-3.5 h-3.5 mr-1" />
                        Gia phả
                      </Button>
                      {p.legalStatus === 'AVAILABLE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSubdivide(p)}
                          title="Tách thửa đất này"
                        >
                          <GitFork className="w-3.5 h-3.5 mr-1" />
                          Tách thửa
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tách thửa đất (DCS-02-CN-003) */}
      {isSubdivideModalOpen && selectedParentParcel && (
        <Modal
          isOpen={isSubdivideModalOpen}
          onClose={() => setIsSubdivideModalOpen(false)}
          title="Thủ tục Tách thửa đất & Phân nhánh lịch sử"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Thửa đất gốc:</span>
                <span className="font-mono font-bold text-primary-950">{selectedParentParcel.nationalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diện tích gốc:</span>
                <span className="font-extrabold text-slate-900">{selectedParentParcel.area} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mục đích sử dụng:</span>
                <span className="font-semibold">{selectedParentParcel.purposeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hạn mức diện tích tối thiểu:</span>
                <span className="font-semibold text-emerald-800">30.0 m² (theo quy định UBND tỉnh)</span>
              </div>
            </div>

            {subError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{subError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số quyết định / văn bản cho phép tách thửa:
              </label>
              <Input
                value={subDecisionNum}
                onChange={e => setSubDecisionNum(e.target.value)}
                placeholder="Ví dụ: QĐ-TÁCH-2026/01/UBND"
              />
            </div>

            {/* Thửa con 1 */}
            <div className="p-3 border border-slate-200 rounded-lg space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">Thửa đất mới thứ nhất:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Số thứ tự thửa mới:</label>
                  <Input
                    type="number"
                    value={child1ParcelNum}
                    onChange={e => setChild1ParcelNum(e.target.value)}
                    placeholder="Ví dụ: 101"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Diện tích (m²):</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={child1Area}
                    onChange={e => setChild1Area(e.target.value)}
                    placeholder="Ví dụ: 60.0"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-600 block mb-1">Chủ sử dụng đất thừa kế / nhận quyền:</label>
                  <Input
                    value={child1Owner}
                    onChange={e => setChild1Owner(e.target.value)}
                    placeholder="Họ tên người nhận"
                  />
                </div>
              </div>
            </div>

            {/* Thửa con 2 */}
            <div className="p-3 border border-slate-200 rounded-lg space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">Thửa đất mới thứ hai:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Số thứ tự thửa mới:</label>
                  <Input
                    type="number"
                    value={child2ParcelNum}
                    onChange={e => setChild2ParcelNum(e.target.value)}
                    placeholder="Ví dụ: 102"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Diện tích (m²):</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={child2Area}
                    onChange={e => setChild2Area(e.target.value)}
                    placeholder="Ví dụ: 65.8"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-600 block mb-1">Chủ sử dụng đất phần còn lại:</label>
                  <Input
                    value={child2Owner}
                    onChange={e => setChild2Owner(e.target.value)}
                    placeholder="Họ tên người nhận"
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              * Lưu ý: Thửa đất gốc sau khi tách sẽ tự động được chuyển sang trạng thái Lịch sử biến động và bảo toàn vĩnh viễn trong CSDL quốc gia.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsSubdivideModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmSubdivide}>
                <GitFork className="w-4 h-4 mr-1.5" />
                Xác nhận tách thửa
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Hợp thửa đất (DCS-02-CN-003) */}
      {isMergeModalOpen && (
        <Modal
          isOpen={isMergeModalOpen}
          onClose={() => setIsMergeModalOpen(false)}
          title="Thủ tục Hợp các thửa đất liền kề"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              Chọn từ 2 thửa đất trở lên có cùng mục đích sử dụng và cùng địa bàn xã để hợp nhất thành một thửa duy nhất.
            </p>

            {mergeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{mergeError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Chọn các thửa đất tham gia hợp thửa (tối thiểu 2 thửa):
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2.5">
                {parcels
                  .filter(p => p.legalStatus === 'AVAILABLE')
                  .map(p => {
                    const isChecked = selectedMergeIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer text-xs transition-colors ${
                          isChecked ? 'bg-primary-50 border border-primary-200' : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedMergeIds(prev => [...prev, p.id]);
                              } else {
                                setSelectedMergeIds(prev => prev.filter(id => id !== p.id));
                              }
                            }}
                            className="rounded border-slate-300 text-primary-800 focus:ring-primary-600"
                          />
                          <div>
                            <span className="font-mono font-bold text-slate-900">{p.nationalCode}</span>
                            <span className="text-slate-500 block text-[11px]">
                              Tờ {p.sheetNumber}, Thửa {p.parcelNumber} - {p.communeName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 block">{p.area} m²</span>
                          <span className="font-mono text-[11px] text-slate-600">{p.purposeCode}</span>
                        </div>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số thứ tự thửa gộp mới:
                </label>
                <Input
                  type="number"
                  value={mergeNewParcelNum}
                  onChange={e => setMergeNewParcelNum(e.target.value)}
                  placeholder="Ví dụ: 99"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tổng diện tích mới dự kiến:
                </label>
                <div className="px-3 py-2 bg-slate-100 rounded border border-slate-200 text-sm font-extrabold text-slate-900">
                  {parcels
                    .filter(p => selectedMergeIds.includes(p.id))
                    .reduce((sum, p) => sum + p.area, 0)
                    .toLocaleString('vi-VN')}{' '}
                  m²
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số quyết định / văn bản cho phép hợp thửa:
              </label>
              <Input
                value={mergeDecisionNum}
                onChange={e => setMergeDecisionNum(e.target.value)}
                placeholder="Ví dụ: QĐ-HỢP-2026/02/UBND"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chủ sử dụng đất sau khi hợp nhất:
              </label>
              <Input
                value={mergeNewOwner}
                onChange={e => setMergeNewOwner(e.target.value)}
                placeholder="Họ tên cá nhân / Tổ chức nhận quyền"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsMergeModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmMerge}>
                <Merge className="w-4 h-4 mr-1.5" />
                Xác nhận hợp thửa
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Cây gia phả biến động (DCS-02-CN-003) */}
      {isLineageModalOpen && lineageParcel && (
        <Modal
          isOpen={isLineageModalOpen}
          onClose={() => setIsLineageModalOpen(false)}
          title="Cây gia phả biến động thửa đất (Lineage)"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-500 block">Thửa đất đang tra cứu:</span>
              <span className="font-mono font-extrabold text-base text-primary-950 block mt-0.5">
                {lineageParcel.nationalCode}
              </span>
              <span className="text-slate-600 block text-[11px] mt-1">
                Tờ {lineageParcel.sheetNumber}, Thửa {lineageParcel.parcelNumber} • Diện tích: {lineageParcel.area} m² ({lineageParcel.purposeName})
              </span>
            </div>

            {/* Sơ đồ phả hệ */}
            <div className="space-y-3 pt-2">
              {/* Thửa cha / Thửa tiền thân */}
              {lineageParcel.parentNationalCode && (
                <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Thửa đất cha tiền thân (Đã đóng lịch sử):</span>
                  </div>
                  <p className="font-mono font-bold text-slate-900">{lineageParcel.parentNationalCode}</p>
                  <p className="text-[11px] text-slate-500">Quan hệ: Tách thửa theo quyết định phê duyệt địa chính</p>
                </div>
              )}

              {lineageParcel.mergedFromNationalCodes && lineageParcel.mergedFromNationalCodes.length > 0 && (
                <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-lg text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Các thửa đất tiền thân trước khi hợp (Đã đóng lịch sử):</span>
                  </div>
                  <p className="font-mono font-bold text-slate-900">
                    {lineageParcel.mergedFromNationalCodes.join(' + ')}
                  </p>
                  <p className="text-[11px] text-slate-500">Quan hệ: Hợp thửa thành một thể thống nhất</p>
                </div>
              )}

              {(lineageParcel.parentNationalCode || (lineageParcel.mergedFromNationalCodes && lineageParcel.mergedFromNationalCodes.length > 0)) && (
                <div className="flex justify-center text-slate-400">
                  <ArrowDown className="w-5 h-5 animate-bounce" />
                </div>
              )}

              {/* Thửa hiện tại */}
              <div className="p-3.5 bg-primary-50 border-2 border-primary-800 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-950">Thửa đất hiện hành:</span>
                  <Badge variant={lineageParcel.legalStatus === 'AVAILABLE' ? 'success' : 'neutral'}>
                    {lineageParcel.legalStatus === 'AVAILABLE' ? 'Đang hiệu lực' : 'Đã đóng lịch sử'}
                  </Badge>
                </div>
                <p className="font-mono font-extrabold text-sm text-primary-950">{lineageParcel.nationalCode}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                  <div>Chủ sở hữu: <strong>{lineageParcel.ownerName || 'Chưa xác lập'}</strong></div>
                  <div>Hồ sơ phê duyệt: <strong>{lineageParcel.surveyDocumentNumber}</strong></div>
                </div>
              </div>

              {/* Thửa con nếu đã phân nhánh */}
              {lineageParcel.childParcelIds && lineageParcel.childParcelIds.length > 0 && (
                <>
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-5 h-5 animate-bounce" />
                  </div>

                  <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-purple-900">
                      <GitFork className="w-4 h-4 text-purple-700" />
                      <span>Các thửa đất con kế thừa (Đang hoạt động):</span>
                    </div>
                    <div className="space-y-1.5">
                      {parcels
                        .filter(p => lineageParcel.childParcelIds?.includes(p.id))
                        .map(child => (
                          <div
                            key={child.id}
                            className="p-2 bg-white rounded border border-purple-200 flex justify-between items-center"
                          >
                            <span className="font-mono font-bold text-purple-950">{child.nationalCode}</span>
                            <span className="text-slate-600 font-semibold">{child.area} m²</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {!lineageParcel.parentNationalCode &&
                (!lineageParcel.mergedFromNationalCodes || lineageParcel.mergedFromNationalCodes.length === 0) &&
                (!lineageParcel.childParcelIds || lineageParcel.childParcelIds.length === 0) && (
                  <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-50 rounded-lg border border-slate-200">
                    Thửa đất này là thửa đất gốc hình thành ban đầu từ bản đồ địa chính chính quy, chưa phát sinh biến động tách hoặc hợp thửa.
                  </div>
                )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="primary" size="sm" onClick={() => setIsLineageModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
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

      {/* Modal Khai báo thuộc tính thửa đất mới (DCS-02-CN-001) */}
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
