export class ChiTietDonHang {
  public maDonHang: number;
  public maMonAn: number;
  public tenMon?: string;
  public soLuong: number;
  public donGia: number;
  public trangThaiMon: string; // "Chờ" | "Đang chế biến" | "Hoàn thành" | "Hủy"
  public ghiChu: string;

  constructor(
    maDonHang: number,
    maMonAn: number,
    soLuong: number,
    donGia: number,
    trangThaiMon: string = 'Chờ',
    ghiChu: string = '',
    tenMon?: string
  ) {
    this.maDonHang = maDonHang;
    this.maMonAn = maMonAn;
    this.soLuong = soLuong;
    this.donGia = donGia;
    this.trangThaiMon = trangThaiMon;
    this.ghiChu = ghiChu;
    this.tenMon = tenMon;
  }
}