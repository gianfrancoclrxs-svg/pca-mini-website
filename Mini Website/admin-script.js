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
   STATE
───────────────────────────────────────── */
var allSubmissions = [];
var allFeedbacks   = [];
var activeSubTab   = 'all';
var activeFilters  = { rating: 'all', region: 'all', office: 'all' };
var pendingFilters = { rating: 'all', region: 'all', office: 'all' };

/* ─────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────── */
function showTab(tab) {
  document.querySelectorAll('nav button').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('section').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById(tab).classList.add('active');
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
  if (tab === 'submissions') loadSubmissions();
  if (tab === 'feedbacks')   loadFeedbacks();
}

/* ─────────────────────────────────────────
   SUBMISSIONS SUB-TABS
───────────────────────────────────────── */
function setSubTab(tab) {
  activeSubTab = tab;
  document.querySelectorAll('.sub-tab').forEach(function(el) { el.classList.remove('active'); });
  event.target.classList.add('active');
  renderSubmissions();
}

function formCategory(formName) {
  if (!formName) return 'other';
  var lower = formName.toLowerCase();
  if (lower.indexOf('meeting') !== -1) return 'meeting';
  if (lower.indexOf('ncfrs') !== -1 || lower.indexOf('enroll') !== -1) return 'enrollment';
  return 'other';
}

