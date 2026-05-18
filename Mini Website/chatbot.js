/* ══════════════════════════════════════════
   PCA CHATBOT — chatbot.js
   Expanded KB · Smart feedback flow · No minimize
   ══════════════════════════════════════════ */

/* ── KNOWLEDGE BASE ── */
const KB = [

  /* GREETINGS */
  {
    keys: ['hello','hi','hey','good morning','good afternoon','good evening',
           'kumusta','musta','kamusta','greetings','sup','yo','oi','hoy'],
    answer: 'Hello! Magandang araw! I\'m the PCA Chatbot. Ask me anything about PCA programs, services, farmer registration, scholarships, and more.'
  },

  /* FAREWELL */
  {
    keys: ['bye','goodbye','paalam','exit','done','okay thanks','ok thanks','sige','salamat na','wala na'],
    answer: 'Thank you for using the PCA Services app! For more information, visit pca.gov.ph or drop by your nearest PCA office. Have a great day!'
  },

  /* THANKS */
  {
    keys: ['thank','thanks','salamat','ty','appreciate','helpful','great','good job','nice','galing'],
    answer: 'You\'re very welcome! If you have more questions about PCA services, feel free to ask anytime.'
  },

  /* ── LOCATION / ADDRESS ── */
  {
    keys: ['saan','where','location','address','main office','main branch','head office',
           'headquarters','hq','central office','pca building','nasa saan','lugar',
           'located','building','main','branch'],
    answer: 'The PCA Main Office (Central Office) is located at:\n\n📍 PCA Building, Elliptical Road, Diliman, Quezon City, Metro Manila.\n\nOffice hours: Monday–Friday, 8:00 AM – 5:00 PM (except public holidays).\n\nFor regional and provincial offices, visit pca.gov.ph or call the main office for referral.'
  },

  /* CONTACT */
  {
    keys: ['contact','hotline','email','phone','call','reach','telephone','number',
           'how to contact','how to reach','linya','tawagan','opisina'],
    answer: 'You can reach PCA through:\n\n📞 Trunk line: (02) 8920-2241 to 65\n📧 Email: pcacentraloffice@pca.gov.ph\n🌐 Website: pca.gov.ph\n📘 Facebook: "Philippine Coconut Authority"\n\nOffice hours: Mon–Fri, 8AM–5PM.'
  },

  /* NCFRS / FARMER REGISTRATION */
  {
    keys: ['ncfrs','registry','register','registration','farmer id','farmer registration',
           'how to register','sign up','enroll','mag-register','paano mag-register',
           'farmer card','id card','coconut farmer id'],
    answer: 'The NCFRS (National Coconut Farmers Registration System) is the official registry for coconut farmers.\n\nTo register:\n1. Go to your nearest PCA provincial or regional office.\n2. Bring a valid government-issued ID.\n3. Bring proof of farm ownership or tenancy (e.g. land title, lease agreement, barangay certification).\n4. Fill out the NCFRS registration form (also available in the Forms section of this app).\n\nRegistration is FREE. Visit pca.gov.ph/ncfrs-checker to check your registration status.'
  },

  /* COCOSCOLAR / SCHOLARSHIP */
  {
    keys: ['cocoscolar','cococholar','scholarship','scholar','study','education',
           'tuition','school','college','university','student','allowance',
           'stipend','grant','iskolar','pag-aaral'],
    answer: 'CocoScholar is a scholarship program for children and dependents of registered coconut farmers.\n\nBenefits include tuition assistance and monthly stipends.\n\nRequirements:\n• Parent/guardian must be a registered NCFRS coconut farmer.\n• Applicant must be enrolled or about to enroll in college/vocational course.\n• Accomplished CocoScholar application form.\n\nDownload the form in the Forms section of this app or at your nearest PCA office. Applications are accepted annually — watch PCA\'s Facebook page for open application periods.'
  },

  /* FORMS */
  {
    keys: ['form','forms','download','application','document','submit','fill',
           'where to get form','pano kumuha ng form','requirements'],
    answer: 'All PCA forms are available in the Forms section of this app. You can also download them directly at pca.gov.ph.\n\nAccomplished forms may be submitted to your nearest PCA regional or provincial office. Some forms can be submitted via email — check pca.gov.ph for the specific process per form.'
  },

  /* PROGRAMS & SERVICES */
  {
    keys: ['program','programs','assistance','help','services','service','support',
           'benefit','benefits','what does pca do','ano ang ginagawa ng pca',
           'tulong','serbisyo'],
    answer: 'PCA offers a wide range of programs for coconut farmers:\n\n🌱 Seedling Distribution\n📚 CocoScholar Scholarships\n🔬 CocoTech Training\n💊 Farm Input Assistance (fertilizers, etc.)\n📋 NCFRS Farmer Registration\n📈 Price Watch & Market Monitoring\n🤝 Cooperative Development\n💰 Financial Assistance Referrals (LandBank, DBP)\n🌀 Calamity Relief & Replanting\n\nVisit pca.gov.ph for the complete list and latest programs.'
  },

  /* SEEDLINGS */
  {
    keys: ['seedling','seedlings','planting','plant','coconut tree','variety',
           'seed','sprout','puno','punla','lahi','variety ng niyog'],
    answer: 'PCA distributes quality coconut seedlings to registered farmers at subsidized or no cost.\n\nTo avail:\n1. Be a registered NCFRS coconut farmer.\n2. Coordinate with your nearest PCA provincial office.\n3. Present your NCFRS farmer ID or registration.\n\nAvailable varieties include Tall, Dwarf, and Hybrid (MAWA, PCA 15-1, etc.). Schedules vary by region — contact your local PCA office for the latest schedule.'
  },

  /* FERTILIZER / FARM INPUTS */
  {
    keys: ['fertilizer','input','farm input','subsidy','free','material','supply',
           'abono','pataba','libreng','libre'],
    answer: 'PCA provides farm input assistance to qualified coconut farmers, which may include fertilizers, herbicides, and other agricultural materials.\n\nEligibility is typically based on NCFRS registration and farm size. Requirements and availability vary by region — coordinate with your local PCA provincial office for current programs.'
  },

  /* COCOTECH */
  {
    keys: ['cocotech','training','seminar','workshop','learn','technology','tech',
           'livelihood','skills','magsasaka','pagsasanay','teknolohiya'],
    answer: 'CocoTech is PCA\'s technology transfer and training program covering:\n\n• Best farming practices\n• Coconut processing (virgin coconut oil, coco vinegar, etc.)\n• Livelihood and value-adding opportunities\n• Post-harvest techniques\n\nTraining schedules are posted at pca.gov.ph and on PCA\'s official Facebook page. Training is usually FREE for registered coconut farmers.'
  },

  /* PRICE / MARKET */
  {
    keys: ['price','prices','market','trend','copra','oil','coconut oil',
           'how much','cost','rate','worth','presyo','magkano','copra price',
           'niyog price','halaga'],
    answer: 'PCA monitors coconut product prices regularly, including copra, coconut oil, coco sugar, and other derivatives.\n\n📊 Check the latest Price Watch & Trends at:\npca.gov.ph/index.php/trade-market/price-watch-trends\n\nPrices are updated weekly and vary by region.'
  },

  /* FEEDBACK / SATISFACTION */
  {
    keys: ['feedback','complaint','complain','suggestion','rate','rating',
           'satisfaction','survey','review','reklamo','mungkahi','puna'],
    answer: 'You can submit your feedback or complaints through the Satisfaction section of this app. Your input helps PCA improve its services for coconut farmers and the public.\n\nFor formal complaints, you may also write to pcacentraloffice@pca.gov.ph or visit any PCA office.'
  },

  /* FACEBOOK / SOCIAL MEDIA */
  {
    keys: ['facebook','fb','social media','post','page','messenger','chat',
           'message pca','social','online','follow'],
    answer: 'PCA\'s official Facebook page is "Philippine Coconut Authority." You can follow them for announcements, updates, and programs. You can also send them a direct message via Messenger for real-time assistance.'
  },

  /* ABOUT PCA */
  {
    keys: ['what is pca','about pca','pca stand','mandate','mission','vision',
           'agency','government','ano ang pca','tungkol sa pca','history'],
    answer: 'PCA stands for Philippine Coconut Authority. It is a government agency under the Department of Agriculture.\n\nMandate: To develop and regulate the coconut industry for the benefit of Filipino coconut farmers and the national economy.\n\nFounded: 1973 under Presidential Decree No. 232.\n\nMain Office: Elliptical Road, Diliman, Quezon City.'
  },

  /* OFFICE HOURS */
  {
    keys: ['schedule','office hours','open','close','working hours','business hours',
           'holiday','oras','bukas','sarado','lunes','biyernes','monday','friday'],
    answer: 'PCA offices are open Monday to Friday, 8:00 AM to 5:00 PM, except on official public holidays.\n\nWalk-in visits are welcome at the Main Office (Elliptical Rd., Diliman, Quezon City) and any regional or provincial PCA office.'
  },

  /* CERTIFICATION / CLEARANCE */
  {
    keys: ['certificate','certification','clearance','accreditation','license',
           'permit','sertipiko','katibayan','pahintulot'],
    answer: 'PCA certifications and clearances (e.g., for coconut product exporters, dealers, or processors) can be requested at your nearest PCA office or through pca.gov.ph.\n\nRequirements vary depending on the specific certification. Bring valid IDs and supporting documents, and allow processing time of 3–5 working days for most certifications.'
  },

  /* COOPERATIVES */
  {
    keys: ['cooperative','coop','organization','association','farmer group',
           'kooperatiba','samahan','grupo','organisasyon'],
    answer: 'PCA supports coconut farmer cooperatives through:\n\n• Technical assistance and training\n• Access to seedlings and farm inputs\n• CocoTech technology transfer\n• Linkage to financing institutions\n\nContact your nearest PCA provincial office to register your cooperative or learn about available support programs.'
  },

  /* LOANS / FINANCIAL */
  {
    keys: ['loan','credit','lending','fund','grant','financial','money','cash',
           'utang','pera','pautang','tulong pinansyal','LandBank','DBP'],
    answer: 'PCA does not directly provide loans, but it coordinates with the following for financing:\n\n🏦 LandBank of the Philippines — Sikat Saka Program\n🏦 Development Bank of the Philippines (DBP) — Agri-financing\n\nPCA can assist with referrals and documentation. Visit your nearest PCA office or check pca.gov.ph for current financial assistance programs available in your area.'
  },

  /* INSURANCE / CALAMITY */
  {
    keys: ['insurance','crop insurance','damage','calamity','typhoon','flood',
           'disaster','bagyo','baha','lindol','sakuna','sira','nawasak'],
    answer: 'Coconut farmers affected by calamities (typhoon, flood, drought, etc.) may be eligible for:\n\n🌀 Crop Insurance through PCIC (Philippine Crop Insurance Corporation)\n🌱 Replanting assistance from PCA\n💊 Emergency farm input distribution\n\nContact your nearest PCA provincial office immediately after a calamity to file for assistance. Bring photos of the damage if possible.'
  },

  /* STATISTICS / DATA */
  {
    keys: ['statistic','data','production','area','hectare','report','research',
           'istatistika','datos','ulat','pananaliksik','survey'],
    answer: 'Coconut statistics, production data, and industry reports are published by PCA at:\n\npca.gov.ph/index.php/resources/coconut-statistics\n\nThis includes data on farm area, production volume, farmer population, and regional breakdowns. Annual reports are also available on the website.'
  },

  /* EVENTS */
  {
    keys: ['event','activity','calendar','when','upcoming','announcement',
           'aktibidad','kaganapan','balita','news','update'],
    answer: 'PCA events, activities, and announcements are posted on:\n\n📘 Facebook: "Philippine Coconut Authority"\n🌐 Website: pca.gov.ph\n📲 Latest Updates section of this app (powered by their Facebook feed)\n\nCheck back regularly for seminar schedules, distribution events, and application periods.'
  },

  /* GAD */
  {
    keys: ['gad','gender','women','equality','feminist','women farmer','kababaihan'],
    answer: 'PCA has a Gender and Development (GAD) program that ensures women coconut farmers have equal access to PCA services and programs.\n\nLearn more at: pca.gov.ph or visit the GAD section accessible from the Partner Links in this app.'
  },

  /* NCFRS CHECKER */
  {
    keys: ['checker','check registration','verify','verify registration','am i registered',
           'registered na ba','status','check status'],
    answer: 'You can verify your NCFRS registration status online at:\n\n🔗 pca.gov.ph/ncfrs-checker\n\nYou\'ll need your name and other personal details to search the registry. If you\'re not yet registered, visit your nearest PCA provincial office.'
  },

  /* VIRGIN COCONUT OIL / PRODUCTS */
  {
    keys: ['virgin coconut oil','vco','coco sugar','coconut vinegar','coco vinegar',
           'coconut product','coco product','nata de coco','coconut milk','gata',
           'langis ng niyog','coconut water'],
    answer: 'PCA promotes various coconut-based products including:\n\n🥥 Virgin Coconut Oil (VCO)\n🍬 Coconut Sugar\n🍶 Coconut Vinegar\n🥛 Coconut Milk\n💧 Coconut Water\n🧪 Coco Coir, Activated Carbon, and more\n\nFor product information, processing guides, and market links, visit:\npca.gov.ph/index.php/2-uncategorised/189-coconut-gallery-2\n\nCocoTech training also covers how to process these products.'
  },

  /* AVIATION FUEL / BIOFUEL */
  {
    keys: ['biofuel','aviation fuel','fuel','diesel','energy','kuryente','enerhiya'],
    answer: 'PCA and the Department of Energy (DOE) are promoting coconut-based biofuel, including coconut methyl ester (CME) as an alternative to diesel and coconut oil as a potential aviation fuel.\n\nThis initiative supports both the energy sector and coconut farmers by creating additional demand for coconut products. Watch pca.gov.ph for updates.'
  },

];

