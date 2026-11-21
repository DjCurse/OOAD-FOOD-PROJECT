// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Tạo 5 vai trò hệ thống
  const roles = ['Admin', 'Thu Ngân', 'Bếp', 'Phục Vụ', 'Khách Hàng'];
  for (const tenVaiTro of roles) {
    await prisma.vaiTro.upsert({
      where: { tenVaiTro },
      update: {},
      create: { tenVaiTro },
    });
  }

  const adminRole = await prisma.vaiTro.findUniqueOrThrow({ where: { tenVaiTro: 'Admin' } });

  // 2. Tài khoản Admin mặc định
  await prisma.nguoiDung.upsert({
    where: { email: 'admin@vietfood.vn' },
    update: {},
    create: {
      hoTen: 'Quản trị viên Việt Food',
      email: 'admin@vietfood.vn',
      matKhau: '123456',
      maVaiTro: adminRole.maVaiTro,
    },
  });

  // 3. Danh mục món ăn
  const dmCom = await prisma.danhMuc.upsert({
    where: { tenDanhMuc: 'Cơm' },
    update: {},
    create: { tenDanhMuc: 'Cơm' },
  });
  const dmPho = await prisma.danhMuc.upsert({
    where: { tenDanhMuc: 'Phở & Bún' },
    update: {},
    create: { tenDanhMuc: 'Phở & Bún' },
  });
  const dmBanhMi = await prisma.danhMuc.upsert({
    where: { tenDanhMuc: 'Bánh mì' },
    update: {},
    create: { tenDanhMuc: 'Bánh mì' },
  });

  // 4. Nguyên liệu tồn kho
  const gaoTam = await prisma.nguyenLieu.upsert({
    where: { tenNguyenLieu: 'Gạo tấm' },
    update: {},
    create: { tenNguyenLieu: 'Gạo tấm', donViTinh: 'kg', soLuongTonKho: 50 },
  });
  const suonCotLet = await prisma.nguyenLieu.upsert({
    where: { tenNguyenLieu: 'Sườn cốt lết' },
    update: {},
    create: { tenNguyenLieu: 'Sườn cốt lết', donViTinh: 'kg', soLuongTonKho: 25 },
  });
  const banhPho = await prisma.nguyenLieu.upsert({
    where: { tenNguyenLieu: 'Bánh phở tươi' },
    update: {},
    create: { tenNguyenLieu: 'Bánh phở tươi', donViTinh: 'kg', soLuongTonKho: 30 },
  });
  const thitBo = await prisma.nguyenLieu.upsert({
    where: { tenNguyenLieu: 'Thịt bò tái nạm' },
    update: {},
    create: { tenNguyenLieu: 'Thịt bò tái nạm', donViTinh: 'kg', soLuongTonKho: 15 },
  });

  // 5. Món ăn & Công thức trừ kho
  await prisma.chiTietDonHang.deleteMany();
  await prisma.donHang.deleteMany();
  await prisma.congThucMonAn.deleteMany();
  await prisma.monAn.deleteMany();

  await prisma.monAn.create({
    data: {
      tenMon: 'Cơm tấm sườn nướng mật ong',
      hinhAnh: '/images/com-tam.jpg',
      moTa: 'Sườn cốt lết nướng mật ong kèm bì, chả trứng và nước mắm chua ngọt.',
      giaBan: 45000,
      trangThai: 'Còn hàng',
      maDanhMuc: dmCom.maDanhMuc,
      congThuc: {
        create: [
          { maNguyenLieu: gaoTam.maNguyenLieu, soLuongCanTru: 0.2 },
          { maNguyenLieu: suonCotLet.maNguyenLieu, soLuongCanTru: 0.25 },
        ],
      },
    },
  });

  await prisma.monAn.create({
    data: {
      tenMon: 'Phở bò tái nạm đặc biệt',
      hinhAnh: '/images/pho-bo.jpg',
      moTa: 'Nước dùng hầm xương 12 tiếng, thịt bò tái mềm và nạm gầu giòn.',
      giaBan: 55000,
      trangThai: 'Còn hàng',
      maDanhMuc: dmPho.maDanhMuc,
      congThuc: {
        create: [
          { maNguyenLieu: banhPho.maNguyenLieu, soLuongCanTru: 0.25 },
          { maNguyenLieu: thitBo.maNguyenLieu, soLuongCanTru: 0.15 },
        ],
      },
    },
  });

  await prisma.monAn.create({
    data: {
      tenMon: 'Bánh mì đặc biệt Việt Food',
      hinhAnh: '/images/banh-mi.jpg',
      moTa: 'Bánh mì giòn rụm kẹp pate gan, chả lụa, thịt nguội và đồ chua.',
      giaBan: 30000,
      trangThai: 'Tạm hết',
      maDanhMuc: dmBanhMi.maDanhMuc,
    },
  });

  // 6. Mã khuyến mãi
  await prisma.khuyenMai.upsert({
    where: { maKhuyenMai: 'VIETFOOD10' },
    update: {},
    create: {
      maKhuyenMai: 'VIETFOOD10',
      moTa: 'Giảm 10% cho đơn từ 100.000đ',
      loaiGiam: 'PHAN_TRAM',
      giaTriGiam: 10,
      donToiThieu: 100000,
    },
  });

  console.log('Seed dữ liệu Việt Food thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });