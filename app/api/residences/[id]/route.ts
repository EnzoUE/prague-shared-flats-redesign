import { NextResponse } from 'next/server';
import { getResidenceById } from '@/lib/data/residences';

// GET /api/residences/[id] - Get residence by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const residenceId = parseInt(params.id);
    const residence = getResidenceById(residenceId);

    if (!residence) {
      return NextResponse.json(
        { success: false, error: 'Residence not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: residence
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch residence' },
      { status: 500 }
    );
  }
}