/* ── FALLBACK ── */
const FALLBACK = 'I\'m sorry, I don\'t have a specific answer for that yet. For accurate information, please:\n\n🌐 Visit pca.gov.ph\n📘 Message PCA on Facebook: "Philippine Coconut Authority"\n📞 Call: (02) 8920-2241 to 65\n📍 Visit any PCA office (Mon–Fri, 8AM–5PM)';

/* ── FIND ANSWER ── */
function findAnswer(input) {
  const clean = input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/);
  let bestMatch = null, bestScore = 0;

  for (const entry of KB) {
    let score = 0;
    for (const key of entry.keys) {
      if (clean.includes(key)) {
        score += key.split(' ').length * 2;
      } else {
        for (const word of words) {
          if (word.length > 2 && key.includes(word)) score += 1;
          if (key.length > 2 && word.includes(key))  score += 1;
        }
      }
    }
    if (score > bestScore) { bestScore = score; bestMatch = entry; }
  }

  return bestScore > 0 ? bestMatch.answer : null;
}

/* ── CHAT STATE ── */
function toggleChat() {
  const chat = document.getElementById('chatBox');
  chat.style.display === 'flex' ? closeChat() : openChat();
}

function openChat() {
  const chat = document.getElementById('chatBox');
  chat.style.display = 'flex';
  if (document.getElementById('chatBody').children.length === 0) initChat();
}

