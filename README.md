# IKEA RSD to BAM Converter

A Chrome extension that displays prices in BAM (Bosnian Convertible Mark) on IKEA's Serbian website where prices are shown in RSD (Serbian Dinar).

## Features

- Automatically converts RSD prices to BAM on IKEA Serbia product pages
- Shows the converted price in a highlighted box below the original price
- Uses an approximate conversion rate of 1 BAM ≈ 58.5 RSD

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the folder containing this extension
6. Visit any product page on https://www.ikea.com/rs/sr/ to see the BAM price

## Example

The extension works on product pages like:
https://www.ikea.com/rs/sr/p/laektare-navlaka-za-stolicu-gunnared-svetlozelena-80527994/

## Files

- `manifest.json` - Chrome extension configuration
- `content.js` - Main script that handles price conversion
- `README.md` - This file

## Note on Exchange Rate

The conversion rate is hardcoded in the extension. You may want to update the `RSD_TO_BAM_RATE` constant in `content.js` to reflect the current exchange rate.

## License

MIT
