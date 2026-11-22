'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface DanhMucItem {
  maDanhMuc: number;
  tenDanhMuc: string;
  soLuongMon: number;
}

interface MonAnItem {
  maMonAn: number;
  tenMon: string;
  hinhAnh: string;
  moTa: string;
  giaBan: number;
  trangThai: string;
  maDanhMuc: number;
  tenDanhMuc?: string;
}

interface GioHangItem {
  key: string;
  maMonAn: number;
  tenMon: string;
  donGia: number;
  soLuong: number;
  hinhThucMon: string;
  ghiChu: string;
}

interface DonHangItem {
  maDonHang: number;
  ngayDat: string;
  tongTien: number;
  hinhThuc: string;
  trangThai: string;
  ghiChu: string;
  chiTiet: {
    maMonAn: number;
    tenMon?: string;
    soLuong: number;
    donGia: number;
    trangThaiMon: string;
    ghiChu: string;
  }[];
}

export default function GiaoDienDatMon() {
  const [danhMucs, setDanhMucs] = useState<DanhMucItem[]>([]);
  const [monAns, setMonAns] = useState<MonAnItem[]>([]);
  const [donHangs, setDonHangs] = useState<DonHangItem[]>([]);
  const [thongBaoTimKiem, setThongBaoTimKiem] = useState('');
  const [loading, setLoading] = useState(true);

  const [tuKhoa, setTuKhoa] = useState('');
  const [maDanhMucChon, setMaDanhMucChon] = useState<number | ''>('');
  const [locBanChay, setLocBanChay] = useState(false);
  const [sapXepGia, setSapXepGia] = useState<'' | 'asc' | 'desc'>('');

  const [monDangChon, setMonDangChon] = useState<MonAnItem | null>(null);
  const [hinhThucMon, setHinhThucMon] = useState<'' | 'Tại chỗ' | 'Mang đi'>('');
  const [ghiChuMon, setGhiChuMon] = useState('');
  const [loiChonMon, setLoiChonMon] = useState('');

  const [gioHang, setGioHang] = useState<GioHangItem[]>([]);
  const [hinhThucDon, setHinhThucDon] = useState<'Tại chỗ' | 'Mang đi'>('Tại chỗ');
  const [soBan, setSoBan] = useState('04');
  const [ghiChuChung, setGhiChuChung] = useState('');
  const [thongBaoOrder, setThongBaoOrder] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [dangGuiOrder, setDangGuiOrder] = useState(false);

  const taiThucDon = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (tuKhoa.trim()) query.set('tuKhoa', tuKhoa.trim());
    if (maDanhMucChon !== '') query.set('maDanhMuc', String(maDanhMucChon));
    if (locBanChay) query.set('locBanChay', 'true');
    if (sapXepGia) query.set('sapXepGia', sapXepGia);

    const res = await fetch(`/api/dat-mon?${query.toString()}`);
    const data = await res.json();
    setDanhMucs(data.danhMucs || []);
    setMonAns(data.monAns || []);
    setDonHangs(data.donHangs || []);
    setThongBaoTimKiem(data.thongBao || '');
    setLoading(false);
  }, [tuKhoa, maDanhMucChon, locBanChay, sapXepGia]);

  useEffect(() => {
    taiThucDon();
  }, [taiThucDon]);

  const moChiTietMon = (mon: MonAnItem) => {
    if (mon.trangThai !== 'Còn hàng') return;
    setMonDangChon(mon);
    setHinhThucMon('');
    setGhiChuMon('');
    setLoiChonMon('');
  };

  const xuLyThemVaoGio = () => {
    if (!monDangChon) return;
    if (!hinhThucMon) {
      setLoiChonMon('Vui lòng chọn hình thức Tại chỗ hoặc Mang đi');
      return;
    }

    const key = `${monDangChon.maMonAn}-${hinhThucMon}-${ghiChuMon.trim()}`;
    setGioHang((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].soLuong += 1;
        return copy;
      }
      return [
        ...prev,
        {
          key,
          maMonAn: monDangChon.maMonAn,
          tenMon: monDangChon.tenMon,
          donGia: monDangChon.giaBan,
          soLuong: 1,
          hinhThucMon,
          ghiChu: ghiChuMon.trim(),
        },
      ];
    });

    setHinhThucDon(hinhThucMon);
    setMonDangChon(null);
    setThongBaoOrder({
      type: 'success',
      text: `Đã thêm "${monDangChon.tenMon}" (${hinhThucMon}) vào giỏ hàng.`,
    });
  };

  const thayDoiSoLuong = (key: string, delta: number) => {
    setGioHang((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, soLuong: item.soLuong + delta } : item
        )
        .filter((item) => item.soLuong > 0)
    );
  };

  const tongTienTamTinh = gioHang.reduce(
    (sum, item) => sum + item.donGia * item.soLuong,
    0
  );

  const xuLyGuiOrder = async () => {
    if (gioHang.length === 0) return;
    setDangGuiOrder(true);
    setThongBaoOrder(null);

    const res = await fetch('/api/dat-mon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hinhThuc: hinhThucDon,
        soBan: hinhThucDon === 'Tại chỗ' ? soBan : '',
        ghiChuChung,
        danhSachMon: gioHang,
      }),
    });

    const data = await res.json();
    setDangGuiOrder(false);

    if (data.success) {
      setGioHang([]);
      setGhiChuChung('');
      setThongBaoOrder({ type: 'success', text: data.message });
      taiThucDon();
    } else {
      setThongBaoOrder({ type: 'error', text: data.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                PHÂN HỆ ĐẶT MÓN (UC-4.1 &rarr; UC-4.3)
              </span>
              <h1 className="text-2xl font-bold text-gray-900">Thực đơn Việt Food</h1>
            </div>

            <input
              type="text"
              placeholder="Tìm tên món ăn (VD: Cơm tấm, Phở bò)..."
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              className="w-full sm:w-72 px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMaDanhMucChon('')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                maDanhMucChon === ''
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {danhMucs.map((dm) => (
              <button
                key={dm.maDanhMuc}
                onClick={() => setMaDanhMucChon(dm.maDanhMuc)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                  maDanhMucChon === dm.maDanhMuc
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dm.tenDanhMuc} ({dm.soLuongMon})
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setLocBanChay(!locBanChay)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  locBanChay
                    ? 'bg-amber-50 border-amber-500 text-amber-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🔥 Bán chạy
              </button>
              <select
                value={sapXepGia}
                onChange={(e) => setSapXepGia(e.target.value as '' | 'asc' | 'desc')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 bg-white"
              >
                <option value="">Sắp xếp giá</option>
                <option value="asc">Giá: Thấp &rarr; Cao</option>
                <option value="desc">Giá: Cao &rarr; Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-10 rounded-2xl text-center text-gray-500">
            Đang tải thực đơn từ PostgreSQL...
          </div>
        ) : thongBaoTimKiem ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-gray-300">
            <p className="text-gray-600 font-medium">{thongBaoTimKiem}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {monAns.map((mon) => {
              const hetHang = mon.trangThai === 'Tạm hết';
              return (
                <div
                  key={mon.maMonAn}
                  onClick={() => moChiTietMon(mon)}
                  className={`bg-white rounded-2xl p-4 border transition flex flex-col justify-between ${
                    hetHang
                      ? 'opacity-55 cursor-not-allowed border-gray-200 bg-gray-50'
                      : 'cursor-pointer border-gray-100 hover:border-red-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-red-50 text-red-700">
                        {mon.tenDanhMuc}
                      </span>
                      {hetHang ? (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-gray-700 text-white">
                          Hết hàng
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          Còn hàng
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">{mon.tenMon}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mon.moTa}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-base font-extrabold text-red-600">
                      {mon.giaBan.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      disabled={hetHang}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        hetHang
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {hetHang ? 'Tạm hết' : '+ Chọn món'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 text-base mb-3">
            Đơn hàng đã lưu trên CSDL PostgreSQL ({donHangs.length} đơn gần nhất)
          </h2>
          <div className="space-y-3">
            {donHangs.map((dh) => (
              <div
                key={dh.maDonHang}
                className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">#ORD-{dh.maDonHang}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                      {dh.hinhThuc}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                      {dh.trangThai}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {dh.chiTiet
                      .map((ct) => `${ct.soLuong}x ${ct.tenMon} (${ct.trangThaiMon})`)
                      .join(' • ')}
                  </p>
                  {dh.ghiChu && (
                    <p className="text-xs text-gray-500 italic mt-0.5">Ghi chú: {dh.ghiChu}</p>
                  )}
                </div>
                <div className="font-extrabold text-red-600 text-sm whitespace-nowrap">
                  {dh.tongTien.toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 sticky top-20">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Giỏ hàng Order</h2>

          {thongBaoOrder && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs font-medium ${
                thongBaoOrder.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {thongBaoOrder.text}
            </div>
          )}

          {gioHang.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl">
              <p className="text-sm text-gray-500 font-medium">
                Giỏ hàng của bạn đang trống
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Chọn món bên thực đơn để bắt đầu đặt món
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {gioHang.map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.tenMon}</p>
                      <p className="text-xs text-red-600 font-semibold">
                        {item.hinhThucMon} • {(item.donGia * item.soLuong).toLocaleString('vi-VN')} đ
                      </p>
                      {item.ghiChu && (
                        <p className="text-xs text-gray-500">Ghi chú: {item.ghiChu}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => thayDoiSoLuong(item.key, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.soLuong}</span>
                      <button
                        onClick={() => thayDoiSoLuong(item.key, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-bold text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Hình thức đơn
                    </label>
                    <select
                      value={hinhThucDon}
                      onChange={(e) =>
                        setHinhThucDon(e.target.value as 'Tại chỗ' | 'Mang đi')
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                    >
                      <option value="Tại chỗ">Tại chỗ</option>
                      <option value="Mang đi">Mang đi</option>
                    </select>
                  </div>

                  {hinhThucDon === 'Tại chỗ' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Số bàn
                      </label>
                      <input
                        type="text"
                        value={soBan}
                        onChange={(e) => setSoBan(e.target.value)}
                        placeholder="VD: 04"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ghi chú chung cho đơn
                  </label>
                  <input
                    type="text"
                    value={ghiChuChung}
                    onChange={(e) => setGhiChuChung(e.target.value)}
                    placeholder="VD: Lên món cùng lúc..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-gray-600">Tổng tiền tạm tính:</span>
                  <span className="text-xl font-extrabold text-red-600">
                    {tongTienTamTinh.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <button
                  onClick={xuLyGuiOrder}
                  disabled={dangGuiOrder}
                  className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition disabled:opacity-50"
                >
                  {dangGuiOrder ? 'Đang gửi Order...' : 'Xác nhận gửi Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {monDangChon && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">{monDangChon.tenMon}</h3>
            <p className="text-xs text-gray-500 mt-1">{monDangChon.moTa}</p>
            <p className="text-base font-extrabold text-red-600 mt-2">
              {monDangChon.giaBan.toLocaleString('vi-VN')} đ
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Hình thức phục vụ <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Tại chỗ', 'Mang đi'] as const).map((ht) => (
                  <button
                    key={ht}
                    type="button"
                    onClick={() => {
                      setHinhThucMon(ht);
                      setLoiChonMon('');
                    }}
                    className={`py-2.5 rounded-xl border text-sm font-semibold transition ${
                      hinhThucMon === ht
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {ht}
                  </button>
                ))}
              </div>
              {loiChonMon && (
                <p className="text-xs text-red-600 font-semibold mt-1.5">{loiChonMon}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ghi chú món ăn (tùy chọn)
              </label>
              <input
                type="text"
                value={ghiChuMon}
                onChange={(e) => setGhiChuMon(e.target.value)}
                placeholder="VD: ít đá, không hành..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setMonDangChon(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={xuLyThemVaoGio}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}