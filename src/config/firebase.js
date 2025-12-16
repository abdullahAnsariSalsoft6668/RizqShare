const admin = require('firebase-admin');
const path = require('path');

let firebaseApp;

const initializeFirebase = () => {
  try {
    // Option 1: Using service account file
    const serviceAccountPath = path.join(__dirname, '../../firebase-adminsdk.json');
    
    try {
      const serviceAccount = require(serviceAccountPath);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      
      console.log('✅ Firebase Admin initialized with service account file');
    } catch (fileError) {
      // Option 2: Using environment variables
      if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
        
        console.log('✅ Firebase Admin initialized with environment variables');
      } else {
        console.warn('⚠️  Firebase not initialized - using JWT authentication instead');
        return null;
      }
    }
    
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.warn('⚠️  Falling back to JWT authentication');
    return null;
  }
};

const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    firebaseApp = initializeFirebase();
  }
  return firebaseApp;
};

const verifyFirebaseToken = async (idToken) => {
  try {
    const firebase = getFirebaseAdmin();
    if (!firebase) {
      throw new Error('Firebase not initialized');
    }
    
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  verifyFirebaseToken
};

