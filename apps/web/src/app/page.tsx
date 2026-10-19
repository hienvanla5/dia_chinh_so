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
} from 'lucide-react';

export default function HomePage() {
  const stats = [
    { label: 'Tổng số thửa đất đã số hóa', value: '14,820', change: '+12% tháng này', icon: Map, color: 'blue' },
    { label: 'Sổ Đỏ Số đã cấp phát điện tử', value: '11,430', change: '99.8% mã QR hợp lệ', icon: ShieldCheck, color: 'emerald' },
    { label: 'Phiên khóa giao dịch đang kích hoạt', value: '18', change: 'Chống thế chấp trùng', icon: Lock, color: 'rose' },
    { label: 'Hồ sơ biến động đang xử lý', value: '64', change: 'Đúng hạn SLA 96.5%', icon: FileCheck2, color: 'amber' },
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            Vận hành theo Luật Đất đai 2024 & Đề án 06
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Nền tảng Địa Chính Số & Cơ Sở Dữ Liệu Thửa Đất Thời Gian Thực
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Giải quyết triệt để vấn nạn tranh chấp ranh giới, làm giả giấy chứng nhận (sổ đỏ giả),
            và tình trạng thế chấp một thửa đất tại nhiều ngân hàng nhờ cơ chế Khóa giao dịch thời gian thực (Real-time Transaction Lock).
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 transition"
            >
              <Map className="h-4 w-4" />
              Mở Bản đồ số GIS
            </Link>
            <Link
              href="/locks"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Lock className="h-4 w-4" />
              Cổng Khóa giao dịch Công chứng
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Portals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Không gian làm việc theo vai trò</h2>
          <span className="text-xs text-slate-500">Phân quyền chặt chẽ theo chức năng nghiệp vụ</span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quickRoles.map((role) => (
            <div
              key={role.code}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600">{role.code}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {role.badge}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">{role.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{role.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100">
                <Link
                  href={role.link}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Truy cập cổng làm việc <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live System Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="font-bold">Môi trường Thử nghiệm Sandbox Decoupled IdP</h4>
            <p className="text-xs leading-relaxed text-blue-800">
              Hệ thống hiện tích hợp cổng định danh công dân mô phỏng CCCD 12 số không phụ thuộc mạng Production C06 VNeID,
              giúp đội ngũ kỹ thuật và kiểm thử có thể thực thi đầy đủ vòng đời biến động thửa đất, ký số GCN điện tử và khóa giao dịch thời gian thực một cách độc lập và bảo mật.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
