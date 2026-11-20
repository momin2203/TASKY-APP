// TASKY Live Location Tracker Module (location-tracker.js)
(function () {
  function getLang() {
    return localStorage.getItem("tasky_lang") || "en";
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
  }

  window.trackCurrentLocation = function () {
    const statusEl = document.getElementById("loc-status-text");
    const badgeEl = document.getElementById("live-loc-badge");
    const isBn = getLang() === "bn";

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
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Load saved location on startup if available
  try {
    const saved = JSON.parse(localStorage.getItem("tasky_last_location") || "null");
    if (saved && typeof saved.lat === "number" && typeof saved.lng === "number") {
      updateLocationUI(saved);
    }
  } catch (_) {
    // Ignore storage parse error
  }
})();
