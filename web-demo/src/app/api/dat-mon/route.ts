import { NextRequest, NextResponse } from 'next/server';
import { DieuKhienDatMon } from '@/controllers/DieuKhienDatMon';

const dieuKhienDatMon = new DieuKhienDatMon();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tuKhoa = searchParams.get('tuKhoa') || undefined;
    const maDanhMucParam = searchParams.get('maDanhMuc');
    const maDanhMuc = maDanhMucParam ? Number(maDanhMucParam) : undefined;
    const locBanChay = searchParams.get('locBanChay') === 'true';
    const sapXepGiaParam = searchParams.get('sapXepGia');
    const sapXepGia =
      sapXepGiaParam === 'asc' || sapXepGiaParam === 'desc'
        ? sapXepGiaParam
        : undefined;
    // UC-4.1: lọc theo khoảng giá (giaMin / giaMax)
    const giaMinParam = searchParams.get('giaMin');
    const giaMaxParam = searchParams.get('giaMax');
    const giaMin = giaMinParam ? Number(giaMinParam) : undefined;
    const giaMax = giaMaxParam ? Number(giaMaxParam) : undefined;

    const data = await dieuKhienDatMon.xemVaTimKiemThucDon({
      tuKhoa,
      maDanhMuc,
      locBanChay,
      sapXepGia,
      giaMin: Number.isFinite(giaMin) ? giaMin : undefined,
      giaMax: Number.isFinite(giaMax) ? giaMax : undefined,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Lỗi tải thực đơn từ cơ sở dữ liệu' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await dieuKhienDatMon.xacNhanGuiOrder(body);
    return NextResponse.json(res, { status: res.success ? 200 : 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Lỗi xử lý gửi Order' },
      { status: 500 }
    );
  }
}