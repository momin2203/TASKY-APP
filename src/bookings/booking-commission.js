import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, OWNER_COMMISSION_CONFIG } from "../config/firebase-config.js";

let bookings = JSON.parse(localStorage.getItem("tasky_bookings") || "[]");
let ownerEarnings = JSON.parse(localStorage.getItem("tasky_owner_earnings") || "[]");

export function calculateFivePercentSplit(totalAmount) {
  const gross = Number(totalAmount) || 0;
  const commission5Percent = Number((gross * OWNER_COMMISSION_CONFIG.rate).toFixed(2));
  const providerShare95Percent = Number((gross - commission5Percent).toFixed(2));
  return { gross, commission5Percent, providerShare95Percent };
}

export async function saveBookingWithCommission({ task, phone, method, trx, customerUser, lang, escapeHtml }) {
  const { gross, commission5Percent, providerShare95Percent } = calculateFivePercentSplit(task.budget);
  const bookingId = "TSK-" + Math.floor(100000 + Math.random() * 900000);

  const bookingRecord = {
    id: bookingId,
    taskId: task.id,
    taskTitle: task.title,
    grossAmount: gross,
    commission5Percent,
    providerShare95Percent,
    ownerAccount: OWNER_COMMISSION_CONFIG.ownerEmail,
    customerPhone: phone,
    customerName: customerUser?.displayName || "Guest",
    method,
    trx: trx || "COD",
    createdAt: new Date().toISOString()
  };

  bookings.unshift(bookingRecord);
  ownerEarnings.unshift({
    bookingId,
    taskTitle: task.title,
    grossAmount: gross,
    earnedCommission: commission5Percent,
    creditedTo: OWNER_COMMISSION_CONFIG.ownerEmail,
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem("tasky_bookings", JSON.stringify(bookings));
  localStorage.setItem("tasky_owner_earnings", JSON.stringify(ownerEarnings));

  try {
    await addDoc(collection(db, "bookings"), {
      ...bookingRecord,
      serverTime: serverTimestamp()
    });
  } catch (e) {
    console.warn("Local booking saved; Firestore sync pending rules:", e.message);
  }

  renderBookingsAndCommission(lang, escapeHtml);
  return bookingRecord;
}

export function renderBookingsAndCommission(lang = "en", escapeHtml = (s) => String(s)) {
  const isBn = lang === "bn";
  const totalCommission = ownerEarnings.reduce((sum, item) => sum + Number(item.earnedCommission || 0), 0);

  const commissionBox = document.getElementById("owner-commission-summary");
  if (commissionBox) {
    commissionBox.innerHTML = `
      <div class="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-brand-400">
            ${isBn ? "অটোমেটিক ৫% কমিশন অ্যাকাউন্ট" : "AUTO 5% PLATFORM COMMISSION"}
          </span>
          <div class="text-xs text-slate-300 mt-0.5">${escapeHtml(OWNER_COMMISSION_CONFIG.ownerEmail)}</div>
        </div>
        <div class="text-right">
          <div class="text-[11px] text-slate-400">${isBn ? "মোট জমা হয়েছে" : "Total Credited"}</div>
          <div class="text-lg font-extrabold text-emerald-400">৳${totalCommission.toFixed(2)}</div>
        </div>
      </div>
    `;
  }

  const listEl = document.getElementById("bookings-list");
  if (!listEl) return;

  if (!bookings.length) {
    listEl.innerHTML = `<div class="col-span-full bg-white dark:bg-slate-900 p-6 rounded-2xl text-center text-slate-400 border border-slate-200/70 dark:border-slate-800">${isBn ? "এখনো কোনো বুকিং নেই।" : "No bookings yet."}</div>`;
    return;
  }

  listEl.innerHTML = bookings.map((b) => `
    <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex justify-between items-center shadow-xs">
      <div>
        <div class="font-extrabold text-slate-900 dark:text-white">${escapeHtml(b.id)} • <span class="text-brand-600">${escapeHtml(b.method)}</span></div>
        <div class="text-[11px] text-slate-500">${escapeHtml(b.taskTitle)} (${escapeHtml(b.customerPhone)})</div>
        <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
          ${isBn ? "৫% কমিশন জমা" : "5% Commission Credited"}: ৳${Number(b.commission5Percent || 0).toFixed(2)} • ${isBn ? "মূল অংশ" : "Net"}: ৳${Number(b.providerShare95Percent || 0).toFixed(2)}
        </div>
      </div>
      <span class="font-extrabold text-slate-900 dark:text-white text-sm">৳${escapeHtml(String(b.grossAmount ?? 0))}</span>
    </div>
  `).join("");
}

export function listenFirestoreBookings() {
  const q = query(collection(db, "bookings"), orderBy("serverTime", "desc"));
  return onSnapshot(q, () => {}, () => {});
}
