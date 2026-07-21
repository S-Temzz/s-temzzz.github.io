import { watchAuth, signOutUser } from "./auth.js";
import {
  subscribeToHomework,
  addHomeworkTask,
  toggleHomeworkComplete,
  deleteHomeworkTask,
} from "./homework.js";
import {
  subscribeToExamCountdowns,
  addExamCountdown,
  deleteExamCountdown,
  getCountdownParts,
} from "./countdown.js";
import {
  subscribeToTimetable,
  saveTimetable,
  cellKey,
  makeId,
} from "./timetable.js";
import {
  todayKey,
  subscribeToStudyGoalSettings,
  subscribeToStudyDay,
  setDefaultGoalMinutes,
  setDayGoalMinutes,
  logStudyMinutes,
  resetStudyMinutes,
  DEFAULT_GOAL_MINUTES,
} from "./studygoal.js";
import {
  subscribeToGrades,
  addGrade,
  updateGrade,
  deleteGrade,
} from "./grades.js";
import { matchFaq } from "./chatbot.js";
import { iconMarkup } from "./icons.js";
import { NEWS, CLUBS, RESOURCES } from "./content-data.js";

const dashboardLoading = document.getElementById("dashboardLoading");
const dashboardShell = document.getElementById("dashboardShell");

let currentUid = null;
let unsubHomework = null;
let unsubCountdowns = null;
let unsubTimetable = null;
let unsubStudySettings = null;
let unsubStudyDay = null;
let unsubGrades = null;
let homeworkTasks = [];

watchAuth((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUid = user.uid;
  renderUser(user);
  dashboardLoading.style.display = "none";
  dashboardShell.style.display = "flex";

  if (unsubHomework) unsubHomework();
  if (unsubCountdowns) unsubCountdowns();
  if (unsubTimetable) unsubTimetable();
  if (unsubStudySettings) unsubStudySettings();
  if (unsubStudyDay) unsubStudyDay();
  if (unsubGrades) unsubGrades();

  unsubHomework = subscribeToHomework(
    currentUid,
    (tasks) => {
      homeworkTasks = tasks;
      renderHomework(tasks);
      renderStats(tasks);
    },
    (err) => console.error("Homework subscription error:", err)
  );

  unsubCountdowns = subscribeToExamCountdowns(
    currentUid,
    (countdowns) => startCountdownTicker(countdowns),
    (err) => console.error("Countdown subscription error:", err)
  );

  unsubTimetable = subscribeToTimetable(
    currentUid,
    (data) => renderTimetable(data),
    (err) => console.error("Timetable subscription error:", err)
  );

  unsubStudySettings = subscribeToStudyGoalSettings(
    currentUid,
    (settings) => {
      studySettings = settings;
      renderStudyGoal();
    },
    (err) => console.error("Study goal settings subscription error:", err)
  );

  unsubStudyDay = subscribeToStudyDay(
    currentUid,
    todayKey(),
    (day) => {
      studyDay = day;
      renderStudyGoal();
    },
    (err) => console.error("Study day subscription error:", err)
  );

  unsubGrades = subscribeToGrades(
    currentUid,
    (grades) => renderGrades(grades),
    (err) => console.error("Grades subscription error:", err)
  );
});

function renderUser(user) {
  const name = user.displayName || user.email || "Student";
  document.getElementById("sidebarName").textContent = name;
  document.getElementById("sidebarEmail").textContent = user.email || "";
  document.getElementById("sidebarAvatar").textContent = name.charAt(0).toUpperCase();
  document.getElementById("welcomeHeading").textContent = `Welcome back, ${name.split(" ")[0]}!`;
}

document.getElementById("signOutBtn").addEventListener("click", async () => {
  await signOutUser();
});

// Mobile sidebar toggle
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
sidebarToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

