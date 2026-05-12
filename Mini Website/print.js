// ── Children rows builder ──────────────────────────────────
function buildChildrenRows() {
  const tbody = document.getElementById('children-tbody');
  for (let i = 1; i <= 6; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="row-num center">${i}.</td>
      <td><input type="text" class="ch_ln"></td>
      <td><input type="text" class="ch_fn"></td>
      <td><input type="text" class="ch_mi"></td>
      <td class="center">
        <select class="ch_sex">
          <option value="">—</option>
          <option value="M">M</option>
          <option value="F">F</option>
        </select>
      </td>
      <td><input type="date" class="ch_dob"></td>
      <td class="center">
        <select class="ch_coco">
          <option value="">—</option>
          <option value="Y">Yes</option>
          <option value="N">No</option>
        </select>
      </td>
      <td>
        <select class="ch_civil">
          <option value="">—</option>
          <option>Single</option>
          <option>Married</option>
          <option>Widowed</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  }
}
buildChildrenRows();

// ── Total parcels ──────────────────────────────────────────
function calcTotal() {
  const ids = ['p_owner','p_ownertiller','p_grower','p_tenant','p_tenantworker','p_laborer','p_others'];
  const total = ids.reduce((s,id) => s + (parseInt(document.getElementById(id).value)||0), 0);
  document.getElementById('p_total').textContent = total;
}

// ── Navigation ─────────────────────────────────────────────
let currentSection = 0;
const TOTAL = 5;

function goTo(n) {
  document.querySelectorAll('.form-card').forEach((c,i) => c.classList.toggle('active', i===n));
  const tabs = document.querySelectorAll('#progress-tabs li');
  tabs.forEach((t,i) => {
    t.classList.toggle('active', i===n);
    t.classList.toggle('done', i<n);
  });
  document.getElementById('btn-prev').style.display = n>0 ? '' : 'none';
  document.getElementById('btn-next').textContent = n===TOTAL-1 ? 'Done' : 'Next →';
  document.getElementById('btn-next').style.display = n===TOTAL-1 ? 'none' : '';
  document.getElementById('step-label').textContent = `Step ${n+1} of ${TOTAL}`;
  currentSection = n;
  if (n === TOTAL-1) buildReview();
  window.scrollTo({top:0, behavior:'smooth'});
}

// ── Required fields per section (id = text/date/tel input, radio = radio name, check = at least one checkbox name) ──
const REQUIRED = {
  0: [
    { type:'radio',  name:'enroll_type', label:'Enrollment Type' },
    { type:'id',     id:'ln',            label:'Last Name' },
    { type:'id',     id:'fn',            label:'First Name' },
    { type:'id',     id:'addr_brgy',     label:'Barangay' },
    { type:'id',     id:'addr_mun',      label:'Municipality / City' },
    { type:'id',     id:'addr_prov',     label:'Province' },
    { type:'id',     id:'addr_region',   label:'Region' },
    { type:'id',     id:'dob',           label:'Date of Birth' },
    { type:'radio',  name:'sex',         label:'Sex' },
    { type:'radio',  name:'civil',       label:'Civil Status' },
    { type:'check',  name:'edu',         label:'Educational Attainment' },
    { type:'radio',  name:'govid',       label:'Gov\'t ID (Yes/No)' },
    { type:'id',     id:'contact1',      label:'Contact No. 1' },
    { type:'id',     id:'religion',      label:'Religion' },
  ],
  1: [
    { type:'id',     id:'emrg_contact',  label:'Emergency Contact Number' },
    { type:'radio',  name:'hhead',       label:'Household Head (Yes/No)' },
  ],
  2: [
    { type:'id',     id:'occ',           label:'Occupation / Profession' },
    { type:'radio',  name:'agr',         label:'Agrarian Reform Beneficiary' },
    { type:'radio',  name:'pwd',         label:'PWD' },
    { type:'radio',  name:'govprg',      label:'Gov\'t Program Beneficiary' },
    { type:'radio',  name:'pca',         label:'PCA Programs Beneficiary' },
    { type:'radio',  name:'memb',        label:'Membership in Coop/Assoc' },
    { type:'id',     id:'coco_yr',       label:'Year Started in Coco Farming' },
  ],
  3: [],
};

