// TASKY Auto Profile & Location Tracker Module (location-tracker.js)
(function () {
  function getLang() {
    return localStorage.getItem("tasky_lang") || "en";
  }

  function escapeText(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getSavedUser() {
    try {
      return JSON.parse(localStorage.getItem("tasky_otp_user") || "null");
    } catch (_) {
      return null;
    }
  }

  function getSavedLocation() {
    try {
      return JSON.parse(localStorage.getItem("tasky_last_location") || "null");
    } catch (_) {
      return null;
    }
  }

  // Auto-fix and sync profile data (name, contact, location)
  function autoSyncProfile(coords) {
    const isBn = getLang() === "bn";
    let user = getSavedUser();
    const loc = coords || getSavedLocation();

    if (!user) {
      user = {
        displayName: isBn ? "টাস্কি ইউজার" : "TASKY User",
        email: "",
        phoneNumber: "",
        photoURL: "https://via.placeholder.com/150",
        location: null,
        locationText: ""
      };
    }

    if (!user.displayName || !String(user.displayName).trim()) {
      if (user.email && user.email.includes("@")) {
        user.displayName = user.email.split("@")[0];
      } else if (user.phoneNumber) {
        user.displayName = isBn ? "মোবাইল ইউজার" : "Mobile User";
      } else {
        user.displayName = isBn ? "টাস্কি ইউজার" : "TASKY User";
      }
    }

    if (!user.photoURL) {
      user.photoURL = "https://via.placeholder.com/150";
    }

    if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
      const gpsLabel = `GPS ${loc.lat}, ${loc.lng}`;
      user.location = { lat: loc.lat, lng: loc.lng };
      user.locationText = gpsLabel;
    }

    localStorage.setItem("tasky_otp_user", JSON.stringify(user));

    const nameBadge = document.getElementById("user-name-badge");
    const avatarEl = document.getElementById("user-avatar");
    const profileBox = document.getElementById("user-profile");
    const authGate = document.getElementById("auth-gate");

    if (nameBadge) nameBadge.textContent = user.displayName;
    if (avatarEl) avatarEl.src = user.photoURL;

    // If user already had a saved session, keep profile visible
    if (user.email || user.phoneNumber || (user.displayName && user.displayName !== "TASKY User" && user.displayName !== "টাস্কি ইউজার")) {
      if (profileBox) profileBox.classList.remove("hidden");
      if (authGate) authGate.classList.add("hidden");
    }

    renderSettingsProfileSummary(user);
  }

  function renderSettingsProfileSummary(user) {
    const summaryEl = document.getElementById("settings-auto-profile-box");
    if (!summaryEl) return;

    const isBn = getLang() === "bn";
    const activeUser = user || getSavedUser() || {};
    const locText = activeUser.locationText
      ? activeUser.locationText
      : isBn
      ? "এখনও সেট হয়নি"
      : "Not set yet";
    const contactText = activeUser.email || activeUser.phoneNumber || (isBn ? "যোগাযোগ যুক্ত নয়" : "No contact set");

    summaryEl.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-slate-500">${isBn ? "প্রোফাইল নাম" : "Profile Name"}:</span>
        <b class="truncate">${escapeText(activeUser.displayName || (isBn ? "টাস্কি ইউজার" : "TASKY User"))}</b>
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-slate-500">${isBn ? "যোগাযোগ" : "Contact"}:</span>
        <span class="truncate">${escapeText(contactText)}</span>
      </div>
      <div class="flex items-center justify-between gap-2">
        <span class="text-slate-500">${isBn ? "প্রোফাইল লোকেশন" : "Profile Location"}:</span>
        <b class="text-brand-600 truncate">${escapeText(locText)}</b>
      </div>
    `;
  }

  function updateLocationUI(coords) {
    const badgeEl = document.getElementById("live-loc-badge");
    const statusEl = document.getElementById("loc-status-text");
    const isBn = getLang() === "bn";
    const text = `GPS ${coords.lat}, ${coords.lng}`;

    if (badgeEl) {
      badgeEl.textContent = `📍 ${text}`;
    }
    if (statusEl) {
      statusEl.textContent = isBn ? `ট্র্যাকড: ${text}` : `Tracked: ${text}`;
    }

    autoSyncProfile(coords);
  }

  // Inject Location & Auto-Profile controls inside Settings Modal
  function ensureSettingsLocationSection() {
    const modal = document.getElementById("settings-modal");
    if (!modal) return;
    if (document.getElementById("settings-location-section")) return;

    const cardContainer = modal.querySelector(".space-y-4");
    if (!cardContainer) return;

    const isBn = getLang() === "bn";
    const section = document.createElement("div");
    section.id = "settings-location-section";
    section.className =
      "p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs";

    section.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-bold">${isBn ? "লোকেশন ও অটো প্রোফাইল" : "Location & Auto Profile"}</span>
        <button type="button" id="settings-auto-fix-btn" class="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold">
          ${isBn ? "লোকেশন ও প্রোফাইল আপডেট" : "Sync Location & Profile"}
        </button>
      </div>
      <div id="settings-auto-profile-box" class="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[11px]"></div>
    `;

    cardContainer.insertBefore(section, cardContainer.firstChild.nextSibling);

    const btn = document.getElementById("settings-auto-fix-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        autoSyncProfile();
        window.trackCurrentLocation();
      });
    }

    renderSettingsProfileSummary();
  }

  window.trackCurrentLocation = function () {
    const statusEl = document.getElementById("loc-status-text");
    const badgeEl = document.getElementById("live-loc-badge");
    const isBn = getLang() === "bn";

    ensureSettingsLocationSection();
    autoSyncProfile();

    if (statusEl) {
      statusEl.textContent = isBn ? "লোকেশন ট্র্যাক করা হচ্ছে..." : "Tracking GPS location...";
    }

    if (!navigator.geolocation) {
      if (statusEl) {
        statusEl.textContent = isBn ? "এই ডিভাইসে GPS সাপোর্ট নেই" : "Geolocation unsupported";
      }
      if (badgeEl) {
        badgeEl.textContent = isBn ? "📍 GPS সাপোর্ট নেই" : "📍 GPS unsupported";
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5))
        };
        localStorage.setItem("tasky_last_location", JSON.stringify(coords));
        updateLocationUI(coords);
      },
      (err) => {
        const msg = isBn
          ? err && err.code === 1
            ? "লোকেশন অনুমতি দিন"
            : "লোকেশন পাওয়া যায়নি"
          : err && err.code === 1
          ? "Location permission needed"
          : "Unable to get location";
        if (statusEl) statusEl.textContent = msg;
        if (badgeEl) badgeEl.textContent = `📍 ${msg}`;
        autoSyncProfile();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Wrap openSettingsModal so opening Settings always prepares & syncs profile + location
  const originalOpenSettings = window.openSettingsModal;
  window.openSettingsModal = function () {
    if (typeof originalOpenSettings === "function") {
      originalOpenSettings();
    } else {
      const m = document.getElementById("settings-modal");
      if (m) m.classList.remove("hidden");
    }
    ensureSettingsLocationSection();
    autoSyncProfile();
  };

  // Startup initialization
  document.addEventListener("DOMContentLoaded", function () {
    ensureSettingsLocationSection();
    const savedLoc = getSavedLocation();
    if (savedLoc && typeof savedLoc.lat === "number" && typeof savedLoc.lng === "number") {
      updateLocationUI(savedLoc);
    } else {
      autoSyncProfile();
    }
  });
})();