// ---------- Page routing (multi-page layout) ----------
const PAGES = ["studygoal", "grades", "homework", "timetable", "countdown", "news", "clubs", "resources"];
const navLinks = Array.from(document.querySelectorAll("#sidebarNav a"));

function showPage(pageId) {
  const target = PAGES.includes(pageId) ? pageId : PAGES[0];
  PAGES.forEach((id) => {
    const section = document.getElementById(id);
    if (section) section.classList.toggle("active", id === target);
  });
  navLinks.forEach((a) => a.classList.toggle("active", a.dataset.page === target));
  sidebar.classList.remove("open");
}

navLinks.forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.hash = a.dataset.page;
    showPage(a.dataset.page);
  });
});

window.addEventListener("hashchange", () => {
  showPage(window.location.hash.replace("#", ""));
});

showPage(window.location.hash.replace("#", ""));

// ---------- Stats ----------
function renderStats(tasks) {
  const pending = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;
  const statRow = document.getElementById("statRow");
  statRow.innerHTML = "";
  const stats = [
    { icon: "clipboard", value: pending, label: "Homework due", color: "primary" },
    { icon: "check", value: completed, label: "Completed", color: "accent" },
    { icon: "trophy", value: CLUBS.length, label: "Active clubs", color: "primary" },
  ];
  stats.forEach((s) => {
    const el = document.createElement("div");
    el.className = "card-clay stat-card";
    el.innerHTML = `
      <div class="feature-icon" style="background:var(--color-${s.color})">${iconMarkup(s.icon)}</div>
      <div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`;
    statRow.appendChild(el);
  });
}

// ---------- Study Goal (interactive per-day target + progress) ----------
const STUDY_GOAL_STEP = 15;
const STUDY_GOAL_MIN = 15;
const STUDY_GOAL_MAX = 480;

let studySettings = { defaultGoalMinutes: DEFAULT_GOAL_MINUTES };
let studyDay = { minutesLogged: 0, goalMinutes: null };

const studyGoalRing = document.getElementById("studyGoalRing");
const studyGoalMinutesDone = document.getElementById("studyGoalMinutesDone");
const studyGoalMinutesTarget = document.getElementById("studyGoalMinutesTarget");
const studyGoalTargetDisplay = document.getElementById("studyGoalTargetDisplay");
const studyGoalDecBtn = document.getElementById("studyGoalDecBtn");
const studyGoalIncBtn = document.getElementById("studyGoalIncBtn");
const studyGoalMessage = document.getElementById("studyGoalMessage");
const studyGoalResetBtn = document.getElementById("studyGoalResetBtn");

function currentGoalMinutes() {
  return studyDay.goalMinutes ?? studySettings.defaultGoalMinutes ?? DEFAULT_GOAL_MINUTES;
}

function renderStudyGoal() {
  const goal = currentGoalMinutes();
  const done = studyDay.minutesLogged || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0;

  studyGoalRing.style.setProperty("--pct", pct);
  studyGoalMinutesDone.textContent = done;
  studyGoalMinutesTarget.textContent = goal;
  studyGoalTargetDisplay.textContent = `${goal} min`;
  studyGoalDecBtn.disabled = goal <= STUDY_GOAL_MIN;
  studyGoalIncBtn.disabled = goal >= STUDY_GOAL_MAX;

  studyGoalMessage.textContent =
    done >= goal
      ? "Goal reached — great work today!"
      : `${goal - done} min to go to hit today's goal.`;
}

studyGoalDecBtn.addEventListener("click", () => {
  if (!currentUid) return;
  const next = Math.max(STUDY_GOAL_MIN, currentGoalMinutes() - STUDY_GOAL_STEP);
  setDefaultGoalMinutes(currentUid, next).catch((err) => console.error("Failed to update goal:", err));
  setDayGoalMinutes(currentUid, todayKey(), next).catch((err) => console.error("Failed to update goal:", err));
});

