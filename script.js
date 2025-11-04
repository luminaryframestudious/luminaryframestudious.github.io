// script.js (type=module)
// Firebase modular SDK imports (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
}import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

/* -------------------------
   Your Firebase config
   (You provided this — keep it as-is)
   ------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCXsyTLjLDM7wQ7TAcG3d3KSgPzWR-Hty4",
  authDomain: "luminaryframe-c80db.firebaseapp.com",
  projectId: "luminaryframe-c80db",
  storageBucket: "luminaryframe-c80db.firebasestorage.app",
  messagingSenderId: "1075557950621",
  appId: "1:1075557950621:web:30d0d86ceddbb8a2eee074",
  measurementId: "G-E6ZRPKCJSH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
try { getAnalytics(app); } catch (e) { /* analytics may fail in some browsers/env */ }

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Expose some objects for debugging (optional)
window.firebaseApp = app;
window.auth = auth;
window.db = db;
window.storage = storage;

/* Booking status element (UI updates) */
const bookingStatus = document.getElementById('bookingStatus');

/**
 * submitBookingToFirebase
 * - Creates a Firestore document in `bookings`
 * - Uploads any provided files to Storage under bookings/{docId}/...
 * - Updates the booking doc with files array [{name, url}, ...]
 *
 * @param {Object} bookingData - booking fields (name, email, phone, etc.)
 * @param {FileList|File[]} filesList - optional list of File objects
 */
window.submitBookingToFirebase = async function submitBookingToFirebase(bookingData, filesList) {
  if (!db) {
    alert("Firestore not initialized. Check Firebase config.");
    return;
  }

  try {
    if (bookingStatus) bookingStatus.textContent = 'Submitting booking...';

    // Create the booking document first (without files)
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      createdAt: serverTimestamp(),
      files: [],
      status: bookingData.status || 'pending'
    });

    // If there are files, upload them to Storage and collect download URLs
    const uploadedFiles = [];
    if (filesList && filesList.length > 0) {
      for (let i = 0; i < filesList.length; i++) {
        const f = filesList[i];
        // sanitize and build path
        const timestamp = Date.now();
        const safeName = f.name.replace(/\s+/g, '_');
        const path = `bookings/${docRef.id}/${timestamp}_${safeName}`;
        const fileRef = storageRef(storage, path);

        // upload
        const snap = await uploadBytes(fileRef, f);
        // get URL
        const url = await getDownloadURL(snap.ref);
        uploadedFiles.push({ name: f.name, url, path });
      }

      // update the booking doc with uploaded file info
      await updateDoc(doc(db, 'bookings', docRef.id), { files: uploadedFiles });
    }

    if (bookingStatus) {
      bookingStatus.innerHTML = `✅ Booking submitted successfully! We'll contact you soon. (Booking ID: ${docRef.id})`;
    }

    // reset UI: try to clear form if present
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.reset();
    }
    const fileCount = document.getElementById('fileCount');
    if (fileCount) fileCount.textContent = '';

    // disable submit (user must enter txn next time)
    const submitBtn = document.getElementById('submitBooking');
    if (submitBtn) submitBtn.disabled = true;

    return { success: true, id: docRef.id };
  } catch (err) {
    console.error('submitBookingToFirebase error:', err);
    if (bookingStatus) bookingStatus.textContent = '❌ Error submitting booking. Check console for details.';
    return { success: false, error: err };
  }
};

/* ---------- Smooth scroll (keeps your current behavior) ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const el = document.querySelector(href);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---------- Auth state (logs to console; you can expand later) ---------- */
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(`Logged in as ${user.email || user.uid}`);
  } else {
    console.log('Not logged in');
  }
});