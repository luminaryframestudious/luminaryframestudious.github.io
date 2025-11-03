// js/main.js
// Combined Firebase initialization + frontend + admin logic (copy this file to js/main.js)

// ------------------ Imports (CDN modular SDK) ------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  limit
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-functions.js";

// ------------------ Firebase config (you provided this) ------------------
const firebaseConfig = {
  apiKey: "AIzaSyCXsyTLjLDM7wQ7TAcG3d3KSgPzWR-Hty4",
  authDomain: "luminaryframe-c80db.firebaseapp.com",
  projectId: "luminaryframe-c80db",
  storageBucket: "luminaryframe-c80db.firebasestorage.app",
  messagingSenderId: "1075557950621",
  appId: "1:1075557950621:web:30d0d86ceddbb8a2eee074",
  measurementId: "G-E6ZRPKCJSH"
};

// ------------------ Initialize Firebase ------------------
const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch (e) { /* ignore analytics duplicate errors */ }

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// ------------------ Admin email (change here to your admin email) ------------------
const ADMIN_EMAIL = "luminaryframestudios@gmail.com"; // <-- change to mallikabdurrahman37@gmail.com if that's your admin

// ------------------ Helper: show simple messages ------------------
function showElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ------------------ Load site settings (logo, price presets) ------------------
async function loadSiteSettings() {
  try {
    const settingsRef = doc(db, "meta", "settings");
    const snap = await getDoc(settingsRef);
    const settings = snap && snap.exists() ? snap.data() : null;

    // logo
    if (settings && settings.logoUrl) {
      const el = document.querySelectorAll(".site-logo");
      el.forEach(e => {
        if (e.tagName === 'IMG') e.src = settings.logoUrl;
        else e.innerHTML = `<img src="${settings.logoUrl}" style="height:40px;border-radius:6px">`;
      });
    }

    // price presets
    if (settings && Array.isArray(settings.prices)) {
      // if page has a price select or suggestion area
      const priceSelect = document.getElementById("bf-type"); // example select
      if (priceSelect) {
        // keep existing options, but you can populate suggested price labels elsewhere
      }

      // show presets if an element exists
      const presetArea = document.getElementById("pricePresets");
      if (presetArea) {
        presetArea.innerHTML = "";
        settings.prices.forEach(p => {
          const b = document.createElement("button");
          b.className = "chip";
          b.textContent = `${p.type} — ₹${p.price}`;
          presetArea.appendChild(b);
        });
      }
    }
  } catch (e) {
    console.error("loadSiteSettings error:", e);
  }
}

// Run settings loader on script load (non-blocking)
loadSiteSettings();

// ------------------ BOOKING FORM: upload optional file + save booking ------------------
const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    showElText("bookingStatus", "Submitting booking…");

    // find fields by common IDs used in the templates
    const name = (document.getElementById("bf-name") || document.getElementById("name") || {}).value || "";
    const email = (document.getElementById("bf-email") || document.getElementById("email") || {}).value || "";
    const phone = (document.getElementById("bf-phone") || document.getElementById("phone") || {}).value || "";
    const appSelect = (document.getElementById("bf-app") || document.getElementById("editApp") || {}).value || "";
    const typeSelect = (document.getElementById("bf-type") || document.getElementById("editType") || {}).value || "";
    const notes = (document.getElementById("bf-notes") || {}).value || "";

    // files (optional)
    const fileInput = document.getElementById("bf-file") || document.getElementById("fileUpload") || null;
    let fileUrl = null;

    try {
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const path = `bookings/${Date.now()}_${file.name}`;
        const ref = storageRef(storage, path);
        const task = uploadBytesResumable(ref, file);
        showElText("bookingStatus", "Uploading file...");
        // wait for upload
        await new Promise((resolve, reject) => {
          task.on('state_changed', snapshot => {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            showElText("bookingStatus", `Uploading file ${percent}%`);
          }, err => reject(err), () => resolve());
        });
        fileUrl = await getDownloadURL(task.snapshot.ref);
      }

      // Save booking doc
      await addDoc(collection(db, "bookings"), {
        name, email, phone, app: appSelect, type: typeSelect,
        notes: notes || null,
        fileUrl: fileUrl || null,
        status: "new",
        createdAt: serverTimestamp()
      });

      showElText("bookingStatus", "Booking submitted — thank you!");
      bookingForm.reset();
    } catch (err) {
      console.error("booking error:", err);
      showElText("bookingStatus", "Error: " + err.message);
    }
  });
}

// ------------------ Admin sign-in overlay / Google sign-in ------------------
const provider = new GoogleAuthProvider();

async function openAdminSignIn() {
  try {
    const res = await signInWithPopup(auth, provider);
    const user = res.user;
    if (user && user.email === ADMIN_EMAIL) {
      // success — redirect to admin page or refresh
      window.location.href = "admin.html";
    } else {
      // not admin — sign out immediately
      alert("Signed in but not admin: " + (user?.email || "unknown"));
      await signOut(auth);
    }
  } catch (err) {
    console.error("Admin sign in error:", err);
    alert("Sign-in error: " + err.message);
  }
}

