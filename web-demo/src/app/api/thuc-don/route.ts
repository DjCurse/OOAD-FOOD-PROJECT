import { NextRequest, NextResponse } from 'next/server';
import { DieuKhienThucDon } from '@/controllers/DieuKhienThucDon';

const dieuKhienThucDon = new DieuKhienThucDon();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const maDanhMucParam = searchParams.get('maDanhMuc');
    const maDanhMuc = maDanhMucParam ? Number(maDanhMucParam) : undefined;

    const danhMucs = await dieuKhienThucDon.xemDanhSachDanhMuc();
    const { monAns, thongBao } = await dieuKhienThucDon.xemDanhSachMonAn(maDanhMuc);

    return NextResponse.json({ danhMucs, monAns, thongBao });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Lỗi tải dữ liệu quản lý thực đơn' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'THEM_DANH_MUC': {
        const res = await dieuKhienThucDon.themDanhMuc(body.tenDanhMuc);
        return NextResponse.json(res, { status: res.success ? 200 : 400 });
      }
      case 'SUA_DANH_MUC': {
        const res = await dieuKhienThucDon.suaDanhMuc(
          Number(body.maDanhMuc),
          body.tenDanhMuc
        );
        return NextResponse.json(res, { status: res.success ? 200 : 400 });
      }
      case 'XOA_DANH_MUC': {
        const res = await dieuKhienThucDon.xoaDanhMuc(Number(body.maDanhMuc));
        return NextResponse.json(res, { status: res.success ? 200 : 400 });
      }
      case 'THEM_MON_AN': {
        const res = await dieuKhienThucDon.themMonAn(body);
        return NextResponse.json(res, { status: res.success ? 200 : 400 });
      }
      case 'SUA_MON_AN': {
        const res = await dieuKhienThucDon.capNhatThongTinMonAn(
          Number(body.maMonAn),
          body
        );
        return NextResponse.json(res, { status: res.success ? 200 : 400 });
      }
      case 'XOA_MON_AN': {
        const res = await dieuKhienThucDon.xoaMonAn(
          Number(body.maMonAn),
          Boolean(body.xacNhanNgungKinhDoanh)
        );
        return NextResponse.json(res, {
          status: res.success || res.requiresDeactivateConfirm ? 200 : 400,
        });
      }
      case 'CAP_NHAT_TRANG_THAI_MON': {
        const res = await dieuKhienThucDon.capNhatTrangThaiMonAn(
          Number(body.maMonAn),
          body.trangThaiMoi
        );
        return NextResponse.json(res);
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
      { success: false, message: 'Lỗi hệ thống khi xử lý thực đơn' },
      { status: 500 }
    );
  }
}