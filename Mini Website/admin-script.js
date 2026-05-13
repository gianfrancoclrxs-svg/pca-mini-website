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
var allSubmissions  = [];
var allFeedbacks    = [];
var activeSubTab    = 'all';
var activeFilters   = { rating: 'all', region: 'all', office: 'all' };
var pendingFilters  = { rating: 'all', region: 'all', office: 'all' };
var selectedIds     = new Set(); // doc IDs currently checked
var pdfStore        = {};        // maps element id -> pdf data URL or https URL

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
  clearSelection();
  renderSubmissions();
}

function formCategory(formName) {
  if (!formName) return 'other';
  var lower = formName.toLowerCase();
  if (lower.indexOf('meeting') !== -1)  return 'meeting';
  if (lower.indexOf('ncfrs') !== -1 || lower.indexOf('enroll') !== -1) return 'enrollment';
  return 'other';
}

/* ─────────────────────────────────────────
   STATUS HELPERS
───────────────────────────────────────── */
function statusBadgeHtml(status) {
  var s = (status || 'active').toLowerCase();
  var labels = { active: 'Active', completed: 'Completed', cancelled: 'Cancelled' };
  var label  = labels[s] || 'Active';
  return '<span class="status-badge status-' + s + '">' + label + '</span>';
}

function actionButtonsHtml(docId, status) {
  var s = (status || 'active').toLowerCase();
  var btns = '';
  if (s === 'active') {
    btns +=
      '<button class="action-btn complete-btn" onclick="setStatus(\'' + docId + '\',\'completed\')">✔ Complete</button>' +
      '<button class="action-btn cancel-btn"   onclick="setStatus(\'' + docId + '\',\'cancelled\')">✖ Cancel</button>';
  } else {
    btns += '<button class="action-btn restore-btn" onclick="setStatus(\'' + docId + '\',\'active\')">↩ Restore</button>';
  }
  btns += '<button class="action-btn delete-btn" onclick="deleteRecord(\'submissions\',\'' + docId + '\',\'submissions\')">Delete</button>';
  return btns;
}

