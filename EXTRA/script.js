/* ══════════════════════════════════════════
   PCA CHATBOT — FREE, NO API, KEYWORD-BASED
   ══════════════════════════════════════════ */

const KB = [
  {
    keys: ['cocoscolar','cococholar','scholarship','scholar','study','education','tuition','school','college','university','student'],
    answer: 'CocoScholar is a scholarship program for children of registered coconut farmers. You can apply by filling out the application form available in the Forms section of this app or at your nearest PCA office.'
  },
  {
    keys: ['ncfrs','registry','register','registration','farmer id','farmer registration','how to register','sign up','enroll'],
    answer: 'The NCFRS (National Coconut Farmers Registration System) is the official registry for coconut farmers. Visit your nearest PCA provincial or regional office to register — bring a valid ID and proof of farm ownership or tenancy.'
  },
  {
    keys: ['form','forms','download','application','document','submit','fill'],
    answer: 'All PCA forms are available in the Forms section of this app. You can also download them at pca.gov.ph. Accomplished forms may be submitted to your nearest PCA office.'
  },
  {
    keys: ['contact','hotline','email','phone','call','reach','office','address','location','where is pca','find pca'],
    answer: 'You can reach PCA through their official website at pca.gov.ph, or visit any PCA regional or provincial office (Mon–Fri, 8AM–5PM). Their Facebook page is "Philippine Coconut Authority."'
  },
  {
    keys: ['program','programs','assistance','help','services','service','support','benefit','benefits'],
    answer: 'PCA offers many programs including CocoScholar (scholarships), seedling distribution, farm input assistance, CocoTech training, NCFRS farmer registration, and price monitoring. Visit pca.gov.ph for the full list.'
  },
  {
    keys: ['seedling','seedlings','planting','plant','coconut tree','variety','seed','sprout'],
    answer: 'PCA distributes quality coconut seedlings to registered farmers. Contact your nearest PCA office or check pca.gov.ph for the current seedling distribution schedule in your area.'
  },
  {
    keys: ['fertilizer','input','farm input','subsidy','free','material','supply'],
    answer: 'PCA provides farm input assistance including fertilizers and other materials to qualified coconut farmers. Requirements and availability vary by region — check with your local PCA office.'
  },
  {
    keys: ['cocotech','training','seminar','workshop','learn','technology','tech','livelihood'],
    answer: 'CocoTech is PCA\'s training program covering coconut farming best practices, processing, and livelihood opportunities. Schedules are posted at pca.gov.ph and on PCA\'s Facebook page.'
  },
  {
    keys: ['price','prices','market','trend','copra','oil','coconut oil','how much','cost','rate','worth'],
    answer: 'PCA monitors coconut product prices regularly. Check the latest Price Watch & Trends at pca.gov.ph/index.php/trade-market/price-watch-trends for up-to-date market information.'
  },
  {
    keys: ['feedback','complaint','complain','suggestion','rate','rating','satisfaction','survey','review'],
    answer: 'You can submit feedback through the Satisfaction section of this app. Your input helps PCA improve its services for coconut farmers.'
  },
  {
    keys: ['facebook','fb','social media','post','page','messenger','chat','message pca'],
    answer: 'PCA\'s official Facebook page is "Philippine Coconut Authority." You can message them directly for real-time assistance via the Messenger link in this app.'
  },
  {
    keys: ['what is pca','about pca','pca stand','mandate','mission','vision','agency','government'],
    answer: 'PCA stands for Philippine Coconut Authority, a government agency under the Department of Agriculture. It develops and regulates the coconut industry for the benefit of Filipino farmers and the national economy.'
  },
  {
    keys: ['schedule','event','activity','calendar','when','upcoming'],
    answer: 'PCA events and activities are announced on their Facebook page ("Philippine Coconut Authority") and at pca.gov.ph. Check the Latest Updates section of this app for recent posts.'
  },
  {
    keys: ['visit','office hours','open','close','working hours','business hours','holiday'],
    answer: 'PCA offices are open Monday to Friday, 8:00 AM to 5:00 PM, except on public holidays. Walk-in visits are welcome at any regional or provincial PCA office.'
  },
  {
    keys: ['certificate','certification','clearance','accreditation','license','permit'],
    answer: 'PCA certifications and clearances can be requested at your nearest PCA office or through the forms at pca.gov.ph. Requirements depend on the specific certification needed.'
  },
  {
    keys: ['cooperative','coop','organization','association','farmer group'],
    answer: 'PCA supports coconut farmer cooperatives through technical assistance, training, and access to programs. Contact your nearest PCA office to learn how your cooperative can benefit.'
  },
  {
    keys: ['loan','credit','lending','fund','grant','financial','money','cash'],
    answer: 'While PCA does not directly provide loans, it coordinates with LandBank and DBP for financing programs for coconut farmers. Ask your local PCA office for referrals to current financial assistance programs.'
  },
  {
    keys: ['insurance','crop insurance','damage','calamity','typhoon','flood','disaster'],
    answer: 'Coconut farmers affected by calamities may be eligible for crop insurance through PCIC (Philippine Crop Insurance Corporation). PCA can assist with relief and replanting assistance — contact your nearest office.'
  },
  {
    keys: ['statistic','data','production','area','hectare','report','research'],
    answer: 'Coconut statistics, production data, and research reports are available at pca.gov.ph/index.php/resources/coconut-statistics. PCA regularly publishes industry data and annual reports.'
  },
  {
    keys: ['hello','hi','hey','good morning','good afternoon','good evening','kumusta','musta','kamusta','greetings'],
    answer: 'Hello! How can I help you today? You can ask me about PCA programs, farmer registration, forms, scholarships, and more.'
  },
  {
    keys: ['thank','thanks','salamat','ty','appreciate','helpful','great','good job'],
    answer: 'You\'re welcome! If you have more questions about PCA services, feel free to ask anytime.'
  },
  {
    keys: ['bye','goodbye','paalam','exit','done','okay thanks','ok thanks','sige'],
    answer: 'Thank you for using the PCA chatbot! For more information, visit pca.gov.ph or drop by your nearest PCA office. Have a great day!'
  }
];

