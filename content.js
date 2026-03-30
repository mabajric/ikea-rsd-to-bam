/**
 * IKEA RSD to BAM Price Converter
 * Automatically converts prices from Serbian Dinar (RSD) to Bosnian Convertible Mark (BAM)
 * on IKEA Serbia website
 */

// ============================================================================
// Constants and Configuration
// ============================================================================

const CONFIG = Object.freeze({
  RSD_TO_BAM_RATE: 58.5,
  DEBUG: false,
  DEFAULT_DISPLAY_MODE: 'alongside',
  MARKER_CLASS: 'bam-price-display',
  DEBOUNCE_DELAY: 150,
  PRICE_REGEX: /(\d+[\d.,]*)\s*RSD/i,
  CURRENCY_SYMBOLS: ['RSD', 'Дин', 'din'],
});

const SELECTORS = Object.freeze({
  PRICE_INTEGER: 'span.notranslate:not(:has(.bam-price-display)) > span[class*="price__nowrap"] > span[class*="price__integer"]',
  PREVIOUS_PRICE: '[class*="price-module__addon"]',
});

const STYLES = Object.freeze({
  ALONGSIDE: {
    marginTop: '4px',
    padding: '4px 8px',
    backgroundColor: '#0058a3',
    color: 'white',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  PREVIOUS_PRICE: {
    marginLeft: '8px',
    padding: '4px 8px',
    backgroundColor: '#0058a3',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
});

// ============================================================================
// State Management
// ============================================================================

const state = {
  displayMode: CONFIG.DEFAULT_DISPLAY_MODE,
  observer: null,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Logger utility for debugging
 * @param {...any} args - Arguments to log
 */
const debugLog = (...args) => {
  if (CONFIG.DEBUG) {
    console.log('[IKEA RSD→BAM]', ...args);
  }
};

/**
 * Debounce function to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if element has already been processed
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if already processed
 */
const isAlreadyProcessed = (element) => {
  return element?.querySelector(`.${CONFIG.MARKER_CLASS}`) !== null;
};

/**
 * Parse price string to number
 * @param {string} priceStr - Price string to parse
 * @returns {number|null} Parsed price or null if invalid
 */
const parsePrice = (priceStr) => {
  const cleanedStr = priceStr.replace(/\./g, '').replace(',', '.');
  const price = parseFloat(cleanedStr);
  return !isNaN(price) && price > 0 ? price : null;
};

/**
 * Extract price from integer element
 * @param {HTMLElement} element - Price element
 * @returns {number|null} Extracted price or null
 */
const extractPriceFromElement = (element) => {
  const text = element?.textContent?.trim();
  if (!text) return null;

  const cleanedText = text.replace(/[^\d]/g, '');
  return parsePrice(cleanedText);
};

/**
 * Extract price from text using regex
 * @param {string} text - Text containing price
 * @returns {number|null} Extracted price or null
 */
const extractPriceFromText = (text) => {
  const match = text.match(CONFIG.PRICE_REGEX);
  return match ? parsePrice(match[1]) : null;
};

// ============================================================================
// Price Conversion
// ============================================================================

/**
 * Convert RSD amount to BAM
 * @param {number} rsdAmount - Amount in RSD
 * @returns {string} Converted amount in BAM (formatted to 2 decimals)
 */
const convertRsdToBam = (rsdAmount) => {
  return (rsdAmount / CONFIG.RSD_TO_BAM_RATE).toFixed(2);
};

// ============================================================================
// DOM Manipulation Utilities
// ============================================================================

/**
 * Create a styled BAM price element
 * @param {string} bamPrice - BAM price value
 * @param {Object} styles - Style object
 * @returns {HTMLSpanElement} Styled element
 */
const createBamPriceElement = (bamPrice, styles) => {
  const element = document.createElement('span');
  element.className = CONFIG.MARKER_CLASS;
  element.textContent = `≈ ${bamPrice} KM`;
  Object.assign(element.style, styles);
  return element;
};

/**
 * Create a hidden marker element
 * @returns {HTMLSpanElement} Hidden marker element
 */
const createHiddenMarker = () => {
  const marker = document.createElement('span');
  marker.className = CONFIG.MARKER_CLASS;
  marker.style.display = 'none';
  return marker;
};

/**
 * Apply object styles to element
 * @param {HTMLElement} element - Target element
 * @param {Object} styles - Styles object
 */
const applyStyles = (element, styles) => {
  Object.assign(element.style, styles);
};

/**
 * Check if text is a currency symbol
 * @param {string} text - Text to check
 * @returns {boolean} True if currency symbol
 */
const isCurrencySymbol = (text) => {
  const trimmedText = text.trim();
  return CONFIG.CURRENCY_SYMBOLS.some(symbol =>
    trimmedText === symbol || trimmedText.toLowerCase().includes('rsd')
  );
};

// ============================================================================
// Storage Management
// ============================================================================

/**
 * Load settings from Chrome storage
 * @returns {Promise<string>} Display mode setting
 */
const loadSettings = () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { displayMode: CONFIG.DEFAULT_DISPLAY_MODE },
      (items) => {
        state.displayMode = items.displayMode;
        debugLog(`Display mode loaded: ${state.displayMode}`);
        resolve(state.displayMode);
      }
    );
  });
};