/* ─────────────────────────────────────────
   RENDER SUBMISSIONS
───────────────────────────────────────── */
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
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#888;padding:20px">No submissions found.</td></tr>';
    cards.innerHTML = '<div class="card" style="text-align:center;color:#888">No submissions found.</div>';
    updateBulkToolbar();
    return;
  }

  filtered.forEach(function(item) {
    var d      = item.d;
    var docId  = item.id;
    var dateStr = formatDate(d.createdAt);
    var status  = d.status || 'active';

    // PDF link
    var pdfHtml = '';
    if (d.pdf) {
      if (d.pdf.startsWith('data:') || d.pdf.startsWith('http')) {
        var pdfId = 'pdf-' + docId;
        pdfHtml = '<a href="#" id="' + pdfId + '" style="color:#0d6d05;font-weight:600" onclick="openPdf(\'' + pdfId + '\');return false;">&#128196; View PDF</a>';
        pdfStore[pdfId] = d.pdf;
      } else {
        pdfHtml = '<span style="color:#aaa;font-size:12px;font-style:italic">' + d.pdf + '</span>';
      }
    }

    var cat       = formCategory(d.form);
    var formLabel = cat === 'meeting' ? 'Meeting Scheduler' : cat === 'enrollment' ? 'NCFRS Enrollment' : (d.form || '');
    var isChecked = selectedIds.has(docId);

    // ── TABLE ROW ──
    var tr = document.createElement('tr');
    tr.dataset.search = [d.applicant_id, d.fullname, formLabel, d.contact, dateStr, status].join(' ').toLowerCase();
    tr.dataset.docId  = docId;
    if (isChecked) tr.style.background = '#f0fde4';

    tr.innerHTML =
      '<td style="text-align:center">' +
        '<input type="checkbox" class="row-check" data-id="' + docId + '" ' + (isChecked ? 'checked' : '') + ' onchange="onRowCheck(this)">' +
      '</td>' +
      '<td>' + (d.applicant_id || '') + '</td>' +
      '<td>' + (d.fullname     || '') + '</td>' +
      '<td>' + formLabel             + '</td>' +
      '<td>' + (d.contact      || '') + '</td>' +
      '<td>' + pdfHtml               + '</td>' +
      '<td>' + statusBadgeHtml(status) + '</td>' +
      '<td>' + dateStr               + '</td>' +
      '<td style="white-space:nowrap"><div style="display:flex;gap:6px;flex-wrap:wrap">' + actionButtonsHtml(docId, status) + '</div></td>';
    tbody.appendChild(tr);

    // ── MOBILE CARD ──
    var card = document.createElement('div');
    card.className   = 'card';
    card.dataset.search = [d.applicant_id, d.fullname, formLabel, d.contact, dateStr, status].join(' ').toLowerCase();
    card.dataset.docId  = docId;
    if (isChecked) card.style.outline = '2px solid #0d6d05';

    var checkWrap = document.createElement('div');
    checkWrap.className = 'card-check-wrap';
    checkWrap.innerHTML =
      '<input type="checkbox" class="row-check" id="chk-' + docId + '" data-id="' + docId + '" ' + (isChecked ? 'checked' : '') + ' onchange="onRowCheck(this)">' +
      '<label for="chk-' + docId + '">Select for bulk action</label>';
    card.appendChild(checkWrap);

    var fields = [
      { label: 'Applicant ID', value: d.applicant_id },
      { label: 'Full Name',    value: d.fullname      },
      { label: 'Form',         value: formLabel        },
      { label: 'Contact',      value: d.contact       },
      { label: 'PDF',          value: pdfHtml, isHtml: true },
      { label: 'Status',       value: statusBadgeHtml(status), isHtml: true },
      { label: 'Date',         value: dateStr         },
    ];
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
    actions.innerHTML = actionButtonsHtml(docId, status);
    card.appendChild(actions);
    cards.appendChild(card);
  });

  updateBulkToolbar();
  syncSelectAllCheckbox();
}

/* ─────────────────────────────────────────
   SELECTION / BULK
───────────────────────────────────────── */
function onRowCheck(checkbox) {
  var id = checkbox.dataset.id;
  if (checkbox.checked) selectedIds.add(id);
  else                  selectedIds.delete(id);

  // Sync all checkboxes with same data-id (table + card)
  document.querySelectorAll('.row-check[data-id="' + id + '"]').forEach(function(cb) {
    cb.checked = checkbox.checked;
  });
  // Highlight table row
  var tr = document.querySelector('#submissionsTable tbody tr[data-doc-id="' + id + '"]');
  if (!tr) {
    // dataset is set via dataset property, find by iterating
    document.querySelectorAll('#submissionsTable tbody tr').forEach(function(r) {
      if (r.dataset.docId === id) tr = r;
    });
  }
  if (tr) tr.style.background = checkbox.checked ? '#f0fde4' : '';
  // Highlight card
  document.querySelectorAll('#submissionsCards .card').forEach(function(c) {
    if (c.dataset.docId === id) c.style.outline = checkbox.checked ? '2px solid #0d6d05' : '';
  });

  updateBulkToolbar();
  syncSelectAllCheckbox();
}

function toggleSelectAll(masterCheckbox) {
  var visibleIds = [];
  document.querySelectorAll('#submissionsTable tbody tr').forEach(function(tr) {
    if (tr.style.display !== 'none' && tr.dataset.docId) visibleIds.push(tr.dataset.docId);
  });
  document.querySelectorAll('#submissionsCards .card').forEach(function(card) {
    if (card.style.display !== 'none' && card.dataset.docId) visibleIds.push(card.dataset.docId);
  });
  // deduplicate
  visibleIds = visibleIds.filter(function(v, i, a) { return a.indexOf(v) === i; });

  visibleIds.forEach(function(id) {
    if (masterCheckbox.checked) selectedIds.add(id);
    else                        selectedIds.delete(id);
  });
  renderSubmissions();
}

