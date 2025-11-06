// ---------- ADMIN-SAMPLES.JS ----------
// LuminaryFrame Studios - Admin Sample Manager

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

import { app } from "./script.js";

const db = getFirestore(app);
const storage = getStorage(app);

const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const sampleList = document.getElementById("sampleList");

// ---------- Upload new sample ----------
uploadBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const price = priceInput.value;
  const file = fileInput.files[0];

  if (!title || !category || !price || !file) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill all fields and select a file before uploading.",
    });
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  try {
    // Upload file to Firebase Storage
    const fileRef = ref(storage, `samples/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const fileURL = await getDownloadURL(fileRef);

    // Add document to Firestore
    await addDoc(collection(db, "samples"), {
      title,
      category,
      price,
      fileURL,
      createdAt: serverTimestamp()
    });

    Swal.fire({
      icon: "success",
      title: "Upload Successful!",
      text: "Your sample has been uploaded successfully.",
      timer: 1500,
      showConfirmButton: false
    });

    // Reset form
    titleInput.value = "";
    categoryInput.value = "";
    priceInput.value = "";
    fileInput.value = "";

    // Reload sample list
    loadSamples();
  } catch (error) {
    console.error("Error uploading sample:", error);
    Swal.fire({
      icon: "error",
      title: "Upload Failed",
      text: error.message || "Please try again.",
    });
  }

  uploadBtn.disabled = false;
  uploadBtn.textContent = "Upload Sample";
});

// ---------- Load samples ----------
async function loadSamples() {
  sampleList.innerHTML = "<p>Loading samples...</p>";

  try {
    const snapshot = await getDocs(collection(db, "samples"));
    if (snapshot.empty) {
      sampleList.innerHTML = "<p>No samples uploaded yet.</p>";
      return;
    }

    let html = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isVideo =
        data.fileURL.includes(".mp4") ||
        data.fileURL.includes("video") ||
        data.fileURL.includes("mov");

      const mediaTag = isVideo
        ? `<video controls style="width:100%;border-radius:8px;"><source src="${data.fileURL}" type="video/mp4"></video>`
        : `<img src="${data.fileURL}" alt="${data.title}" style="width:100%;border-radius:8px;" />`;

      html += `
        <div class="sample-card">
          ${mediaTag}
          <h3>${data.title}</h3>
          <p>${data.category} — ₹${data.price}</p>
          <button class="delete-btn" onclick="deleteSample('${docSnap.id}')">🗑️ Delete</button>
        </div>
      `;
    });

    sampleList.innerHTML = html;
  } catch (err) {
    console.error("Error loading samples:", err);
    sampleList.innerHTML = "<p>Failed to load samples.</p>";
  }
}

// ---------- Delete sample ----------
window.deleteSample = async (id) => {
  const confirmDelete = await Swal.fire({
    title: "Delete this sample?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff4d4d",
    cancelButtonColor: "#2a2a2a",
    confirmButtonText: "Yes, delete it",
  });

  if (confirmDelete.isConfirmed) {
    try {
      await deleteDoc(doc(db, "samples", id));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Sample has been deleted.",
        timer: 1200,
        showConfirmButton: false,
      });
      loadSamples();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error deleting sample",
        text: err.message,
      });
    }
  }
};

// ---------- Initialize ----------
document.addEventListener("DOMContentLoaded", loadSamples);