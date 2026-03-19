// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "SECRET",
  authDomain: "pca-website-d2552.firebaseapp.com",
  projectId: "pca-website-d2552",
  storageBucket: "pca-website-d2552.appspot.com",
  messagingSenderId: "444810419373",
  appId: "1:444810419373:web:a5820613bd89fa7079fa24",
  measurementId: "G-E97QRFDBVB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// FETCH FORMS FROM DATABASE
async function loadForms() {
  const container = document.getElementById("formsContainer");
  container.innerHTML = "Loading forms...";

  try {
    // Order by 'type' to match your admin upload field
    const snapshot = await db.collection("forms").orderBy("type").get();

    if (snapshot.empty) {
      container.innerHTML = "<p>No forms available.</p>";
      return;
    }

    container.innerHTML = ""; // clear loading

    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "post-card";

      card.innerHTML = `
        <p><strong>${data.title}</strong></p>
        <p>Category: ${data.type}</p>
        <p>Description: ${data.description || "N/A"}</p>
      `;

      // Add download button if Base64 file exists
      if (data.fileBase64 && data.fileName) {
        const downloadBtn = document.createElement("button");
        downloadBtn.textContent = "Download Form";
        downloadBtn.onclick = () => {
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${data.fileBase64}`;
            link.download = data.fileName;
            document.body.appendChild(link); // append to DOM
            link.click();                    // trigger download
            document.body.removeChild(link); // clean up
        };
        card.appendChild(downloadBtn);
    }
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading forms:", error);
    container.innerHTML = "<p>Error loading forms.</p>";
  }
}

// LOAD FORMS ON PAGE LOAD
window.addEventListener("load", loadForms);