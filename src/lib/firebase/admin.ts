
import * as admin from 'firebase-admin';

// Ensure the service account is configured via environment variables.
// In a local environment, you can use:
// export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
// In Firebase Hosting / Cloud Functions, this is configured automatically.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
  });
}

const adminDb = admin.firestore();

export { adminDb };