studyGoalIncBtn.addEventListener("click", () => {
  if (!currentUid) return;
  const next = Math.min(STUDY_GOAL_MAX, currentGoalMinutes() + STUDY_GOAL_STEP);
  setDefaultGoalMinutes(currentUid, next).catch((err) => console.error("Failed to update goal:", err));
  setDayGoalMinutes(currentUid, todayKey(), next).catch((err) => console.error("Failed to update goal:", err));
});

document.querySelectorAll("[data-log-minutes]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!currentUid) return;
    const minutes = Number(btn.dataset.logMinutes);
    logStudyMinutes(currentUid, todayKey(), minutes).catch((err) =>
      console.error("Failed to log study minutes:", err)
    );
  });
});

studyGoalResetBtn.addEventListener("click", () => {
  if (!currentUid) return;
  resetStudyMinutes(currentUid, todayKey()).catch((err) =>
    console.error("Failed to reset study minutes:", err)
  );
});

renderStudyGoal();

// ---------- Grade Tracker ----------
const gradeForm = document.getElementById("gradeForm");
const gradeList = document.getElementById("gradeList");

gradeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const subject = document.getElementById("gradeSubject").value.trim();
  const currentGrade = Number(document.getElementById("gradeCurrent").value);
  const targetGrade = Number(document.getElementById("gradeTarget").value);
  if (!subject || !currentUid || Number.isNaN(currentGrade) || Number.isNaN(targetGrade)) return;

  const submitBtn = gradeForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  try {
    await addGrade(currentUid, { subject, currentGrade, targetGrade });
    gradeForm.reset();
  } catch (err) {
    console.error("Failed to add grade:", err);
  } finally {
    submitBtn.disabled = false;
  }
});

function renderGrades(grades) {
  if (grades.length === 0) {
    gradeList.innerHTML = `<div class="empty-state">${iconMarkup("clipboard")}<p>No subjects yet — add one above to start tracking your goal grade.</p></div>`;
    return;
  }

  gradeList.innerHTML = grades
    .map((g) => {
      const current = Math.max(0, Math.min(100, Number(g.currentGrade) || 0));
      const target = Math.max(0, Math.min(100, Number(g.targetGrade) || 0));
      const met = current >= target;
      return `
        <div class="card-clay grade-card" data-grade-id="${g.id}">
          <div class="grade-card-header">
            <h4>${escapeHtml(g.subject)}</h4>
            <span class="grade-card-badge ${met ? "met" : "pending"}">${met ? "Goal met" : `${target - current}% to go`}</span>
          </div>
          <div class="grade-bar-track">
            <div class="grade-bar-fill ${met ? "met" : ""}" style="width:${current}%"></div>
            <div class="grade-bar-target" style="left:${target}%" title="Target ${target}%"></div>
          </div>
          <div class="grade-card-inputs">
            <div class="field">
              <label>Current grade (%)</label>
              <input class="input grade-current-input" type="number" min="0" max="100" value="${current}" data-grade-id="${g.id}" />
            </div>
            <div class="field">
              <label>Desired grade (%)</label>
              <input class="input grade-target-input" type="number" min="0" max="100" value="${target}" data-grade-id="${g.id}" />
            </div>
          </div>
          <div class="grade-card-footer">
            <button type="button" class="homework-delete" aria-label="Delete subject" data-delete-grade-id="${g.id}">${iconMarkup("trash-2")}</button>
          </div>
        </div>`;
    })
    .join("");

  gradeList.querySelectorAll(".grade-current-input, .grade-target-input").forEach((input) => {
    input.addEventListener("change", () => {
      const card = input.closest(".grade-card");
      const currentGrade = Number(card.querySelector(".grade-current-input").value) || 0;
      const targetGrade = Number(card.querySelector(".grade-target-input").value) || 0;
      updateGrade(currentUid, input.dataset.gradeId, { currentGrade, targetGrade }).catch((err) =>
        console.error("Failed to update grade:", err)
      );
    });
  });

  gradeList.querySelectorAll("[data-delete-grade-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteGrade(currentUid, btn.dataset.deleteGradeId).catch((err) =>
        console.error("Failed to delete grade:", err)
      );
    });
  });
}

