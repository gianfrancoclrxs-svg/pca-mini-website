const firebaseConfig = {
  apiKey: "SECRET",
  authDomain: "pca-website-d2552.firebaseapp.com",
  projectId: "pca-website-d2552",
  storageBucket: "pca-website-d2552.firebasestorage.app",
  messagingSenderId: "444810419373",
  appId: "1:444810419373:web:a5820613bd89fa7079fa24",
  measurementId: "G-E97QRFDBVB"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── STEP NAVIGATION ─────────────────────────────────────────────────────────

function goToStep2() {
  const required = ["lastName","firstName","address","email","phone","age","civilStatus","religion"];
  for (let id of required) {
    if (!document.getElementById(id).value.trim()) {
      alert("Please complete all required fields.");
      return;
    }
  }
  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "block";
}

function backToStep1() {
  document.getElementById("step2").style.display = "none";
  document.getElementById("step1").style.display = "block";
}

function editInfo() {
  document.getElementById("step3").style.display = "none";
  document.getElementById("step1").style.display = "block";
}

// ── CALENDAR ─────────────────────────────────────────────────────────────────

let selectedDate = "";
let currentDate  = new Date();

function generateCalendar() {
  const calendar  = document.getElementById("calendar");
  const dayLabels = document.getElementById("dayLabels");
  const monthLabel = document.getElementById("monthLabel");

  calendar.innerHTML  = "";
  dayLabels.innerHTML = "";

  // Day-of-week header labels
  ["Su","Mo","Tu","We","Th","Fr","Sa"].forEach(d => {
    const el = document.createElement("div");
    el.className   = "day-label";
    el.textContent = d;
    dayLabels.appendChild(el);
  });

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  monthLabel.innerText = `${monthNames[month]} ${year}`;

  const firstDay  = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Empty leading cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    const dow  = date.getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat
    const btn  = document.createElement("button");
    btn.textContent = i;

    const fmtDate =
      `${year}-${String(month + 1).padStart(2,"0")}-${String(i).padStart(2,"0")}`;

    if (date < today) {
      // Past dates — disabled red
      btn.classList.add("red");
      btn.disabled = true;

    } else if (dow === 0 || dow === 6) {
      // Weekends — disabled red
      btn.classList.add("red");
      btn.disabled = true;

    } else if (dow === 5) {
      // Friday — WFH per MC No. 114, disabled orange
      btn.classList.add("orange");
      btn.disabled = true;

    } else {
      // Mon–Thu — available green
      btn.classList.add("green");
      if (fmtDate === selectedDate) btn.classList.add("selected");

      btn.onclick = () => {
        document.querySelectorAll(".calendar button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedDate = fmtDate;
        document.getElementById("dateDisplay").innerText = "Selected: " + fmtDate;
      };
    }

    calendar.appendChild(btn);
  }
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  generateCalendar();
}

window.addEventListener("load", generateCalendar);

// ── HELPERS ──────────────────────────────────────────────────────────────────

function getValue(id) {
  return document.getElementById(id).value.trim() || "N/A";
}

// ── STEP 3: REVIEW ───────────────────────────────────────────────────────────

function goToStep3() {
  const purpose  = document.getElementById("purpose").value;
  const region   = document.getElementById("region").value;
  const timeSlot = document.getElementById("timeSlot").value;

  if (!purpose)      { alert("Please select a purpose.");    return; }
  if (!region)       { alert("Please select a region.");     return; }
  if (!selectedDate) { alert("Please select a date.");       return; }
  if (!timeSlot)     { alert("Please select a time slot.");  return; }

  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "block";

  const rows = [
    ["Name",     `${getValue("firstName")} ${getValue("middleName") !== "N/A" ? getValue("middleName") + " " : ""}${getValue("lastName")}${getValue("suffix") !== "N/A" ? " " + getValue("suffix") : ""}`],
    ["Address",  getValue("address")],
    ["Email",    getValue("email")],
    ["Phone",    getValue("phone")],
    ["Age",      getValue("age")],
    ["Status",   getValue("civilStatus")],
    ["Religion", getValue("religion")],
    ["__divider__", ""],
    ["Purpose",  purpose],
    ["Region",   region],
    ["Date",     selectedDate],
    ["Time",     timeSlot],
  ];

  document.getElementById("reviewData").innerHTML = rows.map(([label, val]) =>
    label === "__divider__"
      ? `<div class="divider"></div>`
      : `<div class="review-row">
           <span class="review-label">${label}</span>
           <span class="review-val">${val}</span>
         </div>`
  ).join("");
}

// ── SUBMIT ───────────────────────────────────────────────────────────────────

async function finalSubmit() {
  const data = {
    lastName:      getValue("lastName"),
    firstName:     getValue("firstName"),
    middleName:    getValue("middleName"),
    suffix:        getValue("suffix"),
    address:       getValue("address"),
    email:         getValue("email"),
    phone:         getValue("phone"),
    age:           parseInt(getValue("age")) || 0,
    civilStatus:   getValue("civilStatus"),
    religion:      getValue("religion"),
    purpose:       document.getElementById("purpose").value,
    region:        document.getElementById("region").value,
    timeSlot:      document.getElementById("timeSlot").value,
    scheduledDate: selectedDate,
    submittedAt:   firebase.firestore.FieldValue.serverTimestamp(),
    status:        "active"
  };

  try {
    const docRef = await db.collection("schedules").add(data);
    console.log("Document written with ID:", docRef.id);
    generatePDF(data);
    alert("Appointment confirmed!");
  } catch (error) {
    console.error("Error adding document:", error);
    alert("There was an error submitting your appointment. Check the console.");
  }
}

// ── PDF ───────────────────────────────────────────────────────────────────────

function generatePDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("PCA Appointment Confirmation", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${data.firstName} ${data.lastName}`,  20, 40);
  doc.text(`Purpose: ${data.purpose}`,                  20, 50);
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