let widget = null;

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "SHOW_LOADING") {
    createWidget("Thinking...");
  }
  if (request.action === "DISPLAY_ANSWER") {
    updateWidget(request.text);
  }
  if (request.action === "DISPLAY_ERROR") {
    createWidget(request.text, { isError: true });
  }
  if (request.action === "OPEN_OPTIONS_MODAL") {
    openOptionsModal(request.reason);
  }
});

// Open an in-page options modal (uses Shadow DOM to avoid CSS collisions)
function openOptionsModal(reason) {
  if (document.getElementById('lumen-options-modal')) return; // already open

  const host = document.createElement('div');
  host.id = 'lumen-options-modal';
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '100%';
  host.style.height = '100%';
  host.style.zIndex = '2147483647';

  const shadow = host.attachShadow({ mode: 'closed' });

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.4)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';

  const modal = document.createElement('div');
  modal.style.width = '420px';
  modal.style.maxWidth = '92%';
  modal.style.background = 'rgba(255, 255, 255, 0.15)';
  modal.style.backdropFilter = 'blur(18px) saturate(140%)';
  modal.style.webkitBackdropFilter = 'blur(18px) saturate(140%)';
  modal.style.borderRadius = '18px';
  modal.style.border = '1px solid rgba(255, 255, 255, 0.35)';
  modal.style.padding = '28px';
  modal.style.boxShadow = '0 20px 40px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.35)';
  modal.style.color = '#222';
  modal.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif";

  const title = document.createElement('h2');
  title.textContent = 'Lumina Settings';
  title.style.marginTop = '0';
  title.style.marginBottom = '20px';
  title.style.fontSize = '18px';
  title.style.fontWeight = '700';
  title.style.color = '#222';
  modal.appendChild(title);

  // API Key
  const apiLabel = document.createElement('label');
  apiLabel.textContent = 'API Key';
  apiLabel.style.display = 'block';
  apiLabel.style.fontSize = '12px';
  apiLabel.style.fontWeight = '600';
  apiLabel.style.color = '#222';
  apiLabel.style.marginBottom = '6px';
  modal.appendChild(apiLabel);

  const apiInput = document.createElement('input');
  apiInput.type = 'password';
  apiInput.id = 'lumen-modal-apikey';
  apiInput.placeholder = 'Enter your API Key';
  apiInput.style.width = '100%';
  apiInput.style.padding = '10px 12px';
  apiInput.style.marginBottom = '12px';
  apiInput.style.boxSizing = 'border-box';
  apiInput.style.border = 'none';
  apiInput.style.borderRadius = '8px';
  apiInput.style.fontSize = '13px';
  apiInput.style.background = 'rgba(255, 255, 255, 0.8)';
  apiInput.style.color = '#222';
  apiInput.style.transition = 'all 0.2s ease';
  apiInput.addEventListener('focus', () => {
    apiInput.style.background = 'rgba(255, 255, 255, 0.95)';
    apiInput.style.outline = 'none';
  });
  apiInput.addEventListener('blur', () => {
    apiInput.style.background = 'rgba(255, 255, 255, 0.8)';
  });
  modal.appendChild(apiInput);

  // Tone select
  const toneLabel = document.createElement('label');
  toneLabel.textContent = 'Response Tone';
  toneLabel.style.display = 'block';
  toneLabel.style.fontSize = '12px';
  toneLabel.style.fontWeight = '600';
  toneLabel.style.color = '#222';
  toneLabel.style.marginBottom = '6px';
  toneLabel.style.marginTop = '10px';
  modal.appendChild(toneLabel);

  const toneSelect = document.createElement('select');
  toneSelect.id = 'lumen-modal-tone';
  ['Professional', 'Casual', 'Short & Witty'].forEach(opt => {
    const o = document.createElement('option'); o.value = opt; o.textContent = opt; toneSelect.appendChild(o);
  });
  toneSelect.style.width = '100%';
  toneSelect.style.padding = '10px 12px';
  toneSelect.style.marginBottom = '12px';
  toneSelect.style.border = 'none';
  toneSelect.style.borderRadius = '8px';
  toneSelect.style.fontSize = '13px';
  toneSelect.style.background = 'rgba(255, 255, 255, 0.8)';
  toneSelect.style.color = '#222';
  toneSelect.style.appearance = 'none';
  toneSelect.style.transition = 'all 0.2s ease';
  toneSelect.addEventListener('focus', () => {
    toneSelect.style.background = 'rgba(255, 255, 255, 0.95)';
    toneSelect.style.outline = 'none';
  });
  toneSelect.addEventListener('blur', () => {
    toneSelect.style.background = 'rgba(255, 255, 255, 0.8)';
  });
  modal.appendChild(toneSelect);

  // Resume upload area
  const resumeLabel = document.createElement('label');
  resumeLabel.textContent = 'Resume / Profile';
  resumeLabel.style.display = 'block';
  resumeLabel.style.fontSize = '12px';
  resumeLabel.style.fontWeight = '600';
  resumeLabel.style.color = '#222';
  resumeLabel.style.marginBottom = '6px';
  resumeLabel.style.marginTop = '10px';
  modal.appendChild(resumeLabel);

  const resumeInput = document.createElement('input');
  resumeInput.type = 'file';
  resumeInput.accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  resumeInput.id = 'lumen-modal-resume';
  resumeInput.style.width = '100%';
  resumeInput.style.padding = '8px 10px';
  resumeInput.style.marginBottom = '8px';
  resumeInput.style.border = 'none';
  resumeInput.style.borderRadius = '8px';
  resumeInput.style.fontSize = '12px';
  resumeInput.style.background = 'rgba(255, 255, 255, 0.8)';
  resumeInput.style.color = '#222';
  resumeInput.style.boxSizing = 'border-box';
  resumeInput.style.cursor = 'pointer';
  resumeInput.style.transition = 'all 0.2s ease';
  modal.appendChild(resumeInput);

  const resumeInfo = document.createElement('div');
  resumeInfo.id = 'lumen-modal-resumeinfo';
  resumeInfo.style.marginBottom = '10px';
  resumeInfo.style.padding = '8px 10px';
  resumeInfo.style.background = 'rgba(255, 255, 255, 0.3)';
  resumeInfo.style.borderRadius = '6px';
  resumeInfo.style.fontSize = '12px';
  resumeInfo.style.color = '#222';
  resumeInfo.style.display = 'flex';
  resumeInfo.style.alignItems = 'center';
  resumeInfo.style.gap = '6px';
  resumeInfo.style.flexWrap = 'wrap';
  modal.appendChild(resumeInfo);  

  // Status
  const status = document.createElement('div');
  status.id = 'lumen-modal-status';
  status.style.marginBottom = '10px';
  status.style.padding = '8px 10px';
  status.style.fontSize = '12px';
  status.style.borderRadius = '6px';
  status.style.fontWeight = '500';
  status.style.minHeight = '18px';
  status.style.color = '#222';
  status.style.background = 'rgba(255, 255, 255, 0.2)';
  status.style.display = 'none';
  status.style.textAlign = 'center';
  modal.appendChild(status);

  // Buttons
  const buttons = document.createElement('div');
  buttons.style.display = 'flex';
  buttons.style.justifyContent = 'flex-end';
  buttons.style.gap = '12px';
  buttons.style.marginTop = '28px';

  const testBtn = document.createElement('button');
  testBtn.textContent = 'Test Key';
  testBtn.style.padding = '8px 12px';
  testBtn.style.border = 'none';
  testBtn.style.borderRadius = '8px';
  testBtn.style.fontSize = '12px';
  testBtn.style.fontWeight = '600';
  testBtn.style.cursor = 'pointer';
  testBtn.style.background = 'rgba(102, 126, 234, 0.8)';
  testBtn.style.color = 'white';
  testBtn.style.transition = 'all 0.2s ease';
  testBtn.addEventListener('mouseenter', () => {
    testBtn.style.background = 'rgba(102, 126, 234, 1)';
  });
  testBtn.addEventListener('mouseleave', () => {
    testBtn.style.background = 'rgba(102, 126, 234, 0.8)';
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.padding = '8px 12px';
  cancelBtn.style.border = 'none';
  cancelBtn.style.background = 'rgba(255, 255, 255, 0.4)';
  cancelBtn.style.color = '#222';
  cancelBtn.style.borderRadius = '8px';
  cancelBtn.style.fontSize = '12px';
  cancelBtn.style.fontWeight = '600';
  cancelBtn.style.cursor = 'pointer';
  cancelBtn.style.transition = 'all 0.2s ease';
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = 'rgba(255, 255, 255, 0.6)';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = 'rgba(255, 255, 255, 0.4)';
  });

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.style.padding = '8px 14px';
  saveBtn.style.border = 'none';
  saveBtn.style.background = 'rgba(102, 126, 234, 0.9)';
  saveBtn.style.color = 'white';
  saveBtn.style.borderRadius = '8px';
  saveBtn.style.fontSize = '12px';
  saveBtn.style.fontWeight = '600';
  saveBtn.style.cursor = 'pointer';
  saveBtn.style.transition = 'all 0.2s ease';
  saveBtn.addEventListener('mouseenter', () => {
    saveBtn.style.background = 'rgba(102, 126, 234, 1)';
  });
  saveBtn.addEventListener('mouseleave', () => {
    saveBtn.style.background = 'rgba(102, 126, 234, 0.9)';
  });

  buttons.appendChild(testBtn);
  buttons.appendChild(cancelBtn);
  buttons.appendChild(saveBtn);
  modal.appendChild(buttons);

  overlay.appendChild(modal);
  shadow.appendChild(overlay);
  document.body.appendChild(host);

  // Helpers: restore current settings and show resume info
  chrome.storage.local.get({ apiKey: '', resume: null, tone: 'Professional' }, (items) => {
    apiInput.value = items.apiKey || '';
    toneSelect.value = items.tone || 'Professional';

    resumeInfo.textContent = '';
    if (items.resume && items.resume.name) {
      const name = document.createElement('span');
      name.textContent = items.resume.name;

      const dl = document.createElement('a');
      dl.href = `data:${items.resume.type};base64,${items.resume.data}`;
      dl.download = items.resume.name;
      dl.textContent = 'Download';
      dl.style.marginLeft = '8px';

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginLeft = '8px';
      removeBtn.addEventListener('click', () => { chrome.storage.local.remove('resume', () => { resumeInfo.textContent = 'No resume uploaded'; }); });

      resumeInfo.appendChild(name);
      resumeInfo.appendChild(dl);
      resumeInfo.appendChild(removeBtn);

    } else {
      resumeInfo.textContent = 'No resume uploaded';
    }
  });

  // Event handlers
  cancelBtn.addEventListener('click', () => host.remove());

  // Test API key button
  testBtn.addEventListener('click', async () => {
    const key = apiInput.value;
    status.style.display = 'block';
    status.style.color = '#667eea';
    status.style.background = 'rgba(102, 126, 234, 0.1)';
    status.textContent = 'Testing API key...';
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', { method: 'GET', headers: { 'Authorization': `Bearer ${key}` }, signal: controller.signal });
      clearTimeout(t);
      if (res.ok) {
        status.style.color = '#27ae60';
        status.style.background = 'rgba(39, 174, 96, 0.1)';
        status.textContent = 'API key is valid';
      } else {
        status.style.color = '#e74c3c';
        status.style.background = 'rgba(231, 76, 60, 0.1)';
        status.textContent = `API test failed (${res.status})`;
      }
    } catch (e) {
      status.style.color = '#e74c3c';
      status.style.background = 'rgba(231, 76, 60, 0.1)';
      status.textContent = 'API test failed';
    }
    setTimeout(() => { status.style.display = 'none'; status.textContent = ''; }, 3000);
  });

  saveBtn.addEventListener('click', () => {
    const file = resumeInput.files && resumeInput.files[0];
    const apikey = apiInput.value;
    const tone = toneSelect.value;
    const passphrase = '';
    console.log('Saving settings:', { apikey, tone, file });
    const doSave = (resumeObj) => {
      const items = { apiKey: apikey, tone };
      if (resumeObj !== undefined) items.resume = resumeObj;
      chrome.storage.local.set(items, () => {
        status.style.display = 'block';
        status.style.color = '#27ae60';
        status.style.background = 'rgba(39, 174, 96, 0.1)';
        status.textContent = 'Settings saved';
        setTimeout(() => { status.style.display = 'none'; status.textContent = ''; }, 2500);
        host.remove();
      });
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result;
          const b64 = (function bufToBase64(buf) { const bytes = new Uint8Array(buf); let binary = ''; const chunk = 0x8000; for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk)); return btoa(binary); })(arrayBuffer);
          const resumeObj = { name: file.name, type: file.type || 'application/octet-stream', data: b64, encrypted: false };
          doSave(resumeObj);
      };
      reader.onerror = () => { 
        status.style.display = 'block';
        status.style.color = '#e74c3c';
        status.style.background = 'rgba(231, 76, 60, 0.1)';
        status.textContent = 'Failed to read file'; 
      };
      reader.readAsArrayBuffer(file);
    } else {
      doSave(undefined);
    }
  });

  // Close when clicking outside modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) host.remove();
  });

  // Escape closes
  const esc = (e) => { if (e.key === 'Escape') host.remove(); };
  document.addEventListener('keydown', esc);
  host.addEventListener('remove', () => document.removeEventListener('keydown', esc));
}