function syncSelectAllCheckbox() {
  var master = document.getElementById('selectAllCheck');
  if (!master) return;
  var allRows = Array.from(document.querySelectorAll('#submissionsTable tbody tr')).filter(function(tr) {
    return tr.style.display !== 'none' && tr.dataset.docId;
  });
  if (allRows.length === 0) { master.checked = false; master.indeterminate = false; return; }
  var checkedCount = allRows.filter(function(tr) { return selectedIds.has(tr.dataset.docId); }).length;
  if (checkedCount === 0)                  { master.checked = false; master.indeterminate = false; }
  else if (checkedCount === allRows.length){ master.checked = true;  master.indeterminate = false; }
  else                                     { master.checked = false; master.indeterminate = true;  }
}

function updateBulkToolbar() {
  var toolbar = document.getElementById('bulkToolbar');
  var countEl = document.getElementById('bulkCount');
  if (!toolbar) return;
  if (selectedIds.size > 0) {
    toolbar.classList.add('visible');
    countEl.textContent = selectedIds.size + ' record' + (selectedIds.size > 1 ? 's' : '') + ' selected';
  } else {
    toolbar.classList.remove('visible');
  }
}

function clearSelection() {
  selectedIds.clear();
  updateBulkToolbar();
  document.querySelectorAll('.row-check').forEach(function(cb) { cb.checked = false; });
  var master = document.getElementById('selectAllCheck');
  if (master) { master.checked = false; master.indeterminate = false; }
  document.querySelectorAll('#submissionsTable tbody tr').forEach(function(tr) { tr.style.background = ''; });
  document.querySelectorAll('#submissionsCards .card').forEach(function(c) { c.style.outline = ''; });
}

async function bulkDelete() {
  if (selectedIds.size === 0) return;
  if (!confirm('Delete ' + selectedIds.size + ' selected record(s)? This cannot be undone.')) return;

  var ids    = Array.from(selectedIds);
  var failed = 0;
  for (var i = 0; i < ids.length; i++) {
    try {
      await db.collection('submissions').doc(ids[i]).delete();
      allSubmissions = allSubmissions.filter(function(item) { return item.id !== ids[i]; });
    } catch(e) {
      console.error('Bulk delete failed for', ids[i], e);
      failed++;
    }
  }
  selectedIds.clear();
  renderSubmissions();
  if (failed > 0) alert('Done — ' + failed + ' record(s) could not be deleted.');
}

/* ─────────────────────────────────────────
   STATUS UPDATE
───────────────────────────────────────── */
async function setStatus(docId, newStatus) {
  try {
    await db.collection('submissions').doc(docId).update({ status: newStatus });
    var item = allSubmissions.find(function(s) { return s.id === docId; });
    if (item) item.d.status = newStatus;
    renderSubmissions();
  } catch(e) {
    alert('Failed to update status: ' + e.message);
    console.error('setStatus error:', e);
  }
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
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#888;padding:20px">Loading...</td></tr>';
  cards.innerHTML = '<div class="card" style="text-align:center;color:#888">Loading...</div>';
  try {
    var snapshot = await db.collection('submissions').orderBy('createdAt', 'desc').get();
    allSubmissions = [];
    snapshot.forEach(function(doc) { allSubmissions.push({ id: doc.id, d: doc.data() }); });
    clearSelection();
    renderSubmissions();
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#c00;padding:20px">Error: ' + err.message + '</td></tr>';
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
    buildFilterChips('ratingChips', ['5 ⭐', '4 ⭐', '3 ⭐', '2 ⭐', '1 ⭐'], ['5','4','3','2','1']);
    buildFilterChips('regionChips', Array.from(regions).sort());
    buildFilterChips('officeChips', Array.from(offices).sort());
    renderFeedbacks();
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#c00;padding:20px">Error: ' + err.message + '</td></tr>';
    cards.innerHTML = '<div class="card" style="color:#c00">Error: ' + err.message + '</div>';
    console.error('loadFeedbacks error:', err);
  }
}

