function toggleChat() {
  const chat = document.getElementById('chatBox');
  chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
}

function navigate(page) {
  document.body.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = page;
  }, 300);
}

const faqs = [
  { q: "How to apply for CocoScholar?", a: "Go to the Forms section and submit your application." },
  { q: "Where is PCA located?", a: "PCA offices are located nationwide." },
  { q: "What services does PCA offer?", a: "PCA supports coconut farmers through programs and assistance." },
  { q: "How to contact PCA?", a: "You can reach PCA via their website or hotline." },
  { q: "What is PCA certification?", a: "PCA certification can be requested through local offices or online forms." },
  { q: "Does PCA offer training?", a: "Yes, training programs are available for farmers and cooperatives." },
  { q: "How to provide feedback?", a: "Use the Satisfaction section to submit feedback on PCA services." },
  { q: "What programs are ongoing?", a: "Check the Schedule section for current PCA programs and events." },
  { q: "Can I visit PCA offices?", a: "Yes, office visits are allowed during government hours." },
  { q: "Where to download forms?", a: "All PCA forms are available in the Forms section of this website." }
];

function loadFAQs() {
  const chatBody = document.getElementById('chatBody');
  
  // Clear only buttons at bottom, keep previous messages
  const existingOptions = document.querySelector('.faq-btn-options');
  if (existingOptions) existingOptions.remove();

  faqs.forEach(faq => {
    const btn = document.createElement('div');
    btn.className = 'faq-btn';
    btn.innerText = faq.q;
    btn.onclick = () => sendFAQ(faq.q, faq.a);
    chatBody.appendChild(btn);
  });

  // None of these button (FB Live Chat)
  const noneBtn = document.createElement('div');
  noneBtn.className = 'faq-btn';
  noneBtn.innerText = "None of these? FB Live Chat";
  noneBtn.onclick = () => window.open("https://www.messenger.com/t/307579466015886/?messaging_source=source%3Apages%3Amessage_shortlink&source_id=1441792&recurring_notification=0", "_blank");
  chatBody.appendChild(noneBtn);

  chatBody.scrollTop = chatBody.scrollHeight;
}

function sendFAQ(question, answer) {
  const chatBody = document.getElementById('chatBody');

  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.innerText = question;
  chatBody.appendChild(userMsg);

  const typing = document.createElement('div');
  typing.className = 'message bot';
  typing.innerText = "Typing...";
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    typing.remove();

    const botMsg = document.createElement('div');
    botMsg.className = 'message bot';
    botMsg.innerText = answer;
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
      const followUp = document.createElement('div');
      followUp.className = 'message bot';
      followUp.innerText = "Did I answer your question?";
      chatBody.appendChild(followUp);

      const options = document.createElement('div');
      options.className = 'faq-btn-options';
      options.style.display = "flex";
      options.style.gap = "10px";
      options.style.marginTop = "8px";

      const yesBtn = document.createElement('button');
      yesBtn.innerText = "Yes";
      yesBtn.style.fontSize = "12px";
      yesBtn.style.padding = "6px 10px";
      yesBtn.onclick = () => {
        addBotMessage("Happy to help! 😊 If you have more questions, check the FAQs below.");
        setTimeout(loadFAQs, 500);
      };

      const noBtn = document.createElement('button');
      noBtn.innerText = "No";
      noBtn.style.fontSize = "12px";
      noBtn.style.padding = "6px 10px";
      noBtn.onclick = () => {
        setTimeout(loadFAQs, 500);
      };

      options.appendChild(yesBtn);
      options.appendChild(noBtn);
      chatBody.appendChild(options);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 500);

  }, 800);
}

function addBotMessage(text) {
  const chatBody = document.getElementById('chatBody');
  const msg = document.createElement('div');
  msg.className = 'message bot';
  msg.innerText = text;
  chatBody.appendChild(msg);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function applyRipple(e, element) {
  const circle = document.createElement('span');
  circle.classList.add('ripple');
  element.appendChild(circle);

  const x = e.clientX - element.offsetLeft;
  const y = e.clientY - element.offsetTop;

  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;

  setTimeout(() => circle.remove(), 500);
}

window.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', function (e) {
    if (e.target.tagName === "BUTTON") applyRipple(e, e.target);
  });

  if (document.getElementById('chatBody')) loadFAQs();

  const bubble = document.getElementById('chatBubble');
  if (bubble) setTimeout(() => { bubble.style.opacity = '0'; }, 10000);
});