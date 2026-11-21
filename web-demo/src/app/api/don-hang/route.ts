import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Lấy danh sách đơn cho Bếp, Phục vụ, Thu ngân
export async function GET() {
  const donHang = await prisma.donHang.findMany({
    include: {
      chiTiet: {
        include: { monAn: true },
      },
    },
    orderBy: { ngayDat: 'desc' },
  });

  return NextResponse.json(donHang);
}

// Khách hàng gửi Order mới xuống PostgreSQL
export async function POST(req: Request) {
  const body = await req.json();
  const { hinhThuc, soBan, ghiChu, items } = body;

  const tongTien = items.reduce(
    (sum: number, item: { donGia: number; soLuong: number }) =>
      sum + item.donGia * item.soLuong,
    0
  );

  const maDonHang = `ORD-${Date.now().toString().slice(-6)}`;

  const createdOrder = await prisma.donHang.create({
    data: {
      maDonHang,
      hinhThuc,
      soBan: hinhThuc === 'Tại chỗ' ? soBan : null,
      ghiChu,
      tongTien,
      trangThai: 'Chờ xử lý',
      chiTiet: {
        create: items.map((item: { maMonAn: number; soLuong: number; donGia: number; ghiChu?: string }) => ({
          maMonAn: item.maMonAn,
          soLuong: item.soLuong,
          donGia: item.donGia,
          ghiChu: item.ghiChu || null,
        })),
      },
    },
    include: { chiTiet: true },
  });

  return NextResponse.json(createdOrder, { status: 201 });
}