function buildFilterChips(containerId, labels, vals) {
  var container = document.getElementById(containerId);
  container.innerHTML = '<span class="filter-chip active" data-val="all">All</span>';
  labels.forEach(function(label, i) {
    var chip = document.createElement('span');
    chip.className   = 'filter-chip';
    chip.textContent = label;
    chip.dataset.val = vals ? vals[i] : label;
    container.appendChild(chip);
    chip.addEventListener('click', function() {
      container.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      if (containerId === 'ratingChips') pendingFilters.rating = chip.dataset.val;
      if (containerId === 'regionChips') pendingFilters.region = chip.dataset.val;
      if (containerId === 'officeChips') pendingFilters.office = chip.dataset.val;
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
    if (activeFilters.region !== 'all' && d.region !== activeFilters.region)          return false;
    if (activeFilters.office !== 'all' && d.office !== activeFilters.office)          return false;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:20px">No feedbacks match your filters.</td></tr>';
    cards.innerHTML = '<div class="card" style="text-align:center;color:#888">No feedbacks match your filters.</div>';
    return;
  }

  filtered.forEach(function(item) {
    var d     = item.d;
    var docId = item.id;
    var dateStr = formatDate(d.timestamp);
    var stars   = d.rating ? String('⭐').repeat(Number(d.rating)) : '';

    var tr = document.createElement('tr');
    tr.dataset.search = [d.office, d.region, d.rating, d.comment, dateStr].join(' ').toLowerCase();
    tr.innerHTML =
      '<td>' + (d.office  || '') + '</td>' +
      '<td>' + (d.region  || '') + '</td>' +
      '<td>' + stars             + '</td>' +
      '<td>' + (d.comment || '') + '</td>' +
      '<td>' + dateStr           + '</td>' +
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
  var popupWidth  = Math.min(320, window.innerWidth - 16);
  popup.style.width    = popupWidth + 'px';
  popup.style.minWidth = 'unset';
  var idealLeft   = rect.left + window.scrollX - 10;
  var clampedLeft = Math.min(Math.max(8, idealLeft), window.innerWidth + window.scrollX - popupWidth - 8);
  popup.style.top  = (rect.bottom + window.scrollY + 6) + 'px';
  popup.style.left = clampedLeft + 'px';
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
   DELETE (single)
───────────────────────────────────────── */
async function deleteRecord(collection, id, tab) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  try {
    await db.collection(collection).doc(id).delete();
    if (collection === 'submissions') {
      allSubmissions = allSubmissions.filter(function(item) { return item.id !== id; });
      selectedIds.delete(id);
      renderSubmissions();
    } else {
      allFeedbacks = allFeedbacks.filter(function(item) { return item.id !== id; });
      renderFeedbacks();
    }
  } catch (err) {
    alert('Delete failed: ' + err.message);
    console.error('deleteRecord error:', err);
  }
}

/* ─────────────────────────────────────────
   SEARCH
───────────────────────────────────────── */
function filterTableRows(tableId, keyword) {
  keyword = keyword.toLowerCase();
  var table = document.getElementById(tableId);
  if (!table) return;
  Array.from(table.querySelector('tbody').rows).forEach(function(row) {
    var text = (row.dataset.search || row.innerText).toLowerCase();
    row.style.display = text.includes(keyword) ? '' : 'none';
  });
  syncSelectAllCheckbox();
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
   PDF VIEWER
───────────────────────────────────────── */
function openPdf(id) {
  var data = pdfStore[id];
  if (!data) return;
  if (data.startsWith('http')) { window.open(data, '_blank'); return; }
  var byteString = atob(data.split(',')[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  var blob = new Blob([ab], { type: 'application/pdf' });
  var url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(function() { URL.revokeObjectURL(url); }, 30000);
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