import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Tạo 5 danh mục thực đơn (UC-1.1 -> UC-1.4)
  const danhMucNames = ['Cơm', 'Phở & Bún', 'Bánh mì', 'Ăn vặt', 'Thức uống'];
  const danhMucMap: Record<string, number> = {};

  for (const tenDM of danhMucNames) {
    const dm = await prisma.danhMuc.upsert({
      where: { tenDanhMuc: tenDM },
      update: {},
      create: { tenDanhMuc: tenDM },
    });
    danhMucMap[tenDM] = dm.maDanhMuc;
  }

  // 2. Tạo danh sách món ăn mẫu Việt Food (UC-2.1 -> UC-2.5 & UC-4.1)
  const monAnCount = await prisma.monAn.count();
  if (monAnCount === 0) {
    const comTam = await prisma.monAn.create({
      data: {
        tenMon: 'Cơm tấm sườn nướng mật ong',
        hinhAnh: '/images/com-tam.jpg',
        moTa: 'Cơm tấm dẻo thơm ăn kèm sườn cốt lết nướng mật ong đậm đà và đồ chua.',
        giaBan: 45000,
        trangThai: 'Còn hàng',
        maDanhMuc: danhMucMap['Cơm'],
      },
    });

    const phoBo = await prisma.monAn.create({
      data: {
        tenMon: 'Phở bò tái nạm đặc biệt',
        hinhAnh: '/images/pho-bo.jpg',
        moTa: 'Nước dùng hầm xương bò 12 giờ, thịt bò tái nạm mềm ngọt.',
        giaBan: 55000,
        trangThai: 'Còn hàng',
        maDanhMuc: danhMucMap['Phở & Bún'],
      },
    });

    await prisma.monAn.create({
      data: {
        tenMon: 'Bún chả Hà Nội',
        hinhAnh: '/images/bun-cha.jpg',
        moTa: 'Chả nướng than hoa thơm lừng cùng nước mắm chua ngọt chuẩn vị.',
        giaBan: 49000,
        trangThai: 'Còn hàng',
        maDanhMuc: danhMucMap['Phở & Bún'],
      },
    });

    await prisma.monAn.create({
      data: {
        tenMon: 'Bánh mì đặc biệt Việt Food',
        hinhAnh: '/images/banh-mi.jpg',
        moTa: 'Bánh mì giòn rụm nhân thịt nguội, chả lụa, pate gan và rau thơm.',
        giaBan: 32000,
        trangThai: 'Còn hàng',
        maDanhMuc: danhMucMap['Bánh mì'],
      },
    });

    await prisma.monAn.create({
      data: {
        tenMon: 'Gỏi cuốn tôm thịt',
        hinhAnh: '/images/goi-cuon.jpg',
        moTa: 'Gỏi cuốn tươi thanh mát chấm tương đậu phộng béo bùi (phần 2 cuốn).',
        giaBan: 28000,
        trangThai: 'Còn hàng',
        maDanhMuc: danhMucMap['Ăn vặt'],
      },
    });

    await prisma.monAn.create({
      data: {
        tenMon: 'Trà đào cam sả',
        hinhAnh: '/images/tra-dao.jpg',
        moTa: 'Trà đào thanh mát kết hợp cam vàng tươi và sả thơm.',
        giaBan: 25000,
        trangThai: 'Còn hàng',
        maDanhMuc: danhMucMap['Thức uống'],
      },
    });

    // 3. Tạo 1 đơn hàng mẫu để hiển thị sẵn & test luồng phụ xóa món đã có trong hóa đơn (UC-2.4)
    await prisma.donHang.create({
      data: {
        tongTien: 145000,
        hinhThuc: 'Tại chỗ',
        trangThai: 'Chờ xử lý',
        ghiChu: 'Bàn 04 - Không hành, nước dùng riêng.',
        chiTietDonHangs: {
          create: [
            {
              maMonAn: comTam.maMonAn,
              soLuong: 2,
              donGia: 45000,
              trangThaiMon: 'Chờ',
              ghiChu: 'Không hành',
            },
            {
              maMonAn: phoBo.maMonAn,
              soLuong: 1,
              donGia: 55000,
              trangThaiMon: 'Chờ',
              ghiChu: 'Nước dùng riêng',
            },
          ],
        },
      },
    });
  }

  console.log('Seed dữ liệu demo Việt Food thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });