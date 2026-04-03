// ── State ──────────────────────────────────────────────────────────────────
let languages = {};       // { code: { language, code, words[] } }
let activeCode = null;
let history = [];
let currentPhrase = '';

// Built-in languages to fetch
const BUILTIN = [
  { code: 'pl', flag: '🇵🇱', file: 'pl.json' },
  { code: 'en', flag: '🇬🇧', file: 'en.json' },
];

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  // Load saved custom languages from localStorage
  try {
    const saved = localStorage.getItem('customLanguages');
    if (saved) {
      const customs = JSON.parse(saved);
      Object.assign(languages, customs);
    }
  } catch(e) {}

  // Load saved history
  try {
    const savedHistory = localStorage.getItem('phraseHistory');
    if (savedHistory) { history = JSON.parse(savedHistory); renderHistory(); }
  } catch(e) {}

  // Fetch built-in language files
  for (const lang of BUILTIN) {
    try {
      const res = await fetch(lang.file);
      if (res.ok) {
        const data = await res.json();
        data.flag = lang.flag;
        languages[lang.code] = data;
      }
    } catch(e) {
      console.warn(`Could not load ${lang.file}`);
    }
  }

  // Default to Polish
  if (Object.keys(languages).length === 0) {
    // Fallback inline Polish words if fetch fails (offline/local)
    languages['pl'] = {
      language: 'Polish', code: 'pl', flag: '🇵🇱',
      words: ['ananas','banan','cebula','dynia','figa','gruszka','herbata',
              'jabłko','kawa','lemur','mango','nocnik','obłok','panda',
              'rakieta','słoń','tygrys','ulica','wiatr','zamek','ziemia',
              'motyl','kotek','piesek','rybka','rzeka','góra','las','morze',
              'miasto','słońce','księżyc','gwiazda','chmura','deszcz','śnieg']
    };
  }

  activeCode = languages['pl'] ? 'pl' : Object.keys(languages)[0];
  renderLangTabs();
  updateRange('wordCount','wordCountVal');
  updateRange('numDigits','numDigitsVal');
  generate();
}

// ── Language tabs ──────────────────────────────────────────────────────────
function renderLangTabs() {
  const container = document.getElementById('langTabs');
  container.innerHTML = '';

  for (const [code, lang] of Object.entries(languages)) {
    const btn = document.createElement('button');
    btn.className = 'lang-tab' + (code === activeCode ? ' active' : '');
    const flagSpan = document.createElement('span');
    flagSpan.className = 'flag';
    flagSpan.textContent = lang.flag || '🌐';
    btn.appendChild(flagSpan);
    btn.appendChild(document.createTextNode(' ' + lang.language));
    btn.onclick = () => { activeCode = code; renderLangTabs(); generate(); };
    container.appendChild(btn);
  }

  // Add language button
  const add = document.createElement('button');
  add.className = 'lang-tab lang-tab-add';
  add.innerHTML = '＋ Add language';
  add.onclick = openModal;
  container.appendChild(add);
}

// ── Config helpers ─────────────────────────────────────────────────────────
function updateRange(inputId, displayId) {
  document.getElementById(displayId).textContent = document.getElementById(inputId).value;
}

function updateSeparatorInput() {
  const val = document.getElementById('separatorType').value;
  document.getElementById('customSep').style.display = val === 'custom' ? 'block' : 'none';
}

function getSeparator() {
  const t = document.getElementById('separatorType').value;
  if (t === 'custom') return document.getElementById('customSep').value;
  return t;
}

function toggleConfig() {
  const body = document.getElementById('configBody');
  const icon = document.getElementById('configIcon');
  const open = body.classList.toggle('open');
  icon.classList.toggle('open', open);
}

