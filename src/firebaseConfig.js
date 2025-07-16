// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, getRedirectResult } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCZehGxQjGBXgrPjC-UezZO58H1WSH55d0",
  authDomain: "slopeimageupload.firebaseapp.com",
  projectId: "slopeimageupload",
  storageBucket: "slopeimageupload.firebasestorage.app",
  messagingSenderId: "26570564170",
  appId: "1:26570564170:web:f80409b0df0916d148bcb3",
  measurementId: "G-MXEG6TY1Y8"
};

// Firebase app initialization
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase services initialization
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Language setting (use device language)
auth.useDeviceLanguage();

// Google authentication provider (Safari cache issue fix)
export const googleProvider = new GoogleAuthProvider();
// Always show account selection screen (prevent Safari auto-login)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication-related functions
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export const getRedirectResultHandler = () => getRedirectResult(auth);
export const logOut = () => signOut(auth);

// Storage related functions
export const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const deleteImage = async (path) => {
  const storageRef = ref(storage, path);
  return await deleteObject(storageRef);
};

// Firestore related functions
export const addImageData = async (imageData) => {
  return await addDoc(collection(db, 'images'), imageData);
};

export const getImageList = async () => {
  const q = query(collection(db, 'images'), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteImageData = async (docId) => {
  return await deleteDoc(doc(db, 'images', docId));
};
