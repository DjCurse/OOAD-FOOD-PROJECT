import { DonHangDAO } from '@/dao/DonHangDAO';
import { HoaDonDAO } from '@/dao/HoaDonDAO';

export class DieuKhienBepVaHoaDon {
  private donHangDAO = new DonHangDAO();
  private hoaDonDAO = new HoaDonDAO();

  public async layDuLieuBepVaThuNgan() {
    const [donHangs, hoaDons] = await Promise.all([
      this.donHangDAO.layDanhSachDonGanDay(),
      this.hoaDonDAO.layDanhSachHoaDon(),
    ]);

    return { donHangs, hoaDons };
  }

  public async capNhatTrangThaiMon(
    maDonHang: number,
    maMonAn: number,
    trangThaiMon: string
  ) {
    const hopLe = ['Chờ', 'Đang chế biến', 'Hoàn thành', 'Hủy'];
    if (!hopLe.includes(trangThaiMon)) {
      return { success: false, message: 'Trạng thái món không hợp lệ' };
    }

    await this.donHangDAO.capNhatTrangThaiMon(maDonHang, maMonAn, trangThaiMon);
    return {
      success: true,
      message: `Đã chuyển trạng thái món sang "${trangThaiMon}"`,
    };
  }

  public async hoanThanhToanBoDon(maDonHang: number) {
    await this.donHangDAO.hoanThanhTatCaMonTrongDon(maDonHang);
    return {
      success: true,
      message: `Đã hoàn thành toàn bộ món của đơn #ORD-${maDonHang}`,
    };
  }

  public async xuatHoaDon(payload: {
    maDonHang: number;
    tienGiam?: number;
    phuongThucThanhToan: string;
  }) {
    if (!payload.maDonHang) {
      return { success: false, message: 'Thiếu mã đơn hàng cần thanh toán' };
    }

    const daXuat = await this.hoaDonDAO.kiemTraDonDaXuatHoaDon(payload.maDonHang);
    if (daXuat) {
      return {
        success: false,
        message: `Đơn #ORD-${payload.maDonHang} đã được xuất hóa đơn trước đó`,
      };
    }

    const hoaDon = await this.hoaDonDAO.xuatHoaDon({
      maDonHang: payload.maDonHang,
      tienGiam: Number(payload.tienGiam || 0),
      phuongThucThanhToan: payload.phuongThucThanhToan || 'Tiền mặt',
    });

    return {
      success: true,
      message: `Xuất hóa đơn #HD-${hoaDon.maHoaDon} thành công!`,
      hoaDon,
    };
  }
}