// ── Randomness ─────────────────────────────────────────────────────────────
function secureRand(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function randInt(min, max) {
  return min + secureRand(max - min + 1);
}

function randFrom(arr) {
  return arr[secureRand(arr.length)];
}

// ── Generate ───────────────────────────────────────────────────────────────
function generate() {
  const lang = languages[activeCode];
  if (!lang || !lang.words || lang.words.length === 0) {
    document.getElementById('phraseDisplay').textContent = 'No words loaded!';
    return;
  }

  const wordCount = parseInt(document.getElementById('wordCount').value);
  const cap = document.getElementById('capitalise').value;
  const numberPos = document.getElementById('numberPos').value;
  const numDigits = parseInt(document.getElementById('numDigits').value);
  const specialPos = document.getElementById('specialPos').value;
  const specialCharsRaw = document.getElementById('specialChars').value.trim();
  const specialChars = specialCharsRaw || '!@#$%^&*';
  if (!specialCharsRaw && specialPos !== 'none') {
    showToast('Special chars field is empty — using default: !@#$%^&*');
  }
  const sep = getSeparator();

  // Pick words
  let words = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(randFrom(lang.words));
  }

  // Apply capitalisation
  words = words.map(w => {
    if (cap === 'first') return w.charAt(0).toUpperCase() + w.slice(1);
    if (cap === 'all') return w.toUpperCase();
    if (cap === 'random') return w.split('').map(c =>
      secureRand(2) ? c.toUpperCase() : c.toLowerCase()
    ).join('');
    return w;
  });

  // Generate number
  let numStr = '';
  if (numberPos !== 'none') {
    for (let i = 0; i < numDigits; i++) numStr += randInt(0, 9);
  }

  // Generate special char
  let specStart = '', specEnd = '';
  if (specialPos !== 'none') {
    const ch = randFrom(specialChars.split(''));
    if (specialPos === 'start' || specialPos === 'both') specStart = ch;
    if (specialPos === 'end'   || specialPos === 'both') specEnd   = randFrom(specialChars.split(''));
  }

  // Build parts
  let parts = [];
  // For 'between', generate a separate number for each gap
  const betweenNums = numberPos === 'between'
    ? Array.from({ length: words.length - 1 }, () => {
        let n = ''; for (let j = 0; j < numDigits; j++) n += randInt(0, 9); return n;
      })
    : [];

  if (numberPos === 'between') {
    words.forEach((w, i) => {
      parts.push(w);
      if (i < words.length - 1) parts.push(betweenNums[i]);
    });
  } else {
    parts = [...words];
    if (numberPos === 'start') parts.unshift(numStr);
    if (numberPos === 'end')   parts.push(numStr);
  }

  const phrase = specStart + parts.join(sep) + specEnd;
  currentPhrase = phrase;

  // Render with spans
  renderPhrase(words, sep, numStr, numberPos, specStart, specEnd, specialChars, cap, betweenNums);

  // Strength & entropy
  const bits = calcEntropy(lang.words.length, wordCount, numDigits, numberPos, specialChars, specialPos);
  renderStrength(bits);

  // Save to history
  saveHistory(phrase);
}

function renderPhrase(words, sep, numStr, numberPos, specStart, specEnd, specialChars, cap, betweenNums = []) {
  const display = document.getElementById('phraseDisplay');

  function span(cls, txt) {
    return `<span class="${cls}">${escHtml(txt)}</span>`;
  }

  let html = '';

  if (specStart) html += span('sym', specStart);

  if (numberPos === 'start' && numStr) {
    html += span('num', numStr);
    if (sep) html += span('sep', sep);
  }

  words.forEach((w, i) => {
    if (numberPos === 'between' && i > 0) {
      if (sep) html += span('sep', sep);
      html += span('num', betweenNums[i - 1]);
    }
    if (i > 0 && numberPos !== 'between') {
      if (sep) html += span('sep', sep);
    }
    html += span('word', w);
  });

  if (numberPos === 'end' && numStr) {
    if (sep) html += span('sep', sep);
    html += span('num', numStr);
  }

  if (specEnd) html += span('sym', specEnd);

  display.innerHTML = html;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function calcEntropy(poolSize, wordCount, numDigits, numberPos, specialChars, specialPos) {
  let bits = wordCount * Math.log2(poolSize);
  if (numberPos !== 'none') bits += numDigits * Math.log2(10);
  if (specialPos !== 'none') bits += Math.log2(specialChars.length || 1);
  if (specialPos === 'both') bits += Math.log2(specialChars.length || 1);
  return Math.round(bits);
}

function renderStrength(bits) {
  const badge = document.getElementById('strengthBadge');
  const info = document.getElementById('entropyInfo');
  const bar = document.getElementById('strengthBar');
  const hint = document.getElementById('configEntropyHint');

  info.textContent = `~${bits} bits entropy`;
  if (hint) hint.textContent = `~${bits} bits`;

  const pct = Math.min(100, Math.round(bits / 128 * 100));
  bar.style.width = pct + '%';

  let cls, color;
  if (bits < 40) {
    cls = 'low'; color = 'var(--accent3)';
  } else if (bits < 60) {
    cls = 'medium'; color = '#ffc107';
  } else if (bits < 80) {
    cls = 'high'; color = 'var(--accent)';
  } else {
    cls = 'very-high'; color = 'var(--accent2)';
  }

  badge.className = 'strength-badge ' + cls;
  const labels = { low: 'Weak', medium: 'Moderate', high: 'Strong', 'very-high': 'Very strong' };
  badge.textContent = labels[cls];
  bar.style.background = color;
}

// ── Copy ───────────────────────────────────────────────────────────────────
async function copyPhrase() {
  if (!currentPhrase) return;
  try {
    await navigator.clipboard.writeText(currentPhrase);
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 Copy';
      btn.classList.remove('copied');
    }, 1800);
    showToast('Copied to clipboard!');
  } catch(e) {
    showToast('Copy failed — try manually');
  }
}

