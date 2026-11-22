import { prisma } from '@/lib/prisma';
import { HoaDon } from '@/models/HoaDon';

export class HoaDonDAO {
  // Tự động đảm bảo có tài khoản nhân viên thu ngân hợp lệ trong bảng TaiKhoan
  private async layHoacTaoNhanVienMacDinh(): Promise<number> {
    const nv = await prisma.taiKhoan.upsert({
      where: { tenDangNhap: 'quochuy.cashier' },
      update: {},
      create: {
        tenDangNhap: 'quochuy.cashier',
        matKhau: '123456',
        hoTen: 'Trần Quốc Huy',
        soDienThoai: '0901000002',
        email: 'thungan@vietfood.vn',
        trangThai: 'Hoạt động',
      },
    });
    return nv.maTaiKhoan;
  }

  public async kiemTraDonDaXuatHoaDon(maDonHang: number): Promise<boolean> {
    const count = await prisma.hoaDon.count({
      where: { maDonHang },
    });
    return count > 0;
  }

  public async xuatHoaDon(duLieu: {
    maDonHang: number;
    tienGiam: number;
    phuongThucThanhToan: string;
  }): Promise<HoaDon> {
    const donHang = await prisma.donHang.findUnique({
      where: { maDonHang: duLieu.maDonHang },
    });
    if (!donHang) {
      throw new Error('Không tìm thấy đơn hàng cần xuất hóa đơn');
    }

    const maNhanVien = await this.layHoacTaoNhanVienMacDinh();
    const tongTienCuoiCung = HoaDon.tinhTienCuoiCung(
      Number(donHang.tongTien),
      duLieu.tienGiam
    );

    const created = await prisma.hoaDon.create({
      data: {
        maDonHang: duLieu.maDonHang,
        maNhanVien,
        tongTienCuoiCung,
        phuongThucThanhToan: duLieu.phuongThucThanhToan,
      },
    });

    await prisma.donHang.update({
      where: { maDonHang: duLieu.maDonHang },
      data: { trangThai: 'Đã thanh toán' },
    });

    return new HoaDon(
      created.maHoaDon,
      created.maDonHang,
      created.maNhanVien,
      Number(created.tongTienCuoiCung),
      created.phuongThucThanhToan,
      created.ngayThanhToan,
      created.maKhuyenMai
    );
  }

  public async layDanhSachHoaDon() {
    const rows = await prisma.hoaDon.findMany({
      orderBy: { maHoaDon: 'desc' },
      take: 20,
      include: {
        nhanVien: true,
        donHang: true,
      },
    });

    return rows.map((r) => ({
      maHoaDon: r.maHoaDon,
      maDonHang: r.maDonHang,
      tenNhanVien: r.nhanVien.hoTen,
      ngayThanhToan: r.ngayThanhToan,
      tongTienGoc: Number(r.donHang.tongTien),
      tongTienCuoiCung: Number(r.tongTienCuoiCung),
      phuongThucThanhToan: r.phuongThucThanhToan,
      hinhThuc: r.donHang.hinhThuc,
      ghiChu: r.donHang.ghiChu || '',
    }));
  }
}