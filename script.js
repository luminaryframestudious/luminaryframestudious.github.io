// script.js — Initializes Firebase and EmailJS for LuminaryFrame Studios

// ✅ Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ✅ Firebase configuration (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyCXsyTLjLDM7wQ7TAcG3d3KSgPzWR-Hty4",
  authDomain: "luminaryframe-c80db.firebaseapp.com",
  projectId: "luminaryframe-c80db",
  storageBucket: "luminaryframe-c80db.appspot.com", // ✅ corrected domain (appspot.com)
  messagingSenderId: "1075557950621",
  appId: "1:1075557950621:web:30d0d86ceddbb8a2eee074",
  measurementId: "G-E6ZRPKCJSH"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// ✅ Initialize EmailJS (loaded globally in index.html)
if (typeof emailjs !== "undefined" && emailjs.init) {
  try {
    emailjs.init("24wLt-L5koQCAR4cW"); // your public key
  } catch (error) {
    console.warn("EmailJS initialization failed:", error);
  }
} else {
  console.warn("EmailJS SDK not loaded — check your script order.");
}

// ✅ Helper function: Upload file to Firebase Storage
export async function uploadFileToFirebase(file) {
  if (!file) throw new Error("No file provided.");

  // Sanitize filename
  const safeName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

  // Reference path in storage
  const fileRef = storageRef(storage, `uploads/${safeName}`);

  // Upload and return file URL
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

// ✅ Export core Firebase objects for other scripts
export { app, db, storage };