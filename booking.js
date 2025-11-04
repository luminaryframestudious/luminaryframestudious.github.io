// booking.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ✅ Firebase configuration (replace with your own Firebase keys)
const firebaseConfig = {
  apiKey: "AIzaSyCXsyTLjLDM7wQ7TAcG3d3KSgPzWR-Hty4",
  authDomain: "luminaryframe-c80db.firebaseapp.com",
  projectId: "luminaryframe-c80db",
  storageBucket: "luminaryframe-c80db.firebasestorage.app",
  messagingSenderId: "1075557950621",
  appId: "1:1075557950621:web:30d0d86ceddbb8a2eee074",
  measurementId: "G-E6ZRPKCJSH"
};
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize EmailJS
(function() {
  emailjs.init("24wLt-L5koQCAR4cW"); // ✅ Your public key
})();

// Handle booking form submission
const bookingForm = document.getElementById("booking-form");
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input values
  const name = bookingForm["name"].value;
  const email = bookingForm["email"].value;
  const category = bookingForm["category"].value;
  const style = bookingForm["style"].value;
  const message = bookingForm["message"].value;
  const clipLink = bookingForm["clipLink"].value; // if using file link or URL

  try {
    // 1️⃣ Save booking data to Firestore
    await addDoc(collection(db, "bookings"), {
      name,
      email,
      category,
      style,
      message,
      clipLink,
      createdAt: serverTimestamp()
    });

    // 2️⃣ Send booking info via EmailJS
    const templateParams = {
      name: name,
      email: email,
      category: category,
      style: style,
      message: message,
      clipLink: clipLink
    };

    await emailjs.send("service_as09ic9", "template_ba64mye", templateParams);

    // 3️⃣ Show success message
    alert("✅ Booking submitted successfully! You’ll receive confirmation soon.");

    // Reset form
    bookingForm.reset();

  } catch (error) {
    console.error("Error submitting booking:", error);
    alert("❌ Failed to submit booking. Please try again.");
  }
});