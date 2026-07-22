import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

function countdownsCollection(uid) {
  return collection(db, "users", uid, "examCountdowns");
}

export function subscribeToExamCountdowns(uid, onData, onError) {
  const q = query(countdownsCollection(uid), orderBy("targetDate", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const countdowns = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(countdowns);
    },
    onError
  );
}

export function addExamCountdown(uid, targetDateMs, label) {
  return addDoc(countdownsCollection(uid), {
    targetDate: Timestamp.fromMillis(targetDateMs),
    label: label || "Exam",
    createdAt: serverTimestamp(),
  });
}

export function deleteExamCountdown(uid, countdownId) {
  return deleteDoc(doc(db, "users", uid, "examCountdowns", countdownId));
}

export function getCountdownParts(targetMs) {
  const distance = targetMs - Date.now();
  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isPast: false };
}
