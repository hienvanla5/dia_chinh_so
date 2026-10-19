import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'ĐỊA CHÍNH SỐ - Sổ Đỏ Số & Bản Đồ Thửa Đất Thời Gian Thực',
  description: 'Nền tảng quản lý thông tin địa chính, vòng đời thửa đất và biến động quyền sử dụng đất minh bạch theo Luật Đất đai 2024.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
