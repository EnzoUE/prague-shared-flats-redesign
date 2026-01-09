import { NextResponse } from 'next/server';
import { residences } from '@/lib/data/residences';

// GET /api/residences - Get all residences
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: residences,
      count: residences.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch residences' },
      { status: 500 }
    );
  }
}