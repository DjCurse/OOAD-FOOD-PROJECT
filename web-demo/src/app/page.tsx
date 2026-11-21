'use client';

import React, { useState } from 'react';
import { MonAn, DanhMuc } from '@/types/database';

const DANH_MUC_MAU: DanhMuc[] = [
  { maDanhMuc: 0, tenDanhMuc: 'Tất cả' },
  { maDanhMuc: 1, tenDanhMuc: 'Cơm' },
  { maDanhMuc: 2, tenDanhMuc: 'Phở & Bún' },
  { maDanhMuc: 3, tenDanhMuc: 'Bánh mì' },
  { maDanhMuc: 4, tenDanhMuc: 'Ăn vặt' },
];

const MON_AN_MAU: MonAn[] = [
  {
    maMonAn: 1,
    tenMon: 'Cơm tấm sườn nướng mật ong',
    hinhAnh: '/images/com-tam.jpg',
    moTa: 'Sườn cốt lết nướng mật ong kèm bì, chả trứng và nước mắm chua ngọt.',
    giaBan: 45000,
    trangThai: 'Còn hàng',
    maDanhMuc: 1,
  },
  {
    maMonAn: 2,
    tenMon: 'Phở bò tái nạm đặc biệt',
    hinhAnh: '/images/pho-bo.jpg',
    moTa: 'Nước dùng hầm xương 12 tiếng, thịt bò tái mềm và nạm gầu giòn.',
    giaBan: 55000,
    trangThai: 'Còn hàng',
    maDanhMuc: 2,
  },
  {
    maMonAn: 3,
    tenMon: 'Bánh mì đặc biệt Việt Food',
    hinhAnh: '/images/banh-mi.jpg',
    moTa: 'Bánh mì giòn rụm kẹp pate gan, chả lụa, thịt nguội và đồ chua.',
    giaBan: 30000,
    trangThai: 'Tạm hết',
    maDanhMuc: 3,
  },
];

interface CartItem {
  monAn: MonAn;
  soLuong: number;
  ghiChu: string;
}

export default function DatMonPage() {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hinhThuc, setHinhThuc] = useState<'Tại chỗ' | 'Mang đi'>('Tại chỗ');
  const [soBan, setSoBan] = useState<string>('Bàn 04');
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredMenu = MON_AN_MAU.filter((mon) => {
    const matchCategory = selectedCategory === 0 || mon.maDanhMuc === selectedCategory;
    const matchSearch = mon.tenMon.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddToCart = (mon: MonAn) => {
    if (mon.trangThai !== 'Còn hàng') return;
    setCart((prev) => {
      const existing = prev.find((item) => item.monAn.maMonAn === mon.maMonAn);
      if (existing) {
        return prev.map((item) =>
          item.monAn.maMonAn === mon.maMonAn
            ? { ...item, soLuong: item.soLuong + 1 }
            : item
        );
      }
      return [...prev, { monAn: mon, soLuong: 1, ghiChu: '' }];
    });
  };

  const tongTien = cart.reduce((sum, item) => sum + item.monAn.giaBan * item.soLuong, 0);

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    alert(
      `Đã gửi Order (${hinhThuc}${hinhThuc === 'Tại chỗ' ? ` - ${soBan}` : ''}) thành công!\nTổng tiền: ${tongTien.toLocaleString('vi-VN')}đ`
    );
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header Việt Food */}
      <header className="bg-[#D9232E] text-white px-6 py-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">🍜 Việt Food</span>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">Trang đặt món</span>
        </div>
        <div className="flex gap-2 text-sm">
          <a href="/phuc-vu" className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg">Phục vụ</a>
          <a href="/bep" className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg">Màn hình Bếp</a>
          <a href="/thu-ngan" className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg">Thu ngân</a>
          <a href="/admin/thuc-don" className="bg-amber-400 text-gray-900 font-medium px-3 py-1.5 rounded-lg">Admin</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Thực đơn & Tìm kiếm (UC-4.1) */}
        <section className="lg:col-span-2 space-y-5">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <input
              type="text"
              placeholder="Tìm tên món ăn (VD: Cơm tấm, Phở bò...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D9232E]"
            />
            <div className="flex flex-wrap gap-2">
              {DANH_MUC_MAU.map((dm) => (
                <button
                  key={dm.maDanhMuc}
                  onClick={() => setSelectedCategory(dm.maDanhMuc)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    selectedCategory === dm.maDanhMuc
                      ? 'bg-[#D9232E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dm.tenDanhMuc}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMenu.map((mon) => {
              const isOut = mon.trangThai !== 'Còn hàng';
              return (
                <div
                  key={mon.maMonAn}
                  className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between ${
                    isOut ? 'opacity-60' : ''
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-base">{mon.tenMon}</h3>
                      {isOut && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Tạm hết
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mon.moTa}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-[#D9232E]">
                      {mon.giaBan.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      disabled={isOut}
                      onClick={() => handleAddToCart(mon)}
                      className="px-3.5 py-1.5 rounded-xl text-sm font-medium bg-[#D9232E] text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      + Thêm món
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cột phải: Giỏ hàng & Xác nhận gửi Order (UC-4.2, UC-4.3) */}
        <aside className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-4">
          <h2 className="font-bold text-lg">Giỏ hàng Order</h2>

          {/* Chọn hình thức phục vụ */}
          <div className="grid grid-cols-2 gap-2">
            {(['Tại chỗ', 'Mang đi'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setHinhThuc(mode)}
                className={`py-2 rounded-xl text-sm font-medium border ${
                  hinhThuc === mode
                    ? 'border-[#D9232E] bg-red-50 text-[#D9232E]'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {hinhThuc === 'Tại chỗ' && (
            <input
              type="text"
              value={soBan}
              onChange={(e) => setSoBan(e.target.value)}
              placeholder="Nhập số bàn (VD: Bàn 04)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200"
            />
          )}

          {/* Danh sách món trong giỏ */}
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">Giỏ hàng của bạn đang trống</p>
            ) : (
              cart.map((item) => (
                <div key={item.monAn.maMonAn} className="py-3 space-y-1.5">
                  <div className="flex justify-between text-sm font-medium">
                    <span>
                      {item.soLuong}x {item.monAn.tenMon}
                    </span>
                    <span>{(item.monAn.giaBan * item.soLuong).toLocaleString('vi-VN')}đ</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ghi chú (VD: không hành, ít cay...)"
                    value={item.ghiChu}
                    onChange={(e) =>
                      setCart((prev) =>
                        prev.map((c) =>
                          c.monAn.maMonAn === item.monAn.maMonAn
                            ? { ...c, ghiChu: e.target.value }
                            : c
                        )
                      )
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200"
                  />
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="flex justify-between font-bold text-base">
              <span>Tạm tính</span>
              <span className="text-[#D9232E]">{tongTien.toLocaleString('vi-VN')} đ</span>
            </div>
            <button
              disabled={cart.length === 0}
              onClick={handleConfirmOrder}
              className="w-full py-3 rounded-xl bg-[#D9232E] text-white font-semibold hover:bg-red-700 disabled:bg-gray-300"
            >
              Xác nhận gửi Order
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}