// ---------- Timetable (fully customizable) ----------
const timetableEl = document.getElementById("timetableEl");
const addDayBtn = document.getElementById("addDayBtn");
const addPeriodBtn = document.getElementById("addPeriodBtn");
let timetableState = null;

function renderTimetable(data) {
  timetableState = {
    days: (data.days || []).map((d) => ({ ...d })),
    periods: (data.periods || []).map((p) => ({ ...p })),
    cells: { ...(data.cells || {}) },
  };
  drawTimetable();
}

function drawTimetable() {
  const { days, periods, cells } = timetableState;

  let html = "<tr><th class=\"corner-cell\"></th>";
  days.forEach((day) => {
    html += `<th>
      <input class="input timetable-day-input" data-day-id="${day.id}" value="${escapeAttr(day.name)}" aria-label="Day name" />
      <button type="button" class="timetable-remove-btn" data-remove-day="${day.id}" aria-label="Remove day">${iconMarkup("x")}</button>
    </th>`;
  });
  html += "</tr>";

  periods.forEach((period) => {
    html += `<tr><td class="timetable-period-cell">
      <input class="input timetable-period-input" data-period-id="${period.id}" data-field="label" value="${escapeAttr(period.label)}" aria-label="Period name" />
      <input class="input timetable-period-time" type="time" data-period-id="${period.id}" data-field="time" value="${escapeAttr(period.time || "")}" aria-label="Period time" />
      <button type="button" class="timetable-remove-btn" data-remove-period="${period.id}" aria-label="Remove period">${iconMarkup("x")}</button>
    </td>`;
    days.forEach((day) => {
      const key = cellKey(day.id, period.id);
      html += `<td><input class="input timetable-cell-input" data-day-id="${day.id}" data-period-id="${period.id}" value="${escapeAttr(cells[key] || "")}" placeholder="Subject" /></td>`;
    });
    html += "</tr>";
  });

  timetableEl.innerHTML = html;
  bindTimetableEvents();
}

function bindTimetableEvents() {
  timetableEl.querySelectorAll(".timetable-day-input").forEach((input) => {
    input.addEventListener("change", () => {
      const day = timetableState.days.find((d) => d.id === input.dataset.dayId);
      if (day) day.name = input.value.trim() || day.name;
      persistTimetable();
    });
  });

  timetableEl.querySelectorAll(".timetable-period-input, .timetable-period-time").forEach((input) => {
    input.addEventListener("change", () => {
      const period = timetableState.periods.find((p) => p.id === input.dataset.periodId);
      if (!period) return;
      if (input.dataset.field === "label") period.label = input.value.trim() || period.label;
      if (input.dataset.field === "time") period.time = input.value;
      persistTimetable();
    });
  });

  timetableEl.querySelectorAll(".timetable-cell-input").forEach((input) => {
    input.addEventListener("change", () => {
      const key = cellKey(input.dataset.dayId, input.dataset.periodId);
      timetableState.cells[key] = input.value.trim();
      persistTimetable();
    });
  });

  timetableEl.querySelectorAll("[data-remove-day]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.removeDay;
      timetableState.days = timetableState.days.filter((d) => d.id !== id);
      Object.keys(timetableState.cells).forEach((key) => {
        if (key.startsWith(`${id}_`)) delete timetableState.cells[key];
      });
      drawTimetable();
      persistTimetable();
    });
  });

  timetableEl.querySelectorAll("[data-remove-period]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.removePeriod;
      timetableState.periods = timetableState.periods.filter((p) => p.id !== id);
      Object.keys(timetableState.cells).forEach((key) => {
        if (key.endsWith(`_${id}`)) delete timetableState.cells[key];
      });
      drawTimetable();
      persistTimetable();
    });
  });
}