// expose helper to window for overlay buttons if needed
window.openAdminSignIn = openAdminSignIn;

// ------------------ Admin dashboard logic (runs on admin.html) ------------------
async function loadAdminDashboard() {
  // ensure this page has the admin elements
  const bookingsContainer = document.getElementById("bookingsContainer") || document.getElementById("adminBookings");
  const samplesContainer = document.getElementById("samplesContainer");
  const priceListEl = document.getElementById("priceList");
  const logoPreviewEl = document.getElementById("logoPreview");
  const signOutBtn = document.getElementById("signOutBtn");

  if (!bookingsContainer) return; // not admin page

  // sign out button behavior
  if (signOutBtn) signOutBtn.onclick = async () => { await signOut(auth); window.location.href = "index.html"; };

  // only allow admin user
  onAuthStateChanged(auth, async (user) => {
    if (!user || user.email !== ADMIN_EMAIL) {
      bookingsContainer.innerHTML = '<div class="note">No access. Sign in on the main site as admin.</div>';
      if (samplesContainer) samplesContainer.innerHTML = '';
      if (priceListEl) priceListEl.innerHTML = '';
      if (logoPreviewEl) logoPreviewEl.innerHTML = '';
      return;
    }

    // load bookings
    await refreshBookings();

    // load samples
    try {
      const q = query(collection(db, "samples"), orderBy("createdAt", "desc"), limit(50));
      const snap = await getDocs(q);
      if (samplesContainer) {
        samplesContainer.innerHTML = "";
        if (snap.empty) samplesContainer.innerHTML = "<div class='note'>No samples yet.</div>";
        snap.forEach(s => {
          const d = s.data();
          const el = document.createElement("div");
          el.style.marginBottom = "8px";
          el.innerHTML = `<strong>${d.title || d.filename}</strong> • ${d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleString() : ''} • <a href="${d.url}" target="_blank">view</a>`;
          samplesContainer.appendChild(el);
        });
      }
    } catch (e) {
      console.error("load samples err", e);
      if (samplesContainer) samplesContainer.innerHTML = "<div class='note'>Error loading samples</div>";
    }

    // load settings (logo + prices)
    try {
      const settingsRef = doc(db, "meta", "settings");
      const sSnap = await getDoc(settingsRef);
      const settings = sSnap && sSnap.exists() ? sSnap.data() : null;

      if (logoPreviewEl) {
        if (settings && settings.logoUrl) {
          logoPreviewEl.innerHTML = `<img src="${settings.logoUrl}" style="height:48px;border-radius:8px"> <div class="muted">${settings.logoName || ''}</div>`;
        } else {
          logoPreviewEl.innerHTML = `<div class="muted">No logo set</div>`;
        }
      }

      if (priceListEl) {
        priceListEl.innerHTML = "";
        const presets = (settings && settings.prices) ? settings.prices : [];
        if (presets.length === 0) priceListEl.innerHTML = "<div class='note'>No presets</div>";
        presets.forEach((p, idx) => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "8px";
          row.style.alignItems = "center";
          row.style.marginTop = "8px";
          const t = document.createElement("div"); t.style.flex = "1"; t.textContent = p.type;
          const inp = document.createElement("input"); inp.value = p.price; inp.className = "price-input";
          const saveBtn = document.createElement("button"); saveBtn.className = "btn"; saveBtn.textContent = "Save";
          const delBtn = document.createElement("button"); delBtn.className = "btn danger"; delBtn.textContent = "Delete";

          saveBtn.onclick = async () => {
            presets[idx].price = inp.value;
            await setDoc(settingsRef, { prices: presets }, { merge: true });
            await loadSiteSettings();
            alert("Saved");
          };
          delBtn.onclick = async () => {
            presets.splice(idx, 1);
            await setDoc(settingsRef, { prices: presets }, { merge: true });
            await loadSiteSettings();
            await loadAdminDashboard(); // refresh
          };

          row.appendChild(t); row.appendChild(inp); row.appendChild(saveBtn); row.appendChild(delBtn);
          priceListEl.appendChild(row);
        });
      }
    } catch (e) {
      console.error("settings load err", e);
    }
  });

  // admin page helper functions
  async function refreshBookings() {
    bookingsContainer.innerHTML = "Loading bookings…";
    try {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      bookingsContainer.innerHTML = "";
      if (snap.empty) { bookingsContainer.innerHTML = "<div class='note'>No bookings</div>"; return; }
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const id = docSnap.id;
        const row = document.createElement("div");
        row.className = "booking-row";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "10px 0";
        row.style.borderBottom = "1px dashed rgba(255,255,255,0.03)";

        const left = document.createElement("div");
        left.innerHTML = `<strong>${data.name}</strong> <div class="muted">${data.email} • ${data.phone}</div>
                          <div style="margin-top:6px">${data.app || data.editApp || ''} • ${data.type || data.editType || ''}</div>
                          ${data.notes ? `<div class="muted">${data.notes}</div>` : ''}`;

        const right = document.createElement("div");
        right.style.display = "flex";
        right.style.gap = "8px";
        right.style.alignItems = "center";

        const statusSpan = document.createElement("span");
        statusSpan.className = "status-pill " + (data.status === "approved" ? "status-approved" : data.status === "rejected" ? "status-rejected" : "status-new");
        statusSpan.textContent = (data.status || "new").toUpperCase();

        const priceInput = document.createElement("input");
        priceInput.className = "price-input";
        priceInput.placeholder = "Price ₹";
        priceInput.value = data.price || "";

        const approveBtn = document.createElement("button");
        approveBtn.className = "btn";
        approveBtn.textContent = "Approve";
        approveBtn.onclick = async () => {
          await updateDoc(doc(db, "bookings", id), { status: "approved", price: priceInput.value || null, approvedAt: serverTimestamp() });
          await sendEmailToCustomer(data.email, "Booking Approved", `Your booking is approved. Price: ₹${priceInput.value || 'Contact'}`);
          await refreshBookings();
        };

        const rejectBtn = document.createElement("button");
        rejectBtn.className = "btn danger";
        rejectBtn.textContent = "Reject";
        rejectBtn.onclick = async () => {
          await updateDoc(doc(db, "bookings", id), { status: "rejected" });
          await sendEmailToCustomer(data.email, "Booking Update", "Sorry — your booking was rejected. Contact support.");
          await refreshBookings();
        };

        const notifyBtn = document.createElement("button");
        notifyBtn.className = "btn gradient";
        notifyBtn.textContent = "Notify";
        notifyBtn.onclick = async () => {
          await sendEmailToCustomer(data.email, "Booking Update", `Status: ${data.status || 'new'} — Message from admin.`);
        };

        right.appendChild(statusSpan);
        right.appendChild(priceInput);
        right.appendChild(approveBtn);
        right.appendChild(rejectBtn);
        right.appendChild(notifyBtn);

        row.appendChild(left);
        row.appendChild(right);
        bookingsContainer.appendChild(row);
      });
    } catch (e) {
      console.error("refreshBookings error", e);
      bookingsContainer.innerHTML = "<div class='note'>Error loading bookings</div>";
    }
  }

  // Expose refresh so other parts can call it
  window.refreshBookings = refreshBookings;
}

