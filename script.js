// script.js (Firebase v9.22.2)
// Initialize Firebase App and Storage

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// 🔹 Your Firebase configuration (unchanged)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// 🔹 Image upload handler (for booking page)
const fileInput = document.getElementById("clipUpload");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
let uploadedFileURL = "";

if (uploadBtn) {
  uploadBtn.addEventListener("click", async () => {
    const file = fileInput?.files[0];
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    try {
      const fileRef = storageRef(storage, `uploads/${file.name}`);
      await uploadBytes(fileRef, file);
      uploadedFileURL = await getDownloadURL(fileRef);
      uploadStatus.textContent = "✅ File uploaded successfully!";
    } catch (error) {
      console.error("Upload failed:", error);
      uploadStatus.textContent = "❌ Upload failed. Try again.";
    }
  });
}

export { app, db, storage, uploadedFileURL };