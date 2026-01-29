
// This API route is no longer used.
// The logic to save user preferences has been moved to the client-side
// in the UserPreferences.tsx component to write directly to Firestore,
// which is allowed by the current Firestore security rules.
// This simplifies the process and avoids potential server-side configuration issues.
import {NextResponse} from 'next/server';

export async function POST() {
  return NextResponse.json(
    {error: 'This endpoint is deprecated.'},
    {status: 410}
  );
}
