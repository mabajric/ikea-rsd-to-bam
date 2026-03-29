// IKEA RSD to BAM Price Converter
// Conversion rate: 1 BAM ≈ 58.5 RSD (approximate rate, should be updated as needed)
const RSD_TO_BAM_RATE = 58.5;

// Debug flag - set to true to enable console logging
const DEBUG = false;

function debugLog(...args) {
  if (DEBUG) {
    console.log('[IKEA RSD→BAM]', ...args);
  }
}

function convertRsdToBam(rsdAmount) {
  return (rsdAmount / RSD_TO_BAM_RATE).toFixed(2);
}

function addBamPriceToElement(priceIntegerElement, priceWrapper) {
  // Check if BAM price already exists for this element
  // Verify both the attribute AND that the BAM price element is still in the DOM
  if (priceWrapper.dataset.bamConverted === 'true') {
    // Check if the BAM price element still exists in the DOM
    const nextElement = priceWrapper.nextSibling;
    if (nextElement && nextElement.classList && nextElement.classList.contains('bam-price-display')) {
      return; // BAM price is already displayed
    }
    // If we get here, the attribute exists but the BAM price element is gone (likely due to re-render)
    // Remove the attribute so we can re-convert
    debugLog('BAM price element missing despite attribute - re-converting');
    delete priceWrapper.dataset.bamConverted;
  }

  // Get the RSD price
  const rsdPriceText = priceIntegerElement.textContent.trim();
  const rsdPrice = parseFloat(rsdPriceText.replace(/[^\d]/g, ''));

  if (isNaN(rsdPrice) || rsdPrice === 0) {
    return;
  }

  // Calculate BAM price
  const bamPrice = convertRsdToBam(rsdPrice);

  // Create BAM price element
  const bamPriceElement = document.createElement('div');
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
  bamPriceElement.textContent = `≈ ${bamPrice} BAM`;

  // Mark as converted
  priceWrapper.dataset.bamConverted = 'true';

  // Insert BAM price after the price wrapper
  priceWrapper.parentNode.insertBefore(bamPriceElement, priceWrapper.nextSibling);

  debugLog(`Converted ${rsdPrice} RSD to ${bamPrice} BAM`);
}

function addBamPrice() {
  // Find all price integer elements using a specific selector that validates the entire DOM structure
  // and excludes already-converted prices
  const priceIntegerElements = document.querySelectorAll(
    'span.notranslate:not([data-bam-converted="true"]) > span[class*="price__nowrap"] > span[class*="price__integer"]'
  );

  debugLog(`Found ${priceIntegerElements.length} price elements to convert`);

  if (priceIntegerElements.length === 0) {
    return;
  }

  priceIntegerElements.forEach((priceIntegerElement) => {
    // Get parent (price__nowrap wrapper) and grandparent (span.notranslate - final price wrapper)
    const parent = priceIntegerElement.parentElement;
    const priceWrapper = parent.parentElement;

    // Add BAM price to this element
    addBamPriceToElement(priceIntegerElement, priceWrapper);
  });
}

// Run the conversion when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addBamPrice);
} else {
  addBamPrice();
}

// Watch for dynamic content changes
const observer = new MutationObserver((mutations) => {
  addBamPrice();
});

// Start observing the document for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});
