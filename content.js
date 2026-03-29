// IKEA RSD to BAM Price Converter
// Conversion rate: 1 BAM ≈ 58.5 RSD (approximate rate, should be updated as needed)
const RSD_TO_BAM_RATE = 58.5;

function convertRsdToBam(rsdAmount) {
  return (rsdAmount / RSD_TO_BAM_RATE).toFixed(2);
}

function addBamPrice() {
  // Selector for the price wrapper
  const priceWrapperSelector = '#content > div > div.pipf-page.js-product-pip > div.pipf-page__right-container > div.pipf-page__right-container-content > div.pipf-price-package > div.pipf-price-package__price-module-wrapper > div > div.pipcom-price-module__price > div > div > span > span.notranslate';

  // Selector for price integer
  const priceIntegerSelector = '#content > div > div.pipf-page.js-product-pip > div.pipf-page__right-container > div.pipf-page__right-container-content > div.pipf-price-package > div.pipf-price-package__price-module-wrapper > div > div.pipcom-price-module__price > div > div > span > span.notranslate > span.pipcom-price__nowrap > span';

  // Selector for currency
  const currencySelector = '#content > div > div.pipf-page.js-product-pip > div.pipf-page__right-container > div.pipf-page__right-container-content > div.pipf-price-package > div.pipf-price-package__price-module-wrapper > div > div.pipcom-price-module__price > div > div > span > span.notranslate > span.pipcom-price__currency';

  const priceWrapper = document.querySelector(priceWrapperSelector);
  const priceIntegerElement = document.querySelector(priceIntegerSelector);
  const currencyElement = document.querySelector(currencySelector);

  if (!priceWrapper || !priceIntegerElement || !currencyElement) {
    console.log('IKEA RSD to BAM: Price elements not found');
    return;
  }

  // Check if currency is RSD
  const currency = currencyElement.textContent.trim();
  if (currency !== 'RSD') {
    console.log('IKEA RSD to BAM: Currency is not RSD');
    return;
  }

  // Get the RSD price
  const rsdPriceText = priceIntegerElement.textContent.trim();
  const rsdPrice = parseFloat(rsdPriceText.replace(/[^\d]/g, ''));

  if (isNaN(rsdPrice)) {
    console.log('IKEA RSD to BAM: Could not parse price');
    return;
  }

  // Calculate BAM price
  const bamPrice = convertRsdToBam(rsdPrice);

  // Check if BAM price already exists
  if (priceWrapper.querySelector('.bam-price-display')) {
    return;
  }

  // Create BAM price element
  const bamPriceElement = document.createElement('div');
  bamPriceElement.className = 'bam-price-display';
  bamPriceElement.style.cssText = `
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #0058a3;
    color: white;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    display: inline-block;
  `;
  bamPriceElement.textContent = `≈ ${bamPrice} BAM`;

  // Insert BAM price after the price wrapper
  priceWrapper.parentNode.insertBefore(bamPriceElement, priceWrapper.nextSibling);

  console.log(`IKEA RSD to BAM: Converted ${rsdPrice} RSD to ${bamPrice} BAM`);
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
