import { ChiTietDonHang } from './ChiTietDonHang';

export class DonHang {
  public maDonHang: number;
  public ngayDat: Date;
  public tongTien: number;
  public hinhThuc: string; // "Tại chỗ" | "Mang đi"
  public trangThai: string; // "Chờ xử lý" | "Đang chế biến" | "Đã hoàn thành" | "Đã hủy"
  public ghiChu: string;
  public chiTiet: ChiTietDonHang[];

  constructor(
    maDonHang: number,
    ngayDat: Date,
    tongTien: number,
    hinhThuc: string,
    trangThai: string = 'Chờ xử lý',
    ghiChu: string = '',
    chiTiet: ChiTietDonHang[] = []
  ) {
    this.maDonHang = maDonHang;
    this.ngayDat = ngayDat;
    this.tongTien = tongTien;
    this.hinhThuc = hinhThuc;
    this.trangThai = trangThai;
    this.ghiChu = ghiChu;
    this.chiTiet = chiTiet;
  }

  // Phương thức khớp Class Diagram 1.5.1: +tinhTongTien(): double
  public tinhTongTien(): number {
    this.tongTien = this.chiTiet.reduce(
      (sum, item) => sum + item.soLuong * item.donGia,
      0
    );
    return this.tongTien;
  }

  // Phương thức khớp Class Diagram 1.5.1: +capNhatTrangThai(trangThai: String): void
  public capNhatTrangThai(trangThai: string): void {
    this.trangThai = trangThai;
  }
}