function createWidget(initialText) {
  if (widget) widget.remove();

  widget = document.createElement('div');
  widget.id = "lumen-ai-widget";
  widget.setAttribute('role', 'dialog');
  widget.setAttribute('aria-label', 'Lumen AI Assistant');

  // Outer styling
  Object.assign(widget.style, {
    position: 'fixed',
    top: '50px',
    right: '50px',
    width: '450px',
    minHeight: '100px',
    padding: '16px',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(18px) saturate(140%)',
    WebkitBackdropFilter: 'blur(18px) saturate(140%)',
    borderRadius: '18px',
    border: '1px solid rgba(255,255,255,0.35)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.35)',
    zIndex: '2147483647',
    overflow: 'hidden',
    color: '#111'
  });

  const inner = document.createElement('div');
  inner.id = 'lumen-inner';
  inner.style.position = 'relative';
  inner.style.zIndex = '2';

  const header = document.createElement('div');
  header.id = 'lumen-header';
  header.style.paddingBottom = '10px';
  header.style.borderBottom = '1px solid rgba(0,0,0,0.08)';
  header.style.marginBottom = '10px';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.userSelect = 'none';

  const title = document.createElement('span');
  title.textContent = 'LUMINA AI';
  title.style.fontSize = '12px';
  title.style.fontWeight = '700';
  title.style.letterSpacing = '1px';
  title.style.color = '#222';

  const closeBtn = document.createElement('button');
  closeBtn.id = 'close-lumen';
  closeBtn.textContent = '×';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '16px';
  closeBtn.style.color = '#222';
  closeBtn.setAttribute('aria-label', 'Close Lumen widget');

  // settings button
  const settingsBtn = document.createElement('button');
  settingsBtn.id = 'lumen-settings';
  settingsBtn.textContent = '⚙';
  settingsBtn.style.background = 'none';
  settingsBtn.style.border = 'none';
  settingsBtn.style.cursor = 'pointer';
  settingsBtn.style.fontSize = '14px';
  settingsBtn.style.color = '#222';
  settingsBtn.setAttribute('aria-label', 'Open settings');

  // header buttons
  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '8px';
  btnContainer.appendChild(settingsBtn);
  btnContainer.appendChild(closeBtn);

  header.appendChild(title);
  header.appendChild(btnContainer);

  const content = document.createElement('div');
  content.id = 'lumen-content';
  content.style.fontSize = '14px';
  content.style.lineHeight = '1.5';
  content.style.color = '#111';
  content.style.maxHeight = '400px';
  content.style.overflowY = 'auto';
  content.textContent = initialText || '';

  inner.appendChild(header);
  inner.appendChild(content);
  widget.appendChild(inner);

  // Initialize dragging
  makeDraggable(widget);

  document.body.appendChild(widget);
  closeBtn.onclick = () => widget.remove();
  settingsBtn.onclick = () => openOptionsModal('manual_open');

  // Allow Esc key to close the widget
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      widget.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function updateWidget(newText) {
  const content = document.getElementById('lumen-content');
  if (content) {
    // Parse markdown using marked library
    content.innerHTML = marked.parse(newText);

    // Apply custom styling
    styleContent(content);
  }
}

function styleContent(container) {
  // Style code blocks
  container.querySelectorAll('pre').forEach(el => {
    el.style.cssText = 'background: rgba(30,30,30,0.85); padding: 14px; border-radius: 8px; overflow-x: auto; margin: 12px 0;';
  });

  container.querySelectorAll('pre code').forEach(el => {
    el.style.cssText = 'font-family: "Courier New", Consolas, monospace; font-size: 12px; color: #e8e8e8; line-height: 1.5;';
  });

  // Style inline code
  container.querySelectorAll('code').forEach(el => {
    if (el.parentElement.tagName !== 'PRE') {
      el.style.cssText = 'background: rgba(0,0,0,0.12); padding: 2px 6px; border-radius: 4px; font-family: "Courier New", Consolas, monospace; font-size: 12px; color: #c7254e;';
    }
  });

  // Style headers
  container.querySelectorAll('h1').forEach(el => {
    el.style.cssText = 'font-size: 18px; font-weight: 700; margin: 18px 0 12px 0; color: #1a1a1a; border-bottom: 2px solid rgba(0,0,0,0.15); padding-bottom: 6px;';
  });

  container.querySelectorAll('h2').forEach(el => {
    el.style.cssText = 'font-size: 16px; font-weight: 600; margin: 16px 0 10px 0; color: #1a1a1a;';
  });

  container.querySelectorAll('h3').forEach(el => {
    el.style.cssText = 'font-size: 15px; font-weight: 600; margin: 14px 0 8px 0; color: #1a1a1a;';
  });

  // Style lists
  container.querySelectorAll('ul, ol').forEach(el => {
    el.style.cssText = 'margin: 10px 0; padding-left: 20px;';
  });

  container.querySelectorAll('li').forEach(el => {
    el.style.cssText = 'margin-bottom: 4px; line-height: 1.6;';
  });

  // Style paragraphs
  container.querySelectorAll('p').forEach(el => {
    el.style.cssText = 'margin: 8px 0; line-height: 1.6;';
  });

  // Style links
  container.querySelectorAll('a').forEach(el => {
    el.style.cssText = 'color: #0366d6; text-decoration: none;';
  });

  // Style blockquotes
  container.querySelectorAll('blockquote').forEach(el => {
    el.style.cssText = 'border-left: 3px solid rgba(0,0,0,0.2); padding-left: 12px; margin: 10px 0; color: #555;';
  });

  // Style hr
  container.querySelectorAll('hr').forEach(el => {
    el.style.cssText = 'border: none; border-top: 2px solid rgba(0,0,0,0.12); margin: 16px 0;';
  });
}

function makeDraggable(el) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  // Use the header area as the drag handle
  const header = el.querySelector('#lumen-header');
  if (header) {
    header.style.cursor = 'grab';
    header.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e.preventDefault();
    header.style.cursor = 'grabbing';
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    // Calculate new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Set the element's new position
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
    el.style.right = 'auto'; // Disable 'right' so 'left' takes over
  }

  function closeDragElement() {
    header.style.cursor = 'grab';
    document.onmouseup = null;
    document.onmousemove = null;
  }
}