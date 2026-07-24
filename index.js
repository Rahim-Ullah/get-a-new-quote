const urlToRequest = 'https://dummyjson.com/quotes';

let currentQuote = null;

// Get DOM elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteIdEl = document.getElementById('quoteId');

const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const randomBtn = document.getElementById('randomBtn');

function renderQuote(q) {
    if (!q) return;

    // Remove the animation class
    if (quoteText?.parentElement) {
        quoteText.parentElement.classList.remove('quote-fade');
        void quoteText.parentElement.offsetWidth; // restart animation
    }

    if (quoteText) quoteText.textContent = `"${q.quote}"`;
    if (quoteAuthor) quoteAuthor.textContent = `— ${q.author}`;
    if (quoteIdEl) quoteIdEl.textContent = `#${q.id}`;

    if (quoteText?.parentElement) {
        quoteText.parentElement.classList.add('quote-fade');
    }
}

async function fetchRandomQuote() {
    const response = await fetch(`${urlToRequest}/random`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const quote = await response.json();
    currentQuote = quote;
    renderQuote(quote);
}

async function fetchQuoteById(id) {
    const response = await fetch(`${urlToRequest}/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const quote = await response.json();
    currentQuote = quote;
    renderQuote(quote);
}

async function goToNext() {
    try {
        if (!currentQuote) {
            await fetchRandomQuote();
            return;
        }
        await fetchQuoteById(currentQuote.id + 1);
    } catch (error) {
        console.error('Failed to load next quote:', error);
        await fetchRandomQuote();
    }
}

async function goToPrev() {
    try {
        if (!currentQuote) {
            await fetchRandomQuote();
            return;
        }
        await fetchQuoteById(Math.max(1, currentQuote.id - 1));
    } catch (error) {
        console.error('Failed to load previous quote:', error);
        await fetchRandomQuote();
    }
}

// Fetch quotes and initialize with a random quote
fetchRandomQuote().catch(error => {
    console.error('Failed to load quotes:', error);
    if (quoteText) quoteText.textContent = 'Failed to load quotes. Please try again later.';
});

// Add event listeners
if (nextBtn) nextBtn.addEventListener('click', goToNext);
if (prevBtn) prevBtn.addEventListener('click', goToPrev);
if (randomBtn) randomBtn.addEventListener('click', () => {
    fetchRandomQuote().catch(error => {
        console.error('Failed to load random quote:', error);
    });
});
