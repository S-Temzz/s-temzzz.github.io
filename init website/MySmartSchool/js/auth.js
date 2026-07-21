// Shared auth helpers used by login.html, dashboard.html and index.html's nav.
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth, googleProvider } from "./firebase-config.js";

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred;
}

export async function signInGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  return signOut(auth);
}

const ERROR_MESSAGES = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists — try signing in instead.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/popup-blocked": "Your browser blocked the sign-in popup — please allow popups for this site and try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "No internet connection. Check your network and try again.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled yet for this app.",
};

const SILENT_ERROR_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
]);

// Returns null when the error should be silently ignored (e.g. user closed
// the Google popup themselves), otherwise a friendly message string.
export function mapAuthError(err) {
  const code = err && err.code;
  if (SILENT_ERROR_CODES.has(code)) return null;
  return ERROR_MESSAGES[code] || "Something went wrong — please try again.";
}