function renderSubmissions() {
  var tbody = document.querySelector('#submissionsTable tbody');
  var cards = document.getElementById('submissionsCards');
  tbody.innerHTML = '';
  cards.innerHTML = '';

  var filtered = allSubmissions.filter(function(item) {
    if (activeSubTab === 'all') return true;
    return formCategory(item.d.form) === activeSubTab;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px">No submissions found.</td></tr>';
    cards.innerHTML = '<div class="card" style="text-align:center;color:#888">No submissions found.</div>';
    return;
  }

  filtered.forEach(function(item) {
    var d = item.d;
    var docId = item.id;
    var dateStr = formatDate(d.createdAt);
    var pdfHtml = d.pdf ? '<a href="' + d.pdf + '" target="_blank" style="color:#0d6d05;word-break:break-all">' + d.pdf + '</a>' : '';
    var cat = formCategory(d.form);
    var formLabel = cat === 'meeting' ? 'Meeting Scheduler' : cat === 'enrollment' ? 'NCFRS Enrollment' : (d.form || '');

    var tr = document.createElement('tr');
    tr.dataset.search = [d.applicant_id, d.fullname, formLabel, d.contact, dateStr].join(' ').toLowerCase();
    tr.innerHTML =
      '<td>' + (d.applicant_id || '') + '</td>' +
      '<td>' + (d.fullname || '') + '</td>' +
      '<td>' + formLabel + '</td>' +
      '<td>' + (d.contact || '') + '</td>' +
      '<td>' + pdfHtml + '</td>' +
      '<td>' + dateStr + '</td>' +
      '<td><button class="action-btn delete-btn" onclick="deleteRecord(\'submissions\',\'' + docId + '\',\'submissions\')">Delete</button></td>';
    tbody.appendChild(tr);

    cards.appendChild(makeCard([
      { label: 'Applicant ID', value: d.applicant_id },
      { label: 'Full Name',    value: d.fullname     },
      { label: 'Form',         value: formLabel       },
      { label: 'Contact',      value: d.contact      },
      { label: 'PDF',          value: pdfHtml, isHtml: true },
      { label: 'Date',         value: dateStr        },
    ], { collection: 'submissions', id: docId, tab: 'submissions' }));
  });
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
  var card = document.createElement('div');
  card.className = 'card';
  card.dataset.search = fields.map(function(f) { return f.value || ''; }).join(' ').toLowerCase();
  fields.forEach(function(f) {
    var row = document.createElement('div');
    row.className = 'card-row';
    row.innerHTML = '<span class="card-label">' + f.label + '</span>';
    var val = document.createElement('span');
    val.className = 'card-value';
    if (f.isHtml) val.innerHTML = f.value || '';
    else val.textContent = f.value || '';
    row.appendChild(val);
    card.appendChild(row);
  });
  var actions = document.createElement('div');
  actions.className = 'card-actions';
  actions.innerHTML = '<button class="action-btn delete-btn" onclick="deleteRecord(\'' + deleteArgs.collection + '\',\'' + deleteArgs.id + '\',\'' + deleteArgs.tab + '\')">Delete</button>';
  card.appendChild(actions);
  return card;
}

/* ─────────────────────────────────────────
   SUBMISSIONS LOAD
───────────────────────────────────────── */
async function loadSubmissions() {
  var tbody = document.querySelector('#submissionsTable tbody');
  var cards = document.getElementById('submissionsCards');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;padding:20px">Loading...</td></tr>';
  cards.innerHTML = '<div class="card" style="text-align:center;color:#888">Loading...</div>';
  try {
    var snapshot = await db.collection('submissions').orderBy('createdAt', 'desc').get();
    allSubmissions = [];
    snapshot.forEach(function(doc) { allSubmissions.push({ id: doc.id, d: doc.data() }); });
    renderSubmissions();
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#c00;padding:20px">Error: ' + err.message + '</td></tr>';
    cards.innerHTML = '<div class="card" style="color:#c00">Error: ' + err.message + '</div>';
    console.error('loadSubmissions error:', err);
  }
}

/* ─────────────────────────────────────────
   FEEDBACKS LOAD + RENDER
───────────────────────────────────────── */
async function loadFeedbacks() {
  var tbody = document.querySelector('#feedbacksTable tbody');
  var cards = document.getElementById('feedbacksCards');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:20px">Loading...</td></tr>';
  cards.innerHTML = '<div class="card" style="text-align:center;color:#888">Loading...</div>';
  try {
    var snapshot = await db.collection('feedbacks').orderBy('timestamp', 'desc').get();
    allFeedbacks = [];
    var regions = new Set();
    var offices = new Set();
    snapshot.forEach(function(doc) {
      var d = doc.data();
      allFeedbacks.push({ id: doc.id, d: d });
      if (d.region) regions.add(d.region);
      if (d.office) offices.add(d.office);
    });
    buildFilterChips('regionChips', Array.from(regions).sort());
    buildFilterChips('officeChips', Array.from(offices).sort());
    renderFeedbacks();
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#c00;padding:20px">Error: ' + err.message + '</td></tr>';
    cards.innerHTML = '<div class="card" style="color:#c00">Error: ' + err.message + '</div>';
    console.error('loadFeedbacks error:', err);
  }
}

function buildFilterChips(containerId, values) {
  var container = document.getElementById(containerId);
  container.innerHTML = '<span class="filter-chip active" data-val="all">All</span>';
  values.forEach(function(v) {
    var chip = document.createElement('span');
    chip.className = 'filter-chip';
    chip.dataset.val = v;
    chip.textContent = v;
    container.appendChild(chip);
  });
  container.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      container.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      if (containerId === 'ratingChips')  pendingFilters.rating = chip.dataset.val;
      if (containerId === 'regionChips')  pendingFilters.region = chip.dataset.val;
      if (containerId === 'officeChips')  pendingFilters.office = chip.dataset.val;
    });
  });
}

