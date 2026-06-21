/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} from "firebase/firestore";

// The standard placeholder credentials.
// Users can provide env variables (prefixed with VITE_FIREBASE_) or paste details directly.
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyCoUP59HLEPzQUugmjTfTWN3GLNtTOZ6sA",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "fitness-b1352.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "fitness-b1352",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "fitness-b1352.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "701058556697",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:701058556697:web:74e5198022a6a1f85ddb88"
};

// Check if Firebase is actually configured with actual keys (i.e. not placeholders)
export const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" && 
  firebaseConfig.projectId !== "YOUR_PROJECT_ID";

let app: any = null;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn("Firebase initialization failed. Falling back to local/preview mode.", error);
  }
} else {
  console.log("Firebase is in 'Demo Mode' (using LocalStorage fallback for AI Studio live preview). Configure VITE_FIREBASE_ env vars to use a real Firebase engine.");
}

export { app, db, auth, googleProvider };

// Dual-mode Firebase error wrapper to comply with Firebase-integration skill requirements
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || "mock_user_id",
      email: auth?.currentUser?.email || "mock@example.com",
      emailVerified: true,
      isAnonymous: false,
    },
    operationType,
    path
  };
  console.error("Firestore Error Exception Log:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