addDayBtn.addEventListener("click", () => {
  if (!timetableState) return;
  timetableState.days.push({ id: makeId("day"), name: "New Day" });
  drawTimetable();
  persistTimetable();
});

addPeriodBtn.addEventListener("click", () => {
  if (!timetableState) return;
  timetableState.periods.push({ id: makeId("period"), label: "New Period", time: "" });
  drawTimetable();
  persistTimetable();
});

function persistTimetable() {
  if (!currentUid || !timetableState) return;
  saveTimetable(currentUid, timetableState).catch((err) =>
    console.error("Failed to save timetable:", err)
  );
}

function escapeAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// ---------- Homework ----------
const homeworkForm = document.getElementById("homeworkForm");
const homeworkList = document.getElementById("homeworkList");

homeworkForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const subject = document.getElementById("hwSubject").value.trim();
  const title = document.getElementById("hwTitle").value.trim();
  const details = document.getElementById("hwDetails").value.trim();
  const dueDate = document.getElementById("hwDue").value;
  if (!title || !currentUid) return;

  const submitBtn = homeworkForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  try {
    await addHomeworkTask(currentUid, { subject, title, details, dueDate });
    homeworkForm.reset();
  } catch (err) {
    console.error("Failed to add homework:", err);
  } finally {
    submitBtn.disabled = false;
  }
});

function renderHomework(tasks) {
  if (tasks.length === 0) {
    homeworkList.innerHTML = `<div class="empty-state">${iconMarkup("clipboard")}<p>No homework yet — add your first task above.</p></div>`;
    return;
  }
  homeworkList.innerHTML = "";
  tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className = "card-clay homework-item" + (task.completed ? " completed" : "");
    item.innerHTML = `
      <button class="homework-check ${task.completed ? "checked" : ""}" aria-label="${task.completed ? "Mark incomplete" : "Mark complete"}" data-id="${task.id}" data-completed="${task.completed}">
        ${task.completed ? iconMarkup("check") : ""}
      </button>
      <div class="homework-body">
        ${task.subject ? `<div class="subject">${escapeHtml(task.subject)}</div>` : ""}
        <h4>${escapeHtml(task.title)}</h4>
        ${task.details ? `<p>${escapeHtml(task.details)}</p>` : ""}
        ${task.dueDate ? `<div class="due">Due ${formatDate(task.dueDate)}</div>` : ""}
      </div>
      <button class="homework-delete" aria-label="Delete task" data-id="${task.id}">${iconMarkup("trash-2")}</button>
    `;
    homeworkList.appendChild(item);
  });

  homeworkList.querySelectorAll(".homework-check").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const completed = btn.dataset.completed === "true";
      toggleHomeworkComplete(currentUid, id, !completed).catch((err) =>
        console.error("Failed to toggle homework:", err)
      );
    });
  });

  homeworkList.querySelectorAll(".homework-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteHomeworkTask(currentUid, btn.dataset.id).catch((err) =>
        console.error("Failed to delete homework:", err)
      );
    });
  });
}

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Exam countdowns (multiple) ----------
const countdownForm = document.getElementById("countdownForm");
const countdownList = document.getElementById("countdownList");
let tickInterval = null;
let activeCountdowns = [];

countdownForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const label = document.getElementById("examLabel").value.trim() || "Exam";
  const dateVal = document.getElementById("examDate").value;
  const timeVal = document.getElementById("examTime").value;
  if (!dateVal || !currentUid) return;

  const dateTimeString = dateVal + "T" + (timeVal || "00:00") + ":00";
  const targetMs = new Date(dateTimeString).getTime();
  if (isNaN(targetMs)) return;

  try {
    await addExamCountdown(currentUid, targetMs, label);
    countdownForm.reset();
  } catch (err) {
    console.error("Failed to add exam countdown:", err);
  }
});

