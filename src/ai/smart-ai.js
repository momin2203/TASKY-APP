// TASKY Smart AI Assistant Module (smart-ai.js)
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

  function detectCategory(text) {
    const lower = text.toLowerCase();
    if (lower.includes("ac") || lower.includes("cooling") || lower.includes("এসি") || lower.includes("ঠান্ডা")) {
      return "AC";
    }
    if (
      lower.includes("pipe") ||
      lower.includes("leak") ||
      lower.includes("water") ||
      lower.includes("plumb") ||
      lower.includes("পানি") ||
      lower.includes("পাইপ") ||
      lower.includes("লিক")
    ) {
      return "Plumbing";
    }
    if (
      lower.includes("wire") ||
      lower.includes("light") ||
      lower.includes("mcb") ||
      lower.includes("electric") ||
      lower.includes("কারেন্ট") ||
      lower.includes("তার") ||
      lower.includes("ব্রেকার")
    ) {
      return "Electrical";
    }
    if (
      lower.includes("wood") ||
      lower.includes("door") ||
      lower.includes("carpent") ||
      lower.includes("কাঠ") ||
      lower.includes("দরজা")
    ) {
      return "Carpenter";
    }
    if (lower.includes("paint") || lower.includes("রং") || lower.includes("রঙ")) {
      return "Painter";
    }
    return "General";
  }

  function isEmergencyIssue(text) {
    const lower = text.toLowerCase();
    return (
      lower.includes("urgent") ||
      lower.includes("emergency") ||
      lower.includes("leak") ||
      lower.includes("spark") ||
      lower.includes("জরুরি") ||
      lower.includes("ইমারজেন্সি") ||
      lower.includes("শর্ট") ||
      lower.includes("পানি পড়")
    );
  }

  window.runTaskyAi = function () {
    const inputEl = document.getElementById("ai-prompt-input");
    const outEl = document.getElementById("ai-output-box");
    if (!inputEl || !outEl) return;

    const prompt = inputEl.value.trim();
    const isBn = getLang() === "bn";

    if (!prompt) {
      outEl.classList.remove("hidden");
      outEl.innerHTML = `<div class="text-red-500">${
        isBn ? "আগে আপনার সমস্যার কথা লিখুন।" : "Please describe your issue first."
      }</div>`;
      return;
    }

    const category = detectCategory(prompt);
    const urgent = isEmergencyIssue(prompt);

    const suggestedMsg = isBn
      ? `হ্যালো, আমার ${category} কাজের জন্য সাহায্য দরকার (${prompt})। সময় ও দাম নিয়ে কথা বলব।`
      : `Hi, I need ${category} help for: ${prompt}. Can we discuss timing and price?`;

    outEl.classList.remove("hidden");
    outEl.innerHTML = `
      <div><b>${isBn ? "ক্যাটাগরি" : "Category"}:</b> ${escapeText(category)}</div>
      <div><b>${isBn ? "ইমারজেন্সি" : "Emergency"}:</b> ${
        urgent
          ? isBn
            ? "হ্যাঁ (জরুরি অগ্রাধিকার)"
            : "Yes (High Priority)"
          : isBn
          ? "সাধারণ"
          : "Normal"
      }</div>
      <div><b>${isBn ? "প্রস্তাবিত মেসেজ" : "Suggested Deal Msg"}:</b> "${escapeText(suggestedMsg)}"</div>
    `;
  };
})();
