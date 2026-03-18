// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyC12JnxSgSJPNxKO_XbmD28T78hSL1zq_c",
  authDomain: "pca-website-d2552.firebaseapp.com",
  projectId: "pca-website-d2552",
  storageBucket: "pca-website-d2552.firebasestorage.app",
  messagingSenderId: "444810419373",
  appId: "1:444810419373:web:a5820613bd89fa7079fa24",
  measurementId: "G-E97QRFDBVB"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------------- STEP NAVIGATION ----------------
function goToStep2() {
  const required = ["lastName","firstName","address","email","phone","age","civilStatus","religion"];
  for (let id of required) {
    if (!document.getElementById(id).value) {
      alert("Please complete all required fields");
      return;
    }
  }
  document.getElementById("step1").style.display = "none";
  document.getElementById("step2").style.display = "block";
}

function backToStep1() {
  document.getElementById("step1").style.display = "block";
  document.getElementById("step2").style.display = "none";
}

// ---------------- CALENDAR ----------------
let selectedDate = "";
let currentDate = new Date();

function generateCalendar() {
  const calendar = document.getElementById("calendar");
  const monthLabel = document.getElementById("monthLabel");
  calendar.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthLabel.innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Empty spots before first day
  for (let i=0;i<firstDay;i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  for (let i=1;i<=totalDays;i++) {
    const date = new Date(year, month, i);
    const day = date.getDay();
    const btn = document.createElement("button");
    btn.textContent = i;

    // Disable past dates
    if(date < today) {
      btn.classList.add("red");
      btn.disabled = true;
    }
    // Mon-Thu green
    else if(day >= 1 && day <= 4) {
      btn.classList.add("green");
      btn.onclick = () => {
        document.querySelectorAll(".calendar button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        const formattedMonth = String(month+1).padStart(2,'0');
        const formattedDay = String(i).padStart(2,'0');
        selectedDate = `${year}-${formattedMonth}-${formattedDay}`;
        document.getElementById("selectedDateText").innerText = "Selected Date: "+selectedDate;
      };
    }
    else { // Fri-Sun red
      btn.classList.add("red");
      btn.disabled = true;
    }

    calendar.appendChild(btn);
  }
}

function changeMonth(direction) {
  currentDate.setMonth(currentDate.getMonth() + direction);
  generateCalendar();
}

window.addEventListener("load", generateCalendar);

// ---------------- STEP 3 REVIEW ----------------
function getValue(id) {
  return document.getElementById(id).value || "N/A";
}

function goToStep3() {
  const region = document.getElementById("region").value;
  const timeSlot = document.getElementById("timeSlot").value;
  if(!region || !timeSlot || !selectedDate) {
    alert("Please complete schedule details");
    return;
  }

  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "block";

  const review = document.getElementById("reviewData");
  review.innerHTML = `
    <p><b>Name:</b> ${getValue("firstName")} ${getValue("lastName")}</p>
    <p><b>Address:</b> ${getValue("address")}</p>
    <p><b>Email:</b> ${getValue("email")}</p>
    <p><b>Phone:</b> ${getValue("phone")}</p>
    <p><b>Age:</b> ${getValue("age")}</p>
    <p><b>Status:</b> ${getValue("civilStatus")}</p>
    <p><b>Religion:</b> ${getValue("religion")}</p>
    <hr>
    <p><b>Region:</b> ${region}</p>
    <p><b>Date:</b> ${selectedDate}</p>
    <p><b>Time:</b> ${timeSlot}</p>
  `;
}

function editInfo() {
  document.getElementById("step3").style.display = "none";
  document.getElementById("step1").style.display = "block";
}

// ---------------- FINAL SUBMIT ----------------
async function finalSubmit() {
  const data = {
    lastName: getValue("lastName"),
    firstName: getValue("firstName"),
    middleName: getValue("middleName") || "N/A",
    suffix: getValue("suffix") || "N/A",
    address: getValue("address"),
    email: getValue("email"),
    phone: getValue("phone"),
    age: parseInt(getValue("age")) || 0,
    civilStatus: getValue("civilStatus"),
    religion: getValue("religion"),
    region: document.getElementById("region").value,
    timeSlot: document.getElementById("timeSlot").value,
    scheduledDate: selectedDate, // keep as string or convert to timestamp if you want
    submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: "active"
  };

  try {
    const docRef = await db.collection("schedules").add(data);
    console.log("Document written with ID: ", docRef.id);
    generatePDF(data);
    alert("Appointment confirmed!");
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("There was an error submitting your appointment. Check console.");
  }
}

// ---------------- PDF ----------------
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

    doc.text("Status: COMPLETE PAYMENT", 20, 90);
    doc.text("You may proceed on your scheduled date.", 20, 100);

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