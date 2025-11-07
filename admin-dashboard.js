// admin-dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXsyTLjLDM7wQ7TAcG3d3KSgPzWR-Hty4",
  authDomain: "luminaryframe-c80db.firebaseapp.com",
  projectId: "luminaryframe-c80db",
  storageBucket: "luminaryframe-c80db.appspot.com",
  messagingSenderId: "1075557950621",
  appId: "1:1075557950621:web:30d0d86ceddbb8a2eee074",
  measurementId: "G-E6ZRPKCJSH"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// ensure only admin can view: simple client-side guard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "auth.html";
    return;
  }
  if (user.email !== "luminaryframestudios@gmail.com") {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
    return;
  }
  loadBookings();
});

async function loadBookings() {
  const listContainer = document.getElementById("bookingList");
  listContainer.innerHTML = `<p>Loading bookings...</p>`;

  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      listContainer.innerHTML = `<p>No bookings found yet.</p>`;
      return;
    }

    listContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("booking-item");
      div.style.border = "1px solid rgba(255,255,255,0.03)";
      div.style.padding = "12px";
      div.style.borderRadius = "8px";
      div.style.marginBottom = "10px";

      div.innerHTML = `
        <h3>${data.name || "Unnamed"} (${data.email || ""})</h3>
        <p><strong>Category:</strong> ${data.service || "N/A"} | 
           <strong>Style:</strong> ${data.style || "N/A"}</p>
        <p><strong>Message:</strong> ${data.message || "No message"}</p>
        <p><strong>Status:</strong> <span id="status-${docSnap.id}">${data.status || "Pending"}</span></p>
        <p><strong>Trial:</strong> ${data.isTrial ? "Yes" : "No"} ${data.txnId ? "| Txn: " + data.txnId : ""}</p>
        <div style="margin-top:8px">
          <button class="approve" data-id="${docSnap.id}">Approve</button>
          <button class="reject" data-id="${docSnap.id}">Reject</button>
        </div>
      `;
      listContainer.appendChild(div);
    });

    // attach listeners
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
  } catch (err) {
    console.error(err);
    listContainer.innerHTML = `<p style="color:red;">Error loading bookings.</p>`;
  }
}

async function updateBookingStatus(id, status) {
  try {
    await updateDoc(doc(db, "orders", id), { status });
    document.getElementById(`status-${id}`).textContent = status;
    Swal.fire({ icon: "success", title: `${status}`, timer: 1500, showConfirmButton: false });
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to update booking.", "error");
  }
}