'use client';

import React, { useState } from 'react';
import { FileText, ShieldCheck, QrCode, Search, Filter, ExternalLink } from 'lucide-react';
import { ParcelLegalStatus, LandPurposeCode } from '@diachinhso/shared';

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

  const filtered = sampleParcels.filter(
    (p) =>
      p.nationalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản lý Dữ liệu Thửa đất & Sổ Đỏ Số</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu thông tin địa chính, mã định danh quốc gia 15 ký tự và xác thực Giấy chứng nhận điện tử.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, chủ sở hữu, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none w-72"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="p-4">Mã định danh Quốc gia</th>
              <th className="p-4">Tờ / Thửa</th>
              <th className="p-4">Diện tích</th>
              <th className="p-4">Mục đích SD</th>
              <th className="p-4">Chủ sở hữu</th>
              <th className="p-4">Trạng thái Pháp lý</th>
              <th className="p-4 text-right">Sổ Đỏ Số</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((parcel) => (
              <tr key={parcel.id} className="hover:bg-slate-50/80 transition">
                <td className="p-4 font-mono font-bold text-slate-900">{parcel.nationalCode}</td>
                <td className="p-4 font-semibold text-slate-700">Tờ {parcel.sheetNumber} / Thửa {parcel.parcelNumber}</td>
                <td className="p-4 font-semibold text-slate-800">{parcel.area} m²</td>
                <td className="p-4">
                  <span className="rounded bg-blue-100 px-2 py-0.5 font-bold text-blue-700">
                    {parcel.purposeCode}
                  </span>
                </td>
                <td className="p-4 text-slate-700">{parcel.owner}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      parcel.legalStatus === ParcelLegalStatus.AVAILABLE
                        ? 'bg-emerald-100 text-emerald-800'
                        : parcel.legalStatus === ParcelLegalStatus.LOCKED
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {parcel.legalStatus}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setActiveModalCertificate(parcel)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <QrCode className="h-3.5 w-3.5 text-blue-600" />
                    Xem GCN
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal View Digital Certificate */}
      {activeModalCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Giấy Chứng Nhận Điện Tử (Sổ Đỏ Số)</h3>
              </div>
              <button
                onClick={() => setActiveModalCertificate(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2 text-xs">
              <div className="flex justify-between font-mono font-bold text-slate-800">
                <span>Số phát hành: {activeModalCertificate.certificateNumber}</span>
                <span className="text-emerald-700">CHỮ KÝ SỐ HỢP LỆ</span>
              </div>
              <p className="text-slate-600">Thửa đất: <strong className="text-slate-900">{activeModalCertificate.nationalCode}</strong></p>
              <p className="text-slate-600">Chủ sở hữu: <strong className="text-slate-900">{activeModalCertificate.owner}</strong></p>
              <p className="text-slate-600">Địa chỉ: {activeModalCertificate.address}</p>
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 font-mono block">Mã băm QR SHA-256:</span>
                <span className="font-mono text-[10px] text-slate-600 break-all bg-white p-1.5 rounded border border-slate-200 block mt-0.5">
                  {activeModalCertificate.qrHash}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModalCertificate(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
