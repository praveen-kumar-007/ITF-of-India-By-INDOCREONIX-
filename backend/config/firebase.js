const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
} catch (error) {
  console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
}

if (serviceAccount.project_id) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
  console.log('Firebase Admin initialized successfully');
} else {
  console.warn('Firebase Service Account JSON is missing or invalid. Firebase features may not work.');
}

const db = admin.database();

module.exports = { admin, db };
