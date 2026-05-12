const firebaseConfig = {
  apiKey: "SECRET",
  authDomain: "pca-website-d2552.firebaseapp.com",
  projectId: "pca-website-d2552",
  storageBucket: "pca-website-d2552.firebasestorage.app",
  messagingSenderId: "444810419373",
  appId: "1:444810419373:web:a5820613bd89fa7079fa24",
  measurementId: "G-E97QRFDBVB"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── SEARCH ────────────────────────────────────────────────────────────────────

async function searchAppointments() {
  const phone   = document.getElementById("phoneInput").value.trim();
  const results = document.getElementById("results");

  if (!phone) {
    alert("Please enter a phone number.");
    return;
  }

  results.innerHTML = `<p class="state-msg">Searching…</p>`;

  try {
    const snapshot = await db.collection("schedules")
      .where("phone", "==", phone)
      .get();

    if (snapshot.empty) {
      results.innerHTML = `<p class="state-msg">No appointments found for this phone number.</p>`;
      return;
    }

    results.innerHTML = "";
    const docs = [];
    snapshot.forEach(doc => docs.push({ id: doc.id, data: doc.data() }));
    docs.sort((a, b) => (b.data.scheduledDate || "").localeCompare(a.data.scheduledDate || ""));
    docs.forEach(({ id, data }) => results.appendChild(buildCard(id, data)));

  } catch (err) {
    console.error("Search error:", err);
    results.innerHTML = `<p class="state-msg">Error fetching appointments. Please try again.</p>`;
  }
}

// ── BUILD CARD ────────────────────────────────────────────────────────────────

function buildCard(id, d) {
  const statusClass =
    d.status === "cancelled" ? "status-cancelled" :
    d.status === "done"      ? "status-done"      :
                               "status-active";

  const statusLabel =
    d.status === "cancelled" ? "Cancelled" :
    d.status === "done"      ? "Completed" :
                               "Active";

  const fullName = [d.firstName, d.middleName !== "N/A" ? d.middleName : "", d.lastName, d.suffix !== "N/A" ? d.suffix : ""]
    .filter(Boolean).join(" ");

  const card = document.createElement("div");
  card.className = "appt-card";
  card.innerHTML = `
    <div class="appt-name">${fullName}</div>
    <span class="status-badge ${statusClass}">${statusLabel}</span>
    <div class="divider"></div>
    ${row("Purpose",  d.purpose      || "N/A")}
    ${row("Date",     d.scheduledDate|| "N/A")}
    ${row("Time",     d.timeSlot     || "N/A")}
    ${row("Region",   d.region       || "N/A")}
    ${row("Address",  d.address      || "N/A")}
    ${row("Email",    d.email        || "N/A")}
    ${row("Phone",    d.phone        || "N/A")}
    <div class="actions">
      <button class="view-btn"   onclick="viewDetails('${id}')">Details</button>
      <button class="pdf-btn"    onclick="downloadPDF('${id}')">PDF</button>
      <button class="cancel-btn" onclick="cancelAppointment('${id}', this)">Cancel</button>
    </div>
  `;
  return card;
}

function row(label, val) {
  return `<div class="appt-row">
    <span class="appt-label">${label}</span>
    <span class="appt-val">${val}</span>
  </div>`;
}

// ── CANCEL ────────────────────────────────────────────────────────────────────

async function cancelAppointment(id, btn) {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  try {
    await db.collection("schedules").doc(id).update({ status: "cancelled" });
    alert("Appointment cancelled.");
    // Refresh search results
    searchAppointments();
  } catch (err) {
    console.error("Cancel error:", err);
    alert("Failed to cancel. Please try again.");
  }
}

// ── VIEW DETAILS (expand card) ────────────────────────────────────────────────

async function viewDetails(id) {
  try {
    const doc = await db.collection("schedules").doc(id).get();
    if (!doc.exists) { alert("Appointment not found."); return; }
    const d = doc.data();
    const msg = [
      `Name:     ${[d.firstName, d.middleName, d.lastName, d.suffix].filter(v => v && v !== "N/A").join(" ")}`,
      `Purpose:  ${d.purpose      || "N/A"}`,
      `Date:     ${d.scheduledDate|| "N/A"}`,
      `Time:     ${d.timeSlot     || "N/A"}`,
      `Region:   ${d.region       || "N/A"}`,
      `Address:  ${d.address      || "N/A"}`,
      `Email:    ${d.email        || "N/A"}`,
      `Phone:    ${d.phone        || "N/A"}`,
      `Age:      ${d.age          || "N/A"}`,
      `Status:   ${d.civilStatus  || "N/A"}`,
      `Religion: ${d.religion     || "N/A"}`,
      `Status:   ${d.status       || "active"}`,
    ].join("\n");
    alert(msg);
  } catch (err) {
    console.error("View error:", err);
  }
}

// ── PDF ───────────────────────────────────────────────────────────────────────

async function downloadPDF(id) {
  try {
    const doc = await db.collection("schedules").doc(id).get();
    if (!doc.exists) { alert("Appointment not found."); return; }
    generatePDF(doc.data());
  } catch (err) {
    console.error("PDF error:", err);
    alert("Failed to generate PDF.");
  }
}

function generatePDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("PCA Appointment Confirmation", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${data.firstName} ${data.lastName}`,  20, 40);
  doc.text(`Purpose: ${data.purpose || "N/A"}`,         20, 50);
  doc.text(`Date: ${data.scheduledDate}`,               20, 60);
  doc.text(`Time: ${data.timeSlot}`,                    20, 70);
  doc.text(`Region: ${data.region}`,                    20, 80);

  doc.text("Status: COMPLETE PAYMENT",                  20, 95);
  doc.text("You may proceed on your scheduled date.",   20, 105);

  doc.addPage();
  doc.text("DATA PRIVACY NOTICE", 20, 20);
  doc.text(
    "In compliance with Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012, " +
    "the Philippine Coconut Authority (PCA) provides this privacy notice to inform you about the " +
    "collection and processing of your personal information through this form.",
    20, 40, { maxWidth: 170 }
  );
  doc.text(
    "Purpose of Data Collection:\nThe personal information collected will be used for documentation " +
    "purposes. We ensure that your data is processed fairly and lawfully.",
    20, 70, { maxWidth: 170 }
  );
  doc.text(
    "Data Retention:\nYour personal data will be retained only for as long as necessary to fulfill " +
    "the purposes for which it was collected or as required by law.",
    20, 100, { maxWidth: 170 }
  );
  doc.text(
    "Your Rights:\n- Be informed about how your data is being used.\n" +
    "- Access your personal information.\n" +
    "- Rectify any inaccuracies in your data.\n" +
    "- Request the deletion of your personal information under certain conditions.",
    20, 130, { maxWidth: 170 }
  );
  doc.text(
    "Data Security:\nWe implement appropriate security measures to protect your personal data " +
    "from unauthorized access, disclosure, or misuse.",
    20, 180, { maxWidth: 170 }
  );
  doc.text(
    "Contact Information:\nFor inquiries regarding this privacy notice or to exercise your rights, " +
    "please contact our Data Protection Officer at gianfranco.clrxs@gmail.com.",
    20, 210, { maxWidth: 170 }
  );
  doc.text(
    "By providing your personal information, you consent to its collection and processing " +
    "as described in this notice.",
    20, 240, { maxWidth: 170 }
  );

  doc.save("appointment.pdf");
}

// Allow Enter key to trigger search
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("phoneInput").addEventListener("keydown", e => {
    if (e.key === "Enter") searchAppointments();
  });
});