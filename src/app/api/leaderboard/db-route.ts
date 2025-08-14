import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const youngest = await prisma.leaderboard.findMany({ orderBy: { retirementAgeMonths: 'asc' }, take: 20 });
  const richest = await prisma.leaderboard.findMany({ orderBy: { passiveIncomeAtRetirement: 'desc' }, take: 20 });
  return NextResponse.json({ youngest, richest });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { playerName, retirementAgeMonths, passiveIncomeAtRetirement } = body ?? {};
  if (!playerName || typeof retirementAgeMonths !== 'number' || typeof passiveIncomeAtRetirement !== 'number') {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }
  const row = await prisma.leaderboard.create({ data: { playerName, retirementAgeMonths, passiveIncomeAtRetirement } });
  return NextResponse.json(row);
}

