import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SECRET",
  authDomain: "pca-website-d2552.firebaseapp.com",
  projectId: "pca-website-d2552",
  storageBucket: "pca-website-d2552.firebasestorage.app",
  messagingSenderId: "444810419373",
  appId: "1:444810419373:web:a5820613bd89fa7079fa24",
  measurementId: "G-E97QRFDBVB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("submitFeedback").addEventListener("click", async () => {
  const office = document.getElementById("officeSelect").value;
  const comment = document.getElementById("comment").value;
  const rating = document.querySelectorAll("#starRating i.selected").length;

  if (rating === 0) {
    alert("Please select a rating!");
    return;
  }

  try {
    await addDoc(collection(db, "feedbacks"), {
      office,
      rating,
      comment,
      timestamp: serverTimestamp()
    });
    alert("Feedback submitted! Thank you.");
    document.getElementById("comment").value = "";
    document.querySelectorAll("#starRating i.selected").forEach(s => s.classList.remove("selected"));
  } catch (err) {
    console.error(err);
    alert("Error submitting feedback, try again.");
  }
});