// Firebase initialization — prototype build, config kept inline in client JS
// on purpose (public identifiers, not secrets; real protection comes from
// Firestore security rules + Firebase Auth provider settings).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVPelRJVFkted3Qim7oOLiWv2zg4c54uw",
  authDomain: "mysmartschool-80bca.firebaseapp.com",
  projectId: "mysmartschool-80bca",
  storageBucket: "mysmartschool-80bca.firebasestorage.app",
  messagingSenderId: "428556748944",
  appId: "1:428556748944:web:3df71044ebdfcf06bd3015",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
