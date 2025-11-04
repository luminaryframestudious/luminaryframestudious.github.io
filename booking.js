// booking.js — LuminaryFrame Studios (Firebase v9.22.2)

import { db, uploadedFileURL } from "./script.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// --- FORM ELEMENTS ---
const bookingForm = document.getElementById("bookingForm");
const submitBtn = document.getElementById("submitBtn");
const payBtn = document.getElementById("payBtn");
const paymentSection = document.getElementById("paymentSection");
const uploadStatus = document.getElementById("uploadStatus");

// --- PAYMENT UPI ID ---
const UPI_ID = "9239529167@fam";

// --- FORM SUBMIT ---
if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const app = document.getElementById("app").value;
    const style = document.getElementById("style").value;
    const clipLink = uploadedFileURL || document.getElementById("clipLink").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !app || !style) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    if (!clipLink) {
      alert("⚠️ Please upload or provide a clip link before booking.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      await addDoc(collection(db, "bookings"), {
        name,
        email,
        app,
        style,
        clipLink,
        message,
        createdAt: serverTimestamp(),
        status: "Pending"
      });

      alert("✅ Booking submitted successfully!");
      bookingForm.reset();
      uploadStatus.textContent = "";
      paymentSection.style.display = "block";
    } catch (error) {
      alert("❌ Error submitting booking: " + error.message);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Booking";
  });
}

// --- PAYMENT BUTTON ---
if (payBtn) {
  payBtn.addEventListener("click", () => {
    const upiURL = `upi://pay?pa=${UPI_ID}&pn=LuminaryFrame%20Studios&cu=INR`;
    window.location.href = upiURL;
  });
}