// call admin loader if admin page elements are present
if (document.getElementById("bookingsContainer") || document.getElementById("adminBookings")) {
  loadAdminDashboard();
}

// ------------------ Logo upload handler on admin page ------------------
const uploadLogoBtn = document.getElementById("uploadLogoBtn");
if (uploadLogoBtn) {
  uploadLogoBtn.onclick = async () => {
    const fileEl = document.getElementById("logoFile");
    const logoMsg = document.getElementById("logoMsg");
    if (!fileEl || !fileEl.files[0]) { if (logoMsg) logoMsg.textContent = "Choose a file first."; return; }
    const f = fileEl.files[0];
    const path = `assets/logo_${Date.now()}_${f.name}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, f);
    if (logoMsg) logoMsg.textContent = "Uploading...";
    task.on('state_changed', null, (err) => {
      if (logoMsg) logoMsg.textContent = "Upload error: " + err.message;
    }, async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      await setDoc(doc(db, "meta", "settings"), { logoUrl: url, logoName: f.name }, { merge: true });
      if (logoMsg) logoMsg.textContent = "Logo saved.";
      await loadSiteSettings();
    });
  };
}

// ------------------ Add price preset UI (admin page) ------------------
const addPriceBtn = document.getElementById("addPriceBtn");
if (addPriceBtn) {
  addPriceBtn.onclick = async () => {
    const newType = document.getElementById("newType").value.trim();
    const newPrice = document.getElementById("newPrice").value.trim();
    if (!newType || !newPrice) return alert("Enter type and price.");
    const settingsRef = doc(db, "meta", "settings");
    // read current
    const snap = await getDoc(settingsRef);
    const settings = snap && snap.exists() ? snap.data() : {};
    const prices = settings.prices || [];
    prices.push({ type: newType, price: newPrice });
    await setDoc(settingsRef, { prices }, { merge: true });
    alert("Added preset.");
    location.reload();
  };
}

// ------------------ Cloud Function call for sending email (sendMail) ------------------
async function sendEmailToCustomer(to, subject, text) {
  try {
    const sendMail = httpsCallable(functions, "sendMail");
    await sendMail({ to, subject, text });
    return true;
  } catch (e) {
    console.error("sendMail call failed:", e);
    return false;
  }
}

// Expose sendEmailToCustomer for manual calls from console/testing (optional)
window.sendEmailToCustomer = sendEmailToCustomer;

// ------------------ Admin quick helper: open overlay when pressing 'A' on keyboard (optional) ------------------
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === 'a') {
    // attempt admin sign-in
    openAdminSignIn();
  }
});

// ------------------ Export some useful objects for debugging if needed ------------------
window._lf = {
  firebaseApp: app,
  auth,
  db,
  storage,
  functions,
  ADMIN_EMAIL
};

// end of main.js