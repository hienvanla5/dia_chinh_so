'use client';

import React, { useState } from 'react';
import {
  Map as MapIcon,
  Layers,
  Search,
  Filter,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Info,
  Maximize2,
  Compass,
} from 'lucide-react';
import { ParcelLegalStatus, LandPurposeCode } from '@diachinhso/shared';
import {
  Button,
  SearchInput,
  ParcelStatusBadge,
  Badge,
} from '@/components/ui';

// Danh sách thửa đất mẫu phục vụ hiển thị bản đồ GIS
const sampleParcels = [
  {
    id: 'p-1',
    nationalCode: 'HN-BA-DINH.012.0045',
    sheetNumber: 12,
    parcelNumber: 45,
    area: 125.6,
    purposeCode: LandPurposeCode.ODT,
    address: 'Số 18 Phố Liễu Giai, Phường Cống Vị, Quận Ba Đình, Hà Nội',
    legalStatus: ParcelLegalStatus.AVAILABLE,
    owner: 'Nguyễn Văn An (CCCD: 001090012345)',
    certificateNumber: 'CS 123456',
    vertices: [
      { pointIndex: 1, x: 2321450.2, y: 504210.5 },
      { pointIndex: 2, x: 2321462.8, y: 504225.1 },
      { pointIndex: 3, x: 2321448.0, y: 504238.6 },
      { pointIndex: 4, x: 2321435.4, y: 504224.0 },
    ],
  },
  {
    id: 'p-2',
    nationalCode: 'HN-BA-DINH.012.0046',
    sheetNumber: 12,
    parcelNumber: 46,
    area: 89.2,
    purposeCode: LandPurposeCode.ODT,
    address: 'Số 20 Phố Liễu Giai, Phường Cống Vị, Quận Ba Đình, Hà Nội',
    legalStatus: ParcelLegalStatus.LOCKED,
    owner: 'Trần Thị Mai (CCCD: 001192008765)',
    lockedBy: 'Văn phòng Công chứng Thăng Long (Phiên giao dịch: #TX-9021)',
    expiresIn: 'Còn 54 phút',
    certificateNumber: 'CS 987654',
    vertices: [
      { pointIndex: 1, x: 2321462.8, y: 504225.1 },
      { pointIndex: 2, x: 2321475.0, y: 504239.5 },
      { pointIndex: 3, x: 2321460.5, y: 504252.8 },
      { pointIndex: 4, x: 2321448.0, y: 504238.6 },
    ],
  },
  {
    id: 'p-3',
    nationalCode: 'HN-BA-DINH.012.0047',
    sheetNumber: 12,
    parcelNumber: 47,
    area: 210.0,
    purposeCode: LandPurposeCode.TMD,
    address: 'Số 22 Phố Liễu Giai, Phường Cống Vị, Quận Ba Đình, Hà Nội',
    legalStatus: ParcelLegalStatus.MORTGAGED,
    owner: 'Công ty CP Đầu tư Thương mại Thăng Long (MST: 0102938475)',
    certificateNumber: 'CS 445566',
    vertices: [
      { pointIndex: 1, x: 2321475.0, y: 504239.5 },
      { pointIndex: 2, x: 2321495.2, y: 504260.0 },
      { pointIndex: 3, x: 2321478.1, y: 504275.4 },
      { pointIndex: 4, x: 2321460.5, y: 504252.8 },
    ],
  },
];

