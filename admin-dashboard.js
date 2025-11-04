// admin-dashboard.js — LuminaryFrame Studios (Admin Panel)
// Manages all bookings and displays them in the dashboard

import { db } from "./script.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// --- DOM ELEMENTS ---
const bookingList = document.getElementById("bookingList");
const refreshBtn = document.getElementById("refreshBtn");

// --- Load Bookings ---
async function loadBookings() {
  bookingList.innerHTML = "<p>Loading bookings...</p>";

  try {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      bookingList.innerHTML = "<p>No bookings found.</p>";
      return;
    }

    let html = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      const date = data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : "N/A";

      html += `
        <div class="booking-card">
          <h3>${data.name}</h3>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>App:</strong> ${data.app}</p>
          <p><strong>Style:</strong> ${data.style}</p>
          <p><strong>Clip Link:</strong> 
            <a href="${data.clipLink}" target="_blank" class="clip-link">View Clip</a>
          </p>
          <p><strong>Message:</strong> ${data.message || "—"}</p>
          <p><strong>Status:</strong> 
            <span class="status">${data.status || "Pending"}</span>
          </p>
          <p><strong>Date:</strong> ${date}</p>
          <div class="btn-group">
            <button class="approve-btn" onclick="updateStatus('${id}', 'Approved')">✅ Approve</button>
            <button class="reject-btn" onclick="updateStatus('${id}', 'Rejected')">❌ Reject</button>
            <button class="delete-btn" onclick="deleteBooking('${id}')">🗑️ Delete</button>
          </div>
        </div>
      `;
    });

    bookingList.innerHTML = html;
  } catch (err) {
    console.error("Error loading bookings:", err);
    bookingList.innerHTML = "<p>Error loading bookings.</p>";
  }
}

// --- Delete Booking ---
window.deleteBooking = async (id) => {
  if (!confirm("Delete this booking permanently?")) return;

  try {
    await deleteDoc(doc(db, "bookings", id));
    alert("🗑️ Booking deleted successfully!");
    loadBookings();
  } catch (err) {
    alert("Error deleting booking: " + err.message);
  }
};

// --- Update Booking Status ---
window.updateStatus = async (id, status) => {
  try {
    await updateDoc(doc(db, "bookings", id), { status });
    alert(`✅ Status updated to: ${status}`);
    loadBookings();
  } catch (err) {
    alert("Error updating status: " + err.message);
  }
};

// --- Refresh Button ---
if (refreshBtn) {
  refreshBtn.addEventListener("click", loadBookings);
}

// --- Load on Page Start ---
document.addEventListener("DOMContentLoaded", loadBookings);