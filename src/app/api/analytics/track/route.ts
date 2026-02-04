import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json();

    if (!event) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    // Attempt to write to Firestore, but fail gracefully if Admin SDK is not configured
    try {
      await adminDb.collection('analytics_events').add({
        event_type: event,
        event_data: data || {},
        timestamp: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (dbError) {
      console.warn('Analytics DB write skipped - credentials may be missing:', dbError);
      // We return 200 even if DB write fails to avoid breaking client-side flows
      return NextResponse.json({ tracked: false, reason: 'storage_unavailable' });
    }
    
    return NextResponse.json({ tracked: true, event });

  } catch (error: any) {
    console.error('Analytics tracking route error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
