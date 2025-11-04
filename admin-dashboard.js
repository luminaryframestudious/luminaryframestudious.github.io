// ---------- ADMIN DASHBOARD.JS ----------
// LuminaryFrame Studios — Admin panel logic

import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { app } from "./script.js";

const db = getFirestore(app);
const storage = getStorage(app);

// Load bookings
async function loadBookings(filterText = "") {
  const list = document.getElementById("adminList");
  if (!list) return;

  list.innerHTML = "<p>Loading bookings...</p>";
  const snapshot = await getDocs(collection(db, "bookings"));

  let html = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const match =
      data.name?.toLowerCase().includes(filterText) ||
      data.email?.toLowerCase().includes(filterText) ||
      data.type?.toLowerCase().includes(filterText) ||
      data.style?.toLowerCase().includes(filterText);

    if (filterText === "" || match) {
      html += `
        <div class="booking-card">
          <h3>${data.name || "Unnamed"}</h3>
          <p>Email: ${data.email}</p>
          <p>Type: ${data.type}</p>
          <p>Style: ${data.style}</p>
          <p>Status: ${data.status || "Pending"}</p>
          <button onclick="deleteBooking('${docSnap.id}')">🗑️ Delete</button>
        </div>`;
    }
  });

  list.innerHTML = html || "<p>No bookings found.</p>";
}

// Search filter
document.getElementById("searchBox").addEventListener("input", (e) => {
  loadBookings(e.target.value.toLowerCase());
});

  let html = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const fileButton = data.fileURL
      ? `<button onclick="viewFile('${data.fileURL}')">📂 View File</button>`
      : `<p style="color:#888;font-size:0.85rem;">No file uploaded</p>`;

    html += `
      <div class="booking-card">
        <h3>${data.name || "Unnamed"}</h3>
        <p>Email: ${data.email}</p>
        <p>Type: ${data.type}</p>
        <label>Status:</label>
        <select onchange="updateStatus('${docSnap.id}', this.value)">
          <option value="Pending" ${data.status === "Pending" ? "selected" : ""}>Pending</option>
          <option value="In Progress" ${data.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option value="Completed" ${data.status === "Completed" ? "selected" : ""}>Completed</option>
        </select>
        <div style="margin-top:8px;">${fileButton}</div>
        <button style="margin-top:10px;" onclick="deleteBooking('${docSnap.id}')">🗑️ Delete</button>
      </div>`;
  });

  list.innerHTML = html || "<p>No bookings yet.</p>";
}

// Update booking status
window.updateStatus = async (id, newStatus) => {
  try {
    await updateDoc(doc(db, "bookings", id), { status: newStatus });
    alert("Status updated to " + newStatus);
  } catch (e) {
    alert("Error updating status: " + e.message);
  }
};

// Delete booking
window.deleteBooking = async (id) => {
  if (confirm("Delete this booking?")) {
    await deleteDoc(doc(db, "bookings", id));
    alert("Deleted!");
    loadBookings();
  }
};

// View file
window.viewFile = (url) => {
  // Open in new tab for video/photo preview or download
  window.open(url, "_blank");
};

// Refresh button
document.getElementById("refreshBtn").addEventListener("click", loadBookings);

// Run on page load
document.addEventListener("DOMContentLoaded", loadBookings);// THEME CUSTOMISATION
const themeToggle = document.getElementById("themeToggle");
const accentPicker = document.getElementById("accentPicker");

// Load saved theme from localStorage
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-theme");
  themeToggle.checked = true;
}
if (localStorage.getItem("accent")) {
  document.documentElement.style.setProperty("--accent", localStorage.getItem("accent"));
  accentPicker.value = localStorage.getItem("accent");
}

// Toggle dark mode
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-theme", themeToggle.checked);
  localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
});

// Change accent color
accentPicker.addEventListener("input", () => {
  document.documentElement.style.setProperty("--accent", accentPicker.value);
  localStorage.setItem("accent", accentPicker.value);
});