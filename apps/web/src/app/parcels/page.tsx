'use client';

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  QrCode,
  Filter,
  Plus,
  ExternalLink,
  MapPin,
  Building,
} from 'lucide-react';
import { ParcelLegalStatus, LandPurposeCode } from '@diachinhso/shared';
import {
  Button,
  ButtonCreate,
  ButtonView,
  SearchInput,
  ParcelStatusBadge,
  SearchEmptyState,
  Modal,
  Badge,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';

const initialParcels = [
  {
    id: 'p-1',
    nationalCode: 'HN-BA-DINH.012.0045',
    sheetNumber: 12,
    parcelNumber: 45,
    area: 125.6,
    purposeCode: LandPurposeCode.ODT,
    address: 'Số 18 Phố Liễu Giai, Phường Cống Vị, Quận Ba Đình, Hà Nội',
    legalStatus: ParcelLegalStatus.AVAILABLE,
    owner: 'Nguyễn Văn An',
    certificateNumber: 'CS 123456',
    qrHash: 'a8f9c0e2b1d345f67890abcdef1234567890abcdef1234567890abcdef123456',
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
    owner: 'Trần Thị Mai',
    certificateNumber: 'CS 987654',
    qrHash: 'b7e8d1c3a2f456e78901bcdef2345678901bcdef2345678901bcdef234567',
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
    owner: 'Công ty CP Đầu tư Thương mại Thăng Long',
    certificateNumber: 'CS 445566',
    qrHash: 'c6d7e2b4a3e567f89012cdef3456789012cdef3456789012cdef345678',
  },
];

export default function ParcelsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModalCertificate, setActiveModalCertificate] = useState<any>(null);

  const filtered = initialParcels.filter(
    (p) =>
      p.nationalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Dữ liệu Thửa đất & Sổ Đỏ Số"
        description="Tra cứu thông tin địa chính, mã định danh quốc gia 15 ký tự và xác thực Giấy chứng nhận quyền sử dụng đất điện tử theo Luật Đất đai 2024."
        badge={
          <Badge variant="primary" size="md">
            {initialParcels.length} Thửa đất quản lý
          </Badge>
        }
        breadcrumbs={[
          { label: 'Cơ sở dữ liệu', href: '/parcels' },
          { label: 'Danh mục thửa đất' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <ButtonCreate
              onClick={() =>
                alert('Tính năng tiếp nhận thửa đất mới theo quy trình cấp GCN lần đầu.')
              }
            >
              Thêm thửa đất mới
            </ButtonCreate>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-96">
          <SearchInput
            placeholder="Tìm theo mã định danh, số tờ/thửa, chủ sở hữu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            size="md"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
            Lọc trạng thái
          </Button>
        </div>
      </div>

      {/* Table Data */}
      {filtered.length === 0 ? (
        <SearchEmptyState searchTerm={searchTerm} onReset={() => setSearchTerm('')} />
      ) : (
        <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-4">Mã định danh Quốc gia</th>
                  <th className="p-4">Tờ / Thửa</th>
                  <th className="p-4">Diện tích</th>
                  <th className="p-4">Mục đích SD</th>
                  <th className="p-4">Chủ sở hữu</th>
                  <th className="p-4">Trạng thái Pháp lý</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary-900">
                      {parcel.nationalCode}
                    </td>
                    <td className="p-4 font-semibold text-slate-700">
                      Tờ {parcel.sheetNumber} / Thửa {parcel.parcelNumber}
                    </td>
                    <td className="p-4 font-bold text-slate-800">{parcel.area} m²</td>
                    <td className="p-4">
                      <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-200 text-[11px]">
                        {parcel.purposeCode}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{parcel.owner}</td>
                    <td className="p-4">
                      <ParcelStatusBadge status={parcel.legalStatus} />
                    </td>
                    <td className="p-4 text-right">
                      <ButtonView
                        size="xs"
                        leftIcon={<QrCode className="h-3.5 w-3.5 text-blue-600" />}
                        onClick={() => setActiveModalCertificate(parcel)}
                      >
                        Xem Sổ Đỏ Số
                      </ButtonView>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal View Digital Certificate */}
      <Modal
        isOpen={Boolean(activeModalCertificate)}
        onClose={() => setActiveModalCertificate(null)}
        title="Giấy Chứng Nhận Quyền Sử Dụng Đất Điện Tử"
        description="Bản số hóa có giá trị pháp lý tương đương bản giấy theo Nghị định quy định chi tiết Luật Đất đai 2024."
        icon={
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
        }
        footer={
          <Button variant="secondary" size="sm" onClick={() => setActiveModalCertificate(null)}>
            Đóng cửa sổ
          </Button>
        }
      >
        {activeModalCertificate && (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span className="font-mono text-sm text-slate-900">
                  Số phát hành: {activeModalCertificate.certificateNumber}
                </span>
                <Badge variant="success" dot size="sm">
                  CHỮ KÝ SỐ HỢP LỆ
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block text-[11px]">Mã định danh thửa đất:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeModalCertificate.nationalCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Diện tích chứng nhận:</span>
                  <span className="font-bold text-slate-900">
                    {activeModalCertificate.area} m² ({activeModalCertificate.purposeCode})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Người sử dụng đất:</span>
                <span className="font-semibold text-slate-900">
                  {activeModalCertificate.owner}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Địa chỉ thửa đất:</span>
                <span className="text-slate-700">{activeModalCertificate.address}</span>
              </div>

              <div className="pt-2 border-t border-emerald-200/60">
                <span className="text-[10px] text-slate-500 font-mono block">
                  Mã băm QR SHA-256 xác thực trực tuyến:
                </span>
                <span className="font-mono text-[10px] text-slate-700 break-all bg-white p-2 rounded-lg border border-slate-200 block mt-1 select-all">
                  {activeModalCertificate.qrHash}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
