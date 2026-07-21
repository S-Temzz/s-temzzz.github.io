import { watchAuth } from "./auth.js";

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navToggleIcon = document.getElementById("navToggleIcon");

const MENU_ICON = '<line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
const CLOSE_ICON = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggleIcon.innerHTML = isOpen ? CLOSE_ICON : MENU_ICON;
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggleIcon.innerHTML = MENU_ICON;
  });
});

const navAuthCta = document.getElementById("navAuthCta");

watchAuth((user) => {
  if (user) {
    navAuthCta.textContent = "Dashboard";
    navAuthCta.setAttribute("href", "dashboard.html");
  } else {
    navAuthCta.textContent = "Sign In";
    navAuthCta.setAttribute("href", "login.html");
  }
});
