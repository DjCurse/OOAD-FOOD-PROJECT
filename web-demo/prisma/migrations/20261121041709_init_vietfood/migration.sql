-- CreateTable
CREATE TABLE "VaiTro" (
    "maVaiTro" SERIAL NOT NULL,
    "tenVaiTro" TEXT NOT NULL,

    CONSTRAINT "VaiTro_pkey" PRIMARY KEY ("maVaiTro")
);

-- CreateTable
CREATE TABLE "NguoiDung" (
    "maNguoiDung" SERIAL NOT NULL,
    "hoTen" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "matKhau" TEXT NOT NULL,
    "trangThai" BOOLEAN NOT NULL DEFAULT true,
    "maVaiTro" INTEGER NOT NULL,

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("maNguoiDung")
);

-- CreateTable
CREATE TABLE "DanhMuc" (
    "maDanhMuc" SERIAL NOT NULL,
    "tenDanhMuc" TEXT NOT NULL,

    CONSTRAINT "DanhMuc_pkey" PRIMARY KEY ("maDanhMuc")
);

-- CreateTable
CREATE TABLE "MonAn" (
    "maMonAn" SERIAL NOT NULL,
    "tenMon" TEXT NOT NULL,
    "hinhAnh" TEXT,
    "moTa" TEXT,
    "giaBan" INTEGER NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'Còn hàng',
    "maDanhMuc" INTEGER NOT NULL,

    CONSTRAINT "MonAn_pkey" PRIMARY KEY ("maMonAn")
);

-- CreateTable
CREATE TABLE "NguyenLieu" (
    "maNguyenLieu" SERIAL NOT NULL,
    "tenNguyenLieu" TEXT NOT NULL,
    "donViTinh" TEXT NOT NULL,
    "soLuongTonKho" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "NguyenLieu_pkey" PRIMARY KEY ("maNguyenLieu")
);

-- CreateTable
CREATE TABLE "CongThucMonAn" (
    "maMonAn" INTEGER NOT NULL,
    "maNguyenLieu" INTEGER NOT NULL,
    "soLuongCanTru" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CongThucMonAn_pkey" PRIMARY KEY ("maMonAn","maNguyenLieu")
);

-- CreateTable
CREATE TABLE "KhuyenMai" (
    "maKhuyenMai" TEXT NOT NULL,
    "moTa" TEXT NOT NULL,
    "loaiGiam" TEXT NOT NULL,
    "giaTriGiam" INTEGER NOT NULL,
    "donToiThieu" INTEGER NOT NULL DEFAULT 0,
    "dangHoatDong" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KhuyenMai_pkey" PRIMARY KEY ("maKhuyenMai")
);

-- CreateTable
CREATE TABLE "DonHang" (
    "maDonHang" TEXT NOT NULL,
    "soBan" TEXT,
    "ngayDat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tongTien" INTEGER NOT NULL,
    "tienGiam" INTEGER NOT NULL DEFAULT 0,
    "hinhThuc" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'Chờ xử lý',
    "nhanCapNhat" TEXT,
    "ghiChu" TEXT,
    "maNguoiDung" INTEGER,
    "maKhuyenMai" TEXT,

    CONSTRAINT "DonHang_pkey" PRIMARY KEY ("maDonHang")
);

-- CreateTable
CREATE TABLE "ChiTietDonHang" (
    "id" SERIAL NOT NULL,
    "maDonHang" TEXT NOT NULL,
    "maMonAn" INTEGER NOT NULL,
    "soLuong" INTEGER NOT NULL,
    "donGia" INTEGER NOT NULL,
    "trangThaiMon" TEXT NOT NULL DEFAULT 'Chờ',
    "ghiChu" TEXT,

    CONSTRAINT "ChiTietDonHang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VaiTro_tenVaiTro_key" ON "VaiTro"("tenVaiTro");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_email_key" ON "NguoiDung"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DanhMuc_tenDanhMuc_key" ON "DanhMuc"("tenDanhMuc");

-- CreateIndex
CREATE UNIQUE INDEX "NguyenLieu_tenNguyenLieu_key" ON "NguyenLieu"("tenNguyenLieu");

-- AddForeignKey
ALTER TABLE "NguoiDung" ADD CONSTRAINT "NguoiDung_maVaiTro_fkey" FOREIGN KEY ("maVaiTro") REFERENCES "VaiTro"("maVaiTro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonAn" ADD CONSTRAINT "MonAn_maDanhMuc_fkey" FOREIGN KEY ("maDanhMuc") REFERENCES "DanhMuc"("maDanhMuc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CongThucMonAn" ADD CONSTRAINT "CongThucMonAn_maMonAn_fkey" FOREIGN KEY ("maMonAn") REFERENCES "MonAn"("maMonAn") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CongThucMonAn" ADD CONSTRAINT "CongThucMonAn_maNguyenLieu_fkey" FOREIGN KEY ("maNguyenLieu") REFERENCES "NguyenLieu"("maNguyenLieu") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_maNguoiDung_fkey" FOREIGN KEY ("maNguoiDung") REFERENCES "NguoiDung"("maNguoiDung") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_maKhuyenMai_fkey" FOREIGN KEY ("maKhuyenMai") REFERENCES "KhuyenMai"("maKhuyenMai") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonHang" ADD CONSTRAINT "ChiTietDonHang_maDonHang_fkey" FOREIGN KEY ("maDonHang") REFERENCES "DonHang"("maDonHang") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonHang" ADD CONSTRAINT "ChiTietDonHang_maMonAn_fkey" FOREIGN KEY ("maMonAn") REFERENCES "MonAn"("maMonAn") ON DELETE RESTRICT ON UPDATE CASCADE;
