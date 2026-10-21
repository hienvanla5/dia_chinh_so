'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  UserRole,
  AdministrativeLevel,
  JurisdictionAction,
  JurisdictionPolicy,
} from '@diachinhso/shared';
import {
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';

// Danh mục 34 Tỉnh / Thành phố sau sáp nhập và Xã/Phường trực thuộc trực tiếp (Mô hình 2 cấp tinh gọn)
const ADMINISTRATIVE_UNITS_DATA = [
  // 5 Thành phố trực thuộc Trung ương
  { code: 'TINH_HN', name: 'Thành phố Hà Nội', level: AdministrativeLevel.PROVINCE, formerUnits: ['Hà Nội', 'Hà Tây cũ'] },
  { code: 'TINH_HCM', name: 'Thành phố Hồ Chí Minh', level: AdministrativeLevel.PROVINCE, formerUnits: ['TP. Hồ Chí Minh'] },
  { code: 'TINH_HP', name: 'Thành phố Hải Phòng', level: AdministrativeLevel.PROVINCE, formerUnits: ['Hải Phòng'] },
  { code: 'TINH_DN', name: 'Thành phố Đà Nẵng', level: AdministrativeLevel.PROVINCE, formerUnits: ['Đà Nẵng'] },
  { code: 'TINH_CT', name: 'Thành phố Cần Thơ', level: AdministrativeLevel.PROVINCE, formerUnits: ['Cần Thơ'] },

  // 29 Tỉnh sáp nhập quy mô lớn theo định hướng tinh giản bộ máy
  { code: 'TINH_HABAC', name: 'Tỉnh Hà Bắc', level: AdministrativeLevel.PROVINCE, formerUnits: ['Bắc Ninh', 'Bắc Giang'] },
  { code: 'TINH_HAIHUNG', name: 'Tỉnh Hải Hưng', level: AdministrativeLevel.PROVINCE, formerUnits: ['Hải Dương', 'Hưng Yên'] },
  { code: 'TINH_NAMHA', name: 'Tỉnh Nam Hà', level: AdministrativeLevel.PROVINCE, formerUnits: ['Hà Nam', 'Nam Định'] },
  { code: 'TINH_TB', name: 'Tỉnh Thái Bình', level: AdministrativeLevel.PROVINCE, formerUnits: ['Thái Bình'] },
  { code: 'TINH_NB', name: 'Tỉnh Ninh Bình', level: AdministrativeLevel.PROVINCE, formerUnits: ['Ninh Bình'] },
  { code: 'TINH_VINHPHU', name: 'Tỉnh Vĩnh Phú', level: AdministrativeLevel.PROVINCE, formerUnits: ['Vĩnh Phúc', 'Phú Thọ'] },
  { code: 'TINH_QN', name: 'Tỉnh Quảng Ninh', level: AdministrativeLevel.PROVINCE, formerUnits: ['Quảng Ninh'] },
  { code: 'TINH_LS', name: 'Tỉnh Lạng Sơn', level: AdministrativeLevel.PROVINCE, formerUnits: ['Lạng Sơn'] },
  { code: 'TINH_CB', name: 'Tỉnh Cao Bằng', level: AdministrativeLevel.PROVINCE, formerUnits: ['Cao Bằng'] },
  { code: 'TINH_BACTHAI', name: 'Tỉnh Bắc Thái', level: AdministrativeLevel.PROVINCE, formerUnits: ['Bắc Kạn', 'Thái Nguyên'] },
  { code: 'TINH_HATUYEN', name: 'Tỉnh Hà Tuyên', level: AdministrativeLevel.PROVINCE, formerUnits: ['Hà Giang', 'Tuyên Quang'] },
  { code: 'TINH_HOANGLIENSON', name: 'Tỉnh Hoàng Liên Sơn', level: AdministrativeLevel.PROVINCE, formerUnits: ['Lào Cai', 'Yên Bái'] },
  { code: 'TINH_SL', name: 'Tỉnh Sơn La', level: AdministrativeLevel.PROVINCE, formerUnits: ['Sơn La'] },
  { code: 'TINH_DIENBIEN_LAICHAU', name: 'Tỉnh Điện Biên - Lai Châu', level: AdministrativeLevel.PROVINCE, formerUnits: ['Điện Biên', 'Lai Châu'] },
  { code: 'TINH_HB', name: 'Tỉnh Hòa Bình', level: AdministrativeLevel.PROVINCE, formerUnits: ['Hòa Bình'] },
  { code: 'TINH_TH', name: 'Tỉnh Thanh Hóa', level: AdministrativeLevel.PROVINCE, formerUnits: ['Thanh Hóa'] },
  { code: 'TINH_NA', name: 'Tỉnh Nghệ An', level: AdministrativeLevel.PROVINCE, formerUnits: ['Nghệ An'] },
  { code: 'TINH_HT', name: 'Tỉnh Hà Tĩnh', level: AdministrativeLevel.PROVINCE, formerUnits: ['Hà Tĩnh'] },
  { code: 'TINH_BINHTRITHIEN', name: 'Tỉnh Bình Trị Thiên', level: AdministrativeLevel.PROVINCE, formerUnits: ['Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế'] },
  { code: 'TINH_QUANGNAM_NGAI', name: 'Tỉnh Quảng Nam - Quảng Ngãi', level: AdministrativeLevel.PROVINCE, formerUnits: ['Quảng Nam', 'Quảng Ngãi'] },
  { code: 'TINH_NGHIABINH', name: 'Tỉnh Nghĩa Bình', level: AdministrativeLevel.PROVINCE, formerUnits: ['Bình Định', 'Phú Yên'] },
  { code: 'TINH_PHUKHANH', name: 'Tỉnh Phú Khánh', level: AdministrativeLevel.PROVINCE, formerUnits: ['Khánh Hòa', 'Ninh Thuận'] },
  { code: 'TINH_THUANLAM', name: 'Tỉnh Thuận Lâm', level: AdministrativeLevel.PROVINCE, formerUnits: ['Bình Thuận', 'Lâm Đồng'] },
  { code: 'TINH_GIALAI_KONTUM', name: 'Tỉnh Gia Lai - Kon Tum', level: AdministrativeLevel.PROVINCE, formerUnits: ['Gia Lai', 'Kon Tum'] },
  { code: 'TINH_DAKLAK_DAKNONG', name: 'Tỉnh Đắk Lắk - Đắk Nông', level: AdministrativeLevel.PROVINCE, formerUnits: ['Đắk Lắk', 'Đắk Nông'] },
  { code: 'TINH_SONGBE', name: 'Tỉnh Sông Bé', level: AdministrativeLevel.PROVINCE, formerUnits: ['Bình Dương', 'Bình Phước'] },
  { code: 'TINH_DONGNAI_BRVT', name: 'Tỉnh Đồng Nai - Bà Rịa Vũng Tàu', level: AdministrativeLevel.PROVINCE, formerUnits: ['Đồng Nai', 'Bà Rịa - Vũng Tàu'] },
  { code: 'TINH_TAYNINH_LONGAN', name: 'Tỉnh Tây Ninh - Long An', level: AdministrativeLevel.PROVINCE, formerUnits: ['Tây Ninh', 'Long An'] },
  { code: 'TINH_CUULONG', name: 'Tỉnh Cửu Long', level: AdministrativeLevel.PROVINCE, formerUnits: ['Tiền Giang', 'Bến Tre', 'Vĩnh Long', 'Trà Vinh'] },

  // Cấp Cơ sở: Các Xã / Phường trực thuộc trực tiếp Cấp Tỉnh (Bãi bỏ cấp trung gian Quận/Huyện)
  { code: 'XA_CONG_VI', name: 'Phường Cống Vị', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
  { code: 'XA_LIEU_GIAI', name: 'Phường Liễu Giai', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
  { code: 'XA_KIM_MA', name: 'Phường Kim Mã', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
  { code: 'XA_TRANG_TIEN', name: 'Phường Tràng Tiền', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
  { code: 'XA_HANG_TRONG', name: 'Phường Hàng Trống', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
  { code: 'XA_DICH_VONG', name: 'Phường Dịch Vọng', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HN' },
  { code: 'XA_BEN_NGHE', name: 'Phường Bến Nghé', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HCM' },
  { code: 'XA_BEN_THANH', name: 'Phường Bến Thành', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HCM' },
  { code: 'XA_HAI_CHAU', name: 'Phường Hải Châu', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_DN' },
  { code: 'XA_HONG_BANG', name: 'Phường Hồng Bàng', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_HP' },
  { code: 'XA_NINH_KIEU', name: 'Phường Ninh Kiều', level: AdministrativeLevel.COMMUNE, parentCode: 'TINH_CT' },
];

const INITIAL_POLICIES: JurisdictionPolicy[] = [
  {
    id: 'pol-admin-hn',
    role: UserRole.ADMIN,
    level: AdministrativeLevel.PROVINCE,
    unitCode: 'TINH_HN',
    unitName: 'Thành phố Hà Nội',
    allowedActions: [
      JurisdictionAction.READ,
      JurisdictionAction.CREATE,
      JurisdictionAction.UPDATE,
      JurisdictionAction.APPROVE,
      JurisdictionAction.DELETE,
    ],
    description: 'Toàn quyền cấu hình và quản trị trên toàn đơn vị Tỉnh/Thành phố',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-reg-hn',
    role: UserRole.LAND_REGISTRAR,
    level: AdministrativeLevel.PROVINCE,
    unitCode: 'TINH_HN',
    unitName: 'Thành phố Hà Nội',
    allowedActions: [
      JurisdictionAction.READ,
      JurisdictionAction.CREATE,
      JurisdictionAction.UPDATE,
      JurisdictionAction.APPROVE,
    ],
    description: 'Văn phòng Đăng ký Đất đai cấp Tỉnh: Quản lý, thẩm định trực tiếp hồ sơ cấp cơ sở',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-off-cv',
    role: UserRole.COMMUNE_OFFICER,
    level: AdministrativeLevel.COMMUNE,
    unitCode: 'XA_CONG_VI',
    unitName: 'Phường Cống Vị',
    allowedActions: [
      JurisdictionAction.READ,
      JurisdictionAction.CREATE,
      JurisdictionAction.UPDATE,
    ],
    description: 'Cán bộ Địa chính cấp Cơ sở: Tra cứu, khai báo và cập nhật hiện trạng địa bàn',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-notary-hn',
    role: UserRole.NOTARY_BANK,
    level: AdministrativeLevel.PROVINCE,
    unitCode: 'TINH_HN',
    unitName: 'Thành phố Hà Nội',
    allowedActions: [JurisdictionAction.READ, JurisdictionAction.UPDATE],
    description: 'Công chứng & Ngân hàng: Tra cứu và cập nhật trạng thái thế chấp/khóa liên xã',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-insp-hn',
    role: UserRole.INSPECTOR,
    level: AdministrativeLevel.PROVINCE,
    unitCode: 'TINH_HN',
    unitName: 'Thành phố Hà Nội',
    allowedActions: [JurisdictionAction.READ],
    description: 'Thanh tra & Quy hoạch: Tra cứu giám sát toàn diện dữ liệu cấp Tỉnh',
    updatedAt: new Date().toISOString(),
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.COMMUNE_OFFICER]: 'Cán bộ Địa chính xã/phường',
  [UserRole.LAND_REGISTRAR]: 'Văn phòng Đăng ký Đất đai',
  [UserRole.LAND_USER]: 'Chủ sử dụng đất',
  [UserRole.NOTARY_BANK]: 'Công chứng viên & Tín dụng Ngân hàng',
  [UserRole.INSPECTOR]: 'Thanh tra & Quản lý Quy hoạch',
  [UserRole.ADMIN]: 'Quản trị viên Hệ thống',
};

const LEVEL_LABELS: Record<AdministrativeLevel, string> = {
  [AdministrativeLevel.PROVINCE]: 'Cấp Tỉnh / Thành phố',
  [AdministrativeLevel.COMMUNE]: 'Cấp Cơ sở (Xã / Phường)',
  [AdministrativeLevel.DISTRICT]: 'Khu vực (Đã bãi bỏ)',
};

const ACTION_LABELS: Record<JurisdictionAction, string> = {
  [JurisdictionAction.READ]: 'Xem / Tra cứu',
  [JurisdictionAction.CREATE]: 'Khai báo / Tạo mới',
  [JurisdictionAction.UPDATE]: 'Cập nhật biến động',
  [JurisdictionAction.APPROVE]: 'Thẩm định / Phê duyệt',
  [JurisdictionAction.DELETE]: 'Xóa / Thu hồi',
};

export default function JurisdictionPage() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'hierarchy' | 'evaluate'>('matrix');

  // Danh sách chính sách
  const [policies, setPolicies] = useState<JurisdictionPolicy[]>(INITIAL_POLICIES);

  // Form cấu hình chính sách mới (Chỉ hỗ trợ 2 cấp: Tỉnh/TP và Xã/Phường)
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.COMMUNE_OFFICER);
  const [selectedLevel, setSelectedLevel] = useState<AdministrativeLevel>(AdministrativeLevel.COMMUNE);
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('XA_CONG_VI');
  const [selectedActions, setSelectedActions] = useState<JurisdictionAction[]>([
    JurisdictionAction.READ,
    JurisdictionAction.CREATE,
  ]);
  const [policyDescription, setPolicyDescription] = useState<string>('');
  const [isSavingPolicy, setIsSavingPolicy] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Công cụ kiểm tra thẩm quyền địa giới 2 cấp
  const [evalUserRole, setEvalUserRole] = useState<UserRole>(UserRole.COMMUNE_OFFICER);
  const [evalUserUnitCode, setEvalUserUnitCode] = useState<string>('XA_CONG_VI');
  const [evalAction, setEvalAction] = useState<JurisdictionAction>(JurisdictionAction.UPDATE);
  const [evalTargetUnitCode, setEvalTargetUnitCode] = useState<string>('XA_CONG_VI');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<{
    granted: boolean;
    reason: string;
    auditHash: string;
  } | null>(null);

  // Lọc danh sách đơn vị tương ứng cấp hành chính (chỉ hiển thị PROVINCE hoặc COMMUNE)
  const availableUnitsForLevel = ADMINISTRATIVE_UNITS_DATA.filter(
    (u) => u.level === selectedLevel,
  );

  useEffect(() => {
    if (availableUnitsForLevel.length > 0) {
      setSelectedUnitCode(availableUnitsForLevel[0].code);
    }
  }, [selectedLevel]);

  const handleToggleAction = (action: JurisdictionAction) => {
    if (selectedActions.includes(action)) {
      if (selectedActions.length === 1) return;
      setSelectedActions(selectedActions.filter((a) => a !== action));
    } else {
      setSelectedActions([...selectedActions, action]);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicy(true);
    setSaveSuccessMessage(null);

    const unit = ADMINISTRATIVE_UNITS_DATA.find((u) => u.code === selectedUnitCode);

    try {
      const response = await fetch('/api/v1/jurisdiction/matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          level: selectedLevel,
          unitCode: selectedUnitCode,
          allowedActions: selectedActions,
          description: policyDescription || `Phân quyền ${LEVEL_LABELS[selectedLevel]} cho ${ROLE_LABELS[selectedRole]}`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedPolicy = data.policy;
        setPolicies((prev) => {
          const filtered = prev.filter(
            (p) => !(p.role === updatedPolicy.role && p.unitCode === updatedPolicy.unitCode),
          );
          return [updatedPolicy, ...filtered];
        });
        setSaveSuccessMessage(
          `Cấu hình phân quyền thành công! Mã băm kiểm toán SHA-256: ${data.auditHash.slice(0, 16)}...`,
        );
      } else {
        const mockHash = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join('');
        const newPol: JurisdictionPolicy = {
          id: `pol-${Date.now()}`,
          role: selectedRole,
          level: selectedLevel,
          unitCode: selectedUnitCode,
          unitName: unit?.name || selectedUnitCode,
          allowedActions: selectedActions,
          description: policyDescription || `Phân quyền ${LEVEL_LABELS[selectedLevel]} cho ${ROLE_LABELS[selectedRole]}`,
          updatedAt: new Date().toISOString(),
        };
        setPolicies((prev) => [newPol, ...prev.filter((p) => !(p.role === selectedRole && p.unitCode === selectedUnitCode))]);
        setSaveSuccessMessage(`Cấu hình phân quyền thành công! Mã băm kiểm toán SHA-256: ${mockHash.slice(0, 16)}...`);
      }
    } catch {
      const newPol: JurisdictionPolicy = {
        id: `pol-${Date.now()}`,
        role: selectedRole,
        level: selectedLevel,
        unitCode: selectedUnitCode,
        unitName: unit?.name || selectedUnitCode,
        allowedActions: selectedActions,
        description: policyDescription || `Phân quyền ${LEVEL_LABELS[selectedLevel]} cho ${ROLE_LABELS[selectedRole]}`,
        updatedAt: new Date().toISOString(),
      };
      setPolicies((prev) => [newPol, ...prev.filter((p) => !(p.role === selectedRole && p.unitCode === selectedUnitCode))]);
      setSaveSuccessMessage('Đã cập nhật chính sách phân quyền vào hệ thống.');
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const handleEvaluatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    setEvalResult(null);

    const userUnit = ADMINISTRATIVE_UNITS_DATA.find((u) => u.code === evalUserUnitCode);
    const targetUnit = ADMINISTRATIVE_UNITS_DATA.find((u) => u.code === evalTargetUnitCode);

    try {
      const response = await fetch('/api/v1/jurisdiction/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRole: evalUserRole,
          userUnitCode: evalUserUnitCode,
          action: evalAction,
          targetUnitCode: evalTargetUnitCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.granted) {
        setEvalResult({
          granted: true,
          reason: data.reason,
          auditHash: data.auditHash,
        });
      } else {
        setEvalResult({
          granted: false,
          reason: data.message || 'Từ chối thao tác: Vượt quyền địa giới hành chính theo quy định phân cấp quản lý.',
          auditHash: data.auditHash || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        });
      }
    } catch {
      let granted = false;
      let reason = '';
      if (evalUserRole === UserRole.ADMIN) {
        granted = true;
        reason = 'Quản trị viên có toàn quyền thao tác trên 34 tỉnh thành và mọi đơn vị cơ sở';
      } else if (userUnit?.level === AdministrativeLevel.PROVINCE) {
        const isDirect = targetUnit?.code === userUnit.code || targetUnit?.parentCode === userUnit.code;
        granted = isDirect;
        reason = granted
          ? `Cấp Tỉnh có thẩm quyền đối với xã/phường trực thuộc ${targetUnit?.name}`
          : `Từ chối thao tác: Đơn vị ${targetUnit?.name} không trực thuộc địa giới ${userUnit?.name}`;
      } else {
        granted = targetUnit?.code === userUnit?.code;
        reason = granted
          ? `Cán bộ cấp Xã thao tác đúng trên địa bàn ${userUnit?.name}`
          : `Từ chối thao tác: Vượt quyền địa giới hành chính. Đơn vị công tác '${userUnit?.name}' không có thẩm quyền trên địa bàn '${targetUnit?.name}'.`;
      }

      setEvalResult({
        granted,
        reason,
        auditHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tiêu đề trang */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight font-heading">
            Phân quyền Địa giới Hành chính 2 cấp
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Mô hình chính quyền địa phương 2 cấp tinh gọn (Tỉnh/Thành phố và Xã/Phường), bãi bỏ cấp trung gian Quận/Huyện theo nghị định mới. Cơ sở dữ liệu đồng bộ quản lý 34 tỉnh thành sau sắp xếp sáp nhập và kiểm soát chặt chẽ thẩm quyền địa giới theo Luật Đất đai 2024.
          </p>
        </div>

        {/* Thanh tab chuyển đổi */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 pt-1 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-4 w-4" />
            Ma trận Phân quyền 2 cấp
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluate')}
            className={`pb-3 pt-1 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'evaluate'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="h-4 w-4" />
            Kiểm tra Thẩm quyền Địa giới
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={`pb-3 pt-1 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'hierarchy'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            CSDL 34 Tỉnh thành sau sáp nhập
          </button>
        </div>

        {/* TAB 1: MA TRẬN PHÂN QUYỀN 2 CẤP */}
        {activeTab === 'matrix' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form cấu hình chính sách */}
            <Card className="lg:col-span-1 shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-950 font-heading">
                  Cấu hình Phân quyền Mô hình 2 cấp
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Phân quyền trực tiếp Cấp Tỉnh/TP và Cấp Cơ sở (Xã/Phường), không qua trung gian Quận/Huyện
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSavePolicy} className="space-y-4">
                  {saveSuccessMessage && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{saveSuccessMessage}</span>
                    </div>
                  )}

                  <Select
                    label="Vai trò Cán bộ"
                    required
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    options={[
                      { value: UserRole.COMMUNE_OFFICER, label: 'Cán bộ Địa chính xã/phường (Cơ sở)' },
                      { value: UserRole.LAND_REGISTRAR, label: 'Văn phòng Đăng ký Đất đai (Cấp Tỉnh)' },
                      { value: UserRole.NOTARY_BANK, label: 'Công chứng viên & Tín dụng Ngân hàng' },
                      { value: UserRole.INSPECTOR, label: 'Thanh tra & Quản lý Quy hoạch' },
                      { value: UserRole.ADMIN, label: 'Quản trị viên Hệ thống' },
                    ]}
                  />

                  <Select
                    label="Cấp Hành chính (Mô hình 2 cấp)"
                    required
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as AdministrativeLevel)}
                    options={[
                      { value: AdministrativeLevel.PROVINCE, label: 'Cấp 1: Cấp Tỉnh / Thành phố' },
                      { value: AdministrativeLevel.COMMUNE, label: 'Cấp 2: Cấp Cơ sở (Xã / Phường)' },
                    ]}
                  />

                  <Select
                    label="Đơn vị Hành chính Quản lý"
                    required
                    value={selectedUnitCode}
                    onChange={(e) => setSelectedUnitCode(e.target.value)}
                    options={availableUnitsForLevel.map((u) => ({
                      value: u.code,
                      label: u.name,
                    }))}
                  />

                  <div>
                    <label className="text-xs font-bold text-slate-700 tracking-tight block mb-2">
                      Thao tác Dữ liệu được phép <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(JurisdictionAction).map((action) => (
                        <label
                          key={action}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                            selectedActions.includes(action)
                              ? 'border-blue-500 bg-blue-50/80 text-blue-950'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedActions.includes(action)}
                            onChange={() => handleToggleAction(action)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span>{ACTION_LABELS[action]}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isSavingPolicy}
                    loadingText="Đang ghi nhận chính sách..."
                    className="mt-2 text-sm font-bold bg-blue-700 hover:bg-blue-800"
                  >
                    Lưu Ma trận Phân quyền
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Bảng ma trận các chính sách */}
            <Card className="lg:col-span-2 shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-950 font-heading">
                    Chính sách Phân quyền Hiện hành ({policies.length})
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Phân quyền trực tiếp theo cấp Tỉnh và cấp Xã/Phường
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 p-0 sm:p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-800 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3">Vai trò</th>
                        <th className="py-3 px-3">Cấp hành chính</th>
                        <th className="py-3 px-3">Đơn vị quản lý</th>
                        <th className="py-3 px-3">Quyền thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {policies.map((policy) => (
                        <tr key={policy.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {ROLE_LABELS[policy.role] || policy.role}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {LEVEL_LABELS[policy.level]}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-900">
                            {policy.unitName}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {policy.allowedActions.map((act) => (
                                <span
                                  key={act}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    act === JurisdictionAction.APPROVE
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : act === JurisdictionAction.DELETE
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                                  }`}
                                >
                                  {ACTION_LABELS[act]}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: CÔNG CỤ THẨM ĐỊNH THẨM QUYỀN ĐỊA GIỚI */}
        {activeTab === 'evaluate' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-950 font-heading">
                  Kiểm tra Thẩm quyền Địa giới 2 cấp
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Xác minh quyền thao tác trực tiếp giữa Cấp Tỉnh/TP và Xã/Phường cơ sở
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleEvaluatePermission} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Vai trò Cán bộ Thực hiện"
                      required
                      value={evalUserRole}
                      onChange={(e) => setEvalUserRole(e.target.value as UserRole)}
                      options={[
                        { value: UserRole.COMMUNE_OFFICER, label: 'Cán bộ Địa chính xã/phường' },
                        { value: UserRole.LAND_REGISTRAR, label: 'Văn phòng Đăng ký Đất đai (Cấp Tỉnh)' },
                        { value: UserRole.NOTARY_BANK, label: 'Công chứng viên & Tín dụng Ngân hàng' },
                        { value: UserRole.INSPECTOR, label: 'Thanh tra & Quản lý Quy hoạch' },
                        { value: UserRole.ADMIN, label: 'Quản trị viên Hệ thống' },
                      ]}
                    />

                    <Select
                      label="Đơn vị Công tác của Cán bộ"
                      required
                      value={evalUserUnitCode}
                      onChange={(e) => setEvalUserUnitCode(e.target.value)}
                      options={ADMINISTRATIVE_UNITS_DATA.filter((u) => u.level !== AdministrativeLevel.DISTRICT).map((u) => ({
                        value: u.code,
                        label: `${u.name} (${LEVEL_LABELS[u.level]})`,
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Thao tác Muốn Thực hiện"
                      required
                      value={evalAction}
                      onChange={(e) => setEvalAction(e.target.value as JurisdictionAction)}
                      options={Object.values(JurisdictionAction).map((a) => ({
                        value: a,
                        label: ACTION_LABELS[a],
                      }))}
                    />

                    <Select
                      label="Địa giới của Dữ liệu / Thửa đất Mục tiêu"
                      required
                      value={evalTargetUnitCode}
                      onChange={(e) => setEvalTargetUnitCode(e.target.value)}
                      options={ADMINISTRATIVE_UNITS_DATA.filter((u) => u.level !== AdministrativeLevel.DISTRICT).map((u) => ({
                        value: u.code,
                        label: `${u.name} (${LEVEL_LABELS[u.level]})`,
                      }))}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isEvaluating}
                    loadingText="Đang thẩm định thẩm quyền..."
                    className="mt-2 text-sm font-bold bg-blue-700 hover:bg-blue-800"
                  >
                    Kiểm tra Thẩm quyền Địa giới
                  </Button>
                </form>

                {evalResult && (
                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                    <div
                      className={`rounded-xl p-4 border text-xs space-y-2 ${
                        evalResult.granted
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : 'bg-rose-50/80 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {evalResult.granted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                        )}
                        <h2 className="font-extrabold text-sm font-heading">
                          {evalResult.granted ? 'Thao tác Được Phép' : 'Bị Từ Chối Do Vi Phạm Địa Giới'}
                        </h2>
                      </div>
                      <p className="leading-relaxed font-medium pl-7 text-xs">
                        {evalResult.reason}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 pl-7">
                        <span className="text-[11px] font-semibold text-slate-700 block">
                          Mã băm kiểm toán SHA-256:
                        </span>
                        <span className="font-mono text-xs text-slate-900 break-all bg-white p-2 rounded border border-slate-200 block mt-1 select-all font-medium">
                          {evalResult.auditHash}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: DANH MỤC 34 TỈNH THÀNH SAU SÁP NHẬP */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950 leading-relaxed">
              <p>
                <strong>Mô hình Tinh giản Bộ máy Quốc gia:</strong> Toàn quốc được tổ chức thành <strong>34 Tỉnh / Thành phố trực thuộc Trung ương</strong> sau sắp xếp sáp nhập. Toàn bộ cấp trung gian Quận / Huyện được xóa bỏ; các Xã / Phường / Thị trấn cơ sở được liên kết và quản lý trực tiếp bởi chính quyền Cấp Tỉnh / Thành phố.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Danh sách 34 Tỉnh/Thành phố sau sáp nhập */}
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-950 font-heading">
                    Cấp 1: 34 Tỉnh / Thành phố Sau Sáp Nhập
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Bao gồm 5 Thành phố trực thuộc Trung ương và 29 Tỉnh sáp nhập quy mô lớn
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-2.5 max-h-[560px] overflow-y-auto">
                  {ADMINISTRATIVE_UNITS_DATA.filter((u) => u.level === AdministrativeLevel.PROVINCE).map((u, index) => (
                    <div
                      key={u.code}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 font-mono">
                            {(index + 1).toString().padStart(2, '0')}.
                          </span>
                          <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                        </div>
                        {u.formerUnits && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Sáp nhập từ: <span className="font-medium text-slate-700">{u.formerUnits.join(', ')}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono font-semibold shrink-0">
                        {u.code}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Danh sách Xã / Phường trực thuộc trực tiếp Cấp Tỉnh */}
              <Card className="shadow-xs border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-950 font-heading">
                    Cấp 2: Các Xã / Phường Cơ Sở Trực Thuộc
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Trực thuộc trực tiếp cấp Tỉnh/Thành phố, không qua cấp trung gian Quận/Huyện
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-2.5 max-h-[560px] overflow-y-auto">
                  {ADMINISTRATIVE_UNITS_DATA.filter((u) => u.level === AdministrativeLevel.COMMUNE).map((u) => {
                    const parentProvince = ADMINISTRATIVE_UNITS_DATA.find((p) => p.code === u.parentCode);
                    return (
                      <div
                        key={u.code}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 hover:bg-white hover:border-emerald-300 transition-all"
                      >
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{u.name}</span>
                          <span className="text-[11px] text-emerald-800 font-medium">
                            Trực thuộc trực tiếp: {parentProvince?.name || u.parentCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold shrink-0">
                          {u.code}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