export default function MapPage() {
  const [selectedParcel, setSelectedParcel] = useState(sampleParcels[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLayer, setActiveLayer] = useState<'cadastral' | 'planning' | 'satellite'>('cadastral');

  const filteredParcels = sampleParcels.filter(
    (p) =>
      p.nationalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      {/* Top search & tool bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <SearchInput
            placeholder="Nhập mã thửa (HN-BA-DINH.012...) hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Lớp bản đồ:</span>
          <Button
            variant={activeLayer === 'cadastral' ? 'primary' : 'outline'}
            size="xs"
            onClick={() => setActiveLayer('cadastral')}
          >
            Địa chính (VN-2000)
          </Button>
          <Button
            variant={activeLayer === 'planning' ? 'primary' : 'outline'}
            size="xs"
            onClick={() => setActiveLayer('planning')}
          >
            Quy hoạch sử dụng đất
          </Button>
        </div>
      </div>

      {/* Main Map + Details Panel Container */}
      <div className="relative flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-inner">
        {/* Mock Map Canvas */}
        <div className="relative flex-1 bg-[#1e293b] flex items-center justify-center overflow-hidden">
          {/* Grid lines simulating GIS coordinate grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

          {/* Interactive Parcels simulation */}
          <div className="relative z-10 flex gap-6 p-10">
            {filteredParcels.map((parcel) => {
              const isSelected = selectedParcel?.id === parcel.id;
              const isLocked = parcel.legalStatus === ParcelLegalStatus.LOCKED;
              const isMortgaged = parcel.legalStatus === ParcelLegalStatus.MORTGAGED;

              return (
                <div
                  key={parcel.id}
                  onClick={() => setSelectedParcel(parcel)}
                  className={`group relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 ${
                    isSelected
                      ? 'border-yellow-400 bg-blue-900/60 shadow-lg shadow-blue-500/20 scale-105'
                      : 'border-slate-600 bg-slate-800/80 hover:border-blue-400 hover:bg-slate-800'
                  }`}
                  style={{ width: '180px', height: '140px' }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">
                      Tờ: {parcel.sheetNumber} / Thửa: {parcel.parcelNumber}
                    </span>
                    {isLocked ? (
                      <span className="rounded bg-rose-500/20 px-1 text-[10px] font-bold text-rose-300">
                        KHÓA
                      </span>
                    ) : isMortgaged ? (
                      <span className="rounded bg-amber-500/20 px-1 text-[10px] font-bold text-amber-300">
                        THẾ CHẤP
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/20 px-1 text-[10px] font-bold text-emerald-300">
                        SẴN SÀNG
                      </span>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-mono text-xs text-slate-300">{parcel.area} m²</p>
                    <span className="mt-1 inline-block rounded bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                      {parcel.purposeCode}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 truncate">
                    {parcel.address}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coordinate overlay badge */}
          <div className="absolute bottom-4 left-4 z-20 rounded-lg bg-slate-900/80 p-2 font-mono text-[11px] text-slate-300 backdrop-blur border border-slate-700">
            Hệ quy chiếu: VN-2000 (Kinh tuyến trục 105°00&apos;, múi chiếu 3°) | Độ cao H: Hòn Dấu
          </div>
        </div>

        {/* Selected Parcel Side Panel */}
        {selectedParcel && (
          <div className="w-96 flex-shrink-0 border-l border-slate-200 bg-white p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Thông tin Địa chính Số
                </span>
                <h3 className="font-mono text-sm font-bold text-slate-900">
                  {selectedParcel.nationalCode}
                </h3>
              </div>
              <ParcelStatusBadge status={selectedParcel.legalStatus} size="sm" />
            </div>

            {selectedParcel.legalStatus === ParcelLegalStatus.LOCKED && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lock className="h-4 w-4 text-rose-600" />
                  <span>Đang trong phiên khóa công chứng</span>
                </div>
                <p>Khóa bởi: {selectedParcel.lockedBy}</p>
                <p className="font-semibold text-rose-600">Thời gian còn lại: {selectedParcel.expiresIn}</p>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500">Địa chỉ thửa đất:</span>
                <p className="font-medium text-slate-900 mt-0.5">{selectedParcel.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Diện tích:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedParcel.area} m²</p>
                </div>
                <div>
                  <span className="text-slate-500">Mục đích sử dụng:</span>
                  <p className="font-bold text-blue-600 mt-0.5">{selectedParcel.purposeCode}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-500">Chủ sở hữu hiện tại:</span>
                <p className="font-medium text-slate-900 mt-0.5">{selectedParcel.owner}</p>
              </div>
              <div>
                <span className="text-slate-500">Số phát hành Giấy chứng nhận:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedParcel.certificateNumber}</p>
              </div>
            </div>

            {/* Bảng tọa độ đỉnh VN-2000 */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-700">Tọa độ đỉnh ranh giới (VN-2000):</span>
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-1.5">Đỉnh</th>
                    <th className="p-1.5">X (Bắc - m)</th>
                    <th className="p-1.5">Y (Đông - m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {selectedParcel.vertices.map((v) => (
                    <tr key={v.pointIndex}>
                      <td className="p-1.5 font-bold">{v.pointIndex}</td>
                      <td className="p-1.5">{v.x.toFixed(2)}</td>
                      <td className="p-1.5">{v.y.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                onClick={() => alert(`Đã xác thực dữ liệu thửa đất ${selectedParcel.nationalCode}`)}
              >
                Kiểm tra Tính Toàn Vẹn Sổ Đỏ Số
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
