import admin, { ServiceAccount } from 'firebase-admin';

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.projectId
});

const db = admin.firestore();

export default db;