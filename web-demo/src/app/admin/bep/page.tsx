'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface ChiTietMon {
  maDonHang: number;
  maMonAn: number;
  tenMon?: string;
  soLuong: number;
  donGia: number;
  trangThaiMon: string;
  ghiChu: string;
}

interface DonHangItem {
  maDonHang: number;
  ngayDat: string;
  tongTien: number;
  hinhThuc: string;
  trangThai: string;
  ghiChu: string;
  chiTiet: ChiTietMon[];
}

interface HoaDonItem {
  maHoaDon: number;
  maDonHang: number;
  tenNhanVien: string;
  ngayThanhToan: string;
  tongTienGoc: number;
  tongTienCuoiCung: number;
  phuongThucThanhToan: string;
  hinhThuc: string;
  ghiChu: string;
}

export default function GiaoDienBepVaHoaDon() {
  const [donHangs, setDonHangs] = useState<DonHangItem[]>([]);
  const [hoaDons, setHoaDons] = useState<HoaDonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [thongBao, setThongBao] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Modal xuất hóa đơn
  const [donXuatHoaDon, setDonXuatHoaDon] = useState<DonHangItem | null>(null);
  const [phuongThucTT, setPhuongThucTT] = useState('Tiền mặt');
  const [tienGiam, setTienGiam] = useState('0');
  const [dangXuatHD, setDangXuatHD] = useState(false);

  // Modal xem / in hóa đơn vừa xuất
  const [hoaDonXemIn, setHoaDonXemIn] = useState<{
    hoaDon: HoaDonItem;
    chiTiet: ChiTietMon[];
  } | null>(null);

  const taiDuLieu = useCallback(async (hienLoading = true) => {
    if (hienLoading) setLoading(true);
    const res = await fetch('/api/bep-hoa-don');
    if (res.ok) {
      const data = await res.json();
      setDonHangs(data.donHangs || []);
      setHoaDons(data.hoaDons || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    taiDuLieu();
    // UC-05.1: hệ thống đẩy order mới xuống Màn hình Bếp theo thời gian thực,
    // không cần tải lại trang -> polling định kỳ mỗi 5 giây.
    const timer = setInterval(() => {
      taiDuLieu(false);
    }, 5000);
    return () => clearInterval(timer);
  }, [taiDuLieu]);

  const doiTrangThaiMon = async (
    maDonHang: number,
    maMonAn: number,
    trangThaiMon: string
  ) => {
    setThongBao(null);
    const res = await fetch('/api/bep-hoa-don', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CAP_NHAT_TRANG_THAI_MON',
        maDonHang,
        maMonAn,
        trangThaiMon,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setThongBao({ type: 'success', text: data.message });
      taiDuLieu();
    } else {
      setThongBao({ type: 'error', text: data.message });
    }
  };

  const hoanThanhCaDon = async (maDonHang: number) => {
    setThongBao(null);
    const res = await fetch('/api/bep-hoa-don', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'HOAN_THANH_DON',
        maDonHang,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setThongBao({ type: 'success', text: data.message });
      taiDuLieu();
    }
  };

  const moModalXuatHoaDon = (don: DonHangItem) => {
    setDonXuatHoaDon(don);
    setPhuongThucTT('Tiền mặt');
    setTienGiam('0');
  };

  const xuLyXuatHoaDon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donXuatHoaDon) return;
    setDangXuatHD(true);

    const res = await fetch('/api/bep-hoa-don', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'XUAT_HOA_DON',
        maDonHang: donXuatHoaDon.maDonHang,
        tienGiam: Number(tienGiam || 0),
        phuongThucThanhToan: phuongThucTT,
      }),
    });
    const data = await res.json();
    setDangXuatHD(false);

    if (data.success) {
      const chiTietLuu = [...donXuatHoaDon.chiTiet];
      const donGoc = donXuatHoaDon;
      setDonXuatHoaDon(null);
      setThongBao({ type: 'success', text: data.message });
      setHoaDonXemIn({
        hoaDon: {
          maHoaDon: data.hoaDon.maHoaDon,
          maDonHang: donGoc.maDonHang,
          tenNhanVien: 'Trần Quốc Huy',
          ngayThanhToan: data.hoaDon.ngayThanhToan,
          tongTienGoc: donGoc.tongTien,
          tongTienCuoiCung: data.hoaDon.tongTienCuoiCung,
          phuongThucThanhToan: data.hoaDon.phuongThucThanhToan,
          hinhThuc: donGoc.hinhThuc,
          ghiChu: donGoc.ghiChu,
        },
        chiTiet: chiTietLuu,
      });
      taiDuLieu();
    } else {
      setThongBao({ type: 'error', text: data.message });
    }
  };

  const mauTrangThaiMon = (tt: string) => {
    switch (tt) {
      case 'Chờ':
        return 'bg-gray-100 text-gray-700';
      case 'Đang chế biến':
        return 'bg-amber-100 text-amber-800';
      case 'Hoàn thành':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            PHÂN HỆ BẾP &amp; THU NGÂN (CHẾ BIẾN &rarr; XUẤT HÓA ĐƠN)
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            Điều phối Bếp &amp; Thanh toán xuất hóa đơn
          </h1>
        </div>

        <button
          onClick={() => taiDuLieu()}
          className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ↻ Làm mới danh sách
        </button>
      </div>

      {thongBao && (
        <div
          className={`p-3.5 rounded-xl text-sm font-medium border ${
            thongBao.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {thongBao.text}
        </div>
      )}

      {/* KHU VỰC 1: MÀN HÌNH BẾP THEO DÕI TRẠNG THÁI TỪNG MÓN */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">
          1. Danh sách phiếu Order tại Bếp ({donHangs.length} đơn)
        </h2>

        {loading ? (
          <div className="bg-white p-10 rounded-2xl text-center text-gray-500">
            Đang tải phiếu order từ PostgreSQL...
          </div>
        ) : donHangs.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center border border-dashed border-gray-300 text-gray-500">
            Chưa có đơn hàng nào được gửi xuống bếp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donHangs.map((don) => {
              const daThanhToan = don.trangThai === 'Đã thanh toán';
              const daHoanThanh = don.trangThai === 'Đã hoàn thành';
              return (
                <div
                  key={don.maDonHang}
                  className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${
                    daThanhToan
                      ? 'border-gray-200 opacity-75'
                      : daHoanThanh
                      ? 'border-emerald-300'
                      : 'border-amber-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-gray-900">
                          #ORD-{don.maDonHang}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold">
                          {don.hinhThuc}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          daThanhToan
                            ? 'bg-emerald-600 text-white'
                            : daHoanThanh
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {don.trangThai}
                      </span>
                    </div>

                    {don.ghiChu && (
                      <p className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg mt-2.5">
                        📝 {don.ghiChu}
                      </p>
                    )}

                    {/* Danh sách từng món trong đơn để bếp cập nhật trạng thái */}
                    <div className="mt-3 divide-y divide-gray-100">
                      {don.chiTiet.map((ct) => (
                        <div
                          key={`${don.maDonHang}-${ct.maMonAn}`}
                          className="py-2.5 flex items-center justify-between gap-2"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">
                              <span className="text-red-600 mr-1.5">{ct.soLuong}x</span>
                              {ct.tenMon}
                            </p>
                            {ct.ghiChu && (
                              <p className="text-xs text-gray-500">{ct.ghiChu}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${mauTrangThaiMon(
                                ct.trangThaiMon
                              )}`}
                            >
                              {ct.trangThaiMon}
                            </span>

                            {!daThanhToan && ct.trangThaiMon === 'Chờ' && (
                              <button
                                onClick={() =>
                                  doiTrangThaiMon(
                                    don.maDonHang,
                                    ct.maMonAn,
                                    'Đang chế biến'
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600"
                              >
                                Nấu
                              </button>
                            )}

                            {!daThanhToan &&
                              (ct.trangThaiMon === 'Chờ' ||
                                ct.trangThaiMon === 'Đang chế biến') && (
                                <button
                                  onClick={() =>
                                    doiTrangThaiMon(
                                      don.maDonHang,
                                      ct.maMonAn,
                                      'Hoàn thành'
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                                >
                                  Xong
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thanh thao tác cuối thẻ đơn hàng */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-red-600">
                      {don.tongTien.toLocaleString('vi-VN')} đ
                    </span>

                    <div className="flex items-center gap-2">
                      {!daThanhToan && !daHoanThanh && (
                        <button
                          onClick={() => hoanThanhCaDon(don.maDonHang)}
                          className="px-3 py-1.5 rounded-xl bg-gray-800 text-white text-xs font-bold hover:bg-gray-900"
                        >
                          ✓ Xong cả đơn
                        </button>
                      )}

                      {!daThanhToan ? (
                        <button
                          onClick={() => moModalXuatHoaDon(don)}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                        >
                          🧾 Xuất hóa đơn
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700">
                          ✔ Đã xuất hóa đơn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KHU VỰC 2: LỊCH SỬ HÓA ĐƠN ĐÃ XUẤT (BẢNG HoaDon TRONG POSTGRESQL) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          2. Lịch sử Hóa đơn đã xuất ({hoaDons.length} hóa đơn)
        </h2>

        {hoaDons.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            Chưa có hóa đơn nào được xuất. Hãy bấm &ldquo;Xuất hóa đơn&rdquo; ở đơn hàng phía trên.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="py-3 px-2">Mã HĐ</th>
                  <th className="py-3 px-2">Đơn hàng</th>
                  <th className="py-3 px-2">Thu ngân</th>
                  <th className="py-3 px-2">Hình thức TT</th>
                  <th className="py-3 px-2">Thời gian</th>
                  <th className="py-3 px-2 text-right">Tổng thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {hoaDons.map((hd) => (
                  <tr key={hd.maHoaDon} className="hover:bg-gray-50">
                    <td className="py-3 px-2 font-bold text-gray-900">
                      #HD-{hd.maHoaDon}
                    </td>
                    <td className="py-3 px-2 text-gray-700">
                      #ORD-{hd.maDonHang} ({hd.hinhThuc})
                    </td>
                    <td className="py-3 px-2 text-gray-700">{hd.tenNhanVien}</td>
                    <td className="py-3 px-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                        {hd.phuongThucThanhToan}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-500">
                      {new Date(hd.ngayThanhToan).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-2 text-right font-extrabold text-red-600">
                      {hd.tongTienCuoiCung.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL XÁC NHẬN XUẤT HÓA ĐƠN */}
      {donXuatHoaDon && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={xuLyXuatHoaDon}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900">
              Xuất hóa đơn thanh toán #ORD-{donXuatHoaDon.maDonHang}
            </h3>

            <div className="p-3 rounded-xl bg-gray-50 text-xs space-y-1 text-gray-700">
              {donXuatHoaDon.chiTiet.map((ct) => (
                <div key={ct.maMonAn} className="flex justify-between">
                  <span>
                    {ct.soLuong}x {ct.tenMon}
                  </span>
                  <span className="font-semibold">
                    {(ct.soLuong * ct.donGia).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-sm text-gray-900">
                <span>Tổng tiền gốc:</span>
                <span>{donXuatHoaDon.tongTien.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={phuongThucTT}
                onChange={(e) => setPhuongThucTT(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              >
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Chuyển khoản QR">Chuyển khoản QR</option>
                <option value="Thẻ">Thẻ ngân hàng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Giảm giá khuyến mãi (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                max={donXuatHoaDon.tongTien}
                value={tienGiam}
                onChange={(e) => setTienGiam(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-700">Khách cần thanh toán:</span>
              <span className="text-xl font-extrabold text-red-600">
                {Math.max(
                  0,
                  donXuatHoaDon.tongTien - Number(tienGiam || 0)
                ).toLocaleString('vi-VN')}{' '}
                đ
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDonXuatHoaDon(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={dangXuatHD}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
              >
                {dangXuatHD ? 'Đang xuất...' : 'Xác nhận & In hóa đơn'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL PHIẾU IN HÓA ĐƠN VIỆT FOOD */}
      {hoaDonXemIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="text-center border-b border-dashed border-gray-300 pb-3">
              <h3 className="font-extrabold text-lg text-red-700">🍜 VIỆT FOOD</h3>
              <p className="text-xs text-gray-500">HÓA ĐƠN THANH TOÁN</p>
              <p className="text-xs font-bold text-gray-800 mt-1">
                Số HĐ: #HD-{hoaDonXemIn.hoaDon.maHoaDon} • Đơn: #ORD-
                {hoaDonXemIn.hoaDon.maDonHang}
              </p>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p>Thu ngân: {hoaDonXemIn.hoaDon.tenNhanVien}</p>
              <p>Hình thức: {hoaDonXemIn.hoaDon.hinhThuc}</p>
              <p>Thanh toán: {hoaDonXemIn.hoaDon.phuongThucThanhToan}</p>
              <p>
                Ngày giờ:{' '}
                {new Date(hoaDonXemIn.hoaDon.ngayThanhToan).toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="border-t border-b border-dashed border-gray-300 py-2.5 space-y-1.5 text-xs">
              {hoaDonXemIn.chiTiet.map((ct) => (
                <div key={ct.maMonAn} className="flex justify-between">
                  <span>
                    {ct.soLuong}x {ct.tenMon}
                  </span>
                  <span className="font-semibold">
                    {(ct.soLuong * ct.donGia).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{hoaDonXemIn.hoaDon.tongTienGoc.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between font-extrabold text-base text-red-600 pt-1">
                <span>THÀNH TIỀN:</span>
                <span>
                  {hoaDonXemIn.hoaDon.tongTienCuoiCung.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-gray-800 text-white text-xs font-bold hover:bg-gray-900"
              >
                🖨 In phiếu
              </button>
              <button
                type="button"
                onClick={() => setHoaDonXemIn(null)}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}