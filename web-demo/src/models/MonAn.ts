export class MonAn {
  public maMonAn: number;
  public tenMon: string;
  public hinhAnh: string;
  public moTa: string;
  public giaBan: number;
  public trangThai: string; // "Còn hàng" | "Tạm hết" | "Ngừng kinh doanh"
  public maDanhMuc: number;
  public tenDanhMuc?: string;
  public tongLuotBan?: number;

  constructor(
    maMonAn: number,
    tenMon: string,
    hinhAnh: string,
    moTa: string,
    giaBan: number,
    trangThai: string,
    maDanhMuc: number,
    tenDanhMuc?: string,
    tongLuotBan: number = 0
  ) {
    this.maMonAn = maMonAn;
    this.tenMon = tenMon;
    this.hinhAnh = hinhAnh;
    this.moTa = moTa;
    this.giaBan = giaBan;
    this.trangThai = trangThai;
    this.maDanhMuc = maDanhMuc;
    this.tenDanhMuc = tenDanhMuc;
    this.tongLuotBan = tongLuotBan;
  }

  // Phương thức khớp Class Diagram 1.5.1: +capNhatTrangThai(trangThaiMoi: String): void
  public capNhatTrangThai(trangThaiMoi: string): void {
    this.trangThai = trangThaiMoi;
  }
}