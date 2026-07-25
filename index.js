const API_BASE = 'https://dummyjson.com/quotes';

let currentQuote = null;
let maxQuoteId = null;
let isLoading = false;

// DOM elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteIdEl = document.getElementById('quoteId');

const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const randomBtn = document.getElementById('randomBtn');

const quoteContainer = quoteText?.closest('.quote-fade') || quoteText?.parentElement;

// ---------- UI Helpers ----------
function setButtonsDisabled(disabled) {
  [nextBtn, prevBtn, randomBtn].forEach((btn) => {
    if (!btn) return;
    btn.disabled = disabled;
    btn.classList.toggle('opacity-60', disabled);
    btn.classList.toggle('cursor-not-allowed', disabled);
  });
}

function setStatus(message) {
  if (quoteIdEl) quoteIdEl.textContent = message;
}

function animateQuote() {
  if (!quoteContainer) return;
  quoteContainer.classList.remove('quote-fade');
  void quoteContainer.offsetWidth; // reflow to restart animation
  quoteContainer.classList.add('quote-fade');
}

function renderQuote(q) {
  if (!q) return;

  if (quoteText) quoteText.textContent = `“${q.quote}”`;
  if (quoteAuthor) quoteAuthor.textContent = `— ${q.author}`;
  if (quoteIdEl) quoteIdEl.textContent = `#${q.id}`;

  animateQuote();
}

function renderError(message) {
  if (quoteText) quoteText.textContent = message;
  if (quoteAuthor) quoteAuthor.textContent = '';
  if (quoteIdEl) quoteIdEl.textContent = 'Please try again.';
}

// ---------- Data Helpers ----------
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function ensureMaxQuoteId() {
  if (maxQuoteId !== null) return maxQuoteId;

  // We only need total count once, so keep limit very small
  const meta = await fetchJson(`${API_BASE}?limit=1`);
  maxQuoteId = meta?.total || 1;
  return maxQuoteId;
}

function clampId(id, min, max) {
  return Math.min(max, Math.max(min, id));
}

async function loadQuote({ mode = 'random', id = null } = {}) {
  if (isLoading) return;
  isLoading = true;
  setButtonsDisabled(true);
  setStatus('Loading quote...');

  try {
    let quote;

    if (mode === 'id') {
      const total = await ensureMaxQuoteId();
      const safeId = clampId(Number(id), 1, total);
      quote = await fetchJson(`${API_BASE}/${safeId}`);
    } else {
      quote = await fetchJson(`${API_BASE}/random`);
    }

    currentQuote = quote;
    renderQuote(quote);
  } catch (err) {
    console.error('Quote load failed:', err);
    renderError('Failed to load quotes.');
  } finally {
    isLoading = false;
    setButtonsDisabled(false);
  }
}

// ---------- Navigation ----------
async function goToNext() {
  if (!currentQuote) {
    await loadQuote({ mode: 'random' });
    return;
  }

  const total = await ensureMaxQuoteId().catch(() => null);
  if (!total) {
    await loadQuote({ mode: 'random' });
    return;
  }

  // Loop to first quote after last quote
  const nextId = currentQuote.id >= total ? 1 : currentQuote.id + 1;
  await loadQuote({ mode: 'id', id: nextId });
}

async function goToPrev() {
  if (!currentQuote) {
    await loadQuote({ mode: 'random' });
    return;
  }

  const total = await ensureMaxQuoteId().catch(() => null);
  if (!total) {
    await loadQuote({ mode: 'random' });
    return;
  }

  // Loop to last quote before first quote
  const prevId = currentQuote.id <= 1 ? total : currentQuote.id - 1;
  await loadQuote({ mode: 'id', id: prevId });
}

async function goToRandom() {
  await loadQuote({ mode: 'random' });
}

// ---------- Event Listeners ----------
nextBtn?.addEventListener('click', goToNext);
prevBtn?.addEventListener('click', goToPrev);
randomBtn?.addEventListener('click', goToRandom);

// Optional keyboard support for smoother UX
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') goToNext();
  if (e.key === 'ArrowLeft') goToPrev();
  if (e.key.toLowerCase() === 'r') goToRandom();
});

// Initial load
loadQuote({ mode: 'random' });
