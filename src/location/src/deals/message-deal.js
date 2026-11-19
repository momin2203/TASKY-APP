import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../config/firebase-config.js";

let deals = JSON.parse(localStorage.getItem("tasky_message_deals") || "[]");

export function buildWhatsAppDealUrl(phone, taskTitle, message) {
  const cleanPhone = String(phone || "").replace(/[^\d]/g, "");
  const text = encodeURIComponent(`TASKY Deal for "${taskTitle}": ${message}`);
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export async function saveMessageDeal({ task, messageText, senderName, locationText, lang, escapeHtml }) {
  const record = {
    id: "DEAL-" + Math.floor(100000 + Math.random() * 900000),
    taskId: task.id,
    taskTitle: task.title,
    messageText,
    senderName,
    locationText,
    createdAt: new Date().toLocaleTimeString()
  };

  deals.unshift(record);
  localStorage.setItem("tasky_message_deals", JSON.stringify(deals));

  try {
    await addDoc(collection(db, "deals"), {
      ...record,
      serverTime: serverTimestamp()
    });
  } catch (_) {}

  renderMessageDeals(lang, escapeHtml);
  return record;
}

export function renderMessageDeals(lang = "en", escapeHtml = (s) => String(s)) {
  const box = document.getElementById("deals-list");
  if (!box) return;
  if (!deals.length) {
    box.innerHTML = `<div class="col-span-full bg-white dark:bg-slate-900 p-6 rounded-2xl text-center text-slate-400">${lang === "bn" ? "এখনো কোনো মেসেজ ডিল নেই।" : "No message deals yet."}</div>`;
    return;
  }

  box.innerHTML = deals.map((d) => `
    <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
      <div class="flex justify-between items-center">
        <span class="font-extrabold text-brand-600">${escapeHtml(d.id)}</span>
        <span class="text-[10px] text-slate-400">${escapeHtml(d.createdAt)}</span>
      </div>
      <div class="font-bold text-xs">${escapeHtml(d.taskTitle)}</div>
      <p class="text-[11px] text-slate-600 dark:text-slate-400">${escapeHtml(d.messageText)}</p>
      ${d.locationText ? `<div class="text-[10px] text-slate-500">📍 ${escapeHtml(d.locationText)}</div>` : ""}
    </div>
  `).join("");
}
