import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences, completedAt } = await request.json();

    if (!userId || !preferences) {
      return NextResponse.json({ error: 'User ID and preferences are required' }, { status: 400 });
    }

    const userDocRef = adminDb.collection('users').doc(userId);

    // Use the Admin SDK to merge the preferences into the user's document
    await userDocRef.set({
      preferences: preferences,
      preferencesCompletedAt: completedAt || new Date().toISOString(),
    }, { merge: true });
    
    return NextResponse.json({ success: true, userId });

  } catch (error: any) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences', details: error.message },
      { status: 500 }
    );
  }
}
