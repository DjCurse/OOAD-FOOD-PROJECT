import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Việt Food - Hệ thống Đặt món & Quản lý chuỗi thức ăn',
  description: 'Đồ án Phân tích Thiết kế Hướng đối tượng - Nhóm 10 SGU',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <header className="bg-red-700 text-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-extrabold text-lg tracking-tight">
                🍜 Việt Food
              </Link>
              <nav className="flex items-center gap-2 text-sm font-semibold">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
                >
                  1. Đặt món (Nghiệp vụ)
                </Link>
                <Link
                  href="/admin/bep"
                  className="px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
                >
                  2. Bếp &amp; Xuất hóa đơn (Admin)
                </Link>
                <Link
                  href="/admin/thuc-don"
                  className="px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
                >
                  3. Quản lý thực đơn (Admin)
                </Link>
              </nav>
            </div>

            <div className="text-xs bg-amber-400 text-gray-900 font-bold px-3 py-1 rounded-full">
              Nguyễn Minh Anh • Admin
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
          © 2026 Việt Food • Nhóm 10 - Phân tích Thiết kế Hướng đối tượng (SGU)
        </footer>
      </body>
    </html>
  );
}