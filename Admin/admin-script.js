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

function showTab(tab) {
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');

  if (tab === 'schedules') loadSchedules();
  if (tab === 'feedbacks') loadFeedbacks();
  if (tab === 'forms') loadForms();
}

async function loadSchedules() {
  const tbody = document.querySelector('#schedulesTable tbody');
  tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';
  try {
    const snapshot = await db.collection('schedules').orderBy('submittedAt', 'desc').get();
    tbody.innerHTML = '';
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="8">No schedules found.</td></tr>';
      return;
    }
    snapshot.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.firstName || ''} ${d.lastName || ''}</td>
        <td>${d.email || ''}</td>
        <td>${d.phone || ''}</td>
        <td>${d.region || ''}</td>
        <td>${d.scheduledDate || ''}</td>
        <td>${d.timeSlot || ''}</td>
        <td>${d.status || 'active'}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editSchedule('${doc.id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteRecord('schedules', '${doc.id}', 'schedules')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8">Error loading schedules: ${err.message}</td></tr>`;
    console.error('loadSchedules error:', err);
  }
}

async function loadFeedbacks() {
  const tbody = document.querySelector('#feedbacksTable tbody');
  tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  try {
    const snapshot = await db.collection('feedbacks').orderBy('timestamp', 'desc').get();
    tbody.innerHTML = '';
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="5">No feedbacks found.</td></tr>';
      return;
    }
    snapshot.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement('tr');
      // Safely handle Firestore Timestamp or plain date
      let dateStr = '';
      if (d.timestamp && typeof d.timestamp.toDate === 'function') {
        dateStr = d.timestamp.toDate().toLocaleString();
      } else if (d.timestamp) {
        dateStr = String(d.timestamp);
      }
      tr.innerHTML = `
        <td>${d.office || ''}</td>
        <td>${d.rating || ''}</td>
        <td>${d.comment || ''}</td>
        <td>${dateStr}</td>
        <td>
          <button class="action-btn delete-btn" onclick="deleteRecord('feedbacks', '${doc.id}', 'feedbacks')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Error loading feedbacks: ${err.message}</td></tr>`;
    console.error('loadFeedbacks error:', err);
  }
}

async function loadForms() {
  const tbody = document.querySelector('#formsTable tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  try {
    const snapshot = await db.collection('forms').orderBy('title').get();
    tbody.innerHTML = '';
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="4">No forms found.</td></tr>';
      return;
    }
    snapshot.forEach(doc => {
      const d = doc.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.title || ''}</td>
        <td>${d.type || ''}</td>
        <td>
          ${d.fileBase64
            ? `<a href="data:application/pdf;base64,${d.fileBase64}" download="${d.fileName || 'form.pdf'}">Download</a>`
            : d.fileURL
              ? `<a href="${d.fileURL}" target="_blank" rel="noopener">Download</a>`
              : 'No file'}
        </td>
        <td>
          <button class="action-btn edit-btn" onclick="editForm('${doc.id}')">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteRecord('forms', '${doc.id}', 'forms')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error loading forms: ${err.message}</td></tr>`;
    console.error('loadForms error:', err);
  }
}

// FIXED: renamed to avoid conflict with the built-in deleteDoc from Firestore SDK
async function deleteRecord(collection, id, tab) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    await db.collection(collection).doc(id).delete();
    alert('Deleted successfully!');
    showTab(tab);
  } catch (err) {
    alert('Delete failed: ' + err.message);
    console.error('deleteRecord error:', err);
  }
}

function filterTable(tableId, keyword) {
  keyword = keyword.toLowerCase();
  const table = document.getElementById(tableId);
  Array.from(table.getElementsByTagName('tbody')[0].getElementsByTagName('tr'))
    .forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(keyword) ? '' : 'none';
    });
}

function editSchedule(id) { alert('Edit schedule feature coming soon. ID: ' + id); }
function editForm(id) { alert('Edit form feature coming soon. ID: ' + id); }

async function submitForm() {
  const fileInput = document.getElementById('formFile');
  const file = fileInput.files[0];
  const statusEl = document.getElementById('uploadStatus');

  if (!file) { statusEl.textContent = 'Please select a PDF file.'; return; }
  if (file.type !== 'application/pdf') { statusEl.textContent = 'Only PDF files are allowed.'; return; }
  if (file.size > 750 * 1024) {
    statusEl.textContent = `❌ File is ${(file.size / 1024).toFixed(0)}KB — too large. Please compress to under 750KB using ilovepdf.com/compress_pdf`;
    return;
  }

  const title = document.getElementById('formTitle').value.trim();
  const type  = document.getElementById('formCategory').value.trim();
  const description = document.getElementById('formDescription').value.trim();

  if (!title || !type) { statusEl.textContent = 'Title and Type are required.'; return; }

  statusEl.textContent = '📄 Reading file...';

  const reader = new FileReader();
  reader.onerror = () => { statusEl.textContent = '❌ Failed to read file.'; };
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    statusEl.textContent = '💾 Saving to database...';
    try {
      await db.collection('forms').add({
        title,
        type,
        description,
        fileBase64: base64,
        fileName: file.name,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      statusEl.textContent = '✅ Form uploaded successfully!';
      document.getElementById('uploadForm').reset();
      loadForms();
    } catch (err) {
      console.error('Upload error:', err);
      if (err.code === 'resource-exhausted') {
        statusEl.textContent = '❌ File too large for Firestore. Please keep PDFs under 700KB.';
      } else {
        statusEl.textContent = '❌ Upload failed: ' + err.message;
      }
    }
  };
  reader.readAsDataURL(file);
}

// Wait for DOM before attaching listener
document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm();
    });
  }
  // Load initial tab
  loadSchedules();
});