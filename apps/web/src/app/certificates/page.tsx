'use client';

import React, { useState } from 'react';
import { Award, QrCode, ShieldCheck, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export default function CertificatesPage() {
  const [hashInput, setHashInput] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    if (hashInput.includes('invalid') || hashInput.length < 10) {
      setResult({
        isValid: false,
        message: 'CẢNH BÁO: Mã băm QR hoặc số seri không tồn tại trên Cơ sở Dữ liệu Quốc gia. Nguy cơ làm giả cao!',
      });
    } else {
      setResult({
        isValid: true,
        message: 'Giấy chứng nhận quyền sử dụng đất số HỢP PHÁP, chữ ký điện tử hợp lệ.',
        certificateNumber: 'CS 123456',
        serialNumber: 'SR-2026-9901',
        parcelCode: 'HN-BA-DINH.012.0045',
        signer: 'Nguyễn Văn Đạt - Giám đốc VP ĐKĐĐ Chi nhánh Ba Đình',
        issuedAt: '12/08/2026',
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Award className="h-7 w-7 text-blue-600" />
          Cổng Xác Thực Sổ Đỏ Số & Mã QR Quốc Gia
        </h1>
        <p className="text-xs text-slate-500">
          Tra cứu tính toàn vẹn của Giấy chứng nhận quyền sử dụng đất điện tử bằng mã băm SHA-256 hoặc Số seri.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nhập chuỗi mã băm QR hoặc Số phát hành GCN:
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="VD: a8f9c0e2b1d345f6... hoặc CS 123456"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                <Search className="h-4 w-4" />
                Kiểm tra
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Gợi ý thử nghiệm: Nhập bất kỳ chuỗi &gt; 10 ký tự để kiểm tra tính hợp pháp; hoặc nhập &quot;invalid&quot; để thử trường hợp giả mạo.
            </p>
          </div>
        </form>

        {result && (
          <div
            className={`rounded-xl border p-5 space-y-3 ${
              result.isValid
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.isValid ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>XÁC THỰC THÀNH CÔNG</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  <span>CẢNH BÁO RỦI RO PHÁP LÝ</span>
                </>
              )}
            </div>

            <p className="text-xs leading-relaxed">{result.message}</p>

            {result.isValid && (
              <div className="pt-2 border-t border-emerald-200/60 space-y-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-emerald-700">Số GCN:</span>{' '}
                    <strong className="font-mono">{result.certificateNumber}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700">Mã thửa đất:</span>{' '}
                    <strong className="font-mono">{result.parcelCode}</strong>
                  </div>
                </div>
                <div>
                  <span className="text-emerald-700">Người ký số:</span> {result.signer}
                </div>
                <div>
                  <span className="text-emerald-700">Ngày phát hành:</span> {result.issuedAt}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
