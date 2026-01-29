// This file is no longer in use.
// Orphaned listings are now filtered out on the client-side by checking
// for the existence of the agent's user document in Firestore.
// This avoids server-side permission issues with the Firebase Admin SDK.

import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'This endpoint is deprecated. Orphaned listings are now filtered on the client-side.'
    }, { status: 410 });
}
