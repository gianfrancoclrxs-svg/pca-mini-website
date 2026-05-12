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
  const region = document.getElementById("regionSelect").value;
  const office = document.getElementById("officeSelect").value;
  const comment = document.getElementById("comment").value;

  // Read rating from checked radio input
  const checkedStar = document.querySelector('#starRating input[name="rating"]:checked');
  const rating = checkedStar ? parseInt(checkedStar.value) : 0;

  if (!region) {
    alert("Please select a region!");
    return;
  }

  if (!office) {
    alert("Please select an office!");
    return;
  }

  if (rating === 0) {
    alert("Please select a rating!");
    return;
  }

  try {
    await addDoc(collection(db, "feedbacks"), {
      region,
      office,
      rating,
      comment,
      timestamp: serverTimestamp()
    });

    alert("Feedback submitted! Thank you.");

    // Reset form
    document.getElementById("regionSelect").value = "";
    document.getElementById("officeSelect").innerHTML =
      '<option value="">-- Select Office --</option>';
    document.getElementById("officeSelect").disabled = true;

    document.getElementById("comment").value = "";

    if (checkedStar) checkedStar.checked = false;

    document.getElementById("ratingHint").textContent =
      "Tap a star to rate";

  } catch (err) {
    console.error(err);
    alert("Error submitting feedback, try again.");
  }
});