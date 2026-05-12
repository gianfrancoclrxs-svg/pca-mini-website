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

/* ─────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────── */
function showTab(tab) {
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');

  if (tab === 'submissions') loadSubmissions();
  if (tab === 'feedbacks')   loadFeedbacks();
}

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function formatDate(val) {
  if (!val) return '';
  if (typeof val.toDate === 'function') return val.toDate().toLocaleString();
  return new Date(val).toLocaleString();
}

function makeCard(fields, deleteArgs) {
  // fields: [{label, value, isHtml}]
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.search = fields.map(f => f.value || '').join(' ').toLowerCase();

  fields.forEach(f => {
    const row = document.createElement('div');
    row.className = 'card-row';
    row.innerHTML = `<span class="card-label">${f.label}</span>`;
    const val = document.createElement('span');
    val.className = 'card-value';
    if (f.isHtml) val.innerHTML = f.value || '';
    else val.textContent = f.value || '';
    row.appendChild(val);
    card.appendChild(row);
  });

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  actions.innerHTML = `<button class="action-btn delete-btn" onclick="deleteRecord('${deleteArgs.collection}','${deleteArgs.id}','${deleteArgs.tab}')">Delete</button>`;
  card.appendChild(actions);
  return card;
}


/* ─────────────────────────────────────────
   SUBMISSIONS
───────────────────────────────────────── */
async function loadSubmissions() {
  const tbody = document.querySelector('#submissionsTable tbody');
  const cards = document.getElementById('submissionsCards');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px">Loading...</td></tr>';
  cards.innerHTML = '<div class="card" style="text-align:center;color:#888">Loading...</div>';

  try {
    const snapshot = await db.collection('submissions').orderBy('createdAt', 'desc').get();
    tbody.innerHTML = '';
    cards.innerHTML = '';

    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px">No submissions found.</td></tr>';
      cards.innerHTML = '<div class="card" style="text-align:center;color:#888">No submissions found.</div>';
      return;
    }

    snapshot.forEach(doc => {
      const d = doc.data();
      const dateStr = formatDate(d.createdAt);
      const pdfHtml = d.pdf
        ? `<a href="${d.pdf}" target="_blank" style="color:#0d6d05;word-break:break-all">${d.pdf}</a>`
        : '';

      // Desktop row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.applicant_id || ''}</td>
        <td>${d.fullname || ''}</td>
        <td>${d.form || ''}</td>
        <td>${d.contact || ''}</td>
        <td>${pdfHtml}</td>
        <td>${dateStr}</td>
        <td><button class="action-btn delete-btn" onclick="deleteRecord('submissions','${doc.id}','submissions')">Delete</button></td>
      `;
      tbody.appendChild(tr);

      // Mobile card
      cards.appendChild(makeCard([
        { label: 'Applicant ID', value: d.applicant_id },
        { label: 'Full Name',    value: d.fullname     },
        { label: 'Form',         value: d.form         },
        { label: 'Contact',      value: d.contact      },
        { label: 'PDF',          value: pdfHtml, isHtml: true },
        { label: 'Date',         value: dateStr        },
      ], { collection: 'submissions', id: doc.id, tab: 'submissions' }));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#c00;padding:20px">Error: ${err.message}</td></tr>`;
    cards.innerHTML = `<div class="card" style="color:#c00">Error: ${err.message}</div>`;
    console.error('loadSubmissions error:', err);
  }
}

/* ─────────────────────────────────────────
   FEEDBACKS
───────────────────────────────────────── */
async function loadFeedbacks() {
  const tbody = document.querySelector('#feedbacksTable tbody');
  const cards = document.getElementById('feedbacksCards');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:20px">Loading...</td></tr>';
  cards.innerHTML = '<div class="card" style="text-align:center;color:#888">Loading...</div>';

  try {
    const snapshot = await db.collection('feedbacks').orderBy('timestamp', 'desc').get();
    tbody.innerHTML = '';
    cards.innerHTML = '';

    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:20px">No feedbacks found.</td></tr>';
      cards.innerHTML = '<div class="card" style="text-align:center;color:#888">No feedbacks found.</div>';
      return;
    }

    snapshot.forEach(doc => {
      const d = doc.data();
      const dateStr = formatDate(d.timestamp);

      // Desktop row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.office || ''}</td>
        <td>${d.region || ''}</td>
        <td>${d.rating || ''}</td>
        <td>${d.comment || ''}</td>
        <td>${dateStr}</td>
        <td><button class="action-btn delete-btn" onclick="deleteRecord('feedbacks','${doc.id}','feedbacks')">Delete</button></td>
      `;
      tbody.appendChild(tr);

      // Mobile card
      cards.appendChild(makeCard([
        { label: 'Office',  value: d.office  },
        { label: 'Region',  value: d.region  },
        { label: 'Rating',  value: d.rating  },
        { label: 'Comment', value: d.comment },
        { label: 'Date',    value: dateStr   },
      ], { collection: 'feedbacks', id: doc.id, tab: 'feedbacks' }));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#c00;padding:20px">Error: ${err.message}</td></tr>`;
    cards.innerHTML = `<div class="card" style="color:#c00">Error: ${err.message}</div>`;
    console.error('loadFeedbacks error:', err);
  }
}

/* ─────────────────────────────────────────
   DELETE
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   FILTER (works for both table rows & cards)
───────────────────────────────────────── */
function filterTableRows(tableId, keyword) {
  keyword = keyword.toLowerCase();
  const table = document.getElementById(tableId);
  if (!table) return;
  Array.from(table.querySelector('tbody').rows).forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(keyword) ? '' : 'none';
  });
}

function filterCards(containerId, keyword) {
  keyword = keyword.toLowerCase();
  const container = document.getElementById(containerId);
  if (!container) return;
  Array.from(container.querySelectorAll('.card')).forEach(card => {
    card.style.display = (card.dataset.search || card.innerText.toLowerCase()).includes(keyword) ? '' : 'none';
  });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadSubmissions(); 
});