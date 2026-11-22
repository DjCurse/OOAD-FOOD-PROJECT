import { DanhMucDAO } from '@/dao/DanhMucDAO';
import { MonAnDAO } from '@/dao/MonAnDAO';
import { DonHangDAO } from '@/dao/DonHangDAO';
import { DonHang } from '@/models/DonHang';
import { ChiTietDonHang } from '@/models/ChiTietDonHang';

export class DieuKhienDatMon {
  private danhMucDAO = new DanhMucDAO();
  private monAnDAO = new MonAnDAO();
  private donHangDAO = new DonHangDAO();

  // UC-4.1: Xem và tìm kiếm món ăn trên thực đơn
  public async xemVaTimKiemThucDon(params?: {
    tuKhoa?: string;
    maDanhMuc?: number;
    locBanChay?: boolean;
    sapXepGia?: 'asc' | 'desc';
  }) {
    const danhMucs = await this.danhMucDAO.layTatCa();
    const monAns = await this.monAnDAO.layDanhSach({
      tuKhoa: params?.tuKhoa,
      maDanhMuc: params?.maDanhMuc,
      chiHienThiDangKinhDoanh: true,
      locBanChay: params?.locBanChay,
      sapXepGia: params?.sapXepGia,
    });
    const donHangs = await this.donHangDAO.layDanhSachDonGanDay();

    return {
      danhMucs,
      monAns,
      donHangs,
      thongBao: monAns.length === 0 ? 'Không tìm thấy món ăn phù hợp' : '',
    };
  }

  // UC-4.3: Xác nhận gửi Order
  public async xacNhanGuiOrder(payload: {
    hinhThuc: string;
    soBan?: string;
    ghiChuChung?: string;
    danhSachMon: {
      maMonAn: number;
      soLuong: number;
      donGia: number;
      hinhThucMon: string;
      ghiChu: string;
    }[];
  }) {
    if (!payload.danhSachMon || payload.danhSachMon.length === 0) {
      return { success: false, message: 'Giỏ hàng của bạn đang trống' };
    }

    if (!payload.hinhThuc) {
      return {
        success: false,
        message: 'Vui lòng chọn hình thức Tại chỗ hoặc Mang đi',
      };
    }

    // Gộp chi tiết theo MaMonAn (khóa chính kép MaDonHang + MaMonAn)
    const gopMonMap = new Map<number, ChiTietDonHang>();
    for (const item of payload.danhSachMon) {
      const monHienTai = await this.monAnDAO.layTheoMa(item.maMonAn);
      if (!monHienTai || monHienTai.trangThai !== 'Còn hàng') {
        return {
          success: false,
          message: `Món "${monHienTai?.tenMon || item.maMonAn}" hiện đã tạm hết hoặc ngừng kinh doanh.`,
        };
      }

      const ghiChuKemHinhThuc = `[${item.hinhThucMon}] ${item.ghiChu || ''}`.trim();
      const daCo = gopMonMap.get(item.maMonAn);
      if (daCo) {
        daCo.soLuong += item.soLuong;
        if (ghiChuKemHinhThuc) {
          daCo.ghiChu = daCo.ghiChu
            ? `${daCo.ghiChu}; ${ghiChuKemHinhThuc}`
            : ghiChuKemHinhThuc;
        }
      } else {
        gopMonMap.set(
          item.maMonAn,
          new ChiTietDonHang(
            0,
            item.maMonAn,
            item.soLuong,
            Number(monHienTai.giaBan),
            'Chờ',
            ghiChuKemHinhThuc
          )
        );
      }
    }

    const chiTietList = Array.from(gopMonMap.values());
    const ghiChuDon =
      payload.hinhThuc === 'Tại chỗ' && payload.soBan
        ? `Bàn ${payload.soBan}${payload.ghiChuChung ? ` - ${payload.ghiChuChung}` : ''}`
        : payload.ghiChuChung || '';

    const donHangMoi = new DonHang(
      0,
      new Date(),
      0,
      payload.hinhThuc,
      'Chờ xử lý',
      ghiChuDon,
      chiTietList
    );
    donHangMoi.tinhTongTien();

    const ketQua = await this.donHangDAO.taoDonHang(donHangMoi);
    return {
      success: true,
      message: `Gửi Order #ORD-${ketQua.maDonHang} thành công! Đơn hàng đã chuyển xuống Bếp.`,
      donHang: ketQua,
    };
  }
}