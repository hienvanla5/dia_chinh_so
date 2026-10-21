'use client';

import React from 'react';
import Link from 'next/link';
import { UserCheck, ArrowRight } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome Banner - Clean without icon/badge clutter on heading */}
      <div className="rounded-2xl bg-slate-900 p-8 sm:p-10 text-white shadow-lg">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Nền tảng Địa Chính Số
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Hệ thống quản lý thông tin địa chính, vòng đời thửa đất và bảo vệ quyền sử dụng đất minh bạch theo Luật Đất đai 2024.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button
                variant="primary"
                size="md"
                leftIcon={<UserCheck className="h-4 w-4" />}
                className="bg-vnred-500 hover:bg-vnred-600 shadow-md shadow-red-500/20"
              >
                Vào Cổng Đăng Nhập Định Danh
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Feature Card - Story DCS-01-CN-001 */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 font-heading">
            Chức năng đang hoạt động
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Tính năng được triển khai và kiểm thử hoàn chỉnh theo User Story DCS-01-CN-001.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Đăng nhập Cổng Định danh Số Công dân (CCCD + OTP SMS)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cho phép chủ sử dụng đất đăng nhập bằng số định danh cá nhân CCCD 12 số và mã OTP SMS mô phỏng qua cổng Sandbox độc lập, kiểm tra mã băm SHA-256 nhật ký kiểm toán và mở Ví Sổ Đỏ Số cá nhân.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors"
              >
                Trải nghiệm quy trình đăng nhập <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
