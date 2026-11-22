import { prisma } from '@/lib/prisma';
import { MonAn } from '@/models/MonAn';

export class MonAnDAO {
  public async layDanhSach(boLoc?: {
    tuKhoa?: string;
    maDanhMuc?: number;
    chiHienThiDangKinhDoanh?: boolean;
    locBanChay?: boolean;
    sapXepGia?: 'asc' | 'desc';
  }): Promise<MonAn[]> {
    const rows = await prisma.monAn.findMany({
      where: {
        ...(boLoc?.chiHienThiDangKinhDoanh
          ? { trangThai: { not: 'Ngừng kinh doanh' } }
          : {}),
        ...(boLoc?.maDanhMuc ? { maDanhMuc: boLoc.maDanhMuc } : {}),
        ...(boLoc?.tuKhoa
          ? { tenMon: { contains: boLoc.tuKhoa.trim(), mode: 'insensitive' } }
          : {}),
      },
      include: {
        danhMuc: true,
      },
      orderBy: boLoc?.sapXepGia
        ? { giaBan: boLoc.sapXepGia }
        : { maMonAn: 'asc' },
    });

    const thongKeBan = await prisma.chiTietDonHang.groupBy({
      by: ['maMonAn'],
      _sum: { soLuong: true },
    });
    const luotBanMap = new Map<number, number>(
      thongKeBan.map((t) => [t.maMonAn, t._sum.soLuong || 0])
    );

    const mapped = rows.map((r) => {
      const tongLuotBan = luotBanMap.get(r.maMonAn) || 0;
      return new MonAn(
        r.maMonAn,
        r.tenMon,
        r.hinhAnh || '/images/default-food.jpg',
        r.moTa || '',
        Number(r.giaBan),
        r.trangThai,
        r.maDanhMuc,
        r.danhMuc.tenDanhMuc,
        tongLuotBan
      );
    });

    if (boLoc?.locBanChay) {
      return mapped.sort((a, b) => (b.tongLuotBan || 0) - (a.tongLuotBan || 0));
    }

    return mapped;
  }

  public async layTheoMa(maMonAn: number): Promise<MonAn | null> {
    const r = await prisma.monAn.findUnique({
      where: { maMonAn },
      include: { danhMuc: true },
    });
    if (!r) return null;
    return new MonAn(
      r.maMonAn,
      r.tenMon,
      r.hinhAnh || '/images/default-food.jpg',
      r.moTa || '',
      Number(r.giaBan),
      r.trangThai,
      r.maDanhMuc,
      r.danhMuc.tenDanhMuc
    );
  }

  public async them(duLieu: {
    tenMon: string;
    hinhAnh: string;
    moTa: string;
    giaBan: number;
    maDanhMuc: number;
  }): Promise<MonAn> {
    const created = await prisma.monAn.create({
      data: {
        tenMon: duLieu.tenMon.trim(),
        hinhAnh: duLieu.hinhAnh || '/images/default-food.jpg',
        moTa: duLieu.moTa.trim(),
        giaBan: duLieu.giaBan,
        trangThai: 'Còn hàng',
        maDanhMuc: duLieu.maDanhMuc,
      },
      include: { danhMuc: true },
    });

    return new MonAn(
      created.maMonAn,
      created.tenMon,
      created.hinhAnh || '/images/default-food.jpg',
      created.moTa || '',
      Number(created.giaBan),
      created.trangThai,
      created.maDanhMuc,
      created.danhMuc.tenDanhMuc
    );
  }

  public async capNhat(
    maMonAn: number,
    duLieu: {
      tenMon: string;
      hinhAnh: string;
      moTa: string;
      giaBan: number;
      maDanhMuc: number;
    }
  ): Promise<MonAn> {
    const updated = await prisma.monAn.update({
      where: { maMonAn },
      data: {
        tenMon: duLieu.tenMon.trim(),
        hinhAnh: duLieu.hinhAnh,
        moTa: duLieu.moTa.trim(),
        giaBan: duLieu.giaBan,
        maDanhMuc: duLieu.maDanhMuc,
      },
      include: { danhMuc: true },
    });

    return new MonAn(
      updated.maMonAn,
      updated.tenMon,
      updated.hinhAnh || '/images/default-food.jpg',
      updated.moTa || '',
      Number(updated.giaBan),
      updated.trangThai,
      updated.maDanhMuc,
      updated.danhMuc.tenDanhMuc
    );
  }

  public async capNhatTrangThai(maMonAn: number, trangThaiMoi: string): Promise<MonAn> {
    const mon = await this.layTheoMa(maMonAn);
    if (!mon) throw new Error('Không tìm thấy món ăn');
    mon.capNhatTrangThai(trangThaiMoi);

    const updated = await prisma.monAn.update({
      where: { maMonAn },
      data: { trangThai: mon.trangThai },
      include: { danhMuc: true },
    });

    return new MonAn(
      updated.maMonAn,
      updated.tenMon,
      updated.hinhAnh || '/images/default-food.jpg',
      updated.moTa || '',
      Number(updated.giaBan),
      updated.trangThai,
      updated.maDanhMuc,
      updated.danhMuc.tenDanhMuc
    );
  }

  public async kiemTraCoTrongHoaDon(maMonAn: number): Promise<boolean> {
    const count = await prisma.chiTietDonHang.count({
      where: { maMonAn },
    });
    return count > 0;
  }

  public async xoaVinhVien(maMonAn: number): Promise<void> {
    await prisma.monAn.delete({
      where: { maMonAn },
    });
  }
}