const firebaseConfig = {
  apiKey: "SECRET",
  authDomain: "pca-website-d2552.firebaseapp.com",
  projectId: "pca-website-d2552",
  storageBucket: "pca-website-d2552.appspot.com",
  messagingSenderId: "444810419373",
  appId: "1:444810419373:web:a5820613bd89fa7079fa24",
  measurementId: "G-E97QRFDBVB"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function loadForms() {
  const container = document.getElementById("formsContainer");
  container.innerHTML = "Loading forms...";

  try {
    const snapshot = await db.collection("forms").orderBy("type").get();

    if (snapshot.empty) {
      container.innerHTML = "<p>No forms available.</p>";
      return;
    }

    container.innerHTML = ""; 
    snapshot.forEach(doc => {
      const data = doc.data();
      const card = document.createElement("div");
      card.className = "post-card";

      card.innerHTML = `
        <p><strong>${data.title}</strong></p>
        <p>Category: ${data.type}</p>
        <p>Description: ${data.description || "N/A"}</p>
      `;

      if (data.fileBase64 && data.fileName) {
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "Download Form";
  downloadBtn.onclick = () => {
    // Convert base64 to blob
    const byteChars = atob(data.fileBase64);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArr[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArr], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      window.open(blobUrl, "_blank");
    } else {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    }
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

window.addEventListener("load", loadForms);