function closeChat() {
  document.getElementById('chatBox').style.display = 'none';
}

function navigate(page) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = page; }, 300);
}

/* ── QUICK SUGGESTIONS ── */
const SUGGESTIONS = [
  'Saan ang main office ng PCA?',
  'Paano mag-register sa NCFRS?',
  'Ano ang CocoScholar?',
  'Anong programs ang meron ang PCA?',
  'Paano makuha ng seedlings?',
  'Anong oras bukas ang PCA?',
  'Paano makipag-ugnayan sa PCA?',
  'Paano mag-download ng forms?',
  'Ano ang CocoTech?',
  'Ano ang presyo ng copra?',
];

/* Keys that are purely conversational — skip feedback buttons after these */
const CONVERSATIONAL_KEYS = [
  'hello','hi','hey','good morning','good afternoon','good evening',
  'kumusta','musta','kamusta','greetings','sup','yo','oi','hoy',
  'thank','thanks','salamat','ty','appreciate','helpful','great','good job','nice','galing',
  'bye','goodbye','paalam','exit','done','okay thanks','ok thanks','sige','salamat na','wala na'
];

function isConversational(input) {
  const clean = input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  return CONVERSATIONAL_KEYS.some(k =>
    clean === k ||
    clean.startsWith(k + ' ') ||
    clean.endsWith(' ' + k) ||
    clean.includes(' ' + k + ' ')
  );
}

