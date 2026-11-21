import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [danhMuc, monAn] = await Promise.all([
    prisma.danhMuc.findMany({ orderBy: { maDanhMuc: 'asc' } }),
    prisma.monAn.findMany({
      include: { danhMuc: true },
      orderBy: { maMonAn: 'asc' },
    }),
  ]);

  return NextResponse.json({ danhMuc, monAn });
}