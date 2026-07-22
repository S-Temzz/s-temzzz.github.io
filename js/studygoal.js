import {
  doc,
  onSnapshot,
  setDoc,
  increment,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

const DEFAULT_GOAL_MINUTES = 60;

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function settingsDoc(uid) {
  return doc(db, "users", uid, "settings", "studyGoal");
}

function dayDoc(uid, dateKey) {
  return doc(db, "users", uid, "studyLog", dateKey);
}

export function subscribeToStudyGoalSettings(uid, onData, onError) {
  return onSnapshot(
    settingsDoc(uid),
    (snap) => onData(snap.exists() ? snap.data() : { defaultGoalMinutes: DEFAULT_GOAL_MINUTES }),
    onError
  );
}

export function subscribeToStudyDay(uid, dateKey, onData, onError) {
  return onSnapshot(
    dayDoc(uid, dateKey),
    (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data() } : { id: dateKey, minutesLogged: 0, goalMinutes: null }),
    onError
  );
}

export function setDefaultGoalMinutes(uid, minutes) {
  return setDoc(settingsDoc(uid), { defaultGoalMinutes: minutes }, { merge: true });
}

export function setDayGoalMinutes(uid, dateKey, minutes) {
  return setDoc(
    dayDoc(uid, dateKey),
    { date: dateKey, goalMinutes: minutes, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function logStudyMinutes(uid, dateKey, deltaMinutes) {
  return setDoc(
    dayDoc(uid, dateKey),
    { date: dateKey, minutesLogged: increment(deltaMinutes), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export function resetStudyMinutes(uid, dateKey) {
  return setDoc(
    dayDoc(uid, dateKey),
    { date: dateKey, minutesLogged: 0, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export { DEFAULT_GOAL_MINUTES };
