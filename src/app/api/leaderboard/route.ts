import { NextResponse } from 'next/server';

// Temporary in-memory store for environments without DB
const mem: Array<{ id: string; playerName: string; retirementAgeMonths: number; passiveIncomeAtRetirement: number; createdAt: string }> = [];

export async function GET() {
  const youngest = [...mem].sort((a, b) => a.retirementAgeMonths - b.retirementAgeMonths).slice(0, 20);
  const richest = [...mem].sort((a, b) => b.passiveIncomeAtRetirement - a.passiveIncomeAtRetirement).slice(0, 20);
  return NextResponse.json({ youngest, richest });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { playerName, retirementAgeMonths, passiveIncomeAtRetirement } = body ?? {};
  if (!playerName || typeof retirementAgeMonths !== 'number' || typeof passiveIncomeAtRetirement !== 'number') {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }
  const row = { id: Math.random().toString(36).slice(2), playerName, retirementAgeMonths, passiveIncomeAtRetirement, createdAt: new Date().toISOString() };
  mem.push(row);
  return NextResponse.json(row);
}

