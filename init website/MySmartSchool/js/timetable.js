import { doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-config.js";

export const DEFAULT_TIMETABLE = {
  days: [
    { id: "day-mon", name: "Monday" },
    { id: "day-tue", name: "Tuesday" },
    { id: "day-wed", name: "Wednesday" },
    { id: "day-thu", name: "Thursday" },
    { id: "day-fri", name: "Friday" },
  ],
  periods: [
    { id: "period-1", label: "Period 1", time: "09:00" },
  ],
  cells: {
    "day-mon_period-1": "Mathematics",
    "day-tue_period-1": "Science",
    "day-wed_period-1": "English",
    "day-thu_period-1": "History",
    "day-fri_period-1": "ICT",
  },
};

function timetableDoc(uid) {
  return doc(db, "users", uid, "settings", "timetable");
}

export function subscribeToTimetable(uid, onData, onError) {
  return onSnapshot(
    timetableDoc(uid),
    (snap) => onData(snap.exists() ? snap.data() : DEFAULT_TIMETABLE),
    onError
  );
}

export function saveTimetable(uid, { days, periods, cells }) {
  return setDoc(timetableDoc(uid), { days, periods, cells });
}

export function cellKey(dayId, periodId) {
  return `${dayId}_${periodId}`;
}

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
