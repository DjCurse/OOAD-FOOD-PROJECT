export type TenVaiTro = 'Admin' | 'Thu Ngân' | 'Bếp' | 'Phục Vụ' | 'Khách Hàng';

export interface DanhMuc {
  maDanhMuc: number;
  tenDanhMuc: string;
}

export interface MonAn {
  maMonAn: number;
  tenMon: string;
  hinhAnh: string;
  moTa: string;
  giaBan: number;
  trangThai: 'Còn hàng' | 'Tạm hết' | 'Ngừng kinh doanh';
  maDanhMuc: number;
}

export interface NguyenLieu {
  maNguyenLieu: number;
  tenNguyenLieu: string;
  donViTinh: string;
  soLuongTonKho: number;
}

export interface CongThucMonAn {
  maMonAn: number;
  maNguyenLieu: number;
  soLuongCanTru: number;
}

export interface ChiTietDonHang {
  maMonAn: number;
  tenMon: string;
  soLuong: number;
  donGia: number;
  trangThaiMon: 'Chờ' | 'Đang chế biến' | 'Hoàn thành' | 'Hủy';
  ghiChu?: string;
}

export interface DonHang {
  maDonHang: string; // VD: #ORD-1028
  soBan?: string;    // VD: Bàn 04
  ngayDat: string;
  tongTien: number;
  hinhThuc: 'Tại chỗ' | 'Mang đi';
  trangThai: 'Chờ xử lý' | 'Đang chế biến' | 'Đã hoàn thành' | 'Đã hủy';
  nhanCapNhat?: 'ĐÃ SỬA' | 'MỚI THÊM';
  ghiChu?: string;
  chiTiet: ChiTietDonHang[];
}