const FALLBACK = "I'm sorry, I don't have a specific answer for that. For accurate information, please visit pca.gov.ph, check the Forms section, or message PCA directly on Facebook at \"Philippine Coconut Authority\".";

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
          if (word.length > 3 && key.includes(word)) score += 1;
          if (key.length > 3 && word.includes(key))  score += 1;
        }
      }
    }
    if (score > bestScore) { bestScore = score; bestMatch = entry; }
  }

  return bestScore > 0 ? bestMatch.answer : FALLBACK;
}

/* ── CHAT STATE ── */
function toggleChat() {
  const chat = document.getElementById('chatBox');
  chat.style.display === 'flex' ? closeChat() : openChat();
}

function openChat() {
  const chat = document.getElementById('chatBox');
  chat.style.display = 'flex';
  chat.classList.remove('minimized');
  if (document.getElementById('chatBody').children.length === 0) initChat();
}

function closeChat() {
  const chat = document.getElementById('chatBox');
  chat.style.display = 'none';
  chat.classList.remove('minimized');
}

function minimizeChat() {
  document.getElementById('chatBox').classList.toggle('minimized');
}

function navigate(page) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = page; }, 300);
}

/* ── SUGGESTIONS ── */
const SUGGESTIONS = [
  'How do I apply for CocoScholar?',
  'What programs does PCA offer?',
  'Where can I download forms?',
  'How do I register as a coconut farmer?',
  'What is the NCFRS?',
  'How to contact PCA?',
  'What is CocoTech?',
  'How do I check coconut prices?',
];

function initChat() {
  addBotMessage("Hello! I'm the PCA Chatbot. Ask me anything about PCA services, programs, or farmer assistance.", false);
  setTimeout(() => showSuggestions(), 400);
}

function showSuggestions() {
  const chatBody = document.getElementById('chatBody');
  const old = chatBody.querySelector('.suggestions-wrap');
  if (old) old.remove();

  const wrap = document.createElement('div');
  wrap.className = 'suggestions-wrap';
  wrap.innerHTML = '<p class="suggestions-label">Quick questions:</p>';
  SUGGESTIONS.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.textContent = q;
    btn.onclick = () => { wrap.remove(); sendQuestion(q); };
    wrap.appendChild(btn);
  });
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
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