function validateSection(n) {
  const rules = REQUIRED[n] || [];
  const errors = [];

  // Clear previous error highlights
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));

  rules.forEach(rule => {
    let failed = false;
    if (rule.type === 'id') {
      const el = document.getElementById(rule.id);
      if (!el || !el.value.trim()) {
        failed = true;
        if (el) el.closest('.field')?.classList.add('field-error');
      }
    } else if (rule.type === 'radio') {
      const checked = document.querySelector(`input[name="${rule.name}"]:checked`);
      if (!checked) {
        failed = true;
        // highlight the closest .field ancestor of the radio group
        const any = document.querySelector(`input[name="${rule.name}"]`);
        if (any) any.closest('.field')?.classList.add('field-error');
      }
    } else if (rule.type === 'check') {
      const checked = document.querySelector(`input[name="${rule.name}"]:checked`);
      if (!checked) {
        failed = true;
        const any = document.querySelector(`input[name="${rule.name}"]`);
        if (any) any.closest('.field')?.classList.add('field-error');
      }
    }
    if (failed) errors.push(rule.label);
  });

  if (errors.length) {
    showValidationBanner(errors);
    return false;
  }
  hideValidationBanner();
  return true;
}

function showValidationBanner(errors) {
  let banner = document.getElementById('validation-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'validation-banner';
    banner.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:12px 24px;border-radius:8px;font-size:.85rem;font-family:Instrument Sans,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.3);z-index:9999;max-width:480px;text-align:center;line-height:1.5;';
    document.body.appendChild(banner);
  }
  banner.innerHTML = '<strong>Please complete required fields:</strong><br>' + errors.join(' · ');
  banner.style.display = 'block';
  clearTimeout(banner._timer);
  banner._timer = setTimeout(() => { banner.style.display = 'none'; }, 5000);
}

function hideValidationBanner() {
  const banner = document.getElementById('validation-banner');
  if (banner) banner.style.display = 'none';
}

function navigate(dir) {
  const next = currentSection + dir;
  if (dir > 0 && !validateSection(currentSection)) return;
  if (next >= 0 && next < TOTAL) goTo(next);
}

// ── Gather data helper ─────────────────────────────────────
function val(id) { const el=document.getElementById(id); return el ? el.value.trim() : ''; }
function radio(name) { const el=document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : ''; }
function checks(name) { return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(e=>e.value).join(', '); }
function fmtDate(d) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  return `${m}/${day}/${y}`;
}

function collectData() {
  // Spouses
  const spouses = [];
  document.querySelectorAll('#spouse-table tbody tr').forEach(tr => {
    const ln = tr.querySelector('.sp_ln').value.trim();
    if (ln) spouses.push({
      ln, fn: tr.querySelector('.sp_fn').value.trim(),
      mi: tr.querySelector('.sp_mi').value.trim(),
      dob: fmtDate(tr.querySelector('.sp_dob').value),
      coco: tr.querySelector('.sp_coco').value,
      kids: tr.querySelector('.sp_kids').value
    });
  });
  // Children
  const children = [];
  document.querySelectorAll('#children-tbody tr').forEach((tr,i) => {
    const ln = tr.querySelector('.ch_ln').value.trim();
    if (ln) children.push({
      num: i+1, ln, fn: tr.querySelector('.ch_fn').value.trim(),
      mi: tr.querySelector('.ch_mi').value.trim(),
      sex: tr.querySelector('.ch_sex').value,
      dob: fmtDate(tr.querySelector('.ch_dob').value),
      coco: tr.querySelector('.ch_coco').value,
      civil: tr.querySelector('.ch_civil').value
    });
  });

  return {
    enroll_type: radio('enroll_type'),
    ln: val('ln'), fn: val('fn'), mn: val('mn'), en: val('en'),
    addr_hno: val('addr_hno'), addr_street: val('addr_street'), addr_brgy: val('addr_brgy'),
    addr_mun: val('addr_mun'), addr_prov: val('addr_prov'), addr_region: val('addr_region'),
    dob: fmtDate(val('dob')), sex: radio('sex'), pob: val('pob'),
    civil: radio('civil'), edu: checks('edu'),
    govid: radio('govid'), id_type: val('id_type'), id_no: val('id_no'),
    contact1: val('contact1'), contact2: val('contact2'),
    religion: val('religion'),
    mom_ln: val('mom_ln'), mom_fn: val('mom_fn'), mom_mn: val('mom_mn'), mom_en: val('mom_en'),
    spouses, children,
    emrg_ln: val('emrg_ln'), emrg_fn: val('emrg_fn'), emrg_mi: val('emrg_mi'), emrg_contact: val('emrg_contact'),
    hhead: radio('hhead'), hhead_rel: val('hhead_rel'), hh_members: val('hh_members'),
    hh_ln: val('hh_ln'), hh_fn: val('hh_fn'), hh_mn: val('hh_mn'), hh_en: val('hh_en'),
    occ: val('occ'), occ_yr: val('occ_yr'), occ_inc: val('occ_inc'),
    agr: radio('agr'), agr_yr: val('agr_yr'),
    pwd: radio('pwd'), pwd_spec: val('pwd_spec'),
    govprg: radio('govprg'), govprog_items: checks('govprog_items'), govprg_yr: val('govprg_yr'),
    indig: radio('indig'), indig_spec: val('indig_spec'),
    pca: radio('pca'), pca_items: checks('pca_items'), pca_yr: val('pca_yr'),
    memb: radio('memb'), memb_type: checks('memb_type'), memb_org: val('memb_org'),
    coco_yr: val('coco_yr'),
    p_owner: val('p_owner'), p_ownertiller: val('p_ownertiller'), p_grower: val('p_grower'),
    p_tenant: val('p_tenant'), p_tenantworker: val('p_tenantworker'), p_laborer: val('p_laborer'),
    p_others: val('p_others'), p_total: document.getElementById('p_total').textContent
  };
}

