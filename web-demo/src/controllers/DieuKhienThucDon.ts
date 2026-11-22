import { DanhMucDAO } from '@/dao/DanhMucDAO';
import { MonAnDAO } from '@/dao/MonAnDAO';

export class DieuKhienThucDon {
  private danhMucDAO = new DanhMucDAO();
  private monAnDAO = new MonAnDAO();

  // UC-1.1: Xem danh sách danh mục
  public async xemDanhSachDanhMuc() {
    return this.danhMucDAO.layTatCa();
  }

  // UC-1.2: Thêm danh mục
  public async themDanhMuc(tenDanhMuc: string) {
    if (!tenDanhMuc || !tenDanhMuc.trim()) {
      return { success: false, message: 'Bạn phải nhập tên danh mục' };
    }

    const biTrung = await this.danhMucDAO.kiemTraTrungTen(tenDanhMuc);
    if (biTrung) {
      return {
        success: false,
        message: 'Tên danh mục này đã tồn tại. Vui lòng nhập tên khác',
      };
    }

    const danhMuc = await this.danhMucDAO.them(tenDanhMuc);
    return {
      success: true,
      message: 'Thêm danh mục thành công',
      data: danhMuc,
    };
  }

  // UC-1.3: Sửa danh mục
  public async suaDanhMuc(maDanhMuc: number, tenDanhMuc: string) {
    if (!tenDanhMuc || !tenDanhMuc.trim()) {
      return {
        success: false,
        message: 'Tên danh mục không hợp lệ hoặc đã tồn tại',
      };
    }

    const biTrung = await this.danhMucDAO.kiemTraTrungTen(tenDanhMuc, maDanhMuc);
    if (biTrung) {
      return {
        success: false,
        message: 'Tên danh mục không hợp lệ hoặc đã tồn tại',
      };
    }

    const danhMuc = await this.danhMucDAO.sua(maDanhMuc, tenDanhMuc);
    return {
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: danhMuc,
    };
  }

  // UC-1.4: Xóa danh mục
  public async xoaDanhMuc(maDanhMuc: number) {
    const soMon = await this.danhMucDAO.demSoMonTrongDanhMuc(maDanhMuc);
    if (soMon > 0) {
      return {
        success: false,
        message:
          'Danh mục đang chứa món ăn. Vui lòng chuyển các món ăn sang danh mục khác trước khi xóa',
      };
    }

    await this.danhMucDAO.xoa(maDanhMuc);
    return { success: true, message: 'Xóa danh mục thành công' };
  }

  // UC-2.1: Xem danh sách món ăn
  public async xemDanhSachMonAn(maDanhMuc?: number) {
    const monAns = await this.monAnDAO.layDanhSach({
      maDanhMuc,
      chiHienThiDangKinhDoanh: false,
    });
    return {
      monAns,
      thongBao:
        monAns.length === 0 ? 'Chưa có món ăn nào trong danh mục này' : '',
    };
  }

  // UC-2.2: Thêm món ăn
  public async themMonAn(duLieu: {
    tenMon: string;
    hinhAnh: string;
    moTa: string;
    giaBan: number;
    maDanhMuc: number;
  }) {
    if (
      !duLieu.tenMon ||
      !duLieu.tenMon.trim() ||
      !duLieu.maDanhMuc ||
      Number(duLieu.giaBan) <= 0
    ) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc',
      };
    }

    const monAn = await this.monAnDAO.them({
      tenMon: duLieu.tenMon,
      hinhAnh: duLieu.hinhAnh || '/images/default-food.jpg',
      moTa: duLieu.moTa || '',
      giaBan: Number(duLieu.giaBan),
      maDanhMuc: Number(duLieu.maDanhMuc),
    });

    return {
      success: true,
      message: 'Thêm món ăn thành công',
      data: monAn,
    };
  }

  // UC-2.3: Cập nhật thông tin món ăn
  public async capNhatThongTinMonAn(
    maMonAn: number,
    duLieu: {
      tenMon: string;
      hinhAnh: string;
      moTa: string;
      giaBan: number;
      maDanhMuc: number;
    }
  ) {
    if (
      !duLieu.tenMon ||
      !duLieu.tenMon.trim() ||
      !duLieu.maDanhMuc ||
      Number(duLieu.giaBan) <= 0
    ) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc',
      };
    }

    const monAn = await this.monAnDAO.capNhat(maMonAn, {
      tenMon: duLieu.tenMon,
      hinhAnh: duLieu.hinhAnh || '/images/default-food.jpg',
      moTa: duLieu.moTa || '',
      giaBan: Number(duLieu.giaBan),
      maDanhMuc: Number(duLieu.maDanhMuc),
    });

    return {
      success: true,
      message: 'Cập nhật thông tin món ăn thành công',
      data: monAn,
    };
  }

  // UC-2.4: Xóa món ăn (chuyển sang Ngừng kinh doanh nếu đã nằm trong hóa đơn/đơn hàng)
  public async xoaMonAn(maMonAn: number, xacNhanNgungKinhDoanh = false) {
    const coTrongHoaDon = await this.monAnDAO.kiemTraCoTrongHoaDon(maMonAn);

    if (coTrongHoaDon) {
      if (!xacNhanNgungKinhDoanh) {
        return {
          success: false,
          requiresDeactivateConfirm: true,
          message:
            'Món ăn đang nằm trong lịch sử hóa đơn. Hệ thống sẽ chuyển món ăn sang trạng thái Ngừng kinh doanh',
        };
      }

      const monDaAn = await this.monAnDAO.capNhatTrangThai(
        maMonAn,
        'Ngừng kinh doanh'
      );
      return {
        success: true,
        message: 'Đã chuyển món ăn sang trạng thái Ngừng kinh doanh',
        data: monDaAn,
      };
    }

    await this.monAnDAO.xoaVinhVien(maMonAn);
    return { success: true, message: 'Xóa món ăn thành công' };
  }

  // UC-2.5: Cập nhật trạng thái món ăn ("Còn hàng" <-> "Tạm hết")
  public async capNhatTrangThaiMonAn(maMonAn: number, trangThaiMoi: string) {
    const monAn = await this.monAnDAO.capNhatTrangThai(maMonAn, trangThaiMoi);
    return {
      success: true,
      message: `Đã cập nhật trạng thái món sang "${trangThaiMoi}"`,
      data: monAn,
    };
  }
}