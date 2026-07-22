import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

function gradesCollection(uid) {
  return collection(db, "users", uid, "grades");
}

export function subscribeToGrades(uid, onData, onError) {
  const q = query(gradesCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const grades = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(grades);
    },
    onError
  );
}

export function addGrade(uid, { subject, currentGrade, targetGrade }) {
  return addDoc(gradesCollection(uid), {
    subject,
    currentGrade,
    targetGrade,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateGrade(uid, gradeId, { currentGrade, targetGrade }) {
  return updateDoc(doc(db, "users", uid, "grades", gradeId), {
    currentGrade,
    targetGrade,
    updatedAt: serverTimestamp(),
  });
}

export function deleteGrade(uid, gradeId) {
  return deleteDoc(doc(db, "users", uid, "grades", gradeId));
}