// ── History ────────────────────────────────────────────────────────────────
function saveHistory(phrase) {
  if (!phrase) return;
  history.unshift(phrase);
  if (history.length > 20) history.pop();
  try {
    localStorage.setItem('phraseHistory', JSON.stringify(history));
  } catch(e) {
    showToast('Could not save history — storage unavailable');
  }
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  if (history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-history';
    empty.textContent = 'No passphrases yet — generate one!';
    list.appendChild(empty);
    return;
  }
  for (const p of history) {
    const item = document.createElement('div');
    item.className = 'history-item';

    const span = document.createElement('span');
    span.className = 'history-phrase';
    span.textContent = p;

    const btn = document.createElement('button');
    btn.className = 'history-copy';
    btn.textContent = '📋';
    btn.addEventListener('click', () => copyText(p));

    item.appendChild(span);
    item.appendChild(btn);
    list.appendChild(item);
  }
}

function clearHistory() {
  history = [];
  localStorage.removeItem('phraseHistory');
  renderHistory();
  showToast('History cleared');
}

function exportHistory() {
  if (!history.length) { showToast('No history to export'); return; }
  const blob = new Blob([history.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'passphrases.txt';
  a.click();
  URL.revokeObjectURL(url);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch(e) {}
}

// ── Toast ──────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2000);
}

// ── Modal ──────────────────────────────────────────────────────────────────
function openModal() { document.getElementById('modalOverlay').classList.add('open'); }
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('jsonPaste').value = '';
  document.getElementById('fileInput').value = '';
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('jsonPaste').value = e.target.result;
  };
  reader.readAsText(file);
}

function addLanguage() {
  const raw = document.getElementById('jsonPaste').value.trim();
  if (!raw) { showToast('Please paste or upload a JSON file'); return; }

  let data;
  try { data = JSON.parse(raw); } catch(e) {
    showToast('Invalid JSON!'); return;
  }

  if (!data.language || !data.code || !Array.isArray(data.words) || data.words.length < 20) {
    showToast('JSON must have language, code, and at least 20 words');
    return;
  }

  if (data.words.length < 50) {
    showToast(`Warning: only ${data.words.length} words — 50+ recommended for good entropy`);
  }

  languages[data.code] = data;

  // Save custom languages
  const customs = {};
  for (const [k,v] of Object.entries(languages)) {
    if (!BUILTIN.find(b => b.code === k)) customs[k] = v;
  }
  try {
    localStorage.setItem('customLanguages', JSON.stringify(customs));
  } catch(e) {
    showToast('Could not save language — storage unavailable');
  }

  activeCode = data.code;
  renderLangTabs();
  generate();
  closeModal();
  showToast(`Added: ${data.language} (${data.words.length} words)`);
}

// ── Keyboard shortcut ──────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault(); generate();
  }
  const tag = document.activeElement?.tagName;
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
    copyPhrase();
  }
});

// ── Start ──────────────────────────────────────────────────────────────────
init();
