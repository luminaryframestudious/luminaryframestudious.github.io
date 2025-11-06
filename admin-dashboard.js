// admin-dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// ✅ Firebase config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyCXsyTLjLDM7wQ7TAcG3d3KSgPzWR-Hty4",
  authDomain: "luminaryframe-c80db.firebaseapp.com",
  projectId: "luminaryframe-c80db",
  storageBucket: "luminaryframe-c80db.appspot.com",
  messagingSenderId: "1075557950621",
  appId: "1:1075557950621:web:30d0d86ceddbb8a2eee074",
  measurementId: "G-E6ZRPKCJSH"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Load all bookings from Firestore
async function loadBookings() {
  const listContainer = document.getElementById("bookingList");
  listContainer.innerHTML = `<p>Loading bookings...</p>`;

  try {
    const snapshot = await getDocs(collection(db, "bookings"));
    if (snapshot.empty) {
      listContainer.innerHTML = `<p>No bookings found yet.</p>`;
      return;
    }

    listContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("booking-item");

      div.innerHTML = `
        <h3>${data.name || "Unnamed"} (${data.email || ""})</h3>
        <p><strong>Category:</strong> ${data.category || "N/A"} | 
           <strong>Style:</strong> ${data.style || "N/A"}</p>
        <p><strong>Message:</strong> ${data.message || "No message"}</p>
        <p><strong>Status:</strong> ${data.status || "Pending"}</p>
        <div class="actions">
          <button class="approve" data-id="${docSnap.id}">Approve</button>
          <button class="reject" data-id="${docSnap.id}">Reject</button>
          <button class="upload" data-id="${docSnap.id}">Upload Sample</button>
        </div>
        <div class="status" id="status-${docSnap.id}"></div>
      `;
      listContainer.appendChild(div);
    });

    attachEventListeners();
  } catch (err) {
    console.error(err);
    listContainer.innerHTML = `<p style="color:red;">Error loading bookings.</p>`;
  }
}

// ✅ Attach Approve / Reject / Upload button actions
function attachEventListeners() {
  document.querySelectorAll(".approve").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await updateBookingStatus(id, "Approved");
    })
  );

  document.querySelectorAll(".reject").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await updateBookingStatus(id, "Rejected");
    })
  );

  document.querySelectorAll(".upload").forEach((btn) =>
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      handleUpload(id);
    })
  );
}

// ✅ Update Firestore booking status
async function updateBookingStatus(id, status) {
  const statusEl = document.getElementById(`status-${id}`);
  try {
    await updateDoc(doc(db, "bookings", id), { status });
    statusEl.textContent = `Status updated to: ${status}`;
    Swal.fire({
      icon: "success",
      title: `${status} Successfully`,
      text: `Booking has been marked as ${status}.`,
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to update booking.", "error");
  }
}

// ✅ Handle Sample Upload (directly from dashboard)
async function handleUpload(id) {
  const { value: file } = await Swal.fire({
    title: "Upload Sample File",
    input: "file",
    inputAttributes: {
      accept: "video/*,image/*",
    },
    showCancelButton: true,
    confirmButtonText: "Upload",
  });

  if (!file) return;

  try {
    const safeName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const fileRef = storageRef(storage, `samples/${safeName}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    await updateDoc(doc(db, "bookings", id), { sampleURL: url });
    Swal.fire("Uploaded!", "Sample uploaded successfully.", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Upload failed. Try again.", "error");
  }
}

// ✅ Auto load
loadBookings();