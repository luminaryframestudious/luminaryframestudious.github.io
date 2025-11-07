// admin-samples.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
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

onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== "luminaryframestudios@gmail.com") {
    // redirect if not admin
    // (admin-dashboard.js also guards)
    // no action here
  } else {
    attachAdminHandlers();
  }
});

function attachAdminHandlers() {
  document.getElementById("uploadSampleBtn").addEventListener("click", async () => {
    const title = document.getElementById("sampleTitle").value.trim();
    const category = document.getElementById("sampleCategory").value;
    const price = Number(document.getElementById("samplePrice").value || 0);
    const fileEl = document.getElementById("sampleFile");
    const file = fileEl.files && fileEl.files[0];

    if (!title || !category || !file) {
      alert("Please provide title, category and a file.");
      return;
    }

    try {
      const safeName = `${Date.now()}_${file.name.replace(/\s+/g,"_")}`;
      const ref = storageRef(storage, `samples/${safeName}`);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);

      await addDoc(collection(db, "samples"), {
        title, category, price, url, createdAt: new Date().toISOString()
      });

      alert("Sample uploaded.");
      fileEl.value = "";
      document.getElementById("sampleTitle").value = "";
      document.getElementById("samplePrice").value = "";
      document.getElementById("sampleList").innerHTML = "";
      loadSamples();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  });

  // load samples
  async function loadSamples() {
    const list = document.getElementById("sampleList");
    const snap = await getDocs(collection(db, "samples"));
    list.innerHTML = "";
    snap.forEach(s => {
      const d = s.data();
      const el = document.createElement("div");
      el.style.marginBottom = "8px";
      el.innerHTML = `<strong>${d.title}</strong> — ${d.category} — ₹${d.price || 0} <a href="${d.url}" target="_blank">View</a>`;
      list.appendChild(el);
    });
  }

  loadSamples();
}