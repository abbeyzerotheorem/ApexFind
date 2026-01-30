
import { initializeApp, getApps, cert, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure the service account is configured via environment variables.
// In a local environment, you can use:
// export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
// In Firebase Hosting / Cloud Functions, this is configured automatically.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const adminApp: App =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
      });

const adminDb = getFirestore(adminApp);

export { adminDb, adminApp };
