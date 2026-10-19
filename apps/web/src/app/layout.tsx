import type { Metadata } from 'next';
import { Roboto, Montserrat } from 'next/font/google';
import './globals.css';
import { Navbar, Sidebar } from '@/components/layout';

const roboto = Roboto({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ĐỊA CHÍNH SỐ - Sổ Đỏ Số & Bản Đồ Thửa Đất Thời Gian Thực',
  description:
    'Nền tảng quản lý thông tin địa chính, vòng đời thửa đất và biến động quyền sử dụng đất minh bạch theo Luật Đất đai 2024.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${roboto.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
