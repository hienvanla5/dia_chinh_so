'use client';

import React, { useState } from 'react';
import { FileText, Send, CheckCircle2, Clock, Upload, AlertCircle } from 'lucide-react';
import { FluctuationType, DossierStatus } from '@diachinhso/shared';

const sampleDossiers = [
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

export default function DossiersPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [parcelCode, setParcelCode] = useState('');
  const [fluctuationType, setFluctuationType] = useState<FluctuationType>(FluctuationType.TRANSFER);
  const [applicantName, setApplicantName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveTab('list');
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cổng Dịch Vụ Công Biến Động Đất Đai</h1>
          <p className="text-sm text-slate-500 mt-1">
            Nộp hồ sơ trực tuyến theo quy trình dịch vụ công toàn trình Luật Đất đai 2024.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'list'
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Danh sách Hồ sơ
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            + Nộp hồ sơ mới
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-4">Mã hồ sơ</th>
                <th className="p-4">Thửa đất</th>
                <th className="p-4">Loại biến động</th>
                <th className="p-4">Người nộp</th>
                <th className="p-4">Ngày nộp</th>
                <th className="p-4">Trạng thái xử lý</th>
                <th className="p-4">Thời hạn SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleDossiers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-blue-600">{item.code}</td>
                  <td className="p-4 font-mono text-slate-800">{item.parcelCode}</td>
                  <td className="p-4 font-semibold text-slate-700">{item.fluctuationType}</td>
                  <td className="p-4 text-slate-700">{item.applicant}</td>
                  <td className="p-4 text-slate-500">{item.submittedAt}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-emerald-600">{item.slaRemaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Thông tin nộp hồ sơ biến động trực tuyến
          </h2>

          {isSuccess && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Nộp hồ sơ thành công! Mã hồ sơ đã được đồng bộ lên cơ sở dữ liệu quốc gia.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Mã định danh thửa đất:</label>
              <input
                type="text"
                required
                value={parcelCode}
                onChange={(e) => setParcelCode(e.target.value)}
                placeholder="VD: HN-BA-DINH.012.0045"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Loại biến động:</label>
              <select
                value={fluctuationType}
                onChange={(e) => setFluctuationType(e.target.value as FluctuationType)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value={FluctuationType.TRANSFER}>Chuyển nhượng quyền sử dụng đất</option>
                <option value={FluctuationType.DONATION}>Tặng cho quyền sử dụng đất</option>
                <option value={FluctuationType.INHERITANCE}>Thừa kế quyền sử dụng đất</option>
                <option value={FluctuationType.SUBDIVISION}>Tách thửa đất</option>
                <option value={FluctuationType.MORTGAGE}>Đăng ký thế chấp bảo đảm</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Họ và tên người nộp:</label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Số CCCD (12 chữ số):</label>
              <input
                type="text"
                required
                maxLength={12}
                value={citizenId}
                onChange={(e) => setCitizenId(e.target.value)}
                placeholder="001090012345"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Số điện thoại liên hệ:</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912345678"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Tài liệu đính kèm:</label>
              <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-3 text-center text-xs text-slate-500 hover:border-blue-400 cursor-pointer">
                <Upload className="h-4 w-4 mx-auto text-slate-400 mb-1" />
                Tải lên bản scan Hợp đồng / Giấy tờ pháp lý (PDF, JPG)
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Nộp hồ sơ trực tuyến
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