function addBotMessage(text, animate) {
  if (animate === undefined) animate = true;
  const chatBody = document.getElementById('chatBody');
  const msg = document.createElement('div');
  msg.className = 'message bot';
  if (animate) {
    msg.textContent = '';
    chatBody.appendChild(msg);
    let i = 0;
    const iv = setInterval(() => {
      msg.textContent += text[i++];
      chatBody.scrollTop = chatBody.scrollHeight;
      if (i >= text.length) clearInterval(iv);
    }, 16);
  } else {
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
}

/* ── SEND (local, free) ── */
function sendQuestion(input) {
  const text = input.trim();
  if (!text) return;

  addUserMessage(text);
  showTypingIndicator();

  const answer = findAnswer(text);
  const delay = 700 + Math.min(answer.length * 1.5, 900);

  setTimeout(function() {
    removeTypingIndicator();
    addBotMessage(answer, true);
    setTimeout(function() {
      addBotMessage('Do you have another question?', false);
      setTimeout(showSuggestions, 300);
    }, answer.length * 16 + 500);
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
    '<input type="text" id="chatInput" class="chat-input" placeholder="Type your question\u2026" maxlength="300" />' +
    '<button class="chat-send-btn" id="chatSendBtn" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>';
  chatBox.appendChild(inputArea);

  var input = document.getElementById('chatInput');
  var btn   = document.getElementById('chatSendBtn');

  function handleSend() {
    var text = input.value.trim();
    if (!text) return;
    var wrap = document.querySelector('.suggestions-wrap');
    if (wrap) wrap.remove();
    input.value = '';
    sendQuestion(text);
  }

  btn.onclick = handleSend;
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') handleSend(); });
}

/* ── RIPPLE ── */
function applyRipple(e, el) {
  var circle = document.createElement('span');
  circle.classList.add('ripple');
  el.appendChild(circle);
  var r = el.getBoundingClientRect();
  circle.style.left = (e.clientX - r.left) + 'px';
  circle.style.top  = (e.clientY - r.top)  + 'px';
  setTimeout(function() { circle.remove(); }, 500);
}

/* ── FACEBOOK FEED ── */
async function loadFeed() {
  var container = document.getElementById('fb-feed');
  var RSS_URL = 'https://rss.app/feeds/v1.1/PtJHeHXlHaSviAeB.json';
  var FB_PAGE = 'https://www.facebook.com/PhilippineCoconutAuthority';

  container.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.6);font-size:13px;">Loading posts...</div>';

  try {
    var res  = await fetch(RSS_URL);
    var data = await res.json();
    var items = (data.items || []).slice(0, 5);
    if (!items.length) throw new Error('empty');

    container.innerHTML = '';
    items.forEach(function(item) {
      var date = new Date(item.date_published || item.pubDate).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' });
      var text = (item.content_text || (item.content_html && item.content_html.replace(/<[^>]+>/g,'')) || item.summary || '').trim();
      var img  = item.image || item.banner_image || null;
      var url  = item.url || FB_PAGE;

      var card = document.createElement('div');
      card.className = 'fb-post-card';
      card.innerHTML =
        (img ? '<img src="' + img + '" alt="" class="fb-post-img">' : '') +
        '<div class="fb-post-body">' +
          '<p class="fb-post-date">' + date + '</p>' +
          '<p class="fb-post-text">' + (text.length > 220 ? text.slice(0,220) + '\u2026' : text) + '</p>' +
          '<a href="' + url + '" target="_blank" class="fb-post-link">View on Facebook \u2192</a>' +
        '</div>';
      container.appendChild(card);
    });

    var btn = document.createElement('a');
    btn.href = FB_PAGE; btn.target = '_blank';
    btn.className = 'fb-see-more';
    btn.textContent = 'See more on Facebook';
    container.appendChild(btn);

  } catch(err) {
    container.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.6);font-size:13px;">Could not load posts.</div>';
  }
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') applyRipple(e, e.target);
  });
  setupChatInput();
  var bubble = document.getElementById('chatBubble');
  if (bubble) setTimeout(function() { bubble.style.opacity = '0'; }, 10000);
  loadFeed();
});