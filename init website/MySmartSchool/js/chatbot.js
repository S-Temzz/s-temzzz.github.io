// Rule-based FAQ chatbot — pure client-side keyword matching, no external API.

const FAQ = [
  {
    keywords: ["hi", "hello", "hey"],
    answer: "Hi there! I'm the My Smart School helper. Ask me about homework, the timetable, exams, clubs or resources.",
  },
  {
    keywords: ["homework", "planner", "assignment", "task"],
    answer: "The Homework Planner lets you add a subject, title, details and due date — check items off as you complete them. Find it in the Homework page of your dashboard.",
  },
  {
    keywords: ["exam", "countdown", "test"],
    answer: "The Exam Countdown page lets you set as many exam dates as you like — each one shows a live countdown that saves to your account so it's still there next time you log in.",
  },
  {
    keywords: ["timetable", "schedule", "class", "lesson", "period"],
    answer: "The Timetable page is fully customizable — add your own days and time periods, then fill in a subject for each slot.",
  },
  {
    keywords: ["club", "sport", "team", "football", "chess"],
    answer: "Check the Club & Sports Updates page for meeting times and news about every club and team.",
  },
  {
    keywords: ["resource", "link", "website", "khan", "quizlet"],
    answer: "The Resources page has links to great free sites like Khan Academy, Quizlet, W3Schools and BBC Bitesize.",
  },
  {
    keywords: ["thanks", "thank you", "cheers"],
    answer: "You're welcome! Good luck with your studies.",
  },
  {
    keywords: ["bye", "goodbye"],
    answer: "See you later — come back anytime you need a hand!",
  },
];

const FALLBACK = "I'm not sure about that yet — try asking me about homework, the timetable, exams, clubs or resources.";

export function matchFaq(input) {
  const text = input.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const entry of FAQ) {
    const score = entry.keywords.reduce((sum, kw) => (text.includes(kw) ? sum + 1 : sum), 0);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return best ? best.answer : FALLBACK;
}
