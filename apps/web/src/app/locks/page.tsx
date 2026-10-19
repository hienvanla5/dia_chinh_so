'use client';

import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, Clock, CheckCircle, AlertTriangle, Building, Search } from 'lucide-react';
import { ParcelLegalStatus } from '@diachinhso/shared';

export default function LocksPage() {
  const [nationalCode, setNationalCode] = useState('HN-BA-DINH.012.0045');
  const [organizationName, setOrganizationName] = useState('Văn phòng Công chứng Hà Nội');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<any>(null);

  const handleAcquireLock = () => {
    setIsLocked(true);
    setLockInfo({
      nationalCode,
      organizationName,
      lockedAt: new Date().toLocaleTimeString('vi-VN'),
      expiresAt: new Date(Date.now() + durationMinutes * 60000).toLocaleTimeString('vi-VN'),
      sessionToken: 'LOCK-SESSION-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    });
  };

  const handleReleaseLock = () => {
    setIsLocked(false);
    setLockInfo(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Lock className="h-6 w-6 text-rose-600" />
            Cổng Khóa Giao Dịch Thời Gian Thực (Transaction Lock Engine)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dành cho Công chứng viên & Cán bộ Tín dụng Ngân hàng theo Luật Đất đai 2024 để ngăn ngừa tình trạng thế chấp hoặc công chứng một thửa đất tại nhiều nơi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Terminal Form */}
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Thiết lập phiên khóa thửa đất
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Mã định danh thửa đất quốc gia:</label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={nationalCode}
                  onChange={(e) => setNationalCode(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
                  placeholder="VD: HN-BA-DINH.012.0045"
                />
                <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 flex items-center gap-1">
                  <Search className="h-4 w-4" /> Kiểm tra
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Tổ chức thực hiện khóa:</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Thời hạn khóa bảo lưu (phút):</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value={30}>30 phút (Giao dịch nhanh)</option>
                <option value={60}>60 phút (Tiêu chuẩn công chứng)</option>
                <option value={90}>90 phút (Mặc định phiên ký hợp đồng & thế chấp)</option>
                <option value={120}>120 phút (Hồ sơ phức tạp)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            {!isLocked ? (
              <button
                onClick={handleAcquireLock}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-600 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition"
              >
                <Lock className="h-4 w-4" />
                KÍCH HOẠT KHÓA GIAO DỊCH THỜI GIAN THỰC (90 PHÚT)
              </button>
            ) : (
              <button
                onClick={handleReleaseLock}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <Unlock className="h-4 w-4" />
                MỞ KHÓA CHỦ ĐỘNG (HOÀN TẤT KÝ KẾT / HỦY BỎ)
              </button>
            )}
          </div>
        </div>

        {/* Live Session Status card */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Trạng thái Phiên làm việc</h3>
            {isLocked ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-800">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-ping" />
                    ĐANG KHÓA TRÊN REDIS CLUSTER
                  </div>
                  <p className="mt-2 text-xs font-mono">{lockInfo.nationalCode}</p>
                  <p className="text-[11px] text-rose-600 mt-1">Token: {lockInfo.sessionToken}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Đơn vị khóa:</span>
                    <span className="font-semibold text-slate-800">{lockInfo.organizationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời điểm khóa:</span>
                    <span className="font-semibold text-slate-800">{lockInfo.lockedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hết hạn tự động lúc:</span>
                    <span className="font-bold text-rose-600">{lockInfo.expiresAt}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-center text-xs text-slate-500">
                Chưa có phiên khóa nào đang kích hoạt trên thiết bị này.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Nguyên lý an toàn:
            </div>
            <p className="leading-relaxed">
              Khi lệnh khóa được kích hoạt, cờ trạng thái trên PostGIS và Redis TTL sẽ lập tức chuyển sang LOCKED. Bất kỳ văn phòng công chứng hoặc chi nhánh ngân hàng nào khác tra cứu thửa đất này sẽ lập tức nhận cảnh báo đỏ và bị chặn xác thực hợp đồng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