function initChat() {
  addBotMessage("Hello! Magandang araw! 👋 I'm the PCA Chatbot. Ask me anything about PCA services, programs, or farmer assistance.", false, () => {
    setTimeout(showSuggestions, 300);
  });
}

function showSuggestions() {
  const chatBody = document.getElementById('chatBody');
  removeSuggestions();

  const wrap = document.createElement('div');
  wrap.className = 'suggestions-wrap';
  wrap.innerHTML = '<p class="suggestions-label">Quick questions:</p>';
  SUGGESTIONS.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.textContent = q;
    btn.onclick = () => { removeSuggestions(); sendQuestion(q); };
    wrap.appendChild(btn);
  });
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeSuggestions() {
  const old = document.querySelector('.suggestions-wrap');
  if (old) old.remove();
  const oldFb = document.querySelector('.feedback-wrap');
  if (oldFb) oldFb.remove();
}

/* ── FEEDBACK BUTTONS (Did this help?) ── */
function showFeedbackButtons() {
  const chatBody = document.getElementById('chatBody');
  removeSuggestions();

  const wrap = document.createElement('div');
  wrap.className = 'feedback-wrap';

  const label = document.createElement('p');
  label.className = 'suggestions-label';
  label.textContent = 'Did this answer your question?';
  wrap.appendChild(label);

  const row = document.createElement('div');
  row.className = 'feedback-row';

  const yesBtn = document.createElement('button');
  yesBtn.className = 'feedback-btn yes';
  yesBtn.innerHTML = '👍 Yes';
  yesBtn.onclick = () => {
    wrap.remove();
    handleFeedbackYes();
  };

  const noBtn = document.createElement('button');
  noBtn.className = 'feedback-btn no';
  noBtn.innerHTML = '👎 No';
  noBtn.onclick = () => {
    wrap.remove();
    handleFeedbackNo();
  };

  row.appendChild(yesBtn);
  row.appendChild(noBtn);
  wrap.appendChild(row);
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function handleFeedbackYes() {
  const chatBody = document.getElementById('chatBody');

  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.textContent = 'Happy to help! 😊';
  chatBody.appendChild(msg);

  const wrap = document.createElement('div');
  wrap.className = 'feedback-wrap';
  const btn = document.createElement('button');
  btn.className = 'suggestion-btn';
  btn.textContent = 'Do you have any more questions?';
  btn.onclick = () => {
    wrap.remove();
    showSuggestions();
  };
  wrap.appendChild(btn);
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function handleFeedbackNo() {
  const chatBody = document.getElementById('chatBody');
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.textContent = 'Sorry about that! Here are some things I can help with — or you can type your question below.';
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
  setTimeout(showSuggestions, 200);
}

/* ── TYPING INDICATOR ── */
function showTypingIndicator() {
  const chatBody = document.getElementById('chatBody');
  const el = document.createElement('div');
  el.className = 'message bot typing-indicator';
  el.id = 'typingIndicator';
  el.innerHTML = '<span></span><span></span><span></span>';
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

/* ── MESSAGES ── */
function addUserMessage(text) {
  const chatBody = document.getElementById('chatBody');
  const msg = document.createElement('div');
  msg.className = 'message user';
  msg.textContent = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addBotMessage(text, animate, onDone) {
  if (animate === undefined) animate = true;
  const chatBody = document.getElementById('chatBody');
  const msg = document.createElement('div');
  msg.className = 'message bot';
  // Preserve line breaks
  if (animate) {
    msg.style.whiteSpace = 'pre-line';
    msg.textContent = '';
    chatBody.appendChild(msg);
    let i = 0;
    const iv = setInterval(() => {
      msg.textContent += text[i++];
      chatBody.scrollTop = chatBody.scrollHeight;
      if (i >= text.length) {
        clearInterval(iv);
        if (onDone) onDone();
      }
    }, 12);
  } else {
    msg.style.whiteSpace = 'pre-line';
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
    if (onDone) onDone();
  }
}

/* ── SEND ── */
function sendQuestion(input) {
  const text = input.trim();
  if (!text) return;

  removeSuggestions();
  addUserMessage(text);
  showTypingIndicator();

  const matched = findAnswer(text);
  const answer = matched || FALLBACK;
  const delay = 600 + Math.min(answer.length * 1.2, 800);

  setTimeout(() => {
    removeTypingIndicator();
    addBotMessage(answer, true, () => {
      if (isConversational(text)) {
        setTimeout(showSuggestions, 300);
      } else {
        setTimeout(showFeedbackButtons, 400);
      }
    });
  }, delay);
}

/* ── CHAT INPUT ── */
function setupChatInput() {
  const chatBox = document.getElementById('chatBox');
  if (!chatBox || document.getElementById('chatInputArea')) return;

  const inputArea = document.createElement('div');
  inputArea.id = 'chatInputArea';
  inputArea.className = 'chat-input-area';
  inputArea.innerHTML =
    '<input type="text" id="chatInput" class="chat-input" placeholder="Type your question…" maxlength="300" />' +
    '<button class="chat-send-btn" id="chatSendBtn" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>';
  chatBox.appendChild(inputArea);

  const input = document.getElementById('chatInput');
  const btn   = document.getElementById('chatSendBtn');

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendQuestion(text);
  }

  btn.onclick = handleSend;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
}

/* ── RIPPLE ── */
function applyRipple(e, el) {
  const circle = document.createElement('span');
  circle.classList.add('ripple');
  el.appendChild(circle);
  const r = el.getBoundingClientRect();
  circle.style.left = (e.clientX - r.left) + 'px';
  circle.style.top  = (e.clientY - r.top)  + 'px';
  setTimeout(() => circle.remove(), 500);
}

/* ── FACEBOOK FEED ── */
async function loadFeed() {
  const container = document.getElementById('fb-feed');
  const RSS_URL = 'https://rss.app/feeds/v1.1/PtJHeHXlHaSviAeB.json';
  const FB_PAGE = 'https://www.facebook.com/PhilippineCoconutAuthority';

  container.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.6);font-size:13px;">Loading posts...</div>';

  try {
    const res  = await fetch(RSS_URL);
    const data = await res.json();
    const items = (data.items || []).slice(0, 5);
    if (!items.length) throw new Error('empty');

    container.innerHTML = '';
    items.forEach(item => {
      const date = new Date(item.date_published || item.pubDate)
        .toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' });
      const text = (item.content_text || (item.content_html && item.content_html.replace(/<[^>]+>/g,'')) || item.summary || '').trim();
      const img  = item.image || item.banner_image || null;
      const url  = item.url || FB_PAGE;

      const card = document.createElement('div');
      card.className = 'fb-post-card';
      card.innerHTML =
        (img ? '<img src="' + img + '" alt="" class="fb-post-img">' : '') +
        '<div class="fb-post-body">' +
          '<p class="fb-post-date">' + date + '</p>' +
          '<p class="fb-post-text">' + (text.length > 220 ? text.slice(0,220) + '…' : text) + '</p>' +
          '<a href="' + url + '" target="_blank" class="fb-post-link">View on Facebook →</a>' +
        '</div>';
      container.appendChild(card);
    });

    const btn = document.createElement('a');
    btn.href = FB_PAGE; btn.target = '_blank';
    btn.className = 'fb-see-more';
    btn.textContent = 'See more on Facebook';
    container.appendChild(btn);

  } catch(err) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.6);font-size:13px;">Could not load posts.</div>';
  }
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') applyRipple(e, e.target);
  });
  setupChatInput();
  const bubble = document.getElementById('chatBubble');
  if (bubble) setTimeout(() => { bubble.style.opacity = '0'; }, 10000);
  loadFeed();
});