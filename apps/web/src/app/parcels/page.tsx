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
  Home,
  Plus,
  Trash2,
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
  FileCheck,
  Check,
  X,
  Sprout,
  Clock,
  Calendar,
  Bell,
  Phone,
  Send,
  AlertOctagon,
  RefreshCw,
  Cloud,
  Zap,
  RotateCcw,
  ScanSearch,
  CheckCheck,
  FileSearch,
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


interface ReconciliationReportDisplay {
  id: string;
  anomalyType: 'DUPLICATE_NATIONAL_CODE' | 'DUPLICATE_SHEET_PARCEL' | 'SPATIAL_OVERLAP' | 'AREA_DISCREPANCY';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  communeCode: string;
  communeName: string;
  involvedParcelIds: string[];
  involvedNationalCodes: string[];
  overlapArea?: number;
  description: string;
  detectedAt: string;
  status: 'DETECTED' | 'VERIFYING' | 'RESOLVED' | 'DISMISSED';
  assignedBranch: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedByOfficerId?: string;
  auditHash: string;
}

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
  originType?: string;
  originName?: string;
  originDecisionNumber?: string;
  originDecisionDate?: string;
  financialStatus?: string;
  termType?: string;
  termStartDate?: string;
  termDurationYears?: number;
  termExpiryDate?: string;
  expiryWarningStatus?: string;
  lastExpiryNotifiedAt?: string;
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
      termType: 'STABLE_LONG_TERM',
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
      termType: 'STABLE_LONG_TERM',
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


  // Modal Nguồn gốc sử dụng đất (DCS-02-CN-004)
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);
  const [selectedOriginParcel, setSelectedOriginParcel] = useState<ParcelDisplay | null>(null);
  const [formOriginType, setFormOriginType] = useState('ALLOCATED_WITH_FEE');
  const [formOriginDecision, setFormOriginDecision] = useState('QĐ-GIAO-2026/088/UBND');
  const [formOriginDate, setFormOriginDate] = useState('2026-05-15');
  const [formGrantingAuthority, setFormGrantingAuthority] = useState('UBND Thành phố Hà Nội');
  const [formFinancialStatus, setFormFinancialStatus] = useState('PAID');

  // Modal Thẩm định đất nông nghiệp (QTD-26)
  const [isAgriModalOpen, setIsAgriModalOpen] = useState(false);
  // State Quản lý thời hạn sử dụng đất và cảnh báo sắp hết hạn (DCS-02-CN-005)
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [selectedTermParcel, setSelectedTermParcel] = useState<ParcelDisplay | null>(null);
  const [termType, setTermType] = useState<'STABLE_LONG_TERM' | 'DEFINITE'>('DEFINITE');
  const [termStartDate, setTermStartDate] = useState('');
  const [termDurationYears, setTermDurationYears] = useState('50');
  const [termExpiryDate, setTermExpiryDate] = useState('');
  const [termNotes, setTermNotes] = useState('');
  const [termSaveLoading, setTermSaveLoading] = useState(false);
  const [termSuccessMessage, setTermSuccessMessage] = useState<string | null>(null);

  // State Modal Danh sách cảnh báo sắp hết hạn (DCS-02-CN-005)
  const [isExpiringListModalOpen, setIsExpiringListModalOpen] = useState(false);

  // State Modal gửi thông báo cảnh báo chủ sở hữu (DCS-02-CN-005, QTD-27)
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  // DCS-02-CN-006: Quản lý tài sản gắn liền với đất trên thửa
  interface PropertyDisplay {
    id: string;
    parcelId: string;
    assetType: string;
    name: string;
    constructionArea: number;
    floorArea: number;
    structure: string;
    grade: string;
    floorsCount?: number;
    completionYear?: number;
    ownershipTerm?: string;
    completionCertificateNumber?: string;
    completionCertificateDate?: string;
    ownerName: string;
    ownerCitizenId: string;
    isJointSpouseOwnership: boolean;
    spouseName?: string;
    spouseCitizenId?: string;
    status: 'ACTIVE' | 'DEMOLISHED';
    auditHash: string;
  }

  const [properties, setProperties] = useState<PropertyDisplay[]>([
    {
      id: 'PROP-HN-001',
      parcelId: 'PARCEL-HN-001',
      assetType: 'INDIVIDUAL_HOUSE',
      name: 'Nhà ở riêng lẻ 3 tầng mái bê tông cốt thép',
      constructionArea: 85.0,
      floorArea: 255.0,
      structure: 'Khung bê tông cốt thép, tường gạch',
      grade: 'Cấp III',
      floorsCount: 3,
      completionYear: 2022,
      ownershipTerm: 'Lâu dài',
      completionCertificateNumber: 'GP-HC-2022/105/SXD-HN',
      completionCertificateDate: '2022-11-20',
      ownerName: 'Trần Văn Hoàng',
      ownerCitizenId: '001090123456',
      isJointSpouseOwnership: true,
      spouseName: 'Vũ Thị Mai',
      spouseCitizenId: '001192556677',
      status: 'ACTIVE',
      auditHash: 'e5b7a192c4d8e30f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    },
  ]);

  const [isPropertiesModalOpen, setIsPropertiesModalOpen] = useState(false);
  // DCS-02-CN-007: Đồng bộ thời gian thực với CSDL Đất đai Quốc gia
  interface SyncEventDisplay {
    id: string;
    eventType: string;
    parcelId: string;
    parcelNationalCode: string;
    ndxpTransactionId: string;
    status: 'SYNCED' | 'PENDING' | 'FAILED' | 'CONFLICT';
    retryCount: number;
    syncLatencyMs: number;
    checksumSha256: string;
    syncedAt: string;
    errorMessage?: string;
  }

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncEvents, setSyncEvents] = useState<SyncEventDisplay[]>([
    {
      id: 'SYNC-EVT-2026-0005',
      eventType: 'Khóa phiên giao dịch 90 phút',
      parcelId: 'PARCEL-HN-002',
      parcelNationalCode: '01001-0012-0046',
      ndxpTransactionId: 'NDXP-TX-2026-00816',
      status: 'FAILED',
      retryCount: 2,
      syncLatencyMs: 310,
      checksumSha256: '9f8e7d6c5b4a3928172635445566778899aabbccddeeff001122334455667788',
      syncedAt: '2026-10-22T10:30:00.000Z',
      errorMessage: 'NDXP Gateway timeout sau 300ms',
    },
    {
      id: 'SYNC-EVT-2026-0004',
      eventType: 'Khai báo thửa đất mới',
      parcelId: 'PARCEL-HCM-002',
      parcelNationalCode: '79001-0005-0019',
      ndxpTransactionId: 'NDXP-TX-2026-00815',
      status: 'PENDING',
      retryCount: 0,
      syncLatencyMs: 0,
      checksumSha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      syncedAt: '2026-10-22T10:00:00.000Z',
    },
    {
      id: 'SYNC-EVT-2026-0003',
      eventType: 'Cập nhật thời hạn sử dụng đất',
      parcelId: 'PARCEL-HCM-001',
      parcelNationalCode: '79001-0005-0018',
      ndxpTransactionId: 'NDXP-TX-2026-00814',
      status: 'SYNCED',
      retryCount: 0,
      syncLatencyMs: 65,
      checksumSha256: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      syncedAt: '2026-10-22T09:30:00.000Z',
    },
    {
      id: 'SYNC-EVT-2026-0002',
      eventType: 'Đăng ký tài sản trên đất',
      parcelId: 'PARCEL-HN-001',
      parcelNationalCode: '01001-0012-0045',
      ndxpTransactionId: 'NDXP-TX-2026-00813',
      status: 'SYNCED',
      retryCount: 0,
      syncLatencyMs: 95,
      checksumSha256: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      syncedAt: '2026-10-22T08:15:00.000Z',
    },
    {
      id: 'SYNC-EVT-2026-0001',
      eventType: 'Khai báo thửa đất mới',
      parcelId: 'PARCEL-HN-001',
      parcelNationalCode: '01001-0012-0045',
      ndxpTransactionId: 'NDXP-TX-2026-00812',
      status: 'SYNCED',
      retryCount: 0,
      syncLatencyMs: 78,
      checksumSha256: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      syncedAt: '2026-10-22T08:00:00.000Z',
    },
  ]);

  const [syncTargetParcelCode, setSyncTargetParcelCode] = useState('01001-0012-0045');
  const [syncTargetEventType, setSyncTargetEventType] = useState('PARCEL_DECLARED');
  const [isTriggeringSync, setIsTriggeringSync] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const [selectedPropertyParcel, setSelectedPropertyParcel] = useState<ParcelDisplay | null>(null);
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  // Form states for adding property
  const [propAssetType, setPropAssetType] = useState('INDIVIDUAL_HOUSE');
  const [propName, setPropName] = useState('');
  const [propConstructionArea, setPropConstructionArea] = useState('');
  const [propFloorArea, setPropFloorArea] = useState('');
  const [propStructure, setPropStructure] = useState('Khung bê tông cốt thép');
  const [propGrade, setPropGrade] = useState('GRADE_3');
  const [propFloorsCount, setPropFloorsCount] = useState('3');
  const [propCompletionYear, setPropCompletionYear] = useState('2023');
  const [propOwnershipTerm, setPropOwnershipTerm] = useState('Lâu dài');
  const [propCertNumber, setPropCertNumber] = useState('');
  const [propCertDate, setPropCertDate] = useState('');
  const [propOwnerName, setPropOwnerName] = useState('');
  const [propOwnerCccd, setPropOwnerCccd] = useState('');
  const [propIsJointSpouse, setPropIsJointSpouse] = useState(false);
  const [propSpouseName, setPropSpouseName] = useState('');
  const [propSpouseCccd, setPropSpouseCccd] = useState('');
  const [propError, setPropError] = useState<string | null>(null);
  const [propSuccess, setPropSuccess] = useState<string | null>(null);
  const [isSavingProp, setIsSavingProp] = useState(false);

  const [selectedNotifyParcel, setSelectedNotifyParcel] = useState<ParcelDisplay | null>(null);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyAppPush, setNotifyAppPush] = useState(true);
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifySuccessMsg, setNotifySuccessMsg] = useState<string | null>(null);

  const [agriArea1, setAgriArea1] = useState('600');
  const [agriArea2, setAgriArea2] = useState('700');
  const [agriCheckResult, setAgriCheckResult] = useState<{
    isEligible: boolean;
    message: string;
    ineligibleAreas: number[];
  } | null>(null);

  // Mở modal nguồn gốc
  const handleOpenOriginModal = (parcel: ParcelDisplay) => {
    setSelectedOriginParcel(parcel);
    setFormOriginType(parcel.originType || 'ALLOCATED_WITH_FEE');
    setFormOriginDecision(parcel.originDecisionNumber || `QĐ-GIAO-${new Date().getFullYear()}/088/UBND`);
    setFormOriginDate(parcel.originDecisionDate || '2026-05-15');
    setFormGrantingAuthority(parcel.provinceName || 'UBND Thành phố Hà Nội');
    setFormFinancialStatus(parcel.financialStatus || 'PAID');
    setIsOriginModalOpen(true);
  };

  // Xác nhận cập nhật nguồn gốc
  const handleConfirmOrigin = () => {
    if (!selectedOriginParcel) return;

    const originNameMap: Record<string, string> = {
      ALLOCATED_WITH_FEE: 'Nhà nước giao đất có thu tiền',
      ALLOCATED_WITHOUT_FEE: 'Nhà nước giao đất không thu tiền',
      LEASED_LUMP_SUM: 'Nhà nước cho thuê đất thu tiền một lần',
      LEASED_ANNUAL: 'Nhà nước cho thuê đất thu tiền hàng năm',
      RECOGNIZED_WITH_FEE: 'Công nhận QSDĐ có thu tiền',
      RECOGNIZED_WITHOUT_FEE: 'Công nhận QSDĐ không thu tiền',
      TRANSFERRED: 'Nhận chuyển nhượng quyền sử dụng đất',
      INHERITED_OR_DONATED: 'Nhận thừa kế / tặng cho quyền sử dụng đất',
    };

    setParcels(prev =>
      prev.map(item =>
        item.id === selectedOriginParcel.id
          ? {
              ...item,
              originType: formOriginType,
              originName: originNameMap[formOriginType] || 'Nhà nước giao đất có thu tiền',
              originDecisionNumber: formOriginDecision,
              originDecisionDate: formOriginDate,
              financialStatus: formFinancialStatus,
            }
          : item
      )
    );

    setIsOriginModalOpen(false);
  };

  // Thẩm định đất nông nghiệp chống manh mún (QTD-26)
  
  // Handlers Quản lý thời hạn sử dụng đất (DCS-02-CN-005)
  const handleOpenTermModal = (parcel: ParcelDisplay) => {
    setSelectedTermParcel(parcel);
    setTermType((parcel.termType as any) || 'DEFINITE');
    setTermStartDate(parcel.termStartDate || '2020-01-01');
    setTermDurationYears(parcel.termDurationYears ? String(parcel.termDurationYears) : '50');
    setTermExpiryDate(parcel.termExpiryDate || '2070-01-01');
    setTermNotes('');
    setTermSuccessMessage(null);
    setIsTermModalOpen(true);
  };

  const handleCalculateExpiry = () => {
    if (termStartDate && termDurationYears) {
      const start = new Date(termStartDate);
      if (!isNaN(start.getTime())) {
        const exp = new Date(start);
        exp.setFullYear(exp.getFullYear() + parseInt(termDurationYears, 10));
        setTermExpiryDate(exp.toISOString().split('T')[0]);
      }
    }
  };

  const handleSaveTerm = () => {
    if (!selectedTermParcel) return;
    setTermSaveLoading(true);

    try {
      let expiry = termExpiryDate;
      let status = 'VALID';
      if (termType === 'STABLE_LONG_TERM') {
        expiry = '';
        status = 'VALID';
      } else {
        if (!expiry && termStartDate && termDurationYears) {
          const start = new Date(termStartDate);
          const exp = new Date(start);
          exp.setFullYear(exp.getFullYear() + parseInt(termDurationYears, 10));
          expiry = exp.toISOString().split('T')[0];
        }
        if (expiry) {
          const expTime = new Date(expiry).getTime();
          const days = Math.ceil((expTime - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (days <= 0) status = 'EXPIRED';
          else if (days <= 90) status = 'CRITICAL_3M';
          else if (days <= 180) status = 'EXPIRING_SOON_6M';
          else status = 'VALID';
        }
      }

      setParcels(prev =>
        prev.map(p => {
          if (p.id === selectedTermParcel.id) {
            return {
              ...p,
              termType,
              termStartDate: termType === 'DEFINITE' ? termStartDate : undefined,
              termDurationYears: termType === 'DEFINITE' ? parseInt(termDurationYears, 10) : undefined,
              termExpiryDate: termType === 'DEFINITE' ? expiry : undefined,
              expiryWarningStatus: status,
            };
          }
          return p;
        })
      );

      setTermSuccessMessage(`Cập nhật thời hạn sử dụng đất thành công. Trạng thái: ${status === 'VALID' ? 'Còn hạn' : status === 'CRITICAL_3M' ? 'Khẩn cấp (< 90 ngày)' : status === 'EXPIRING_SOON_6M' ? 'Cảnh báo (< 6 tháng)' : 'Đã quá hạn'}`);
      setTimeout(() => {
        setIsTermModalOpen(false);
      }, 1200);
    } finally {
      setTermSaveLoading(false);
    }
  };

  
  // Handlers Quản lý tài sản trên đất (DCS-02-CN-006)
  
  // Handlers Đồng bộ CSDL Quốc gia (DCS-02-CN-007)
  const handleTriggerSync = (targetCode?: string, targetType?: string) => {
    const code = targetCode || syncTargetParcelCode;
    const type = targetType || syncTargetEventType;
    setIsTriggeringSync(true);
    setSyncSuccessMsg(null);

    setTimeout(() => {
      const latency = Math.floor(55 + Math.random() * 50);
      const txId = `NDXP-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newEvt: SyncEventDisplay = {
        id: `SYNC-EVT-2026-${String(syncEvents.length + 1).padStart(4, '0')}`,
        eventType: type === 'PARCEL_DECLARED' ? 'Khai báo thửa đất mới' : type === 'ORIGIN_UPDATED' ? 'Cập nhật nguồn gốc đất' : type === 'TERM_UPDATED' ? 'Cập nhật thời hạn sử dụng đất' : 'Biến động dữ liệu địa chính',
        parcelId: 'PARCEL-CUSTOM',
        parcelNationalCode: code,
        ndxpTransactionId: txId,
        status: 'SYNCED',
        retryCount: 0,
        syncLatencyMs: latency,
        checksumSha256: 'e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7',
        syncedAt: new Date().toISOString(),
      };

      setSyncEvents(prev => [newEvt, ...prev]);
      setIsTriggeringSync(false);
      setSyncSuccessMsg(`Đã đồng bộ thời gian thực thửa đất '${code}' về CSDL Quốc gia thành công qua Trục NDXP (Độ trễ: ${latency} ms, Mã GD: ${txId})`);
    }, 500);
  };

  const handleRetrySync = (eventId: string) => {
    setTimeout(() => {
      setSyncEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? {
                ...e,
                status: 'SYNCED',
                retryCount: e.retryCount + 1,
                syncLatencyMs: 72,
                errorMessage: undefined,
                syncedAt: new Date().toISOString(),
              }
            : e
        )
      );
      setSyncSuccessMsg(`Đã thử lại thành công sự kiện '${eventId}' qua Trục liên thông NDXP (Độ trễ: 72 ms)`);
    }, 400);
  };

  const handleOpenPropertiesModal = (parcel: ParcelDisplay) => {
    setSelectedPropertyParcel(parcel);
    setShowAddPropertyForm(false);
    setPropName(`Nhà ở riêng lẻ trên thửa ${parcel.parcelNumber}`);
    setPropConstructionArea(String(Math.min(parcel.area * 0.7, 100)));
    setPropFloorArea(String(Math.min(parcel.area * 0.7 * 3, 300)));
    setPropStructure('Khung cột bê tông cốt thép, tường gạch');
    setPropGrade('GRADE_3');
    setPropFloorsCount('3');
    setPropCompletionYear('2023');
    setPropOwnershipTerm('Lâu dài');
    setPropCertNumber(`GP-HC-2023/${parcel.parcelNumber}/SXD`);
    setPropCertDate('2023-09-20');
    setPropOwnerName(parcel.ownerName || '');
    setPropOwnerCccd(parcel.ownerCitizenId || '');
    setPropIsJointSpouse(false);
    setPropSpouseName('');
    setPropSpouseCccd('');
    setPropError(null);
    setPropSuccess(null);
    setIsPropertiesModalOpen(true);
  };

  const handleSaveProperty = () => {
    if (!selectedPropertyParcel) return;
    setPropError(null);
    setPropSuccess(null);

    const constArea = parseFloat(propConstructionArea);
    const floorArea = parseFloat(propFloorArea);

    if (isNaN(constArea) || constArea <= 0) {
      setPropError('Diện tích xây dựng phải là số dương lớn hơn 0 m²');
      return;
    }
    if (constArea > selectedPropertyParcel.area) {
      setPropError(`Diện tích xây dựng (${constArea} m²) vượt quá diện tích thửa đất (${selectedPropertyParcel.area} m²)`);
      return;
    }
    if (!propOwnerName.trim()) {
      setPropError('Họ tên chủ sở hữu tài sản không được để trống');
      return;
    }
    if (!propOwnerCccd || !/^\d{12}$/.test(propOwnerCccd)) {
      setPropError('Số CCCD chủ sở hữu phải gồm đúng 12 chữ số');
      return;
    }
    if (propIsJointSpouse) {
      if (!propSpouseName.trim() || !propSpouseCccd || !/^\d{12}$/.test(propSpouseCccd)) {
        setPropError('Theo quy định đồng sở hữu vợ chồng (Luật Đất đai 2024), bắt buộc nhập đầy đủ họ tên và số CCCD 12 số của người phối ngẫu');
        return;
      }
      if (propSpouseCccd === propOwnerCccd) {
        setPropError('Số CCCD của vợ/chồng không được trùng với CCCD của chủ sở hữu');
        return;
      }
    }

    setIsSavingProp(true);
    setTimeout(() => {
      const newProp: PropertyDisplay = {
        id: `PROP-${selectedPropertyParcel.provinceCode.replace('TINH_', '')}-${String(properties.length + 1).padStart(3, '0')}`,
        parcelId: selectedPropertyParcel.id,
        assetType: propAssetType,
        name: propName || 'Tài sản trên đất',
        constructionArea: constArea,
        floorArea: floorArea || constArea,
        structure: propStructure,
        grade: propGrade === 'GRADE_1' ? 'Cấp I' : propGrade === 'GRADE_2' ? 'Cấp II' : propGrade === 'GRADE_3' ? 'Cấp III' : 'Cấp IV',
        floorsCount: parseInt(propFloorsCount, 10) || 1,
        completionYear: parseInt(propCompletionYear, 10) || 2023,
        ownershipTerm: propOwnershipTerm,
        completionCertificateNumber: propCertNumber,
        completionCertificateDate: propCertDate,
        ownerName: propOwnerName,
        ownerCitizenId: propOwnerCccd,
        isJointSpouseOwnership: propIsJointSpouse,
        spouseName: propIsJointSpouse ? propSpouseName : undefined,
        spouseCitizenId: propIsJointSpouse ? propSpouseCccd : undefined,
        status: 'ACTIVE',
        auditHash: 'f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
      };

      setProperties(prev => [...prev, newProp]);
      setIsSavingProp(false);
      setPropSuccess(`Đã đăng ký tài sản '${newProp.name}' thành công trên thửa đất ${selectedPropertyParcel.nationalCode}.`);
      setShowAddPropertyForm(false);
    }, 600);
  };

  const handleDemolishProperty = (propertyId: string) => {
    setProperties(prev =>
      prev.map(p => (p.id === propertyId ? { ...p, status: 'DEMOLISHED' } : p))
    );
  };

  const handleOpenNotifyModal = (parcel: ParcelDisplay) => {
    setSelectedNotifyParcel(parcel);
    setNotifySms(true);
    setNotifyAppPush(true);
    setNotifySuccessMsg(null);
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = () => {
    if (!selectedNotifyParcel) return;
    setIsNotifying(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      setParcels(prev =>
        prev.map(p => (p.id === selectedNotifyParcel.id ? { ...p, lastExpiryNotifiedAt: now } : p))
      );
      setNotifySuccessMsg(
        `Đã phát thông báo cảnh báo thời hạn thành công qua ${[notifySms ? 'Tin nhắn SMS' : null, notifyAppPush ? 'Ứng dụng di động' : null].filter(Boolean).join(' & ')} tới chủ sở hữu '${selectedNotifyParcel.ownerName || 'Chủ sử dụng đất'}'`
      );
      setIsNotifying(false);
      setTimeout(() => {
        setIsNotifyModalOpen(false);
      }, 1500);
    }, 600);
  };

  const handleCheckAgriSubdivision = () => {
    const a1 = parseFloat(agriArea1);
    const a2 = parseFloat(agriArea2);
    if (isNaN(a1) || isNaN(a2) || a1 <= 0 || a2 <= 0) {
      alert('Diện tích các thửa con phải là số dương');
      return;
    }
    const minCultivationArea = 500;
    const areas = [a1, a2];
    const ineligible = areas.filter(a => a < minCultivationArea);
    if (ineligible.length > 0) {
      setAgriCheckResult({
        isEligible: false,
        ineligibleAreas: ineligible,
        message: `Từ chối tách thửa đất nông nghiệp: Thửa có diện tích ${ineligible.join(', ')} m² nhỏ hơn hạn mức canh tác tối thiểu ${minCultivationArea} m² nhằm chống manh mún đất đai theo Luật Đất đai 2024.`,
      });
    } else {
      setAgriCheckResult({
        isEligible: true,
        ineligibleAreas: [],
        message: 'Hồ sơ tách thửa đất nông nghiệp đủ điều kiện hạn mức canh tác tối thiểu theo quy định của Luật Đất đai 2024.',
      });
    }
  };

  
  // ==========================================
  // State Đối soát và phát hiện trùng lặp mã thửa (DCS-02-CN-008)
  // ==========================================
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [isScanningReconciliation, setIsScanningReconciliation] = useState(false);
  const [reconciliationSuccessMessage, setReconciliationSuccessMessage] = useState<string | null>(null);
  const [reconciliationFilterStatus, setReconciliationFilterStatus] = useState<string>('ALL');
  const [reconciliationFilterSeverity, setReconciliationFilterSeverity] = useState<string>('ALL');
  const [selectedReportToResolve, setSelectedReportToResolve] = useState<ReconciliationReportDisplay | null>(null);
  const [resolveNewStatus, setResolveNewStatus] = useState<'VERIFYING' | 'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [resolveNotes, setResolveNotes] = useState('');
  const [isResolvingAnomaly, setIsResolvingAnomaly] = useState(false);

  const [reconciliationReports, setReconciliationReports] = useState<ReconciliationReportDisplay[]>([
    {
      id: 'REC-REP-2026-0001',
      anomalyType: 'DUPLICATE_SHEET_PARCEL',
      severity: 'CRITICAL',
      communeCode: '01001',
      communeName: 'Phường Điện Biên',
      involvedParcelIds: ['PARCEL-HN-001', 'PARCEL-HN-OLD-099'],
      involvedNationalCodes: ['01001-0012-0045', '01001-0012-0045-OLD'],
      description: 'Phát hiện 2 bản ghi cùng số tờ 12, số thửa 45 tại Phường Điện Biên từ cơ sở dữ liệu số hóa năm 2018 chưa chuẩn hóa mã quốc gia duy nhất.',
      detectedAt: '2026-10-22 08:00',
      status: 'DETECTED',
      assignedBranch: 'Chi nhánh Văn phòng Đăng ký Đất đai Ba Đình',
      auditHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b1',
    },
    {
      id: 'REC-REP-2026-0002',
      anomalyType: 'SPATIAL_OVERLAP',
      severity: 'HIGH',
      communeCode: '79001',
      communeName: 'Phường Bến Nghé',
      involvedParcelIds: ['PARCEL-HCM-001', 'PARCEL-HCM-002'],
      involvedNationalCodes: ['79001-0005-0018', '79001-0005-0019'],
      overlapArea: 14.5,
      description: 'Phát hiện ranh giới tọa độ không gian VN-2000 bị chồng lấn diện tích 14.5 m² giữa Thửa 18 và Thửa 19 tại khu vực ven bãi bồi.',
      detectedAt: '2026-10-22 09:15',
      status: 'VERIFYING',
      assignedBranch: 'Chi nhánh Văn phòng Đăng ký Đất đai Quận 1',
      auditHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c2',
    },
    {
      id: 'REC-REP-2026-0003',
      anomalyType: 'AREA_DISCREPANCY',
      severity: 'MEDIUM',
      communeCode: '01001',
      communeName: 'Phường Điện Biên',
      involvedParcelIds: ['PARCEL-HN-003'],
      involvedNationalCodes: ['01001-0030-0099'],
      description: 'Sai lệch diện tích 0.8 m² giữa hồ sơ trích đo số hóa cũ và kết quả tính toán khép góc polygon hệ VN-2000.',
      detectedAt: '2026-10-21 14:00',
      status: 'RESOLVED',
      assignedBranch: 'Chi nhánh Văn phòng Đăng ký Đất đai Ba Đình',
      resolutionNotes: 'Đã hoàn tất đo đạc vi sai và xác lập mốc ranh giới thực địa theo QĐ 12/UBND.',
      resolvedAt: '2026-10-22 16:00',
      resolvedByOfficerId: 'Cán bộ địa chính Ba Đình',
      auditHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b3c3',
    },
    {
      id: 'REC-REP-2026-0004',
      anomalyType: 'DUPLICATE_NATIONAL_CODE',
      severity: 'CRITICAL',
      communeCode: '79001',
      communeName: 'Phường Bến Nghé',
      involvedParcelIds: ['PARCEL-HCM-001', 'PARCEL-HCM-088'],
      involvedNationalCodes: ['79001-0005-0018', '79001-0005-0018'],
      description: 'Trùng lặp hoàn toàn mã định danh thửa đất quốc gia 79001-0005-0018 trên 2 bản ghi khác nhau do lỗi nạp dữ liệu di sản.',
      detectedAt: '2026-10-22 11:00',
      status: 'DETECTED',
      assignedBranch: 'Chi nhánh Văn phòng Đăng ký Đất đai Quận 1',
      auditHash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b4c4d4',
    },
  ]);

  const handleTriggerReconciliationScan = () => {
    setIsScanningReconciliation(true);
    setReconciliationSuccessMessage(null);
    setTimeout(() => {
      setIsScanningReconciliation(false);
      const activeCount = reconciliationReports.filter(r => r.status === 'DETECTED' || r.status === 'VERIFYING').length;
      setReconciliationSuccessMessage(
        `Phiên quét đối soát CSDL hoàn tất trong 85ms. Đã rà soát 1.450 thửa đất trên toàn hệ thống. Phát hiện ${activeCount} sai lệch cần thẩm tra. Tỷ lệ dữ liệu sạch đạt 99.8%.`
      );
    }, 700);
  };

  const handleOpenResolveModal = (report: ReconciliationReportDisplay) => {
    setSelectedReportToResolve(report);
    setResolveNewStatus(report.status === 'RESOLVED' ? 'RESOLVED' : 'RESOLVED');
    setResolveNotes(report.resolutionNotes || '');
    setReconciliationSuccessMessage(null);
  };

  const handleConfirmResolve = () => {
    if (!selectedReportToResolve) return;
    if (!resolveNotes.trim() || resolveNotes.trim().length < 5) {
      alert('Vui lòng nhập phương án và căn cứ pháp lý giải quyết sai lệch (tối thiểu 5 ký tự).');
      return;
    }

    setIsResolvingAnomaly(true);
    setTimeout(() => {
      setReconciliationReports(prev =>
        prev.map(item =>
          item.id === selectedReportToResolve.id
            ? {
                ...item,
                status: resolveNewStatus,
                resolutionNotes: resolveNotes.trim(),
                resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
                resolvedByOfficerId: 'Cán bộ tiếp nhận xử lý',
              }
            : item
        )
      );
      setIsResolvingAnomaly(false);
      setSelectedReportToResolve(null);
      setReconciliationSuccessMessage(`Đã cập nhật trạng thái giải quyết sai lệch '${selectedReportToResolve.id}' thành công.`);
    }, 400);
  };

  const filteredReconciliationReports = reconciliationReports.filter(r => {
    const matchStatus = reconciliationFilterStatus === 'ALL' || r.status === reconciliationFilterStatus;
    const matchSeverity = reconciliationFilterSeverity === 'ALL' || r.severity === reconciliationFilterSeverity;
    return matchStatus && matchSeverity;
  });

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
          
          <Button variant="outline" onClick={() => setIsReconciliationModalOpen(true)} className="border-indigo-300 bg-indigo-50 text-indigo-900 hover:bg-indigo-100">
            <ScanSearch className="w-4 h-4 mr-1.5 text-indigo-600" />
            Đối soát CSDL
            <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-indigo-600 text-white">
              {reconciliationReports.filter(r => r.status === 'DETECTED' || r.status === 'VERIFYING').length}
            </span>
          </Button>
          <Button variant="outline" onClick={() => setIsSyncModalOpen(true)} className="border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100">
            <RefreshCw className="w-4 h-4 mr-1.5 text-blue-600" />
            Đồng bộ CSDL Quốc gia
          </Button>
          <Button variant="outline" onClick={() => setIsExpiringListModalOpen(true)} className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100">
            <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
            Cảnh báo hết hạn (6 tháng)
            <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold rounded-full bg-amber-600 text-white">
              {parcels.filter(p => p.termType === 'DEFINITE' && (p.expiryWarningStatus === 'CRITICAL_3M' || p.expiryWarningStatus === 'EXPIRING_SOON_6M' || p.expiryWarningStatus === 'EXPIRED')).length}
            </span>
          </Button>
          <Button variant="outline" onClick={() => setIsAgriModalOpen(true)}>
            <Sprout className="w-4 h-4 mr-1.5" />
            Đất nông nghiệp
          </Button>
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

      {/* Modal Cập nhật Nguồn gốc sử dụng đất (DCS-02-CN-004) */}
      {isOriginModalOpen && selectedOriginParcel && (
        <Modal
          isOpen={isOriginModalOpen}
          onClose={() => setIsOriginModalOpen(false)}
          title="Quản lý Nguồn gốc sử dụng đất theo Luật Đất đai 2024"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã định danh thửa đất:</span>
                <span className="font-mono font-bold text-primary-950">{selectedOriginParcel.nationalCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Diện tích & Mục đích:</span>
                <span className="font-semibold text-slate-900">{selectedOriginParcel.area} m² ({selectedOriginParcel.purposeName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa chỉ thửa đất:</span>
                <span className="text-slate-700 truncate max-w-xs">{selectedOriginParcel.address}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phân loại Nguồn gốc sử dụng đất (Luật Đất đai 2024):
              </label>
              <Select
                value={formOriginType}
                onChange={e => setFormOriginType(e.target.value)}
                options={[
                  { value: 'ALLOCATED_WITH_FEE', label: 'Nhà nước giao đất có thu tiền sử dụng đất' },
                  { value: 'ALLOCATED_WITHOUT_FEE', label: 'Nhà nước giao đất không thu tiền sử dụng đất' },
                  { value: 'LEASED_LUMP_SUM', label: 'Nhà nước cho thuê đất thu tiền một lần cho cả thời gian thuê' },
                  { value: 'LEASED_ANNUAL', label: 'Nhà nước cho thuê đất thu tiền thuê đất hàng năm' },
                  { value: 'RECOGNIZED_WITH_FEE', label: 'Công nhận QSDĐ như giao đất có thu tiền sử dụng đất' },
                  { value: 'RECOGNIZED_WITHOUT_FEE', label: 'Công nhận QSDĐ như giao đất không thu tiền sử dụng đất' },
                  { value: 'TRANSFERRED', label: 'Nhận chuyển nhượng quyền sử dụng đất hợp pháp' },
                  { value: 'INHERITED_OR_DONATED', label: 'Nhận thừa kế, tặng cho quyền sử dụng đất' },
                ]}
              />
            </div>

            {/* Thẻ Quyền năng pháp lý tương ứng */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Quyền và nghĩa vụ pháp lý tương ứng:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  {formOriginType === 'LEASED_ANNUAL' || formOriginType === 'ALLOCATED_WITHOUT_FEE' ? (
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className={formOriginType === 'LEASED_ANNUAL' || formOriginType === 'ALLOCATED_WITHOUT_FEE' ? 'text-rose-700 font-semibold' : 'text-slate-800'}>
                    Chuyển nhượng QSDĐ
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {formOriginType === 'LEASED_ANNUAL' || formOriginType === 'ALLOCATED_WITHOUT_FEE' ? (
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className={formOriginType === 'LEASED_ANNUAL' || formOriginType === 'ALLOCATED_WITHOUT_FEE' ? 'text-rose-700 font-semibold' : 'text-slate-800'}>
                    Thế chấp tại Ngân hàng
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {formOriginType === 'LEASED_LUMP_SUM' || formOriginType === 'ALLOCATED_WITH_FEE' || formOriginType === 'TRANSFERRED' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-slate-800">Cho thuê lại QSDĐ</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {formOriginType === 'ALLOCATED_WITHOUT_FEE' || formOriginType === 'LEASED_ANNUAL' ? (
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span className="text-slate-800">Tặng cho QSDĐ</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 pt-1 leading-relaxed border-t border-slate-200 mt-2">
                {formOriginType === 'LEASED_ANNUAL' && 'Theo Luật Đất đai 2024: Thuê đất trả tiền hàng năm chỉ được bán, thế chấp tài sản gắn liền và quyền thuê trong hợp đồng, không được chuyển nhượng quyền sử dụng đất trần.'}
                {formOriginType === 'ALLOCATED_WITHOUT_FEE' && 'Theo Luật Đất đai 2024: Đất được Nhà nước giao không thu tiền không được phép chuyển nhượng, thế chấp hoặc góp vốn bằng quyền sử dụng đất.'}
                {formOriginType === 'ALLOCATED_WITH_FEE' && 'Theo Luật Đất đai 2024: Người sử dụng đất có đầy đủ quyền chuyển nhượng, thế chấp, tặng cho, cho thuê lại sau khi hoàn thành nghĩa vụ tài chính.'}
                {formOriginType === 'LEASED_LUMP_SUM' && 'Theo Luật Đất đai 2024: Thuê đất trả tiền một lần có quyền chuyển nhượng, thế chấp, cho thuê lại trong thời hạn thuê.'}
                {(formOriginType === 'TRANSFERRED' || formOriginType === 'INHERITED_OR_DONATED' || formOriginType === 'RECOGNIZED_WITH_FEE' || formOriginType === 'RECOGNIZED_WITHOUT_FEE') && 'Theo Luật Đất đai 2024: Người sử dụng đất được bảo hộ đầy đủ các quyền theo Giấy chứng nhận quyền sử dụng đất đã cấp.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số quyết định giao/thuê đất:
                </label>
                <Input
                  value={formOriginDecision}
                  onChange={e => setFormOriginDecision(e.target.value)}
                  placeholder="Ví dụ: QĐ-GIAO-2026/088/UBND"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ngày quyết định (YYYY-MM-DD):
                </label>
                <Input
                  value={formOriginDate}
                  onChange={e => setFormOriginDate(e.target.value)}
                  placeholder="2026-05-15"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cơ quan ban hành quyết định:
                </label>
                <Input
                  value={formGrantingAuthority}
                  onChange={e => setFormGrantingAuthority(e.target.value)}
                  placeholder="UBND Thành phố Hà Nội"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nghĩa vụ tài chính:
                </label>
                <Select
                  value={formFinancialStatus}
                  onChange={e => setFormFinancialStatus(e.target.value)}
                  options={[
                    { value: 'PAID', label: 'Đã hoàn thành nghĩa vụ tài chính' },
                    { value: 'EXEMPTED', label: 'Được miễn nộp tiền sử dụng đất' },
                    { value: 'ANNUAL_PAYMENT', label: 'Nộp tiền thuê đất hàng năm' },
                    { value: 'DEFERRED', label: 'Được ghi nợ nghĩa vụ tài chính' },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsOriginModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmOrigin}>
                <FileCheck className="w-4 h-4 mr-1.5" />
                Lưu nguồn gốc đất
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Thẩm định đất nông nghiệp chống manh mún (DCS-02-CN-004, QTD-26) */}
      {isAgriModalOpen && (
        <Modal
          isOpen={isAgriModalOpen}
          onClose={() => setIsAgriModalOpen(false)}
          title="Thẩm định Điều kiện Tách thửa Đất Nông nghiệp"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-600 leading-relaxed">
              Theo Luật Đất đai 2024, không cho phép tách thửa đối với đất nông nghiệp (đất trồng lúa, cây lâu năm, hàng năm) dưới hạn mức canh tác tối thiểu (500 m²) nhằm chống manh mún tư liệu sản xuất.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Diện tích thửa con 1 (m²):
                </label>
                <Input
                  type="number"
                  value={agriArea1}
                  onChange={e => setAgriArea1(e.target.value)}
                  placeholder="Ví dụ: 600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Diện tích thửa con 2 (m²):
                </label>
                <Input
                  type="number"
                  value={agriArea2}
                  onChange={e => setAgriArea2(e.target.value)}
                  placeholder="Ví dụ: 700"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={handleCheckAgriSubdivision}>
                <Sprout className="w-4 h-4 mr-1.5" />
                Kiểm tra hạn mức canh tác
              </Button>
            </div>

            {agriCheckResult && (
              <div className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                agriCheckResult.isEligible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {agriCheckResult.isEligible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{agriCheckResult.isEligible ? 'Đủ điều kiện tách thửa đất nông nghiệp' : 'Không đủ điều kiện tách thửa'}</span>
                </div>
                <p className="leading-relaxed">{agriCheckResult.message}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsAgriModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

    
      {/* Modal Quản lý Thời hạn Sử dụng Đất (DCS-02-CN-005) */}
      {isTermModalOpen && selectedTermParcel && (
        <Modal
          isOpen={isTermModalOpen}
          onClose={() => setIsTermModalOpen(false)}
          title="Quản lý Thời hạn Sử dụng Đất"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500">Mã thửa đất:</span>
                <span className="font-bold font-mono text-slate-900">{selectedTermParcel.nationalCode}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500">Vị trí:</span>
                <span className="font-semibold text-slate-800">Tờ {selectedTermParcel.sheetNumber}, Thửa {selectedTermParcel.parcelNumber} ({selectedTermParcel.communeName})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Chủ sử dụng:</span>
                <span className="font-semibold text-slate-800">{selectedTermParcel.ownerName || 'Chưa định danh'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Loại hình thời hạn sử dụng đất:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTermType('STABLE_LONG_TERM')}
                  className={`p-3 text-left rounded-lg border text-xs transition-all ${
                    termType === 'STABLE_LONG_TERM'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold">Ổn định lâu dài</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Đất ở tại đô thị (ODT), đất ở nông thôn (ONT)...</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTermType('DEFINITE')}
                  className={`p-3 text-left rounded-lg border text-xs transition-all ${
                    termType === 'DEFINITE'
                      ? 'border-primary-600 bg-primary-50 text-primary-950 font-bold ring-1 ring-primary-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold">Có thời hạn xác định</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Đất nông nghiệp (50 năm), thương mại dịch vụ (50 năm)...</div>
                </button>
              </div>
            </div>

            {termType === 'DEFINITE' && (
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày bắt đầu giao/thuê đất:
                    </label>
                    <Input
                      type="date"
                      value={termStartDate}
                      onChange={e => {
                        setTermStartDate(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thời hạn giao đất (Số năm):
                    </label>
                    <Input
                      type="number"
                      value={termDurationYears}
                      onChange={e => {
                        setTermDurationYears(e.target.value);
                      }}
                      placeholder="Ví dụ: 50"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <Button variant="outline" size="sm" onClick={handleCalculateExpiry}>
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Tự động tính ngày hết hạn
                  </Button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày hết hạn sử dụng đất (YYYY-MM-DD):
                  </label>
                  <Input
                    type="date"
                    value={termExpiryDate}
                    onChange={e => setTermExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú / Quyết định gia hạn:
              </label>
              <Input
                value={termNotes}
                onChange={e => setTermNotes(e.target.value)}
                placeholder="Số quyết định, điều khoản cam kết..."
              />
            </div>

            {termSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{termSuccessMessage}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsTermModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveTerm} isLoading={termSaveLoading}>
                <Check className="w-4 h-4 mr-1.5" />
                Lưu cập nhật thời hạn
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Danh Sách Thửa Đất Sắp Hết Hạn Sử Dụng (DCS-02-CN-005, QTD-27) */}
      {isExpiringListModalOpen && (
        <Modal
          isOpen={isExpiringListModalOpen}
          onClose={() => setIsExpiringListModalOpen(false)}
          title="Danh Sách Thửa Đất Sắp Hết Hạn Sử Dụng (Trong Vòng 6 Tháng)"
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Tóm tắt cảnh báo 3 cấp độ */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                <div className="text-xs font-bold text-rose-800">Nguy cấp (&lt; 90 ngày)</div>
                <div className="text-xl font-extrabold text-rose-900 mt-1">
                  {parcels.filter(p => p.termType === 'DEFINITE' && p.expiryWarningStatus === 'CRITICAL_3M').length}
                </div>
                <div className="text-[11px] text-rose-600 mt-0.5">Cần nộp hồ sơ gia hạn ngay</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <div className="text-xs font-bold text-amber-800">Cảnh báo (&lt; 180 ngày)</div>
                <div className="text-xl font-extrabold text-amber-900 mt-1">
                  {parcels.filter(p => p.termType === 'DEFINITE' && p.expiryWarningStatus === 'EXPIRING_SOON_6M').length}
                </div>
                <div className="text-[11px] text-amber-600 mt-0.5">Trước mốc 06 tháng</div>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-center">
                <div className="text-xs font-bold text-slate-800">Đã hết hạn</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {parcels.filter(p => p.termType === 'DEFINITE' && p.expiryWarningStatus === 'EXPIRED').length}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">Thuộc diện xem xét xử lý</div>
              </div>
            </div>

            {/* Khuyến nghị pháp lý Luật Đất đai 2024 Điều 172 */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Căn cứ Điều 172 Luật Đất đai 2024 về Trình tự gia hạn thời hạn sử dụng đất</span>
              </div>
              <p className="leading-relaxed text-blue-900">
                Người sử dụng đất có nhu cầu tiếp tục sử dụng đất phải nộp hồ sơ xin gia hạn chậm nhất là <strong>06 tháng</strong> trước khi hết thời hạn sử dụng đất. Quá thời hạn này mà không nộp hồ sơ, Nhà nước sẽ tiến hành thủ tục thu hồi đất theo luật định.
              </p>
            </div>

            {/* Bảng danh sách các thửa đất cần gia hạn */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Mã thửa</th>
                    <th className="px-3 py-2 text-left">Chủ sử dụng</th>
                    <th className="px-3 py-2 text-left">Hạn sử dụng</th>
                    <th className="px-3 py-2 text-left">Trạng thái</th>
                    <th className="px-3 py-2 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {parcels
                    .filter(p => p.termType === 'DEFINITE' && (p.expiryWarningStatus === 'CRITICAL_3M' || p.expiryWarningStatus === 'EXPIRING_SOON_6M' || p.expiryWarningStatus === 'EXPIRED'))
                    .map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                          {p.nationalCode}
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-semibold text-slate-900">{p.ownerName || 'Chưa định danh'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">0987654321</div>
                        </td>
                        <td className="px-3 py-2 font-mono font-bold text-slate-800">
                          {p.termExpiryDate}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {p.expiryWarningStatus === 'EXPIRED' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                              Đã quá hạn
                            </span>
                          )}
                          {p.expiryWarningStatus === 'CRITICAL_3M' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Khẩn cấp (&lt; 90 ngày)
                            </span>
                          )}
                          {p.expiryWarningStatus === 'EXPIRING_SOON_6M' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Sắp hết hạn (&lt; 6 tháng)
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setIsExpiringListModalOpen(false);
                              handleOpenNotifyModal(p);
                            }}
                          >
                            <Bell className="w-3.5 h-3.5 mr-1" />
                            Gửi cảnh báo
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsExpiringListModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Phát Thông Báo Cảnh Báo Cho Chủ Sở Hữu (DCS-02-CN-005, QTD-27) */}
      {isNotifyModalOpen && selectedNotifyParcel && (
        <Modal
          isOpen={isNotifyModalOpen}
          onClose={() => setIsNotifyModalOpen(false)}
          title="Gửi Cảnh Báo Hết Hạn Sử Dụng Đất Cho Chủ Sở Hữu"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Chủ sử dụng đất:</span>
                <span className="font-bold text-slate-900">{selectedNotifyParcel.ownerName || 'Chưa định danh'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số điện thoại nhận tin:</span>
                <span className="font-mono font-bold text-primary-950">0987654321</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Thửa đất:</span>
                <span className="font-mono font-semibold text-slate-800">{selectedNotifyParcel.nationalCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ngày hết hạn sử dụng:</span>
                <span className="font-mono font-bold text-rose-700">{selectedNotifyParcel.termExpiryDate}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kênh phát thông báo tức thời:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={notifySms}
                    onChange={e => setNotifySms(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-bold text-slate-800">Tin nhắn SMS</div>
                    <div className="text-[11px] text-slate-500">Gửi trực tiếp đến số điện thoại</div>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={notifyAppPush}
                    onChange={e => setNotifyAppPush(e.target.checked)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-bold text-slate-800">Ứng dụng di động</div>
                    <div className="text-[11px] text-slate-500">Thông báo đẩy Địa Chính Số</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Xem trước nội dung thông báo:
              </label>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 font-mono leading-relaxed">
                [ĐỊA CHÍNH SỐ] Kính gửi ông/bà {selectedNotifyParcel.ownerName || 'Chủ sử dụng đất'}, thửa đất số {selectedNotifyParcel.parcelNumber}, tờ BĐ số {selectedNotifyParcel.sheetNumber} (Mã định danh: {selectedNotifyParcel.nationalCode}) tại {selectedNotifyParcel.communeName} sẽ hết hạn sử dụng vào ngày {selectedNotifyParcel.termExpiryDate}. Căn cứ Điều 172 Luật Đất đai 2024, đề nghị ông/bà nộp hồ sơ xin gia hạn trước ít nhất 06 tháng tại Chi nhánh Văn phòng Đăng ký Đất đai.
              </div>
            </div>

            {notifySuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{notifySuccessMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsNotifyModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendNotification}
                isLoading={isNotifying}
                disabled={!notifySms && !notifyAppPush}
              >
                <Send className="w-4 h-4 mr-1.5" />
                Phát thông báo ngay
              </Button>
            </div>
          </div>
        </Modal>
      )}

    
      {/* Modal Quản lý Tài sản Gắn liền với Đất (DCS-02-CN-006, QTD-25) */}
      {isPropertiesModalOpen && selectedPropertyParcel && (
        <Modal
          isOpen={isPropertiesModalOpen}
          onClose={() => setIsPropertiesModalOpen(false)}
          title="Quản lý Tài sản Gắn liền với Đất trên Thửa"
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Tóm tắt thửa đất */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500">Mã thửa đất:</span>
                <span className="font-bold font-mono text-slate-900">{selectedPropertyParcel.nationalCode}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-500">Địa chỉ / Vị trí:</span>
                <span className="font-semibold text-slate-800">Tờ {selectedPropertyParcel.sheetNumber}, Thửa {selectedPropertyParcel.parcelNumber} - {selectedPropertyParcel.address}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Diện tích thửa đất:</span>
                <span className="font-bold text-slate-900">{selectedPropertyParcel.area.toLocaleString('vi-VN')} m²</span>
              </div>
            </div>

            {propSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{propSuccess}</span>
              </div>
            )}

            {/* Danh sách tài sản hiện có trên thửa */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Danh sách tài sản công trình ({properties.filter(p => p.parcelId === selectedPropertyParcel.id).length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPropertyForm(!showAddPropertyForm)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {showAddPropertyForm ? 'Đóng biểu mẫu' : 'Đăng ký tài sản mới'}
                </Button>
              </div>

              {properties.filter(p => p.parcelId === selectedPropertyParcel.id).length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500 italic">
                  Chưa ghi nhận tài sản gắn liền với đất trên thửa này.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {properties
                    .filter(p => p.parcelId === selectedPropertyParcel.id)
                    .map(prop => (
                      <div
                        key={prop.id}
                        className={`p-3 rounded-lg border text-xs ${
                          prop.status === 'ACTIVE'
                            ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{prop.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {prop.assetType === 'INDIVIDUAL_HOUSE' && 'Nhà ở riêng lẻ'}
                              {prop.assetType === 'APARTMENT' && 'Căn hộ chung cư'}
                              {prop.assetType === 'CONSTRUCTION_WORK' && 'Công trình xây dựng khác'}
                              {prop.assetType === 'PERENNIAL_TREE' && 'Cây lâu năm'}
                              {prop.assetType === 'PRODUCTION_FOREST' && 'Rừng sản xuất'}
                              {' • '}{prop.grade} • {prop.floorsCount} tầng • Hoàn công: {prop.completionYear}
                            </div>
                          </div>
                          <div>
                            {prop.status === 'ACTIVE' ? (
                              <Badge variant="success">Đang sử dụng</Badge>
                            ) : (
                              <Badge variant="neutral">Đã phá dỡ</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-slate-700">
                          <div>
                            <span className="text-slate-500">Diện tích XD:</span> <strong>{prop.constructionArea} m²</strong> (Sàn: <strong>{prop.floorArea} m²</strong>)
                          </div>
                          <div>
                            <span className="text-slate-500">Kết cấu:</span> {prop.structure}
                          </div>
                          <div>
                            <span className="text-slate-500">Chủ sở hữu:</span> <strong>{prop.ownerName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Giấy phép hoàn công:</span> {prop.completionCertificateNumber || 'N/A'}
                          </div>
                        </div>

                        {prop.isJointSpouseOwnership && (
                          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-950 text-[11px]">
                            <strong>Đồng sở hữu vợ chồng theo Luật Đất đai 2024:</strong> {prop.ownerName} (CCCD: {prop.ownerCitizenId}) &amp; {prop.spouseName} (CCCD: {prop.spouseCitizenId})
                          </div>
                        )}

                        {prop.status === 'ACTIVE' && (
                          <div className="flex justify-end mt-2 pt-1.5 border-t border-slate-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemolishProperty(prop.id)}
                              className="text-rose-700 hover:bg-rose-50 border-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-600" />
                              Ghi nhận phá dỡ
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Biểu mẫu đăng ký tài sản mới */}
            {showAddPropertyForm && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  Khai báo tài sản công trình gắn liền với đất mới
                </h4>

                {propError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{propError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Loại tài sản:</label>
                    <Select
                      value={propAssetType}
                      onChange={e => setPropAssetType(e.target.value)}
                      options={[
                        { value: 'INDIVIDUAL_HOUSE', label: 'Nhà ở riêng lẻ' },
                        { value: 'APARTMENT', label: 'Căn hộ chung cư' },
                        { value: 'CONSTRUCTION_WORK', label: 'Công trình xây dựng khác' },
                        { value: 'PERENNIAL_TREE', label: 'Cây lâu năm' },
                        { value: 'PRODUCTION_FOREST', label: 'Rừng sản xuất' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên tài sản / công trình:</label>
                    <Input
                      value={propName}
                      onChange={e => setPropName(e.target.value)}
                      placeholder="Ví dụ: Nhà ở 3 tầng mái bê tông"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diện tích xây dựng (m²):</label>
                    <Input
                      type="number"
                      value={propConstructionArea}
                      onChange={e => setPropConstructionArea(e.target.value)}
                      placeholder="Ví dụ: 85"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diện tích sàn (m²):</label>
                    <Input
                      type="number"
                      value={propFloorArea}
                      onChange={e => setPropFloorArea(e.target.value)}
                      placeholder="Ví dụ: 255"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số tầng:</label>
                    <Input
                      type="number"
                      value={propFloorsCount}
                      onChange={e => setPropFloorsCount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cấp công trình:</label>
                    <Select
                      value={propGrade}
                      onChange={e => setPropGrade(e.target.value)}
                      options={[
                        { value: 'GRADE_1', label: 'Cấp I' },
                        { value: 'GRADE_2', label: 'Cấp II' },
                        { value: 'GRADE_3', label: 'Cấp III' },
                        { value: 'GRADE_4', label: 'Cấp IV' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kết cấu chính:</label>
                    <Input
                      value={propStructure}
                      onChange={e => setPropStructure(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số GP hoàn công / nghiệm thu:</label>
                    <Input
                      value={propCertNumber}
                      onChange={e => setPropCertNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ngày hoàn công:</label>
                    <Input
                      type="date"
                      value={propCertDate}
                      onChange={e => setPropCertDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên chủ sở hữu:</label>
                      <Input
                        value={propOwnerName}
                        onChange={e => setPropOwnerName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Số CCCD chủ sở hữu (12 số):</label>
                      <Input
                        value={propOwnerCccd}
                        onChange={e => setPropOwnerCccd(e.target.value)}
                        placeholder="001090123456"
                      />
                    </div>
                  </div>

                  {/* Đồng sở hữu vợ chồng (QTD-25) */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={propIsJointSpouse}
                        onChange={e => setPropIsJointSpouse(e.target.checked)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span>Xác lập đồng sở hữu vợ chồng theo Luật Đất đai 2024</span>
                    </label>

                    {propIsJointSpouse && (
                      <div className="grid grid-cols-2 gap-3 mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div>
                          <label className="block text-xs font-bold text-emerald-950 mb-1">Họ tên người phối ngẫu (Vợ/Chồng):</label>
                          <Input
                            value={propSpouseName}
                            onChange={e => setPropSpouseName(e.target.value)}
                            placeholder="Nguyễn Thị B"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-emerald-950 mb-1">Số CCCD người phối ngẫu (12 số):</label>
                          <Input
                            value={propSpouseCccd}
                            onChange={e => setPropSpouseCccd(e.target.value)}
                            placeholder="001192654321"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddPropertyForm(false)}>
                    Hủy nhập
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleSaveProperty} isLoading={isSavingProp}>
                    <Check className="w-4 h-4 mr-1" />
                    Lưu đăng ký tài sản
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsPropertiesModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

    
      {/* Modal Đồng bộ CSDL Đất đai Quốc gia qua NDXP (DCS-02-CN-007) */}
      {isSyncModalOpen && (
        <Modal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          title="Đồng Bộ Thời Gian Thực Với Cơ Sở Dữ Liệu Đất Đai Quốc Gia"
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Thanh trạng thái Gateway NDXP */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-900">Trục liên thông quốc gia (NDXP / LGSP):</span>
                  <Badge variant="success">TRỰC TUYẾN (ONLINE)</Badge>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Độ trễ trung bình: <strong className="text-emerald-700">78 ms</strong> (Thời gian thực)
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200 text-center">
                <div className="p-2 bg-white rounded border border-slate-100">
                  <div className="text-[11px] text-slate-500">Tổng sự kiện</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">{syncEvents.length}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-100">
                  <div className="text-[11px] text-slate-500">Đã đồng bộ</div>
                  <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                    {syncEvents.filter(e => e.status === 'SYNCED').length}
                  </div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-100">
                  <div className="text-[11px] text-slate-500">Đang chờ NDXP</div>
                  <div className="text-base font-extrabold text-amber-700 mt-0.5">
                    {syncEvents.filter(e => e.status === 'PENDING').length}
                  </div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-100">
                  <div className="text-[11px] text-slate-500">Cần thử lại</div>
                  <div className="text-base font-extrabold text-rose-700 mt-0.5">
                    {syncEvents.filter(e => e.status === 'FAILED').length}
                  </div>
                </div>
              </div>
            </div>

            {syncSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{syncSuccessMsg}</span>
              </div>
            )}

            {/* Khối kích hoạt đồng bộ chủ động */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-blue-950 uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>Kích hoạt đồng bộ sự kiện biến động tức thời</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Mã thửa đất quốc gia:</label>
                  <Select
                    value={syncTargetParcelCode}
                    onChange={e => setSyncTargetParcelCode(e.target.value)}
                    options={parcels.map(p => ({
                      value: p.nationalCode,
                      label: `${p.nationalCode} (Tờ ${p.sheetNumber}, Thửa ${p.parcelNumber})`,
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Loại biến động:</label>
                  <Select
                    value={syncTargetEventType}
                    onChange={e => setSyncTargetEventType(e.target.value)}
                    options={[
                      { value: 'PARCEL_DECLARED', label: 'Khai báo thửa đất mới' },
                      { value: 'ORIGIN_UPDATED', label: 'Cập nhật nguồn gốc sử dụng đất' },
                      { value: 'TERM_UPDATED', label: 'Cập nhật thời hạn sử dụng đất' },
                      { value: 'PROPERTY_REGISTERED', label: 'Đăng ký tài sản gắn liền với đất' },
                      { value: 'TRANSACTION_LOCKED', label: 'Khóa giao dịch thời gian thực 90p' },
                    ]}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTriggerSync()}
                  isLoading={isTriggeringSync}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Đồng bộ ngay qua NDXP
                </Button>
              </div>
            </div>

            {/* Bảng nhật ký sự kiện đồng bộ NDXP */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3.5 py-2 font-bold text-xs text-slate-800 flex justify-between items-center">
                <span>Nhật ký truyền tin Trục NDXP (Chuỗi băm SHA-256)</span>
                <span className="text-[11px] text-slate-500 font-normal">Tự động làm mới</span>
              </div>
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Mã GD NDXP</th>
                    <th className="px-3 py-2 text-left">Loại biến động</th>
                    <th className="px-3 py-2 text-left">Thửa đất</th>
                    <th className="px-3 py-2 text-left">Trạng thái</th>
                    <th className="px-3 py-2 text-left">Độ trễ</th>
                    <th className="px-3 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {syncEvents.map(evt => (
                    <tr key={evt.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        <div>{evt.ndxpTransactionId}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                          Hash: {evt.checksumSha256.slice(0, 12)}...
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-800">{evt.eventType}</div>
                        {evt.errorMessage && (
                          <div className="text-[11px] text-rose-600 mt-0.5">{evt.errorMessage}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {evt.parcelNationalCode}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {evt.status === 'SYNCED' && <Badge variant="success">Đã đồng bộ</Badge>}
                        {evt.status === 'PENDING' && <Badge variant="warning">Đang xếp hàng</Badge>}
                        {evt.status === 'FAILED' && <Badge variant="danger">Lỗi kết nối</Badge>}
                        {evt.status === 'CONFLICT' && <Badge variant="danger">Xung đột dữ liệu</Badge>}
                      </td>
                      <td className="px-3 py-2 font-mono whitespace-nowrap">
                        {evt.syncLatencyMs > 0 ? (
                          <span className={evt.syncLatencyMs < 150 ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                            {evt.syncLatencyMs} ms
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {evt.status === 'FAILED' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetrySync(evt.id)}
                            className="text-rose-700 hover:bg-rose-50 border-rose-200"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1 text-rose-600" />
                            Thử lại
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Khớp 100%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsSyncModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
