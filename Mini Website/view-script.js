// Make all functions global by attaching to window
window.viewScript = (() => {
  // ---------------- FIREBASE ----------------
  const firebaseConfig = {
    apiKey: "AIzaSyC12JnxSgSJPNxKO_XbmD28T78hSL1zq_c",
    authDomain: "pca-website-d2552.firebaseapp.com",
    projectId: "pca-website-d2552",
    storageBucket: "pca-website-d2552.firebasestorage.app",
    messagingSenderId: "444810419373",
    appId: "1:444810419373:web:a5820613bd89fa7079fa24",
    measurementId: "G-E97QRFDBVB"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // ---------------- SEARCH FUNCTION ----------------
  async function searchAppointments() {
    const phone = document.getElementById("phoneInput").value.trim();
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "Loading...";

    if (!phone) {
      resultsDiv.innerHTML = "<p>Please enter a phone number.</p>";
      return;
    }

    try {
      const snapshot = await db.collection("schedules")
        .where("phone", "==", phone)
        .get();

      if (snapshot.empty) {
        resultsDiv.innerHTML = "<p>No appointments found.</p>";
        return;
      }

      resultsDiv.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <p><strong>${data.firstName} ${data.lastName}</strong></p>
          <p>📅 ${data.scheduledDate}</p>
          <p>🕒 ${data.timeSlot}</p>
          <p>📍 ${data.region}</p>
          <p>Status: ${data.status || "active"}</p>
        `;

        const actions = document.createElement("div");
        actions.className = "actions";

        // VIEW
        const viewBtn = document.createElement("button");
        viewBtn.textContent = "View";
        viewBtn.className = "view-btn";
        viewBtn.onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("PCA Appointment Confirmation", 20, 20);

        doc.setFontSize(12);
        doc.text(`Name: ${data.firstName} ${data.lastName}`, 20, 40);
        doc.text(`Date: ${data.scheduledDate}`, 20, 50);
        doc.text(`Time: ${data.timeSlot}`, 20, 60);
        doc.text(`Region: ${data.region}`, 20, 70);
        doc.text(`Status: COMPLETE PAYMENT`, 20, 90);
        doc.text(`You are scheduled. Proceed on your appointment date.`, 20, 100);

        // PAGE 2 (Data Privacy)
        doc.addPage();
        doc.text("DATA PRIVACY NOTICE", 20, 20);
        doc.text(
            "In compliance with Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012, the Philippine Coconut Authority (PCA) provides this privacy notice to inform you about the collection and processing of your personal information through this form.",
            20,
            40,
            { maxWidth: 170 }
        );
        doc.text(
            "Purpose of Data Collection:\nThe personal information collected will be used for documentation purposes. We ensure that your data is processed fairly and lawfully.",
            20,
            70,
            { maxWidth: 170 }
        );
        doc.text(
            "Data Retention:\nYour personal data will be retained only for as long as necessary to fulfill the purposes for which it was collected or as required by law.",
            20,
            100,
            { maxWidth: 170 }
        );
        doc.text(
            "Your Rights:\n- Be informed about how your data is being used.\n- Access your personal information.\n- Rectify any inaccuracies in your data.\n- Request the deletion of your personal information under certain conditions.",
            20,
            130,
            { maxWidth: 170 }
        );
        doc.text(
            "Data Security:\nWe implement appropriate security measures to protect your personal data from unauthorized access, disclosure, or misuse.",
            20,
            180,
            { maxWidth: 170 }
        );
        doc.text(
            "Contact Information:\nFor inquiries regarding this privacy notice or to exercise your rights, please contact our Data Protection Officer at gianfranco.clrxs@gmail.com.",
            20,
            210,
            { maxWidth: 170 }
        );
        doc.text(
            "By providing your personal information, you consent to its collection and processing as described in this notice.",
            20,
            240,
            { maxWidth: 170 }
        );

        // Open PDF in a new tab
        doc.output('dataurlnewwindow');
        };

        // PDF
        const pdfBtn = document.createElement("button");
        pdfBtn.textContent = "PDF";
        pdfBtn.className = "pdf-btn";
        pdfBtn.style.backgroundColor = "#00f83e"; // bright blue background
        pdfBtn.style.color = "#fff"; // white text
        pdfBtn.style.border = "none";
        pdfBtn.style.padding = "6px 12px";
        pdfBtn.style.borderRadius = "4px";
        pdfBtn.style.cursor = "pointer";
        pdfBtn.style.marginLeft = "5px";
        pdfBtn.onclick = () => generatePDF(data);

        // CANCEL
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.className = "cancel-btn";
        cancelBtn.onclick = async () => {
          await db.collection("schedules").doc(doc.id).update({ status: "cancelled" });
          alert("Appointment cancelled");
          searchAppointments(); // refresh
        };

        actions.appendChild(viewBtn);
        actions.appendChild(pdfBtn);
        actions.appendChild(cancelBtn);

        card.appendChild(actions);
        resultsDiv.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = "<p>Error loading appointments.</p>";
    }
  }

  // ---------------- PDF FUNCTION ----------------
  function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("PCA Appointment Confirmation", 20, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${data.firstName} ${data.lastName}`, 20, 40);
    doc.text(`Date: ${data.scheduledDate}`, 20, 50);
    doc.text(`Time: ${data.timeSlot}`, 20, 60);
    doc.text(`Region: ${data.region}`, 20, 70);
    doc.text(`Status: COMPLETE PAYMENT`, 20, 90);
    doc.text(`You are scheduled. Proceed on your appointment date.`, 20, 100);

    // PAGE 2 (Data Privacy)
    doc.addPage();
    doc.text("DATA PRIVACY NOTICE", 20, 20);
    doc.text(
        "In compliance with Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012, the Philippine Coconut Authority (PCA) provides this privacy notice to inform you about the collection and processing of your personal information through this form.",
        20,
        40,
        { maxWidth: 170 }
    );
    doc.text(
        "Purpose of Data Collection:\nThe personal information collected will be used for documentation purposes. We ensure that your data is processed fairly and lawfully.",
        20,
        70,
        { maxWidth: 170 }
    );
    doc.text(
        "Data Retention:\nYour personal data will be retained only for as long as necessary to fulfill the purposes for which it was collected or as required by law.",
        20,
        100,
        { maxWidth: 170 }
    );
    doc.text(
        "Your Rights:\n- Be informed about how your data is being used.\n- Access your personal information.\n- Rectify any inaccuracies in your data.\n- Request the deletion of your personal information under certain conditions.",
        20,
        130,
        { maxWidth: 170 }
    );
    doc.text(
        "Data Security:\nWe implement appropriate security measures to protect your personal data from unauthorized access, disclosure, or misuse.",
        20,
        180,
        { maxWidth: 170 }
    );
    doc.text(
        "Contact Information:\nFor inquiries regarding this privacy notice or to exercise your rights, please contact our Data Protection Officer at gianfranco.clrxs@gmail.com.",
        20,
        210,
        { maxWidth: 170 }
    );
    doc.text(
        "By providing your personal information, you consent to its collection and processing as described in this notice.",
        20,
        240,
        { maxWidth: 170 }
    );

    doc.save("appointment.pdf");
  }

  // Expose functions globally
  return { searchAppointments, generatePDF };
})();
window.searchAppointments = window.viewScript.searchAppointments;
window.generatePDF = window.viewScript.generatePDF;