// ── Review panel ───────────────────────────────────────────
function buildReview() {
  const d = collectData();
  const section = (title, rows) => `
    <div style="margin-bottom:20px;">
      <div style="font-family:'DM Mono',monospace;font-size:.7rem;letter-spacing:.1em;color:var(--green);text-transform:uppercase;border-bottom:1px solid var(--border);padding-bottom:4px;margin-bottom:10px;">${title}</div>
      ${rows.filter(r=>r[1]).map(r=>`
        <div style="display:flex;gap:12px;padding:4px 0;border-bottom:1px dotted #eee;">
          <span style="min-width:200px;color:var(--muted);font-size:.8rem;">${r[0]}</span>
          <span style="font-weight:500;">${r[1]}</span>
        </div>`).join('')}
    </div>`;

  document.getElementById('review-panel').innerHTML =
    section('Personal Information', [
      ['Enrollment Type', d.enroll_type],
      ['Name', [d.fn, d.mn, d.ln, d.en].filter(Boolean).join(' ')],
      ['Date of Birth', d.dob], ['Sex', d.sex], ['Place of Birth', d.pob],
      ['Civil Status', d.civil], ['Education', d.edu],
      ['Address', [d.addr_hno, d.addr_street, d.addr_brgy, d.addr_mun, d.addr_prov, d.addr_region].filter(Boolean).join(', ')],
      ['Gov\'t ID', d.govid], ['ID Type', d.id_type], ['ID No.', d.id_no],
      ['Contact 1', d.contact1], ['Contact 2', d.contact2], ['Religion', d.religion],
    ]) +
    section('Family', [
      ['Mother\'s Maiden Name', [d.mom_fn, d.mom_mn, d.mom_ln, d.mom_en].filter(Boolean).join(' ')],
      ['Spouses', d.spouses.length ? d.spouses.map(s=>`${s.fn} ${s.ln}`).join('; ') : 'N/A'],
      ['Children', d.children.length ? d.children.map(c=>`${c.fn} ${c.ln}`).join('; ') : 'N/A'],
      ['Emergency Contact', [d.emrg_fn, d.emrg_ln, d.emrg_mi].filter(Boolean).join(' ') + (d.emrg_contact ? ` — ${d.emrg_contact}` : '')],
      ['Household Head', d.hhead], ['HH Members', d.hh_members],
    ]) +
    section('Socio-Economic', [
      ['Occupation', d.occ], ['Yr. Started', d.occ_yr], ['Monthly Income', d.occ_inc ? '₱'+d.occ_inc : ''],
      ['Agrarian Reform Beneficiary', d.agr], ['Since', d.agr_yr],
      ['PWD', d.pwd], ['Disability', d.pwd_spec],
      ['Gov\'t Program', d.govprg], ['Programs', d.govprog_items], ['Yr. Participated', d.govprg_yr],
      ['Indigenous Group', d.indig], ['Group', d.indig_spec],
      ['PCA Program', d.pca], ['Interventions', d.pca_items], ['PCA Yr.', d.pca_yr],
      ['Membership', d.memb], ['Type', d.memb_type], ['Org. Name', d.memb_org],
      ['Started Coco Farming', d.coco_yr],
    ]) +
    section('Farm Parcels', [
      ['Owner', d.p_owner], ['Owner-Tiller', d.p_ownertiller], ['Grower', d.p_grower],
      ['Tenant', d.p_tenant], ['Tenant-Worker', d.p_tenantworker], ['Worker-Laborer', d.p_laborer],
      ['Others', d.p_others], ['TOTAL PARCELS', d.p_total],
    ]);
}

