'use client';

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Search,
  Sparkles,
} from 'lucide-react';
import { ParcelLegalStatus } from '@diachinhso/shared';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  ParcelStatusBadge,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';

export default function LocksPage() {
  const [nationalCode, setNationalCode] = useState('HN-BA-DINH.012.0045');
  const [organizationName, setOrganizationName] = useState('Văn phòng Công chứng Hà Nội');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockInfo, setLockInfo] = useState<any>(null);

  const handleAcquireLock = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLocked(true);
      setLockInfo({
        nationalCode,
        organizationName,
        lockedAt: new Date().toLocaleTimeString('vi-VN'),
        expiresAt: new Date(Date.now() + durationMinutes * 60000).toLocaleTimeString('vi-VN'),
        sessionToken: 'LOCK-SESSION-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      });
      setIsLoading(false);
    }, 600);
  };

  const handleReleaseLock = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLocked(false);
      setLockInfo(null);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cổng Khóa Giao Dịch Thời Gian Thực (Transaction Lock Engine)"
        description="Dành cho Công chứng viên & Cán bộ Tín dụng Ngân hàng theo Luật Đất đai 2024 để ngăn ngừa triệt để tình trạng thế chấp hoặc công chứng một thửa đất tại nhiều tổ chức tín dụng."
        badge={
          <Badge variant={isLocked ? 'danger' : 'success'} dot pulse={isLocked} size="md">
            {isLocked ? 'Đang kích hoạt phiên khóa' : 'Sẵn sàng tiếp nhận khóa'}
          </Badge>
        }
        breadcrumbs={[
          { label: 'Nghiệp vụ công chứng', href: '/locks' },
          { label: 'Khóa giao dịch thời gian thực' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Thiết lập Phiên Khóa Thửa Đất Bảo Lưu</CardTitle>
              <Badge variant="primary" size="sm">
                Redlock Distributed TTL
              </Badge>
            </div>
            <CardDescription>
              Nhập mã định danh quốc gia 15 ký tự và thời gian bảo lưu giao dịch ký kết hợp đồng.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-3">
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex-1 w-full">
                <Input
                  label="Mã định danh thửa đất quốc gia"
                  value={nationalCode}
                  onChange={(e) => setNationalCode(e.target.value)}
                  placeholder="VD: HN-BA-DINH.012.0045"
                  helperText="Quy tắc định dạng: Tỉnh-Huyện.SốTờ.SốThửa"
                  required
                />
              </div>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Search className="h-4 w-4 text-slate-500" />}
                onClick={() => alert(`Tra cứu thành công thửa đất: ${nationalCode}`)}
              >
                Kiểm tra PostGIS
              </Button>
            </div>

            <Input
              label="Tổ chức / Văn phòng thực hiện khóa"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="VD: VPCC Thăng Long, Ngân hàng Vietcombank Ba Đình"
              required
            />

            <Select
              label="Thời hạn khóa bảo lưu phiên giao dịch"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              options={[
                { value: 30, label: '30 phút (Giao dịch hồ sơ nhanh)' },
                { value: 60, label: '60 phút (Tiêu chuẩn công chứng hợp đồng mua bán)' },
                {
                  value: 90,
                  label: '90 phút (Mặc định: Ký kết hợp đồng chuyển nhượng & thế chấp tín dụng)',
                },
                { value: 120, label: '120 phút (Hồ sơ thừa kế / Đồng sở hữu phức tạp)' },
              ]}
              helperText="Hết thời gian trên, khóa Redis sẽ tự giải phóng nếu không được gia hạn hoặc hoàn tất giao dịch."
            />
          </CardContent>

          <CardFooter className="pt-4">
            {!isLocked ? (
              <Button
                variant="danger"
                size="lg"
                fullWidth
                isLoading={isLoading}
                loadingText="Đang kết nối Redis Redlock..."
                leftIcon={<Lock className="h-4 w-4" />}
                onClick={handleAcquireLock}
              >
                KÍCH HOẠT KHÓA GIAO DỊCH THỜI GIAN THỰC ({durationMinutes} PHÚT)
              </Button>
            ) : (
              <Button
                variant="create"
                size="lg"
                fullWidth
                isLoading={isLoading}
                loadingText="Đang giải phóng khóa..."
                leftIcon={<Unlock className="h-4 w-4" />}
                onClick={handleReleaseLock}
              >
                MỞ KHÓA CHỦ ĐỘNG (HOÀN TẤT KÝ KẾT / HỦY BỎ)
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Live Session Status card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái Phiên làm việc</CardTitle>
              <CardDescription>Giám sát đồng bộ trực tiếp với PostGIS & Redis Cluster</CardDescription>
            </CardHeader>
            <CardContent>
              {isLocked && lockInfo ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-900">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600" />
                      </span>
                      ĐANG KHÓA TRÊN REDIS CLUSTER
                    </div>
                    <p className="mt-2 text-xs font-mono font-bold text-rose-950">
                      {lockInfo.nationalCode}
                    </p>
                    <p className="text-[11px] text-rose-700 mt-1 font-mono break-all">
                      Token: {lockInfo.sessionToken}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Đơn vị nắm khóa:</span>
                      <span className="font-semibold text-slate-800">{lockInfo.organizationName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Thời điểm kích hoạt:</span>
                      <span className="font-semibold text-slate-800">{lockInfo.lockedAt}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>Hết hạn tự động lúc:</span>
                      <span className="font-bold text-rose-600">{lockInfo.expiresAt}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-6 text-center text-xs text-slate-500 space-y-2">
                  <Lock className="h-8 w-8 text-slate-400 mx-auto stroke-[1.5]" />
                  <p className="font-medium">Chưa có phiên khóa nào đang kích hoạt trên thiết bị này.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal Note Card */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Nguyên lý an toàn kép theo Luật 2024:</span>
            </div>
            <p className="leading-relaxed text-amber-900/90 text-[11px]">
              Khi lệnh khóa được kích hoạt, cờ trạng thái trên PostGIS và Redis TTL sẽ lập tức chuyển sang{' '}
              <strong className="text-rose-700 font-bold">LOCKED</strong>. Mọi văn phòng công chứng hoặc
              ngân hàng khác tra cứu thửa đất này sẽ nhận cảnh báo tức thì, ngăn chặn lừa đảo mua bán hoặc
              thế chấp một thửa đất tại nhiều nơi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