function startCountdownTicker(countdowns) {
  activeCountdowns = countdowns || [];
  if (tickInterval) clearInterval(tickInterval);
  drawCountdowns();
  tickInterval = setInterval(drawCountdowns, 1000);
}

function drawCountdowns() {
  if (activeCountdowns.length === 0) {
    countdownList.innerHTML = `<div class="empty-state">${iconMarkup("clock")}<p>No exam countdowns yet — add one above.</p></div>`;
    return;
  }

  countdownList.innerHTML = activeCountdowns
    .map((cd) => {
      const targetMs = cd.targetDate.toMillis ? cd.targetDate.toMillis() : new Date(cd.targetDate).getTime();
      const parts = getCountdownParts(targetMs);
      const statusText = parts.isPast ? `${escapeHtml(cd.label)} has started — good luck!` : `Counting down to ${escapeHtml(cd.label)}`;
      return `
        <div class="card-clay countdown-card">
          <div class="countdown-card-header">
            <p class="countdown-card-label">${statusText}</p>
            <button type="button" class="homework-delete" aria-label="Delete countdown" data-countdown-id="${cd.id}">${iconMarkup("trash-2")}</button>
          </div>
          <div class="countdown-display">${renderCountdownUnits(parts)}</div>
        </div>`;
    })
    .join("");

  countdownList.querySelectorAll("[data-countdown-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteExamCountdown(currentUid, btn.dataset.countdownId).catch((err) =>
        console.error("Failed to delete exam countdown:", err)
      );
    });
  });
}

function renderCountdownUnits({ days, hours, minutes, seconds }) {
  const units = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ];
  return units
    .map((u) => `<div class="countdown-unit"><span class="num">${u.value}</span><span class="label">${u.label}</span></div>`)
    .join("");
}

// ---------- News ----------
const newsList = document.getElementById("newsList");
newsList.innerHTML = NEWS.map(
  (item) => `
  <div class="card-clay list-card">
    <span class="badge">${escapeHtml(item.category)}</span>
    <div class="date">${escapeHtml(item.date)}</div>
    <h4>${escapeHtml(item.title)}</h4>
    <p>${escapeHtml(item.excerpt)}</p>
  </div>`
).join("");

// ---------- Clubs ----------
const clubsList = document.getElementById("clubsList");
clubsList.innerHTML = CLUBS.map(
  (club) => `
  <div class="card-clay list-card">
    <h4>${escapeHtml(club.name)}</h4>
    <div class="date">${escapeHtml(club.meeting)}</div>
    <p>${escapeHtml(club.blurb)}</p>
  </div>`
).join("");

// ---------- Resources ----------
const resourcesList = document.getElementById("resourcesList");
resourcesList.innerHTML = RESOURCES.map(
  (r) => `
  <a class="card-clay resource-link hoverable" href="${r.url}" target="_blank" rel="noopener" style="text-decoration:none;">
    <div class="feature-icon">${iconMarkup(r.icon)}</div>
    <div>
      <h4>${escapeHtml(r.name)}</h4>
      <p>${escapeHtml(r.description)}</p>
    </div>
  </a>`
).join("");

// ---------- Chatbot ----------
const chatbotFab = document.getElementById("chatbotFab");
const chatbotPanel = document.getElementById("chatbotPanel");
const chatbotMessages = document.getElementById("chatbotMessages");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");

chatbotFab.addEventListener("click", () => {
  const isOpen = chatbotPanel.classList.toggle("open");
  if (isOpen && chatbotMessages.children.length === 0) {
    addChatBubble("bot", "Hi! Ask me about homework, timetable, exams, clubs or resources.");
  }
});

chatbotForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatbotInput.value.trim();
  if (!text) return;
  addChatBubble("user", text);
  chatbotInput.value = "";
  setTimeout(() => addChatBubble("bot", matchFaq(text)), 300);
});

function addChatBubble(who, text) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${who}`;
  bubble.textContent = text;
  chatbotMessages.appendChild(bubble);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}
