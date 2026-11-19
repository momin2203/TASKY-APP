import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth, googleProvider } from "../config/firebase-config.js";

let generatedOtp = null;
let pendingOtpTarget = null;
let pendingMode = "signin";

export function setAuthMode(mode) {
  pendingMode = mode;
  document.getElementById("tab-signin").className = mode === "signin"
    ? "flex-1 py-2 rounded-xl text-xs font-extrabold bg-brand-600 text-white"
    : "flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
  document.getElementById("tab-signup").className = mode === "signup"
    ? "flex-1 py-2 rounded-xl text-xs font-extrabold bg-brand-600 text-white"
    : "flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
  document.getElementById("signup-name-box").classList.toggle("hidden", mode !== "signup");
}

export function sendOtpCode() {
  const channel = document.getElementById("otp-channel").value;
  const contact = document.getElementById("otp-contact").value.trim();
  const fullName = document.getElementById("otp-fullname").value.trim();

  if (!contact) {
    alert(channel === "phone" ? "মোবাইল নম্বর দিন।" : "জিমেইল অ্যাড্রেস দিন।");
    return;
  }
  if (pendingMode === "signup" && !fullName) {
    alert("নতুন অ্যাকাউন্ট খুলতে আপনার নাম লিখুন।");
    return;
  }

  generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
  pendingOtpTarget = {
    channel,
    contact,
    name: fullName || contact.split("@")[0],
    mode: pendingMode
  };

  document.getElementById("otp-verify-box").classList.remove("hidden");
  document.getElementById("otp-demo-hint").textContent =
    `OTP পাঠানো হয়েছে (${contact}) — ডেমো কোড: ${generatedOtp}`;
}

export function verifyOtpAndLogin(onAuthenticated) {
  const enteredOtp = document.getElementById("otp-input").value.trim();
  if (!generatedOtp || enteredOtp !== generatedOtp) {
    alert("সঠিক ৬ ডিজিটের OTP কোড দিন।");
    return;
  }

  const sessionUser = {
    uid: "otp_" + btoa(pendingOtpTarget.contact).slice(0, 12),
    displayName: pendingOtpTarget.name,
    email: pendingOtpTarget.channel === "email" ? pendingOtpTarget.contact : "",
    phoneNumber: pendingOtpTarget.channel === "phone" ? pendingOtpTarget.contact : "",
    photoURL: "https://via.placeholder.com/150",
    authType: "OTP_" + pendingOtpTarget.channel.toUpperCase()
  };

  localStorage.setItem("tasky_otp_user", JSON.stringify(sessionUser));
  generatedOtp = null;
  document.getElementById("otp-input").value = "";
  document.getElementById("otp-verify-box").classList.add("hidden");
  onAuthenticated(sessionUser);
}

export async function loginWithGoogleAuth() {
  await signInWithPopup(auth, googleProvider);
}

export async function logoutAll(onLoggedOut) {
  localStorage.removeItem("tasky_otp_user");
  if (auth.currentUser) {
    await signOut(auth);
  }
  onLoggedOut(null);
}

export function initAuthGate(onAuthChanged) {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      onAuthChanged({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "User",
        email: firebaseUser.email || "",
        phoneNumber: firebaseUser.phoneNumber || "",
        photoURL: firebaseUser.photoURL || "https://via.placeholder.com/150",
        authType: "GOOGLE"
      });
      return;
    }
    const savedOtp = JSON.parse(localStorage.getItem("tasky_otp_user") || "null");
    onAuthChanged(savedOtp);
  });
}
