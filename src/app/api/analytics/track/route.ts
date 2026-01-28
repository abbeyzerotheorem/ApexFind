
import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();

    if (!event) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    // Use the Admin SDK to write to a collection that is otherwise locked down
    await adminDb.collection('analytics_events').add({
      event_type: event,
      event_data: data || {},
      timestamp: new Date().toISOString(),
      ip_address: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });
    
    return NextResponse.json({ tracked: true, event });

  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event', details: error.message },
      { status: 500 }
    );
  }
}
