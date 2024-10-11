import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAj871W2aEHtLmSRguKY8-ImkwEGBKOqug",
  authDomain: "ns-estetica.firebaseapp.com",
  databaseURL: "https://ns-estetica-default-rtdb.firebaseio.com",
  projectId: "ns-estetica",
  storageBucket: "ns-estetica.appspot.com",
  messagingSenderId: "841751878331",
  appId: "1:841751878331:web:acae8e3fc5257b43b6e79e",
  measurementId: "G-8YD3H23DN1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);