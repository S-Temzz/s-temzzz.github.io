import { watchAuth, signInEmail, signUpEmail, signInGoogle, mapAuthError } from "./auth.js";

const tabSignIn = document.getElementById("tabSignIn");
const tabSignUp = document.getElementById("tabSignUp");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const formMessage = document.getElementById("formMessage");
const googleBtn = document.getElementById("googleBtn");

let redirected = false;

watchAuth((user) => {
  if (user && !redirected) {
    redirected = true;
    window.location.href = "dashboard.html";
  }
});

function switchTab(tab) {
  const showSignIn = tab === "signin";
  tabSignIn.classList.toggle("active", showSignIn);
  tabSignUp.classList.toggle("active", !showSignIn);
  signInForm.classList.toggle("active", showSignIn);
  signUpForm.classList.toggle("active", !showSignIn);
  clearMessage();
}

tabSignIn.addEventListener("click", () => switchTab("signin"));
tabSignUp.addEventListener("click", () => switchTab("signup"));

function clearMessage() {
  formMessage.innerHTML = "";
}

function showError(message) {
  if (!message) return;
  formMessage.innerHTML = `<div class="form-error">${message}</div>`;
}

function setBusy(button, busy, busyLabel, idleLabel) {
  button.disabled = busy;
  button.textContent = busy ? busyLabel : idleLabel;
}

signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();
  const email = document.getElementById("signInEmail").value.trim();
  const password = document.getElementById("signInPassword").value;
  const submitBtn = document.getElementById("signInSubmit");
  setBusy(submitBtn, true, "Signing in…", "Sign In");
  try {
    await signInEmail(email, password);
  } catch (err) {
    showError(mapAuthError(err));
    setBusy(submitBtn, false, "Signing in…", "Sign In");
  }
});

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();
  const name = document.getElementById("signUpName").value.trim();
  const email = document.getElementById("signUpEmail").value.trim();
  const password = document.getElementById("signUpPassword").value;
  const submitBtn = document.getElementById("signUpSubmit");
  setBusy(submitBtn, true, "Creating account…", "Create Account");
  try {
    await signUpEmail(email, password, name);
  } catch (err) {
    showError(mapAuthError(err));
    setBusy(submitBtn, false, "Creating account…", "Create Account");
  }
});

googleBtn.addEventListener("click", async () => {
  clearMessage();
  googleBtn.disabled = true;
  try {
    await signInGoogle();
  } catch (err) {
    showError(mapAuthError(err));
  } finally {
    googleBtn.disabled = false;
  }
});
