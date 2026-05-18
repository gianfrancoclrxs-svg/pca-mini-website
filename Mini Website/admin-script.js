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
var activeFilters   = { rating: 'all', clientType: 'all', serviceType: 'all', office: 'all' };
var pendingFilters  = { rating: 'all', clientType: 'all', serviceType: 'all', office: 'all' };
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
  var labels = { pending: 'Pending Verification', active: 'Active', verified: 'Verified', rejected: 'Rejected', completed: 'Completed', cancelled: 'Cancelled' };
  var label  = labels[s] || 'Active';
  return '<span class="status-badge status-' + s + '">' + label + '</span>';
}

function actionButtonsHtml(docId, status, formName) {
  var s = (status || 'active').toLowerCase();
  var isMeeting = formCategory(formName) === 'meeting';
  var btns = '';

  if (isMeeting && s === 'pending') {
    btns +=
      '<button class="action-btn verify-btn"  onclick="setStatus(\'' + docId + '\',\'verified\')">✔ Verify</button>' +
      '<button class="action-btn reject-btn"  onclick="setStatus(\'' + docId + '\',\'rejected\')">✖ Reject</button>';
  } else if (isMeeting && s === 'verified') {
    btns +=
      '<button class="action-btn complete-btn" onclick="setStatus(\'' + docId + '\',\'completed\')">✔ Complete</button>' +
      '<button class="action-btn cancel-btn"   onclick="setStatus(\'' + docId + '\',\'cancelled\')">✖ Cancel</button>' +
      '<button class="action-btn restore-btn"  onclick="setStatus(\'' + docId + '\',\'pending\')">↩ Unverify</button>';
  } else if (isMeeting && (s === 'rejected' || s === 'cancelled' || s === 'completed')) {
    btns += '<button class="action-btn restore-btn" onclick="setStatus(\'' + docId + '\',\'pending\')">↩ Restore</button>';
  } else if (s === 'active') {
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
      '<td style="white-space:nowrap"><div style="display:flex;gap:6px;flex-wrap:wrap">' + actionButtonsHtml(docId, status, d.form) + '</div></td>';
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
    actions.innerHTML = actionButtonsHtml(docId, status, d.form);
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
  if (deleteArgs.viewId) {
    actions.innerHTML += '<button class="action-btn view-btn" onclick="openFeedbackDetail(\'' + deleteArgs.viewId + '\')">👁 View</button>';
  }
  actions.innerHTML += '<button class="action-btn delete-btn" onclick="deleteRecord(\'' + deleteArgs.collection + '\',\'' + deleteArgs.id + '\',\'' + deleteArgs.tab + '\')">Delete</button>';
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
  tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#888;padding:20px">Loading...</td></tr>';
  cards.innerHTML = '<div class="card" style="text-align:center;color:#888">Loading...</div>';
  try {
    var snapshot = await db.collection('feedbacks').orderBy('timestamp', 'desc').get();
    allFeedbacks = [];
    var offices = new Set();
    snapshot.forEach(function(doc) {
      var d = doc.data();
      allFeedbacks.push({ id: doc.id, d: d });
      if (d.pcaOffice) offices.add(d.pcaOffice);
      // backward-compat: old docs used d.office
      else if (d.office) offices.add(d.office);
    });
    buildFilterChips('officeChips', Array.from(offices).sort());
    renderFeedbacks();
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#c00;padding:20px">Error: ' + err.message + '</td></tr>';
    cards.innerHTML = '<div class="card" style="color:#c00">Error: ' + err.message + '</div>';
    console.error('loadFeedbacks error:', err);
  }
}

function buildFilterChips(containerId, labels, vals) {
  var container = document.getElementById(containerId);
  if (!container) return;
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
      if (containerId === 'ratingChips')      pendingFilters.rating      = chip.dataset.val;
      if (containerId === 'clientTypeChips')  pendingFilters.clientType  = chip.dataset.val;
      if (containerId === 'serviceTypeChips') pendingFilters.serviceType = chip.dataset.val;
      if (containerId === 'officeChips')      pendingFilters.office      = chip.dataset.val;
    });
  });
}

/* Helper: compute average of SQD0-SQD8 answers */
function sqdAverage(d) {
  var map = { 'Strongly Disagree': 1, 'Disagree': 2, 'Neither Agree nor Disagree': 3, 'Agree': 4, 'Strongly Agree': 5 };
  var total = 0; var count = 0;
  ['sqd0','sqd1','sqd2','sqd3','sqd4','sqd5','sqd6','sqd7','sqd8'].forEach(function(k) {
    var v = map[d[k]];
    if (v) { total += v; count++; }
  });
  return count ? (total / count).toFixed(1) : '—';
}