// ============================================================================
// Price Conversion Handlers
// ============================================================================

/**
 * Replace price and currency in place
 * @param {HTMLElement} priceElement - Price integer element
 * @param {HTMLElement} wrapper - Price wrapper element
 * @param {string} bamPrice - Converted BAM price
 */
const replacePrice = (priceElement, wrapper, bamPrice) => {
  priceElement.textContent = bamPrice;

  // Replace currency symbols
  const currencyElements = wrapper.querySelectorAll('span');
  currencyElements.forEach(element => {
    if (isCurrencySymbol(element.textContent)) {
      element.textContent = 'KM';
    }
  });

  // Add hidden marker
  wrapper.appendChild(createHiddenMarker());
};

/**
 * Add BAM price alongside original price
 * @param {HTMLElement} wrapper - Price wrapper element
 * @param {string} bamPrice - Converted BAM price
 */
const addAlongsidePrice = (wrapper, bamPrice) => {
  const bamElement = createBamPriceElement(bamPrice, STYLES.ALONGSIDE);
  wrapper.appendChild(bamElement);
};

/**
 * Process standard price element
 * @param {HTMLElement} priceElement - Price integer element
 * @param {HTMLElement} wrapper - Price wrapper element
 */
const processPriceElement = (priceElement, wrapper) => {
  if (isAlreadyProcessed(wrapper)) return;

  const rsdPrice = extractPriceFromElement(priceElement);
  if (!rsdPrice) return;

  const bamPrice = convertRsdToBam(rsdPrice);

  if (state.displayMode === 'replace') {
    replacePrice(priceElement, wrapper, bamPrice);
  } else {
    addAlongsidePrice(wrapper, bamPrice);
  }

  debugLog(`Converted ${rsdPrice} RSD to ${bamPrice} BAM (mode: ${state.displayMode})`);
};

/**
 * Process previous price addon element
 * @param {HTMLElement} addonElement - Addon element containing previous price
 */
const processPreviousPriceElement = (addonElement) => {
  if (isAlreadyProcessed(addonElement)) return;

  const text = addonElement.textContent?.trim();
  if (!text) return;

  const rsdPrice = extractPriceFromText(text);
  if (!rsdPrice) return;

  const bamPrice = convertRsdToBam(rsdPrice);

  if (state.displayMode === 'replace') {
    const newText = text.replace(CONFIG.PRICE_REGEX, `${bamPrice}KM`);
    addonElement.textContent = newText;
    addonElement.appendChild(createHiddenMarker());
  } else {
    const originalText = addonElement.textContent;
    addonElement.textContent = '';

    const originalSpan = document.createElement('span');
    originalSpan.textContent = originalText;
    addonElement.appendChild(originalSpan);

    const bamElement = createBamPriceElement(bamPrice, STYLES.PREVIOUS_PRICE);
    addonElement.appendChild(bamElement);
  }

  debugLog(`Converted previous price ${rsdPrice} RSD to ${bamPrice} BAM (mode: ${state.displayMode})`);
};

// ============================================================================
// Main Conversion Logic
// ============================================================================

/**
 * Process all price elements on the page
 */
const processAllPrices = () => {
  // Process standard price elements
  const priceElements = document.querySelectorAll(SELECTORS.PRICE_INTEGER);
  debugLog(`Found ${priceElements.length} price elements to convert`);

  priceElements.forEach((priceElement) => {
    const wrapper = priceElement?.parentElement?.parentElement;
    if (wrapper) {
      processPriceElement(priceElement, wrapper);
    }
  });

  // Process previous price elements
  const previousPriceElements = document.querySelectorAll(SELECTORS.PREVIOUS_PRICE);
  debugLog(`Found ${previousPriceElements.length} previous price elements to check`);

  previousPriceElements.forEach(processPreviousPriceElement);
};

// Create debounced version for MutationObserver
const debouncedProcessAllPrices = debounce(processAllPrices, CONFIG.DEBOUNCE_DELAY);

// ============================================================================
// Initialization and Event Handlers
// ============================================================================

/**
 * Initialize MutationObserver to watch for dynamic content changes
 */
const initializeMutationObserver = () => {
  if (state.observer) {
    state.observer.disconnect();
  }

  state.observer = new MutationObserver(debouncedProcessAllPrices);

  state.observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  debugLog('MutationObserver initialized');
};

/**
 * Handle storage changes
 * @param {Object} changes - Storage changes object
 */
const handleStorageChange = (changes) => {
  if (changes.displayMode) {
    state.displayMode = changes.displayMode.newValue;
    debugLog(`Display mode changed to: ${state.displayMode}`);
    location.reload();
  }
};

/**
 * Initialize the extension
 */
const initialize = async () => {
  try {
    await loadSettings();
    processAllPrices();
    initializeMutationObserver();
    debugLog('Extension initialized successfully');
  } catch (error) {
    console.error('[IKEA RSD→BAM] Initialization failed:', error);
  }
};

// ============================================================================
// Entry Point
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for storage changes
chrome.storage.onChanged.addListener(handleStorageChange);
