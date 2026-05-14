const firebaseConfig = {
  apiKey: "SECRET",
  authDomain: "pca-website-d2552.firebaseapp.com",
  projectId: "pca-website-d2552",
  storageBucket: "pca-website-d2552.appspot.com",
  messagingSenderId: "444810419373",
  appId: "1:444810419373:web:a5820613bd89fa7079fa24",
  measurementId: "G-E97QRFDBVB"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


const categoryIcons = {
  "application":   "fa-file-pen",
  "letter":        "fa-envelope",
  "certificate":   "fa-award",
  "permit":        "fa-id-card",
  "registration":  "fa-clipboard-list",
  "financial":     "fa-peso-sign",
  "report":        "fa-chart-bar",
  "default":       "fa-file-lines"
};

function getIcon(type) {
  if (!type) return categoryIcons["default"];
  const key = type.toLowerCase();
  for (const [k, v] of Object.entries(categoryIcons)) {
    if (key.includes(k)) return v;
  }
  return categoryIcons["default"];
}

let allForms = [];
let activeCategory = "all";

async function loadForms() {
  const container = document.getElementById("formsContainer");

  try {
    const snapshot = await db.collection("forms").orderBy("type").get();

    if (snapshot.empty) {
      container.innerHTML = `<div class="state-msg"><i class="fa fa-folder-open"></i>No forms available.</div>`;
      return;
    }

    allForms = [];
    const categories = new Set();

    snapshot.forEach(doc => {
      const data = doc.data();
      allForms.push(data);
      if (data.type) categories.add(data.type);
    });

    
    const filterRow = document.getElementById("filterRow");
    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "filter-pill";
      btn.textContent = cat;
      btn.dataset.cat = cat;
      btn.onclick = function() { setFilter(this); };
      filterRow.appendChild(btn);
    });

    renderForms();

  } catch (error) {
    console.error("Error loading forms:", error);
    container.innerHTML = `<div class="state-msg"><i class="fa fa-circle-exclamation"></i>Error loading forms. Please try again.</div>`;
  }
}

function setFilter(btn) {
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = btn.dataset.cat;
  renderForms();
}

function filterForms() {
  renderForms();
}

function renderForms() {
  const container = document.getElementById("formsContainer");
  const query = document.getElementById("searchInput").value.trim().toLowerCase();

  const filtered = allForms.filter(data => {
    const matchCat = activeCategory === "all" || data.type === activeCategory;
    const matchSearch = !query ||
      (data.title || "").toLowerCase().includes(query) ||
      (data.type || "").toLowerCase().includes(query) ||
      (data.description || "").toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="state-msg"><i class="fa fa-magnifying-glass"></i>No forms match your search.</div>`;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(data => container.appendChild(buildCard(data)));
}

function buildCard(data) {
  const card = document.createElement("div");
  card.className = "form-card";

  const iconClass = getIcon(data.type);

  card.innerHTML = `
    <div class="form-card-header">
      <div class="form-icon">
        <i class="fa ${iconClass}" style="color:rgba(255,255,255,0.85);"></i>
      </div>
      <div style="flex:1;min-width:0;">
        <div class="form-title">${data.title || "Untitled Form"}</div>
        <span class="form-category">${data.type || "General"}</span>
      </div>
    </div>
    ${data.description ? `<div class="form-desc">${data.description}</div>` : ""}
  `;

  
  if (data.fileURL) {
    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";

    const viewBtn = document.createElement("button");
    viewBtn.className = "view-btn";
    viewBtn.innerHTML = `<i class="fa fa-eye"></i> View`;
    viewBtn.onclick = () => window.open(data.fileURL, "_blank");

    const dlBtn = document.createElement("button");
    dlBtn.className = "dl-btn";
    dlBtn.innerHTML = `<i class="fa fa-download"></i> Download`;
    dlBtn.onclick = () => downloadFileURL(data.fileURL, data.fileName);

    btnRow.appendChild(viewBtn);
    btnRow.appendChild(dlBtn);
    card.appendChild(btnRow);

  } else if (data.fileBase64 && data.fileName) {
    const btnRow = document.createElement("div");
    btnRow.className = "btn-row";

    const viewBtn = document.createElement("button");
    viewBtn.className = "view-btn";
    viewBtn.innerHTML = `<i class="fa fa-eye"></i> View`;
    viewBtn.onclick = () => viewBase64(data.fileBase64);

    const dlBtn = document.createElement("button");
    dlBtn.className = "dl-btn";
    dlBtn.innerHTML = `<i class="fa fa-download"></i> Download`;
    dlBtn.onclick = () => downloadBase64(data.fileBase64, data.fileName);

    btnRow.appendChild(viewBtn);
    btnRow.appendChild(dlBtn);
    card.appendChild(btnRow);

  } else {
    const noFile = document.createElement("p");
    noFile.className = "no-file";
    noFile.innerHTML = `<i class="fa fa-clock" style="margin-right:4px;"></i>File not yet available`;
    card.appendChild(noFile);
  }

  return card;
}


function viewBase64(base64) {
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  const blob = new Blob([byteArr], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}


function downloadFileURL(url, fileName) {
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    window.open(url, "_blank");
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "form.pdf";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function downloadBase64(base64, fileName) {
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteArr[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteArr], { type: "application/pdf" });

  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    return;
  }

  if (window.navigator && window.navigator.msSaveBlob) {
    window.navigator.msSaveBlob(blob, fileName);
    return;
  }

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    const reader = new FileReader();
    reader.onloadend = function () {
      const link = document.createElement("a");
      link.href = reader.result;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    reader.readAsDataURL(blob);
    return;
  }

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

window.addEventListener("load", loadForms);