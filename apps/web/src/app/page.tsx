'use client';

import React from 'react';
import Link from 'next/link';
import {
  Map,
  ShieldCheck,
  Lock,
  FileCheck2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';

export default function HomePage() {
  const stats = [
    {
      label: 'Tổng số thửa đất đã số hóa',
      value: '14,820',
      change: '+12% tháng này',
      icon: Map,
      color: 'primary' as const,
    },
    {
      label: 'Sổ Đỏ Số đã cấp phát điện tử',
      value: '11,430',
      change: '99.8% mã QR hợp lệ',
      icon: ShieldCheck,
      color: 'success' as const,
    },
    {
      label: 'Phiên khóa giao dịch đang kích hoạt',
      value: '18',
      change: 'Chống thế chấp trùng',
      icon: Lock,
      color: 'danger' as const,
    },
    {
      label: 'Hồ sơ biến động đang xử lý',
      value: '64',
      change: 'Đúng hạn SLA 96.5%',
      icon: FileCheck2,
      color: 'warning' as const,
    },
  ];

  const quickRoles = [
    {
      code: 'VT-01',
      title: 'Địa chính xã / phường',
      desc: 'Xác minh ranh giới hiện trạng thực địa và đối soát tọa độ đỉnh VN-2000.',
      link: '/map',
      badge: 'Cơ sở',
    },
    {
      code: 'VT-02',
      title: 'Văn phòng ĐKĐĐ (Tỉnh / Chi nhánh)',
      desc: 'Thẩm định hồ sơ biến động, ký số cấp phát và cấp đổi Sổ Đỏ Số.',
      link: '/parcels',
      badge: 'Thẩm quyền',
    },
    {
      code: 'VT-03',
      title: 'Chủ sử dụng đất (Dân / DN)',
      desc: 'Tra cứu thông tin quy hoạch, xem sổ đỏ số điện tử và nộp hồ sơ dịch vụ công.',
      link: '/dossiers',
      badge: 'Công dân',
    },
    {
      code: 'VT-04',
      title: 'Công chứng & Ngân hàng',
      desc: 'Kiểm tra pháp lý thời gian thực, khóa phiên giao dịch 90 phút ngăn chặn rủi ro.',
      link: '/locks',
      badge: 'Giao dịch',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Vận hành theo Luật Đất đai 2024 (số 31/2024/QH15) & Đề án 06
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl leading-tight">
            Nền tảng Địa Chính Số & Cơ Sở Dữ Liệu Thửa Đất Thời Gian Thực
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Giải quyết triệt để vấn nạn tranh chấp ranh giới, làm giả giấy chứng nhận (sổ đỏ giả),
            và tình trạng thế chấp một thửa đất tại nhiều ngân hàng nhờ cơ chế Khóa giao dịch thời gian thực (Real-time Transaction Lock) và mã định danh thửa đất quốc gia 15 ký tự.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/map">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Map className="h-4 w-4" />}
                className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30"
              >
                Mở Bản đồ số GIS VN-2000
              </Button>
            </Link>
            <Link href="/locks">
              <Button
                variant="danger"
                size="md"
                leftIcon={<Lock className="h-4 w-4" />}
                className="bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
              >
                Cổng Khóa giao dịch Công chứng
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} hoverEffect>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge variant={stat.color} size="sm">
                      <TrendingUp className="h-3 w-3 mr-1 inline" />
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Portals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Không gian làm việc theo vai trò</h2>
            <p className="text-xs text-slate-500">Phân quyền chặt chẽ theo 6 persona của Đề án 06</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quickRoles.map((role) => (
            <Card key={role.code} hoverEffect className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm" className="font-mono font-bold">
                    {role.code}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {role.badge}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-sm">{role.title}</CardTitle>
                <CardDescription className="mt-1 text-xs">{role.desc}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-3">
                <Link
                  href={role.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-900 hover:text-blue-700 transition-colors"
                >
                  Truy cập cổng làm việc <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Live System Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 text-sm text-blue-900 shadow-xs">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold text-blue-950">Môi trường Thử nghiệm Decoupled Citizen IdP Sandbox</h4>
            <p className="text-xs leading-relaxed text-blue-900/80">
              Hệ thống hiện tích hợp cổng định danh công dân mô phỏng CCCD 12 số không phụ thuộc mạng Production C06 VNeID,
              giúp đội ngũ kỹ thuật và kiểm thử có thể thực thi đầy đủ vòng đời biến động thửa đất, ký số GCN điện tử và khóa giao dịch thời gian thực một cách độc lập và bảo mật.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
