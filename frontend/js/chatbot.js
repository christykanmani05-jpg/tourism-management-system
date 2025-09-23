(function () {
  if (window.__triotrailsChatbotLoaded) return;
  window.__triotrailsChatbotLoaded = true;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    .tt-chat-launcher{position:fixed;right:20px;bottom:20px;background:#0057b8;color:#fff;border:none;border-radius:50%;width:56px;height:56px;box-shadow:0 8px 24px rgba(0,0,0,.2);cursor:pointer;z-index:2147483000;display:flex;align-items:center;justify-content:center;font-size:22px}
    .tt-chat-launcher:hover{background:#00408a}
    .tt-chat-panel{position:fixed;right:20px;bottom:90px;width:320px;max-height:70vh;background:#fff;border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.2);display:none;flex-direction:column;overflow:hidden;z-index:2147483000;border:1px solid #e6e6e6}
    .tt-chat-header{background:linear-gradient(90deg,#0057b8,#00aaff);color:#fff;padding:12px 14px;display:flex;align-items:center;justify-content:space-between}
    .tt-chat-title{font-weight:700;font-size:14px}
    .tt-chat-close{background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer}
    .tt-chat-body{padding:10px;overflow:auto;flex:1;background:#f7f9fb}
    .tt-msg{margin:8px 0;max-width:85%;padding:10px 12px;border-radius:12px;line-height:1.3;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .tt-msg-user{margin-left:auto;background:#0057b8;color:#fff;border-bottom-right-radius:4px}
    .tt-msg-bot{margin-right:auto;background:#fff;color:#333;border:1px solid #e6e6e6;border-bottom-left-radius:4px}
    .tt-chat-input{display:flex;gap:8px;padding:10px;background:#fff;border-top:1px solid #eee}
    .tt-chat-input input{flex:1;border:1px solid #ddd;border-radius:20px;padding:10px 12px;font-size:13px}
    .tt-chat-input button{background:#0057b8;color:#fff;border:none;border-radius:18px;padding:8px 14px;cursor:pointer}
    .tt-quick-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
    .tt-qa-btn{border:1px solid #d7e5ff;color:#0057b8;background:#eff6ff;border-radius:14px;padding:6px 10px;font-size:12px;cursor:pointer}
    @media (max-width:480px){.tt-chat-panel{right:10px;left:10px;width:auto}}
  `;
  document.head.appendChild(style);

  // Elements
  const launcher = document.createElement('button');
  launcher.className = 'tt-chat-launcher';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.innerHTML = '💬';

  const panel = document.createElement('div');
  panel.className = 'tt-chat-panel';
  panel.innerHTML = `
    <div class="tt-chat-header">
      <div class="tt-chat-title">TrioBot</div>
      <button class="tt-chat-close" aria-label="Close">×</button>
    </div>
    <div class="tt-chat-body"></div>
    <div class="tt-chat-input">
      <input type="text" placeholder="Ask about trips, packages, guides..." />
      <button type="button">Send</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const bodyEl = panel.querySelector('.tt-chat-body');
  const inputEl = panel.querySelector('input');
  const sendBtn = panel.querySelector('.tt-chat-input button');
  const closeBtn = panel.querySelector('.tt-chat-close');

  function appendMessage(text, isUser){
    const div = document.createElement('div');
    div.className = 'tt-msg ' + (isUser ? 'tt-msg-user' : 'tt-msg-bot');
    div.textContent = text;
    bodyEl.appendChild(div);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    return div;
  }

  function appendQuickActions(){
    const qa = document.createElement('div');
    qa.className = 'tt-quick-actions';
    const actions = [
      { label: 'Destinations', href: '/destination.html' },
      { label: 'Packages', href: '/packages.html' },
      { label: 'Rural India', href: '/rural.html' },
      { label: 'Guides', href: '/guide-details.html' },
      { label: 'Contact', href: '/contact.html' }
    ];
    actions.forEach(a => {
      const b = document.createElement('button');
      b.className = 'tt-qa-btn';
      b.textContent = a.label;
      b.addEventListener('click', () => { window.location.href = a.href; });
      qa.appendChild(b);
    });
    bodyEl.appendChild(qa);
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function showPanel(){
    panel.style.display = 'flex';
    if (!panel.__welcomed){
      appendMessage("Hi! I'm TrioBot. Ask me about destinations, packages, guides or bookings.", false);
      appendQuickActions();
      panel.__welcomed = true;
    }
    inputEl.focus();
  }

  function hidePanel(){ panel.style.display = 'none'; }

  launcher.addEventListener('click', showPanel);
  closeBtn.addEventListener('click', hidePanel);

  async function send(){
    const text = (inputEl.value || '').trim();
    if (!text) return;
    appendMessage(text, true);
    inputEl.value = '';
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      const reply = (data && data.reply) || 'Sorry, I had trouble answering that.';
      const botMsg = appendMessage(reply, false);
      // Render sources if provided
      if (data && Array.isArray(data.sources) && data.sources.length) {
        const list = document.createElement('div');
        list.style.marginTop = '6px';
        data.sources.forEach(src => {
          const a = document.createElement('a');
          a.href = src.link;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = src.title || src.link;
          const item = document.createElement('div');
          item.style.fontSize = '12px';
          item.appendChild(a);
          if (src.snippet) {
            const sn = document.createElement('div');
            sn.style.color = '#555';
            sn.style.marginTop = '2px';
            sn.textContent = src.snippet;
            item.appendChild(sn);
          }
          list.appendChild(item);
        });
        botMsg.appendChild(list);
      }
      // If reply suggests opening, re-show actions
      if (/open it|take you there|link|open/i.test(reply)) appendQuickActions();
    } catch (_) {
      appendMessage('Network error. Please try again later.', false);
    }
  }

  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  // Expose simple API for navbar to open/close/toggle
  window.TrioBot = {
    open: showPanel,
    close: hidePanel,
    toggle: function(){
      if (panel.style.display === 'none' || !panel.style.display) showPanel(); else hidePanel();
    }
  };
})();


