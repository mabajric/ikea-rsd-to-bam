# Installation Instructions

## How to Install the Chrome Extension

1. **Download the extension files**
   - Clone this repository or download it as a ZIP file
   - If downloaded as ZIP, extract it to a folder

2. **Open Chrome Extensions page**
   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar and press Enter
   - Or go to Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the extension**
   - Click the "Load unpacked" button
   - Navigate to and select the folder containing the extension files (where manifest.json is located)

5. **Test the extension**
   - Visit any IKEA Serbia product page, for example:
     https://www.ikea.com/rs/sr/p/laektare-navlaka-za-stolicu-gunnared-svetlozelena-80527994/
   - You should see the BAM price displayed below the RSD price

## Updating the Exchange Rate

The current exchange rate is set to 1 BAM ≈ 58.5 RSD. To update it:

1. Open `content.js` in a text editor
2. Find the line: `const RSD_TO_BAM_RATE = 58.5;`
3. Change `58.5` to the current exchange rate
4. Save the file
5. Go to `chrome://extensions/` and click the refresh icon for this extension
