# IKEA RSD to BAM Converter

A Chrome extension that displays prices in BAM (Bosnian Convertible Mark) on IKEA's Serbian website where prices are shown in RSD (Serbian Dinar).

## Features

- Automatically converts RSD prices to BAM on IKEA Serbia product pages
- Two display modes:
  - **Alongside mode**: Shows the converted price in a highlighted box next to the original price (default)
  - **Replace mode**: Completely replaces the RSD price with BAM price and changes currency to KM
- Configurable through extension options page
- Uses an approximate conversion rate of 1 BAM ≈ 58.5 RSD

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the folder containing this extension
6. Visit any product page on https://www.ikea.com/rs/sr/ to see the BAM price
7. Right-click the extension icon and select "Options" to configure the display mode

## Example

The extension works on product pages like:
https://www.ikea.com/rs/sr/p/laektare-navlaka-za-stolicu-gunnared-svetlozelena-80527994/

## Files

- `manifest.json` - Chrome extension configuration
- `content.js` - Main script that handles price conversion
- `options.html` - Options page UI
- `options.js` - Options page logic for saving/loading settings
- `README.md` - This file

## Note on Exchange Rate

The conversion rate is hardcoded in the extension. You may want to update the `RSD_TO_BAM_RATE` constant in `content.js` to reflect the current exchange rate.

## License

MIT
