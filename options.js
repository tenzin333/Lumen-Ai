// options.js

// Helper: convert ArrayBuffer to base64
function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBuf(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const passKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, passKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function encryptArrayBuffer(buf, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buf);
  return { data: bufToBase64(cipher), iv: bufToBase64(iv.buffer), salt: bufToBase64(salt.buffer) };
}

async function decryptToArrayBuffer(base64Cipher, passphrase, ivBase64, saltBase64) {
  const cipherBuf = base64ToBuf(base64Cipher);
  const iv = new Uint8Array(base64ToBuf(ivBase64));
  const salt = new Uint8Array(base64ToBuf(saltBase64));
  const key = await deriveKey(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf);
  return plain;
}

// 1. Save options to storage (supports resume file upload + optional passphrase)
const saveOptions = async () => {
  const apiKey = document.getElementById('apiKey').value;
  const tone = document.getElementById('tone').value;
  const fileInput = document.getElementById('resumeFile');
  const file = fileInput.files && fileInput.files[0];
  const passphrase = document.getElementById('resumePassphrase') ? document.getElementById('resumePassphrase').value : '';

  const status = document.getElementById('status');

  const saveToStorage = (resumeObj) => {
    const items = { apiKey, tone };
    if (resumeObj !== undefined) items.resume = resumeObj; // explicit overwrite when provided
    chrome.storage.local.set(items, () => {
      showStatus('Settings saved successfully!', 'success');
      setTimeout(() => { hideStatus(); }, 2500);
      // Refresh resume display
      restoreOptions();
    });
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const arrayBuffer = reader.result;
      if (passphrase) {
        try {
          const enc = await encryptArrayBuffer(arrayBuffer, passphrase);
          const resumeObj = { name: file.name, type: file.type || 'application/octet-stream', data: enc.data, iv: enc.iv, salt: enc.salt, encrypted: true };
          saveToStorage(resumeObj);
        } catch (e) {
          showStatus('Encryption failed', 'error');
          setTimeout(() => { hideStatus(); }, 2500);
        }
      } else {
        // store plaintext base64
        const base64 = bufToBase64(arrayBuffer);
        const resumeObj = { name: file.name, type: file.type || 'application/octet-stream', data: base64, encrypted: false };
        saveToStorage(resumeObj);
      }
    };
    reader.onerror = () => {
      showStatus('Failed to read file', 'error');
      setTimeout(() => { hideStatus(); }, 2500);
    };
    reader.readAsArrayBuffer(file);
  } else {
    // No new file selected; save other settings without touching stored resume
    saveToStorage(undefined);
  }
};

// Test API key helper
async function testApiKey(apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.ok;
  } catch (err) {
    clearTimeout(timeout);
    return false;
  }
}

// 2. Restore options from storage when the page loads
const restoreOptions = () => {
  chrome.storage.local.get(
    { apiKey: '', resume: null, tone: 'Professional' },
    (items) => {
      document.getElementById('apiKey').value = items.apiKey;
      document.getElementById('tone').value = items.tone;

      const info = document.getElementById('resumeInfo');
      info.textContent = '';
      if (items.resume && items.resume.name) {
        const nameSpan = document.createElement('span');
        nameSpan.textContent = items.resume.name;

        // If encrypted, show decrypt button that prompts for passphrase
        if (items.resume.encrypted) {
          const decryptBtn = document.createElement('button');
          decryptBtn.textContent = 'Decrypt & Download';
          decryptBtn.style.marginLeft = '8px';
          decryptBtn.addEventListener('click', async () => {
            const pass = prompt('Enter passphrase to decrypt resume');
            if (!pass) return;
            try {
              const plainBuf = await decryptToArrayBuffer(items.resume.data, pass, items.resume.iv, items.resume.salt);
              const blob = new Blob([plainBuf], { type: items.resume.type });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = items.resume.name;
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) {
              alert('Failed to decrypt resume: incorrect passphrase?');
            }
          });

          const removeBtn = document.createElement('button');
          removeBtn.textContent = 'Remove';
          removeBtn.style.marginLeft = '8px';
          removeBtn.addEventListener('click', removeResume);

          info.appendChild(nameSpan);
          info.appendChild(decryptBtn);
          info.appendChild(removeBtn);
        } else {
          const dl = document.createElement('a');
          dl.href = `data:${items.resume.type};base64,${items.resume.data}`;
          dl.download = items.resume.name;
          dl.textContent = 'Download';
          dl.style.marginLeft = '8px';
          dl.style.color = 'white';

          const removeBtn = document.createElement('button');
          removeBtn.textContent = 'Remove';
          removeBtn.style.marginLeft = '8px';
          removeBtn.addEventListener('click', removeResume);

          info.appendChild(nameSpan);
          info.appendChild(dl);
          info.appendChild(removeBtn);
        }
      } else {
        info.textContent = 'No resume uploaded';
      }
    }
  );
};

function removeResume() {
  chrome.storage.local.remove('resume', () => {
    const status = document.getElementById('status');
    status.textContent = 'Resume removed';
    setTimeout(() => { status.textContent = ''; }, 2000);
    restoreOptions();
  });
}

// Helper: show status message with styling
function showStatus(message, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `show ${type}`;
}

function hideStatus() {
  const status = document.getElementById('status');
  status.className = '';
  status.textContent = '';
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', () => { saveOptions(); });

// Wire test API key button
document.getElementById('testKey').addEventListener('click', async () => {
  const key = document.getElementById('apiKey').value;
  if (!key) {
    showStatus('Please enter an API key to test', 'error');
    setTimeout(() => { hideStatus(); }, 2500);
    return;
  }
  showStatus('Testing API key...', 'info');
  const ok = await testApiKey(key);
  if (ok) {
    showStatus('✓ API key is valid', 'success');
  } else {
    showStatus('✗ API key test failed', 'error');
  }
  setTimeout(() => { hideStatus(); }, 3500);
});