function renderFeedbacks() {
  var tbody = document.querySelector('#feedbacksTable tbody');
  var cards = document.getElementById('feedbacksCards');
  tbody.innerHTML = '';
  cards.innerHTML = '';

  var filtered = allFeedbacks.filter(function(item) {
    var d = item.d;
    if (activeFilters.rating !== 'all' && String(d.rating) !== activeFilters.rating) return false;
    if (activeFilters.region !== 'all' && d.region !== activeFilters.region) return false;
    if (activeFilters.office !== 'all' && d.office !== activeFilters.office) return false;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:20px">No feedbacks match your filters.</td></tr>';
    cards.innerHTML = '<div class="card" style="text-align:center;color:#888">No feedbacks match your filters.</div>';
    return;
  }

  filtered.forEach(function(item) {
    var d = item.d;
    var docId = item.id;
    var dateStr = formatDate(d.timestamp);
    var stars = d.rating ? String('⭐').repeat(Number(d.rating)) : '';

    var tr = document.createElement('tr');
    tr.dataset.search = [d.office, d.region, d.rating, d.comment, dateStr].join(' ').toLowerCase();
    tr.innerHTML =
      '<td>' + (d.office  || '') + '</td>' +
      '<td>' + (d.region  || '') + '</td>' +
      '<td>' + stars       + '</td>' +
      '<td>' + (d.comment || '') + '</td>' +
      '<td>' + dateStr     + '</td>' +
      '<td><button class="action-btn delete-btn" onclick="deleteRecord(\'feedbacks\',\'' + docId + '\',\'feedbacks\')">Delete</button></td>';
    tbody.appendChild(tr);

    cards.appendChild(makeCard([
      { label: 'Office',  value: d.office  },
      { label: 'Region',  value: d.region  },
      { label: 'Rating',  value: stars     },
      { label: 'Comment', value: d.comment },
      { label: 'Date',    value: dateStr   },
    ], { collection: 'feedbacks', id: docId, tab: 'feedbacks' }));
  });

  updateFilterBtnState();
}

/* ─────────────────────────────────────────
   FILTER POPUP
───────────────────────────────────────── */
function openFilterPopup(e) {
  e.stopPropagation();
  var overlay = document.getElementById('filterOverlay');
  var popup   = document.getElementById('filterPopup');
  var btn     = document.getElementById('filterToggleBtn');
  var rect    = btn.getBoundingClientRect();
  pendingFilters = Object.assign({}, activeFilters);
  syncChipsToState();
  popup.style.top  = (rect.bottom + window.scrollY + 6) + 'px';
  popup.style.left = Math.max(8, rect.left + window.scrollX - 10) + 'px';
  overlay.classList.add('open');
}

function closeFilterPopup(e) {
  if (e && e.target !== document.getElementById('filterOverlay')) return;
  document.getElementById('filterOverlay').classList.remove('open');
}

function syncChipsToState() {
  syncGroup('ratingChips', pendingFilters.rating);
  syncGroup('regionChips', pendingFilters.region);
  syncGroup('officeChips', pendingFilters.office);
}

function syncGroup(containerId, activeVal) {
  var container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.filter-chip').forEach(function(chip) {
    chip.classList.toggle('active', chip.dataset.val === activeVal);
  });
}

function applyFilters() {
  activeFilters = Object.assign({}, pendingFilters);
  document.getElementById('filterOverlay').classList.remove('open');
  renderFeedbacks();
}

function clearFilters() {
  pendingFilters = { rating: 'all', region: 'all', office: 'all' };
  syncChipsToState();
}

function updateFilterBtnState() {
  var btn = document.getElementById('filterToggleBtn');
  if (!btn) return;
  var count = [activeFilters.rating, activeFilters.region, activeFilters.office]
    .filter(function(v) { return v !== 'all'; }).length;
  btn.classList.toggle('has-filter', count > 0);
  var textNode = btn.lastChild;
  if (textNode && textNode.nodeType === 3) {
    textNode.textContent = count > 0 ? ' Filter (' + count + ')' : ' Filter';
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
   SEARCH (text search on rendered rows/cards)
───────────────────────────────────────── */
function filterTableRows(tableId, keyword) {
  keyword = keyword.toLowerCase();
  var table = document.getElementById(tableId);
  if (!table) return;
  Array.from(table.querySelector('tbody').rows).forEach(function(row) {
    var text = (row.dataset.search || row.innerText).toLowerCase();
    row.style.display = text.includes(keyword) ? '' : 'none';
  });
}

function filterCards(containerId, keyword) {
  keyword = keyword.toLowerCase();
  var container = document.getElementById(containerId);
  if (!container) return;
  Array.from(container.querySelectorAll('.card')).forEach(function(card) {
    var text = (card.dataset.search || card.innerText).toLowerCase();
    card.style.display = text.includes(keyword) ? '' : 'none';
  });
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  loadSubmissions();
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') document.getElementById('filterOverlay').classList.remove('open');
  });
});