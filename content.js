// IKEA RSD to BAM Price Converter
// Conversion rate: 1 BAM ≈ 58.5 RSD (approximate rate, should be updated as needed)
const RSD_TO_BAM_RATE = 58.5;

// Debug flag - set to true to enable console logging
const DEBUG = false;

// Store the display mode setting
let displayMode = 'alongside'; // default value

function debugLog(...args) {
  if (DEBUG) {
    console.log('[IKEA RSD→BAM]', ...args);
  }
}

function convertRsdToBam(rsdAmount) {
  return (rsdAmount / RSD_TO_BAM_RATE).toFixed(2);
}

// Load settings from storage
function loadSettings(callback) {
  chrome.storage.sync.get({
    displayMode: 'alongside'
  }, function(items) {
    displayMode = items.displayMode;
    debugLog(`Display mode loaded: ${displayMode}`);
    if (callback) callback();
  });
}

function addBamPriceToElement(priceIntegerElement, priceWrapper) {
  // Check if already processed by looking for the BAM price display element
  const existingBamPrice = priceWrapper.querySelector('.bam-price-display');

  if (existingBamPrice) {
    return; // Already processed
  }

  // Get the RSD price
  const rsdPriceText = priceIntegerElement.textContent.trim();
  const rsdPrice = parseFloat(rsdPriceText.replace(/[^\d]/g, ''));

  if (isNaN(rsdPrice) || rsdPrice === 0) {
    return;
  }

  // Calculate BAM price
  const bamPrice = convertRsdToBam(rsdPrice);

  if (displayMode === 'replace') {
    // Replace mode: completely replace price and currency
    replacePrice(priceIntegerElement, priceWrapper, bamPrice);
  } else {
    // Alongside mode: show BAM price next to original
    addAlongsidePrice(priceWrapper, bamPrice);
  }

  debugLog(`Converted ${rsdPrice} RSD to ${bamPrice} BAM (mode: ${displayMode})`);
}

function replacePrice(priceIntegerElement, priceWrapper, bamPrice) {
  // Replace the price integer with BAM price
  priceIntegerElement.textContent = bamPrice;

  // Find and replace the currency symbol (RSD or Дин or din) with KM
  const currencyElements = priceWrapper.querySelectorAll('span');
  currencyElements.forEach(element => {
    const text = element.textContent.trim();
    if (text === 'RSD' || text === 'Дин' || text === 'din' || text.toLowerCase().includes('rsd')) {
      element.textContent = 'KM';
    }
  });

  // Add a hidden marker element to indicate conversion
  const marker = document.createElement('span');
  marker.className = 'bam-price-display';
  marker.style.display = 'none';
  priceWrapper.appendChild(marker);
}

function addAlongsidePrice(priceWrapper, bamPrice) {
  // Create BAM price element as a span (inline element) to match the inline container
  const bamPriceElement = document.createElement('span');
  bamPriceElement.className = 'bam-price-display';
  bamPriceElement.style.cssText = `
    margin-top: 4px;
    padding: 4px 8px;
    background-color: #0058a3;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
  `;
  bamPriceElement.textContent = `≈ ${bamPrice} KM`;

  // Insert BAM price inside the price wrapper (span.notranslate)
  priceWrapper.appendChild(bamPriceElement);
}

function convertPreviousPrice(addonElement) {
  // Check if already processed
  const existingBamPrice = addonElement.querySelector('.bam-price-display');
  if (existingBamPrice) {
    return; // Already processed
  }

  // Extract price from text like "Prethodna cena: 11.999RSD"
  const text = addonElement.textContent.trim();
  const priceMatch = text.match(/(\d+[\d.,]*)\s*RSD/i);

  if (!priceMatch) {
    return; // No RSD price found
  }

  // Parse the price (remove dots used as thousand separators, keep commas as decimal)
  const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.');
  const rsdPrice = parseFloat(priceStr);

  if (isNaN(rsdPrice) || rsdPrice === 0) {
    return;
  }

  // Calculate BAM price
  const bamPrice = convertRsdToBam(rsdPrice);

  if (displayMode === 'replace') {
    // Replace mode: replace the entire text with converted price
    const newText = text.replace(/(\d+[\d.,]*)\s*RSD/i, `${bamPrice}KM`);
    addonElement.textContent = newText;

    // Add hidden marker to indicate conversion
    const marker = document.createElement('span');
    marker.className = 'bam-price-display';
    marker.style.display = 'none';
    addonElement.appendChild(marker);
  } else {
    // Alongside mode: wrap original text in span and add BAM price
    const originalText = addonElement.textContent;
    addonElement.textContent = '';

    const originalSpan = document.createElement('span');
    originalSpan.textContent = originalText;
    addonElement.appendChild(originalSpan);

    const bamPriceElement = document.createElement('span');
    bamPriceElement.className = 'bam-price-display';
    bamPriceElement.style.cssText = `
      margin-left: 8px;
      padding: 4px 8px;
      background-color: #0058a3;
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      display: inline-block;
    `;
    bamPriceElement.textContent = `≈ ${bamPrice} KM`;
    addonElement.appendChild(bamPriceElement);
  }

  debugLog(`Converted previous price ${rsdPrice} RSD to ${bamPrice} BAM (mode: ${displayMode})`);
}

function addBamPrice() {
  // Find all price integer elements using a specific selector that validates the entire DOM structure
  // Exclude wrappers that already contain the BAM price
  const priceIntegerElements = document.querySelectorAll(
    'span.notranslate:not(:has(.bam-price-display)) > span[class*="price__nowrap"] > span[class*="price__integer"]'
  );

  debugLog(`Found ${priceIntegerElements.length} price elements to convert`);

  priceIntegerElements.forEach((priceIntegerElement) => {
    // Get parent (price__nowrap wrapper) and grandparent (span.notranslate - final price wrapper)
    const parent = priceIntegerElement.parentElement;
    const priceWrapper = parent.parentElement;

    // Add BAM price to this element
    addBamPriceToElement(priceIntegerElement, priceWrapper);
  });

  // Find and convert previous price elements
  const previousPriceElements = document.querySelectorAll('[class*="price-module__addon"]');
  debugLog(`Found ${previousPriceElements.length} previous price elements to check`);

  previousPriceElements.forEach((addonElement) => {
    convertPreviousPrice(addonElement);
  });
}

// Initialize and run conversion
function initialize() {
  loadSettings(function() {
    // Run conversion after settings are loaded
    addBamPrice();

    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      addBamPrice();
    });

    // Start observing the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

// Run the conversion when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for storage changes to update display mode dynamically
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.displayMode) {
    displayMode = changes.displayMode.newValue;
    debugLog(`Display mode changed to: ${displayMode}`);
    // Reload the page to apply new settings
    location.reload();
  }
});