function sqdBadge(avg) {
  if (avg === '—') return '<span style="color:#aaa">—</span>';
  var n = parseFloat(avg);
  var color = n >= 4.5 ? '#1b5e20' : n >= 3.5 ? '#0d47a1' : n >= 2.5 ? '#e65100' : '#b71c1c';
  var bg    = n >= 4.5 ? '#e8f5e9' : n >= 3.5 ? '#e3f2fd' : n >= 2.5 ? '#fff3e0' : '#fce4ec';
  return '<span style="background:' + bg + ';color:' + color + ';padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">' + avg + '</span>';
}

function starsHtml(rating) {
  if (!rating) return '<span style="color:#aaa">—</span>';
  var n = Number(rating);
  var colors = ['','#c62828','#e65100','#f9a825','#2e7d32','#1b5e20'];
  var labels = ['','Poor','Fair','Okay','Good','Excellent'];
  return '<span style="color:' + (colors[n]||'#888') + ';font-weight:700;">' +
    '⭐'.repeat(n) + ' <small>' + (labels[n]||'') + '</small></span>';
}

function renderFeedbacks() {
  var tbody = document.querySelector('#feedbacksTable tbody');
  var cards = document.getElementById('feedbacksCards');
  tbody.innerHTML = '';
  cards.innerHTML = '';

  var filtered = allFeedbacks.filter(function(item) {
    var d = item.d;
    if (activeFilters.rating      !== 'all' && String(d.rating) !== activeFilters.rating)            return false;
    if (activeFilters.clientType  !== 'all' && d.clientType  !== activeFilters.clientType)  return false;
    if (activeFilters.serviceType !== 'all' && d.serviceType !== activeFilters.serviceType) return false;
    if (activeFilters.office      !== 'all' && (d.pcaOffice || d.office) !== activeFilters.office)      return false;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#888;padding:20px">No feedbacks match your filters.</td></tr>';
    cards.innerHTML = '<div class="card" style="text-align:center;color:#888">No feedbacks match your filters.</div>';
    updateFilterBtnState();
    return;
  }

  filtered.forEach(function(item) {
    var d       = item.d;
    var docId   = item.id;
    var dateStr = formatDate(d.timestamp);
    var office  = d.pcaOffice || d.office || '—';
    var svcType = d.serviceType || '—';
    var svcAvailed = d.serviceAvailed || '—';
    var clientType = d.clientType || '—';
    var comment = d.comment || '';
    var avg     = sqdAverage(d);

    // truncate long service name for table
    var svcShort = svcAvailed.length > 40 ? svcAvailed.substring(0, 38) + '…' : svcAvailed;
    var commentShort = comment.length > 60 ? comment.substring(0, 58) + '…' : comment;

    var svcTypeBadge = svcType === 'Internal'
      ? '<span style="background:#e8f5e9;color:#1b5e20;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">Internal</span>'
      : svcType === 'External'
        ? '<span style="background:#e3f2fd;color:#0d47a1;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">External</span>'
        : '<span style="color:#aaa">—</span>';

    var tr = document.createElement('tr');
    tr.dataset.search = [office, clientType, svcType, svcAvailed, d.rating, comment, dateStr].join(' ').toLowerCase();
    tr.innerHTML =
      '<td style="white-space:nowrap">' + dateStr + '</td>' +
      '<td>' + escHtml(office) + '</td>' +
      '<td>' + escHtml(clientType) + '</td>' +
      '<td>' + svcTypeBadge + '</td>' +
      '<td title="' + escHtml(svcAvailed) + '">' + escHtml(svcShort) + '</td>' +
      '<td>' + starsHtml(d.rating) + '</td>' +
      '<td style="text-align:center">' + sqdBadge(avg) + '</td>' +
      '<td style="max-width:220px" title="' + escHtml(comment) + '">' + escHtml(commentShort) + '</td>' +
      '<td style="white-space:nowrap"><div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="action-btn view-btn" onclick="openFeedbackDetail(\'' + docId + '\')">👁 View</button>' +
        '<button class="action-btn delete-btn" onclick="deleteRecord(\'feedbacks\',\'' + docId + '\',\'feedbacks\')">Delete</button>' +
      '</div></td>';
    tbody.appendChild(tr);

    // ── MOBILE CARD ──
    cards.appendChild(makeCard([
      { label: 'Date',          value: dateStr },
      { label: 'PCA Office',    value: office },
      { label: 'Client Type',   value: clientType },
      { label: 'Service Type',  value: svcType },
      { label: 'Service',       value: svcAvailed },
      { label: 'Overall ⭐',    value: starsHtml(d.rating), isHtml: true },
      { label: 'SQD Avg',       value: sqdBadge(avg), isHtml: true },
      { label: 'Comment',       value: comment },
    ], { collection: 'feedbacks', id: docId, tab: 'feedbacks', viewId: docId }));
  });

  updateFilterBtnState();
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  syncGroup('ratingChips',      pendingFilters.rating);
  syncGroup('clientTypeChips',  pendingFilters.clientType);
  syncGroup('serviceTypeChips', pendingFilters.serviceType);
  syncGroup('officeChips',      pendingFilters.office);
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
  pendingFilters = { rating: 'all', clientType: 'all', serviceType: 'all', office: 'all' };
  syncChipsToState();
}

function updateFilterBtnState() {
  var btn = document.getElementById('filterToggleBtn');
  if (!btn) return;
  var count = [activeFilters.rating, activeFilters.clientType, activeFilters.serviceType, activeFilters.office]
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
   FEEDBACK DETAIL MODAL
───────────────────────────────────────── */
function openFeedbackDetail(docId) {
  var item = allFeedbacks.find(function(f) { return f.id === docId; });
  if (!item) return;
  var d = item.d;

  var sqdLabels = [
    'SQD0 – Timeliness',
    'SQD1 – Processing time awareness',
    'SQD2 – Proper information given',
    'SQD3 – Steps were simple',
    'SQD4 – Walk-through provided',
    'SQD5 – Staff made things easy',
    'SQD6 – No additional documents asked',
    'SQD7 – No extra payment required',
    'SQD8 – Dignified and respectful'
  ];

  function row(label, value) {
    if (!value && value !== 0) value = '—';
    return '<tr>' +
      '<td style="font-weight:700;color:#0d6d05;width:42%;padding:8px 10px;border:1px solid #e0e0e0;font-size:13px;vertical-align:top;white-space:nowrap">' + escHtml(label) + '</td>' +
      '<td style="padding:8px 10px;border:1px solid #e0e0e0;font-size:13px;color:#222;word-break:break-word">' + escHtml(String(value)) + '</td>' +
    '</tr>';
  }

  function section(title) {
    return '<tr><td colspan="2" style="background:#0d6d05;color:white;font-weight:700;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;padding:7px 10px;border:1px solid #0d6d05">' + title + '</td></tr>';
  }

  var avg = sqdAverage(d);
  var sqdRows = sqdLabels.map(function(lbl, i) { return row(lbl, d['sqd' + i]); }).join('');

  var html =
    '<table style="width:100%;border-collapse:collapse">' +
      section('📍 Office & Visit Info') +
      row('PCA Office',          d.pcaOffice || d.office) +
      row('PCA Address',         d.pcaAddress) +
      row('Visit Date',          d.visitDate) +
      row('Submitted',           formatDate(d.timestamp)) +
      section('👤 Client Information') +
      row('Full Name',           d.fullName) +
      row('Date of Birth',       d.dob) +
      row('Sex',                 d.sex) +
      row('Residence Address',   d.residenceAddress) +
      row('Region of Residence', d.regionOfResidence) +
      row('Affiliation',         d.affiliation) +
      row('Email Address',       d.emailAddress) +
      row('Client Type',         d.clientType) +
      section('🛠 Service Details') +
      row('Service Type',        d.serviceType) +
      row('Service Availed',     d.serviceAvailed) +
      row('Other Service',       d.otherService) +
      section('📋 Citizen\'s Charter (CC)') +
      row('CC1 – Aware of CC',   d.cc1) +
      row('CC2 – CC easily found', d.cc2) +
      row('CC3 – CC requirements', d.cc3) +
      section('📊 Service Quality Dimensions (SQD)') +
      sqdRows +
      row('SQD Average', avg) +
      section('⭐ Overall Rating & Feedback') +
      row('Overall Rating',      d.rating ? d.rating + ' / 5' : '—') +
      row('Comment / Suggestion', d.comment) +
    '</table>';

  var modal = document.getElementById('feedbackDetailModal');
  document.getElementById('feedbackDetailBody').innerHTML = html;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeFeedbackDetail() {
  document.getElementById('feedbackDetailModal').style.display = 'none';
  document.body.style.overflow = '';
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