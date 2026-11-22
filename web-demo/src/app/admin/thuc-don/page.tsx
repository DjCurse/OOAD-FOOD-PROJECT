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

export default function GiaoDienThucDon() {
  const [danhMucs, setDanhMucs] = useState<DanhMucItem[]>([]);
  const [monAns, setMonAns] = useState<MonAnItem[]>([]);
  const [maDanhMucLoc, setMaDanhMucLoc] = useState<number | ''>('');
  const [thongBaoDanhSachMon, setThongBaoDanhSachMon] = useState('');

  const [alertMsg, setAlertMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [tenDanhMucMoi, setTenDanhMucMoi] = useState('');
  const [loiDanhMuc, setLoiDanhMuc] = useState('');
  const [danhMucDangSua, setDanhMucDangSua] = useState<DanhMucItem | null>(null);

  const [moFormMon, setMoFormMon] = useState(false);
  const [monDangSua, setMonDangSua] = useState<MonAnItem | null>(null);
  const [tenMon, setTenMon] = useState('');
  const [maDanhMucMon, setMaDanhMucMon] = useState<number | ''>('');
  const [giaBan, setGiaBan] = useState('');
  const [moTa, setMoTa] = useState('');
  const [hinhAnh, setHinhAnh] = useState('/images/com-tam.jpg');
  const [loiFormMon, setLoiFormMon] = useState('');
  const [loiAnh, setLoiAnh] = useState('');

  const taiDuLieu = useCallback(async () => {
    const query = maDanhMucLoc !== '' ? `?maDanhMuc=${maDanhMucLoc}` : '';
    const res = await fetch(`/api/thuc-don${query}`);
    const data = await res.json();
    setDanhMucs(data.danhMucs || []);
    setMonAns(data.monAns || []);
    setThongBaoDanhSachMon(data.thongBao || '');
  }, [maDanhMucLoc]);

  useEffect(() => {
    taiDuLieu();
  }, [taiDuLieu]);

  const xuLyLuuDanhMuc = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoiDanhMuc('');
    setAlertMsg(null);

    const isEdit = Boolean(danhMucDangSua);
    const res = await fetch('/api/thuc-don', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: isEdit ? 'SUA_DANH_MUC' : 'THEM_DANH_MUC',
        maDanhMuc: danhMucDangSua?.maDanhMuc,
        tenDanhMuc: tenDanhMucMoi,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      setLoiDanhMuc(data.message);
      return;
    }

    setTenDanhMucMoi('');
    setDanhMucDangSua(null);
    setAlertMsg({ type: 'success', text: data.message });
    taiDuLieu();
  };

  const xuLyXoaDanhMuc = async (dm: DanhMucItem) => {
    setAlertMsg(null);
    const xacNhan = window.confirm('Bạn có chắc chắn muốn xóa danh mục này?');
    if (!xacNhan) return;

    const res = await fetch('/api/thuc-don', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'XOA_DANH_MUC',
        maDanhMuc: dm.maDanhMuc,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      setAlertMsg({ type: 'error', text: data.message });
      return;
    }

    if (maDanhMucLoc === dm.maDanhMuc) setMaDanhMucLoc('');
    setAlertMsg({ type: 'success', text: data.message });
    taiDuLieu();
  };

  const xuLyChonFileAnh = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoiAnh('');
    const file = e.target.files?.[0];
    if (!file) return;

    const hopLeDinhDang = ['image/jpeg', 'image/png'].includes(file.type);
    const hopLeDungLuong = file.size <= 2 * 1024 * 1024;

    if (!hopLeDinhDang || !hopLeDungLuong) {
      setLoiAnh('Định dạng ảnh không hợp lệ hoặc kích thước quá lớn');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setHinhAnh(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const moModalThemMon = () => {
    setMonDangSua(null);
    setTenMon('');
    setMaDanhMucMon(danhMucs[0]?.maDanhMuc || '');
    setGiaBan('');
    setMoTa('');
    setHinhAnh('/images/com-tam.jpg');
    setLoiFormMon('');
    setLoiAnh('');
    setMoFormMon(true);
  };

  const moModalSuaMon = (mon: MonAnItem) => {
    setMonDangSua(mon);
    setTenMon(mon.tenMon);
    setMaDanhMucMon(mon.maDanhMuc);
    setGiaBan(String(mon.giaBan));
    setMoTa(mon.moTa);
    setHinhAnh(mon.hinhAnh);
    setLoiFormMon('');
    setLoiAnh('');
    setMoFormMon(true);
  };

  const xuLyLuuMonAn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoiFormMon('');
    if (loiAnh) return;

    const res = await fetch('/api/thuc-don', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: monDangSua ? 'SUA_MON_AN' : 'THEM_MON_AN',
        maMonAn: monDangSua?.maMonAn,
        tenMon,
        maDanhMuc: maDanhMucMon,
        giaBan: Number(giaBan),
        moTa,
        hinhAnh,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      setLoiFormMon(data.message);
      return;
    }

    setMoFormMon(false);
    setAlertMsg({ type: 'success', text: data.message });
    taiDuLieu();
  };

  const xuLyXoaMonAn = async (mon: MonAnItem) => {
    setAlertMsg(null);
    const xacNhan1 = window.confirm('Bạn có chắc chắn muốn xóa món ăn này?');
    if (!xacNhan1) return;

    const res1 = await fetch('/api/thuc-don', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'XOA_MON_AN',
        maMonAn: mon.maMonAn,
        xacNhanNgungKinhDoanh: false,
      }),
    });

    const data1 = await res1.json();

    if (data1.requiresDeactivateConfirm) {
      const xacNhan2 = window.confirm(data1.message);
      if (!xacNhan2) return;

      const res2 = await fetch('/api/thuc-don', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'XOA_MON_AN',
          maMonAn: mon.maMonAn,
          xacNhanNgungKinhDoanh: true,
        }),
      });
      const data2 = await res2.json();
      setAlertMsg({ type: 'success', text: data2.message });
      taiDuLieu();
      return;
    }

    setAlertMsg({ type: 'success', text: data1.message });
    taiDuLieu();
  };

  const xuLyToggleTrangThai = async (mon: MonAnItem) => {
    const trangThaiMoi = mon.trangThai === 'Còn hàng' ? 'Tạm hết' : 'Còn hàng';
    const res = await fetch('/api/thuc-don', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CAP_NHAT_TRANG_THAI_MON',
        maMonAn: mon.maMonAn,
        trangThaiMoi,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setAlertMsg({ type: 'success', text: data.message });
      taiDuLieu();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            PHÂN HỆ QUẢN LÝ THỰC ĐƠN (UC-1.1 &rarr; UC-1.4 &amp; UC-2.1 &rarr; UC-2.5)
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Danh mục &amp; Món ăn
          </h1>
        </div>

        <button
          onClick={moModalThemMon}
          className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition"
        >
          + Thêm món ăn mới
        </button>
      </div>

      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl text-sm font-medium border ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900 text-base">
            1. Danh mục thực đơn ({danhMucs.length})
          </h2>

          <form onSubmit={xuLyLuuDanhMuc} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={
                  danhMucDangSua ? 'Nhập tên danh mục mới...' : 'Tên danh mục mới...'
                }
                value={tenDanhMucMoi}
                onChange={(e) => {
                  setTenDanhMucMoi(e.target.value);
                  setLoiDanhMuc('');
                }}
                className={`flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none ${
                  loiDanhMuc
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-red-600'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
              >
                {danhMucDangSua ? 'Cập nhật' : 'Lưu'}
              </button>
            </div>

            {danhMucDangSua && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Đang sửa: {danhMucDangSua.tenDanhMuc}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDanhMucDangSua(null);
                    setTenDanhMucMoi('');
                    setLoiDanhMuc('');
                  }}
                  className="text-red-600 underline"
                >
                  Hủy sửa
                </button>
              </div>
            )}

            {loiDanhMuc && (
              <p className="text-xs font-semibold text-red-600">{loiDanhMuc}</p>
            )}
          </form>

          <div className="divide-y divide-gray-100 border-t border-gray-100 pt-2">
            <div
              onClick={() => setMaDanhMucLoc('')}
              className={`py-2.5 px-3 rounded-xl cursor-pointer flex items-center justify-between text-sm ${
                maDanhMucLoc === ''
                  ? 'bg-red-50 text-red-700 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Tất cả danh mục</span>
            </div>

            {danhMucs.map((dm) => (
              <div
                key={dm.maDanhMuc}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-2 text-sm ${
                  maDanhMucLoc === dm.maDanhMuc ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setMaDanhMucLoc(dm.maDanhMuc)}
                  className={`text-left flex-1 ${
                    maDanhMucLoc === dm.maDanhMuc
                      ? 'font-bold text-red-700'
                      : 'text-gray-800 font-medium'
                  }`}
                >
                  {dm.tenDanhMuc}{' '}
                  <span className="text-xs text-gray-400">({dm.soLuongMon} món)</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setDanhMucDangSua(dm);
                      setTenDanhMucMoi(dm.tenDanhMuc);
                      setLoiDanhMuc('');
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => xuLyXoaDanhMuc(dm)}
                    className="text-red-600 hover:underline font-semibold"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-base">
              2. Danh sách món ăn ({monAns.length})
            </h2>
            <span className="text-xs text-gray-500">
              Gạt công tắc để đổi trạng thái Còn hàng / Tạm hết (UC-2.5)
            </span>
          </div>

          {thongBaoDanhSachMon ? (
            <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl text-sm text-gray-500">
              {thongBaoDanhSachMon}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                    <th className="py-3 px-2">Mã</th>
                    <th className="py-3 px-2">Tên món</th>
                    <th className="py-3 px-2">Danh mục</th>
                    <th className="py-3 px-2">Giá bán</th>
                    <th className="py-3 px-2">Trạng thái (UC-2.5)</th>
                    <th className="py-3 px-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {monAns.map((mon) => {
                    const ngungKD = mon.trangThai === 'Ngừng kinh doanh';
                    const conHang = mon.trangThai === 'Còn hàng';
                    return (
                      <tr key={mon.maMonAn} className="hover:bg-gray-50">
                        <td className="py-3 px-2 font-mono text-xs text-gray-500">
                          #{mon.maMonAn}
                        </td>
                        <td className="py-3 px-2">
                          <p className="font-bold text-gray-900">{mon.tenMon}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{mon.moTa}</p>
                        </td>
                        <td className="py-3 px-2 text-xs font-medium text-gray-700">
                          {mon.tenDanhMuc}
                        </td>
                        <td className="py-3 px-2 font-bold text-red-600 whitespace-nowrap">
                          {mon.giaBan.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-2">
                          {ngungKD ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-200 text-gray-700">
                              Ngừng kinh doanh
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => xuLyToggleTrangThai(mon)}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition ${
                                conHang
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  conHang ? 'bg-emerald-600' : 'bg-amber-600'
                                }`}
                              />
                              {mon.trangThai}
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap space-x-3">
                          <button
                            type="button"
                            onClick={() => moModalSuaMon(mon)}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => xuLyXoaMonAn(mon)}
                            className="text-xs font-bold text-red-600 hover:underline"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {moFormMon && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={xuLyLuuMonAn}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900">
              {monDangSua ? 'Cập nhật thông tin món ăn' : 'Thêm món ăn mới'}
            </h3>

            {loiFormMon && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                {loiFormMon}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tên món <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={tenMon}
                onChange={(e) => setTenMon(e.target.value)}
                placeholder="VD: Cơm gà xối mỡ"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Danh mục <span className="text-red-600">*</span>
                </label>
                <select
                  value={maDanhMucMon}
                  onChange={(e) =>
                    setMaDanhMucMon(e.target.value ? Number(e.target.value) : '')
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {danhMucs.map((dm) => (
                    <option key={dm.maDanhMuc} value={dm.maDanhMuc}>
                      {dm.tenDanhMuc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Giá bán (VNĐ) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={giaBan}
                  onChange={(e) => setGiaBan(e.target.value)}
                  placeholder="45000"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Hình ảnh (JPG, PNG &le; 2MB)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={xuLyChonFileAnh}
                className={`w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 file:font-semibold ${
                  loiAnh ? 'border border-red-500 rounded-xl p-1' : ''
                }`}
              />
              {loiAnh && (
                <p className="text-xs font-semibold text-red-600 mt-1">{loiAnh}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                rows={3}
                value={moTa}
                onChange={(e) => setMoTa(e.target.value)}
                placeholder="Mô tả hương vị, thành phần món ăn..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMoFormMon(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
              >
                {monDangSua ? 'Cập nhật' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}