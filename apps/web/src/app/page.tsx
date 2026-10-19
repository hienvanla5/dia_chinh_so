'use client';

import React from 'react';
import Link from 'next/link';
import {
  Map,
  ShieldCheck,
  Lock,
  FileCheck2,
  ArrowRight,
  TrendingUp,
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
      desc: 'Xác minh hiện trạng ranh giới thực địa và đối soát tọa độ đỉnh VN-2000.',
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
      link: '/login',
      badge: 'Công dân',
    },
    {
      code: 'VT-04',
      title: 'Công chứng & Ngân hàng',
      desc: 'Kiểm tra pháp lý thời gian thực, khóa phiên giao dịch ngăn chặn rủi ro.',
      link: '/locks',
      badge: 'Giao dịch',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Vận hành theo Luật Đất đai 2024 & Đề án 06
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Nền tảng Địa Chính Số & CSDL Thửa Đất Thời Gian Thực
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-200">
            Hệ thống quản lý thông tin địa chính, vòng đời thửa đất và bảo vệ quyền sử dụng đất minh bạch với mã định danh quốc gia 15 ký tự và cơ chế Khóa giao dịch trực tuyến.
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
            <Link href="/login">
              <Button
                variant="outline"
                size="md"
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Cổng Định danh Chủ đất
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
            <Card key={idx} hoverEffect className="border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-heading">
                    {stat.value}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Badge variant={stat.color} size="sm">
                      <TrendingUp className="h-3.5 w-3.5 mr-1 inline" />
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
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight font-heading">
              Không gian làm việc theo vai trò
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">Phân quyền chức năng theo 6 nhóm nghiệp vụ của Đề án 06</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quickRoles.map((role) => (
            <Card key={role.code} hoverEffect className="flex flex-col justify-between border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm" className="font-mono font-bold text-xs">
                    {role.code}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {role.badge}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-base font-bold text-slate-900">{role.title}</CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-600 leading-relaxed">{role.desc}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-3 border-t border-slate-100 mt-3">
                <Link
                  href={role.link}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors"
                >
                  Truy cập cổng làm việc <ArrowRight className="h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
