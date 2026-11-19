
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-check.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCrDNpRQXFEOahpyDA_jxTmI5N5nC3KdRg",
  authDomain: "tasky-b8e5b.firebaseapp.com",
  projectId: "tasky-b8e5b",
  storageBucket: "tasky-b8e5b.firebasestorage.app",
  messagingSenderId: "27035947125",
  appId: "1:27035947125:web:dc66829cb61eded04ea83c",
  measurementId: "G-TEBQZKPRSQ"
};

export const OWNER_COMMISSION_CONFIG = {
  rate: 0.05,
  ownerName: "Momin Bepary (TASKY Admin)",
  ownerEmail: "momin8253@gmail.com",
  ownerPhone: "+971568362867"
};

export const app = initializeApp(firebaseConfig);

const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_V3_SITE_KEY";
if (RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== "YOUR_RECAPTCHA_V3_SITE_KEY") {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
