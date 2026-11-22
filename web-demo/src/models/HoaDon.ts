export class HoaDon {
  public maHoaDon: number;
  public maDonHang: number;
  public maNhanVien: number;
  public maKhuyenMai: number | null;
  public ngayThanhToan: Date;
  public tongTienCuoiCung: number;
  public phuongThucThanhToan: string; // "Tiền mặt" | "Chuyển khoản QR" | "Thẻ"

  constructor(
    maHoaDon: number,
    maDonHang: number,
    maNhanVien: number,
    tongTienCuoiCung: number,
    phuongThucThanhToan: string,
    ngayThanhToan: Date = new Date(),
    maKhuyenMai: number | null = null
  ) {
    this.maHoaDon = maHoaDon;
    this.maDonHang = maDonHang;
    this.maNhanVien = maNhanVien;
    this.tongTienCuoiCung = tongTienCuoiCung;
    this.phuongThucThanhToan = phuongThucThanhToan;
    this.ngayThanhToan = ngayThanhToan;
    this.maKhuyenMai = maKhuyenMai;
  }

  public static tinhTienCuoiCung(tongTienGoc: number, tienGiam: number = 0): number {
    return Math.max(0, tongTienGoc - Math.max(0, tienGiam));
  }
}