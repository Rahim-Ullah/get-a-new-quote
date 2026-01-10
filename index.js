const urlToRequest = 'https://dummyjson.com/quotes';
let quotes = [];
let currentIndex = 0;

// Get DOM elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteIdEl = document.getElementById('quoteId');

const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const randomBtn = document.getElementById('randomBtn');

function renderQuote(index) {
    if (!quotes.length) return;
    const q = quotes[index];
    
    // Remove the animation class
    quoteText.parentElement.classList.remove('quote-fade');
    
    // Trigger reflow to restart animation
    void quoteText.parentElement.offsetWidth;
    
    // Add content and animation class
    if (quoteText) quoteText.textContent = `"${q.quote}"`;
    if (quoteAuthor) quoteAuthor.textContent = `— ${q.author}`;
    if (quoteIdEl) quoteIdEl.textContent = `#${q.id}`;
    
    // Add the animation class back
    quoteText.parentElement.classList.add('quote-fade');
}

function goToNext() {
    if (!quotes.length) return;
    currentIndex = (currentIndex + 1) % quotes.length;
    renderQuote(currentIndex);
}

function goToPrev() {
    if (!quotes.length) return;
    currentIndex = (currentIndex - 1 + quotes.length) % quotes.length;
    renderQuote(currentIndex);
}

function showRandomQuote() {
    if (!quotes.length) return;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentIndex = randomIndex;
    renderQuote(currentIndex);
}

// Fetch quotes and initialize
fetch(urlToRequest)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(data => {
        quotes = data.quotes || [];
        if (!quotes.length) throw new Error('No quotes returned');
        showRandomQuote(); // Start with a random quote
    })
    .catch(error => {
        console.error('Failed to load quotes:', error);
        quoteText.textContent = 'Failed to load quotes. Please try again later.';
    });

// Add event listeners
if (nextBtn) nextBtn.addEventListener('click', goToNext);
if (prevBtn) prevBtn.addEventListener('click', goToPrev);
if (randomBtn) randomBtn.addEventListener('click', showRandomQuote);

