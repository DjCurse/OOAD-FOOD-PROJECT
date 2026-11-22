import { NextRequest, NextResponse } from 'next/server';
import { DieuKhienBepVaHoaDon } from '@/controllers/DieuKhienBepVaHoaDon';

const controller = new DieuKhienBepVaHoaDon();

export async function GET() {
  try {
    const data = await controller.layDuLieuBepVaThuNgan();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Lỗi tải dữ liệu bếp và hóa đơn' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'CAP_NHAT_TRANG_THAI_MON': {
        const res = await controller.capNhatTrangThaiMon(
          Number(body.maDonHang),
          Number(body.maMonAn),
          body.trangThaiMon
        );
        return NextResponse.json(res, { status: res.success ? 200 : 400 });
      }
      case 'HOAN_THANH_DON': {
        const res = await controller.hoanThanhToanBoDon(Number(body.maDonHang));
        return NextResponse.json(res);
      }
      case 'XUAT_HOA_DON': {
        const res = await controller.xuatHoaDon({
          maDonHang: Number(body.maDonHang),
          tienGiam: Number(body.tienGiam || 0),
          phuongThucThanhToan: body.phuongThucThanhToan,
        });
        return NextResponse.json(res, { status: res.success ? 200 : 400 });
      }
      default:
        return NextResponse.json(
          { success: false, message: 'Hành động không hợp lệ' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Lỗi xử lý nghiệp vụ bếp / hóa đơn' },
      { status: 500 }
    );
  }
}