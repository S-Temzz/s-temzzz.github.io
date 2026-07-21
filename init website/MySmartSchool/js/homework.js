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

function homeworkCollection(uid) {
  return collection(db, "users", uid, "homework");
}

export function subscribeToHomework(uid, onData, onError) {
  const q = query(homeworkCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(tasks);
    },
    onError
  );
}

export function addHomeworkTask(uid, { subject, title, details, dueDate }) {
  return addDoc(homeworkCollection(uid), {
    subject: subject || "",
    title,
    details: details || "",
    dueDate: dueDate || null,
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function toggleHomeworkComplete(uid, taskId, completed) {
  return updateDoc(doc(db, "users", uid, "homework", taskId), {
    completed,
    updatedAt: serverTimestamp(),
  });
}

export function deleteHomeworkTask(uid, taskId) {
  return deleteDoc(doc(db, "users", uid, "homework", taskId));
}
