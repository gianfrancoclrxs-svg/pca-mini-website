// FIREBASE CONFIG
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

// ---------- TABS ----------
function showTab(tab) {
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');

  if(tab === 'schedules') loadSchedules();
  if(tab === 'feedbacks') loadFeedbacks();
  if(tab === 'forms') loadForms();
}

// ---------- LOAD DATA ----------
async function loadSchedules() {
  const tbody = document.querySelector('#schedulesTable tbody');
  tbody.innerHTML = '';
  const snapshot = await db.collection('schedules').orderBy('submittedAt', 'desc').get();
  snapshot.forEach(doc => {
    const d = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.firstName} ${d.lastName}</td>
      <td>${d.email}</td>
      <td>${d.phone}</td>
      <td>${d.region}</td>
      <td>${d.scheduledDate}</td>
      <td>${d.timeSlot}</td>
      <td>${d.status || 'active'}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editSchedule('${doc.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteDoc('schedules','${doc.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadFeedbacks() {
  const tbody = document.querySelector('#feedbacksTable tbody');
  tbody.innerHTML = '';
  const snapshot = await db.collection('feedbacks').orderBy('timestamp', 'desc').get();
  snapshot.forEach(doc => {
    const d = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.office}</td>
      <td>${d.rating}</td>
      <td>${d.comment}</td>
      <td>${d.timestamp.toDate().toLocaleString()}</td>
      <td>
        <button class="action-btn delete-btn" onclick="deleteDoc('feedbacks','${doc.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadForms() {
  const tbody = document.querySelector('#formsTable tbody');
  tbody.innerHTML = '';
  const snapshot = await db.collection('forms').orderBy('title').get();
  snapshot.forEach(doc => {
    const d = doc.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${d.title}</td>
      <td>${d.type}</td>
      <td><a href="${d.fileURL}" target="_blank">Download</a></td>
      <td>
        <button class="action-btn edit-btn" onclick="editForm('${doc.id}')">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteDoc('forms','${doc.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------- DELETE DOCUMENT ----------
async function deleteDoc(collection, id) {
  if(confirm("Are you sure you want to delete this record?")) {
    await db.collection(collection).doc(id).delete();
    alert("Deleted!");
    showTab(collection === 'schedules' ? 'schedules' : collection === 'feedbacks' ? 'feedbacks' : 'forms');
  }
}

// ---------- SEARCH TABLE ----------
function filterTable(tableId, keyword) {
  keyword = keyword.toLowerCase();
  const table = document.getElementById(tableId);
  Array.from(table.getElementsByTagName('tbody')[0].getElementsByTagName('tr'))
    .forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(keyword) ? '' : 'none';
    });
}

// ---------- EDIT FUNCTIONS (Optional for later) ----------
function editSchedule(id) { alert("Edit schedule feature to implement."); }
function editForm(id) { alert("Edit form feature to implement."); }