// ── PRINT ─────────────────────────────────────────────────
function printForm() {
  const d = collectData();
  const today = new Date();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  const yyyy = String(today.getFullYear());

  // Helper: box for each digit
  const digitsOf = str => (str||'').split('').map(c=>`<div class="dbox">${c}</div>`).join('');
  const dobBoxes = dstr => {
    const clean = (dstr||'').replace(/\//g,'');
    // mmddyyyy from mm/dd/yyyy
    const chars = clean.split('');
    return chars.map(c=>`<div class="dbox">${c}</div>`).join('');
  };
  const todayBoxes = mm.split('').concat(dd.split('')).concat(yyyy.split(''))
    .map(c=>`<div class="dbox">${c}</div>`).join('');

  // Spouse rows
  const spouseRows = d.spouses.length
    ? d.spouses.map(s=>`<tr>
        <td>${s.ln}</td><td>${s.fn}</td><td>${s.mi}</td>
        <td>${s.dob}</td>
        <td style="text-align:center">${s.coco}</td>
        <td>${s.kids}</td>
      </tr>`).join('')
    : '<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>';

  // Children rows
  const childRows = (() => {
    const rows = [];
    for (let i = 1; i <= 6; i++) {
      const c = d.children[i-1] || {};
      rows.push(`<tr>
        <td>${i}.</td>
        <td>${c.ln||''}</td><td>${c.fn||''}</td><td>${c.mi||''}</td>
        <td style="text-align:center">${c.sex==='M'?'✓':''}</td>
        <td style="text-align:center">${c.sex==='F'?'✓':''}</td>
        <td>${c.dob||''}</td>
        <td style="text-align:center">${c.coco||''}</td>
        <td>${c.civil||''}</td>
      </tr>`);
    }
    return rows.join('');
  })();

  // Education checkmarks
  const eduList = (d.edu||'').split(', ');
  const eduCheck = v => eduList.includes(v) ? '☑' : '☐';

  // Gov't prog checkmarks
  const gpList = (d.govprog_items||'').split(', ');
  const gpCheck = v => gpList.includes(v) ? '☑' : '☐';

  // PCA items
  const pcaList = (d.pca_items||'').split(', ');
  const pcaCheck = v => pcaList.includes(v) ? '☑' : '☐';

  // Memb type
  const mbList = (d.memb_type||'').split(', ');
  const mbCheck = v => mbList.includes(v) ? '☑' : '☐';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NCFRS Enrollment Form — ${d.ln}, ${d.fn}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Source+Sans+Pro:wght@400;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Source Sans Pro',Arial,sans-serif; font-size:8.5pt; color:#111; background:#fff; }
  @page { size:A4; margin:14mm 16mm; }

  .page { width:100%; }
  .revised-note { font-size:7pt; text-align:right; margin-bottom:3px; color:#555; }

  /* HEADER */
  .form-header { display:flex; align-items:center; gap:10px; border:2px solid #1a5c2e; padding:8px; margin-bottom:4px; }
  .header-title { flex:1; text-align:center; }
  .header-title h1 { font-size:13pt; font-weight:700; color:#1a5c2e; letter-spacing:.05em; }
  .header-title h2 { font-size:7.5pt; color:#333; margin-top:2px; }
  .header-right { text-align:right; font-size:7.5pt; min-width:180px; }
  .dbox { display:inline-block; width:14px; height:14px; border:1px solid #333; text-align:center; line-height:13px; font-size:8pt; margin:1px; vertical-align:middle; }
  .new-existing { font-size:8pt; display:flex; gap:16px; margin:4px 0; }
  .note-row { display:flex; justify-content:space-between; font-size:7pt; color:#555; margin-bottom:4px; border-top:1px solid #ccc; padding-top:3px; }

  /* SECTION HEADER */
  .section-header { background:#1a5c2e; color:#fff; padding:4px 8px; font-size:8.5pt; font-weight:700; margin:6px 0 4px; display:flex; align-items:center; gap:6px; }
  .circle-num { display:inline-flex; align-items:center; justify-content:center; width:14px; height:14px; border:1.5px solid currentColor; border-radius:50%; font-size:7pt; flex-shrink:0; }

  /* FIELDS */
  .field-label { font-size:7pt; color:#555; }
  .underline-field { display:inline-block; min-width:80px; border-bottom:1px solid #333; margin-left:2px; font-size:8.5pt; padding:0 2px; }
  input[type=text] { border:none; border-bottom:1px solid #333; font-size:8.5pt; padding:0 2px; }

  /* NAME ROW */
  .name-row { display:flex; gap:8px; }
  .name-cell { flex:1; }
  .name-cell input { width:100%; border:none; border-bottom:1px solid #333; font-size:8.5pt; }

  /* TABLES */
  .person-table { width:100%; border-collapse:collapse; font-size:7.5pt; }
  .person-table th { background:#ddd; border:1px solid #333; padding:3px 4px; font-size:7pt; text-align:center; }
  .person-table td { border:1px solid #333; padding:3px 4px; min-height:14px; }
  .person-table td input[type=text] { width:100%; }

  /* CHECK / RADIO */
  .check-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:8pt; }
  .check-item { display:inline-flex; align-items:center; gap:3px; font-size:8pt; }

  /* PARCELS */
  .parcels-cell { border:1px solid #333; padding:4px 6px; text-align:center; font-size:9pt; font-weight:700; }

  /* CUT LINE */
  .cut-line { border-top:1px dashed #555; margin:8px 0; text-align:left; font-size:10pt; }

  /* CLIENT COPY */
  .client-copy { border:1px solid #333; padding:8px; margin-top:4px; }
  .client-copy-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
  .cc-name-row { display:flex; gap:6px; margin-top:4px; }
  .cc-name-cell { flex:1; border-bottom:1px solid #333; }
  .cc-name-cell .field-label { font-size:6.5pt; color:#555; }
  .cc-name-cell .value { font-size:9pt; font-weight:600; padding:2px 0; }
  .not-for-sale { text-align:center; font-size:8pt; font-weight:700; margin-top:6px; color:#1a5c2e; letter-spacing:.08em; }

  /* LAYOUT HELPERS */
  .mb4 { margin-bottom:6px; }
  .mt2 { margin-top:2px; }
  .mt4 { margin-top:4px; }
</style>
</head>
<body>
<div class="page">
  <div class="revised-note">REVISED VERSION IMSU-11-2020</div>

  <div class="form-header">
    <img src="https://i.postimg.cc/jq9DyDrX/DAPCA.png" style="width:60px;height:60px;object-fit:contain;">
    <div class="header-title">
      <h1>NCFRS ENROLLMENT FORM</h1>
      <h2>NATIONAL COCONUT FARMERS' REGISTRY SYSTEM (NCFRS)</h2>
    </div>
    <div class="header-right">
      <div>REFERENCE / CONTROL NO.: <span style="display:inline-block;min-width:100px;border-bottom:1px solid #333;">&nbsp;</span></div>
      <div style="margin-top:4px;">Date: ${todayBoxes} <span style="font-size:6.5pt">mm dd yyyy</span></div>
    </div>
  </div>

  <div class="new-existing">
    <span>${d.enroll_type==='New'?'☑':'☐'} New</span>
    <span>${d.enroll_type==='Existing'?'☑':'☐'} Existing</span>
  </div>

  <div class="note-row">
    <span>Write legibly and neatly (not in cursive handwriting)</span>
    <span>Items with * are mandatory fields and must not be left blank</span>
  </div>

  <!-- PART I -->
  <div class="section-header"><span class="circle-num" style="border-color:#fff;color:#fff">1</span> PART I. PERSONAL INFORMATION</div>

  <!-- 1. Name -->
  <div class="field-group mb4">
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">
      <span class="circle-num">1</span>
      <span class="field-label"><strong>NAME OF FARMER*</strong> — Last Name / First Name / Middle Name / Suffix</span>
    </div>
    <div class="name-row">
      <div class="name-cell"><span class="field-label">LN</span><br><strong style="font-size:10pt">${d.ln}</strong></div>
      <div class="name-cell"><span class="field-label">FN</span><br><strong style="font-size:10pt">${d.fn}</strong></div>
      <div class="name-cell"><span class="field-label">MN</span><br><strong style="font-size:10pt">${d.mn}</strong></div>
      <div class="name-cell"><span class="field-label">EN</span><br><strong style="font-size:10pt">${d.en}</strong></div>
    </div>
  </div>

  <!-- 2-5 -->
  <div style="display:grid;grid-template-columns:2fr 1fr 0.5fr;gap:6px;" class="mb4">
    <div>
      <div style="display:flex;align-items:center;gap:3px;"><span class="circle-num">2</span><span class="field-label"><strong>ADDRESS*</strong></span></div>
      <div style="display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:4px;margin-top:2px;">
        <div><span class="field-label">HOUSE/LOT/BLDG NO.</span><br>${d.addr_hno}</div>
        <div><span class="field-label">STREET/SITIO/SUBD.</span><br>${d.addr_street}</div>
        <div><span class="field-label">BARANGAY</span><br>${d.addr_brgy}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:4px;">
        <div><span class="field-label">MUNICIPALITY/CITY</span><br>${d.addr_mun}</div>
        <div><span class="field-label">PROVINCE</span><br>${d.addr_prov}</div>
        <div><span class="field-label">REGION</span><br>${d.addr_region}</div>
      </div>
    </div>
    <div>
      <div style="display:flex;align-items:center;gap:3px;"><span class="circle-num">3</span><span class="field-label"><strong>DATE OF BIRTH*</strong></span></div>
      <div style="margin-top:2px;">${dobBoxes(d.dob)}</div>
      <div style="font-size:6.5pt;color:#555;">mm dd yyyy</div>
      <div class="mt4" style="display:flex;align-items:center;gap:3px;"><span class="circle-num">5</span><span class="field-label"><strong>PLACE OF BIRTH</strong></span></div>
      <div>${d.pob}</div>
    </div>
    <div>
      <div style="display:flex;align-items:center;gap:3px;"><span class="circle-num">4</span><span class="field-label"><strong>SEX*</strong></span></div>
      <div class="check-row mt2">
        <span>${d.sex==='M'?'☑':'☐'} M</span>
        <span>${d.sex==='F'?'☑':'☐'} F</span>
      </div>
    </div>
  </div>

  <!-- 6-10 -->
  <div style="display:grid;grid-template-columns:1.2fr 1.8fr;gap:8px;" class="mb4">
    <div>
      <div style="display:flex;align-items:center;gap:3px;"><span class="circle-num">6</span><span class="field-label"><strong>CIVIL STATUS*</strong></span></div>
      <div class="check-row mt2" style="font-size:8pt;">
        <span>${d.civil==='Single'?'☑':'☐'} Single</span>
        <span>${d.civil==='Married'?'☑':'☐'} Married</span>
        <span>${d.civil==='Widowed'?'☑':'☐'} Widowed</span>
        <span>${d.civil==='Separated'?'☑':'☐'} Separated</span>
      </div>
      <div style="margin-top:4px;font-size:8pt;">
        <span class="circle-num">8</span> Gov't ID: ${d.govid==='Y'?'☑':'☐'} Y ${d.govid==='N'?'☑':'☐'} N &nbsp;
        Type: <strong>${d.id_type}</strong> &nbsp; No.: <strong>${d.id_no}</strong>
      </div>
      <div style="margin-top:4px;font-size:8pt;">
        <span class="circle-num">9</span> Contact: 1. <strong>${d.contact1}</strong> &nbsp; 2. <strong>${d.contact2}</strong>
      </div>
      <div style="margin-top:4px;font-size:8pt;">
        <span class="circle-num">10</span> Religion: <strong>${d.religion}</strong>
      </div>
    </div>
    <div>
      <div style="display:flex;align-items:center;gap:3px;"><span class="circle-num">7</span><span class="field-label"><strong>HIGHEST EDUCATIONAL ATTAINMENT*</strong></span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-top:3px;font-size:8pt;">
        <div>${eduCheck('Elem. Level')} Elem. Level &nbsp; ${eduCheck('Elem. Grad')} Elem. Grad</div>
        <div>${eduCheck('HS Level')} HS Level &nbsp; ${eduCheck('HS Grad.')} HS Grad.</div>
        <div>${eduCheck('College Level')} College Level &nbsp; ${eduCheck('College Grad.')} College Grad.</div>
        <div>${eduCheck('None')} None &nbsp; ${eduCheck('Vocational')} Vocational &nbsp; ${eduCheck('Postgraduate')} Postgraduate</div>
      </div>
    </div>
  </div>

  <!-- 11. Mother -->
  <div class="field-group mb4">
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;">
      <span class="circle-num">11</span>
      <span class="field-label"><strong>Mother's Maiden Name</strong></span>
    </div>
    <div class="name-row">
      <div class="name-cell"><span class="field-label">LN</span><br>${d.mom_ln}</div>
      <div class="name-cell"><span class="field-label">FN</span><br>${d.mom_fn}</div>
      <div class="name-cell"><span class="field-label">MN</span><br>${d.mom_mn}</div>
      <div class="name-cell"><span class="field-label">EN</span><br>${d.mom_en}</div>
    </div>
  </div>

  <!-- 12. Spouse -->
  <div class="field-group mb4">
    <div style="display:flex;align-items:center;gap:3px;margin-bottom:2px;">
      <span class="circle-num">12</span>
      <span class="field-label"><strong>Name/s of Legal Spouse/s</strong></span>
    </div>
    <table class="person-table">
      <thead>
        <tr>
          <th>LN</th><th>FN</th><th>MI</th>
          <th>Date of Birth of Spouse</th><th>Works in Coco Farm?</th><th>No. of Children</th>
        </tr>
      </thead>
      <tbody>${spouseRows}</tbody>
    </table>
  </div>

  <!-- 13. Children -->
  <div class="field-group mb4">
    <div style="display:flex;align-items:center;gap:3px;margin-bottom:2px;">
      <span class="circle-num">13</span>
      <span class="field-label"><strong>CHILDREN:</strong></span>
    </div>
    <table class="person-table">
      <thead>
        <tr>
          <th>#</th><th>LN</th><th>FN</th><th>MI</th>
          <th>M</th><th>F</th><th>DATE OF BIRTH</th><th>Works in Coco Farm?</th><th>Civil Status</th>
        </tr>
      </thead>
      <tbody>${childRows}</tbody>
    </table>
  </div>

  <!-- 14-15 -->
  <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:8px;" class="mb4">
    <div>
      <div style="display:flex;align-items:center;gap:3px;"><span class="circle-num">14</span><span class="field-label">Person to Notify in Case of Emergency</span></div>
      <div style="display:flex;gap:8px;margin-top:4px;font-size:8.5pt;">
        <div><span class="field-label">LN</span><br>${d.emrg_ln}</div>
        <div><span class="field-label">FN</span><br>${d.emrg_fn}</div>
        <div><span class="field-label">MI</span><br>${d.emrg_mi}</div>
        <div><span class="field-label">Contact No.</span><br>${d.emrg_contact}</div>
      </div>
    </div>
    <div>
      <div style="display:flex;align-items:center;gap:3px;"><span class="circle-num">15</span><span class="field-label"><strong>HOUSEHOLD HEAD?</strong></span>
        ${d.hhead==='Yes'?'☑':'☐'} Yes &nbsp; ${d.hhead==='No'?'☑':'☐'} No
      </div>
      <div style="font-size:8pt;margin-top:2px;">Relationship: ${d.hhead_rel} &nbsp; Members: ${d.hh_members}</div>
      <div style="display:flex;gap:8px;margin-top:2px;font-size:8.5pt;">
        <div><span class="field-label">LN</span><br>${d.hh_ln}</div>
        <div><span class="field-label">FN</span><br>${d.hh_fn}</div>
        <div><span class="field-label">MN</span><br>${d.hh_mn}</div>
        <div><span class="field-label">EN</span><br>${d.hh_en}</div>
      </div>
    </div>
  </div>

  <!-- 16-24 -->
  <div class="mb4">
    <div style="font-size:8.5pt;" class="mb4">
      <span class="circle-num">16</span>
      Occupation: <strong>${d.occ}</strong> &nbsp; Yr. Started: <strong>${d.occ_yr}</strong> &nbsp; Monthly Income: <strong>₱${d.occ_inc}</strong>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:8.5pt;" class="mb4">
      <div>
        <span class="circle-num">17</span> Agrarian Reform Beneficiary:
        ${d.agr==='Yes'?'☑':'☐'} Yes &nbsp; ${d.agr==='No'?'☑':'☐'} No &nbsp; Since: <strong>${d.agr_yr}</strong>
      </div>
      <div>
        <span class="circle-num">18</span> PWD:
        ${d.pwd==='Yes'?'☑':'☐'} Yes &nbsp; ${d.pwd==='No'?'☑':'☐'} No &nbsp; ${d.pwd_spec ? '— '+d.pwd_spec : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:8.5pt;" class="mb4">
      <div>
        <span class="circle-num">19</span> Gov't Program:
        ${d.govprg==='Yes'?'☑':'☐'} Yes &nbsp; ${d.govprg==='No'?'☑':'☐'} No<br>
        ${gpCheck('4Ps')} 4Ps &nbsp; ${gpCheck('SAP')} SAP &nbsp; ${gpCheck('Insurance')} Insurance &nbsp; ${gpCheck('Others')} Others<br>
        Yr. Participated: <strong>${d.govprg_yr}</strong>
      </div>
      <div>
        <span class="circle-num">20</span> Indigenous Group:
        ${d.indig==='Yes'?'☑':'☐'} Yes &nbsp; ${d.indig==='No'?'☑':'☐'} No ${d.indig_spec ? '— '+d.indig_spec : ''}
      </div>
    </div>
    <div class="mb4" style="font-size:8.5pt;">
      <span class="circle-num">21</span> PCA Programs:
      ${d.pca==='Yes'?'☑':'☐'} Yes &nbsp; ${d.pca==='No'?'☑':'☐'} No<br>
      ${pcaCheck('Seedlings')} Seedlings &nbsp; ${pcaCheck('Fertilizers')} Fertilizers &nbsp; ${pcaCheck('Incentives')} Incentives &nbsp;
      ${pcaCheck('Intercrops')} Intercrops &nbsp; ${pcaCheck('Livestock')} Livestock &nbsp; ${pcaCheck('Equipment')} Equipment &nbsp;
      ${pcaCheck('Training')} Training &nbsp; ${pcaCheck('Others')} Others<br>
      Yr. Participated: <strong>${d.pca_yr}</strong>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:8px;font-size:8.5pt;" class="mb4">
      <div>
        <span class="circle-num">22</span> Membership:
        ${d.memb==='Yes'?'☑':'☐'} Yes &nbsp; ${d.memb==='No'?'☑':'☐'} No<br>
        ${mbCheck('Cooperative')} Cooperative &nbsp; ${mbCheck("Farmers' Assoc.")} Farmers' Assoc. &nbsp; ${mbCheck('Others')} Others<br>
        Org. Name: <strong>${d.memb_org}</strong>
      </div>
      <div>
        <span class="circle-num">23</span> Year Started in Coco Farming: <strong>${d.coco_yr}</strong>
      </div>
    </div>
    <!-- 24. Farm Parcels -->
    <div style="font-size:8.5pt;">
      <div style="display:flex;align-items:center;gap:3px;margin-bottom:4px;">
        <span class="circle-num">24</span>
        <span class="field-label"><strong>NUMBER OF COCONUT FARM PARCELS OWNED, TENANTED, OR WORKED FOR</strong></span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:8.5pt;">
        <tr>
          <th style="border:1px solid #333;padding:3px;background:#ddd;text-align:center">Owner</th>
          <th style="border:1px solid #333;padding:3px;background:#ddd;text-align:center">Owner-Tiller</th>
          <th style="border:1px solid #333;padding:3px;background:#ddd;text-align:center">Grower</th>
          <th style="border:1px solid #333;padding:3px;background:#ddd;text-align:center">Tenant</th>
          <th style="border:1px solid #333;padding:3px;background:#ddd;text-align:center">Tenant-Worker</th>
          <th style="border:1px solid #333;padding:3px;background:#ddd;text-align:center">Worker-Laborer</th>
          <th style="border:1px solid #333;padding:3px;background:#ddd;text-align:center">Others</th>
          <th style="border:1px solid #333;padding:3px;background:#1a5c2e;color:#fff;text-align:center;font-weight:900">TOTAL PARCEL</th>
        </tr>
        <tr>
          <td class="parcels-cell">${d.p_owner||'0'}</td>
          <td class="parcels-cell">${d.p_ownertiller||'0'}</td>
          <td class="parcels-cell">${d.p_grower||'0'}</td>
          <td class="parcels-cell">${d.p_tenant||'0'}</td>
          <td class="parcels-cell">${d.p_tenantworker||'0'}</td>
          <td class="parcels-cell">${d.p_laborer||'0'}</td>
          <td class="parcels-cell">${d.p_others||'0'}</td>
          <td class="parcels-cell" style="background:#f5fbe8;color:#1a5c2e;font-size:11pt;">${d.p_total}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- CUT LINE -->
  <div class="cut-line">✂ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─</div>

  <!-- CLIENT COPY -->
  <div class="client-copy">
    <div class="client-copy-header">
      <img src="https://i.postimg.cc/jq9DyDrX/DAPCA.png" style="width:36px;height:36px;object-fit:contain;">
      <div style="flex:1;text-align:center;">
        <div style="font-size:9pt;font-weight:700;">NATIONAL COCONUT FARMERS' REGISTRY SYSTEM (NCFRS)</div>
        <div style="font-size:8pt;font-weight:600;">ENROLLMENT CLIENT'S COPY</div>
      </div>
      <div style="text-align:right;font-size:7.5pt;">
        <strong>REFERENCE / CONTROL NO.:</strong><br>
        <span style="display:inline-block;min-width:80px;border-bottom:1px solid #333;">&nbsp;</span><br>
        <strong>Date:</strong> ${todayBoxes}
      </div>
    </div>
    <div class="cc-name-row">
      <div class="cc-name-cell"><span class="field-label">LAST NAME</span><div class="value">${d.ln}</div></div>
      <div class="cc-name-cell"><span class="field-label">FIRST NAME</span><div class="value">${d.fn}</div></div>
      <div class="cc-name-cell"><span class="field-label">MIDDLE NAME</span><div class="value">${d.mn}</div></div>
      <div class="cc-name-cell"><span class="field-label">SUFFIX</span><div class="value">${d.en}</div></div>
    </div>
    <div class="not-for-sale">THIS FORM IS NOT FOR SALE</div>
  </div>

</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

// ── Wire up buttons after DOM is ready ────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('btn-prev').addEventListener('click', function () { navigate(-1); });
  document.getElementById('btn-next').addEventListener('click', function () { navigate(1); });
  document.querySelectorAll('#progress-tabs li[data-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () { goTo(parseInt(tab.dataset.tab)); });
  });
});