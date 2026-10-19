'use client';

import React, { useState } from 'react';
import { Award, QrCode, ShieldCheck, CheckCircle2, AlertTriangle, Search, FileKey2 } from 'lucide-react';
import {
  Button,
  ButtonSearch,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';

export default function CertificatesPage() {
  const [hashInput, setHashInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (hashInput.includes('invalid') || hashInput.length < 10) {
        setResult({
          isValid: false,
          message:
            'CẢNH BÁO: Mã băm QR hoặc số seri không tồn tại trên Cơ sở Dữ liệu Quốc gia. Nguy cơ tài liệu bị làm giả hoặc đã bị thu hồi!',
        });
      } else {
        setResult({
          isValid: true,
          message:
            'Giấy chứng nhận quyền sử dụng đất điện tử HỢP PHÁP, toàn vẹn dữ liệu, chữ ký số đã được kiểm tra trên PostGIS.',
          certificateNumber: 'CS 123456',
          serialNumber: 'SR-2026-9901',
          parcelCode: 'HN-BA-DINH.012.0045',
          signer: 'Nguyễn Văn Đạt - Giám đốc VP ĐKĐĐ Chi nhánh Ba Đình',
          issuedAt: '12/08/2026',
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Cổng Xác Thực Sổ Đỏ Số & Mã QR Quốc Gia"
        description="Tra cứu tính toàn vẹn của Giấy chứng nhận quyền sử dụng đất điện tử theo thời gian thực bằng mã băm SHA-256 hoặc Số phát hành GCN."
        breadcrumbs={[
          { label: 'Sổ Đỏ Số', href: '/certificates' },
          { label: 'Xác thực trực tuyến' },
        ]}
        badge={
          <Badge variant="success" dot size="md">
            SHA-256 Blockchain & PostGIS
          </Badge>
        }
      />

      <Card>
        <form onSubmit={handleVerify}>
          <CardHeader>
            <CardTitle>Kiểm tra Tính Pháp Lý của Giấy Chứng Nhận</CardTitle>
            <CardDescription>
              Quét mã QR trên Sổ Đỏ Số hoặc nhập trực tiếp chuỗi băm 64 ký tự / số seri để kiểm tra với CSDL Quốc gia.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="Mã băm QR hoặc Số phát hành GCN"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="VD: a8f9c0e2b1d345f6... hoặc CS 123456"
                  helperText='Gợi ý kiểm thử: Nhập bất kỳ chuỗi > 10 ký tự để thử TH hợp lệ; nhập "invalid" để xem cảnh báo làm giả.'
                  leadingIcon={<FileKey2 className="h-4 w-4" />}
                  required
                />
              </div>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isVerifying}
                loadingText="Đang xác thực..."
                leftIcon={<Search className="h-4 w-4" />}
              >
                Xác thực ngay
              </Button>
            </div>

            {result && (
              <div
                className={`rounded-xl border p-5 space-y-3 transition-all duration-200 ${
                  result.isValid
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    : 'border-rose-200 bg-rose-50 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {result.isValid ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <span>XÁC THỰC THÀNH CÔNG - CHỨNG THƯ HỢP PHÁP</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-rose-600" />
                      <span>CẢNH BÁO RỦI RO PHÁP LÝ NGHIÊM TRỌNG</span>
                    </>
                  )}
                </div>

                <p className="text-xs leading-relaxed">{result.message}</p>

                {result.isValid && (
                  <div className="pt-3 border-t border-emerald-200/60 space-y-2 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-emerald-800 block text-[11px]">Số phát hành GCN:</span>
                        <strong className="font-mono text-sm text-slate-900">{result.certificateNumber}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-800 block text-[11px]">Mã định danh thửa đất:</span>
                        <strong className="font-mono text-sm text-slate-900">{result.parcelCode}</strong>
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="text-emerald-800 text-[11px]">Người ký số có thẩm quyền:</span>{' '}
                      <strong className="text-slate-900">{result.signer}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-800 text-[11px]">Thời điểm ký phát hành:</span>{' '}
                      <span className="text-slate-700 font-medium">{result.issuedAt}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
