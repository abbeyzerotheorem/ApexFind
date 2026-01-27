
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure the service account is configured via environment variables.
// In a local environment, you can use:
// export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
// In Firebase Hosting / Cloud Functions, this is configured automatically.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!getApps().length) {
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
  });
}

const adminDb = getFirestore();

export { adminDb };
