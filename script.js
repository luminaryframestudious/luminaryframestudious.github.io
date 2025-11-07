// script.js — main app logic (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// ---------- CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyCXsyTLjLDM7wQ7TAcG3d3KSgPzWR-Hty4",
  authDomain: "luminaryframe-c80db.firebaseapp.com",
  projectId: "luminaryframe-c80db",
  storageBucket: "luminaryframe-c80db.appspot.com", // corrected
  messagingSenderId: "1075557950621",
  appId: "1:1075557950621:web:30d0d86ceddbb8a2eee074",
  measurementId: "G-E6ZRPKCJSH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ---------- EmailJS init (public key) ----------
if (typeof emailjs !== "undefined" && emailjs.init) {
  emailjs.init("24wLt-L5koQCAR4cW"); // public key you gave
} else {
  console.warn("EmailJS not loaded; include SDK before script.js");
}

// ---------- Helper: get current user (promise-like) ----------
function requireAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

// ---------- Booking logic ----------
const orderForm = document.getElementById("orderForm");
if (orderForm) {
  // Setup pay button
  document.getElementById("payBtn").addEventListener("click", () => {
    const upi = document.getElementById("upiId").textContent.trim();
    const amount = "5"; // ₹5 sample
    // UPI deep link — works on mobile
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent("LuminaryFrame")} &am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent("Trial payment")}`;
    // fallback attempt
    window.location.href = upiUrl;
  });

  // When form loaded, check trial status and toggle txn field
  async function refreshTrialVisuals() {
    const user = await requireAuth(); // will resolve null if not logged in
    const txnLabel = document.getElementById("txnLabel");
    const txnInput = document.getElementById("txnId");

    if (!user) {
      // Not logged in — require login via auth.html when submitting
      txnLabel.style.display = "none";
      txnInput.style.display = "none";
      return;
    }

    // count trial orders
    const q = query(collection(db, "orders"), where("uid", "==", user.uid), where("isTrial", "==", true));
    const snap = await getDocs(q);
    const trialCount = snap.size;
    if (trialCount >= 5) {
      txnLabel.style.display = "block";
      txnInput.style.display = "block";
      txnInput.required = true;
    } else {
      txnLabel.style.display = "none";
      txnInput.style.display = "none";
      txnInput.required = false;
    }
  }

  // Try refreshing visuals on page load (user may or may not be signed in)
  refreshTrialVisuals();

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // ensure user is logged in
    let user = auth.currentUser;
    if (!user) {
      // create an account using form email & random password if sign-up desired OR redirect to login
      // Simpler: redirect to login
      alert("You must login or create an account before booking. Click Login.");
      window.location.href = "auth.html";
      return;
    }

    // form fields
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const style = document.getElementById("style").value;
    const message = document.getElementById("message").value;
    const txnIdEl = document.getElementById("txnId");
    const txnId = txnIdEl ? txnIdEl.value.trim() : "";

    // determine trial eligibility
    const trialQuery = query(collection(db, "orders"), where("uid", "==", user.uid), where("isTrial", "==", true));
    const trialSnap = await getDocs(trialQuery);
    const trialCount = trialSnap.size;
    const isTrial = (trialCount < 5);

    // if paid required and txn missing -> block
    if (!isTrial && (!txnId || txnId.length < 3)) {
      alert("Paid orders require a UPI transaction ID. Please pay and enter the UPI txn ID.");
      return;
    }

    // handle file uploads — multiple
    const fileInput = document.getElementById("fileInput");
    const files = fileInput.files || [];
    const uploadedURLs = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const safeName = `${Date.now()}_${f.name.replace(/\s+/g,"_")}`;
        const ref = storageRef(storage, `uploads/${safeName}`);
        const res = await uploadBytes(ref, f);
        const url = await getDownloadURL(ref);
        uploadedURLs.push(url);
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Failed to upload files. Try again.");
      return;
    }

    // create booking record in Firestore
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        uid: user.uid,
        name: fullName,
        email,
        phone,
        service,
        style,
        message,
        files: uploadedURLs,
        isTrial,
        txnId: isTrial ? null : txnId,
        status: "Pending",
        createdAt: new Date().toISOString()
      });

      // send email using EmailJS
      if (typeof emailjs !== "undefined") {
        const templateParams = {
          user_name: fullName,
          user_email: email,
          service,
          message: `${message}\nOrder ID: ${docRef.id}`,
        };
        try {
          await emailjs.send("service_as09ic9", "template_ba64mye", templateParams);
        } catch (e) {
          console.warn("EmailJS send failed", e);
        }
      }

      alert("Booking submitted successfully.");
      orderForm.reset();
      refreshTrialVisuals();
    } catch (err) {
      console.error(err);
      alert("Failed to create booking. Try again.");
    }
  });
}