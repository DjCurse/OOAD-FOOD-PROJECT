import { prisma } from '@/lib/prisma';
import { DanhMuc } from '@/models/DanhMuc';

export class DanhMucDAO {
  public async layTatCa(): Promise<(DanhMuc & { soLuongMon: number })[]> {
    const rows = await prisma.danhMuc.findMany({
      orderBy: { maDanhMuc: 'asc' },
      include: {
        _count: {
          select: {
            monAn: {
              where: { trangThai: { not: 'Ngừng kinh doanh' } },
            },
          },
        },
      },
    });

    return rows.map((r) => ({
      maDanhMuc: r.maDanhMuc,
      tenDanhMuc: r.tenDanhMuc,
      soLuongMon: r._count.monAn,
    }));
  }

  public async kiemTraTrungTen(tenDanhMuc: string, boQuaMa?: number): Promise<boolean> {
    const found = await prisma.danhMuc.findFirst({
      where: {
        tenDanhMuc: { equals: tenDanhMuc.trim(), mode: 'insensitive' },
        ...(boQuaMa ? { maDanhMuc: { not: boQuaMa } } : {}),
      },
    });
    return Boolean(found);
  }

  public async them(tenDanhMuc: string): Promise<DanhMuc> {
    const created = await prisma.danhMuc.create({
      data: { tenDanhMuc: tenDanhMuc.trim() },
    });
    return new DanhMuc(created.maDanhMuc, created.tenDanhMuc);
  }

  public async sua(maDanhMuc: number, tenDanhMuc: string): Promise<DanhMuc> {
    const updated = await prisma.danhMuc.update({
      where: { maDanhMuc },
      data: { tenDanhMuc: tenDanhMuc.trim() },
    });
    return new DanhMuc(updated.maDanhMuc, updated.tenDanhMuc);
  }

  public async demSoMonTrongDanhMuc(maDanhMuc: number): Promise<number> {
    return prisma.monAn.count({
      where: { maDanhMuc },
    });
  }

  public async xoa(maDanhMuc: number): Promise<void> {
    await prisma.danhMuc.delete({
      where: { maDanhMuc },
    });
  }
}