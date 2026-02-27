import { NextRequest, NextResponse } from 'next/server';
import { recordClick, parseClickFromRequest } from '@/features/track-click';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = parseClickFromRequest(body, request.headers);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    await recordClick(event);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
