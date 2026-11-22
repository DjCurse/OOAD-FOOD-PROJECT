import { prisma } from '@/lib/prisma';
import { DonHang } from '@/models/DonHang';
import { ChiTietDonHang } from '@/models/ChiTietDonHang';

export class DonHangDAO {
  public async taoDonHang(donHang: DonHang): Promise<DonHang> {
    const tongTien = donHang.tinhTongTien();

    const created = await prisma.donHang.create({
      data: {
        tongTien,
        hinhThuc: donHang.hinhThuc,
        trangThai: donHang.trangThai,
        ghiChu: donHang.ghiChu,
      },
    });

    await prisma.chiTietDonHang.createMany({
      data: donHang.chiTiet.map((ct) => ({
        maDonHang: created.maDonHang,
        maMonAn: ct.maMonAn,
        soLuong: ct.soLuong,
        donGia: ct.donGia,
        trangThaiMon: ct.trangThaiMon,
        ghiChu: ct.ghiChu,
      })),
    });

    const chiTietDaLuu = donHang.chiTiet.map(
      (ct) =>
        new ChiTietDonHang(
          created.maDonHang,
          ct.maMonAn,
          ct.soLuong,
          ct.donGia,
          ct.trangThaiMon,
          ct.ghiChu,
          ct.tenMon
        )
    );

    return new DonHang(
      created.maDonHang,
      created.ngayDat,
      Number(created.tongTien),
      created.hinhThuc,
      created.trangThai,
      created.ghiChu || '',
      chiTietDaLuu
    );
  }

  public async layDanhSachDonGanDay(): Promise<DonHang[]> {
    const rows = await prisma.donHang.findMany({
      orderBy: { maDonHang: 'desc' },
      take: 20,
    });

    if (rows.length === 0) return [];

    const maDonHangs = rows.map((r) => r.maDonHang);
    const [chiTietRows, monAnRows] = await Promise.all([
      prisma.chiTietDonHang.findMany({
        where: { maDonHang: { in: maDonHangs } },
      }),
      prisma.monAn.findMany({
        select: { maMonAn: true, tenMon: true },
      }),
    ]);

    const tenMonMap = new Map<number, string>(
      monAnRows.map((m) => [m.maMonAn, m.tenMon])
    );

    return rows.map((r) => {
      const chiTietCuaDon = chiTietRows
        .filter((c) => c.maDonHang === r.maDonHang)
        .map(
          (c) =>
            new ChiTietDonHang(
              c.maDonHang,
              c.maMonAn,
              c.soLuong,
              Number(c.donGia),
              c.trangThaiMon,
              c.ghiChu || '',
              tenMonMap.get(c.maMonAn)
            )
        );

      return new DonHang(
        r.maDonHang,
        r.ngayDat,
        Number(r.tongTien),
        r.hinhThuc,
        r.trangThai,
        r.ghiChu || '',
        chiTietCuaDon
      );
    });
  }

  // Bếp cập nhật trạng thái từng món ăn trong đơn
  public async capNhatTrangThaiMon(
    maDonHang: number,
    maMonAn: number,
    trangThaiMon: string
  ): Promise<void> {
    await prisma.chiTietDonHang.update({
      where: {
        maDonHang_maMonAn: { maDonHang, maMonAn },
      },
      data: { trangThaiMon },
    });

    // Tự động đồng bộ trạng thái tổng của DonHang theo danh sách món
    const tatCaMon = await prisma.chiTietDonHang.findMany({
      where: { maDonHang },
    });

    const monHoatDong = tatCaMon.filter((m) => m.trangThaiMon !== 'Hủy');
    let trangThaiDonMoi = 'Chờ xử lý';

    if (monHoatDong.length === 0) {
      trangThaiDonMoi = 'Đã hủy';
    } else if (monHoatDong.every((m) => m.trangThaiMon === 'Hoàn thành')) {
      trangThaiDonMoi = 'Đã hoàn thành';
    } else if (
      monHoatDong.some(
        (m) => m.trangThaiMon === 'Đang chế biến' || m.trangThaiMon === 'Hoàn thành'
      )
    ) {
      trangThaiDonMoi = 'Đang chế biến';
    }

    await prisma.donHang.update({
      where: { maDonHang },
      data: { trangThai: trangThaiDonMoi },
    });
  }

  // Bếp bấm hoàn thành toàn bộ món của 1 đơn
  public async hoanThanhTatCaMonTrongDon(maDonHang: number): Promise<void> {
    await prisma.chiTietDonHang.updateMany({
      where: {
        maDonHang,
        trangThaiMon: { not: 'Hủy' },
      },
      data: { trangThaiMon: 'Hoàn thành' },
    });

    await prisma.donHang.update({
      where: { maDonHang },
      data: { trangThai: 'Đã hoàn thành' },
    });
  }
}